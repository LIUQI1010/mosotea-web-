"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"

interface BookingInfo {
    customerName: string
    guestCount: number
    startTime: string
    isCancellable: boolean
}

type PageState = "loading" | "details" | "cancelling" | "success" | "error"
type ErrorType = "invalid" | "already_cancelled" | "expired" | "too_late" | "general"

function formatDateTime(isoString: string, locale: string): string {
    return new Date(isoString).toLocaleString(locale === "zh-TW" ? "zh-TW" : "en-NZ", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Pacific/Auckland",
    })
}

export default function CancelBookingPage() {
    const params = useParams()
    const token = params.token as string
    const t = useTranslations("cancel")
    const locale = useLocale()

    const [state, setState] = useState<PageState>("loading")
    const [booking, setBooking] = useState<BookingInfo | null>(null)
    const [errorType, setErrorType] = useState<ErrorType>("general")

    useEffect(() => {
        async function lookupBooking() {
            try {
                const res = await fetch(`/api/cancel/lookup?token=${encodeURIComponent(token)}`)
                const data = await res.json()

                if (!data.success) {
                    setErrorType(data.error === "already_cancelled" ? "already_cancelled"
                        : data.error === "expired" ? "expired" : "invalid")
                    setState("error")
                    return
                }

                if (!data.data.isCancellable) {
                    setErrorType("too_late")
                    setState("error")
                    return
                }

                setBooking(data.data)
                setState("details")
            } catch {
                setErrorType("general")
                setState("error")
            }
        }

        lookupBooking()
    }, [token])

    async function handleCancel() {
        setState("cancelling")
        try {
            const res = await fetch("/api/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            })
            const data = await res.json()

            if (data.success) {
                setState("success")
            } else {
                setErrorType(data.tooLate ? "too_late" : "general")
                setState("error")
            }
        } catch {
            setErrorType("general")
            setState("error")
        }
    }

    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-off-white">
                <section className="pt-32 pb-16 px-4 bg-cream">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-tea-brown mb-3">
                            {t("title")}
                        </h1>
                    </div>
                </section>

                <section className="py-16 px-4">
                    <div className="max-w-lg mx-auto">
                        {state === "loading" && <LoadingState message={t("loading")} />}
                        {state === "details" && booking && (
                            <DetailsState booking={booking} locale={locale} t={t} onCancel={handleCancel} />
                        )}
                        {state === "cancelling" && <LoadingState message={t("cancelling")} />}
                        {state === "success" && <SuccessState t={t} />}
                        {state === "error" && <ErrorState errorType={errorType} t={t} />}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}

function LoadingState({ message }: { message: string }) {
    return (
        <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-tea-brown border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{message}</p>
        </div>
    )
}

function DetailsState({ booking, locale, t, onCancel }: {
    booking: BookingInfo
    locale: string
    t: (key: string) => string
    onCancel: () => void
}) {
    return (
        <div className="bg-white rounded-lg border border-border p-8">
            <h2 className="font-serif text-2xl text-tea-brown mb-6">{t("bookingDetails")}</h2>

            <table className="w-full mb-8">
                <tbody>
                    <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">{t("experience")}</td>
                        <td className="py-3 text-right font-medium">{t("workshopName")}</td>
                    </tr>
                    <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">{t("dateTime")}</td>
                        <td className="py-3 text-right font-medium">{formatDateTime(booking.startTime, locale)}</td>
                    </tr>
                    <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">{t("guests")}</td>
                        <td className="py-3 text-right font-medium">{booking.guestCount}</td>
                    </tr>
                </tbody>
            </table>

            <div className="bg-cream rounded-lg p-4 mb-8">
                <p className="font-semibold text-tea-brown mb-1">{t("confirmTitle")}</p>
                <p className="text-sm text-muted-foreground">{t("confirmDescription")}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 bg-tea-brown text-white py-3 px-6 rounded-lg hover:bg-tea-brown/90 transition-colors font-medium"
                >
                    {t("confirmButton")}
                </button>
                <Link
                    href="/"
                    className="flex-1 text-center border border-border py-3 px-6 rounded-lg hover:bg-cream transition-colors font-medium"
                >
                    {t("keepButton")}
                </Link>
            </div>
        </div>
    )
}

function SuccessState({ t }: { t: (key: string) => string }) {
    return (
        <div className="text-center py-8">
            <div className="w-16 h-16 bg-bamboo-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-bamboo-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="font-serif text-2xl text-tea-brown mb-3">{t("successTitle")}</h2>
            <p className="text-muted-foreground mb-8">{t("successDescription")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                    href="/book"
                    className="bg-tea-brown text-white py-3 px-6 rounded-lg hover:bg-tea-brown/90 transition-colors font-medium"
                >
                    {t("successRebook")}
                </Link>
                <Link
                    href="/"
                    className="border border-border py-3 px-6 rounded-lg hover:bg-cream transition-colors font-medium"
                >
                    {t("returnHome")}
                </Link>
            </div>
        </div>
    )
}

function ErrorState({ errorType, t }: { errorType: ErrorType; t: (key: string) => string }) {
    return (
        <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>

            {errorType === "too_late" ? (
                <>
                    <h2 className="font-serif text-2xl text-tea-brown mb-3">{t("errorTooLate")}</h2>
                    <p className="text-muted-foreground mb-6">{t("errorTooLateDescription")}</p>
                    <div className="bg-cream rounded-lg p-6 mb-8 text-left">
                        <p className="font-semibold text-tea-brown mb-2">{t("contactUs")}</p>
                        <p className="text-sm text-muted-foreground">{t("contactEmail")}</p>
                    </div>
                </>
            ) : (
                <>
                    <h2 className="font-serif text-2xl text-tea-brown mb-3">
                        {errorType === "already_cancelled" ? t("errorAlreadyCancelled")
                            : errorType === "expired" ? t("errorExpired")
                            : errorType === "invalid" ? t("errorInvalid")
                            : t("errorGeneral")}
                    </h2>
                </>
            )}

            <Link
                href="/"
                className="inline-block border border-border py-3 px-6 rounded-lg hover:bg-cream transition-colors font-medium mt-4"
            >
                {t("returnHome")}
            </Link>
        </div>
    )
}
