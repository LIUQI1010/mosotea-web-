import Link from "next/link"

export function Footer() {
    return (
        <footer className="bg-tea-brown text-primary-foreground py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    {/* Logo & Description */}
                    <div className="md:col-span-2">
                        <h3 className="font-serif text-2xl font-semibold mb-4">Moso Tea</h3>
                        <p className="text-primary-foreground/80 leading-relaxed max-w-md">
                            Bringing the ancient art of tea ceremony to Wellington.
                            Experience tranquility, mindfulness, and the beauty of tea culture.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="font-semibold mb-4">Navigation</h4>
                        <nav className="flex flex-col gap-2">
                            <Link href="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                                Home
                            </Link>
                            <Link href="/experiences" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                                Experiences
                            </Link>
                            <Link href="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                                About
                            </Link>
                            <Link href="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                                Contact
                            </Link>
                        </nav>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <div className="flex flex-col gap-2 text-primary-foreground/80">
                            <p>123 Garden Lane</p>
                            <p>Kelburn, Wellington 6012</p>
                            <p>New Zealand</p>
                            <p className="mt-2">hello@mosotea.co.nz</p>
                            <p>+64 4 123 4567</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-primary-foreground/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-primary-foreground/60">
                        © {new Date().getFullYear()} Moso Tea. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link href="/privacy" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
