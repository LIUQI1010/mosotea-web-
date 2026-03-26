import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/cancel/lookup?token=xxx
// Returns booking details without performing cancellation
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')

        if (!token) {
            return Response.json(
                { success: false, error: 'Token is required' },
                { status: 400 }
            )
        }

        const supabase = createAdminClient()

        const { data: booking, error } = await supabase
            .from('bookings')
            .select('customer_name, guest_count, status, preferred_language, time_slot:time_slots(start_time)')
            .eq('cancellation_token', token)
            .single()

        if (error || !booking) {
            return Response.json(
                { success: false, error: 'invalid' },
                { status: 404 }
            )
        }

        if (booking.status === 'cancelled') {
            return Response.json(
                { success: false, error: 'already_cancelled' },
                { status: 400 }
            )
        }

        const timeSlot = booking.time_slot as unknown as { start_time: string }
        const startTime = new Date(timeSlot.start_time)
        const now = new Date()

        if (startTime <= now) {
            return Response.json(
                { success: false, error: 'expired' },
                { status: 400 }
            )
        }

        const hoursUntilSession = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

        return Response.json({
            success: true,
            data: {
                customerName: booking.customer_name,
                guestCount: booking.guest_count,
                startTime: timeSlot.start_time,
                status: booking.status,
                isCancellable: hoursUntilSession >= 24,
                preferredLanguage: booking.preferred_language,
            },
        })
    } catch {
        return Response.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
