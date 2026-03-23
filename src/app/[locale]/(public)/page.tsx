"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"

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
        <div className="absolute inset-0 bg-gradient-to-b from-tea-brown/40 via-tea-brown/50 to-tea-brown/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-off-white mb-4 text-balance leading-tight">
          {t("title")}
        </h1>
        <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-off-white/90 mb-6">
          {t("titleZh")}
        </p>
        <p className="text-lg sm:text-xl text-off-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          {t("description")}
        </p>
        <Link
          href="/book"
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
      titleZh: t("feature1TitleZh"),
      description: t("feature1Description"),
    },
    {
      icon: UsersIcon,
      title: t("feature2Title"),
      titleZh: t("feature2TitleZh"),
      description: t("feature2Description"),
    },
    {
      icon: GardenIcon,
      title: t("feature3Title"),
      titleZh: t("feature3TitleZh"),
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
              <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-bamboo-green mb-3">{feature.titleZh}</p>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Featured Experiences Section
function FeaturedExperiences() {
  const t = useTranslations("home.experiences")

  const experiences = [
    {
      title: t("classic.title"),
      titleZh: t("classic.titleZh"),
      duration: t("classic.duration"),
      price: 85,
      description: t("classic.description"),
      image: "/images/experience-classic.jpg",
    },
    {
      title: t("matcha.title"),
      titleZh: t("matcha.titleZh"),
      duration: t("matcha.duration"),
      price: 65,
      description: t("matcha.description"),
      image: "/images/experience-matcha.jpg",
    },
    {
      title: t("private.title"),
      titleZh: t("private.titleZh"),
      duration: t("private.duration"),
      price: 180,
      description: t("private.description"),
      image: "/images/experience-garden.jpg",
    },
  ]

  return (
    <section className="py-20 sm:py-28 px-4 bg-cream">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-tea-brown mb-4">
            {t("title")}
          </h2>
          <p className="font-serif text-xl text-bamboo-green">{t("titleZh")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {experiences.map((experience, index) => (
            <div
              key={index}
              className="bg-off-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Experience Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={experience.image}
                  alt={experience.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
                  {experience.title}
                </h3>
                <p className="text-sm text-bamboo-green mb-3">{experience.titleZh}</p>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed flex-1">
                  {experience.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">{experience.duration}</span>
                  <span className="font-semibold text-tea-brown">NZD ${experience.price}</span>
                </div>
                <Link
                  href="/book"
                  className="block w-full text-center bg-tea-brown text-primary-foreground py-2.5 text-sm font-medium rounded hover:bg-tea-brown/90 transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
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
          <p className="font-serif text-xl text-bamboo-green">{t("titleZh")}</p>
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

// Main Page
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <IntroductionSection />
      <FeaturedExperiences />
      <TestimonialsSection />
      <Footer />
    </main>
  )
}
