'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookingModal } from './BookingModal'
import { ConfirmCancelModal } from './ConfirmCancelModal'
import {
  confirmBooking,
  cancelBooking,
  createBooking,
  updateBooking,
  getAvailableSlots,
} from '../_actions'
import type { BookingRow, AvailableSlot } from '../_actions'

const NZ_TZ = 'Pacific/Auckland'

type FilterTab = 'all' | 'pending' | 'confirmed' | 'today' | 'cancelled'

function formatSlotDateTime(startTime: string): { date: string; weekday: string; time: string } {
  const d = new Date(startTime)
  const date = new Intl.DateTimeFormat('zh-TW', { timeZone: NZ_TZ, month: 'numeric', day: 'numeric' }).format(d)
  const weekday = new Intl.DateTimeFormat('zh-TW', { timeZone: NZ_TZ, weekday: 'short' }).format(d)
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: NZ_TZ, hour: '2-digit', hour12: false }).format(d))
  return { date, weekday, time: hour < 12 ? '10:00–11:30' : '14:00–15:30' }
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:   { label: '待確認', className: 'bg-tea-brown/10 text-tea-brown border border-tea-brown/20' },
  confirmed: { label: '已確認', className: 'bg-bamboo-green/10 text-bamboo-green border border-bamboo-green/20' },
  cancelled: { label: '已取消', className: 'bg-cream text-muted-foreground border border-border' },
}

const langLabel: Record<string, string> = { en: 'EN', 'zh-TW': '中' }

function getBookingNZDate(b: BookingRow): string {
  return new Date(b.time_slots.start_time).toLocaleDateString('en-CA', { timeZone: NZ_TZ })
}

function isBookingMorning(b: BookingRow): boolean {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: NZ_TZ, hour: '2-digit', hour12: false }).format(new Date(b.time_slots.start_time)))
  return hour < 12
}

function buildBookingCalendarDays(
  yearMonth: string,
  bookingMap: Map<string, BookingRow[]>,
  todayStr: string
): { dateStr: string; day: number; isCurrentMonth: boolean; isToday: boolean; bookings: BookingRow[] }[] {
  const [y, m] = yearMonth.split('-').map(Number)
  const firstDay = new Date(y, m - 1, 1)
  const lastDay = new Date(y, m, 0)
  let startPad = firstDay.getDay() - 1
  if (startPad < 0) startPad = 6
  const days: { dateStr: string; day: number; isCurrentMonth: boolean; isToday: boolean; bookings: BookingRow[] }[] = []

  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(y, m - 1, -i)
    const ds = d.toLocaleDateString('en-CA')
    days.push({ dateStr: ds, day: d.getDate(), isCurrentMonth: false, isToday: ds === todayStr, bookings: bookingMap.get(ds) ?? [] })
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(y, m - 1, d)
    const ds = date.toLocaleDateString('en-CA')
    days.push({ dateStr: ds, day: d, isCurrentMonth: true, isToday: ds === todayStr, bookings: bookingMap.get(ds) ?? [] })
  }
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(y, m, i)
      const ds = d.toLocaleDateString('en-CA')
      days.push({ dateStr: ds, day: d.getDate(), isCurrentMonth: false, isToday: ds === todayStr, bookings: bookingMap.get(ds) ?? [] })
    }
  }
  return days
}

function formatCalendarMonthLabel(key: string): string {
  const [y, m] = key.split('-')
  return `${y}年${Number(m)}月`
}

interface BookingsClientProps {
  bookings: BookingRow[]
  pendingCount: number
  todayStr: string
  initialSlotDate?: string | null
}

export function BookingsClient({ bookings, pendingCount, todayStr, initialSlotDate }: BookingsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const initialTab = searchParams.get('status') as FilterTab | null
  const [activeTab, setActiveTab] = useState<FilterTab>(initialTab === 'pending' ? 'pending' : 'all')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') ?? '')

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
  const [editingBooking, setEditingBooking] = useState<BookingRow | null>(null)
  const [cancelTarget, setCancelTarget] = useState<BookingRow | null>(null)
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const initialDate = searchParams.get('date') ?? initialSlotDate ?? null
  const [calendarMonth, setCalendarMonth] = useState(() =>
    initialDate ? initialDate.slice(0, 7) : todayStr.slice(0, 7)
  )
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(initialDate ?? null)

  const filtered = bookings.filter((b) => {
    switch (activeTab) {
      case 'pending':    if (b.status !== 'pending') return false; break
      case 'confirmed':  if (b.status !== 'confirmed') return false; break
      case 'cancelled':  if (b.status !== 'cancelled') return false; break
      case 'today': {
        const slotDate = new Date(b.time_slots.start_time).toLocaleDateString('en-CA', { timeZone: NZ_TZ })
        if (slotDate !== todayStr) return false; break
      }
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!b.customer_name.toLowerCase().includes(term) && !b.email.toLowerCase().includes(term)) return false
    }
    return true
  })

  const bookingMap = new Map<string, BookingRow[]>()
  for (const b of bookings) {
    const dateStr = getBookingNZDate(b)
    const existing = bookingMap.get(dateStr) ?? []
    existing.push(b)
    bookingMap.set(dateStr, existing)
  }
  const bookingMonthKeys = [...new Set([...bookingMap.keys()].map((d) => d.slice(0, 7)))]
  const allCalendarMonths = [...new Set([todayStr.slice(0, 7), ...bookingMonthKeys])].sort()
  const calendarDays = buildBookingCalendarDays(calendarMonth, bookingMap, todayStr)
  const selectedDateBookings = selectedCalendarDate ? (bookingMap.get(selectedCalendarDate) ?? []) : []

  const handleConfirm = async (bookingId: string) => {
    setConfirmingId(bookingId)
    const result = await confirmBooking(bookingId)
    setConfirmingId(null)
    if (result.success) {
      showToast('預約已確認，確認電郵已發送', 'success')
      startTransition(() => router.refresh())
    } else {
      showToast(result.error ?? '操作失敗', 'error')
    }
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    const result = await cancelBooking(cancelTarget.id)
    setCancelTarget(null)
    if (result.success) {
      showToast('預約已取消', 'success')
      startTransition(() => router.refresh())
    } else {
      showToast(result.error ?? '操作失敗', 'error')
    }
  }

  const openCreateModal = useCallback(async () => {
    const slots = await getAvailableSlots()
    setAvailableSlots(slots)
    setEditingBooking(null)
    setModalMode('create')
  }, [])

  const openEditModal = useCallback((booking: BookingRow) => {
    setEditingBooking(booking)
    setModalMode('edit')
  }, [])

  const handleModalSubmit = async (data: {
    timeSlotId: string; customerName: string; email: string; phone: string
    guestCount: number; specialRequests: string; preferredLanguage: string; sendEmail: boolean
  }): Promise<{ error?: string }> => {
    if (modalMode === 'create') {
      const result = await createBooking({ timeSlotId: data.timeSlotId, customerName: data.customerName, email: data.email, phone: data.phone, guestCount: data.guestCount, specialRequests: data.specialRequests, preferredLanguage: data.preferredLanguage, sendEmail: data.sendEmail })
      if (result.success) { showToast('預約建立成功', 'success'); startTransition(() => router.refresh()); return {} }
      return { error: result.error }
    }
    if (modalMode === 'edit' && editingBooking) {
      const result = await updateBooking(editingBooking.id, { guestCount: data.guestCount, specialRequests: data.specialRequests, preferredLanguage: data.preferredLanguage })
      if (result.success) { showToast('預約已更新', 'success'); startTransition(() => router.refresh()); return {} }
      return { error: result.error }
    }
    return {}
  }

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all',       label: '全部' },
    { key: 'pending',   label: '待確認', count: pendingCount },
    { key: 'confirmed', label: '已確認' },
    { key: 'today',     label: '今天' },
    { key: 'cancelled', label: '已取消' },
  ]

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed right-8 top-8 z-50 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === 'success'
            ? 'border-bamboo-green/20 bg-bamboo-green/10 text-bamboo-green'
            : 'border-red-100 bg-red-50 text-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Topbar */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">預約管理</p>
          <h1 className="font-serif text-3xl font-semibold text-foreground">預約列表</h1>
        </div>
        <button
          onClick={openCreateModal}
          className="rounded-lg bg-tea-brown px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          ＋ 新增預約
        </button>
      </div>

      {/* Pending Banner */}
      {pendingCount > 0 && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-tea-brown/20 bg-tea-brown/5 px-5 py-3">
          <p className="text-sm text-tea-brown">
            有 <span className="font-semibold">{pendingCount}</span> 筆待確認預約，請及時處理
          </p>
          <button onClick={() => setActiveTab('pending')} className="text-sm font-medium text-tea-brown underline-offset-2 hover:underline">
            只看待確認
          </button>
        </div>
      )}

      {/* Filter Tabs + Search */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-3.5 py-1.5 text-sm transition-colors ${
                activeTab === tab.key
                  ? 'bg-tea-brown text-primary-foreground'
                  : 'border border-border bg-off-white text-muted-foreground hover:bg-cream hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-xs ${
                  activeTab === tab.key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-tea-brown/15 text-tea-brown'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab !== 'all' && (
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋姓名或電郵..."
            className="w-56 rounded-lg border border-border bg-off-white px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-tea-brown focus:ring-2 focus:ring-tea-brown/20"
          />
        )}
      </div>

      {/* ═══ Calendar View ═══ */}
      {activeTab === 'all' && (
        <div className="flex gap-6">
          {/* Left: Calendar */}
          <div className="min-w-0 flex-1">
            {/* Month Nav */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => { const i = allCalendarMonths.indexOf(calendarMonth); if (i > 0) setCalendarMonth(allCalendarMonths[i - 1]) }}
                disabled={allCalendarMonths.indexOf(calendarMonth) <= 0}
                className="rounded-lg border border-border bg-off-white px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-cream disabled:opacity-30"
              >
                ← 上月
              </button>
              <span className="font-serif text-base font-semibold text-foreground">{formatCalendarMonthLabel(calendarMonth)}</span>
              <button
                onClick={() => { const i = allCalendarMonths.indexOf(calendarMonth); if (i < allCalendarMonths.length - 1) setCalendarMonth(allCalendarMonths[i + 1]) }}
                disabled={allCalendarMonths.indexOf(calendarMonth) >= allCalendarMonths.length - 1}
                className="rounded-lg border border-border bg-off-white px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-cream disabled:opacity-30"
              >
                下月 →
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-hidden rounded-2xl border border-border bg-off-white">
              <div className="grid grid-cols-7 border-b border-border bg-cream">
                {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
                  <div key={d} className="py-2.5 text-center text-xs font-medium text-muted-foreground">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {calendarDays.map((day, i) => (
                  <div
                    key={day.dateStr + i}
                    onClick={() =>
                      day.isCurrentMonth && day.bookings.length > 0 &&
                      setSelectedCalendarDate(selectedCalendarDate === day.dateStr ? null : day.dateStr)
                    }
                    className={`min-h-[90px] border-b border-r border-border p-1.5 transition-colors ${
                      !day.isCurrentMonth ? 'bg-cream/40' : ''
                    } ${day.isToday && day.dateStr !== selectedCalendarDate ? 'bg-tea-brown/5' : ''} ${
                      day.dateStr === selectedCalendarDate
                        ? 'bg-tea-brown/10'
                        : day.bookings.length > 0 && day.isCurrentMonth
                          ? 'cursor-pointer hover:bg-cream'
                          : ''
                    } ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}`}
                  >
                    <div className="mb-1">
                      <span className={`text-[11px] ${
                        day.isToday
                          ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-tea-brown font-semibold text-primary-foreground'
                          : day.isCurrentMonth
                            ? 'font-medium text-foreground'
                            : 'text-muted-foreground/30'
                      }`}>
                        {day.day}
                      </span>
                    </div>
                    {day.isCurrentMonth && day.bookings.length > 0 && (
                      <div className="space-y-0.5">
                        {day.bookings.slice(0, 3).map((b) => (
                          <div
                            key={b.id}
                            className={`truncate rounded px-1 py-0.5 text-[9px] font-medium leading-tight ${
                              b.status === 'pending'
                                ? 'bg-tea-brown/15 text-tea-brown'
                                : b.status === 'confirmed'
                                  ? 'bg-bamboo-green/15 text-bamboo-green'
                                  : 'bg-cream text-muted-foreground line-through'
                            }`}
                          >
                            {b.customer_name} {b.guest_count}人
                          </div>
                        ))}
                        {day.bookings.length > 3 && (
                          <div className="px-1 text-[9px] text-muted-foreground">+{day.bookings.length - 3}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Day Detail Sidebar */}
          <div className="w-[300px] shrink-0">
            <div
              className="sticky top-8 overflow-hidden rounded-2xl border border-border bg-off-white"
              style={{ maxHeight: 'calc(100vh - 4rem)' }}
            >
              {selectedCalendarDate && selectedDateBookings.length > 0 ? (
                <div className="flex h-full flex-col">
                  <div className="border-b border-border bg-cream px-4 py-3.5">
                    <p className="font-serif text-sm font-semibold text-foreground">
                      {new Intl.DateTimeFormat('zh-TW', { timeZone: NZ_TZ, month: 'numeric', day: 'numeric', weekday: 'short' }).format(new Date(`${selectedCalendarDate}T12:00:00`))}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {selectedDateBookings.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + b.guest_count, 0)} 人 · {selectedDateBookings.filter((b) => b.status === 'pending').length} 待確認
                    </p>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto p-4">
                    {(['morning', 'afternoon'] as const).map((session) => {
                      const sessionBookings = selectedDateBookings.filter((b) => isBookingMorning(b) === (session === 'morning'))
                      if (sessionBookings.length === 0) return null
                      return (
                        <div key={session}>
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {session === 'morning' ? '上午 10:00–11:30' : '下午 14:00–15:30'}
                          </p>
                          <div className="space-y-2">
                            {sessionBookings.map((b) => {
                              const isPending = b.status === 'pending'
                              const isCancelled = b.status === 'cancelled'
                              const cfg = statusConfig[b.status] ?? statusConfig.pending
                              return (
                                <div
                                  key={b.id}
                                  className={`rounded-xl border border-border bg-cream p-3 ${isCancelled ? 'opacity-50' : ''}`}
                                >
                                  <div className="mb-1 flex items-center justify-between">
                                    <span className="text-sm font-medium text-foreground">{b.customer_name}</span>
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.className}`}>{cfg.label}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{b.guest_count}人 · {langLabel[b.preferred_language] ?? b.preferred_language}</p>
                                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{b.email}</p>
                                  {!isCancelled && (
                                    <div className="mt-2.5 flex gap-1.5">
                                      {isPending && (
                                        <button
                                          onClick={() => handleConfirm(b.id)}
                                          disabled={confirmingId === b.id}
                                          className="rounded-md bg-bamboo-green/10 px-2 py-1 text-xs font-medium text-bamboo-green transition-colors hover:bg-bamboo-green/20 disabled:opacity-50"
                                        >
                                          {confirmingId === b.id ? '...' : '✓ 確認'}
                                        </button>
                                      )}
                                      <button
                                        onClick={() => openEditModal(b)}
                                        className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-off-white"
                                      >
                                        編輯
                                      </button>
                                      <button
                                        onClick={() => setCancelTarget(b)}
                                        className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                                      >
                                        取消
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center p-6 text-center">
                  <div className="mb-3 h-10 w-10 rounded-full bg-cream flex items-center justify-center">
                    <svg className="h-5 w-5 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">點擊日曆中的日期<br />查看當天預約詳情</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Table View ═══ */}
      {activeTab !== 'all' && (
        <div className="overflow-x-auto rounded-2xl border border-border bg-off-white min-w-0">
          <div className="grid min-w-[1100px] grid-cols-[1fr_1.5fr_1fr_70px_50px_90px_45px_42px_1.2fr_65px_1.3fr] gap-2 border-b border-border bg-cream px-5 py-3 text-center">
            {['姓名','電郵','電話','日期','星期','時段','人數','語言','特殊需求','狀態','操作'].map((h) => (
              <span key={h} className="text-xs font-medium text-muted-foreground">{h}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">暫無預約記錄</p>
          ) : (
            filtered.map((booking) => {
              const isCancelled = booking.status === 'cancelled'
              const isPending = booking.status === 'pending'
              const slot = formatSlotDateTime(booking.time_slots.start_time)
              const cfg = statusConfig[booking.status] ?? statusConfig.pending

              return (
                <div
                  key={booking.id}
                  className={`grid min-w-[1100px] grid-cols-[1fr_1.5fr_1fr_70px_50px_90px_45px_42px_1.2fr_65px_1.3fr] items-center gap-2 border-b border-border px-5 py-3 text-center transition-colors last:border-b-0 ${
                    isCancelled ? 'opacity-40' : isPending ? 'bg-tea-brown/5 hover:bg-tea-brown/10' : 'hover:bg-cream'
                  }`}
                >
                  <span className="truncate text-sm font-medium text-foreground">{booking.customer_name}</span>
                  <span className="truncate text-xs text-muted-foreground">{booking.email}</span>
                  <span className="truncate text-xs text-muted-foreground">{booking.phone || '—'}</span>
                  <span className="text-sm text-foreground">{slot.date}</span>
                  <span className="text-sm text-muted-foreground">{slot.weekday}</span>
                  <span className="text-xs text-muted-foreground">{slot.time}</span>
                  <span className="text-sm text-foreground">{booking.guest_count}</span>
                  <span className="text-xs text-muted-foreground">{langLabel[booking.preferred_language] ?? booking.preferred_language}</span>
                  <span className="truncate text-xs text-muted-foreground" title={booking.special_requests || ''}>{booking.special_requests || '—'}</span>
                  <div>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
                  </div>
                  <div className="flex flex-nowrap items-center justify-center gap-1.5">
                    {isPending && (
                      <button
                        onClick={() => handleConfirm(booking.id)}
                        disabled={confirmingId === booking.id}
                        className="whitespace-nowrap rounded-md bg-bamboo-green/10 px-2 py-1 text-xs font-medium text-bamboo-green transition-colors hover:bg-bamboo-green/20 disabled:opacity-50"
                      >
                        {confirmingId === booking.id ? '...' : '✓ 確認'}
                      </button>
                    )}
                    {!isCancelled && (
                      <>
                        <button onClick={() => openEditModal(booking)} className="whitespace-nowrap rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-cream">編輯</button>
                        <button onClick={() => setCancelTarget(booking)} className="whitespace-nowrap rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-500">取消</button>
                      </>
                    )}
                    {isCancelled && <span className="text-xs text-muted-foreground/30">—</span>}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Booking Modal */}
      {modalMode && (
        <BookingModal
          open={!!modalMode}
          onClose={() => { setModalMode(null); setEditingBooking(null) }}
          mode={modalMode}
          booking={editingBooking}
          availableSlots={availableSlots}
          onSubmit={handleModalSubmit}
        />
      )}

      {/* Cancel Confirm Modal */}
      <ConfirmCancelModal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        customerName={cancelTarget?.customer_name ?? ''}
      />
    </div>
  )
}
