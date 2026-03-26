'use client'

import { useActionState } from 'react'
import { login } from '@/app/admin/_actions/auth'

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(login, {})

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
      <div className="w-full max-w-sm px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#7C5C3E]">
            <span className="font-serif text-lg font-semibold text-[#FDF6F0]">
              茶
            </span>
          </div>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-[#3D3D3D]">
            Moso Tea
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">后台管理系统</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-[#E8E0D8] bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-medium text-[#3D3D3D]">
            管理员登录
          </h2>

          <form action={formAction}>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-[#3D3D3D]"
              >
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                className="w-full rounded-lg border border-[#E8E0D8] bg-[#FAFAF8] px-3 py-2 text-sm text-[#3D3D3D] outline-none transition-colors focus:border-[#7C5C3E] focus:ring-1 focus:ring-[#7C5C3E]"
                placeholder="请输入管理员密码"
              />
            </div>

            {state.error && (
              <p className="mb-4 text-sm text-red-600">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-[#7C5C3E] px-4 py-2 text-sm font-medium text-[#FDF6F0] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? '登录中...' : '登录'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
