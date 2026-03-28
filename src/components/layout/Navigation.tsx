"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Link, useRouter, usePathname } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"

export function Navigation() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const t = useTranslations("navigation")
    const locale = useLocale() as Locale
    const router = useRouter()
    const pathname = usePathname()

    const navLinks = [
        { href: "/" as const, label: t("home") },
        { href: "/workshop" as const, label: t("experiences") },
        { href: "/about" as const, label: t("about") },
        { href: "/gallery" as const, label: t("gallery") },
        { href: "/contact" as const, label: t("contact") },
    ]

    const switchLocale = (newLocale: Locale) => {
        router.replace(pathname, { locale: newLocale })
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-off-white/95 backdrop-blur-sm border-b border-border">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="font-serif text-2xl font-semibold text-tea-brown">
                        Moso Tea
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm transition-colors ${pathname === link.href
                                    ? "text-tea-brown font-medium"
                                    : "text-foreground hover:text-tea-brown"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side - Language Toggle & CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm">
                            <button
                                onClick={() => switchLocale("en")}
                                className={`px-2 py-1 transition-colors ${locale === "en" ? "text-tea-brown font-semibold" : "text-muted-foreground/50 hover:text-muted-foreground"
                                    }`}
                            >
                                EN
                            </button>
                            <span className="text-border">|</span>
                            <button
                                onClick={() => switchLocale("zh-TW")}
                                className={`px-2 py-1 transition-colors ${locale === "zh-TW" ? "text-tea-brown font-semibold" : "text-muted-foreground/50 hover:text-muted-foreground"
                                    }`}
                            >
                                繁中
                            </button>
                        </div>
                        <Link
                            href="/book"
                            className="bg-tea-brown text-primary-foreground px-5 py-2 text-sm font-medium rounded hover:bg-tea-brown/90 transition-colors"
                        >
                            {t("bookNow")}
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-foreground"
                        aria-label="Toggle menu"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4 border-t border-border mt-2 pt-4">
                        <div className="flex flex-col gap-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm py-2 transition-colors ${pathname === link.href
                                        ? "text-tea-brown font-medium"
                                        : "text-foreground hover:text-tea-brown"
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="flex items-center gap-1 py-2">
                                <button
                                    onClick={() => switchLocale("en")}
                                    className={`px-2 py-1 text-sm transition-colors ${locale === "en" ? "text-tea-brown font-semibold" : "text-muted-foreground/50 hover:text-muted-foreground"
                                        }`}
                                >
                                    EN
                                </button>
                                <span className="text-border">|</span>
                                <button
                                    onClick={() => switchLocale("zh-TW")}
                                    className={`px-2 py-1 text-sm transition-colors ${locale === "zh-TW" ? "text-tea-brown font-semibold" : "text-muted-foreground/50 hover:text-muted-foreground"
                                        }`}
                                >
                                    繁中
                                </button>
                            </div>
                            <Link
                                href="/book"
                                className="bg-tea-brown text-primary-foreground px-5 py-2.5 text-sm font-medium rounded text-center hover:bg-tea-brown/90 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t("bookNow")}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
