"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from "next-intl"
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"

export default function GalleryPage() {
  const t = useTranslations("gallery")
  const [images, setImages] = useState<{ id: string; url: string; caption: string | null }[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<number | null>(null)

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
          {loading && (
            <p className="text-center text-muted-foreground py-12">{t("loading")}</p>
          )}

          {!loading && images.length === 0 && (
            <p className="text-center text-muted-foreground py-12">{t("noImages")}</p>
          )}

          {!loading && images.length > 0 && (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setLightbox(index)}
                  className="relative mb-4 block w-full overflow-hidden rounded-lg cursor-pointer group break-inside-avoid"
                >
                  <Image
                    src={image.url}
                    alt={image.caption ?? ''}
                    width={600}
                    height={0}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
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

          {/* Image */}
          <div className="max-w-4xl max-h-[80vh] relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[lightbox].url}
              alt={images[lightbox].caption ?? ''}
              width={1200}
              height={900}
              className="max-h-[80vh] w-auto object-contain rounded-lg"
            />
            {images[lightbox].caption && (
              <p className="mt-3 text-center text-sm text-white/80">
                {images[lightbox].caption}
              </p>
            )}
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
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
