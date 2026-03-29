'use client'

import { useState, useEffect, useTransition, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { getGalleryImages, uploadImage, updateCaption, deleteImage, setFeatured, reorderFeatured } from './_actions'
import type { Gallery } from '@/types'

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  )
}

function StarIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

const MAX_SIZE = 2 * 1024 * 1024 // 2MB — matches Supabase Storage limit
const MAX_DIMENSION = 2048

function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // GIF cannot be compressed via canvas without losing animation
    if (file.type === 'image/gif') {
      if (file.size <= MAX_SIZE) return resolve(file)
      return reject(new Error('GIF file too large'))
    }

    const img = new window.Image()
    img.onload = () => {
      let { width, height } = img

      // Scale down if exceeds max dimension
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      // Try progressively lower quality until under 2MB
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      let quality = 0.85

      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'))
            if (blob.size <= MAX_SIZE || quality <= 0.3) {
              const compressed = new File([blob], file.name, { type: outputType })
              resolve(compressed)
            } else {
              quality -= 0.1
              tryCompress()
            }
          },
          outputType,
          quality
        )
      }
      tryCompress()
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// Upload area component
function UploadArea({ onUpload, onError, uploading, t }: {
  onUpload: (file: File) => void
  onError: (msg: string) => void
  uploading: boolean
  t: ReturnType<typeof useTranslations<'admin.gallery'>>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      onError(t('errorInvalidType'))
      return
    }
    try {
      const compressed = await compressImage(file)
      onUpload(compressed)
    } catch {
      onError(t('errorTooLarge'))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onClick={() => fileInputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
        dragOver
          ? 'border-tea-brown bg-tea-brown/5'
          : 'border-border hover:border-tea-brown/50 hover:bg-cream/50'
      } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      {uploading ? (
        <p className="text-sm text-muted-foreground">{t('uploading')}</p>
      ) : (
        <>
          <PlusIcon className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">{t('dropHint')}</p>
          <p className="mt-1 text-xs text-muted-foreground/70">{t('formatHint')}</p>
        </>
      )}
    </div>
  )
}

// Caption edit modal
function CaptionModal({ image, onClose, onSave, t }: {
  image: Gallery
  onClose: () => void
  onSave: (caption: string) => void
  t: ReturnType<typeof useTranslations<'admin.gallery'>>
}) {
  const [caption, setCaption] = useState(image.caption ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    onSave(caption)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-off-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 font-serif text-lg font-semibold text-foreground">{t('editCaption')}</h3>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={t('captionPlaceholder')}
          className="w-full rounded-lg border border-border bg-off-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-tea-brown focus:outline-none"
          maxLength={200}
          autoFocus
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-cream transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-tea-brown px-4 py-2 text-sm text-white hover:bg-tea-brown/90 transition-colors disabled:opacity-50"
          >
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </div>
    </div>
  )
}

// Delete confirmation modal
function DeleteModal({ onClose, onConfirm, deleting, t }: {
  onClose: () => void
  onConfirm: () => void
  deleting: boolean
  t: ReturnType<typeof useTranslations<'admin.gallery'>>
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-lg bg-off-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">{t('deleteTitle')}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{t('deleteMessage')}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-cream transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? t('deleting') : t('confirmDelete')}
          </button>
        </div>
      </div>
    </div>
  )
}

// Featured strip — shows selected homepage images with ordering controls
function FeaturedStrip({
  featured,
  onMove,
  onRemove,
  t,
}: {
  featured: Gallery[]
  onMove: (id: string, direction: 'left' | 'right') => void
  onRemove: (id: string) => void
  t: ReturnType<typeof useTranslations<'admin.gallery'>>
}) {
  if (featured.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {t('featuredEmpty')}
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {featured.map((image, index) => (
        <div
          key={image.id}
          className="relative flex-shrink-0 w-28 rounded-lg border-2 border-tea-brown overflow-hidden bg-off-white"
        >
          <div className="aspect-square relative">
            <Image
              src={image.url}
              alt={image.caption ?? image.filename}
              fill
              className="object-cover"
              sizes="112px"
            />
            {/* Order badge */}
            <span className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-tea-brown text-[10px] font-bold text-white">
              {index + 1}
            </span>
            {/* Remove button */}
            <button
              onClick={() => onRemove(image.id)}
              className="absolute top-1 right-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70 transition-colors"
              title={t('unfeatured')}
            >
              <XIcon className="h-3 w-3" />
            </button>
          </div>
          {/* Move arrows */}
          <div className="flex items-center justify-center gap-1 py-1 bg-cream">
            <button
              onClick={() => onMove(image.id, 'left')}
              disabled={index === 0}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onMove(image.id, 'right')}
              disabled={index === featured.length - 1}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
            >
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
      {/* Empty slots */}
      {Array.from({ length: 6 - featured.length }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="flex-shrink-0 w-28 rounded-lg border-2 border-dashed border-border"
        >
          <div className="aspect-square flex items-center justify-center">
            <span className="text-xs text-muted-foreground/30">{featured.length + i + 1}</span>
          </div>
          <div className="py-1 bg-transparent"><div className="h-[22px]" /></div>
        </div>
      ))}
    </div>
  )
}

export default function GalleryPage() {
  const t = useTranslations('admin.gallery')
  const [images, setImages] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [captionTarget, setCaptionTarget] = useState<Gallery | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Gallery | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState('')
  const [, startTransition] = useTransition()

  const loadData = useCallback(() => {
    getGalleryImages().then((data) => {
      startTransition(() => {
        setImages(data)
        setLoading(false)
      })
    })
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const featured = images
    .filter((img) => img.featured_order !== null)
    .sort((a, b) => (a.featured_order ?? 0) - (b.featured_order ?? 0))

  const featuredIds = new Set(featured.map((img) => img.id))

  const handleUpload = async (file: File) => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const result = await uploadImage(formData)
    setUploading(false)
    if (result.success) {
      showToast(t('toastUploaded'))
      loadData()
    } else {
      showToast(result.error ?? t('toastError'))
    }
  }

  const handleCaptionSave = async (caption: string) => {
    if (!captionTarget) return
    const result = await updateCaption(captionTarget.id, caption || null)
    setCaptionTarget(null)
    if (result.success) {
      showToast(t('toastCaptionUpdated'))
      loadData()
    } else {
      showToast(result.error ?? t('toastError'))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteImage(deleteTarget.id, deleteTarget.filename)
    setDeleting(false)
    setDeleteTarget(null)
    if (result.success) {
      showToast(t('toastDeleted'))
      loadData()
    } else {
      showToast(result.error ?? t('toastError'))
    }
  }

  const handleToggleFeatured = async (image: Gallery) => {
    const isFeatured = image.featured_order !== null
    const result = await setFeatured(image.id, !isFeatured)
    if (result.success) {
      showToast(isFeatured ? t('toastUnfeatured') : t('toastFeatured'))
      loadData()
    } else if (result.error === 'MAX_FEATURED') {
      showToast(t('maxFeatured'))
    } else {
      showToast(result.error ?? t('toastError'))
    }
  }

  const handleMove = async (id: string, direction: 'left' | 'right') => {
    const idx = featured.findIndex((img) => img.id === id)
    if (idx < 0) return
    const swapIdx = direction === 'left' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= featured.length) return

    // Optimistic reorder
    const newOrder = [...featured]
    const temp = newOrder[idx]
    newOrder[idx] = newOrder[swapIdx]
    newOrder[swapIdx] = temp

    const orderedIds = newOrder.map((img) => img.id)
    const result = await reorderFeatured(orderedIds)
    if (result.success) {
      loadData()
    } else {
      showToast(t('toastError'))
    }
  }

  const handleRemoveFeatured = async (id: string) => {
    const result = await setFeatured(id, false)
    if (result.success) {
      showToast(t('toastUnfeatured'))
      loadData()
    } else {
      showToast(t('toastError'))
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('management')}
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-foreground">
          {t('title')}
        </h1>
      </div>

      {/* Featured section */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-foreground mb-2">
          {t('featuredTitle', { count: featured.length })}
        </h2>
        <p className="text-xs text-muted-foreground mb-3">{t('featuredHint')}</p>
        <FeaturedStrip
          featured={featured}
          onMove={handleMove}
          onRemove={handleRemoveFeatured}
          t={t}
        />
      </div>

      {/* Upload area */}
      <div className="mb-6">
        <UploadArea onUpload={handleUpload} onError={showToast} uploading={uploading} t={t} />
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-center text-sm text-muted-foreground py-12">{t('loading')}</p>
      )}

      {/* Empty */}
      {!loading && images.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">{t('noImages')}</p>
      )}

      {/* Image grid */}
      {!loading && images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {images.map((image) => {
            const isFeatured = featuredIds.has(image.id)
            return (
              <div key={image.id} className={`group relative overflow-hidden rounded-lg border bg-off-white ${isFeatured ? 'border-tea-brown ring-2 ring-tea-brown/20' : 'border-border'}`}>
                <div className="aspect-square relative">
                  <Image
                    src={image.url}
                    alt={image.caption ?? image.filename}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {/* Featured star */}
                  <button
                    onClick={() => handleToggleFeatured(image)}
                    className={`absolute top-1.5 left-1.5 z-10 rounded-full p-1 transition-all ${
                      isFeatured
                        ? 'text-yellow-400 bg-black/40 hover:bg-black/50'
                        : 'text-white/50 bg-black/20 opacity-0 group-hover:opacity-100 hover:text-yellow-400 hover:bg-black/40'
                    }`}
                    title={isFeatured ? t('unfeatured') : t('featured')}
                  >
                    <StarIcon className="h-4 w-4" filled={isFeatured} />
                  </button>
                  {/* Featured order badge */}
                  {isFeatured && image.featured_order !== null && (
                    <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-tea-brown text-[10px] font-bold text-white">
                      {image.featured_order}
                    </span>
                  )}
                  {/* Caption overlay at bottom */}
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4">
                      <p className="text-[10px] leading-tight text-white truncate">{image.caption}</p>
                    </div>
                  )}
                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-foreground/0 opacity-0 transition-all group-hover:bg-foreground/40 group-hover:opacity-100">
                    <button
                      onClick={() => setCaptionTarget(image)}
                      className="rounded-full bg-white/90 p-2 text-foreground shadow hover:bg-white transition-colors"
                      title={t('editCaption')}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(image)}
                      className="rounded-full bg-white/90 p-2 text-red-600 shadow hover:bg-white transition-colors"
                      title={t('confirmDelete')}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Caption modal */}
      {captionTarget && (
        <CaptionModal
          image={captionTarget}
          onClose={() => setCaptionTarget(null)}
          onSave={handleCaptionSave}
          t={t}
        />
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
          t={t}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-foreground px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
