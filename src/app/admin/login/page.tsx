'use client'

import { useActionState, useTransition } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { login } from '@/app/admin/_actions/auth'
import { setAdminLocale } from '@/app/admin/_actions/locale'
import type { Locale } from '@/i18n/routing'

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(login, {})
  const t = useTranslations('admin.login')
  const locale = useLocale() as Locale
  const router = useRouter()
  const [, startTransition] = useTransition()

  const handleSwitchLocale = (newLocale: Locale) => {
    startTransition(async () => {
      await setAdminLocale(newLocale)
      router.refresh()
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md">

        {/* Language Switcher */}
        <div className="mb-8 flex items-center justify-center gap-1 text-sm">
          <button
            onClick={() => handleSwitchLocale('en')}
            className={`px-2 py-1 transition-colors ${
              locale === 'en' ? 'text-tea-brown font-semibold' : 'text-muted-foreground/50 hover:text-muted-foreground'
            }`}
          >
            EN
          </button>
          <span className="text-border">|</span>
          <button
            onClick={() => handleSwitchLocale('zh-TW')}
            className={`px-2 py-1 transition-colors ${
              locale === 'zh-TW' ? 'text-tea-brown font-semibold' : 'text-muted-foreground/50 hover:text-muted-foreground'
            }`}
          >
            繁中
          </button>
        </div>

        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-tea-brown/30 bg-cream shadow-sm">
            <span className="font-serif text-2xl font-semibold text-tea-brown">茶</span>
          </div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Moso Tea</h1>
          <p className="mt-1.5 text-sm text-muted-foreground tracking-wide">{t('subtitle')}</p>
        </div>

        {/* Divider */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground tracking-widest uppercase">Admin</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-off-white px-5 py-7 shadow-sm sm:px-8 sm:py-9">
          <h2 className="mb-6 font-serif text-xl font-semibold text-foreground text-center">{t('heading')}</h2>

          <form action={formAction}>
            <div className="mb-5">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                maxLength={200}
                className="w-full rounded-lg border border-border bg-cream px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-tea-brown focus:ring-2 focus:ring-tea-brown/20"
                placeholder={t('placeholder')}
              />
            </div>

            {state.error && (
              <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 border border-red-100">
                {t(state.error as 'errorWrongPassword')}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-tea-brown px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? t('submitting') : t('submit')}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          {t('footer')}
        </p>
      </div>
    </div>
  )
}
