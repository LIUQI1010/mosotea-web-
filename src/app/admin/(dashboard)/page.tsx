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
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: NZ_TZ,
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date)
}

function formatBookingDateTime(startTime: string): string {
  const date = new Date(startTime)
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: NZ_TZ,
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
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

const statusConfig: Record<
  SlotStatus,
  { label: string; className: string }
> = {
  full: {
    label: '已满',
    className: 'bg-red-50 text-red-700 border border-red-200',
  },
  available: {
    label: '有空余',
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
  empty: {
    label: '空闲',
    className: 'bg-stone-50 text-stone-500 border border-stone-200',
  },
  disabled: {
    label: '已禁用',
    className: 'bg-white text-stone-400 border border-stone-300',
  },
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
    // 1. Today's guest count
    supabase
      .from('bookings')
      .select('guest_count, time_slots!inner(start_time)')
      .neq('status', 'cancelled')
      .gte('time_slots.start_time', `${todayStr}T00:00:00`)
      .lt('time_slots.start_time', `${todayStr}T23:59:59`),

    // 2. This week's guest count
    supabase
      .from('bookings')
      .select('guest_count, time_slots!inner(start_time)')
      .neq('status', 'cancelled')
      .gte('time_slots.start_time', `${weekStartStr}T00:00:00`)
      .lte('time_slots.start_time', `${weekEndStr}T23:59:59`),

    // 3. This month's guest count (for revenue)
    supabase
      .from('bookings')
      .select('guest_count, time_slots!inner(start_time)')
      .neq('status', 'cancelled')
      .gte('time_slots.start_time', `${monthStartStr}T00:00:00`)
      .lte('time_slots.start_time', `${monthEndStr}T23:59:59`),

    // 4. Pending count
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),

    // 5. Future 3 days time slots
    supabase
      .from('time_slots')
      .select('id, start_time, end_time, max_guests, booked_guests, is_available')
      .gte('start_time', `${todayStr}T00:00:00`)
      .lte('start_time', `${future3Str}T23:59:59`)
      .order('start_time', { ascending: true }),

    // 6. Latest 5 bookings
    supabase
      .from('bookings')
      .select(
        'id, customer_name, guest_count, preferred_language, status, created_at, time_slots(start_time)'
      )
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const todayGuests = (todayResult.data ?? []).reduce(
    (sum: number, b: { guest_count: number }) => sum + b.guest_count,
    0
  )
  const weekGuests = (weekResult.data ?? []).reduce(
    (sum: number, b: { guest_count: number }) => sum + b.guest_count,
    0
  )
  const monthRevenue =
    (monthResult.data ?? []).reduce(
      (sum: number, b: { guest_count: number }) => sum + b.guest_count,
      0
    ) * 75
  const pendingCount = pendingResult.count ?? 0
  const slots = slotsResult.data ?? []
  const bookings = bookingsResult.data ?? []

  const stats = [
    { label: '今日预约', value: `${todayGuests} 人` },
    { label: '本周预约', value: `${weekGuests} 人` },
    {
      label: '本月收入',
      value: `NZD $${monthRevenue.toLocaleString()}`,
    },
    {
      label: '待确认',
      value: `${pendingCount}`,
      highlight: pendingCount > 0,
    },
  ]

  return (
    <div>
      {/* Topbar */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#3D3D3D]">仪表盘</h1>
        <span className="text-sm text-[#6B6B6B]">
          {formatNZDate(todayStr)}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[#E8E0D8] bg-white p-5"
          >
            <p className="text-sm text-[#6B6B6B]">{stat.label}</p>
            <p
              className={`mt-1 text-2xl font-medium ${
                'highlight' in stat && stat.highlight
                  ? 'text-red-600'
                  : 'text-[#3D3D3D]'
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Two-column Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Upcoming Slots */}
        <div className="rounded-2xl border border-[#E8E0D8] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-[#3D3D3D]">近期场次</h2>
            <Link
              href="/admin/slots"
              className="text-sm text-[#7C5C3E] hover:underline"
            >
              查看全部 →
            </Link>
          </div>

          {slots.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#6B6B6B]">
              暂无近期场次
            </p>
          ) : (
            <div className="space-y-3">
              {slots.map(
                (slot: {
                  id: string
                  start_time: string
                  max_guests: number
                  booked_guests: number
                  is_available: boolean
                }) => {
                  const status = getSlotStatus(slot)
                  const config = statusConfig[status]
                  return (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-xl border border-[#E8E0D8] px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#3D3D3D]">
                          {formatSlotDate(slot.start_time)}
                        </p>
                        <p className="text-xs text-[#6B6B6B]">
                          {formatSlotTime(slot.start_time)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[#6B6B6B]">
                          {slot.booked_guests}/{slot.max_guests}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
                        >
                          {config.label}
                        </span>
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          )}
        </div>

        {/* Right: Latest Bookings */}
        <div className="rounded-2xl border border-[#E8E0D8] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-[#3D3D3D]">最新预约</h2>
            <Link
              href="/admin/bookings"
              className="text-sm text-[#7C5C3E] hover:underline"
            >
              查看全部 →
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#6B6B6B]">
              暂无预约记录
            </p>
          ) : (
            <div className="space-y-3">
              {bookings.map(
                (booking: {
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
                  const statusColors: Record<string, string> = {
                    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
                    confirmed:
                      'bg-green-50 text-green-700 border border-green-200',
                    cancelled: 'bg-stone-50 text-stone-400 border border-stone-200',
                  }
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-xl border border-[#E8E0D8] px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#3D3D3D]">
                          {booking.customer_name}
                        </p>
                        <p className="text-xs text-[#6B6B6B]">
                          {slotData
                            ? formatBookingDateTime(slotData.start_time)
                            : '—'}{' '}
                          · {booking.guest_count}人 ·{' '}
                          {langLabel[booking.preferred_language] ??
                            booking.preferred_language}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[booking.status] ?? ''
                        }`}
                      >
                        {booking.status === 'pending'
                          ? '待确认'
                          : booking.status === 'confirmed'
                            ? '已确认'
                            : '已取消'}
                      </span>
                    </div>
                  )
                }
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
