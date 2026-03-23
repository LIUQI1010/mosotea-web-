"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"

// Available time slots
const timeSlots = ["10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM"]

// Experience IDs with hardcoded prices
const experienceIds = ["classic", "matcha", "private"] as const
const experiencePrices: Record<string, number> = {
    classic: 85,
    matcha: 65,
    private: 180,
}

// Form data interface
interface BookingFormData {
    experience: string
    date: string
    timeSlot: string
    fullName: string
    email: string
    phone: string
    guests: number
    specialRequests: string
    preferredLanguage: "en" | "zh"
}

// Form errors interface
interface FormErrors {
    experience?: string
    date?: string
    timeSlot?: string
    fullName?: string
    email?: string
    phone?: string
    guests?: string
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

// Step Indicator Component
function StepIndicator({ currentStep }: { currentStep: number }) {
    const t = useTranslations("book")

    const steps = [
        { number: 1, label: t("steps.experience") },
        { number: 2, label: t("steps.dateTime") },
        { number: 3, label: t("steps.details") },
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

// Step 1: Experience Selection
function ExperienceSelection({
    selectedExperience,
    onSelect,
    error,
}: {
    selectedExperience: string
    onSelect: (id: string) => void
    error?: string
}) {
    const t = useTranslations("book")
    const tExp = useTranslations("home.experiences")

    const experiences = experienceIds.map((id) => ({
        id,
        title: tExp(`${id}.title`),
        duration: tExp(`${id}.duration`),
        price: experiencePrices[id],
    }))

    return (
        <div>
            <h2 className="font-serif text-2xl font-semibold text-tea-brown mb-2">
                {t("step1.title")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("step1.description")}</p>

            <div className="grid gap-4">
                {experiences.map((exp) => (
                    <button
                        key={exp.id}
                        onClick={() => onSelect(exp.id)}
                        className={`p-5 rounded-lg border-2 text-left transition-all ${selectedExperience === exp.id
                                ? "border-tea-brown bg-tea-brown/5"
                                : "border-border hover:border-tea-brown/50 bg-off-white"
                            }`}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <h3 className="font-serif text-lg font-semibold text-foreground">
                                    {exp.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">{exp.duration}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-semibold text-tea-brown">
                                    NZ${exp.price}
                                </span>
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedExperience === exp.id
                                            ? "border-tea-brown bg-tea-brown"
                                            : "border-muted-foreground"
                                        }`}
                                >
                                    {selectedExperience === exp.id && (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 text-primary-foreground">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {error && (
                <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {error}
                </p>
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

// Step 2: Date & Time Selection
function DateTimeSelection({
    selectedDate,
    selectedTimeSlot,
    onDateSelect,
    onTimeSelect,
    errors,
}: {
    selectedDate: string
    selectedTimeSlot: string
    onDateSelect: (date: string) => void
    onTimeSelect: (time: string) => void
    errors: FormErrors
}) {
    const t = useTranslations("book")

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
                <div>
                    <h3 className="font-medium text-foreground mb-3">{t("step2.selectTime")}</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map((slot) => (
                            <button
                                key={slot}
                                onClick={() => onTimeSelect(slot)}
                                className={`py-3 px-4 rounded-lg border-2 font-medium text-sm transition-all ${selectedTimeSlot === slot
                                        ? "border-tea-brown bg-tea-brown text-primary-foreground"
                                        : "border-border bg-off-white text-foreground hover:border-tea-brown/50"
                                    }`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                    {errors.timeSlot && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            {errors.timeSlot}
                        </p>
                    )}
                </div>
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
    min,
    max,
}: {
    label: string
    type?: string
    value: string | number
    onChange: (value: string) => void
    placeholder?: string
    error?: string
    required?: boolean
    min?: number
    max?: number
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
                min={min}
                max={max}
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

// Step 3: Personal Details
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
                />

                <InputField
                    label={t("step3.email")}
                    type="email"
                    value={formData.email}
                    onChange={(value) => onFieldChange("email", value)}
                    placeholder={t("step3.emailPlaceholder")}
                    error={errors.email}
                    required
                />

                <InputField
                    label={t("step3.phone")}
                    type="tel"
                    value={formData.phone}
                    onChange={(value) => onFieldChange("phone", value)}
                    placeholder={t("step3.phonePlaceholder")}
                    error={errors.phone}
                    required
                />

                <InputField
                    label={t("step3.guests")}
                    type="number"
                    value={formData.guests}
                    onChange={(value) => onFieldChange("guests", parseInt(value) || 1)}
                    min={1}
                    max={6}
                    error={errors.guests}
                    required
                />

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
                        className="w-full px-4 py-3 rounded-lg border-2 border-border bg-off-white transition-colors focus:outline-none focus:ring-0 focus:border-tea-brown resize-none"
                    />
                </div>

                {/* Language Preference */}
                <div>
                    <label className="block mb-3">
                        <span className="font-medium text-foreground">{t("step3.language")}</span>
                    </label>
                    <div className="flex gap-3">
                        <button
                            onClick={() => onFieldChange("preferredLanguage", "en")}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium text-sm transition-all ${formData.preferredLanguage === "en"
                                    ? "border-tea-brown bg-tea-brown text-primary-foreground"
                                    : "border-border bg-off-white text-foreground hover:border-tea-brown/50"
                                }`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => onFieldChange("preferredLanguage", "zh")}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium text-sm transition-all ${formData.preferredLanguage === "zh"
                                    ? "border-tea-brown bg-tea-brown text-primary-foreground"
                                    : "border-border bg-off-white text-foreground hover:border-tea-brown/50"
                                }`}
                        >
                            繁體中文
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Booking Summary
function BookingSummary({ formData }: { formData: BookingFormData }) {
    const t = useTranslations("book")
    const tExp = useTranslations("home.experiences")

    const selectedExpId = formData.experience
    if (!selectedExpId || !experiencePrices[selectedExpId]) return null

    const expTitle = tExp(`${selectedExpId}.title`)
    const price = experiencePrices[selectedExpId]
    const totalPrice = price * formData.guests

    return (
        <div className="bg-cream rounded-lg p-6 border border-border">
            <h3 className="font-serif text-lg font-semibold text-tea-brown mb-4">
                {t("summary.title")}
            </h3>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("summary.experience")}</span>
                    <span className="font-medium text-foreground">{expTitle}</span>
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
                            })}
                        </span>
                    </div>
                )}
                {formData.timeSlot && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("summary.time")}</span>
                        <span className="font-medium text-foreground">{formData.timeSlot}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("summary.guests")}</span>
                    <span className="font-medium text-foreground">{formData.guests}</span>
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
function SuccessMessage() {
    const t = useTranslations("book")

    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 bg-bamboo-green/10 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-bamboo-green">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            </div>
            <h2 className="font-serif text-2xl font-semibold text-tea-brown mb-3">
                {t("success.title")}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed mt-4">
                {t("success.description")}
            </p>
            <Link
                href="/"
                className="inline-block bg-tea-brown text-primary-foreground px-8 py-3 font-medium rounded hover:bg-tea-brown/90 transition-colors"
            >
                {t("success.returnHome")}
            </Link>
        </div>
    )
}

// Booking Form Component
function BookingForm() {
    const searchParams = useSearchParams()
    const t = useTranslations("book")
    const preselectedExperience = searchParams.get("experience") || ""

    const initialExperience = preselectedExperience && experiencePrices[preselectedExperience]
        ? preselectedExperience
        : ""

    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [formData, setFormData] = useState<BookingFormData>({
        experience: initialExperience,
        date: "",
        timeSlot: "",
        fullName: "",
        email: "",
        phone: "",
        guests: 1,
        specialRequests: "",
        preferredLanguage: "en",
    })
    const [errors, setErrors] = useState<FormErrors>({})

    const validateStep = (step: number): boolean => {
        const newErrors: FormErrors = {}

        if (step === 1) {
            if (!formData.experience) {
                newErrors.experience = t("step1.error")
            }
        }

        if (step === 2) {
            if (!formData.date) {
                newErrors.date = t("step2.errorDate")
            }
            if (!formData.timeSlot) {
                newErrors.timeSlot = t("step2.errorTime")
            }
        }

        if (step === 3) {
            if (!formData.fullName.trim()) {
                newErrors.fullName = t("step3.errorName")
            }
            if (!formData.email.trim()) {
                newErrors.email = t("step3.errorEmail")
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = t("step3.errorEmailInvalid")
            }
            if (!formData.phone.trim()) {
                newErrors.phone = t("step3.errorPhone")
            }
            if (formData.guests < 1 || formData.guests > 6) {
                newErrors.guests = t("step3.errorGuests")
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

    const handleSubmit = () => {
        if (validateStep(3)) {
            // In a real app, this would submit to an API
            setIsSubmitted(true)
        }
    }

    const handleFieldChange = (field: keyof BookingFormData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        // Clear error when field is changed
        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    if (isSubmitted) {
        return <SuccessMessage />
    }

    return (
        <div>
            <StepIndicator currentStep={currentStep} />

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6 md:p-8">
                    {currentStep === 1 && (
                        <ExperienceSelection
                            selectedExperience={formData.experience}
                            onSelect={(id) => handleFieldChange("experience", id)}
                            error={errors.experience}
                        />
                    )}

                    {currentStep === 2 && (
                        <DateTimeSelection
                            selectedDate={formData.date}
                            selectedTimeSlot={formData.timeSlot}
                            onDateSelect={(date) => handleFieldChange("date", date)}
                            onTimeSelect={(time) => handleFieldChange("timeSlot", time)}
                            errors={errors}
                        />
                    )}

                    {currentStep === 3 && (
                        <PersonalDetails
                            formData={formData}
                            onFieldChange={handleFieldChange}
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

                        {currentStep < 3 ? (
                            <button
                                onClick={handleNext}
                                className="bg-tea-brown text-primary-foreground px-8 py-3 font-medium rounded hover:bg-tea-brown/90 transition-colors"
                            >
                                {t("continue")}
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className="bg-tea-brown text-primary-foreground px-8 py-3 font-medium rounded hover:bg-tea-brown/90 transition-colors"
                            >
                                {t("confirm")}
                            </button>
                        )}
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    {formData.experience && <BookingSummary formData={formData} />}
                </div>
            </div>
        </div>
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
                    <Suspense fallback={<BookingFormSkeleton />}>
                        <BookingForm />
                    </Suspense>
                </div>
            </section>

            <WhatHappensNext />
            <Footer />
        </main>
    )
}
