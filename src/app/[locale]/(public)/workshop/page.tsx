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
                <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-6">
                    {t("hero.description")}
                </p>
            </div>
        </section>
    )
}

// Two-Part Experience Section
function ExperienceParts() {
    const t = useTranslations("experiences")

    return (
        <section className="py-20 px-4 bg-off-white">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col gap-12">
                    {/* Part 01: Tea Journey */}
                    <div className="bg-card rounded-lg overflow-hidden border border-border">
                        <div className="aspect-[16/9] overflow-hidden">
                            <img
                                src="/images/tea-journey.jpg"
                                alt="Tea Journey"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-8 md:p-10">
                            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-bamboo-green mb-4">
                                {t("part01")}
                            </span>
                            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-tea-brown mb-6">
                                {t("teaJourney.title")}
                            </h2>
                            <ul className="space-y-4">
                                {(["1", "2", "3"] as const).map((key) => (
                                    <li key={key} className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-tea-brown/10 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-tea-brown" />
                                        </div>
                                        <span className="text-foreground/80 leading-relaxed">
                                            {t(`teaJourney.items.${key}`)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Part 02: Hands-on Experience */}
                    <div className="bg-card rounded-lg overflow-hidden border border-border">
                        <div className="aspect-[16/9] overflow-hidden">
                            <img
                                src="/images/hands-on-experience.jpg"
                                alt="Hands-on Experience"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-8 md:p-10">
                            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-bamboo-green mb-4">
                                {t("part02")}
                            </span>
                            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-tea-brown mb-6">
                                {t("handsOn.title")}
                            </h2>
                            <ul className="space-y-4">
                                {(["1", "2", "3", "4"] as const).map((key) => (
                                    <li key={key} className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-tea-brown/10 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-tea-brown" />
                                        </div>
                                        <span className="text-foreground/80 leading-relaxed">
                                            {t(`handsOn.items.${key}`)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <p className="text-center text-sm font-medium text-muted-foreground tracking-wide mt-12 mb-8">
                    {t("stats")}
                </p>

                {/* Book Now Button */}
                <div className="flex justify-center">
                    <Link
                        href="/book"
                        className="inline-block bg-tea-brown text-primary-foreground px-10 py-4 text-base font-medium rounded hover:bg-tea-brown/90 transition-colors"
                    >
                        {t("bookNow")}
                    </Link>
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
            ),
            title: t("included.item1Title"),
            description: t("included.item1Description"),
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
            ),
            title: t("included.item2Title"),
            description: t("included.item2Description"),
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
            ),
            title: t("included.item3Title"),
            description: t("included.item3Description"),
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
            ),
            title: t("included.item4Title"),
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
                            <h3 className="font-serif text-lg font-semibold text-tea-brown mb-3">
                                {item.title}
                            </h3>
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
        { question: t("faq.q5"), answer: t("faq.a5") },
        { question: t("faq.q6"), answer: t("faq.a6") },
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
export default function WorkshopPage() {
    return (
        <main className="min-h-screen bg-off-white">
            <Navigation />
            <PageHero />
            <ExperienceParts />
            <FAQSection />
            <CTASection />
            <Footer />
        </main>
    )
}
