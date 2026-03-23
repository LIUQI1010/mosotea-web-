"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"

// Page Hero Section
function PageHero() {
    const t = useTranslations("experiences")

    return (
        <section className="pt-32 pb-20 px-4 bg-cream">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-tea-brown mb-4">
                    {t("hero.title")}
                </h1>
                <p className="font-serif text-2xl md:text-3xl text-bamboo-green mb-6">
                    {t("hero.titleZh")}
                </p>
                <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    {t("hero.description")}
                </p>
            </div>
        </section>
    )
}

// Experience Card Component
function ExperienceCard({ experience }: {
    experience: {
        id: string
        title: string
        titleZh: string
        description: string
        duration: string
        groupSize: string
        price: number
        image: string
    }
}) {
    const t = useTranslations("experiences")

    return (
        <article className="bg-card rounded-lg overflow-hidden border border-border shadow-sm">
            {/* Image */}
            <div className="aspect-[16/10] overflow-hidden">
                <img
                    src={experience.image}
                    alt={experience.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
                {/* Title */}
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-tea-brown mb-1">
                    {experience.title}
                </h2>
                <p className="font-serif text-lg text-bamboo-green mb-4">
                    {experience.titleZh}
                </p>

                {/* Description */}
                <p className="text-foreground/80 leading-relaxed mb-6">
                    {experience.description}
                </p>

                {/* Details */}
                <div className="flex flex-wrap gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{experience.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        <span>{experience.groupSize}</span>
                    </div>
                </div>

                {/* Price & CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-border">
                    <div>
                        <span className="text-sm text-muted-foreground">{t("from")}</span>
                        <p className="text-2xl font-semibold text-tea-brown">
                            NZ${experience.price}
                            <span className="text-sm font-normal text-muted-foreground"> / {t("perPerson")}</span>
                        </p>
                    </div>
                    <Link
                        href={`/book?experience=${experience.id}`}
                        className="bg-tea-brown text-primary-foreground px-6 py-3 font-medium rounded hover:bg-tea-brown/90 transition-colors text-center"
                    >
                        {t("bookButton")}
                    </Link>
                </div>
            </div>
        </article>
    )
}

// Experience Cards Section
function ExperienceCards() {
    const t = useTranslations("experiences")

    const experiences = [
        {
            id: "classic",
            title: t("classic.title"),
            titleZh: t("classic.titleZh"),
            description: t("classic.description"),
            duration: t("classic.duration"),
            groupSize: t("classic.groupSize"),
            price: 85,
            image: "/images/experience-classic.jpg",
        },
        {
            id: "matcha",
            title: t("matcha.title"),
            titleZh: t("matcha.titleZh"),
            description: t("matcha.description"),
            duration: t("matcha.duration"),
            groupSize: t("matcha.groupSize"),
            price: 65,
            image: "/images/experience-matcha.jpg",
        },
        {
            id: "private",
            title: t("private.title"),
            titleZh: t("private.titleZh"),
            description: t("private.description"),
            duration: t("private.duration"),
            groupSize: t("private.groupSize"),
            price: 180,
            image: "/images/experience-garden.jpg",
        },
    ]

    return (
        <section className="py-20 px-4 bg-off-white">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col gap-12">
                    {experiences.map((experience) => (
                        <ExperienceCard key={experience.id} experience={experience} />
                    ))}
                </div>
            </div>
        </section>
    )
}

// What's Included Section
function WhatsIncluded() {
    const t = useTranslations("experiences")

    const includedItems = [
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
                </svg>
            ),
            title: t("included.item1Title"),
            titleZh: t("included.item1TitleZh"),
            description: t("included.item1Description"),
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
            ),
            title: t("included.item2Title"),
            titleZh: t("included.item2TitleZh"),
            description: t("included.item2Description"),
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
            ),
            title: t("included.item3Title"),
            titleZh: t("included.item3TitleZh"),
            description: t("included.item3Description"),
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
            ),
            title: t("included.item4Title"),
            titleZh: t("included.item4TitleZh"),
            description: t("included.item4Description"),
        },
    ]

    return (
        <section className="py-20 px-4 bg-cream">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-3xl md:text-4xl font-semibold text-tea-brown mb-2">
                        {t("included.title")}
                    </h2>
                    <p className="font-serif text-xl text-bamboo-green">
                        {t("included.titleZh")}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {includedItems.map((item, index) => (
                        <div
                            key={index}
                            className="bg-off-white p-6 rounded-lg text-center"
                        >
                            <div className="w-12 h-12 mx-auto mb-4 bg-tea-brown/10 rounded-full flex items-center justify-center text-tea-brown">
                                {item.icon}
                            </div>
                            <h3 className="font-serif text-lg font-semibold text-tea-brown mb-1">
                                {item.title}
                            </h3>
                            <p className="text-sm text-bamboo-green mb-3">{item.titleZh}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// FAQ Item Component
function FAQItem({ faq, isOpen, onToggle }: {
    faq: {
        question: string
        answer: string
    }
    isOpen: boolean
    onToggle: () => void
}) {
    return (
        <div className="border-b border-border">
            <button
                onClick={onToggle}
                className="w-full py-5 flex items-start justify-between gap-4 text-left"
                aria-expanded={isOpen}
            >
                <div>
                    <h3 className="font-medium text-foreground">{faq.question}</h3>
                </div>
                <span className="flex-shrink-0 mt-1 text-tea-brown">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-5" : "max-h-0"
                    }`}
            >
                <p className="text-muted-foreground leading-relaxed pr-8">{faq.answer}</p>
            </div>
        </div>
    )
}

// FAQ Section
function FAQSection() {
    const t = useTranslations("experiences")
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const faqs = [
        { question: t("faq.q1"), answer: t("faq.a1") },
        { question: t("faq.q2"), answer: t("faq.a2") },
        { question: t("faq.q3"), answer: t("faq.a3") },
        { question: t("faq.q4"), answer: t("faq.a4") },
        { question: t("faq.q5"), answer: t("faq.a5") },
    ]

    return (
        <section className="py-20 px-4 bg-off-white">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-3xl md:text-4xl font-semibold text-tea-brown">
                        {t("faq.title")}
                    </h2>
                </div>

                <div className="bg-card rounded-lg border border-border p-6 md:p-8">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            faq={faq}
                            isOpen={openIndex === index}
                            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

// CTA Section
function CTASection() {
    const t = useTranslations("experiences")

    return (
        <section className="py-20 px-4 bg-bamboo-green">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary-foreground mb-4">
                    {t("ctaTitle")}
                </h2>
                <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto leading-relaxed">
                    {t("ctaDescription")}
                </p>
                <Link
                    href="/contact"
                    className="inline-block bg-off-white text-bamboo-green px-8 py-3 font-medium rounded hover:bg-cream transition-colors"
                >
                    {t("ctaButton")}
                </Link>
            </div>
        </section>
    )
}

// Main Page
export default function ExperiencesPage() {
    return (
        <main className="min-h-screen bg-off-white">
            <Navigation />
            <PageHero />
            <ExperienceCards />
            <WhatsIncluded />
            <FAQSection />
            <CTASection />
            <Footer />
        </main>
    )
}
