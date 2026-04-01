"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from "next-intl"
import Image from 'next/image'
import { Link } from "@/i18n/navigation"
import { createClient } from '@/lib/supabase/client'
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { AnnouncementBanner } from "@/components/AnnouncementBanner"

// Hero Section
function HeroSection() {
  const t = useTranslations("home.hero")

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-cream">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-tea-ceremony.jpg"
          alt="Traditional tea ceremony setup with ceramic teapot and cups"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-off-white mb-4 text-balance leading-tight">
          {t("title")}
        </h1>
        <p className="text-lg sm:text-xl text-off-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          {t("description")}
        </p>
        <Link
          href="/book?workshop=A"
          className="inline-block bg-off-white text-tea-brown px-8 py-4 text-base font-medium rounded hover:bg-cream transition-colors"
        >
          {t("cta")}
        </Link>
      </div>
    </section>
  )
}

// Icon Components
function TeaLeafIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.4 0 2.8-.3 4-.8-.5-.5-.8-1.1-.8-1.8 0-1.4 1.1-2.4 2.4-2.4.7 0 1.4.3 1.8.8.5-1.2.8-2.6.8-4C22 6.5 17.5 2 12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 2c-1.9 2.5-3 5.6-3 9s1.1 6.5 3 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 9.5h19M2.5 14.5h19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GardenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 22V8M12 8c0-4-3-6-7-6 0 4 3 6 7 6zM12 8c0-4 3-6 7-6 0 4-3 6-7 6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 13c-2.5 0-5 1.5-5 5h10c0-3.5-2.5-5-5-5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Introduction Section
function IntroductionSection() {
  const t = useTranslations("home.intro")

  const features = [
    {
      icon: TeaLeafIcon,
      title: t("feature1Title"),
      description: t("feature1Description"),
    },
    {
      icon: UsersIcon,
      title: t("feature2Title"),
      description: t("feature2Description"),
    },
    {
      icon: GardenIcon,
      title: t("feature3Title"),
      description: t("feature3Description"),
    },
  ]

  return (
    <section className="py-20 sm:py-28 px-4 bg-off-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-tea-brown mb-4">
            {t("title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cream mb-6 group-hover:bg-tea-brown/10 transition-colors">
                <feature.icon className="w-8 h-8 text-tea-brown" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Featured Experience Section
function FeaturedExperiences() {
  const t = useTranslations("home.experiences")

  return (
    <section className="py-20 sm:py-28 px-4 bg-cream">
      <div className="max-w-4xl mx-auto">
        {/* Title & Subtitle */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-tea-brown mb-4">
            {t("title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Two Workshop Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-10">
          {/* Workshop A — Tea Ceremony */}
          <div className="bg-off-white rounded-lg overflow-hidden border border-border flex flex-col">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src="/images/tea-journey.jpg"
                alt="Tea Ceremony Experience"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <h3 className="font-serif text-xl font-semibold text-tea-brown mb-3">
                {t("workshopA.title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4 flex-1">
                {t("workshopA.description")}
              </p>
              <p className="text-xs font-medium text-muted-foreground tracking-wide mb-4">
                {t("statsA")}
              </p>
              <Link
                href="/book?workshop=A"
                className="inline-block text-center px-6 py-2.5 text-sm font-medium rounded bg-tea-brown text-primary-foreground hover:bg-tea-brown/90 transition-colors"
              >
                {t("bookNow")}
              </Link>
            </div>
          </div>

          {/* Workshop B — Tea Making */}
          <div className="bg-off-white rounded-lg overflow-hidden border border-border flex flex-col">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src="/images/hands-on-experience.jpg"
                alt="Tea Making Experience"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <h3 className="font-serif text-xl font-semibold text-tea-brown mb-3">
                {t("workshopB.title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4 flex-1">
                {t("workshopB.description")}
              </p>
              <p className="text-xs font-medium text-muted-foreground tracking-wide mb-4">
                {t("statsB")}
              </p>
              <Link
                href="/book?workshop=B"
                className="inline-block text-center px-6 py-2.5 text-sm font-medium rounded border-2 border-tea-brown text-tea-brown hover:bg-tea-brown hover:text-primary-foreground transition-colors"
              >
                {t("registerInterest")}
              </Link>
            </div>
          </div>
        </div>

        {/* Learn More */}
        <div className="flex justify-center">
          <Link
            href="/workshop"
            className="inline-block px-8 py-3 text-base font-medium rounded border-2 border-tea-brown text-tea-brown hover:bg-tea-brown hover:text-primary-foreground transition-colors"
          >
            {t("learnMore")}
          </Link>
        </div>
      </div>
    </section>
  )
}

// Testimonials Section
function TestimonialsSection() {
  const t = useTranslations("home.testimonials")

  const testimonials = [
    {
      quote: t("quote1"),
      name: t("name1"),
      location: t("location1"),
    },
    {
      quote: t("quote2"),
      name: t("name2"),
      location: t("location2"),
    },
    {
      quote: t("quote3"),
      name: t("name3"),
      location: t("location3"),
    },
  ]

  return (
    <section className="py-20 sm:py-28 px-4 bg-off-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-tea-brown mb-4">
            {t("title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="text-center">
              <div className="mb-6">
                <svg
                  className="w-8 h-8 mx-auto text-tea-brown/30"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <p className="font-serif font-semibold text-foreground">{testimonial.name}</p>
              <p className="text-sm text-muted-foreground">{testimonial.location}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Gallery Image with fade-in
function GalleryImage({ image }: { image: { url: string; caption: string | null } }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="aspect-[4/3] overflow-hidden rounded-lg relative bg-border/50">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-border/50 rounded-lg" />
      )}
      <Image
        src={image.url}
        alt={image.caption ?? ''}
        width={600}
        height={450}
        className={`w-full h-full object-cover hover:scale-105 transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}

// Gallery Section
function GallerySection() {
  const t = useTranslations("home.gallery")
  const [images, setImages] = useState<{ id: string; url: string; caption: string | null }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('gallery')
      .select('id, url, caption')
      .not('featured_order', 'is', null)
      .order('featured_order', { ascending: true })
      .limit(6)
      .then(({ data }) => {
        if (data && data.length > 0) setImages(data)
        setLoading(false)
      })
  }, [])

  if (!loading && images.length === 0) return null

  return (
    <section className="py-20 sm:py-28 px-4 bg-cream">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-tea-brown mb-4">
            {t("title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-lg bg-border/50 animate-pulse" />
              ))
            : images.map((image) => (
                <GalleryImage key={image.id} image={image} />
              ))
          }
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/gallery"
            className="inline-block px-8 py-3 text-base font-medium rounded border-2 border-tea-brown text-tea-brown hover:bg-tea-brown hover:text-primary-foreground transition-colors"
          >
            {t("viewAll")}
          </Link>
        </div>
      </div>
    </section>
  )
}

// JSON-LD Structured Data
function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Moso Tea',
    alternateName: ['mosotea', 'Moso Tea Wellington'],
    description:
      'Moso Tea offers authentic tea ceremony workshops and hands-on tea making experiences in Wellington, New Zealand.',
    url: 'https://mosotea.co.nz',
    image: 'https://mosotea.co.nz/images/hero-tea-ceremony.jpg',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Wellington',
      addressCountry: 'NZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -41.2865,
      longitude: 174.7762,
    },
    priceRange: 'NZ$75–NZ$85',
    currenciesAccepted: 'NZD',
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Tea Ceremony Experience',
          description:
            'A 90-minute guided tea ceremony workshop for up to 8 guests.',
        },
        price: '75',
        priceCurrency: 'NZD',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Tea Making Experience',
          description:
            'A 2-hour hands-on tea making workshop (seasonal).',
        },
        price: '85',
        priceCurrency: 'NZD',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// Main Page
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <StructuredData />
      <Navigation />
      <AnnouncementBanner />
      <HeroSection />

      <IntroductionSection />
      <FeaturedExperiences />
      <TestimonialsSection />
      <GallerySection />
      <Footer />
    </main>
  )
}
