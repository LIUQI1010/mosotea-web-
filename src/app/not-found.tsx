import Link from "next/link"

export default function NotFound() {
    return (
        <main className="min-h-screen bg-off-white flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                {/* Tea Leaf Icon */}
                <div className="flex items-center justify-center mb-8">
                    <svg className="w-16 h-16 text-tea-brown/40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                </div>

                <p className="text-8xl font-serif font-semibold text-tea-brown mb-4">404</p>

                <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-tea-brown mb-3">
                    Page Not Found
                </h1>
                <p className="font-serif text-lg text-bamboo-green mb-2">
                    找不到此頁面
                </p>

                <p className="text-muted-foreground leading-relaxed mt-6 mb-10">
                    The page you are looking for doesn&apos;t exist or has been moved.
                </p>

                <Link
                    href="/"
                    className="inline-block bg-tea-brown text-white px-10 py-4 text-base font-medium rounded hover:bg-tea-brown/90 transition-colors"
                >
                    Return Home
                </Link>
            </div>
        </main>
    )
}
