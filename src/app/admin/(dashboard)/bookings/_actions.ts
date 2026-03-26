'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateCancellationToken } from '@/lib/token'
import { sendBookingConfirmation, sendCancellationConfirmation } from '@/lib/resend/emails'
import type { BookingWithTimeSlot } from '@/types'

// ── Helpers ──

function revalidateAdmin() {
  revalidatePath('/admin/bookings')
  revalidatePath('/admin/slots')
  revalidatePath('/admin')
}

// ── getBookings ──

export interface BookingFilters {
  status?: string
  date?: string        // YYYY-MM-DD
  search?: string
  slotId?: string
}

export interface BookingRow {
  id: string
  customer_name: string
  email: string
  phone: string
  guest_count: number
  special_requests: string | null
  preferred_language: string
  status: string
  cancelled_by: string | null
  created_at: string
  time_slots: {
    id: string
    start_time: string
    end_time: string
    max_guests: number
    booked_guests: number
  }
}

export async function getBookings(filters: BookingFilters): Promise<BookingRow[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from('bookings')
    .select(
      'id, customer_name, email, phone, guest_count, special_requests, preferred_language, status, cancelled_by, created_at, time_slots!inner(id, start_time, end_time, max_guests, booked_guests)'
    )
    .order('created_at', { ascending: false })

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.slotId) {
    query = query.eq('time_slot_id', filters.slotId)
  }

  if (filters.search) {
    const term = filters.search.replace(/%/g, '\\%')
    query = query.or(`customer_name.ilike.%${term}%,email.ilike.%${term}%`)
  }

  if (filters.date) {
    // Convert NZ date to UTC range (NZ is +12 NZST or +13 NZDT)
    const dayStartUTC = new Date(`${filters.date}T00:00:00+13:00`).toISOString()
    const dayEndUTC = new Date(`${filters.date}T23:59:59+12:00`).toISOString()
    query = query
      .gte('time_slots.start_time', dayStartUTC)
      .lt('time_slots.start_time', dayEndUTC)
  }

  const { data, error } = await query

  if (error) {
    console.error('getBookings error:', error)
    return []
  }

  const results = (data ?? []) as unknown as BookingRow[]

  return results
}

// ── confirmBooking ──

export async function confirmBooking(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  // Fetch booking + slot
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, time_slot_id, customer_name, email, phone, guest_count, special_requests, preferred_language, status, cancellation_token, cancellation_token_expires_at, cancelled_by, created_at, updated_at, time_slots(id, start_time, end_time, max_guests, booked_guests, is_available, created_at)')
    .eq('id', bookingId)
    .single()

  if (fetchError || !booking) {
    return { success: false, error: '預約不存在' }
  }

  if (booking.status !== 'pending') {
    return { success: false, error: '只能確認待確認狀態的預約' }
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Send confirmation email (non-blocking)
  try {
    const slot = Array.isArray(booking.time_slots)
      ? booking.time_slots[0]
      : booking.time_slots

    const bookingWithSlot: BookingWithTimeSlot = {
      ...booking,
      time_slot: slot,
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const localePrefix = booking.preferred_language === 'zh-TW' ? '/zh-TW' : ''
    const cancellationUrl = booking.cancellation_token
      ? `${appUrl}${localePrefix}/cancel/${booking.cancellation_token}`
      : ''

    await sendBookingConfirmation(bookingWithSlot, cancellationUrl)
  } catch (e) {
    console.error('Failed to send confirmation email:', e)
  }

  revalidateAdmin()
  return { success: true }
}

// ── createBooking ──

export interface CreateBookingData {
  timeSlotId: string
  customerName: string
  email: string
  phone: string
  guestCount: number
  specialRequests: string
  preferredLanguage: string
  sendEmail: boolean
}

export async function createBooking(
  data: CreateBookingData
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  // Check slot capacity
  const { data: slot, error: slotError } = await supabase
    .from('time_slots')
    .select('id, start_time, end_time, max_guests, booked_guests, is_available, created_at')
    .eq('id', data.timeSlotId)
    .single()

  if (slotError || !slot) {
    return { success: false, error: '場次不存在' }
  }

  if (!slot.is_available) {
    return { success: false, error: '該場次已停用' }
  }

  const remaining = slot.max_guests - slot.booked_guests
  if (data.guestCount > remaining) {
    return { success: false, error: `剩餘名額不足，目前僅剩 ${remaining} 位` }
  }

  // Insert booking as confirmed (admin-created)
  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      time_slot_id: data.timeSlotId,
      customer_name: data.customerName,
      email: data.email,
      phone: data.phone || '',
      guest_count: data.guestCount,
      special_requests: data.specialRequests || null,
      preferred_language: data.preferredLanguage,
      status: 'confirmed',
    })
    .select('id, preferred_language')
    .single()

  if (insertError) {
    if (insertError.message?.includes('capacity') || insertError.message?.includes('guests')) {
      return { success: false, error: '容量已滿，請選擇其他場次' }
    }
    return { success: false, error: insertError.message }
  }

  // Generate cancellation token
  const cancellationToken = generateCancellationToken(booking.id)
  await supabase
    .from('bookings')
    .update({
      cancellation_token: cancellationToken,
      cancellation_token_expires_at: slot.start_time,
    })
    .eq('id', booking.id)

  // Send email if requested
  if (data.sendEmail) {
    try {
      const bookingWithSlot: BookingWithTimeSlot = {
        id: booking.id,
        time_slot_id: data.timeSlotId,
        customer_name: data.customerName,
        email: data.email,
        phone: data.phone || '',
        guest_count: data.guestCount,
        special_requests: data.specialRequests || null,
        preferred_language: data.preferredLanguage as 'en' | 'zh-TW',
        status: 'confirmed',
        cancellation_token: cancellationToken,
        cancellation_token_expires_at: slot.start_time,
        cancelled_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        time_slot: slot as BookingWithTimeSlot['time_slot'],
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const localePrefix = data.preferredLanguage === 'zh-TW' ? '/zh-TW' : ''
      const cancellationUrl = `${appUrl}${localePrefix}/cancel/${cancellationToken}`

      await sendBookingConfirmation(bookingWithSlot, cancellationUrl)
    } catch (e) {
      console.error('Failed to send booking emails:', e)
    }
  }

  revalidateAdmin()
  return { success: true }
}

// ── updateBooking ──

export interface UpdateBookingData {
  guestCount: number
  specialRequests: string
  preferredLanguage: string
}

export async function updateBooking(
  bookingId: string,
  data: UpdateBookingData
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  // Fetch current booking + slot
  const { data: current, error: fetchError } = await supabase
    .from('bookings')
    .select('guest_count, time_slot_id, time_slots(max_guests, booked_guests)')
    .eq('id', bookingId)
    .single()

  if (fetchError || !current) {
    return { success: false, error: '預約不存在' }
  }

  // If guest count increased, check capacity
  if (data.guestCount > current.guest_count) {
    const slot = Array.isArray(current.time_slots)
      ? current.time_slots[0]
      : current.time_slots

    const diff = data.guestCount - current.guest_count
    const remaining = slot.max_guests - slot.booked_guests

    if (diff > remaining) {
      return { success: false, error: `剩餘名額不足，最多還可增加 ${remaining} 人` }
    }
  }

  const guestDiff = data.guestCount - current.guest_count

  // Update booking fields
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      guest_count: data.guestCount,
      special_requests: data.specialRequests || null,
      preferred_language: data.preferredLanguage,
    })
    .eq('id', bookingId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Update booked_guests on the slot if guest count changed
  // Re-fetch slot right before update to minimize race window
  if (guestDiff !== 0) {
    const { data: freshSlot } = await supabase
      .from('time_slots')
      .select('booked_guests')
      .eq('id', current.time_slot_id)
      .single()

    if (freshSlot) {
      const newBooked = Math.max(0, freshSlot.booked_guests + guestDiff)
      await supabase
        .from('time_slots')
        .update({ booked_guests: newBooked })
        .eq('id', current.time_slot_id)
    }
  }

  revalidateAdmin()
  return { success: true }
}

// ── cancelBooking ──

export async function cancelBooking(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, time_slot_id, customer_name, email, phone, guest_count, special_requests, preferred_language, status, cancellation_token, cancellation_token_expires_at, cancelled_by, created_at, updated_at, time_slots(id, start_time, end_time, max_guests, booked_guests, is_available, created_at)')
    .eq('id', bookingId)
    .single()

  if (fetchError || !booking) {
    return { success: false, error: '預約不存在' }
  }

  if (booking.status === 'cancelled') {
    return { success: false, error: '預約已取消' }
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_by: 'admin',
      cancellation_token: null,
    })
    .eq('id', bookingId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Send cancellation notification to customer (non-blocking)
  try {
    const slot = Array.isArray(booking.time_slots)
      ? booking.time_slots[0]
      : booking.time_slots

    const bookingWithSlot: BookingWithTimeSlot = {
      ...booking,
      status: 'cancelled',
      cancelled_by: 'admin',
      time_slot: slot,
    }

    await sendCancellationConfirmation(bookingWithSlot)
  } catch (e) {
    console.error('Failed to send cancellation email:', e)
  }

  revalidateAdmin()
  return { success: true }
}

// ── getAvailableSlots (for booking modal dropdown) ──

export interface AvailableSlot {
  id: string
  start_time: string
  end_time: string
  max_guests: number
  booked_guests: number
}

export async function getAvailableSlots(): Promise<AvailableSlot[]> {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data } = await supabase
    .from('time_slots')
    .select('id, start_time, end_time, max_guests, booked_guests')
    .eq('is_available', true)
    .gt('start_time', now)
    .lt('booked_guests', 8)
    .order('start_time', { ascending: true })

  return (data ?? []) as AvailableSlot[]
}
