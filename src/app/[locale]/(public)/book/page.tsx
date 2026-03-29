"use client"

import { useState, Suspense } from "react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"

// Fixed workshop price
const PRICE_PER_PERSON = 75

// Workshop type
type WorkshopType = "A" | "B" | ""

// Available time slot from API
interface AvailableSlot {
    id: string
    start_time: string
    end_time: string
    remaining: number
}

// Form data interface
interface BookingFormData {
    workshop: WorkshopType
    date: string
    timeSlotId: string
    timeSlotLabel: string
    maxGuests: number
    fullName: string
    email: string
    phone: string
    guests: number
    specialRequests: string
    preferredLanguage: "en"
}

// Interest form data
interface InterestFormData {
    fullName: string
    email: string
    phone: string
    guests: number
    message: string
}

// Form errors interface
interface FormErrors {
    workshop?: string
    date?: string
    timeSlot?: string
    fullName?: string
    email?: string
    phone?: string
    guests?: string
    specialRequests?: string
    message?: string
}

// Page Hero Section
function PageHero() {
    const t = useTranslations("book")

    return (
        <section className="pt-32 pb-16 px-4 bg-cream">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="font-serif text-4xl md:text-5xl font-semibold text-tea-brown mb-3">
                    {t("hero.title")}
                </h1>
                <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed mt-6">
                    {t("hero.description")}
                </p>
            </div>
        </section>
    )
}

// Step Indicator Component (for Workshop A booking flow)
function StepIndicator({ currentStep, workshopType }: { currentStep: number; workshopType: WorkshopType }) {
    const t = useTranslations("book")

    const steps = workshopType === "A"
        ? [
            { number: 1, label: t("steps.workshop") },
            { number: 2, label: t("steps.dateTime") },
            { number: 3, label: t("steps.details") },
        ]
        : [
            { number: 1, label: t("steps.workshop") },
        ]

    return (
        <div className="flex items-center justify-center mb-10">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-colors ${currentStep >= step.number
                                    ? "bg-tea-brown text-primary-foreground"
                                    : "bg-border text-muted-foreground"
                                }`}
                        >
                            {currentStep > step.number ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            ) : (
                                step.number
                            )}
                        </div>
                        <div className="mt-2 text-center hidden sm:block">
                            <p className={`text-xs font-medium ${currentStep >= step.number ? "text-tea-brown" : "text-muted-foreground"}`}>
                                {step.label}
                            </p>
                        </div>
                    </div>
                    {index < steps.length - 1 && (
                        <div
                            className={`w-12 sm:w-20 h-0.5 mx-2 sm:mx-4 ${currentStep > step.number ? "bg-tea-brown" : "bg-border"
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

// Step 1: Workshop Selection
function WorkshopSelection({
    selected,
    onSelect,
}: {
    selected: WorkshopType
    onSelect: (type: WorkshopType) => void
}) {
    const t = useTranslations("book")

    return (
        <div>
            <h2 className="font-serif text-2xl font-semibold text-tea-brown mb-2">
                {t("step1.title")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("step1.description")}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Workshop A */}
                <button
                    onClick={() => onSelect("A")}
                    className={`text-left p-6 rounded-lg border-2 transition-all ${selected === "A"
                            ? "border-tea-brown bg-tea-brown/5"
                            : "border-border bg-off-white hover:border-tea-brown/50"
                        }`}
                >
                    <h3 className="font-serif text-lg font-semibold text-tea-brown mb-2">
                        {t("step1.workshopA")}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {t("step1.workshopADesc")}
                    </p>
                    <p className="text-xs font-medium text-tea-brown/70">
                        {t("step1.workshopAStats")}
                    </p>
                </button>

                {/* Workshop B */}
                <button
                    onClick={() => onSelect("B")}
                    className={`text-left p-6 rounded-lg border-2 transition-all ${selected === "B"
                            ? "border-tea-brown bg-tea-brown/5"
                            : "border-border bg-off-white hover:border-tea-brown/50"
                        }`}
                >
                    <h3 className="font-serif text-lg font-semibold text-tea-brown mb-2">
                        {t("step1.workshopB")}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {t("step1.workshopBDesc")}
                    </p>
                    <p className="text-xs font-medium text-tea-brown/70">
                        {t("step1.workshopBStats")}
                    </p>
                </button>
            </div>

            {selected === "B" && (
                <div className="mt-4 bg-cream rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("step1.workshopBNote")}
                    </p>
                </div>
            )}
        </div>
    )
}

// Calendar Component
function Calendar({
    selectedDate,
    onSelect,
}: {
    selectedDate: string
    onSelect: (date: string) => void
}) {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDay = firstDay.getDay()

        const days: (number | null)[] = []
        for (let i = 0; i < startingDay; i++) {
            days.push(null)
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i)
        }
        return days
    }

    const formatDate = (day: number) => {
        const year = currentMonth.getFullYear()
        const month = String(currentMonth.getMonth() + 1).padStart(2, "0")
        const dayStr = String(day).padStart(2, "0")
        return `${year}-${month}-${dayStr}`
    }

    const isDateDisabled = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date < today
    }

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    const days = getDaysInMonth(currentMonth)

    return (
        <div className="bg-off-white rounded-lg p-4 border border-border">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-cream rounded transition-colors text-muted-foreground hover:text-foreground"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <h3 className="font-medium text-foreground">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-cream rounded transition-colors text-muted-foreground hover:text-foreground"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                    <div key={index} className="aspect-square">
                        {day && (
                            <button
                                onClick={() => !isDateDisabled(day) && onSelect(formatDate(day))}
                                disabled={isDateDisabled(day)}
                                className={`w-full h-full rounded-lg text-sm font-medium transition-colors ${selectedDate === formatDate(day)
                                        ? "bg-tea-brown text-primary-foreground"
                                        : isDateDisabled(day)
                                            ? "text-muted-foreground/40 cursor-not-allowed"
                                            : "text-foreground hover:bg-cream"
                                    }`}
                            >
                                {day}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// Format a time slot's start/end into a readable label (always NZ time)
function formatSlotLabel(startTime: string, endTime: string): string {
    const fmt = (iso: string) =>
        new Date(iso).toLocaleTimeString("en-NZ", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: "Pacific/Auckland",
        })
    return `${fmt(startTime)} - ${fmt(endTime)}`
}

// Step 2: Date & Time Selection
function DateTimeSelection({
    selectedDate,
    selectedSlotId,
    onDateSelect,
    onSlotSelect,
    errors,
}: {
    selectedDate: string
    selectedSlotId: string
    onDateSelect: (date: string) => void
    onSlotSelect: (slotId: string, label: string, remaining: number) => void
    errors: FormErrors
}) {
    const t = useTranslations("book")
    const [slots, setSlots] = useState<AvailableSlot[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [fetchedDate, setFetchedDate] = useState("")

    // Fetch slots when date changes
    if (selectedDate !== fetchedDate) {
        setFetchedDate(selectedDate)
        if (!selectedDate) {
            setSlots([])
            setLoadingSlots(false)
        } else {
            setLoadingSlots(true)
            fetch(`/api/time-slots?date=${selectedDate}`)
                .then((res) => res.json())
                .then((data) => {
                    setSlots(data.success ? data.data : [])
                })
                .catch(() => setSlots([]))
                .finally(() => setLoadingSlots(false))
        }
    }

    return (
        <div>
            <h2 className="font-serif text-2xl font-semibold text-tea-brown mb-2">
                {t("step2.title")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("step2.description")}</p>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Calendar */}
                <div>
                    <h3 className="font-medium text-foreground mb-3">{t("step2.selectDate")}</h3>
                    <Calendar selectedDate={selectedDate} onSelect={onDateSelect} />
                    {errors.date && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            {errors.date}
                        </p>
                    )}
                </div>

                {/* Time Slots */}
                {selectedDate ? (
                    <div>
                        <h3 className="font-medium text-foreground mb-3">{t("step2.selectTime")}</h3>
                        {loadingSlots ? (
                            <div className="grid grid-cols-1 gap-3">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-12 rounded-lg bg-border animate-pulse" />
                                ))}
                            </div>
                        ) : slots.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {slots.map((slot) => {
                                    const label = formatSlotLabel(slot.start_time, slot.end_time)
                                    return (
                                        <button
                                            key={slot.id}
                                            onClick={() => onSlotSelect(slot.id, label, slot.remaining)}
                                            className={`py-3 px-4 rounded-lg border-2 font-medium text-sm transition-all ${selectedSlotId === slot.id
                                                    ? "border-tea-brown bg-tea-brown text-primary-foreground"
                                                    : "border-border bg-off-white text-foreground hover:border-tea-brown/50"
                                                }`}
                                        >
                                            <span>{label}</span>
                                            <span className="ml-2 text-xs opacity-70">
                                                ({slot.remaining} spots)
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-8">
                                <p className="text-muted-foreground text-sm text-center">
                                    No available time slots for this date
                                </p>
                            </div>
                        )}
                        {errors.timeSlot && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                {errors.timeSlot}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-8">
                        <p className="text-muted-foreground text-sm text-center">
                            {t("step2.selectDateFirst")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

// Input Field Component
function InputField({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
    required = false,
    maxLength,
}: {
    label: string
    type?: string
    value: string | number
    onChange: (value: string) => void
    placeholder?: string
    error?: string
    required?: boolean
    maxLength?: number
}) {
    return (
        <div>
            <label className="block mb-2">
                <span className="font-medium text-foreground">{label}</span>
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-off-white transition-colors focus:outline-none focus:ring-0 ${error
                        ? "border-red-400 focus:border-red-500"
                        : "border-border focus:border-tea-brown"
                    }`}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    )
}

// Step 3: Personal Details (Workshop A)
function PersonalDetails({
    formData,
    onFieldChange,
    errors,
}: {
    formData: BookingFormData
    onFieldChange: (field: keyof BookingFormData, value: string | number) => void
    errors: FormErrors
}) {
    const t = useTranslations("book")

    return (
        <div>
            <h2 className="font-serif text-2xl font-semibold text-tea-brown mb-2">
                {t("step3.title")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("step3.description")}</p>

            <div className="space-y-5">
                <InputField
                    label={t("step3.fullName")}
                    value={formData.fullName}
                    onChange={(value) => onFieldChange("fullName", value)}
                    placeholder={t("step3.fullNamePlaceholder")}
                    error={errors.fullName}
                    required
                    maxLength={30}
                />

                <InputField
                    label={t("step3.email")}
                    type="email"
                    value={formData.email}
                    onChange={(value) => onFieldChange("email", value)}
                    placeholder={t("step3.emailPlaceholder")}
                    error={errors.email}
                    required
                    maxLength={100}
                />

                <InputField
                    label={t("step3.phone")}
                    type="tel"
                    value={formData.phone}
                    onChange={(value) => onFieldChange("phone", value)}
                    placeholder={t("step3.phonePlaceholder")}
                    error={errors.phone}
                    required
                    maxLength={20}
                />

                {/* Guest Count */}
                <div>
                    <label className="block mb-2">
                        <span className="font-medium text-foreground">{t("step3.guests")}</span>
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                if (formData.guests > 1) onFieldChange("guests", formData.guests - 1)
                            }}
                            disabled={formData.guests <= 1}
                            className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-colors ${formData.guests <= 1
                                    ? "border-border text-muted-foreground/40 cursor-not-allowed"
                                    : "border-tea-brown text-tea-brown hover:bg-tea-brown hover:text-primary-foreground"
                                }`}
                        >
                            −
                        </button>
                        <span className="w-12 text-center text-2xl font-semibold text-foreground tabular-nums">
                            {formData.guests}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                if (formData.guests < formData.maxGuests) onFieldChange("guests", formData.guests + 1)
                            }}
                            disabled={formData.guests >= formData.maxGuests}
                            className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-colors ${formData.guests >= 8
                                    ? "border-border text-muted-foreground/40 cursor-not-allowed"
                                    : "border-tea-brown text-tea-brown hover:bg-tea-brown hover:text-primary-foreground"
                                }`}
                        >
                            +
                        </button>
                        <span className="text-sm text-muted-foreground ml-1">
                            {t("step3.guestsMax", { max: formData.maxGuests })}
                        </span>
                    </div>
                    {errors.guests && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            {errors.guests}
                        </p>
                    )}
                </div>

                {/* Special Requests */}
                <div>
                    <label className="block mb-2">
                        <span className="font-medium text-foreground">{t("step3.specialRequests")}</span>
                    </label>
                    <textarea
                        value={formData.specialRequests}
                        onChange={(e) => onFieldChange("specialRequests", e.target.value)}
                        placeholder={t("step3.specialRequestsPlaceholder")}
                        rows={3}
                        maxLength={200}
                        className={`w-full px-4 py-3 rounded-lg border-2 bg-off-white transition-colors focus:outline-none focus:ring-0 resize-none ${errors.specialRequests ? "border-red-400 focus:border-red-400" : "border-border focus:border-tea-brown"}`}
                    />
                    {errors.specialRequests && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.specialRequests}</p>
                    )}
                </div>

            </div>
        </div>
    )
}

// Workshop B Interest Form
function InterestForm({
    formData,
    onFieldChange,
    errors,
}: {
    formData: InterestFormData
    onFieldChange: (field: keyof InterestFormData, value: string | number) => void
    errors: FormErrors
}) {
    const t = useTranslations("book")

    return (
        <div>
            <h2 className="font-serif text-2xl font-semibold text-tea-brown mb-2">
                {t("interest.title")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("interest.description")}</p>

            <div className="space-y-5">
                <InputField
                    label={t("interest.fullName")}
                    value={formData.fullName}
                    onChange={(value) => onFieldChange("fullName", value)}
                    placeholder={t("interest.fullNamePlaceholder")}
                    error={errors.fullName}
                    required
                    maxLength={30}
                />

                <InputField
                    label={t("interest.email")}
                    type="email"
                    value={formData.email}
                    onChange={(value) => onFieldChange("email", value)}
                    placeholder={t("interest.emailPlaceholder")}
                    error={errors.email}
                    required
                    maxLength={100}
                />

                <InputField
                    label={t("interest.phone")}
                    type="tel"
                    value={formData.phone}
                    onChange={(value) => onFieldChange("phone", value)}
                    placeholder={t("interest.phonePlaceholder")}
                    error={errors.phone}
                    required
                    maxLength={20}
                />

                {/* Estimated Group Size */}
                <div>
                    <label className="block mb-2">
                        <span className="font-medium text-foreground">{t("interest.guests")}</span>
                    </label>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                if (formData.guests > 1) onFieldChange("guests", formData.guests - 1)
                            }}
                            disabled={formData.guests <= 1}
                            className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-colors ${formData.guests <= 1
                                    ? "border-border text-muted-foreground/40 cursor-not-allowed"
                                    : "border-tea-brown text-tea-brown hover:bg-tea-brown hover:text-primary-foreground"
                                }`}
                        >
                            −
                        </button>
                        <span className="w-12 text-center text-2xl font-semibold text-foreground tabular-nums">
                            {formData.guests}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                if (formData.guests < 8) onFieldChange("guests", formData.guests + 1)
                            }}
                            disabled={formData.guests >= 8}
                            className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-colors ${formData.guests >= 8
                                    ? "border-border text-muted-foreground/40 cursor-not-allowed"
                                    : "border-tea-brown text-tea-brown hover:bg-tea-brown hover:text-primary-foreground"
                                }`}
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Message */}
                <div>
                    <label className="block mb-2">
                        <span className="font-medium text-foreground">{t("interest.message")}</span>
                    </label>
                    <textarea
                        value={formData.message}
                        onChange={(e) => onFieldChange("message", e.target.value)}
                        placeholder={t("interest.messagePlaceholder")}
                        rows={4}
                        maxLength={500}
                        className={`w-full px-4 py-3 rounded-lg border-2 bg-off-white transition-colors focus:outline-none focus:ring-0 resize-none ${errors.message ? "border-red-400 focus:border-red-400" : "border-border focus:border-tea-brown"}`}
                    />
                    {errors.message && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.message}</p>
                    )}
                </div>
            </div>
        </div>
    )
}

// Booking Summary (Workshop A only)
function BookingSummary({ formData }: { formData: BookingFormData }) {
    const t = useTranslations("book")

    const totalPrice = PRICE_PER_PERSON * formData.guests

    return (
        <div className="bg-cream rounded-lg p-6 border border-border">
            <h3 className="font-serif text-lg font-semibold text-tea-brown mb-4">
                {t("summary.title")}
            </h3>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("summary.experience")}</span>
                    <span className="font-medium text-foreground">{t("summary.workshopA")}</span>
                </div>
                {formData.date && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("summary.date")}</span>
                        <span className="font-medium text-foreground">
                            {new Date(formData.date).toLocaleDateString("en-NZ", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                timeZone: "Pacific/Auckland",
                            })}
                        </span>
                    </div>
                )}
                {formData.timeSlotLabel && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("summary.time")}</span>
                        <span className="font-medium text-foreground">{formData.timeSlotLabel}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("summary.guests")}</span>
                    <span className="font-medium text-foreground">{formData.guests}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("summary.price")}</span>
                    <span className="font-medium text-foreground">NZ${PRICE_PER_PERSON} / person</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between">
                    <span className="font-medium text-foreground">{t("summary.total")}</span>
                    <span className="font-semibold text-tea-brown text-lg">NZ${totalPrice}</span>
                </div>
            </div>
        </div>
    )
}

// Success Message
function SuccessMessage({ type }: { type: "booking" | "interest" }) {
    const t = useTranslations("book")
    const key = type === "interest" ? "interestSuccess" : "success"

    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 bg-bamboo-green/10 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-bamboo-green">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            </div>
            <h2 className="font-serif text-2xl font-semibold text-tea-brown mb-3">
                {t(`${key}.title`)}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed mt-4">
                {t(`${key}.description`)}
            </p>
            <Link
                href="/"
                className="inline-block bg-tea-brown text-primary-foreground px-8 py-3 font-medium rounded hover:bg-tea-brown/90 transition-colors"
            >
                {t(`${key}.returnHome`)}
            </Link>
        </div>
    )
}

// Error Message
function ErrorMessage({ errorMessage, onRetry }: { errorMessage: string; onRetry: () => void }) {
    const t = useTranslations("book")

    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
            </div>
            <h2 className="font-serif text-2xl font-semibold text-tea-brown mb-3">
                {t("error.title")}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-4 leading-relaxed mt-4">
                {t("error.description")}
            </p>
            {errorMessage && (
                <p className="text-sm text-red-600 mb-8">{errorMessage}</p>
            )}
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={onRetry}
                    className="inline-block bg-tea-brown text-primary-foreground px-8 py-3 font-medium rounded hover:bg-tea-brown/90 transition-colors"
                >
                    {t("error.retry")}
                </button>
                <Link
                    href="/contact"
                    className="inline-block border-2 border-tea-brown text-tea-brown px-8 py-3 font-medium rounded hover:bg-tea-brown/5 transition-colors"
                >
                    {t("error.contact")}
                </Link>
            </div>
        </div>
    )
}

// Booking Form Component (handles both Workshop A booking and Workshop B interest)
function BookingFormInner() {
    const t = useTranslations("book")
    const searchParams = useSearchParams()

    const workshopParam = searchParams.get("workshop")
    const initialWorkshop: WorkshopType = workshopParam === "B" ? "B" : workshopParam === "A" ? "A" : ""

    const [currentStep, setCurrentStep] = useState(initialWorkshop ? 1 : 1)
    const [workshopType, setWorkshopType] = useState<WorkshopType>(initialWorkshop)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState("")

    // Workshop A form data
    const [formData, setFormData] = useState<BookingFormData>({
        workshop: initialWorkshop || "",
        date: "",
        timeSlotId: "",
        timeSlotLabel: "",
        maxGuests: 8,
        fullName: "",
        email: "",
        phone: "",
        guests: 1,
        specialRequests: "",
        preferredLanguage: "en",
    })

    // Workshop B interest form data
    const [interestData, setInterestData] = useState<InterestFormData>({
        fullName: "",
        email: "",
        phone: "",
        guests: 1,
        message: t("interest.defaultMessage"),
    })

    const [errors, setErrors] = useState<FormErrors>({})

    // Total steps depends on workshop type
    const totalSteps = workshopType === "A" ? 3 : workshopType === "B" ? 2 : 1

    const validateStep = (step: number): boolean => {
        const newErrors: FormErrors = {}

        if (step === 1) {
            if (!workshopType) {
                newErrors.workshop = "Please select a workshop"
            }
        }

        if (step === 2 && workshopType === "A") {
            if (!formData.date) newErrors.date = t("step2.errorDate")
            if (!formData.timeSlotId) newErrors.timeSlot = t("step2.errorTime")
        }

        if (step === 2 && workshopType === "B") {
            // Validate interest form
            const trimmedName = interestData.fullName.trim()
            if (!trimmedName) newErrors.fullName = t("step3.errorName")
            else if (trimmedName.length < 2) newErrors.fullName = t("step3.errorNameShort")
            else if (trimmedName.length > 30) newErrors.fullName = t("step3.errorNameTooLong")

            const trimmedEmail = interestData.email.trim()
            if (!trimmedEmail) newErrors.email = t("step3.errorEmail")
            else if (trimmedEmail.length > 100) newErrors.email = t("step3.errorEmailTooLong")
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) newErrors.email = t("step3.errorEmailInvalid")

            const trimmedPhone = interestData.phone.trim()
            if (!trimmedPhone) newErrors.phone = t("step3.errorPhone")
            else if (trimmedPhone.length > 20) newErrors.phone = t("step3.errorPhoneTooLong")
            else {
                const digits = trimmedPhone.replace(/[\s\-().+]/g, '')
                if (!/^\d{7,15}$/.test(digits)) newErrors.phone = t("step3.errorPhoneInvalid")
            }
        }

        if (step === 3 && workshopType === "A") {
            const trimmedName = formData.fullName.trim()
            if (!trimmedName) newErrors.fullName = t("step3.errorName")
            else if (trimmedName.length < 2) newErrors.fullName = t("step3.errorNameShort")
            else if (trimmedName.length > 30) newErrors.fullName = t("step3.errorNameTooLong")
            else if (!/^[a-zA-Z\u4e00-\u9fff\s\-']+$/.test(trimmedName)) newErrors.fullName = t("step3.errorNameInvalid")

            const trimmedEmail = formData.email.trim()
            if (!trimmedEmail) newErrors.email = t("step3.errorEmail")
            else if (trimmedEmail.length > 100) newErrors.email = t("step3.errorEmailTooLong")
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) newErrors.email = t("step3.errorEmailInvalid")

            const trimmedPhone = formData.phone.trim()
            if (!trimmedPhone) newErrors.phone = t("step3.errorPhone")
            else if (trimmedPhone.length > 20) newErrors.phone = t("step3.errorPhoneTooLong")
            else {
                const digits = trimmedPhone.replace(/[\s\-().+]/g, '')
                if (!/^\d{7,15}$/.test(digits)) newErrors.phone = t("step3.errorPhoneInvalid")
            }

            if (!Number.isInteger(formData.guests) || formData.guests < 1 || formData.guests > formData.maxGuests) {
                newErrors.guests = t("step3.errorGuests")
            }

            if (formData.specialRequests.length > 200) {
                newErrors.specialRequests = t("step3.errorSpecialRequestsTooLong")
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => prev + 1)
        }
    }

    const handleBack = () => {
        setCurrentStep((prev) => prev - 1)
        setErrors({})
    }

    const handleWorkshopSelect = (type: WorkshopType) => {
        setWorkshopType(type)
        setFormData((prev) => ({ ...prev, workshop: type }))
        setErrors({})
    }

    // Submit Workshop A booking
    const handleSubmitBooking = async () => {
        if (!validateStep(3)) return

        setIsSubmitting(true)
        setSubmitError("")

        try {
            const res = await fetch("/api/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    timeSlotId: formData.timeSlotId,
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    guests: formData.guests,
                    specialRequests: formData.specialRequests,
                    preferredLanguage: formData.preferredLanguage,
                }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                setSubmitError(data.error || t("error.unknown"))
                return
            }

            setIsSubmitted(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch {
            setSubmitError(t("error.network"))
        } finally {
            setIsSubmitting(false)
        }
    }

    // Submit Workshop B interest
    const handleSubmitInterest = async () => {
        if (!validateStep(2)) return

        setIsSubmitting(true)
        setSubmitError("")

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: interestData.fullName,
                    email: interestData.email,
                    phone: interestData.phone,
                    message: `[Tea Making Experience Interest]\nEstimated group size: ${interestData.guests}\n\n${interestData.message || "No additional message."}`,
                }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                setSubmitError(data.error || t("error.unknown"))
                return
            }

            setIsSubmitted(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch {
            setSubmitError(t("error.network"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFieldChange = (field: keyof BookingFormData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    const handleInterestFieldChange = (field: keyof InterestFormData, value: string | number) => {
        setInterestData((prev) => ({ ...prev, [field]: value }))
        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    if (isSubmitted) {
        return <SuccessMessage type={workshopType === "B" ? "interest" : "booking"} />
    }

    if (submitError && !isSubmitting) {
        return <ErrorMessage errorMessage={submitError} onRetry={() => setSubmitError("")} />
    }

    const showSidebar = workshopType === "A" && currentStep >= 2

    return (
        <div>
            {workshopType && <StepIndicator currentStep={currentStep} workshopType={workshopType} />}

            <div className={`grid ${showSidebar ? "lg:grid-cols-3" : ""} gap-8`}>
                {/* Form */}
                <div className={`${showSidebar ? "lg:col-span-2" : ""} bg-card rounded-lg border border-border p-6 md:p-8`}>
                    {/* Step 1: Workshop Selection */}
                    {currentStep === 1 && (
                        <WorkshopSelection
                            selected={workshopType}
                            onSelect={handleWorkshopSelect}
                        />
                    )}

                    {/* Workshop A — Step 2: Date & Time */}
                    {currentStep === 2 && workshopType === "A" && (
                        <DateTimeSelection
                            selectedDate={formData.date}
                            selectedSlotId={formData.timeSlotId}
                            onDateSelect={(date) => {
                                handleFieldChange("date", date)
                                setFormData((prev) => ({ ...prev, date, timeSlotId: "", timeSlotLabel: "", maxGuests: 8 }))
                            }}
                            onSlotSelect={(slotId, label, remaining) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    timeSlotId: slotId,
                                    timeSlotLabel: label,
                                    maxGuests: remaining,
                                    guests: Math.min(prev.guests, remaining),
                                }))
                                if (errors.timeSlot) {
                                    setErrors((prev) => ({ ...prev, timeSlot: undefined }))
                                }
                            }}
                            errors={errors}
                        />
                    )}

                    {/* Workshop A — Step 3: Personal Details */}
                    {currentStep === 3 && workshopType === "A" && (
                        <PersonalDetails
                            formData={formData}
                            onFieldChange={handleFieldChange}
                            errors={errors}
                        />
                    )}

                    {/* Workshop B — Step 2: Interest Form */}
                    {currentStep === 2 && workshopType === "B" && (
                        <InterestForm
                            formData={interestData}
                            onFieldChange={handleInterestFieldChange}
                            errors={errors}
                        />
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-border">
                        {currentStep > 1 ? (
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 rounded font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {t("back")}
                            </button>
                        ) : (
                            <div />
                        )}

                        {!workshopType || currentStep < totalSteps ? (
                            <button
                                onClick={handleNext}
                                disabled={currentStep === 1 && !workshopType}
                                className="bg-tea-brown text-primary-foreground px-8 py-3 font-medium rounded hover:bg-tea-brown/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {t("continue")}
                            </button>
                        ) : currentStep === totalSteps && workshopType === "B" ? (
                            <button
                                onClick={handleSubmitInterest}
                                disabled={isSubmitting}
                                className="bg-tea-brown text-primary-foreground px-8 py-3 font-medium rounded hover:bg-tea-brown/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting && (
                                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                )}
                                {isSubmitting ? t("interest.submitting") : t("interest.submit")}
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmitBooking}
                                disabled={isSubmitting}
                                className="bg-tea-brown text-primary-foreground px-8 py-3 font-medium rounded hover:bg-tea-brown/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting && (
                                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                )}
                                {isSubmitting ? t("submitting") : t("confirm")}
                            </button>
                        )}
                    </div>
                </div>

                {/* Summary Sidebar — only for Workshop A step 2+ */}
                {showSidebar && (
                    <div className="lg:col-span-1">
                        <BookingSummary formData={formData} />
                    </div>
                )}
            </div>
        </div>
    )
}

// Wrap with Suspense for useSearchParams
function BookingForm() {
    return (
        <Suspense fallback={<BookingFormSkeleton />}>
            <BookingFormInner />
        </Suspense>
    )
}

// What Happens Next Section
function WhatHappensNext() {
    const t = useTranslations("book")

    const steps = [
        {
            number: 1,
            title: t("whatNext.step1Title"),
            description: t("whatNext.step1Description"),
        },
        {
            number: 2,
            title: t("whatNext.step2Title"),
            description: t("whatNext.step2Description"),
        },
        {
            number: 3,
            title: t("whatNext.step3Title"),
            description: t("whatNext.step3Description"),
        },
    ]

    return (
        <section className="py-16 px-4 bg-cream">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="font-serif text-2xl md:text-3xl font-semibold text-tea-brown">
                        {t("whatNext.title")}
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {steps.map((step) => (
                        <div key={step.number} className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 bg-tea-brown text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                                {step.number}
                            </div>
                            <h3 className="font-serif text-lg font-semibold text-tea-brown mb-2">
                                {step.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// Loading Fallback for Booking Form
function BookingFormSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="flex items-center justify-center mb-10 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-border rounded-full" />
                        {i < 3 && <div className="w-12 sm:w-20 h-0.5 bg-border" />}
                    </div>
                ))}
            </div>
            <div className="bg-card rounded-lg border border-border p-6 md:p-8">
                <div className="h-8 bg-border rounded w-48 mb-4" />
                <div className="h-4 bg-border rounded w-32 mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-border rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    )
}

// Main Page
export default function BookPage() {
    return (
        <main className="min-h-screen bg-off-white">
            <Navigation />
            <PageHero />

            <section className="py-12 px-4 bg-off-white">
                <div className="max-w-4xl mx-auto">
                    <BookingForm />
                </div>
            </section>

            <WhatHappensNext />
            <Footer />
        </main>
    )
}
