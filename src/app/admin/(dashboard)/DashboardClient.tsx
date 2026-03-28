'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

const NZ_TZ = 'Pacific/Auckland'

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

interface DashboardSlot {
  id: string
  start_time: string
  max_guests: number
  booked_guests: number
  is_available: boolean
}

interface DashboardBooking {
  id: string
  customer_name: string
  guest_count: number
  preferred_language: string
  status: string
  time_slots: { start_time: string } | { start_time: string }[]
}

interface DashboardStats {
  todayGuests: number
  weekGuests: number
  monthRevenue: number
  pendingCount: number
}

interface DashboardClientProps {
  stats: DashboardStats
  slots: DashboardSlot[]
  bookings: DashboardBooking[]
  todayStr: string
}

export function DashboardClient({ stats, slots, bookings, todayStr }: DashboardClientProps) {
  const t = useTranslations('admin.dashboard')
  const locale = useLocale()

  const formatNZDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const nzParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: NZ_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date)

    const year = nzParts.find((p) => p.type === 'year')?.value
    const month = nzParts.find((p) => p.type === 'month')?.value
    const day = nzParts.find((p) => p.type === 'day')?.value
    const weekdayIdx = new Date(`${year}-${month}-${day}T12:00:00`).getDay()

    if (locale === 'zh-TW') {
      return `${year}年${Number(month)}月${Number(day)}日 ${t(`weekdays.${weekdayIdx}` as 'weekdays.0')}`
    }
    return new Intl.DateTimeFormat('en-NZ', {
      timeZone: NZ_TZ,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  const formatSlotDate = (startTime: string): string => {
    const date = new Date(startTime)
    const dtfLocale = locale === 'zh-TW' ? 'zh-TW' : 'en-NZ'
    return new Intl.DateTimeFormat(dtfLocale, {
      timeZone: NZ_TZ,
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }).format(date)
  }

  const formatBookingDate = (startTime: string): string => {
    const dtfLocale = locale === 'zh-TW' ? 'zh-TW' : 'en-NZ'
    return new Intl.DateTimeFormat(dtfLocale, {
      timeZone: NZ_TZ,
      month: 'numeric',
      day: 'numeric',
    }).format(new Date(startTime))
  }

  const formatBookingTime = (startTime: string): string => {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: NZ_TZ,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(startTime))
  }

  const statusConfig: Record<SlotStatus, { label: string; className: string }> = {
    full:      { label: t('full'),      className: 'bg-red-50 text-red-600 border border-red-100' },
    available: { label: t('available'), className: 'bg-bamboo-green/10 text-bamboo-green border border-bamboo-green/20' },
    empty:     { label: t('empty'),     className: 'bg-cream text-muted-foreground border border-border' },
    disabled:  { label: t('disabled'),  className: 'bg-red-50 text-red-400 border border-red-100' },
  }

  const bookingStatusConfig: Record<string, { label: string; className: string }> = {
    pending:   { label: t('statusPending'),   className: 'bg-tea-brown/10 text-tea-brown border border-tea-brown/20' },
    confirmed: { label: t('statusConfirmed'), className: 'bg-bamboo-green/10 text-bamboo-green border border-bamboo-green/20' },
    cancelled: { label: t('statusCancelled'), className: 'bg-cream text-muted-foreground border border-border' },
  }

  const statsDisplay = [
    { label: t('todayVisitors'), value: t('guestUnit', { count: stats.todayGuests }) },
    { label: t('weeklyBookings'), value: t('guestUnit', { count: stats.weekGuests }) },
    { label: t('monthlyRevenue'), value: `$${stats.monthRevenue.toLocaleString()}` },
    { label: t('pending'), value: t('bookingUnit', { count: stats.pendingCount }), urgent: stats.pendingCount > 0, href: stats.pendingCount > 0 ? '/admin/bookings?status=pending' : undefined },
  ]

  return (
    <div>
      {/* Topbar */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">{t('title')}</p>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl lg:text-4xl" suppressHydrationWarning>{formatNZDate(todayStr)}</h1>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statsDisplay.map((stat) => {
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
            <h2 className="font-serif text-base font-semibold text-foreground">{t('upcomingSlots')}</h2>
            <Link href="/admin/slots" className="text-xs text-tea-brown hover:underline">
              {t('viewAll')}
            </Link>
          </div>

          {slots.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('noUpcomingSlots')}</p>
          ) : (
            <div className="space-y-2">
              {slots.map((slot) => {
                const status = getSlotStatus(slot)
                const config = statusConfig[status]
                return (
                  <Link
                    key={slot.id}
                    href={`/admin/slots?slot_id=${slot.id}`}
                    className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl border border-border bg-cream px-3 py-2.5 transition-colors hover:border-tea-brown/30 hover:bg-tea-brown/5 sm:grid-cols-[1fr_56px_72px] sm:px-4 sm:py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground" suppressHydrationWarning>
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
            <h2 className="font-serif text-base font-semibold text-foreground">{t('latestBookings')}</h2>
            <Link href="/admin/bookings" className="text-xs text-tea-brown hover:underline">
              {t('viewAll')}
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('noBookings')}</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((booking) => {
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
                      <p className="mt-0.5 text-xs text-muted-foreground" suppressHydrationWarning>
                        {slotData ? `${formatBookingDate(slotData.start_time)} ${formatBookingTime(slotData.start_time)}` : '—'} · {t('guestCount', { count: booking.guest_count })}
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
