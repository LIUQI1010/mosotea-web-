export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { DashboardClient } from './DashboardClient'

// NZ timezone
const NZ_TZ = 'Pacific/Auckland'

function toNZDate(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: NZ_TZ }) // YYYY-MM-DD
}

// Date string arithmetic helpers to avoid nzNow double-conversion
function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

function getWeekBounds(todayStr: string): { weekStartStr: string; weekEndStr: string } {
  const [y, m, d] = todayStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  const dow = date.getUTCDay() // 0=Sun
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  return {
    weekStartStr: addDays(todayStr, mondayOffset),
    weekEndStr: addDays(todayStr, mondayOffset + 6),
  }
}

function getMonthBounds(todayStr: string): { monthStartStr: string; monthEndStr: string } {
  const [y, m] = todayStr.split('-').map(Number)
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return {
    monthStartStr: `${y}-${String(m).padStart(2, '0')}-01`,
    monthEndStr: `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  }
}

// Convert NZ date string to UTC range covering the full NZ day
// NZ is UTC+12 (NZST) or UTC+13 (NZDT) — use both offsets for safe bounds
function nzDayToUTCRange(dateStr: string): { start: string; end: string } {
  return {
    start: new Date(`${dateStr}T00:00:00+13:00`).toISOString(),
    end: new Date(`${dateStr}T23:59:59+12:00`).toISOString(),
  }
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()
  const todayStr = toNZDate(new Date())

  // Calculate boundaries using date string arithmetic
  const { weekStartStr, weekEndStr } = getWeekBounds(todayStr)
  const { monthStartStr, monthEndStr } = getMonthBounds(todayStr)
  const future3Str = addDays(todayStr, 3)

  // Convert NZ date ranges to UTC for correct timestamptz queries
  const todayUTC = nzDayToUTCRange(todayStr)
  const weekStartUTC = nzDayToUTCRange(weekStartStr)
  const weekEndUTC = nzDayToUTCRange(weekEndStr)
  const monthStartUTC = nzDayToUTCRange(monthStartStr)
  const monthEndUTC = nzDayToUTCRange(monthEndStr)
  const future3UTC = nzDayToUTCRange(future3Str)

  // Run all queries in parallel
  const [
    todayResult,
    weekResult,
    monthResult,
    pendingResult,
    slotsResult,
    bookingsResult,
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('guest_count, time_slots!inner(start_time)')
      .neq('status', 'cancelled')
      .gte('time_slots.start_time', todayUTC.start)
      .lte('time_slots.start_time', todayUTC.end),

    supabase
      .from('bookings')
      .select('guest_count, time_slots!inner(start_time)')
      .neq('status', 'cancelled')
      .gte('time_slots.start_time', weekStartUTC.start)
      .lte('time_slots.start_time', weekEndUTC.end),

    supabase
      .from('bookings')
      .select('guest_count, time_slots!inner(start_time)')
      .neq('status', 'cancelled')
      .gte('time_slots.start_time', monthStartUTC.start)
      .lte('time_slots.start_time', monthEndUTC.end),

    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),

    supabase
      .from('time_slots')
      .select('id, start_time, end_time, max_guests, booked_guests, is_available')
      .gte('start_time', todayUTC.start)
      .lte('start_time', future3UTC.end)
      .order('start_time', { ascending: true }),

    supabase
      .from('bookings')
      .select('id, customer_name, guest_count, preferred_language, status, created_at, time_slots(start_time)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const todayGuests = (todayResult.data ?? []).reduce(
    (sum: number, b: { guest_count: number }) => sum + b.guest_count, 0
  )
  const weekGuests = (weekResult.data ?? []).reduce(
    (sum: number, b: { guest_count: number }) => sum + b.guest_count, 0
  )
  const monthRevenue =
    (monthResult.data ?? []).reduce(
      (sum: number, b: { guest_count: number }) => sum + b.guest_count, 0
    ) * 75
  const pendingCount = pendingResult.count ?? 0
  const slots = slotsResult.data ?? []
  const bookings = bookingsResult.data ?? []

  return (
    <DashboardClient
      stats={{ todayGuests, weekGuests, monthRevenue, pendingCount }}
      slots={slots}
      bookings={bookings as unknown as {
        id: string
        customer_name: string
        guest_count: number
        preferred_language: string
        status: string
        time_slots: { start_time: string } | { start_time: string }[]
      }[]}
      todayStr={todayStr}
    />
  )
}
