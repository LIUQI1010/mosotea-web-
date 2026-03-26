'use client'

import { useState } from 'react'
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
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="font-serif text-lg font-semibold text-foreground">確認取消預約</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        確認取消 <span className="font-medium text-foreground">{customerName}</span> 的預約？取消後無法恢復，名額將自動釋放。
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-cream"
        >
          返回
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? '取消中...' : '確認取消'}
        </button>
      </div>
    </Modal>
  )
}
