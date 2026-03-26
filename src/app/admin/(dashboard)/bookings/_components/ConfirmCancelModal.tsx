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
      <h2 className="text-lg font-medium text-[#3D3D3D]">确认取消预约</h2>
      <p className="mt-3 text-sm text-[#6B6B6B]">
        确认取消 <span className="font-medium text-[#3D3D3D]">{customerName}</span> 的预约？取消后无法恢复，名额将自动释放。
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-lg border border-[#E8E0D8] px-4 py-2 text-sm text-[#6B6B6B] hover:bg-stone-50"
        >
          返回
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? '取消中...' : '确认取消'}
        </button>
      </div>
    </Modal>
  )
}
