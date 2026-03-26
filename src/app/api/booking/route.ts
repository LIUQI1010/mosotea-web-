import { z } from 'zod/v4'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateCancellationToken } from '@/lib/token'
import { sendBookingReceived, sendBookingNotification } from '@/lib/resend/emails'
import type { BookingWithTimeSlot } from '@/types'

const bookingSchema = z.object({
    timeSlotId: z.string().uuid('Invalid time slot'),
    fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(30, 'Name must be 30 characters or fewer').regex(
        /^[a-zA-Z\u4e00-\u9fff\s\-']+$/,
        'Name may only contain English or Chinese characters'
    ),
    email: z.string().trim().max(100, 'Email must be 100 characters or fewer').email('Invalid email address'),
    phone: z.string().trim().min(1, 'Phone number is required').max(20, 'Phone number must be 20 characters or fewer').refine(
        (val) => {
            const digits = val.replace(/[\s\-().+]/g, '')
            return /^\d{7,15}$/.test(digits)
        },
        { message: 'Invalid phone number' }
    ),
    guests: z.number().int().min(1).max(8, 'Maximum 8 guests'),
    specialRequests: z.string().max(200, 'Special requests must be 200 characters or fewer').optional().default(''),
    preferredLanguage: z.enum(['en', 'zh']),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const result = bookingSchema.safeParse(body)

        if (!result.success) {
            return Response.json(
                { success: false, error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const { timeSlotId, fullName, email, phone, guests, specialRequests, preferredLanguage } = result.data
        const supabase = createAdminClient()

        // 1. Check the time slot exists and has capacity
        const { data: slot, error: slotError } = await supabase
            .from('time_slots')
            .select('id, start_time, end_time, max_guests, booked_guests, is_available, created_at')
            .eq('id', timeSlotId)
            .single()

        if (slotError || !slot) {
            return Response.json(
                { success: false, error: 'Time slot not found' },
                { status: 404 }
            )
        }

        if (!slot.is_available) {
            return Response.json(
                { success: false, error: 'This time slot is no longer available' },
                { status: 400 }
            )
        }

        if (slot.booked_guests + guests > slot.max_guests) {
            return Response.json(
                { success: false, error: `Only ${slot.max_guests - slot.booked_guests} spots remaining for this time slot` },
                { status: 400 }
            )
        }

        // Check the slot is in the future
        if (new Date(slot.start_time) <= new Date()) {
            return Response.json(
                { success: false, error: 'Cannot book a time slot in the past' },
                { status: 400 }
            )
        }

        // 2. Map preferred language: frontend sends "zh", database stores "zh-TW"
        const dbLanguage = preferredLanguage === 'zh' ? 'zh-TW' : 'en'

        // 3. Insert booking (trigger will update booked_guests)
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                time_slot_id: timeSlotId,
                customer_name: fullName,
                email: email,
                phone: phone,
                guest_count: guests,
                special_requests: specialRequests || null,
                preferred_language: dbLanguage,
                status: 'pending',
            })
            .select('id, preferred_language')
            .single()

        if (bookingError) {
            console.error('Booking insert error:', bookingError)
            // The trigger may reject if capacity exceeded (race condition safety)
            if (bookingError.message?.includes('capacity') || bookingError.message?.includes('guests')) {
                return Response.json(
                    { success: false, error: 'This time slot is now fully booked. Please choose another slot.' },
                    { status: 400 }
                )
            }
            return Response.json(
                { success: false, error: 'Failed to create booking' },
                { status: 500 }
            )
        }

        // 4. Generate cancellation token and update booking
        const cancellationToken = generateCancellationToken(booking.id)
        const tokenExpiresAt = slot.start_time // Token expires when the session starts

        const { error: tokenError } = await supabase
            .from('bookings')
            .update({
                cancellation_token: cancellationToken,
                cancellation_token_expires_at: tokenExpiresAt,
            })
            .eq('id', booking.id)

        if (tokenError) {
            console.error('Failed to set cancellation token:', tokenError)
        }

        // 5. Build booking with time slot for email templates
        const bookingWithSlot: BookingWithTimeSlot = {
            id: booking.id,
            time_slot_id: timeSlotId,
            customer_name: fullName,
            email,
            phone,
            guest_count: guests,
            special_requests: specialRequests || null,
            preferred_language: dbLanguage,
            status: 'pending',
            cancellation_token: cancellationToken,
            cancellation_token_expires_at: tokenExpiresAt,
            cancelled_by: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            time_slot: slot as BookingWithTimeSlot['time_slot'],
        }

        // 6. Send emails (non-blocking — don't fail the booking if email fails)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const localePrefix = dbLanguage === 'zh-TW' ? '/zh-TW' : ''
        const cancellationUrl = `${appUrl}${localePrefix}/cancel/${cancellationToken}`

        try {
            await Promise.all([
                sendBookingReceived(bookingWithSlot, cancellationUrl),
                sendBookingNotification(bookingWithSlot),
            ])
        } catch (emailError) {
            console.error('Failed to send booking emails:', emailError)
        }

        return Response.json({
            success: true,
            data: { bookingId: booking.id },
        })
    } catch (err) {
        console.error('Booking route unexpected error:', err)
        return Response.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
