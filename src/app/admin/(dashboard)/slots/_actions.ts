'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

const NZ_TZ = 'Pacific/Auckland'

function toNZDateStr(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: NZ_TZ })
}

// Get the correct UTC offset for a given NZ date using Intl API
// Handles DST: NZDT (+13:00) Oct–Apr, NZST (+12:00) Apr–Sep
function getNZOffset(dateStr: string): string {
  const utc = new Date(dateStr + 'T12:00:00Z')
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: NZ_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(utc)
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value
  const nzLocal = new Date(
    `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}Z`
  )
  const offsetMinutes = (nzLocal.getTime() - utc.getTime()) / 60000
  const offsetHours = Math.floor(offsetMinutes / 60)
  const offsetMins = Math.abs(offsetMinutes % 60)
  const sign = offsetHours >= 0 ? '+' : '-'
  return `${sign}${String(Math.abs(offsetHours)).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`
}

function toNZTime(dateStr: string, timeStr: string): Date {
  const offset = getNZOffset(dateStr)
  return new Date(`${dateStr}T${timeStr}:00${offset}`)
}

export async function generateSlots(): Promise<{ created: number; error?: string }> {
  const supabase = createAdminClient()

  // Find the latest existing slot date
  const { data: latestSlot } = await supabase
    .from('time_slots')
    .select('start_time')
    .order('start_time', { ascending: false })
    .limit(1)
    .single()

  // Use date string arithmetic to avoid timezone double-conversion
  // (the nzNow hack via toLocaleString produces a fake Date whose internal UTC
  //  timestamp depends on the server's timezone, causing off-by-one on Vercel)
  const todayStr = toNZDateStr(new Date())
  const [ty, tm, td] = todayStr.split('-').map(Number)
  const targetEndStr = new Date(Date.UTC(ty, tm - 1, td + 30)).toISOString().slice(0, 10)

  // Always start from today — existingDates handles deduplication
  const startDateStr = todayStr

  // Fetch existing slot dates to avoid duplicates
  const { data: existingSlots } = await supabase
    .from('time_slots')
    .select('start_time')
    .gte('start_time', `${startDateStr}T00:00:00`)
    .lte('start_time', `${targetEndStr}T23:59:59`)

  const existingDates = new Set(
    (existingSlots ?? []).map((s: { start_time: string }) =>
      toNZDateStr(new Date(s.start_time))
    )
  )

  // Generate slots for each day using string comparison
  const slotsToInsert: {
    start_time: string
    end_time: string
    max_guests: number
    booked_guests: number
    is_available: boolean
  }[] = []

  let currentDateStr = startDateStr
  while (currentDateStr <= targetEndStr) {
    if (!existingDates.has(currentDateStr)) {
      // Morning: 10:00 – 11:30 NZ time (DST-aware)
      slotsToInsert.push({
        start_time: toNZTime(currentDateStr, '10:00').toISOString(),
        end_time: toNZTime(currentDateStr, '11:30').toISOString(),
        max_guests: 8,
        booked_guests: 0,
        is_available: true,
      })
      // Afternoon: 14:00 – 15:30 NZ time (DST-aware)
      slotsToInsert.push({
        start_time: toNZTime(currentDateStr, '14:00').toISOString(),
        end_time: toNZTime(currentDateStr, '15:30').toISOString(),
        max_guests: 8,
        booked_guests: 0,
        is_available: true,
      })
    }
    // Advance to next day
    const [cy, cm, cd] = currentDateStr.split('-').map(Number)
    currentDateStr = new Date(Date.UTC(cy, cm - 1, cd + 1)).toISOString().slice(0, 10)
  }

  if (slotsToInsert.length === 0) {
    revalidatePath('/admin/slots')
    return { created: 0 }
  }

  const { error } = await supabase.from('time_slots').insert(slotsToInsert)

  if (error) {
    return { created: 0, error: error.message }
  }

  revalidatePath('/admin/slots')
  revalidatePath('/admin')
  return { created: slotsToInsert.length }
}

export async function disableDateRange(
  fromDate: string,
  toDate: string,
  sessions: ('morning' | 'afternoon')[]
): Promise<{ disabled: number; skipped: number; error?: string }> {
  const supabase = createAdminClient()

  const startUTC = new Date(`${fromDate}T00:00:00+13:00`).toISOString()
  const endUTC = new Date(`${toDate}T23:59:59+12:00`).toISOString()

  const { data: slots, error: fetchError } = await supabase
    .from('time_slots')
    .select('id, start_time')
    .gte('start_time', startUTC)
    .lte('start_time', endUTC)
    .eq('is_available', true)

  if (fetchError) return { disabled: 0, skipped: 0, error: fetchError.message }
  if (!slots || slots.length === 0) return { disabled: 0, skipped: 0 }

  const filtered = slots.filter((s: { id: string; start_time: string }) => {
    const hour = Number(
      new Intl.DateTimeFormat('en-GB', { timeZone: NZ_TZ, hour: '2-digit', hour12: false })
        .format(new Date(s.start_time))
    )
    const isMorning = hour < 12
    return (isMorning && sessions.includes('morning')) || (!isMorning && sessions.includes('afternoon'))
  })

  const filteredIds = filtered.map((s: { id: string }) => s.id)

  // Batch: find all slots that have active bookings in one query
  const { data: bookedSlots } = await supabase
    .from('bookings')
    .select('time_slot_id')
    .in('time_slot_id', filteredIds)
    .neq('status', 'cancelled')

  const bookedSlotIds = new Set(
    (bookedSlots ?? []).map((b: { time_slot_id: string }) => b.time_slot_id)
  )

  const toDisable = filteredIds.filter((id: string) => !bookedSlotIds.has(id))
  const skipped = filteredIds.length - toDisable.length

  if (toDisable.length === 0) return { disabled: 0, skipped }

  const { error: updateError } = await supabase
    .from('time_slots')
    .update({ is_available: false })
    .in('id', toDisable)

  if (updateError) return { disabled: 0, skipped, error: updateError.message }

  revalidatePath('/admin/slots')
  revalidatePath('/admin')
  return { disabled: toDisable.length, skipped }
}

export async function enableDateRange(
  fromDate: string,
  toDate: string,
  sessions: ('morning' | 'afternoon')[]
): Promise<{ enabled: number; created: number; error?: string }> {
  const supabase = createAdminClient()

  const startUTC = new Date(`${fromDate}T00:00:00+13:00`).toISOString()
  const endUTC = new Date(`${toDate}T23:59:59+12:00`).toISOString()

  // Fetch ALL existing slots in the range (both available and disabled)
  const { data: allSlots, error: fetchError } = await supabase
    .from('time_slots')
    .select('id, start_time, is_available')
    .gte('start_time', startUTC)
    .lte('start_time', endUTC)

  if (fetchError) return { enabled: 0, created: 0, error: fetchError.message }

  // Build a map of existing slots: dateStr -> { morning?: Slot, afternoon?: Slot }
  const existingMap = new Map<string, { morning?: { id: string; is_available: boolean }; afternoon?: { id: string; is_available: boolean } }>()
  for (const s of allSlots ?? []) {
    const dateStr = toNZDateStr(new Date(s.start_time))
    const hour = Number(
      new Intl.DateTimeFormat('en-GB', { timeZone: NZ_TZ, hour: '2-digit', hour12: false })
        .format(new Date(s.start_time))
    )
    const entry = existingMap.get(dateStr) ?? {}
    if (hour < 12) entry.morning = { id: s.id, is_available: s.is_available }
    else entry.afternoon = { id: s.id, is_available: s.is_available }
    existingMap.set(dateStr, entry)
  }

  // Walk each date in range, collect IDs to re-enable and slots to create
  const toEnable: string[] = []
  const toInsert: { start_time: string; end_time: string; max_guests: number; booked_guests: number; is_available: boolean }[] = []

  let currentDateStr = fromDate
  while (currentDateStr <= toDate) {
    const entry = existingMap.get(currentDateStr)

    for (const session of sessions) {
      const slot = session === 'morning' ? entry?.morning : entry?.afternoon
      if (slot) {
        // Slot exists but disabled → re-enable
        if (!slot.is_available) toEnable.push(slot.id)
      } else {
        // Slot doesn't exist → create it
        const [startH, endH] = session === 'morning' ? ['10:00', '11:30'] : ['14:00', '15:30']
        toInsert.push({
          start_time: toNZTime(currentDateStr, startH).toISOString(),
          end_time: toNZTime(currentDateStr, endH).toISOString(),
          max_guests: 8,
          booked_guests: 0,
          is_available: true,
        })
      }
    }

    const [cy, cm, cd] = currentDateStr.split('-').map(Number)
    currentDateStr = new Date(Date.UTC(cy, cm - 1, cd + 1)).toISOString().slice(0, 10)
  }

  // Execute updates
  if (toEnable.length > 0) {
    const { error } = await supabase.from('time_slots').update({ is_available: true }).in('id', toEnable)
    if (error) return { enabled: 0, created: 0, error: error.message }
  }
  if (toInsert.length > 0) {
    const { error } = await supabase.from('time_slots').insert(toInsert)
    if (error) return { enabled: toEnable.length, created: 0, error: error.message }
  }

  revalidatePath('/admin/slots')
  revalidatePath('/admin')
  return { enabled: toEnable.length, created: toInsert.length }
}

export async function toggleSlot(
  slotId: string,
  newAvailability: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  // When disabling, check for active bookings
  if (!newAvailability) {
    const { count } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('time_slot_id', slotId)
      .neq('status', 'cancelled')

    if (count && count > 0) {
      return { success: false, error: '該場次有有效預約，請先取消預約後再停用' }
    }
  }

  const { error } = await supabase
    .from('time_slots')
    .update({ is_available: newAvailability })
    .eq('id', slotId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/slots')
  revalidatePath('/admin')
  return { success: true }
}
