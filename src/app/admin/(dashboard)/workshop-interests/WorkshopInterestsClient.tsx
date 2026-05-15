'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { sendWorkshopAvailabilityEmails, type WorkshopInterestRow } from './_actions'

const PAGE_SIZE = 10
const NZ_TZ = 'Pacific/Auckland'

function formatDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'zh-TW' ? 'zh-TW' : 'en-NZ', {
    timeZone: NZ_TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

interface WorkshopInterestsClientProps {
  rows: WorkshopInterestRow[]
  page: number
  totalCount: number
}

export function WorkshopInterestsClient({ rows, page, totalCount }: WorkshopInterestsClientProps) {
  const t = useTranslations('admin.workshopInterests')
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const currentPageIds = useMemo(() => rows.map((row) => row.id), [rows])
  const allSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id))

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)))
      return
    }

    setSelectedIds((prev) => [...new Set([...prev, ...currentPageIds])])
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(nextPage))
    router.push(`/admin/workshop-interests?${params.toString()}`)
  }

  function handleSendEmails() {
    if (selectedIds.length === 0 || isPending) return

    startTransition(async () => {
      const result = await sendWorkshopAvailabilityEmails(selectedIds)

      if (result.success) {
        showToast(t('toastSendSuccess', { count: result.sentCount ?? 0 }), 'success')
        setSelectedIds([])
        router.refresh()
        return
      }

      showToast(result.error ?? t('toastSendError'), 'error')
    })
  }

  return (
    <div>
      {toast && (
        <div className={`fixed right-8 top-8 z-50 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === 'success'
            ? 'border-bamboo-green/20 bg-bamboo-green/10 text-bamboo-green'
            : 'border-red-100 bg-red-50 text-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">{t('management')}</p>
          <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">{t('title')}</h1>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-sm text-muted-foreground">{t('selectedCount', { count: selectedIds.length })}</span>
          <button
            onClick={handleSendEmails}
            disabled={selectedIds.length === 0 || isPending}
            className="rounded-lg bg-tea-brown px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? t('sending') : t('sendSelected')}
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-off-white py-12 text-center text-sm text-muted-foreground">
          {t('noRecords')}
        </div>
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            <div className="flex items-center justify-between rounded-xl border border-border bg-off-white px-4 py-3">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-border accent-tea-brown"
                />
                {t('selectAll')}
              </label>
              <span className="text-xs text-muted-foreground">{t('pageInfo', { page, totalPages })}</span>
            </div>

            {rows.map((row) => (
              <div key={row.id} className="rounded-xl border border-border bg-off-white p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleSelected(row.id)}
                      className="mt-0.5 h-4 w-4 rounded border-border accent-tea-brown"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.full_name}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </div>
                  </label>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    row.availability_notified_at
                      ? 'bg-bamboo-green/10 text-bamboo-green border border-bamboo-green/20'
                      : 'bg-cream text-muted-foreground border border-border'
                  }`}>
                    {row.availability_notified_at ? t('notified') : t('notNotified')}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>{t('phone')}: {row.phone}</p>
                  <p>{t('guests')}: {row.guest_count}</p>
                  <p>{t('language')}: {row.preferred_language === 'zh-TW' ? '繁中' : 'EN'}</p>
                  <p>{t('registeredAt')}: {formatDateTime(row.created_at, locale)}</p>
                  <p>
                    {t('notifiedAt')}: {row.availability_notified_at ? formatDateTime(row.availability_notified_at, locale) : t('notSent')}
                  </p>
                  <p className="pt-1 text-foreground">{row.message || '—'}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-off-white lg:block">
            <div className="grid min-w-[1180px] grid-cols-[56px_1fr_1.2fr_1fr_70px_60px_1.5fr_160px_160px] gap-3 border-b border-border bg-cream px-5 py-3 text-center">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-border accent-tea-brown"
                  aria-label={t('selectAll')}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{t('name')}</span>
              <span className="text-xs font-medium text-muted-foreground">{t('email')}</span>
              <span className="text-xs font-medium text-muted-foreground">{t('phone')}</span>
              <span className="text-xs font-medium text-muted-foreground">{t('guests')}</span>
              <span className="text-xs font-medium text-muted-foreground">{t('language')}</span>
              <span className="text-xs font-medium text-muted-foreground">{t('message')}</span>
              <span className="text-xs font-medium text-muted-foreground">{t('registeredAt')}</span>
              <span className="text-xs font-medium text-muted-foreground">{t('notifiedAt')}</span>
            </div>

            {rows.map((row) => (
              <div
                key={row.id}
                className="grid min-w-[1180px] grid-cols-[56px_1fr_1.2fr_1fr_70px_60px_1.5fr_160px_160px] items-center gap-3 border-b border-border px-5 py-3 text-center transition-colors last:border-b-0 hover:bg-cream"
              >
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleSelected(row.id)}
                    className="h-4 w-4 rounded border-border accent-tea-brown"
                    aria-label={row.full_name}
                  />
                </div>
                <span className="truncate text-sm font-medium text-foreground">{row.full_name}</span>
                <span className="truncate text-xs text-muted-foreground">{row.email}</span>
                <span className="truncate text-xs text-muted-foreground">{row.phone}</span>
                <span className="text-sm text-foreground">{row.guest_count}</span>
                <span className="text-xs text-muted-foreground">{row.preferred_language === 'zh-TW' ? '繁中' : 'EN'}</span>
                <span className="truncate text-xs text-muted-foreground" title={row.message || ''}>{row.message || '—'}</span>
                <span className="text-xs text-muted-foreground">{formatDateTime(row.created_at, locale)}</span>
                <div>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    row.availability_notified_at
                      ? 'bg-bamboo-green/10 text-bamboo-green border border-bamboo-green/20'
                      : 'bg-cream text-muted-foreground border border-border'
                  }`}>
                    {row.availability_notified_at
                      ? formatDateTime(row.availability_notified_at, locale)
                      : t('notSent')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-off-white px-4 py-3">
            <span className="text-sm text-muted-foreground">{t('pageInfo', { page, totalPages })}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('prev')}
              </button>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('next')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}