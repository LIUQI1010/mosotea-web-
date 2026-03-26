export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'


// NZ timezone
const NZ_TZ = 'Pacific/Auckland'

function toNZDate(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: NZ_TZ }) // YYYY-MM-DD
}

function formatNZDate(dateStr: string): string {
  const date = new Date(dateStr)
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const nzParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: NZ_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date)

  const year = nzParts.find((p) => p.type === 'year')?.value
  const month = nzParts.find((p) => p.type === 'month')?.value
  const day = nzParts.find((p) => p.type === 'day')?.value
  const weekdayIdx = new Date(
    `${year}-${month}-${day}T12:00:00`
  ).getDay()

  return `${year}年${Number(month)}月${Number(day)}日 ${weekdays[weekdayIdx]}`
}

function formatSlotTime(startTime: string): string {
  const date = new Date(startTime)
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: NZ_TZ,
      hour: '2-digit',
      hour12: false,
    }).format(date)
  )
  return hour < 12 ? '10:00 – 11:30' : '14:00 – 15:30'
}

function formatSlotDate(startTime: string): string {
  const date = new Date(startTime)
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: NZ_TZ,
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date)
}

function formatBookingDate(startTime: string): string {
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: NZ_TZ,
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(startTime))
}

function formatBookingTime(startTime: string): string {
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: NZ_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(startTime))
}

type SlotStatus = 'full' | 'available' | 'empty' | 'disabled'

function getSlotStatus(slot: {
  is_available: boolean
  booked_guests: number
  max_guests: number
}): SlotStatus {
  if (!slot.is_available) return 'disabled'
  if (slot.booked_guests >= slot.max_guests) return 'full'
  if (slot.booked_guests > 0) return 'available'
  return 'empty'
}

const statusConfig: Record<SlotStatus, { label: string; className: string }> = {
  full:      { label: '已滿',   className: 'bg-red-50 text-red-600 border border-red-100' },
  available: { label: '有空位', className: 'bg-bamboo-green/10 text-bamboo-green border border-bamboo-green/20' },
  empty:     { label: '空閒',   className: 'bg-cream text-muted-foreground border border-border' },
  disabled:  { label: '已停用', className: 'bg-red-50 text-red-400 border border-red-100' },
}

const bookingStatusConfig: Record<string, { label: string; className: string }> = {
  pending:   { label: '待確認', className: 'bg-tea-brown/10 text-tea-brown border border-tea-brown/20' },
  confirmed: { label: '已確認', className: 'bg-bamboo-green/10 text-bamboo-green border border-bamboo-green/20' },
  cancelled: { label: '已取消', className: 'bg-cream text-muted-foreground border border-border' },
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

  const stats = [
    { label: '今日到訪', value: `${todayGuests} 人` },
    { label: '本週預約', value: `${weekGuests} 人` },
    { label: '本月收入', value: `$${monthRevenue.toLocaleString()}` },
    { label: '待確認',   value: `${pendingCount} 筆`, urgent: pendingCount > 0, href: pendingCount > 0 ? '/admin/bookings?status=pending' : undefined },
  ]

  return (
    <div>
      {/* Topbar */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">儀表板</p>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl lg:text-4xl">{formatNZDate(todayStr)}</h1>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const content = (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className={`mt-2 text-2xl font-semibold sm:text-3xl ${stat.urgent ? 'text-tea-brown' : 'text-foreground'}`}>
                {stat.value}
              </p>
            </>
          )
          const className = `rounded-2xl border p-5 ${
            stat.urgent
              ? 'border-tea-brown/30 bg-tea-brown/5'
              : 'border-border bg-off-white'
          }`

          if (stat.href) {
            return (
              <Link key={stat.label} href={stat.href} className={`${className} transition-colors hover:border-tea-brown/40 hover:bg-tea-brown/10`}>
                {content}
              </Link>
            )
          }
          return <div key={stat.label} className={className}>{content}</div>
        })}
      </div>

      {/* Two-column Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Left: Upcoming Slots */}
        <div className="rounded-2xl border border-border bg-off-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-base font-semibold text-foreground">近期場次</h2>
            <Link href="/admin/slots" className="text-xs text-tea-brown hover:underline">
              查看全部 →
            </Link>
          </div>

          {slots.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">暫無近期場次</p>
          ) : (
            <div className="space-y-2">
              {slots.map((slot: {
                id: string
                start_time: string
                max_guests: number
                booked_guests: number
                is_available: boolean
              }) => {
                const status = getSlotStatus(slot)
                const config = statusConfig[status]
                return (
                  <Link
                    key={slot.id}
                    href={`/admin/slots?slot_id=${slot.id}`}
                    className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl border border-border bg-cream px-3 py-2.5 transition-colors hover:border-tea-brown/30 hover:bg-tea-brown/5 sm:grid-cols-[1fr_56px_72px] sm:px-4 sm:py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {formatSlotDate(slot.start_time)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatSlotTime(slot.start_time)}
                      </p>
                    </div>
                    <span className="hidden text-center text-sm text-muted-foreground sm:block">
                      {slot.booked_guests}/{slot.max_guests}
                    </span>
                    <div className="flex justify-end">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
                        {config.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: Latest Bookings */}
        <div className="rounded-2xl border border-border bg-off-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-base font-semibold text-foreground">最新預約</h2>
            <Link href="/admin/bookings" className="text-xs text-tea-brown hover:underline">
              查看全部 →
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">暫無預約記錄</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((booking: {
                id: string
                customer_name: string
                guest_count: number
                preferred_language: string
                status: string
                time_slots: { start_time: string } | { start_time: string }[]
              }) => {
                const slotData = Array.isArray(booking.time_slots)
                  ? booking.time_slots[0]
                  : booking.time_slots
                const statusCfg = bookingStatusConfig[booking.status] ?? bookingStatusConfig.cancelled
                const nzDate = slotData
                  ? new Date(slotData.start_time).toLocaleDateString('en-CA', { timeZone: NZ_TZ })
                  : null
                return (
                  <Link
                    key={booking.id}
                    href={nzDate ? `/admin/bookings?date=${nzDate}` : '/admin/bookings'}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border bg-cream px-3 py-2.5 transition-colors hover:border-tea-brown/30 hover:bg-tea-brown/5 sm:px-4 sm:py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {booking.customer_name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {slotData ? `${formatBookingDate(slotData.start_time)} ${formatBookingTime(slotData.start_time)}` : '—'} · {booking.guest_count}人
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.className}`}>
                      {statusCfg.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
