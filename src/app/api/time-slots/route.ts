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

        // Convert NZ date to UTC range
        // NZ is UTC+12 (NZST) or UTC+13 (NZDT)
        // Use +12 for start and +13 for end to cover both DST states
        const startOfDayUTC = new Date(`${date}T00:00:00+13:00`).toISOString() // latest possible start
        const endOfDayUTC = new Date(`${date}T23:59:59+12:00`).toISOString()   // earliest possible end

        const { data: slots, error } = await supabase
            .from('time_slots')
            .select('id, start_time, end_time, max_guests, booked_guests, is_available')
            .gte('start_time', startOfDayUTC)
            .lte('start_time', endOfDayUTC)
            .eq('is_available', true)
            .order('start_time', { ascending: true })

        if (error) {
            return Response.json(
                { success: false, error: 'Failed to fetch time slots' },
                { status: 500 }
            )
        }

        // Filter out fully booked slots and slots starting within 2.5 hours
        const cutoff = new Date(Date.now() + 2.5 * 60 * 60 * 1000)
        const available = (slots || []).filter(
            (slot) => slot.booked_guests < slot.max_guests && new Date(slot.start_time) > cutoff
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
