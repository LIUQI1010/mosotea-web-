'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Announcement } from '@/types'
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
  reorderAnnouncements,
} from './_actions'

// ── Icons ──

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
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

function GripIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  )
}

// ── Sortable Item ──

function SortableAnnouncementItem({
  ann,
  index,
  onToggle,
  onEdit,
  onDelete,
  isPending,
  t,
}: {
  ann: Announcement
  index: number
  onToggle: (ann: Announcement) => void
  onEdit: (ann: Announcement) => void
  onDelete: (ann: Announcement) => void
  isPending: boolean
  t: ReturnType<typeof useTranslations<'admin.announcements'>>
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ann.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border bg-off-white p-5 transition-shadow ${
        ann.is_active ? 'border-bamboo-green/30' : 'border-border opacity-60'
      } ${isDragging ? 'shadow-lg ring-2 ring-tea-brown/20 z-10 relative' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab touch-none rounded p-1 text-muted-foreground/30 hover:text-muted-foreground hover:bg-cream active:cursor-grabbing transition-colors"
          aria-label={t('dragHint')}
        >
          <GripIcon className="h-5 w-5" />
        </button>

        {/* Order number */}
        <span className="flex-shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-tea-brown text-xs font-semibold text-white">
          {index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                ann.is_active
                  ? 'bg-bamboo-green/10 text-bamboo-green'
                  : 'bg-gray-100 text-muted-foreground'
              }`}
            >
              {ann.is_active ? t('active') : t('inactive')}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(ann.created_at).toLocaleDateString('en-CA')}
            </span>
          </div>

          {/* EN */}
          <div className="mb-2">
            <p className="text-sm font-medium text-foreground">{ann.title_en}</p>
            <p className="text-sm text-muted-foreground">{ann.content_en}</p>
          </div>

          {/* ZH */}
          <div>
            <p className="text-sm font-medium text-foreground">{ann.title_zh}</p>
            <p className="text-sm text-muted-foreground">{ann.content_zh}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onToggle(ann)}
            disabled={isPending}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              ann.is_active
                ? 'text-muted-foreground hover:bg-cream'
                : 'text-bamboo-green hover:bg-bamboo-green/10'
            }`}
          >
            {ann.is_active ? t('deactivate') : t('activate')}
          </button>
          <button
            onClick={() => onEdit(ann)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-cream hover:text-foreground transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(ann)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal ──

function AnnouncementModal({
  announcement,
  onClose,
  onSaved,
  t,
}: {
  announcement: Announcement | null
  onClose: () => void
  onSaved: () => void
  t: ReturnType<typeof useTranslations<'admin.announcements'>>
}) {
  const [titleEn, setTitleEn] = useState(() => announcement?.title_en ?? '')
  const [titleZh, setTitleZh] = useState(() => announcement?.title_zh ?? '')
  const [contentEn, setContentEn] = useState(() => announcement?.content_en ?? '')
  const [contentZh, setContentZh] = useState(() => announcement?.content_zh ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!announcement

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titleEn.trim() || !titleZh.trim() || !contentEn.trim() || !contentZh.trim()) {
      setError(t('errorRequired'))
      return
    }
    setSaving(true)
    setError('')

    const formData = {
      title_en: titleEn,
      title_zh: titleZh,
      content_en: contentEn,
      content_zh: contentZh,
    }

    const result = isEdit
      ? await updateAnnouncement(announcement.id, formData)
      : await createAnnouncement(formData)

    if (result.success) {
      onSaved()
      onClose()
    } else {
      setError(result.error ?? t('toastError'))
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-off-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-serif text-lg font-semibold text-foreground">
            {isEdit ? t('editTitle') : t('createTitle')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('titleEn')}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full rounded-lg border border-border bg-off-white px-3 py-2 text-sm focus:border-tea-brown focus:outline-none"
                placeholder={t('titleEnPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('titleZh')}
              </label>
              <input
                type="text"
                value={titleZh}
                onChange={(e) => setTitleZh(e.target.value)}
                className="w-full rounded-lg border border-border bg-off-white px-3 py-2 text-sm focus:border-tea-brown focus:outline-none"
                placeholder={t('titleZhPlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('contentEn')}
              </label>
              <textarea
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-off-white px-3 py-2 text-sm focus:border-tea-brown focus:outline-none resize-none"
                placeholder={t('contentEnPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('contentZh')}
              </label>
              <textarea
                value={contentZh}
                onChange={(e) => setContentZh(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-off-white px-3 py-2 text-sm focus:border-tea-brown focus:outline-none resize-none"
                placeholder={t('contentZhPlaceholder')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-cream transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-tea-brown px-4 py-2 text-sm text-white hover:bg-tea-brown/90 transition-colors disabled:opacity-50"
            >
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Delete Confirm Modal ──

function DeleteConfirmModal({
  announcement,
  onClose,
  onConfirm,
  t,
}: {
  announcement: Announcement
  onClose: () => void
  onConfirm: () => void
  t: ReturnType<typeof useTranslations<'admin.announcements'>>
}) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await onConfirm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl bg-off-white shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
          {t('deleteTitle')}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {t('deleteMessage', { title: announcement.title_en })}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-cream transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleDelete}
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

// ── Main Page ──

export default function AnnouncementsPage() {
  const t = useTranslations('admin.announcements')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Announcement | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null)
  const [toast, setToast] = useState('')
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const loadData = useCallback(() => {
    getAnnouncements().then((data) => {
      startTransition(() => {
        setAnnouncements(data)
        setLoading(false)
      })
    })
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = announcements.findIndex((a) => a.id === active.id)
    const newIndex = announcements.findIndex((a) => a.id === over.id)
    const updated = arrayMove(announcements, oldIndex, newIndex)
    setAnnouncements(updated)

    const orderedIds = updated.map((a) => a.id)
    startTransition(async () => {
      const result = await reorderAnnouncements(orderedIds)
      if (result.success) {
        showToast(t('toastReordered'))
      } else {
        showToast(t('toastError'))
        await loadData()
      }
    })
  }

  const handleToggle = (ann: Announcement) => {
    startTransition(async () => {
      const result = await toggleAnnouncement(ann.id, !ann.is_active)
      if (result.success) {
        await loadData()
        showToast(ann.is_active ? t('toastDeactivated') : t('toastActivated'))
      } else {
        showToast(t('toastError'))
      }
    })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await deleteAnnouncement(deleteTarget.id)
    if (result.success) {
      setDeleteTarget(null)
      await loadData()
      showToast(t('toastDeleted'))
    } else {
      showToast(t('toastError'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        {t('loading')}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{t('management')}</p>
          <h1 className="font-serif text-xl font-semibold text-foreground">{t('title')}</h1>
        </div>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true) }}
          className="flex items-center gap-1.5 rounded-lg bg-tea-brown px-4 py-2 text-sm text-white hover:bg-tea-brown/90 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          {t('newAnnouncement')}
        </button>
      </div>

      {/* Drag hint */}
      {announcements.length > 1 && (
        <p className="text-xs text-muted-foreground">{t('dragHint')}</p>
      )}

      {/* List */}
      {announcements.length === 0 ? (
        <div className="rounded-xl border border-border bg-off-white p-12 text-center text-muted-foreground">
          {t('noAnnouncements')}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={announcements.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {announcements.map((ann, index) => (
                <SortableAnnouncementItem
                  key={ann.id}
                  ann={ann}
                  index={index}
                  onToggle={handleToggle}
                  onEdit={(a) => { setEditTarget(a); setModalOpen(true) }}
                  onDelete={setDeleteTarget}
                  isPending={isPending}
                  t={t}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-foreground px-4 py-2.5 text-sm text-off-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <AnnouncementModal
          announcement={editTarget}
          onClose={() => setModalOpen(false)}
          onSaved={loadData}
          t={t}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <DeleteConfirmModal
          announcement={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          t={t}
        />
      )}
    </div>
  )
}
