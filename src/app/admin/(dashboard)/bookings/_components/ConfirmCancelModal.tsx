'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Modal } from './Modal'

interface ConfirmCancelModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  customerName: string
}

export function ConfirmCancelModal({
  open,
  onClose,
  onConfirm,
  customerName,
}: ConfirmCancelModalProps) {
  const t = useTranslations('admin.confirmCancel')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="font-serif text-lg font-semibold text-foreground">{t('title')}</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        {t('message', { name: customerName })}
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-cream"
        >
          {t('back')}
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? t('cancelling') : t('confirm')}
        </button>
      </div>
    </Modal>
  )
}
