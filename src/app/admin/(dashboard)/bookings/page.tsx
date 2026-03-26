export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { BookingsClient } from './_components/BookingsClient'

const NZ_TZ = 'Pacific/Auckland'

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ slot_id?: string }>
}) {
  const params = await searchParams
  const supabase = createAdminClient()

  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: NZ_TZ })

  // Fetch all bookings with slot info
  let query = supabase
    .from('bookings')
    .select(
      'id, customer_name, email, phone, guest_count, special_requests, preferred_language, status, cancelled_by, created_at, time_slots!inner(id, start_time, end_time, max_guests, booked_guests)'
    )
    .order('created_at', { ascending: false })

  if (params.slot_id) {
    query = query.eq('time_slot_id', params.slot_id)
  }

  const [bookingsResult, pendingResult] = await Promise.all([
    query,
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ])

  return (
    <BookingsClient
      bookings={(bookingsResult.data ?? []) as unknown as import('./_actions').BookingRow[]}
      pendingCount={pendingResult.count ?? 0}
      todayStr={todayStr}
    />
  )
}
