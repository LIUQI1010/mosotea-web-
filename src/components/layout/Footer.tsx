import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

export function Footer() {
    const t = useTranslations("footer")
    const tNav = useTranslations("navigation")

    return (
        <footer className="bg-tea-brown text-primary-foreground py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    {/* Logo & Description */}
                    <div className="md:col-span-2">
                        <h3 className="font-serif text-2xl font-semibold mb-4">Moso Tea</h3>
                        <p className="text-primary-foreground/80 leading-relaxed max-w-md">
                            {t("description")}
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="font-semibold mb-4">{t("navigation")}</h4>
                        <nav className="flex flex-col gap-2">
                            <Link href="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                                {tNav("home")}
                            </Link>
                            <Link href="/workshop" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                                {tNav("experiences")}
                            </Link>
                            <Link href="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                                {tNav("about")}
                            </Link>
                            <Link href="/gallery" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                                {tNav("gallery")}
                            </Link>
                            <Link href="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                                {tNav("contact")}
                            </Link>
                        </nav>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold mb-4">{t("contact")}</h4>
                        <div className="flex flex-col gap-2 text-primary-foreground/80">
                            <p>{t("address1")}</p>
                            <p>{t("address2")}</p>
                            <p>{t("address3")}</p>
                            <p className="mt-2">{t("email")}</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-primary-foreground/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-primary-foreground/60">
                        {t("copyright", { year: new Date().getFullYear() })}
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link href="/privacy" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                            {t("privacy")}
                        </Link>
                        <Link href="/terms" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                            {t("terms")}
                        </Link>
                    </div>
                </div>

                {/* Credit */}
                <p className="text-center text-xs text-primary-foreground/40 mt-6">
                    Built with care by <a href="https://qi.lqtechgroup.com" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 underline underline-offset-2 hover:text-primary-foreground transition-colors">QI</a> & Qingyi
                </p>
            </div>
        </footer>
    )
}
