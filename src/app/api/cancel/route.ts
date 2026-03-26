import { createAdminClient } from '@/lib/supabase/admin'
import { sendCancellationConfirmation, sendCancellationNotice } from '@/lib/resend/emails'
import type { BookingWithTimeSlot } from '@/types'

// POST /api/cancel
// Body: { token: string }
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { token } = body

        if (!token || typeof token !== 'string') {
            return Response.json(
                { success: false, error: 'Cancellation token is required' },
                { status: 400 }
            )
        }

        const supabase = createAdminClient()

        // 1. Find booking by cancellation token
        const { data: booking, error: findError } = await supabase
            .from('bookings')
            .select('*, time_slot:time_slots(*)')
            .eq('cancellation_token', token)
            .single()

        if (findError || !booking) {
            return Response.json(
                { success: false, error: 'Invalid or expired cancellation link' },
                { status: 404 }
            )
        }

        // 2. Check booking is not already cancelled
        if (booking.status === 'cancelled') {
            return Response.json(
                { success: false, error: 'This booking has already been cancelled' },
                { status: 400 }
            )
        }

        // 3. Check token hasn't expired (expires at session start time)
        if (booking.cancellation_token_expires_at && new Date(booking.cancellation_token_expires_at) <= new Date()) {
            return Response.json(
                { success: false, error: 'This cancellation link has expired' },
                { status: 400 }
            )
        }

        // 4. Check 24-hour cutoff
        const startTime = new Date(booking.time_slot.start_time)
        const now = new Date()
        const hoursUntilSession = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursUntilSession < 24) {
            return Response.json(
                {
                    success: false,
                    error: 'Cancellations must be made at least 24 hours before the session. Please contact us directly.',
                    tooLate: true,
                },
                { status: 400 }
            )
        }

        // 5. Update booking status (trigger will release booked_guests)
        const { error: updateError } = await supabase
            .from('bookings')
            .update({
                status: 'cancelled',
                cancelled_by: 'customer',
                cancellation_token: null, // Invalidate token (single-use)
            })
            .eq('id', booking.id)

        if (updateError) {
            return Response.json(
                { success: false, error: 'Failed to cancel booking' },
                { status: 500 }
            )
        }

        // 6. Send cancellation emails (non-blocking)
        const bookingWithSlot: BookingWithTimeSlot = {
            id: booking.id,
            time_slot_id: booking.time_slot_id,
            customer_name: booking.customer_name,
            email: booking.email,
            phone: booking.phone,
            guest_count: booking.guest_count,
            special_requests: booking.special_requests,
            preferred_language: booking.preferred_language,
            status: 'cancelled',
            cancellation_token: null,
            cancellation_token_expires_at: booking.cancellation_token_expires_at,
            cancelled_by: 'customer',
            created_at: booking.created_at,
            updated_at: booking.updated_at,
            time_slot: booking.time_slot,
        }

        try {
            await Promise.all([
                sendCancellationConfirmation(bookingWithSlot),
                sendCancellationNotice(bookingWithSlot),
            ])
        } catch (emailError) {
            console.error('Failed to send cancellation emails:', emailError)
        }

        return Response.json({ success: true })
    } catch {
        return Response.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
