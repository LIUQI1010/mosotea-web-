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

// Workshop A — Tea Ceremony Experience
function WorkshopASection() {
    const t = useTranslations("experiences")

    return (
        <section className="py-20 px-4 bg-off-white">
            <div className="max-w-5xl mx-auto">
                <div className="bg-card rounded-lg overflow-hidden border border-border">
                    <div className="aspect-[16/9] overflow-hidden">
                        <img
                            src="/images/tea-journey.jpg"
                            alt="Tea Ceremony Experience"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="p-8 md:p-10">
                        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-bamboo-green mb-4">
                            {t("workshopA.label")}
                        </span>
                        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-tea-brown mb-2">
                            {t("workshopA.title")}
                        </h2>
                        <p className="text-sm font-medium text-muted-foreground tracking-wide mb-6">
                            {t("workshopA.subtitle")}
                        </p>
                        <p className="text-foreground/80 leading-relaxed mb-8">
                            {t("workshopA.description")}
                        </p>

                        <ul className="space-y-4 mb-8">
                            {(["1", "2", "3", "4", "5", "6", "7"] as const).map((key) => (
                                <li key={key} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-tea-brown/10 flex items-center justify-center">
                                        <span className="text-xs font-semibold text-tea-brown">{key}</span>
                                    </div>
                                    <span className="text-foreground/80 leading-relaxed">
                                        {t(`workshopA.items.${key}`)}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/book?workshop=A"
                            className="inline-block bg-tea-brown text-primary-foreground px-8 py-3 text-base font-medium rounded hover:bg-tea-brown/90 transition-colors"
                        >
                            {t("workshopA.bookNow")}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

// Workshop B — Tea Making Experience
function WorkshopBSection() {
    const t = useTranslations("experiences")

    return (
        <section className="py-20 px-4 bg-cream">
            <div className="max-w-5xl mx-auto">
                <div className="bg-card rounded-lg overflow-hidden border border-border">
                    <div className="aspect-[16/9] overflow-hidden">
                        <img
                            src="/images/hands-on-experience.jpg"
                            alt="Tea Making Experience"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="p-8 md:p-10">
                        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-bamboo-green mb-4">
                            {t("workshopB.label")}
                        </span>
                        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-tea-brown mb-2">
                            {t("workshopB.title")}
                        </h2>
                        <p className="text-sm font-medium text-muted-foreground tracking-wide mb-6">
                            {t("workshopB.subtitle")}
                        </p>
                        <p className="text-foreground/80 leading-relaxed mb-8">
                            {t("workshopB.description")}
                        </p>

                        <ul className="space-y-4 mb-6">
                            {/* Steps 1-3: hands-on */}
                            {(["1", "2", "3"] as const).map((key) => (
                                <li key={key} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-tea-brown/10 flex items-center justify-center">
                                        <span className="text-xs font-semibold text-tea-brown">{key}</span>
                                    </div>
                                    <span className="text-foreground/80 leading-relaxed">
                                        {t(`workshopB.items.${key}`)}
                                    </span>
                                </li>
                            ))}

                            {/* Overnight notice */}
                            <li className="rounded-lg bg-tea-brown/5 border border-tea-brown/20 px-4 py-3 flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-tea-brown flex-shrink-0 mt-0.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium text-tea-brown leading-relaxed">
                                    {t("workshopB.items.overnightNote")}
                                </span>
                            </li>

                            {/* Steps 4-6: overnight / post-session */}
                            {(["4", "5", "6"] as const).map((key) => (
                                <li key={key} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-tea-brown/10 flex items-center justify-center">
                                        <span className="text-xs font-semibold text-tea-brown">{key}</span>
                                    </div>
                                    <span className="text-foreground/80 leading-relaxed">
                                        {t(`workshopB.items.${key}`)}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {/* Seasonal notice */}
                        <div className="bg-cream rounded-lg p-4 mb-8 border border-border">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {t("workshopB.seasonalNote")}
                            </p>
                        </div>

                        <Link
                            href="/book?workshop=B"
                            className="inline-block border-2 border-tea-brown text-tea-brown px-8 py-3 text-base font-medium rounded hover:bg-tea-brown hover:text-primary-foreground transition-colors"
                        >
                            {t("workshopB.registerInterest")}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

// FAQ Item Component
function FAQItem({ faq, isOpen, onToggle }: {
    faq: { question: string; answer: string }
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
                <h3 className="font-medium text-foreground">{faq.question}</h3>
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
                className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-5" : "max-h-0"}`}
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
            <WorkshopASection />
            <WorkshopBSection />
            <FAQSection />
            <CTASection />
            <Footer />
        </main>
    )
}
