'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Gallery } from '@/types'

function revalidate() {
  revalidatePath('/admin/gallery')
  revalidatePath('/', 'layout')
}

export async function getGalleryImages(): Promise<Gallery[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('uploaded_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as Gallery[]
}

export async function uploadImage(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const file = formData.get('file') as File | null
  const caption = (formData.get('caption') as string)?.trim() || null

  if (!file) return { success: false, error: 'No file provided' }
  if (caption && caption.length > 200) return { success: false, error: 'Caption must be 200 characters or less' }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Only JPEG, PNG, WebP, and GIF are allowed' }
  }

  // Validate file size (2MB max — matches Supabase Storage limit)
  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: 'File size must be under 2MB' }
  }

  const supabase = createAdminClient()

  // Generate unique filename
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  // Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(filename, file)

  if (uploadError) return { success: false, error: uploadError.message }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('gallery')
    .getPublicUrl(filename)

  // Insert metadata into gallery table
  const { error: insertError } = await supabase.from('gallery').insert({
    url: urlData.publicUrl,
    filename,
    caption,
  })

  if (insertError) {
    // Clean up uploaded file if DB insert fails
    await supabase.storage.from('gallery').remove([filename])
    return { success: false, error: insertError.message }
  }

  revalidate()
  return { success: true }
}

export async function updateCaption(
  id: string,
  caption: string | null
): Promise<{ success: boolean; error?: string }> {
  if (caption && caption.length > 200) {
    return { success: false, error: 'Caption must be 200 characters or less' }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('gallery')
    .update({ caption: caption?.trim() || null })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidate()
  return { success: true }
}

export async function deleteImage(
  id: string,
  filename: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  // Delete from Storage
  const { error: storageError } = await supabase.storage
    .from('gallery')
    .remove([filename])

  if (storageError) return { success: false, error: storageError.message }

  // Delete from database
  const { error: dbError } = await supabase
    .from('gallery')
    .delete()
    .eq('id', id)

  if (dbError) return { success: false, error: dbError.message }

  revalidate()
  return { success: true }
}
