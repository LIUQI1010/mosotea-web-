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

  // If slot_id provided, fetch that slot's date for calendar pre-navigation (no data filtering)
  let initialSlotDate: string | null = null
  if (params.slot_id) {
    const { data: slot } = await supabase
      .from('time_slots')
      .select('start_time')
      .eq('id', params.slot_id)
      .single()
    if (slot) {
      initialSlotDate = new Date(slot.start_time).toLocaleDateString('en-CA', { timeZone: NZ_TZ })
    }
  }

  const [bookingsResult, pendingResult] = await Promise.all([
    supabase
      .from('bookings')
      .select(
        'id, customer_name, email, phone, guest_count, special_requests, preferred_language, status, cancelled_by, created_at, time_slots!inner(id, start_time, end_time, max_guests, booked_guests)'
      )
      .order('created_at', { ascending: false }),
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
      initialSlotDate={initialSlotDate}
    />
  )
}
