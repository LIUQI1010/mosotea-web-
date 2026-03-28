'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Announcement } from '@/types'

function revalidate() {
  revalidatePath('/admin/announcements')
  revalidatePath('/', 'layout')
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data as Announcement[]
}

export async function createAnnouncement(formData: {
  title_en: string
  title_zh: string
  content_en: string
  content_zh: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  // Get max sort_order to append at end
  const { data: existing } = await supabase
    .from('announcements')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1

  const { error } = await supabase.from('announcements').insert({
    title_en: formData.title_en.trim(),
    title_zh: formData.title_zh.trim(),
    content_en: formData.content_en.trim(),
    content_zh: formData.content_zh.trim(),
    is_active: true,
    sort_order: nextOrder,
  })

  if (error) return { success: false, error: error.message }

  revalidate()
  return { success: true }
}

export async function updateAnnouncement(
  id: string,
  formData: {
    title_en: string
    title_zh: string
    content_en: string
    content_zh: string
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('announcements')
    .update({
      title_en: formData.title_en.trim(),
      title_zh: formData.title_zh.trim(),
      content_en: formData.content_en.trim(),
      content_zh: formData.content_zh.trim(),
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidate()
  return { success: true }
}

export async function toggleAnnouncement(
  id: string,
  is_active: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('announcements')
    .update({ is_active })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidate()
  return { success: true }
}

export async function deleteAnnouncement(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidate()
  return { success: true }
}

export async function reorderAnnouncements(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  // Update each announcement's sort_order based on position in array
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('announcements')
      .update({ sort_order: index + 1 })
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) return { success: false, error: failed.error.message }

  revalidate()
  return { success: true }
}
