export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { WorkshopInterestsClient } from './WorkshopInterestsClient'

const PAGE_SIZE = 10

export default async function AdminWorkshopInterestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? '1') || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = createAdminClient()

  const [countResult, rowsResult] = await Promise.all([
    supabase
      .from('workshop_interest_registrations')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('workshop_interest_registrations')
      .select('id, full_name, email, phone, guest_count, message, preferred_language, availability_notified_at, created_at')
      .order('created_at', { ascending: false })
      .range(from, to),
  ])

  return (
    <WorkshopInterestsClient
      rows={(rowsResult.data ?? []) as import('./_actions').WorkshopInterestRow[]}
      page={page}
      totalCount={countResult.count ?? 0}
    />
  )
}