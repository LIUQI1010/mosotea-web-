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

  // Start from today, or day after latest slot — whichever is later
  let startDateStr = todayStr
  if (latestSlot) {
    const latestDateStr = toNZDateStr(new Date(latestSlot.start_time))
    const [ly, lm, ld] = latestDateStr.split('-').map(Number)
    const nextDayStr = new Date(Date.UTC(ly, lm - 1, ld + 1)).toISOString().slice(0, 10)
    if (nextDayStr > startDateStr) {
      startDateStr = nextDayStr
    }
  }

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
