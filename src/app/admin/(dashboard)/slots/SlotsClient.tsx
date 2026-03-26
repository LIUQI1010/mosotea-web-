'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { generateSlots, toggleSlot } from './_actions'
import type { SlotBooking } from './page'

const NZ_TZ = 'Pacific/Auckland'

interface Slot {
  id: string
  start_time: string
  end_time: string
  max_guests: number
  booked_guests: number
  is_available: boolean
}

type FilterTab = 'all' | 'this_week' | 'disabled'
type SlotStatus = 'full' | 'available' | 'empty' | 'disabled'

function getSlotStatus(slot: Slot): SlotStatus {
  if (!slot.is_available) return 'disabled'
  if (slot.booked_guests >= slot.max_guests) return 'full'
  if (slot.booked_guests > 0) return 'available'
  return 'empty'
}

const statusConfig: Record<SlotStatus, { label: string; labelFn?: (r: number) => string; className: string }> = {
  full:      { label: '已滿',   className: 'bg-red-50 text-red-600 border border-red-100' },
  available: { label: '有空位', labelFn: (r) => `有空位（${r}位）`, className: 'bg-bamboo-green/10 text-bamboo-green border border-bamboo-green/20' },
  empty:     { label: '空閒',   className: 'bg-cream text-muted-foreground border border-border' },
  disabled:  { label: '已停用', className: 'bg-red-50 text-red-400 border border-red-100' },
}

const bookingStatusConfig: Record<string, { label: string; className: string }> = {
  pending:   { label: '待確認', className: 'bg-tea-brown/10 text-tea-brown border border-tea-brown/20' },
  confirmed: { label: '已確認', className: 'bg-bamboo-green/10 text-bamboo-green border border-bamboo-green/20' },
}

const langLabel: Record<string, string> = { en: 'EN', 'zh-TW': '中' }

function toNZDateStr(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: NZ_TZ })
}
function getNZDate(isoStr: string): string {
  return toNZDateStr(new Date(isoStr))
}
function isSlotMorning(startTime: string): boolean {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: NZ_TZ, hour: '2-digit', hour12: false }).format(new Date(startTime)))
  return hour < 12
}
function formatSlotTime(startTime: string): string {
  return isSlotMorning(startTime) ? '10:00 – 11:30' : '14:00 – 15:30'
}
function formatDateChinese(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${date.getMonth() + 1}月${date.getDate()}日 週${weekdays[date.getDay()]}`
}
function getWeekLabel(dateStr: string, todayStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`)
  const today = new Date(`${todayStr}T12:00:00`)
  const getMonday = (d: Date) => { const day = d.getDay(); const off = day === 0 ? -6 : 1 - day; const m = new Date(d); m.setDate(d.getDate() + off); return m }
  const dateMonday = getMonday(date)
  const todayMonday = getMonday(today)
  const diffWeeks = Math.round((dateMonday.getTime() - todayMonday.getTime()) / (7 * 86400000))
  const sunday = new Date(dateMonday); sunday.setDate(dateMonday.getDate() + 6)
  const monM = dateMonday.getMonth() + 1, monD = dateMonday.getDate(), sunM = sunday.getMonth() + 1, sunD = sunday.getDate()
  const range = monM === sunM ? `${monM}月${monD}日–${sunD}日` : `${monM}月${monD}日–${sunM}月${sunD}日`
  if (diffWeeks === 0) return `本週 ${range}`
  if (diffWeeks === 1) return `下週 ${range}`
  if (diffWeeks === -1) return `上週 ${range}`
  return range
}
function getWeekRange(todayStr: string, offset: number) {
  const today = new Date(`${todayStr}T12:00:00`)
  const day = today.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(today); monday.setDate(today.getDate() + mondayOffset + offset * 7)
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
  return { start: monday.toLocaleDateString('en-CA'), end: sunday.toLocaleDateString('en-CA') }
}
function getMonthKey(isoStr: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: NZ_TZ, year: 'numeric', month: '2-digit' }).formatToParts(new Date(isoStr))
  return `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}`
}
function formatMonthLabel(key: string): string {
  const [y, m] = key.split('-'); return `${y}年${Number(m)}月`
}

// ── Calendar types ──

interface CalendarDay {
  dateStr: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  morning?: Slot
  afternoon?: Slot
}

function buildCalendarDays(yearMonth: string, slotMap: Map<string, { morning?: Slot; afternoon?: Slot }>, todayStr: string): CalendarDay[] {
  const [y, m] = yearMonth.split('-').map(Number)
  const firstDay = new Date(y, m - 1, 1)
  const lastDay = new Date(y, m, 0)
  let startPad = firstDay.getDay() - 1; if (startPad < 0) startPad = 6
  const days: CalendarDay[] = []

  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(y, m - 1, -i); const ds = d.toLocaleDateString('en-CA'); const data = slotMap.get(ds)
    days.push({ dateStr: ds, day: d.getDate(), isCurrentMonth: false, isToday: ds === todayStr, morning: data?.morning, afternoon: data?.afternoon })
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(y, m - 1, d); const ds = date.toLocaleDateString('en-CA'); const data = slotMap.get(ds)
    days.push({ dateStr: ds, day: d, isCurrentMonth: true, isToday: ds === todayStr, morning: data?.morning, afternoon: data?.afternoon })
  }
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(y, m, i); const ds = d.toLocaleDateString('en-CA'); const data = slotMap.get(ds)
      days.push({ dateStr: ds, day: d.getDate(), isCurrentMonth: false, isToday: ds === todayStr, morning: data?.morning, afternoon: data?.afternoon })
    }
  }
  return days
}

// ── Slot cell ──

function SlotCell({
  slot, type, isSelected, onSelect,
}: {
  slot: Slot | undefined; type: 'morning' | 'afternoon'; isSelected: boolean
  onSelect: (slot: Slot, type: 'morning' | 'afternoon') => void
}) {
  if (!slot) return <div className="h-6 rounded bg-cream/60" />

  const status = getSlotStatus(slot)
  const pct = (slot.booked_guests / slot.max_guests) * 100

  const colors = {
    morning: {
      bg: status === 'disabled' ? 'bg-red-50' : 'bg-tea-brown/8',
      bar: pct >= 100 ? 'bg-red-400' : 'bg-tea-brown',
      text: status === 'disabled' ? 'text-red-400' : 'text-tea-brown',
      border: status === 'disabled' ? 'border-red-200' : isSelected ? 'border-tea-brown' : 'border-tea-brown/30',
      ring: isSelected ? 'ring-1 ring-tea-brown/50' : '',
    },
    afternoon: {
      bg: status === 'disabled' ? 'bg-red-50' : 'bg-bamboo-green/8',
      bar: pct >= 100 ? 'bg-red-400' : 'bg-bamboo-green',
      text: status === 'disabled' ? 'text-red-400' : 'text-bamboo-green',
      border: status === 'disabled' ? 'border-red-200' : isSelected ? 'border-bamboo-green' : 'border-bamboo-green/30',
      ring: isSelected ? 'ring-1 ring-bamboo-green/50' : '',
    },
  }[type]

  return (
    <button
      onClick={() => onSelect(slot, type)}
      className={`relative h-7 w-full rounded border ${colors.bg} ${colors.border} ${colors.ring} flex items-center gap-0.5 px-1 transition-all hover:opacity-80`}
    >
      <div className="absolute inset-0 overflow-hidden rounded">
        <div className={`h-full ${colors.bar} opacity-20`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      {status === 'disabled' && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden rounded" preserveAspectRatio="none">
          <line x1="0" y1="100%" x2="100%" y2="0" stroke="rgba(220,38,38,0.3)" strokeWidth="1.5" />
        </svg>
      )}
      <span className={`relative z-10 text-[11px] font-medium ${colors.text}`}>
        {type === 'morning' ? '上午' : '下午'}
      </span>
      <span className={`relative z-10 ml-auto text-[11px] ${colors.text}`}>
        {slot.booked_guests}/{slot.max_guests}
      </span>
    </button>
  )
}

// ── Detail Sidebar ──

function DetailSidebar({
  slot, type, bookings, togglingId, onToggle,
}: {
  slot: Slot; type: 'morning' | 'afternoon'; bookings: SlotBooking[]
  togglingId: string | null; onToggle: (id: string, val: boolean) => void
}) {
  const status = getSlotStatus(slot)
  const remaining = slot.max_guests - slot.booked_guests
  const cfg = statusConfig[status]
  const dateStr = getNZDate(slot.start_time)
  const isMorning = type === 'morning'
  const accentBar = isMorning
    ? (slot.booked_guests >= slot.max_guests ? 'bg-red-400' : 'bg-tea-brown')
    : (slot.booked_guests >= slot.max_guests ? 'bg-red-400' : 'bg-bamboo-green')
  const accentDot = isMorning ? 'bg-tea-brown' : 'bg-bamboo-green'

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-cream px-4 py-3.5">
        <div className="mb-1.5 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${accentDot}`} />
          <span className="text-xs font-medium text-muted-foreground">{formatDateChinese(dateStr)}</span>
        </div>
        <p className="font-serif text-lg font-semibold text-foreground">
          {type === 'morning' ? '10:00 – 11:30' : '14:00 – 15:30'}
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
            {cfg.labelFn ? cfg.labelFn(remaining) : cfg.label}
          </span>
          <span className="text-xs text-muted-foreground">{slot.booked_guests}/{slot.max_guests} 已預約</span>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-border">
          <div
            className={`h-full rounded-full transition-all ${accentBar}`}
            style={{ width: `${Math.min((slot.booked_guests / slot.max_guests) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-b border-border px-4 py-3">
        <Link
          href={`/admin/bookings?slot_id=${slot.id}`}
          className="flex-1 rounded-lg border border-border bg-off-white py-1.5 text-center text-xs font-medium text-foreground transition-colors hover:bg-cream"
        >
          查看全部預約
        </Link>
        <button
          onClick={() => onToggle(slot.id, !slot.is_available)}
          disabled={togglingId === slot.id}
          className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
            slot.is_available
              ? 'border border-border bg-off-white text-muted-foreground hover:bg-cream'
              : 'bg-bamboo-green/10 text-bamboo-green border border-bamboo-green/20 hover:bg-bamboo-green/20'
          }`}
        >
          {togglingId === slot.id ? '...' : slot.is_available ? '停用此場次' : '啟用此場次'}
        </button>
      </div>

      {/* Booking list */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          預約清單（{bookings.length}）
        </p>
        {bookings.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">暫無預約</p>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => {
              const bCfg = bookingStatusConfig[b.status] ?? bookingStatusConfig.pending
              return (
                <div key={b.id} className="rounded-xl border border-border bg-cream p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{b.customer_name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${bCfg.className}`}>{bCfg.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{b.guest_count}人 · {langLabel[b.preferred_language] ?? b.preferred_language}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{b.email}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main ──

interface SlotsClientProps {
  slots: Slot[]
  bookingsBySlot: Record<string, SlotBooking[]>
  latestDateStr: string | null
  daysRemaining: number
  todayStr: string
  initialSlotId?: string
}

export function SlotsClient({ slots, bookingsBySlot, latestDateStr, daysRemaining, todayStr, initialSlotId }: SlotsClientProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>(() => {
    if (!initialSlotId) return 'this_week'
    const slot = slots.find((s) => s.id === initialSlotId)
    if (!slot) return 'this_week'
    const dateStr = getNZDate(slot.start_time)
    const week = getWeekRange(todayStr, 0)
    return dateStr >= week.start && dateStr <= week.end ? 'this_week' : 'all'
  })
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (initialSlotId) {
      const slot = slots.find((s) => s.id === initialSlotId)
      if (slot) return getMonthKey(slot.start_time)
    }
    return getMonthKey(new Date().toISOString())
  })
  const [selectedSlot, setSelectedSlot] = useState<{ slot: Slot; type: 'morning' | 'afternoon' } | null>(() => {
    if (!initialSlotId) return null
    const slot = slots.find((s) => s.id === initialSlotId)
    if (!slot) return null
    return { slot, type: isSlotMorning(slot.start_time) ? 'morning' : 'afternoon' }
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isGenerating, startGenerating] = useTransition()
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const allMonths = [...new Set(slots.map(s => getMonthKey(s.start_time)))].sort()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3000)
  }

  const handleGenerate = () => {
    startGenerating(async () => {
      const result = await generateSlots()
      if (result.error) showToast(`生成失敗：${result.error}`, 'error')
      else if (result.created === 0) showToast('已是最新，無需生成', 'success')
      else showToast(`成功生成 ${result.created} 個場次`, 'success')
    })
  }

  const handleToggle = async (slotId: string, newAvailability: boolean) => {
    setTogglingId(slotId)
    const result = await toggleSlot(slotId, newAvailability)
    if (!result.success) showToast(result.error ?? '操作失敗', 'error')
    setTogglingId(null)
  }

  const handleSelectSlot = (slot: Slot, type: 'morning' | 'afternoon') => {
    setSelectedSlot(selectedSlot?.slot.id === slot.id ? null : { slot, type })
  }

  const slotMap = new Map<string, { morning?: Slot; afternoon?: Slot }>()
  for (const slot of slots) {
    const dateStr = getNZDate(slot.start_time)
    const existing = slotMap.get(dateStr) ?? {}
    if (isSlotMorning(slot.start_time)) existing.morning = slot
    else existing.afternoon = slot
    slotMap.set(dateStr, existing)
  }

  const calendarDays = buildCalendarDays(currentMonth, slotMap, todayStr)

  const thisWeek = getWeekRange(todayStr, 0)
  const filteredSlots = slots.filter((slot) => {
    const dateStr = getNZDate(slot.start_time)
    switch (activeTab) {
      case 'this_week': return dateStr >= thisWeek.start && dateStr <= thisWeek.end
      case 'disabled': return !slot.is_available
      default: return true
    }
  })

  const grouped: { weekLabel: string; slots: Slot[] }[] = []
  let currentWeekLabel = ''
  for (const slot of filteredSlots) {
    const dateStr = getNZDate(slot.start_time)
    const wl = getWeekLabel(dateStr, todayStr)
    if (wl !== currentWeekLabel) { grouped.push({ weekLabel: wl, slots: [] }); currentWeekLabel = wl }
    grouped[grouped.length - 1].slots.push(slot)
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'this_week', label: '本週' },
    { key: 'all',       label: '全部' },
    { key: 'disabled',  label: '已停用' },
  ]

  const formatLatestDate = (ds: string) => { const d = new Date(`${ds}T12:00:00`); return `${d.getMonth() + 1}月${d.getDate()}日` }
  const weekdayHeaders = ['一', '二', '三', '四', '五', '六', '日']
  const isUpToDate = daysRemaining <= 0

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
      <div className="mb-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">場次管理</p>
        <h1 className="font-serif text-3xl font-semibold text-foreground">時間段管理</h1>
      </div>

      {/* Generation Banner */}
      <div className={`mb-6 flex items-center justify-between rounded-2xl border px-5 py-4 ${
        isUpToDate ? 'border-bamboo-green/20 bg-bamboo-green/5' : 'border-border bg-off-white'
      }`}>
        <p className="text-sm text-foreground">
          {isUpToDate
            ? `已生成至 ${latestDateStr ? formatLatestDate(latestDateStr) : '—'}，未來 30 天場次齊全`
            : latestDateStr
              ? `目前已生成至 ${formatLatestDate(latestDateStr)} · 還差 ${daysRemaining} 天未生成`
              : '尚未生成任何場次'}
          {!isUpToDate && <span className="ml-2 text-muted-foreground">（一鍵生成從今天起未來 30 天的場次）</span>}
        </p>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || isUpToDate}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50 ${
            isUpToDate
              ? 'border border-bamboo-green/20 bg-bamboo-green/10 text-bamboo-green'
              : 'bg-tea-brown text-primary-foreground hover:opacity-90'
          }`}
        >
          {isGenerating ? '生成中...' : isUpToDate ? '已是最新' : '一鍵生成'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedSlot(null) }}
              className={`rounded-lg px-3.5 py-1.5 text-sm transition-colors ${
                activeTab === tab.key
                  ? 'bg-tea-brown text-primary-foreground'
                  : 'border border-border bg-off-white text-muted-foreground hover:bg-cream hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === 'all' && (
          <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-tea-brown" /> 上午</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-bamboo-green" /> 下午</span>
          </div>
        )}
      </div>

      {/* ═══ Calendar View ═══ */}
      {activeTab === 'all' && (
        <div className="flex gap-6">
          <div className="min-w-0 flex-1">
            {allMonths.length > 0 && (
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={() => { const i = allMonths.indexOf(currentMonth); if (i > 0) setCurrentMonth(allMonths[i - 1]) }}
                  disabled={allMonths.indexOf(currentMonth) <= 0}
                  className="rounded-lg border border-border bg-off-white px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-cream disabled:opacity-30"
                >← 上月</button>
                <span className="font-serif text-base font-semibold text-foreground">{formatMonthLabel(currentMonth)}</span>
                <button
                  onClick={() => { const i = allMonths.indexOf(currentMonth); if (i < allMonths.length - 1) setCurrentMonth(allMonths[i + 1]) }}
                  disabled={allMonths.indexOf(currentMonth) >= allMonths.length - 1}
                  className="rounded-lg border border-border bg-off-white px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-cream disabled:opacity-30"
                >下月 →</button>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-border bg-off-white">
              <div className="grid grid-cols-7 border-b border-border bg-cream">
                {weekdayHeaders.map(d => (
                  <div key={d} className="py-2.5 text-center text-xs font-medium text-muted-foreground">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {calendarDays.map((day, i) => (
                  <div
                    key={day.dateStr + i}
                    className={`min-h-[80px] border-b border-r border-border p-1.5 transition-colors ${
                      !day.isCurrentMonth ? 'bg-cream/40' : ''
                    } ${day.isToday ? 'bg-tea-brown/5' : ''} ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}`}
                  >
                    <div className="mb-0.5">
                      <span className={`text-[11px] ${
                        day.isToday
                          ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-tea-brown font-semibold text-primary-foreground'
                          : day.isCurrentMonth ? 'font-medium text-foreground' : 'text-muted-foreground/30'
                      }`}>
                        {day.day}
                      </span>
                    </div>
                    {day.isCurrentMonth && (
                      <div className="space-y-0.5">
                        <SlotCell slot={day.morning} type="morning" isSelected={!!day.morning && selectedSlot?.slot.id === day.morning.id} onSelect={handleSelectSlot} />
                        <SlotCell slot={day.afternoon} type="afternoon" isSelected={!!day.afternoon && selectedSlot?.slot.id === day.afternoon.id} onSelect={handleSelectSlot} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-[280px] shrink-0">
            {/* Spacer to align detail panel top with the month nav row */}
            <div className="mb-4 h-[38px]" />
            <div className="sticky top-8 overflow-hidden rounded-2xl border border-border bg-off-white" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
              {selectedSlot ? (
                <DetailSidebar slot={selectedSlot.slot} type={selectedSlot.type} bookings={bookingsBySlot[selectedSlot.slot.id] ?? []} togglingId={togglingId} onToggle={handleToggle} />
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center p-6 text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cream">
                    <svg className="h-5 w-5 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">點擊日曆中的場次<br />查看詳情和預約資訊</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Table View + Sidebar ═══ */}
      {activeTab !== 'all' && (
        <div className="flex gap-6">
          <div className="min-w-0 flex-1">
            {filteredSlots.length === 0 ? (
              <div className="rounded-2xl border border-border bg-off-white py-12 text-center text-sm text-muted-foreground">暫無場次資料</div>
            ) : (
              <div className="space-y-4">
                {grouped.map((group) => (
                  <div key={group.weekLabel}>
                    <p className="mb-2 px-1 text-sm font-semibold text-foreground">{group.weekLabel}</p>
                    <div className="overflow-hidden rounded-2xl border border-border bg-off-white">
                      <div className="grid grid-cols-[1.4fr_1.1fr_1.6fr_1.1fr_0.9fr] items-center gap-2 border-b border-border bg-cream px-5 py-3 text-center">
                        {['日期', '時段', '容量', '狀態', '操作'].map(h => (
                          <span key={h} className="text-xs font-medium text-muted-foreground">{h}</span>
                        ))}
                      </div>
                      {group.slots.map((slot) => {
                        const status = getSlotStatus(slot)
                        const config = statusConfig[status]
                        const remaining = slot.max_guests - slot.booked_guests
                        const pct = (slot.booked_guests / slot.max_guests) * 100
                        const dateStr = getNZDate(slot.start_time)
                        const isMorning = isSlotMorning(slot.start_time)
                        const isActive = selectedSlot?.slot.id === slot.id
                        return (
                          <div
                            key={slot.id}
                            onClick={() => handleSelectSlot(slot, isMorning ? 'morning' : 'afternoon')}
                            className={`grid w-full cursor-pointer grid-cols-[1.4fr_1.1fr_1.6fr_1.1fr_0.9fr] items-center gap-2 border-b border-border px-5 py-3 text-center transition-colors last:border-b-0 ${
                              isActive ? 'bg-tea-brown/5' : 'hover:bg-cream'
                            }`}
                          >
                            <span className="text-sm text-foreground">{formatDateChinese(dateStr)}</span>
                            <span className="text-sm text-muted-foreground">{formatSlotTime(slot.start_time)}</span>
                            <div className="flex items-center justify-center gap-2.5">
                              <div className="h-1.5 w-20 rounded-full bg-border">
                                <div
                                  className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : isMorning ? 'bg-tea-brown' : 'bg-bamboo-green'}`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">{slot.booked_guests}/{slot.max_guests}</span>
                            </div>
                            <div className="flex justify-center">
                              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
                                {config.labelFn ? config.labelFn(remaining) : config.label}
                              </span>
                            </div>
                            <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleToggle(slot.id, !slot.is_available)}
                                disabled={togglingId === slot.id}
                                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                                  slot.is_available
                                    ? 'border border-border bg-off-white text-muted-foreground hover:bg-cream'
                                    : 'border border-bamboo-green/20 bg-bamboo-green/10 text-bamboo-green hover:bg-bamboo-green/20'
                                }`}
                              >
                                {togglingId === slot.id ? '...' : slot.is_available ? '停用' : '啟用'}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-[280px] shrink-0">
            {/* Spacer to align detail panel top with the week label row */}
            <div className="h-7" />
            <div className="sticky top-8 overflow-hidden rounded-2xl border border-border bg-off-white" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
              {selectedSlot ? (
                <DetailSidebar slot={selectedSlot.slot} type={selectedSlot.type} bookings={bookingsBySlot[selectedSlot.slot.id] ?? []} togglingId={togglingId} onToggle={handleToggle} />
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center p-6 text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cream">
                    <svg className="h-5 w-5 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">點擊左側場次<br />查看詳情和預約資訊</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
