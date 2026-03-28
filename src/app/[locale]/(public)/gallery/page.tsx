"use client"

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from "next-intl"
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"

const SKELETON_HEIGHTS = [240, 320, 280, 360, 200, 300, 260, 340, 220, 290, 310, 250]

function GallerySkeleton() {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
      {SKELETON_HEIGHTS.map((height, i) => (
        <div
          key={i}
          className="mb-4 rounded-lg bg-border/50 animate-pulse break-inside-avoid"
          style={{ height }}
        />
      ))}
    </div>
  )
}

export default function GalleryPage() {
  const t = useTranslations("gallery")
  const [images, setImages] = useState<{ id: string; url: string; caption: string | null }[]>([])
  const [loading, setLoading] = useState(true)
  const [allLoaded, setAllLoaded] = useState(false)
  const [visible, setVisible] = useState(false)
  const [loadedCount, setLoadedCount] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)

  // Fetch image data from DB
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('gallery')
      .select('id, url, caption')
      .order('uploaded_at', { ascending: false })
      .then(({ data }) => {
        if (data) setImages(data)
        setLoading(false)
      })
  }, [])

  // When all images have fired onLoad, trigger the fade-in
  useEffect(() => {
    if (!loading && images.length > 0 && loadedCount >= images.length && !allLoaded) {
      // Double rAF ensures the browser has painted the opacity-0 state
      // before we switch to opacity-100, so the transition is always visible
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAllLoaded(true)
          setVisible(true)
        })
      })
    }
  }, [loading, images.length, loadedCount, allLoaded])

  const handleImageLoad = useCallback(() => {
    setLoadedCount((c) => c + 1)
  }, [])

  const openLightbox = useCallback((index: number) => setLightbox(index), [])

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 bg-cream">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-tea-brown mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 sm:py-20 px-4 bg-off-white">
        <div className="max-w-6xl mx-auto">
          {/* Skeleton: visible while fetching data OR while images are still loading */}
          {(loading || (!allLoaded && images.length > 0)) && <GallerySkeleton />}

          {!loading && images.length === 0 && (
            <p className="text-center text-muted-foreground py-12">{t("noImages")}</p>
          )}

          {/* Hidden preload grid: renders images off-screen to trigger loading */}
          {!loading && images.length > 0 && !allLoaded && (
            <div className="absolute opacity-0 pointer-events-none -z-10" aria-hidden="true">
              {images.map((image) => (
                <Image
                  key={image.id}
                  src={image.url}
                  alt=""
                  width={600}
                  height={0}
                  className="w-full h-auto"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  loading="eager"
                  onLoad={handleImageLoad}
                />
              ))}
            </div>
          )}

          {/* Actual gallery: only rendered after all images are preloaded */}
          {allLoaded && (
            <div
              className={`columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 transition-opacity duration-800 ease-out ${
                visible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => openLightbox(index)}
                  aria-label={image.caption || t("viewImage", { number: index + 1 })}
                  className="relative mb-4 block w-full overflow-hidden rounded-lg cursor-pointer group break-inside-avoid"
                >
                  <Image
                    src={image.url}
                    alt={image.caption ?? ''}
                    width={600}
                    height={0}
                    loading="eager"
                    className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2.5 pt-6">
                      <p className="text-sm text-white">{image.caption}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-label={t("lightboxLabel")}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            aria-label={t("close")}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {images.length > 1 && (
            <button
              aria-label={t("previous")}
              className="absolute left-4 text-white/50 hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setLightbox((lightbox - 1 + images.length) % images.length)
              }}
            >
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          <div className="max-w-4xl max-h-[80vh] relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[lightbox].url}
              alt={images[lightbox].caption ?? ''}
              width={1200}
              height={900}
              className="max-h-[80vh] w-auto object-contain rounded-lg"
            />
            {images[lightbox].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10 rounded-b-lg">
                <p className="text-center text-sm text-white">{images[lightbox].caption}</p>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <button
              aria-label={t("next")}
              className="absolute right-4 text-white/50 hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setLightbox((lightbox + 1) % images.length)
              }}
            >
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>
      )}

      <Footer />
    </main>
  )
}
