"use client"

import { useState } from "react"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"

// Page Hero
function PageHero() {
    return (
        <section className="pt-24 pb-16 px-4 bg-cream">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="font-serif text-4xl md:text-5xl font-semibold text-tea-brown mb-4">
                    Get in Touch
                </h1>
                <p className="font-serif text-2xl md:text-3xl text-bamboo-green mb-6">
                    聯絡我們
                </p>
                <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    We would love to hear from you. Whether you have questions about our experiences,
                    need help planning a special event, or simply want to say hello.
                </p>
            </div>
        </section>
    )
}

// Contact Information
function ContactInfo() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="font-serif text-2xl font-semibold text-tea-brown mb-6">
                    Contact Information
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                    Visit us in our peaceful garden studio or reach out through any of the channels below.
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
                    <h3 className="font-medium text-foreground mb-1">Address</h3>
                    <p className="text-muted-foreground">123 Garden Lane</p>
                    <p className="text-muted-foreground">Kelburn, Wellington 6012</p>
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
                    <h3 className="font-medium text-foreground mb-1">Email</h3>
                    <a
                        href="mailto:hello@mosotea.co.nz"
                        className="text-tea-brown hover:underline"
                    >
                        hello@mosotea.co.nz
                    </a>
                </div>
            </div>

            {/* Phone */}
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
                            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                        />
                    </svg>
                </div>
                <div>
                    <h3 className="font-medium text-foreground mb-1">Phone</h3>
                    <a
                        href="tel:+6441234567"
                        className="text-tea-brown hover:underline"
                    >
                        +64 4 123 4567
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
                    <h3 className="font-medium text-foreground mb-1">Business Hours</h3>
                    <div className="text-muted-foreground space-y-1">
                        <p>Tuesday - Friday: 10:00 AM - 6:00 PM</p>
                        <p>Saturday - Sunday: 9:00 AM - 5:00 PM</p>
                        <p>Monday: Closed</p>
                    </div>
                </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-8">
                <h3 className="font-medium text-foreground mb-3">Find Us</h3>
                <div className="aspect-[4/3] bg-cream rounded-lg border border-border overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bamboo-green/10 to-tea-brown/10">
                        <div className="text-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1}
                                stroke="currentColor"
                                className="w-12 h-12 text-tea-brown/40 mx-auto mb-2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                                />
                            </svg>
                            <p className="text-sm text-muted-foreground">
                                123 Garden Lane, Kelburn
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Wellington, New Zealand
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Contact Form
function ContactForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
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
            newErrors.name = "Please enter your name"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Please enter your email"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address"
        }

        if (!formData.message.trim()) {
            newErrors.message = "Please enter your message"
        } else if (formData.message.trim().length < 10) {
            newErrors.message = "Message must be at least 10 characters"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)

        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setIsSubmitted(true)
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
                    Message Sent
                </h3>
                <p className="text-muted-foreground mb-2">
                    Thank you for reaching out to us.
                </p>
                <p className="text-muted-foreground mb-6">
                    We will get back to you within 24-48 hours.
                </p>
                <button
                    onClick={() => {
                        setIsSubmitted(false)
                        setFormData({ name: "", email: "", message: "" })
                    }}
                    className="text-tea-brown hover:underline text-sm"
                >
                    Send another message
                </button>
            </div>
        )
    }

    return (
        <div className="bg-card rounded-lg border border-border p-6 md:p-8">
            <h2 className="font-serif text-2xl font-semibold text-tea-brown mb-2">
                Send Us a Message
            </h2>
            <p className="text-muted-foreground mb-6">
                Fill out the form below and we will respond as soon as possible.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-foreground mb-2"
                    >
                        Full Name <span className="text-tea-brown">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className={`w-full px-4 py-3 rounded-lg border bg-off-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-tea-brown/20 focus:border-tea-brown transition-colors ${errors.name ? "border-red-400" : "border-border"
                            }`}
                        placeholder="Your name"
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
                        Email Address <span className="text-tea-brown">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        className={`w-full px-4 py-3 rounded-lg border bg-off-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-tea-brown/20 focus:border-tea-brown transition-colors ${errors.email ? "border-red-400" : "border-border"
                            }`}
                        placeholder="your.email@example.com"
                    />
                    {errors.email && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>
                    )}
                </div>

                {/* Message */}
                <div>
                    <label
                        htmlFor="message"
                        className="block text-sm font-medium text-foreground mb-2"
                    >
                        Message <span className="text-tea-brown">*</span>
                    </label>
                    <textarea
                        id="message"
                        rows={6}
                        value={formData.message}
                        onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                        }
                        className={`w-full px-4 py-3 rounded-lg border bg-off-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-tea-brown/20 focus:border-tea-brown transition-colors resize-none ${errors.message ? "border-red-400" : "border-border"
                            }`}
                        placeholder="How can we help you?"
                    />
                    {errors.message && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.message}</p>
                    )}
                </div>

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
                            <span>Sending...</span>
                        </>
                    ) : (
                        <>
                            <span>Send Message</span>
                            <span className="text-primary-foreground/80">/ 發送訊息</span>
                        </>
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
