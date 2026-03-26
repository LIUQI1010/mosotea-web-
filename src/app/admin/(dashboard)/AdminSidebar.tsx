'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/admin/_actions/auth'

const navItems = [
  { href: '/admin', label: '仪表盘', icon: '📊' },
  { href: '/admin/slots', label: '时间段', icon: '📅' },
  { href: '/admin/bookings', label: '预约', icon: '📋' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[200px] flex-col border-r border-[#E8E0D8] bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#7C5C3E]">
          <span className="font-serif text-sm font-semibold text-[#FDF6F0]">
            茶
          </span>
        </div>
        <span className="font-serif text-lg font-semibold text-[#3D3D3D]">
          Moso Tea
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-[#7C5C3E]/10 font-medium text-[#7C5C3E]'
                  : 'text-[#6B6B6B] hover:bg-[#FAFAF8] hover:text-[#3D3D3D]'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-[#E8E0D8] px-3 py-4">
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            退出登录
          </button>
        </form>
      </div>
    </aside>
  )
}
