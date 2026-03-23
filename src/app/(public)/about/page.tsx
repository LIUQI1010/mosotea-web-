import Link from "next/link"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"

// Page Hero Section
function PageHero() {
    return (
        <section className="relative pt-16 bg-cream">
            <div className="relative h-64 sm:h-80 flex items-center justify-center bg-tea-brown/10">
                <div className="absolute inset-0 bg-gradient-to-b from-tea-brown/5 to-tea-brown/20" />
                <div className="relative z-10 text-center px-4">
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold text-tea-brown mb-3">
                        Our Story
                    </h1>
                    <p className="font-serif text-2xl sm:text-3xl text-bamboo-green">
                        我們的故事
                    </p>
                </div>
            </div>
        </section>
    )
}

// Story Section
function StorySection() {
    return (
        <section className="py-20 sm:py-28 px-4 bg-off-white">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Image */}
                    <div className="order-2 lg:order-1">
                        <div className="aspect-[4/5] overflow-hidden rounded-lg">
                            <img
                                src="/images/about-story.jpg"
                                alt="Moso Tea ceremony space interior"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="order-1 lg:order-2">
                        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-tea-brown mb-6">
                            A Journey of Tea
                        </h2>
                        <div className="space-y-5 text-muted-foreground leading-relaxed">
                            <p>
                                Moso Tea was born from a simple yet profound love for the art of tea ceremony.
                                Founded in 2018, our studio has become a sanctuary for those seeking moments of
                                stillness in the heart of Wellington.
                            </p>
                            <p>
                                The name &ldquo;Moso&rdquo; comes from the moso bamboo, known for its remarkable patience
                                and growth. Just as the bamboo spends years developing strong roots before its
                                spectacular emergence, we believe in the power of quiet cultivation and
                                mindful presence.
                            </p>
                            <p>
                                What began as a small gathering of tea enthusiasts has grown into a beloved
                                community space where people from all walks of life come together to experience
                                the meditative beauty of tea culture.
                            </p>
                            <p>
                                Our garden studio, nestled in the hills of Kelburn, offers a rare opportunity
                                to step away from the everyday and immerse yourself in an ancient tradition
                                that celebrates the simple act of preparing and sharing tea.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

// Philosophy Section
function PhilosophySection() {
    return (
        <section className="py-20 sm:py-28 px-4 bg-cream">
            <div className="max-w-3xl mx-auto text-center">
                {/* Decorative Element */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    <div className="h-px w-16 bg-tea-brown/30" />
                    <TeaLeafIcon className="w-6 h-6 text-tea-brown" />
                    <div className="h-px w-16 bg-tea-brown/30" />
                </div>

                <blockquote className="font-serif text-2xl sm:text-3xl text-tea-brown leading-relaxed mb-8 italic">
                    &ldquo;In the simple act of making tea, we find a path to presence.
                    Each cup is an invitation to slow down, to breathe,
                    and to connect with the moment.&rdquo;
                </blockquote>

                <p className="font-serif text-lg text-bamboo-green mb-4">
                    「在泡茶的簡單動作中，我們找到了通往當下的道路。每一杯茶都是一份邀請，讓我們放慢腳步，深呼吸，與當下連結。」
                </p>

                {/* Decorative Element */}
                <div className="flex items-center justify-center gap-4 mt-10">
                    <div className="h-px w-16 bg-tea-brown/30" />
                    <div className="w-2 h-2 rounded-full bg-tea-brown/40" />
                    <div className="h-px w-16 bg-tea-brown/30" />
                </div>
            </div>
        </section>
    )
}

// Icon Components
function TeaLeafIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 2c-3 3-4.5 7-4.5 11s1.5 8 4.5 11c3-3 4.5-7 4.5-11S15 5 12 2z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12 6v16M8 10c1.5 1 3 1.5 4 1.5s2.5-.5 4-1.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function ExpertIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path
                d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M15 3l1 2 2.5.5-2 2 .5 2.5L15 9l-2 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function IntimateIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path
                d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    )
}

function MaterialsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M20 7h-8.5c-.83 0-1.5-.67-1.5-1.5S10.67 4 11.5 4H20"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M20 7c0 5-2 8-6 11-4-3-6-6-6-11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M14 10v4M12 12h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    )
}

function DurationIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path
                d="M12 6v6l4 2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

// What to Expect Section
function WhatToExpectSection() {
    const expectations = [
        {
            icon: ExpertIcon,
            title: "Guided by an Expert",
            titleZh: "專家引導",
            description: "Our certified tea masters bring years of training and deep cultural knowledge to every session.",
        },
        {
            icon: IntimateIcon,
            title: "Intimate Setting",
            titleZh: "私密環境",
            description: "Maximum 6 guests ensures a personal, unhurried experience with meaningful interaction.",
        },
        {
            icon: MaterialsIcon,
            title: "All Materials Provided",
            titleZh: "提供所有材料",
            description: "Premium teas, traditional utensils, and light refreshments are included in every experience.",
        },
        {
            icon: DurationIcon,
            title: "Unhurried Pace",
            titleZh: "從容不迫",
            description: "Our sessions are designed to give you time to fully absorb and appreciate each moment.",
        },
    ]

    return (
        <section className="py-20 sm:py-28 px-4 bg-off-white">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-tea-brown mb-3">
                        What to Expect
                    </h2>
                    <p className="font-serif text-xl text-bamboo-green">體驗流程</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {expectations.map((item, index) => (
                        <div key={index} className="text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cream mb-5">
                                <item.icon className="w-7 h-7 text-tea-brown" />
                            </div>
                            <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                                {item.title}
                            </h3>
                            <p className="text-sm text-bamboo-green mb-3">{item.titleZh}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// Host Introduction Section
function HostSection() {
    return (
        <section className="py-20 sm:py-28 px-4 bg-cream">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Photo */}
                    <div className="flex justify-center md:justify-end">
                        <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full overflow-hidden">
                            <img
                                src="/images/about-founder.jpg"
                                alt="Mei Lin Chen, founder and tea master"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-tea-brown mb-2">
                            Mei Lin Chen
                        </h2>
                        <p className="font-serif text-lg text-bamboo-green mb-6">陳美琳 · 創始人兼茶藝師</p>

                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p>
                                Mei Lin&apos;s journey with tea began in her grandmother&apos;s kitchen in Taiwan,
                                where she learned that tea is more than a beverage — it&apos;s a way of life.
                            </p>
                            <p>
                                After training for five years in both Chinese gongfu cha and Japanese
                                chanoyu traditions, she moved to New Zealand with a dream of sharing
                                this ancient art with a new audience.
                            </p>
                            <p>
                                When not hosting ceremonies, Mei Lin tends to the Moso Tea garden,
                                practices calligraphy, and continues to deepen her understanding of
                                tea culture through ongoing study and travel.
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-tea-brown/20">
                            <p className="text-sm text-muted-foreground italic">
                                &ldquo;My greatest joy is watching guests discover the peace that tea can bring.
                                Each ceremony is a gift I&apos;m honored to share.&rdquo;
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

// Gallery Section
function GallerySection() {
    const galleryImages = [
        { src: "/images/gallery-1.jpg", alt: "Traditional tea ceremony utensils" },
        { src: "/images/gallery-2.jpg", alt: "Zen garden corner" },
        { src: "/images/gallery-3.jpg", alt: "Tea being poured" },
        { src: "/images/gallery-4.jpg", alt: "Tea room interior with ikebana" },
        { src: "/images/gallery-5.jpg", alt: "Guests during tea ceremony" },
        { src: "/images/gallery-6.jpg", alt: "Garden tea pavilion" },
    ]

    return (
        <section className="py-20 sm:py-28 px-4 bg-off-white">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-tea-brown mb-3">
                        Our Space
                    </h2>
                    <p className="font-serif text-xl text-bamboo-green">我們的空間</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {galleryImages.map((image, index) => (
                        <div
                            key={index}
                            className={`overflow-hidden rounded-lg ${index === 0 || index === 5 ? "aspect-[4/5]" : "aspect-square"
                                }`}
                        >
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// CTA Section
function CTASection() {
    return (
        <section className="py-20 sm:py-28 px-4 bg-tea-brown">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-off-white mb-4">
                    Ready to Experience Tea?
                </h2>
                <p className="font-serif text-xl text-off-white/80 mb-4">
                    準備好體驗茶道了嗎？
                </p>
                <p className="text-off-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
                    Join us for an unforgettable journey into the art of tea ceremony.
                    Book your experience today and discover the tranquility that awaits.
                </p>
                <Link
                    href="/book"
                    className="inline-block bg-off-white text-tea-brown px-10 py-4 text-base font-medium rounded hover:bg-cream transition-colors"
                >
                    Book Now
                </Link>
            </div>
        </section>
    )
}

// Main About Page
export default function AboutPage() {
    return (
        <main className="min-h-screen">
            <Navigation />
            <PageHero />
            <StorySection />
            <PhilosophySection />
            <WhatToExpectSection />
            <HostSection />
            <GallerySection />
            <CTASection />
            <Footer />
        </main>
    )
}
