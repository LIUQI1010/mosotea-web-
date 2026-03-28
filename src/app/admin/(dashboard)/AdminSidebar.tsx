'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { logout } from '@/app/admin/_actions/auth'
import { setAdminLocale } from '@/app/admin/_actions/locale'
import type { Locale } from '@/i18n/routing'

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )
}

function BookingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  )
}

function AnnouncementsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
    </svg>
  )
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function SidebarContent({ pathname, onNavigate, t, locale, onSwitchLocale }: {
  pathname: string
  onNavigate?: () => void
  t: ReturnType<typeof useTranslations<'admin.sidebar'>>
  locale: Locale
  onSwitchLocale: (locale: Locale) => void
}) {
  const navItems = [
    { href: '/admin', label: t('dashboard'), Icon: DashboardIcon },
    { href: '/admin/slots', label: t('slots'), Icon: CalendarIcon },
    { href: '/admin/bookings', label: t('bookings'), Icon: BookingsIcon },
    { href: '/admin/announcements', label: t('announcements'), Icon: AnnouncementsIcon },
  ]

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-tea-brown/30 bg-cream">
          <span className="font-serif text-sm font-semibold text-tea-brown">茶</span>
        </div>
        <span className="font-serif text-lg font-semibold text-foreground">Moso Tea</span>
      </div>

      {/* Divider */}
      <div className="mx-5 mb-3 h-px bg-border" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-tea-brown/10 font-medium text-tea-brown'
                  : 'text-muted-foreground hover:bg-cream hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Language Switcher */}
      <div className="mx-5 h-px bg-border" />
      <div className="flex items-center justify-center gap-1 px-3 py-3 text-sm">
        <button
          onClick={() => onSwitchLocale('en')}
          className={`px-2 py-1 transition-colors ${
            locale === 'en' ? 'text-tea-brown font-semibold' : 'text-muted-foreground/50 hover:text-muted-foreground'
          }`}
        >
          EN
        </button>
        <span className="text-border">|</span>
        <button
          onClick={() => onSwitchLocale('zh-TW')}
          className={`px-2 py-1 transition-colors ${
            locale === 'zh-TW' ? 'text-tea-brown font-semibold' : 'text-muted-foreground/50 hover:text-muted-foreground'
          }`}
        >
          繁中
        </button>
      </div>

      {/* Logout */}
      <div className="border-t border-border px-3 py-4">
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-cream hover:text-red-600 cursor-pointer"
          >
            <LogoutIcon className="h-4 w-4 flex-shrink-0" />
            {t('logout')}
          </button>
        </form>
      </div>
    </>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale() as Locale
  const t = useTranslations('admin.sidebar')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [, startTransition] = useTransition()

  const handleSwitchLocale = (newLocale: Locale) => {
    startTransition(async () => {
      await setAdminLocale(newLocale)
      router.refresh()
    })
  }

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [mobileOpen])

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center border-b border-border bg-off-white px-4 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-cream hover:text-foreground"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <div className="ml-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-tea-brown/30 bg-cream">
            <span className="font-serif text-xs font-semibold text-tea-brown">茶</span>
          </div>
          <span className="font-serif text-base font-semibold text-foreground">Moso Tea</span>
        </div>
        {/* Mobile language switcher in top bar */}
        <div className="ml-auto flex items-center gap-1 text-xs">
          <button
            onClick={() => handleSwitchLocale('en')}
            className={`px-1.5 py-1 transition-colors ${
              locale === 'en' ? 'text-tea-brown font-semibold' : 'text-muted-foreground/50 hover:text-muted-foreground'
            }`}
          >
            EN
          </button>
          <span className="text-border">|</span>
          <button
            onClick={() => handleSwitchLocale('zh-TW')}
            className={`px-1.5 py-1 transition-colors ${
              locale === 'zh-TW' ? 'text-tea-brown font-semibold' : 'text-muted-foreground/50 hover:text-muted-foreground'
            }`}
          >
            繁中
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="flex h-full w-[240px] flex-col bg-off-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end px-3 pt-3">
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-cream hover:text-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} t={t} locale={locale} onSwitchLocale={handleSwitchLocale} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-[200px] flex-col border-r border-border bg-off-white md:flex">
        <SidebarContent pathname={pathname} t={t} locale={locale} onSwitchLocale={handleSwitchLocale} />
      </aside>
    </>
  )
}
