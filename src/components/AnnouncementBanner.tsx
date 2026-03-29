'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import type { Announcement } from '@/types'

export function AnnouncementBanner() {
  const t = useTranslations('announcement')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const autoRotateTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          // Filter out expired announcements
          const now = new Date().toISOString()
          const active = data.filter(
            (a: Announcement) => !a.expires_at || a.expires_at > now
          )
          if (active.length > 0) setAnnouncements(active)
        }
      })
  }, [])

  const fadeTo = useCallback((index: number) => {
    setFading(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setFading(false)
    }, 300)
  }, [])

  // Auto-rotate
  useEffect(() => {
    if (announcements.length <= 1) return
    autoRotateTimer.current = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length)
        setFading(false)
      }, 300)
    }, 5000)
    return () => {
      if (autoRotateTimer.current) clearInterval(autoRotateTimer.current)
    }
  }, [announcements.length])

  const goTo = useCallback((index: number) => {
    if (fading) return
    // Reset auto-rotate on manual interaction
    if (autoRotateTimer.current) clearInterval(autoRotateTimer.current)
    fadeTo(index)
    // Restart auto-rotate after manual switch
    if (announcements.length > 1) {
      autoRotateTimer.current = setInterval(() => {
        setFading(true)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % announcements.length)
          setFading(false)
        }, 300)
      }, 5000)
    }
  }, [fading, fadeTo, announcements.length])

  const goPrev = useCallback(() => {
    goTo((currentIndex - 1 + announcements.length) % announcements.length)
  }, [goTo, currentIndex, announcements.length])

  const goNext = useCallback(() => {
    goTo((currentIndex + 1) % announcements.length)
  }, [goTo, currentIndex, announcements.length])

  if (dismissed || announcements.length === 0) return null

  const current = announcements[currentIndex]
  const title = current.title_en
  const content = current.content_en
  const hasMultiple = announcements.length > 1

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null || !hasMultiple) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    touchStartX.current = null
    touchStartY.current = null

    // Only trigger if horizontal swipe is dominant and > 40px
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goNext()
      else goPrev()
    }
  }

  return (
    <div
      className="fixed top-16 left-0 right-0 z-40 bg-tea-brown text-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main content row */}
      <div className="relative flex items-center justify-center px-8 sm:px-12 py-2.5">
        {/* Prev arrow */}
        {hasMultiple && (
          <button
            onClick={goPrev}
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 rounded p-2 sm:p-1 text-white/50 hover:text-white transition-colors"
            aria-label={t('prev')}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {/* Content */}
        <div
          className={`text-center transition-opacity duration-300 break-words ${
            fading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <p className="text-xs sm:text-sm font-medium">
            <span className="font-semibold">{title}</span>
            {content && (
              <span className="ml-1.5 sm:ml-2 font-normal opacity-90">{content}</span>
            )}
          </p>

          {/* Clickable dots */}
          {hasMultiple && (
            <div className="mt-1 flex items-center justify-center gap-2">
              {announcements.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentIndex ? 'w-4 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`${t('goTo')} ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Next arrow */}
        {hasMultiple && (
          <button
            onClick={goNext}
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 rounded p-2 sm:p-1 text-white/50 hover:text-white transition-colors"
            aria-label={t('next')}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Dismiss button — centered below content */}
      <div className="flex justify-center pb-2 -mt-1">
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-white/70 underline underline-offset-2 hover:text-white transition-colors"
        >
          {t('dismiss')}
        </button>
      </div>
    </div>
  )
}
