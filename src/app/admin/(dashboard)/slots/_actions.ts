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

  const now = new Date()
  const nzNow = new Date(now.toLocaleString('en-US', { timeZone: NZ_TZ }))

  // Target: today + 30 days (including today)
  const targetEnd = new Date(nzNow)
  targetEnd.setDate(nzNow.getDate() + 30)

  // Start from today, or day after latest slot — whichever is later
  const today = new Date(nzNow)
  today.setHours(0, 0, 0, 0)

  let startDate = today
  if (latestSlot) {
    const latestDateStr = toNZDateStr(new Date(latestSlot.start_time))
    const latestPlusOne = new Date(`${latestDateStr}T12:00:00`)
    latestPlusOne.setDate(latestPlusOne.getDate() + 1)
    latestPlusOne.setHours(0, 0, 0, 0)
    if (latestPlusOne > startDate) {
      startDate = latestPlusOne
    }
  }

  // Fetch existing slot dates to avoid duplicates
  const startStr = toNZDateStr(startDate)
  const endStr = toNZDateStr(targetEnd)

  const { data: existingSlots } = await supabase
    .from('time_slots')
    .select('start_time')
    .gte('start_time', `${startStr}T00:00:00`)
    .lte('start_time', `${endStr}T23:59:59`)

  const existingDates = new Set(
    (existingSlots ?? []).map((s: { start_time: string }) =>
      toNZDateStr(new Date(s.start_time))
    )
  )

  // Generate slots for each day
  const slotsToInsert: {
    start_time: string
    end_time: string
    max_guests: number
    booked_guests: number
    is_available: boolean
  }[] = []

  const current = new Date(startDate)
  while (current <= targetEnd) {
    const dateStr = toNZDateStr(current)
    if (!existingDates.has(dateStr)) {
      // Morning: 10:00 – 11:30 NZ time (DST-aware)
      slotsToInsert.push({
        start_time: toNZTime(dateStr, '10:00').toISOString(),
        end_time: toNZTime(dateStr, '11:30').toISOString(),
        max_guests: 8,
        booked_guests: 0,
        is_available: true,
      })
      // Afternoon: 14:00 – 15:30 NZ time (DST-aware)
      slotsToInsert.push({
        start_time: toNZTime(dateStr, '14:00').toISOString(),
        end_time: toNZTime(dateStr, '15:30').toISOString(),
        max_guests: 8,
        booked_guests: 0,
        is_available: true,
      })
    }
    current.setDate(current.getDate() + 1)
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
      return { success: false, error: '该场次有有效预约，请先取消预约后再禁用' }
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
