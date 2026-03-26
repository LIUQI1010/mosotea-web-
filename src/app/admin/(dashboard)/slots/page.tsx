export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { SlotsClient } from './SlotsClient'

const NZ_TZ = 'Pacific/Auckland'

function toNZDateStr(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: NZ_TZ })
}

export interface SlotBooking {
  id: string
  customer_name: string
  email: string
  guest_count: number
  status: string
  preferred_language: string
}

export default async function AdminSlotsPage({
  searchParams,
}: {
  searchParams: Promise<{ slot_id?: string }>
}) {
  const { slot_id: initialSlotId } = await searchParams
  const supabase = createAdminClient()
  const todayStr = toNZDateStr(new Date())

  // Convert NZ "start of today" to UTC for correct filtering
  // NZ is UTC+12 (NZST) or UTC+13 (NZDT) — use +13 to get the earliest possible UTC
  const todayStartUTC = new Date(`${todayStr}T00:00:00+13:00`).toISOString()

  // Fetch all future + today slots
  const { data: slots } = await supabase
    .from('time_slots')
    .select('id, start_time, end_time, max_guests, booked_guests, is_available')
    .gte('start_time', todayStartUTC)
    .order('start_time', { ascending: true })

  // Fetch bookings for these slots (non-cancelled)
  const slotIds = (slots ?? []).map((s: { id: string }) => s.id)
  const bookingsBySlot: Record<string, SlotBooking[]> = {}

  if (slotIds.length > 0) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, customer_name, email, guest_count, status, preferred_language, time_slot_id')
      .in('time_slot_id', slotIds)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })

    for (const b of bookings ?? []) {
      const sid = (b as { time_slot_id: string }).time_slot_id
      if (!bookingsBySlot[sid]) bookingsBySlot[sid] = []
      bookingsBySlot[sid].push(b as SlotBooking)
    }
  }

  // Find latest slot date for the generation banner
  const { data: latestSlot } = await supabase
    .from('time_slots')
    .select('start_time')
    .order('start_time', { ascending: false })
    .limit(1)
    .single()

  // Calculate generation info — use date string arithmetic to avoid timezone double-conversion
  const [ty, tm, td] = todayStr.split('-').map(Number)
  const target30Str = new Date(Date.UTC(ty, tm - 1, td + 30)).toISOString().slice(0, 10)

  let latestDateStr: string | null = null
  let daysRemaining = 30

  if (latestSlot) {
    latestDateStr = toNZDateStr(new Date(latestSlot.start_time))
    const latestDate = new Date(`${latestDateStr}T12:00:00`)
    const targetDate = new Date(`${target30Str}T12:00:00`)
    const diffMs = targetDate.getTime() - latestDate.getTime()
    daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  }

  return (
    <SlotsClient
      slots={slots ?? []}
      bookingsBySlot={bookingsBySlot}
      latestDateStr={latestDateStr}
      daysRemaining={daysRemaining}
      todayStr={todayStr}
      initialSlotId={initialSlotId}
    />
  )
}
