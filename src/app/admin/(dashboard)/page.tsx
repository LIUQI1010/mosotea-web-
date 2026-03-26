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

const langLabel: Record<string, string> = {
  en: 'EN',
  'zh-TW': '中',
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()
  const now = new Date()
  const todayStr = toNZDate(now)

  // Calculate week boundaries (Monday–Sunday) in NZ time
  const nzNow = new Date(
    now.toLocaleString('en-US', { timeZone: NZ_TZ })
  )
  const dayOfWeek = nzNow.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(nzNow)
  monday.setDate(nzNow.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const weekStartStr = toNZDate(monday)
  const weekEndStr = toNZDate(sunday)

  // Calculate month boundaries in NZ time
  const monthStart = new Date(nzNow.getFullYear(), nzNow.getMonth(), 1)
  const monthEnd = new Date(nzNow.getFullYear(), nzNow.getMonth() + 1, 0)
  monthEnd.setHours(23, 59, 59, 999)
  const monthStartStr = toNZDate(monthStart)
  const monthEndStr = toNZDate(monthEnd)

  // Future 3 days boundary
  const future3 = new Date(nzNow)
  future3.setDate(nzNow.getDate() + 3)
  future3.setHours(23, 59, 59, 999)
  const future3Str = toNZDate(future3)

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
      .gte('time_slots.start_time', `${todayStr}T00:00:00`)
      .lt('time_slots.start_time', `${todayStr}T23:59:59`),

    supabase
      .from('bookings')
      .select('guest_count, time_slots!inner(start_time)')
      .neq('status', 'cancelled')
      .gte('time_slots.start_time', `${weekStartStr}T00:00:00`)
      .lte('time_slots.start_time', `${weekEndStr}T23:59:59`),

    supabase
      .from('bookings')
      .select('guest_count, time_slots!inner(start_time)')
      .neq('status', 'cancelled')
      .gte('time_slots.start_time', `${monthStartStr}T00:00:00`)
      .lte('time_slots.start_time', `${monthEndStr}T23:59:59`),

    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),

    supabase
      .from('time_slots')
      .select('id, start_time, end_time, max_guests, booked_guests, is_available')
      .gte('start_time', `${todayStr}T00:00:00`)
      .lte('start_time', `${future3Str}T23:59:59`)
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
    { label: '今日預約', value: `${todayGuests} 人`, sub: '今天到訪' },
    { label: '本週預約', value: `${weekGuests} 人`, sub: '本週合計' },
    { label: '本月收入', value: `$${monthRevenue.toLocaleString()}`, sub: 'NZD' },
    { label: '待確認',   value: `${pendingCount}`,  sub: '筆預約', urgent: pendingCount > 0 },
  ]

  return (
    <div>
      {/* Topbar */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">儀表板</p>
          <h1 className="font-serif text-4xl font-semibold text-foreground">{formatNZDate(todayStr)}</h1>
        </div>
        {pendingCount > 0 && (
          <Link
            href="/admin/bookings"
            className="flex items-center gap-2 rounded-lg bg-tea-brown px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 text-sm leading-none">
              {pendingCount}
            </span>
            待確認預約
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border p-5 ${
              stat.urgent
                ? 'border-tea-brown/30 bg-tea-brown/5'
                : 'border-border bg-off-white'
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p className={`mt-2 text-3xl font-semibold ${stat.urgent ? 'text-tea-brown' : 'text-foreground'}`}>
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column Section */}
      <div className="grid grid-cols-2 gap-6">

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
                    className="grid grid-cols-[1fr_56px_72px] items-center gap-2 rounded-xl border border-border bg-cream px-4 py-3 transition-colors hover:border-tea-brown/30 hover:bg-tea-brown/5"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {formatSlotDate(slot.start_time)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatSlotTime(slot.start_time)}
                      </p>
                    </div>
                    <span className="text-center text-sm text-muted-foreground">
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
                    className="grid grid-cols-[1fr_40px_44px_24px_80px] items-center gap-2 rounded-xl border border-border bg-cream px-4 py-3 transition-colors hover:border-tea-brown/30 hover:bg-tea-brown/5"
                  >
                    <p className="truncate text-sm font-medium text-foreground">
                      {booking.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {slotData ? formatBookingDate(slotData.start_time) : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {slotData ? formatBookingTime(slotData.start_time) : '—'}
                    </p>
                    <p className="text-center text-xs text-muted-foreground">
                      {booking.guest_count}人
                    </p>
                    <div className="flex justify-end">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                    </div>
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
