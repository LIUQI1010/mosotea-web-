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
  const date = new Intl.DateTimeFormat('zh-CN', {
    timeZone: NZ_TZ,
    month: 'numeric',
    day: 'numeric',
  }).format(d)
  const weekday = new Intl.DateTimeFormat('zh-CN', {
    timeZone: NZ_TZ,
    weekday: 'short',
  }).format(d)
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: NZ_TZ,
      hour: '2-digit',
      hour12: false,
    }).format(d)
  )
  return { date, weekday, time: hour < 12 ? '10:00–11:30' : '14:00–15:30' }
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: '待确认', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  confirmed: { label: '已确认', className: 'bg-green-50 text-green-700 border border-green-200' },
  cancelled: { label: '已取消', className: 'bg-stone-100 text-stone-400 border border-stone-200' },
}

const langLabel: Record<string, string> = {
  en: 'EN',
  'zh-TW': '中',
}

function getBookingNZDate(b: BookingRow): string {
  return new Date(b.time_slots.start_time).toLocaleDateString('en-CA', { timeZone: NZ_TZ })
}

function isBookingMorning(b: BookingRow): boolean {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: NZ_TZ, hour: '2-digit', hour12: false }).format(new Date(b.time_slots.start_time))
  )
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

export function BookingsClient({
  bookings,
  pendingCount,
  todayStr,
  initialSlotDate,
}: BookingsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  // Filter state
  const initialTab = searchParams.get('status') as FilterTab | null
  const [activeTab, setActiveTab] = useState<FilterTab>(initialTab === 'pending' ? 'pending' : 'all')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') ?? '')

  // Modal state
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
  const [editingBooking, setEditingBooking] = useState<BookingRow | null>(null)
  const [cancelTarget, setCancelTarget] = useState<BookingRow | null>(null)
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Loading states
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  // Calendar state — prefer ?date param, then slot pre-navigation, then today
  const initialDate = searchParams.get('date') ?? initialSlotDate ?? null
  const [calendarMonth, setCalendarMonth] = useState(() =>
    initialDate ? initialDate.slice(0, 7) : todayStr.slice(0, 7)
  )
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(initialDate ?? null)

  // Filter logic
  const filtered = bookings.filter((b) => {
    // Tab filter
    switch (activeTab) {
      case 'pending':
        if (b.status !== 'pending') return false
        break
      case 'confirmed':
        if (b.status !== 'confirmed') return false
        break
      case 'cancelled':
        if (b.status !== 'cancelled') return false
        break
      case 'today': {
        const slotDate = new Date(b.time_slots.start_time)
          .toLocaleDateString('en-CA', { timeZone: NZ_TZ })
        if (slotDate !== todayStr) return false
        break
      }
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (
        !b.customer_name.toLowerCase().includes(term) &&
        !b.email.toLowerCase().includes(term)
      ) {
        return false
      }
    }

    return true
  })

  // Build booking map for calendar
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

  // Handlers
  const handleConfirm = async (bookingId: string) => {
    setConfirmingId(bookingId)
    const result = await confirmBooking(bookingId)
    setConfirmingId(null)
    if (result.success) {
      showToast('预约已确认，确认邮件已发送', 'success')
      startTransition(() => router.refresh())
    } else {
      showToast(result.error ?? '操作失败', 'error')
    }
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    const result = await cancelBooking(cancelTarget.id)
    setCancelTarget(null)
    if (result.success) {
      showToast('预约已取消', 'success')
      startTransition(() => router.refresh())
    } else {
      showToast(result.error ?? '操作失败', 'error')
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
    timeSlotId: string
    customerName: string
    email: string
    phone: string
    guestCount: number
    specialRequests: string
    preferredLanguage: string
    sendEmail: boolean
  }): Promise<{ error?: string }> => {
    if (modalMode === 'create') {
      const result = await createBooking({
        timeSlotId: data.timeSlotId,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        guestCount: data.guestCount,
        specialRequests: data.specialRequests,
        preferredLanguage: data.preferredLanguage,
        sendEmail: data.sendEmail,
      })
      if (result.success) {
        showToast('预约创建成功', 'success')
        startTransition(() => router.refresh())
        return {}
      }
      return { error: result.error }
    }

    if (modalMode === 'edit' && editingBooking) {
      const result = await updateBooking(editingBooking.id, {
        guestCount: data.guestCount,
        specialRequests: data.specialRequests,
        preferredLanguage: data.preferredLanguage,
      })
      if (result.success) {
        showToast('预约已更新', 'success')
        startTransition(() => router.refresh())
        return {}
      }
      return { error: result.error }
    }

    return {}
  }

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待确认', count: pendingCount },
    { key: 'confirmed', label: '已确认' },
    { key: 'today', label: '今天' },
    { key: 'cancelled', label: '已取消' },
  ]

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-8 top-8 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === 'success'
              ? 'border border-green-200 bg-green-50 text-green-700'
              : 'border border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Topbar */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#3D3D3D]">预约管理</h1>
        <button
          onClick={openCreateModal}
          className="rounded-lg bg-[#7C5C3E] px-4 py-2 text-sm font-medium text-[#FDF6F0] hover:opacity-90"
        >
          ＋ 新增预约
        </button>
      </div>

      {/* Pending Banner */}
      {pendingCount > 0 && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3">
          <p className="text-sm text-amber-800">
            ⏳ 有 <span className="font-medium">{pendingCount}</span> 条待确认预约，请及时处理
          </p>
          <button
            onClick={() => setActiveTab('pending')}
            className="text-sm font-medium text-amber-700 hover:underline"
          >
            只看待确认
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
                  ? 'bg-[#7C5C3E] text-[#FDF6F0]'
                  : 'border border-[#E8E0D8] bg-white text-[#6B6B6B] hover:bg-stone-50'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-[#FDF6F0]'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
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
            placeholder="搜索姓名或邮箱..."
            className="w-56 rounded-lg border border-[#E8E0D8] bg-white px-3 py-1.5 text-sm text-[#3D3D3D] outline-none focus:border-[#7C5C3E] focus:ring-1 focus:ring-[#7C5C3E]"
          />
        )}
      </div>

      {/* ═══ Calendar View (全部 tab) ═══ */}
      {activeTab === 'all' && (
        <div className="flex gap-6">
          {/* Left: Calendar */}
          <div className="min-w-0 flex-1">
            {/* Month Nav */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => {
                  const i = allCalendarMonths.indexOf(calendarMonth)
                  if (i > 0) setCalendarMonth(allCalendarMonths[i - 1])
                }}
                disabled={allCalendarMonths.indexOf(calendarMonth) <= 0}
                className="rounded-lg border border-[#E8E0D8] bg-white px-3 py-1.5 text-sm text-[#6B6B6B] hover:bg-stone-50 disabled:opacity-30"
              >
                ← 上月
              </button>
              <span className="text-sm font-medium text-[#3D3D3D]">{formatCalendarMonthLabel(calendarMonth)}</span>
              <button
                onClick={() => {
                  const i = allCalendarMonths.indexOf(calendarMonth)
                  if (i < allCalendarMonths.length - 1) setCalendarMonth(allCalendarMonths[i + 1])
                }}
                disabled={allCalendarMonths.indexOf(calendarMonth) >= allCalendarMonths.length - 1}
                className="rounded-lg border border-[#E8E0D8] bg-white px-3 py-1.5 text-sm text-[#6B6B6B] hover:bg-stone-50 disabled:opacity-30"
              >
                下月 →
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-hidden rounded-2xl border border-[#E8E0D8] bg-white">
              <div className="grid grid-cols-7 border-b border-[#E8E0D8] bg-stone-50/50">
                {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
                  <div key={d} className="py-2 text-center text-xs font-medium text-[#6B6B6B]">{d}</div>
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
                    className={`min-h-[90px] border-b border-r border-[#E8E0D8] p-1.5 transition-colors ${
                      !day.isCurrentMonth ? 'bg-stone-50/40' : ''
                    } ${day.isToday ? 'bg-amber-50/40' : ''} ${
                      day.dateStr === selectedCalendarDate
                        ? 'bg-[#FDF6F0]'
                        : day.bookings.length > 0 && day.isCurrentMonth
                          ? 'cursor-pointer hover:bg-stone-50'
                          : ''
                    } ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}`}
                  >
                    <div className="mb-1">
                      <span className={`text-[11px] ${
                        day.isToday
                          ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#7C5C3E] font-medium text-white'
                          : day.isCurrentMonth
                            ? 'font-medium text-[#3D3D3D]'
                            : 'text-stone-300'
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
                                ? 'bg-amber-100 text-amber-700'
                                : b.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-stone-100 text-stone-400 line-through'
                            }`}
                          >
                            {b.customer_name} {b.guest_count}人
                          </div>
                        ))}
                        {day.bookings.length > 3 && (
                          <div className="px-1 text-[9px] text-[#6B6B6B]">+{day.bookings.length - 3}</div>
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
              className="sticky top-8 overflow-hidden rounded-2xl border border-[#E8E0D8] bg-white"
              style={{ maxHeight: 'calc(100vh - 4rem)' }}
            >
              {selectedCalendarDate && selectedDateBookings.length > 0 ? (
                <div className="flex h-full flex-col">
                  {/* Header */}
                  <div className="border-b border-[#E8E0D8] p-4">
                    <p className="text-sm font-medium text-[#3D3D3D]">
                      {new Intl.DateTimeFormat('zh-CN', {
                        timeZone: NZ_TZ,
                        month: 'numeric',
                        day: 'numeric',
                        weekday: 'short',
                      }).format(new Date(`${selectedCalendarDate}T12:00:00`))}
                    </p>
                    <p className="mt-1 text-xs text-[#6B6B6B]">
                      {selectedDateBookings
                        .filter((b) => b.status !== 'cancelled')
                        .reduce((s, b) => s + b.guest_count, 0)}{' '}
                      人 ·{' '}
                      {selectedDateBookings.filter((b) => b.status === 'pending').length} 待确认
                    </p>
                  </div>

                  {/* Booking list */}
                  <div className="flex-1 space-y-4 overflow-y-auto p-4">
                    {(['morning', 'afternoon'] as const).map((session) => {
                      const sessionBookings = selectedDateBookings.filter(
                        (b) => isBookingMorning(b) === (session === 'morning')
                      )
                      if (sessionBookings.length === 0) return null
                      return (
                        <div key={session}>
                          <p className="mb-2 text-[10px] font-medium text-[#6B6B6B]">
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
                                  className={`rounded-xl border border-[#E8E0D8] p-3 ${isCancelled ? 'opacity-50' : ''}`}
                                >
                                  <div className="mb-1 flex items-center justify-between">
                                    <span className="text-sm font-medium text-[#3D3D3D]">{b.customer_name}</span>
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.className}`}>
                                      {cfg.label}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#6B6B6B]">
                                    {b.guest_count}人 · {langLabel[b.preferred_language] ?? b.preferred_language}
                                  </p>
                                  <p className="mt-0.5 truncate text-xs text-[#6B6B6B]">{b.email}</p>
                                  {!isCancelled && (
                                    <div className="mt-2 flex gap-1.5">
                                      {isPending && (
                                        <button
                                          onClick={() => handleConfirm(b.id)}
                                          disabled={confirmingId === b.id}
                                          className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                                        >
                                          {confirmingId === b.id ? '...' : '✓ 确认'}
                                        </button>
                                      )}
                                      <button
                                        onClick={() => openEditModal(b)}
                                        className="rounded-md bg-stone-50 px-2 py-1 text-xs text-[#6B6B6B] hover:bg-stone-100"
                                      >
                                        编辑
                                      </button>
                                      <button
                                        onClick={() => setCancelTarget(b)}
                                        className="rounded-md bg-stone-50 px-2 py-1 text-xs text-red-500 hover:bg-red-50"
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
                  <div className="mb-3 text-3xl text-stone-200">📅</div>
                  <p className="text-sm text-[#6B6B6B]">
                    点击日历中的日期
                    <br />
                    查看当天预约详情
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Table View (other tabs) ═══ */}
      {activeTab !== 'all' && (
        <div className="overflow-x-auto rounded-2xl border border-[#E8E0D8] bg-white min-w-0">
          {/* Header */}
          <div className="grid min-w-[1100px] grid-cols-[1fr_1.5fr_1fr_70px_50px_90px_45px_42px_1.2fr_65px_1.3fr] gap-2 border-b border-[#E8E0D8] px-5 py-3 text-center">
            <span className="text-xs font-medium text-[#6B6B6B]">姓名</span>
            <span className="text-xs font-medium text-[#6B6B6B]">邮箱</span>
            <span className="text-xs font-medium text-[#6B6B6B]">电话</span>
            <span className="text-xs font-medium text-[#6B6B6B]">日期</span>
            <span className="text-xs font-medium text-[#6B6B6B]">星期</span>
            <span className="text-xs font-medium text-[#6B6B6B]">时段</span>
            <span className="text-xs font-medium text-[#6B6B6B]">人数</span>
            <span className="text-xs font-medium text-[#6B6B6B]">语言</span>
            <span className="text-xs font-medium text-[#6B6B6B]">特殊说明</span>
            <span className="text-xs font-medium text-[#6B6B6B]">状态</span>
            <span className="text-xs font-medium text-[#6B6B6B]">操作</span>
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#6B6B6B]">暂无预约记录</p>
          ) : (
            filtered.map((booking) => {
              const isCancelled = booking.status === 'cancelled'
              const isPending = booking.status === 'pending'
              const slot = formatSlotDateTime(booking.time_slots.start_time)
              const cfg = statusConfig[booking.status] ?? statusConfig.pending

              return (
                <div
                  key={booking.id}
                  className={`grid min-w-[1100px] grid-cols-[1fr_1.5fr_1fr_70px_50px_90px_45px_42px_1.2fr_65px_1.3fr] items-center gap-2 border-b border-[#E8E0D8] px-5 py-3 text-center transition-colors last:border-b-0 ${
                    isCancelled
                      ? 'opacity-50'
                      : isPending
                        ? 'bg-[#FFFBF5] hover:bg-amber-50/60'
                        : 'hover:bg-stone-50/50'
                  }`}
                >
                  {/* Name */}
                  <span className="truncate text-sm font-medium text-[#3D3D3D]">
                    {booking.customer_name}
                  </span>

                  {/* Email */}
                  <span className="truncate text-xs text-[#6B6B6B]">
                    {booking.email}
                  </span>

                  {/* Phone */}
                  <span className="truncate text-xs text-[#6B6B6B]">
                    {booking.phone || '—'}
                  </span>

                  {/* Date */}
                  <span className="text-sm text-[#3D3D3D]">{slot.date}</span>

                  {/* Weekday */}
                  <span className="text-sm text-[#6B6B6B]">{slot.weekday}</span>

                  {/* Time */}
                  <span className="text-xs text-[#6B6B6B]">{slot.time}</span>

                  {/* Guests */}
                  <span className="text-sm text-[#3D3D3D]">{booking.guest_count}</span>

                  {/* Language */}
                  <span className="text-xs text-[#6B6B6B]">
                    {langLabel[booking.preferred_language] ?? booking.preferred_language}
                  </span>

                  {/* Special Requests */}
                  <span className="truncate text-xs text-[#6B6B6B]" title={booking.special_requests || ''}>
                    {booking.special_requests || '—'}
                  </span>

                  {/* Status */}
                  <div>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-nowrap items-center justify-center gap-1.5">
                    {isPending && (
                      <button
                        onClick={() => handleConfirm(booking.id)}
                        disabled={confirmingId === booking.id}
                        className="whitespace-nowrap rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                        title="确认"
                      >
                        {confirmingId === booking.id ? '...' : '✓ 确认'}
                      </button>
                    )}
                    {!isCancelled && (
                      <>
                        <button
                          onClick={() => openEditModal(booking)}
                          className="whitespace-nowrap rounded-md bg-stone-50 px-2 py-1 text-xs text-[#6B6B6B] hover:bg-stone-100"
                          title="编辑"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => setCancelTarget(booking)}
                          className="whitespace-nowrap rounded-md bg-stone-50 px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                          title="取消"
                        >
                          取消
                        </button>
                      </>
                    )}
                    {isCancelled && (
                      <span className="text-xs text-stone-300">—</span>
                    )}
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
          onClose={() => {
            setModalMode(null)
            setEditingBooking(null)
          }}
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
