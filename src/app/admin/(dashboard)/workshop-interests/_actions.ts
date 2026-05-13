'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWorkshopAvailabilityEmail } from '@/lib/resend/emails'
import type { WorkshopInterestRegistration } from '@/types'

async function verifyAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  if (!token || token !== process.env.ADMIN_SECRET_TOKEN) {
    throw new Error('Unauthorized')
  }
}

export type WorkshopInterestRow = Pick<
  WorkshopInterestRegistration,
  | 'id'
  | 'full_name'
  | 'email'
  | 'phone'
  | 'guest_count'
  | 'message'
  | 'preferred_language'
  | 'availability_notified_at'
  | 'created_at'
>

export async function sendWorkshopAvailabilityEmails(
  ids: string[]
): Promise<{ success: boolean; sentCount?: number; error?: string }> {
  try {
    await verifyAdminSession()

    const uniqueIds = [...new Set(ids.filter(Boolean))]
    if (uniqueIds.length === 0) {
      return { success: false, error: 'No recipients selected' }
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('workshop_interest_registrations')
      .select('id, full_name, email')
      .in('id', uniqueIds)

    if (error) {
      console.error('Failed to load workshop interests for email:', error)
      return { success: false, error: 'Failed to load selected recipients' }
    }

    const recipients = new Map<string, { id: string; full_name: string; email: string }>()
    for (const row of data ?? []) {
      const emailKey = row.email.trim().toLowerCase()
      if (!recipients.has(emailKey)) {
        recipients.set(emailKey, row)
      }
    }

    await Promise.all(
      [...recipients.values()].map((recipient) =>
        sendWorkshopAvailabilityEmail({
          customerName: recipient.full_name,
          email: recipient.email,
        })
      )
    )

    const { error: updateError } = await supabase
      .from('workshop_interest_registrations')
      .update({ availability_notified_at: new Date().toISOString() })
      .in(
        'id',
        (data ?? []).map((row) => row.id)
      )

    if (updateError) {
      console.error('Failed to update workshop interest notification timestamp:', updateError)
      return { success: false, error: 'Emails sent but failed to update notification status' }
    }

    revalidatePath('/admin/workshop-interests')
    revalidatePath('/admin')

    return { success: true, sentCount: recipients.size }
  } catch (error) {
    console.error('sendWorkshopAvailabilityEmails error:', error)
    return {
      success: false,
      error:
        error instanceof Error && error.message === 'Unauthorized'
          ? 'Unauthorized'
          : 'Failed to send emails',
    }
  }
}