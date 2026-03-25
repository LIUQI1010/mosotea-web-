import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/time-slots?date=2026-03-25
// Returns available time slots for a given date
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const date = searchParams.get('date')

        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return Response.json(
                { success: false, error: 'A valid date parameter is required (YYYY-MM-DD)' },
                { status: 400 }
            )
        }

        const supabase = createAdminClient()

        // Query time slots for the given date where there is still capacity
        const startOfDay = `${date}T00:00:00`
        const endOfDay = `${date}T23:59:59`

        const { data: slots, error } = await supabase
            .from('time_slots')
            .select('id, start_time, end_time, max_guests, booked_guests, is_available')
            .gte('start_time', startOfDay)
            .lte('start_time', endOfDay)
            .eq('is_available', true)
            .order('start_time', { ascending: true })

        if (error) {
            return Response.json(
                { success: false, error: 'Failed to fetch time slots' },
                { status: 500 }
            )
        }

        // Filter out fully booked slots
        const available = (slots || []).filter(
            (slot) => slot.booked_guests < slot.max_guests
        ).map((slot) => ({
            id: slot.id,
            start_time: slot.start_time,
            end_time: slot.end_time,
            remaining: slot.max_guests - slot.booked_guests,
        }))

        return Response.json({ success: true, data: available })
    } catch {
        return Response.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
