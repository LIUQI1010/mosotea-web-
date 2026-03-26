'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import type { AvailableSlot } from '../_actions'

const NZ_TZ = 'Pacific/Auckland'

function formatSlotOption(slot: AvailableSlot): string {
  const date = new Date(slot.start_time)
  const dateStr = new Intl.DateTimeFormat('zh-CN', {
    timeZone: NZ_TZ,
    month: 'numeric',
    day: 'numeric',
  }).format(date)

  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: NZ_TZ,
      hour: '2-digit',
      hour12: false,
    }).format(date)
  )
  const timeRange = hour < 12 ? '10:00–11:30' : '14:00–15:30'
  const remaining = slot.max_guests - slot.booked_guests

  return `${dateStr} ${timeRange}（${remaining}位空位）`
}

interface BookingData {
  id: string
  customer_name: string
  email: string
  phone: string
  guest_count: number
  special_requests: string | null
  preferred_language: string
  time_slots: {
    id: string
    start_time: string
    end_time: string
    max_guests: number
    booked_guests: number
  }
}

interface BookingModalProps {
  open: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  booking?: BookingData | null
  availableSlots: AvailableSlot[]
  onSubmit: (data: {
    timeSlotId: string
    customerName: string
    email: string
    phone: string
    guestCount: number
    specialRequests: string
    preferredLanguage: string
    sendEmail: boolean
  }) => Promise<{ error?: string }>
}

const inputClass = 'w-full rounded-lg border border-border bg-cream px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-tea-brown focus:ring-2 focus:ring-tea-brown/20'
const labelClass = 'mb-1.5 block text-sm font-medium text-foreground'
const readonlyClass = 'rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground'

export function BookingModal({
  open,
  onClose,
  mode,
  booking,
  availableSlots,
  onSubmit,
}: BookingModalProps) {
  const [timeSlotId, setTimeSlotId] = useState(() =>
    mode === 'edit' && booking ? booking.time_slots.id : availableSlots[0]?.id ?? ''
  )
  const [customerName, setCustomerName] = useState(() =>
    mode === 'edit' && booking ? booking.customer_name : ''
  )
  const [email, setEmail] = useState(() =>
    mode === 'edit' && booking ? booking.email : ''
  )
  const [phone, setPhone] = useState(() =>
    mode === 'edit' && booking ? booking.phone : ''
  )
  const [guestCount, setGuestCount] = useState(() =>
    mode === 'edit' && booking ? booking.guest_count : 1
  )
  const [specialRequests, setSpecialRequests] = useState(() =>
    mode === 'edit' && booking ? (booking.special_requests ?? '') : ''
  )
  const [preferredLanguage, setPreferredLanguage] = useState(() =>
    mode === 'edit' && booking ? booking.preferred_language : 'en'
  )
  const [sendEmail, setSendEmail] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedSlot =
    mode === 'edit'
      ? booking?.time_slots
      : availableSlots.find((s) => s.id === timeSlotId)

  const maxAllowed = selectedSlot
    ? mode === 'edit' && booking
      ? selectedSlot.max_guests - selectedSlot.booked_guests + booking.guest_count
      : selectedSlot.max_guests - selectedSlot.booked_guests
    : 8

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await onSubmit({ timeSlotId, customerName, email, phone, guestCount, specialRequests, preferredLanguage, sendEmail })
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      onClose()
    }
  }

  const editSlotLabel = booking
    ? (() => {
        const date = new Date(booking.time_slots.start_time)
        const dateStr = new Intl.DateTimeFormat('zh-CN', { timeZone: NZ_TZ, month: 'numeric', day: 'numeric' }).format(date)
        const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: NZ_TZ, hour: '2-digit', hour12: false }).format(date))
        return `${dateStr} ${hour < 12 ? '10:00–11:30' : '14:00–15:30'}`
      })()
    : ''

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="font-serif text-lg font-semibold text-foreground">
        {mode === 'create' ? '新增預約' : '編輯預約'}
      </h2>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Slot */}
        <div>
          <label className={labelClass}>場次</label>
          {mode === 'create' ? (
            <select
              value={timeSlotId}
              onChange={(e) => { setTimeSlotId(e.target.value); setGuestCount(1) }}
              required
              className={inputClass}
            >
              <option value="" disabled>請選擇場次</option>
              {availableSlots.map((slot) => (
                <option key={slot.id} value={slot.id}>{formatSlotOption(slot)}</option>
              ))}
            </select>
          ) : (
            <div className={readonlyClass}>{editSlotLabel}</div>
          )}
        </div>

        {/* Customer name */}
        <div>
          <label className={labelClass}>客戶姓名</label>
          {mode === 'create' ? (
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className={inputClass} placeholder="請輸入姓名" />
          ) : (
            <div className={readonlyClass}>{customerName}</div>
          )}
        </div>

        {/* Guest count */}
        <div>
          <label className={labelClass}>人數</label>
          <input type="number" value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} min={1} max={maxAllowed} required className={inputClass} />
          <p className="mt-1 text-xs text-muted-foreground">最多 {maxAllowed} 人</p>
        </div>

        {/* Email — create only */}
        {mode === 'create' && (
          <div>
            <label className={labelClass}>電郵</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="customer@example.com" />
          </div>
        )}

        {/* Phone — create only */}
        {mode === 'create' && (
          <div>
            <label className={labelClass}>電話 <span className="font-normal text-muted-foreground">（選填）</span></label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="021 xxx xxxx" />
          </div>
        )}

        {/* Language */}
        <div>
          <label className={labelClass}>語言偏好</label>
          <select value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} className={inputClass}>
            <option value="en">English</option>
            <option value="zh-TW">繁體中文</option>
          </select>
        </div>

        {/* Special requests */}
        <div>
          <label className={labelClass}>特殊需求 <span className="font-normal text-muted-foreground">（選填）</span></label>
          <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
        </div>

        {/* Send email — create only */}
        {mode === 'create' && (
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="rounded border-border accent-tea-brown" />
            傳送確認電郵給客戶
          </label>
        )}

        {/* Error */}
        {error && (
          <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={loading} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-cream">
            取消
          </button>
          <button type="submit" disabled={loading} className="rounded-lg bg-tea-brown px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
            {loading ? '儲存中...' : mode === 'create' ? '儲存' : '儲存修改'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
