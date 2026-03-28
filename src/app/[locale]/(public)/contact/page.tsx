"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"

// Page Hero
function PageHero() {
    const t = useTranslations("contact")

    return (
        <section className="pt-24 pb-16 px-4 bg-cream">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="font-serif text-4xl md:text-5xl font-semibold text-tea-brown mb-4">
                    {t("hero.title")}
                </h1>
                <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed mt-6">
                    {t("hero.description")}
                </p>
            </div>
        </section>
    )
}

// Contact Information
function ContactInfo() {
    const t = useTranslations("contact")

    return (
        <div className="space-y-8">
            <div>
                <h2 className="font-serif text-2xl font-semibold text-tea-brown mb-6">
                    {t("info.title")}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                    {t("info.description")}
                </p>
            </div>

            {/* Address */}
            <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-cream rounded-full flex items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-tea-brown"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                    </svg>
                </div>
                <div>
                    <h3 className="font-medium text-foreground mb-1">{t("info.address")}</h3>
                    <p className="text-muted-foreground">69 Crowther Road</p>
                    <p className="text-muted-foreground">Lower Hutt, Wellington 5373</p>
                    <p className="text-muted-foreground">New Zealand</p>
                </div>
            </div>

            {/* Email */}
            <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-cream rounded-full flex items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-tea-brown"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                    </svg>
                </div>
                <div>
                    <h3 className="font-medium text-foreground mb-1">{t("info.email")}</h3>
                    <a
                        href="mailto:hello@mosotea.co.nz"
                        className="text-tea-brown hover:underline"
                    >
                        hello@mosotea.co.nz
                    </a>
                </div>
            </div>

            {/* Business Hours */}
            <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-cream rounded-full flex items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-tea-brown"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <div>
                    <h3 className="font-medium text-foreground mb-1">{t("info.hours")}</h3>
                    <div className="text-muted-foreground space-y-1">
                        <p>{t("info.hours1")}</p>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="mt-8">
                <h3 className="font-medium text-foreground mb-3">{t("info.findUs")}</h3>
                <div className="aspect-[4/3] rounded-lg border border-border overflow-hidden">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2999.5!2d174.9536!3d-41.2094!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s!2s69+Crowther+Road%2C+Wainuiomata%2C+Lower+Hutt+5373%2C+New+Zealand!5e0!3m2!1sen!2snz"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Moso Tea Location"
                    />
                </div>
            </div>
        </div>
    )
}

// Contact Form
function ContactForm() {
    const t = useTranslations("contact")

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    })
    const [errors, setErrors] = useState<{
        name?: string
        email?: string
        message?: string
    }>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const validateForm = () => {
        const newErrors: typeof errors = {}

        if (!formData.name.trim()) {
            newErrors.name = t("form.errorName")
        }

        if (!formData.email.trim()) {
            newErrors.email = t("form.errorEmail")
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t("form.errorEmailInvalid")
        }

        if (!formData.message.trim()) {
            newErrors.message = t("form.errorMessage")
        } else if (formData.message.trim().length < 10) {
            newErrors.message = t("form.errorMessageMin")
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const [submitError, setSubmitError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)
        setSubmitError("")

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!data.success) {
                setSubmitError(data.error || "Something went wrong. Please try again.")
                return
            }

            setIsSubmitted(true)
        } catch {
            setSubmitError("Failed to send message. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
                <div className="w-16 h-16 bg-bamboo-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-8 h-8 text-bamboo-green"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                        />
                    </svg>
                </div>
                <h3 className="font-serif text-2xl font-semibold text-tea-brown mb-3">
                    {t("form.successTitle")}
                </h3>
                <p className="text-muted-foreground mb-2">
                    {t("form.successMessage")}
                </p>
                <p className="text-muted-foreground mb-6">
                    {t("form.successFollowUp")}
                </p>
                <button
                    onClick={() => {
                        setIsSubmitted(false)
                        setFormData({ name: "", email: "", phone: "", message: "" })
                    }}
                    className="text-tea-brown hover:underline text-sm"
                >
                    {t("form.sendAnother")}
                </button>
            </div>
        )
    }

    return (
        <div className="bg-card rounded-lg border border-border p-6 md:p-8">
            <h2 className="font-serif text-2xl font-semibold text-tea-brown mb-2">
                {t("form.title")}
            </h2>
            <p className="text-muted-foreground mb-6">
                {t("form.description")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-foreground mb-2"
                    >
                        {t("form.name")} <span className="text-tea-brown">{t("form.required")}</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        maxLength={100}
                        className={`w-full px-4 py-3 rounded-lg border bg-off-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-tea-brown/20 focus:border-tea-brown transition-colors ${errors.name ? "border-red-400" : "border-border"
                            }`}
                        placeholder={t("form.namePlaceholder")}
                    />
                    {errors.name && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>
                    )}
                </div>

                {/* Email Address */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground mb-2"
                    >
                        {t("form.email")} <span className="text-tea-brown">{t("form.required")}</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        maxLength={100}
                        className={`w-full px-4 py-3 rounded-lg border bg-off-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-tea-brown/20 focus:border-tea-brown transition-colors ${errors.email ? "border-red-400" : "border-border"
                            }`}
                        placeholder={t("form.emailPlaceholder")}
                    />
                    {errors.email && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>
                    )}
                </div>

                {/* Phone Number (Optional) */}
                <div>
                    <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-foreground mb-2"
                    >
                        {t("form.phone")} <span className="text-muted-foreground text-xs">{t("form.phoneOptional")}</span>
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                        }
                        maxLength={20}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-off-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-tea-brown/20 focus:border-tea-brown transition-colors"
                        placeholder={t("form.phonePlaceholder")}
                    />
                </div>

                {/* Message */}
                <div>
                    <label
                        htmlFor="message"
                        className="block text-sm font-medium text-foreground mb-2"
                    >
                        {t("form.message")} <span className="text-tea-brown">{t("form.required")}</span>
                    </label>
                    <textarea
                        id="message"
                        rows={6}
                        value={formData.message}
                        onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                        }
                        maxLength={2000}
                        className={`w-full px-4 py-3 rounded-lg border bg-off-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-tea-brown/20 focus:border-tea-brown transition-colors resize-none ${errors.message ? "border-red-400" : "border-border"
                            }`}
                        placeholder={t("form.messagePlaceholder")}
                    />
                    {errors.message && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.message}</p>
                    )}
                </div>

                {/* Error Message */}
                {submitError && (
                    <p className="text-sm text-red-500 text-center">{submitError}</p>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-tea-brown text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-tea-brown/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <svg
                                className="animate-spin h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            <span>{t("form.sending")}</span>
                        </>
                    ) : (
                        <span>{t("form.submit")}</span>
                    )}
                </button>
            </form>
        </div>
    )
}

// Main Page
export default function ContactPage() {
    return (
        <main className="min-h-screen bg-off-white">
            <Navigation />
            <PageHero />

            {/* Two-Column Layout */}
            <section className="py-16 px-4 bg-off-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Left Column - Contact Info */}
                        <ContactInfo />

                        {/* Right Column - Contact Form */}
                        <ContactForm />
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
