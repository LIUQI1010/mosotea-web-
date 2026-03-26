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
  full: { label: '已满', className: 'bg-red-100 text-red-700 border border-red-200' },
  available: { label: '有空余', labelFn: (r) => `有空余（${r}位）`, className: 'bg-green-50 text-green-700 border border-green-200' },
  empty: { label: '空闲', className: 'bg-stone-50 text-stone-500 border border-stone-200' },
  disabled: { label: '已禁用', className: 'bg-red-100 text-red-600 border border-red-300' },
}

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
  return `${date.getMonth() + 1}月${date.getDate()}日 周${weekdays[date.getDay()]}`
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
  if (diffWeeks === 0) return `本周 ${range}`
  if (diffWeeks === 1) return `下周 ${range}`
  if (diffWeeks === -1) return `上周 ${range}`
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

// ── Calendar ──

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

// ── Slot cell (calendar) ──

function SlotCell({
  slot, type, isSelected, onSelect,
}: {
  slot: Slot | undefined; type: 'morning' | 'afternoon'; isSelected: boolean
  onSelect: (slot: Slot, type: 'morning' | 'afternoon') => void
}) {
  if (!slot) return <div className="h-6 rounded bg-stone-50" />

  const status = getSlotStatus(slot)
  const pct = (slot.booked_guests / slot.max_guests) * 100
  const colors = {
    morning: {
      bg: status === 'disabled' ? 'bg-red-100' : 'bg-blue-50',
      bar: pct >= 100 ? 'bg-red-400' : 'bg-blue-400',
      text: status === 'disabled' ? 'text-red-400' : 'text-blue-700',
      border: status === 'disabled' ? 'border-red-300' : isSelected ? 'border-blue-500' : 'border-blue-200',
      ring: isSelected ? 'ring-1 ring-blue-400' : '',
    },
    afternoon: {
      bg: status === 'disabled' ? 'bg-red-100' : 'bg-orange-50',
      bar: pct >= 100 ? 'bg-red-400' : 'bg-orange-400',
      text: status === 'disabled' ? 'text-red-400' : 'text-orange-700',
      border: status === 'disabled' ? 'border-red-300' : isSelected ? 'border-orange-500' : 'border-orange-200',
      ring: isSelected ? 'ring-1 ring-orange-400' : '',
    },
  }[type]

  return (
    <button
      onClick={() => onSelect(slot, type)}
      className={`relative h-6 w-full rounded border ${colors.bg} ${colors.border} ${colors.ring} flex items-center gap-0.5 px-1 transition-all hover:opacity-80`}
    >
      <div className="absolute inset-0 overflow-hidden rounded">
        <div className={`h-full ${colors.bar} opacity-15`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className={`relative z-10 text-[9px] font-medium ${colors.text}`}>
        {type === 'morning' ? '午前' : '午后'}
      </span>
      <span className={`relative z-10 ml-auto text-[9px] ${colors.text}`}>
        {slot.booked_guests}/{slot.max_guests}
      </span>
    </button>
  )
}

// ── Detail Sidebar ──

const langLabel: Record<string, string> = { en: 'EN', 'zh-TW': '中' }
const bookingStatusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: '待确认', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  confirmed: { label: '已确认', className: 'bg-green-50 text-green-700 border border-green-200' },
}

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
  const accentColor = type === 'morning' ? 'bg-blue-400' : 'bg-orange-400'

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-[#E8E0D8] p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`h-2.5 w-2.5 rounded-sm ${accentColor}`} />
          <span className="text-sm font-medium text-[#3D3D3D]">
            {formatDateChinese(dateStr)}
          </span>
        </div>
        <p className="text-lg font-medium text-[#3D3D3D]">
          {type === 'morning' ? '10:00 – 11:30' : '14:00 – 15:30'}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
            {cfg.labelFn ? cfg.labelFn(remaining) : cfg.label}
          </span>
          <span className="text-xs text-[#6B6B6B]">
            {slot.booked_guests}/{slot.max_guests} 已预约
          </span>
        </div>

        {/* Capacity bar */}
        <div className="mt-3 h-2 w-full rounded-full bg-stone-100">
          <div
            className={`h-full rounded-full transition-all ${
              slot.booked_guests >= slot.max_guests ? 'bg-red-400' : accentColor
            }`}
            style={{ width: `${Math.min((slot.booked_guests / slot.max_guests) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-b border-[#E8E0D8] p-4">
        <Link
          href={`/admin/bookings?slot_id=${slot.id}`}
          className="flex-1 rounded-lg border border-[#E8E0D8] bg-white py-1.5 text-center text-xs font-medium text-[#3D3D3D] hover:bg-stone-50"
        >
          查看全部预约
        </Link>
        <button
          onClick={() => onToggle(slot.id, !slot.is_available)}
          disabled={togglingId === slot.id}
          className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
            slot.is_available
              ? 'bg-stone-100 text-[#6B6B6B] hover:bg-stone-200'
              : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
          }`}
        >
          {togglingId === slot.id ? '...' : slot.is_available ? '禁用此场次' : '启用此场次'}
        </button>
      </div>

      {/* Booking list */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-xs font-medium text-[#6B6B6B]">
          预约列表（{bookings.length}）
        </p>
        {bookings.length === 0 ? (
          <p className="py-6 text-center text-xs text-[#6B6B6B]">暂无预约</p>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => {
              const bCfg = bookingStatusConfig[b.status] ?? bookingStatusConfig.pending
              return (
                <div key={b.id} className="rounded-xl border border-[#E8E0D8] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#3D3D3D]">{b.customer_name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${bCfg.className}`}>
                      {bCfg.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#6B6B6B]">
                    {b.guest_count}人 · {langLabel[b.preferred_language] ?? b.preferred_language}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#6B6B6B]">{b.email}</p>
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
}

export function SlotsClient({ slots, bookingsBySlot, latestDateStr, daysRemaining, todayStr }: SlotsClientProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('this_week')
  const [currentMonth, setCurrentMonth] = useState(() => getMonthKey(new Date().toISOString()))
  const [selectedSlot, setSelectedSlot] = useState<{ slot: Slot; type: 'morning' | 'afternoon' } | null>(null)
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
      if (result.error) showToast(`生成失败：${result.error}`, 'error')
      else if (result.created === 0) showToast('已是最新，无需生成', 'success')
      else showToast(`成功生成 ${result.created} 个场次`, 'success')
    })
  }

  const handleToggle = async (slotId: string, newAvailability: boolean) => {
    setTogglingId(slotId)
    const result = await toggleSlot(slotId, newAvailability)
    if (!result.success) showToast(result.error ?? '操作失败', 'error')
    setTogglingId(null)
  }

  const handleSelectSlot = (slot: Slot, type: 'morning' | 'afternoon') => {
    if (selectedSlot?.slot.id === slot.id) {
      setSelectedSlot(null)
    } else {
      setSelectedSlot({ slot, type })
    }
  }

  // Slot map for calendar
  const slotMap = new Map<string, { morning?: Slot; afternoon?: Slot }>()
  for (const slot of slots) {
    const dateStr = getNZDate(slot.start_time)
    const existing = slotMap.get(dateStr) ?? {}
    if (isSlotMorning(slot.start_time)) existing.morning = slot
    else existing.afternoon = slot
    slotMap.set(dateStr, existing)
  }

  const calendarDays = buildCalendarDays(currentMonth, slotMap, todayStr)

  // Table view filters
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
    { key: 'this_week', label: '本周' },
    { key: 'all', label: '全部' },
    { key: 'disabled', label: '已禁用' },
  ]

  const formatLatestDate = (ds: string) => { const d = new Date(`${ds}T12:00:00`); return `${d.getMonth() + 1}月${d.getDate()}日` }
  const weekdayHeaders = ['一', '二', '三', '四', '五', '六', '日']

  return (
    <div>
      {/* Topbar */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#3D3D3D]">时间段管理</h1>
      </div>

      {/* Generation Banner */}
      <div className={`mb-6 flex items-center justify-between rounded-2xl border px-5 py-4 ${
        daysRemaining > 0 ? 'border-[#E8E0D8] bg-[#FDF6F0]' : 'border-green-200 bg-green-50'
      }`}>
        <p className="text-sm text-[#3D3D3D]">
          {daysRemaining > 0
            ? latestDateStr ? `当前已生成至 ${formatLatestDate(latestDateStr)} · 还差 ${daysRemaining} 天未生成` : '尚未生成任何场次'
            : `✓ 已生成至 ${latestDateStr ? formatLatestDate(latestDateStr) : '—'}，未来 30 天场次齐全`}
          {daysRemaining > 0 && <span className="ml-2 text-[#6B6B6B]">（一键生成从今天起未来 30 天的场次）</span>}
        </p>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || daysRemaining <= 0}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50 ${
            daysRemaining > 0 ? 'bg-[#7C5C3E] text-[#FDF6F0] hover:opacity-90' : 'bg-green-100 text-green-700'
          }`}
        >
          {isGenerating ? '生成中...' : daysRemaining > 0 ? '一键生成' : '已是最新'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed right-8 top-8 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedSlot(null) }}
              className={`rounded-lg px-3.5 py-1.5 text-sm transition-colors ${
                activeTab === tab.key ? 'bg-[#7C5C3E] text-[#FDF6F0]' : 'bg-white text-[#6B6B6B] border border-[#E8E0D8] hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === 'all' && (
          <div className="ml-auto flex items-center gap-3 text-xs text-[#6B6B6B]">
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-400" /> 上午</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-orange-400" /> 下午</span>
          </div>
        )}
      </div>

      {/* ═══ Calendar View ═══ */}
      {activeTab === 'all' && (
        <div className="flex gap-6">
          {/* Left: Calendar */}
          <div className="min-w-0 flex-1">
            {/* Month Nav */}
            {allMonths.length > 0 && (
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={() => { const i = allMonths.indexOf(currentMonth); if (i > 0) setCurrentMonth(allMonths[i - 1]) }}
                  disabled={allMonths.indexOf(currentMonth) <= 0}
                  className="rounded-lg border border-[#E8E0D8] bg-white px-3 py-1.5 text-sm text-[#6B6B6B] hover:bg-stone-50 disabled:opacity-30"
                >← 上月</button>
                <span className="text-sm font-medium text-[#3D3D3D]">{formatMonthLabel(currentMonth)}</span>
                <button
                  onClick={() => { const i = allMonths.indexOf(currentMonth); if (i < allMonths.length - 1) setCurrentMonth(allMonths[i + 1]) }}
                  disabled={allMonths.indexOf(currentMonth) >= allMonths.length - 1}
                  className="rounded-lg border border-[#E8E0D8] bg-white px-3 py-1.5 text-sm text-[#6B6B6B] hover:bg-stone-50 disabled:opacity-30"
                >下月 →</button>
              </div>
            )}

            {/* Grid */}
            <div className="rounded-2xl border border-[#E8E0D8] bg-white overflow-hidden">
              <div className="grid grid-cols-7 border-b border-[#E8E0D8] bg-stone-50/50">
                {weekdayHeaders.map(d => (
                  <div key={d} className="py-2 text-center text-xs font-medium text-[#6B6B6B]">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {calendarDays.map((day, i) => (
                  <div
                    key={day.dateStr + i}
                    className={`min-h-[80px] border-b border-r border-[#E8E0D8] p-1 transition-colors ${
                      !day.isCurrentMonth ? 'bg-stone-50/40' : ''
                    } ${day.isToday ? 'bg-amber-50/40' : ''} ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}`}
                  >
                    <div className="mb-0.5">
                      <span className={`text-[11px] ${
                        day.isToday
                          ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#7C5C3E] font-medium text-white'
                          : day.isCurrentMonth ? 'font-medium text-[#3D3D3D]' : 'text-stone-300'
                      }`}>
                        {day.day}
                      </span>
                    </div>
                    {day.isCurrentMonth && (
                      <div className="space-y-0.5">
                        <SlotCell
                          slot={day.morning}
                          type="morning"
                          isSelected={!!day.morning && selectedSlot?.slot.id === day.morning.id}
                          onSelect={handleSelectSlot}
                        />
                        <SlotCell
                          slot={day.afternoon}
                          type="afternoon"
                          isSelected={!!day.afternoon && selectedSlot?.slot.id === day.afternoon.id}
                          onSelect={handleSelectSlot}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Detail Sidebar */}
          <div className="w-[280px] shrink-0">
            <div className="sticky top-8 rounded-2xl border border-[#E8E0D8] bg-white overflow-hidden" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
              {selectedSlot ? (
                <DetailSidebar
                  slot={selectedSlot.slot}
                  type={selectedSlot.type}
                  bookings={bookingsBySlot[selectedSlot.slot.id] ?? []}
                  togglingId={togglingId}
                  onToggle={handleToggle}
                />
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center p-6 text-center">
                  <div className="mb-3 text-3xl text-stone-200">📅</div>
                  <p className="text-sm text-[#6B6B6B]">点击日历中的场次<br />查看详情和预约信息</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Table View + Sidebar ═══ */}
      {activeTab !== 'all' && (
        <div className="flex gap-6">
          {/* Left: Table */}
          <div className="min-w-0 flex-1 rounded-2xl border border-[#E8E0D8] bg-white">
            <div className="grid grid-cols-[140px_120px_150px_90px] gap-2 border-b border-[#E8E0D8] px-5 py-3">
              <span className="text-xs font-medium text-[#6B6B6B]">日期</span>
              <span className="text-xs font-medium text-[#6B6B6B]">时段</span>
              <span className="text-xs font-medium text-[#6B6B6B]">容量</span>
              <span className="text-xs font-medium text-[#6B6B6B]">状态</span>
            </div>
            {filteredSlots.length === 0 ? (
              <p className="py-12 text-center text-sm text-[#6B6B6B]">暂无场次数据</p>
            ) : (
              grouped.map((group) => (
                <div key={group.weekLabel}>
                  <div className="border-b border-[#E8E0D8] bg-stone-50/50 px-5 py-2">
                    <span className="text-xs font-medium text-[#6B6B6B]">{group.weekLabel}</span>
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
                      <button
                        key={slot.id}
                        onClick={() => handleSelectSlot(slot, isMorning ? 'morning' : 'afternoon')}
                        className={`grid w-full grid-cols-[140px_120px_150px_90px] gap-2 border-b border-[#E8E0D8] px-5 py-3 text-left transition-colors last:border-b-0 ${
                          isActive ? 'bg-[#FDF6F0]' : 'hover:bg-stone-50/50'
                        }`}
                      >
                        <span className="text-sm text-[#3D3D3D]">{formatDateChinese(dateStr)}</span>
                        <span className="text-sm text-[#6B6B6B]">{formatSlotTime(slot.start_time)}</span>
                        <div className="flex items-center gap-2.5">
                          <div className="h-1.5 w-20 rounded-full bg-stone-100">
                            <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : 'bg-[#5C7A5C]'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className="text-xs text-[#6B6B6B]">{slot.booked_guests}/{slot.max_guests}</span>
                        </div>
                        <div>
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
                            {config.labelFn ? config.labelFn(remaining) : config.label}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Right: Detail Sidebar */}
          <div className="w-[280px] shrink-0">
            <div className="sticky top-8 rounded-2xl border border-[#E8E0D8] bg-white overflow-hidden" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
              {selectedSlot ? (
                <DetailSidebar
                  slot={selectedSlot.slot}
                  type={selectedSlot.type}
                  bookings={bookingsBySlot[selectedSlot.slot.id] ?? []}
                  togglingId={togglingId}
                  onToggle={handleToggle}
                />
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center p-6 text-center">
                  <div className="mb-3 text-3xl text-stone-200">📋</div>
                  <p className="text-sm text-[#6B6B6B]">点击左侧场次<br />查看详情和预约信息</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
