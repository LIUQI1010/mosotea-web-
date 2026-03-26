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

  return `${dateStr} ${timeRange}（${remaining}位空余）`
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


  // Calculate max guests for selected slot
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

    const result = await onSubmit({
      timeSlotId,
      customerName,
      email,
      phone,
      guestCount,
      specialRequests,
      preferredLanguage,
      sendEmail,
    })

    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      onClose()
    }
  }

  // Format the read-only slot display for edit mode
  const editSlotLabel = booking
    ? (() => {
        const date = new Date(booking.time_slots.start_time)
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
        return `${dateStr} ${hour < 12 ? '10:00–11:30' : '14:00–15:30'}`
      })()
    : ''

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-medium text-[#3D3D3D]">
        {mode === 'create' ? '新增预约' : '编辑预约'}
      </h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Slot selection */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#3D3D3D]">
            场次
          </label>
          {mode === 'create' ? (
            <select
              value={timeSlotId}
              onChange={(e) => {
                setTimeSlotId(e.target.value)
                setGuestCount(1)
              }}
              required
              className="w-full rounded-lg border border-[#E8E0D8] bg-[#FAFAF8] px-3 py-2 text-sm text-[#3D3D3D] outline-none focus:border-[#7C5C3E] focus:ring-1 focus:ring-[#7C5C3E]"
            >
              <option value="" disabled>
                请选择场次
              </option>
              {availableSlots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {formatSlotOption(slot)}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-lg border border-[#E8E0D8] bg-stone-50 px-3 py-2 text-sm text-[#6B6B6B]">
              {editSlotLabel}
            </div>
          )}
        </div>

        {/* Customer name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#3D3D3D]">
            客户姓名
          </label>
          {mode === 'create' ? (
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="w-full rounded-lg border border-[#E8E0D8] bg-[#FAFAF8] px-3 py-2 text-sm text-[#3D3D3D] outline-none focus:border-[#7C5C3E] focus:ring-1 focus:ring-[#7C5C3E]"
              placeholder="请输入姓名"
            />
          ) : (
            <div className="rounded-lg border border-[#E8E0D8] bg-stone-50 px-3 py-2 text-sm text-[#6B6B6B]">
              {customerName}
            </div>
          )}
        </div>

        {/* Guest count */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#3D3D3D]">
            人数
          </label>
          <input
            type="number"
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            min={1}
            max={maxAllowed}
            required
            className="w-full rounded-lg border border-[#E8E0D8] bg-[#FAFAF8] px-3 py-2 text-sm text-[#3D3D3D] outline-none focus:border-[#7C5C3E] focus:ring-1 focus:ring-[#7C5C3E]"
          />
          <p className="mt-1 text-xs text-[#6B6B6B]">最多 {maxAllowed} 人</p>
        </div>

        {/* Email — only in create mode */}
        {mode === 'create' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#3D3D3D]">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[#E8E0D8] bg-[#FAFAF8] px-3 py-2 text-sm text-[#3D3D3D] outline-none focus:border-[#7C5C3E] focus:ring-1 focus:ring-[#7C5C3E]"
              placeholder="customer@example.com"
            />
          </div>
        )}

        {/* Phone — only in create mode */}
        {mode === 'create' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#3D3D3D]">
              电话 <span className="font-normal text-[#6B6B6B]">（选填）</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-[#E8E0D8] bg-[#FAFAF8] px-3 py-2 text-sm text-[#3D3D3D] outline-none focus:border-[#7C5C3E] focus:ring-1 focus:ring-[#7C5C3E]"
              placeholder="021 xxx xxxx"
            />
          </div>
        )}

        {/* Language */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#3D3D3D]">
            语言偏好
          </label>
          <select
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            className="w-full rounded-lg border border-[#E8E0D8] bg-[#FAFAF8] px-3 py-2 text-sm text-[#3D3D3D] outline-none focus:border-[#7C5C3E] focus:ring-1 focus:ring-[#7C5C3E]"
          >
            <option value="en">English</option>
            <option value="zh-TW">繁體中文</option>
          </select>
        </div>

        {/* Special requests */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#3D3D3D]">
            特殊需求 <span className="font-normal text-[#6B6B6B]">（选填）</span>
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-[#E8E0D8] bg-[#FAFAF8] px-3 py-2 text-sm text-[#3D3D3D] outline-none focus:border-[#7C5C3E] focus:ring-1 focus:ring-[#7C5C3E]"
          />
        </div>

        {/* Send email checkbox — create mode only */}
        {mode === 'create' && (
          <label className="flex items-center gap-2 text-sm text-[#3D3D3D]">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="rounded border-[#E8E0D8] accent-[#7C5C3E]"
            />
            发送确认邮件给客户
          </label>
        )}

        {/* Error */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-[#E8E0D8] px-4 py-2 text-sm text-[#6B6B6B] hover:bg-stone-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[#7C5C3E] px-4 py-2 text-sm font-medium text-[#FDF6F0] hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? '保存中...'
              : mode === 'create'
                ? '保存'
                : '保存修改'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
