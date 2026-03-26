import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

const EFFECTIVE_DATE = '1 April 2026'

interface Section {
  number: string
  heading: string
  content: React.ReactNode
}

const sections: Section[] = [
  {
    number: '1',
    heading: 'Who we are',
    content: (
      <p>
        Moso Tea is a tea ceremony studio based in Wainuiomata, Wellington, New Zealand. We operate
        the website mosotea.co.nz. You can contact us at{' '}
        <a href="mailto:hello@mosotea.co.nz" className="text-tea-brown underline underline-offset-2 hover:opacity-80 transition-opacity">
          hello@mosotea.co.nz
        </a>
        .
      </p>
    ),
  },
  {
    number: '2',
    heading: 'Information we collect',
    content: (
      <>
        <p className="mb-4">When you make a booking, we collect:</p>
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li>Full name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Number of guests</li>
          <li>Preferred language (English or Traditional Chinese)</li>
          <li>Special requests or accessibility needs</li>
        </ul>
        <p className="mt-4">
          When you visit our website, our hosting and infrastructure providers may automatically
          collect basic access logs (IP address, browser type, pages visited). We do not use
          advertising trackers or analytics cookies.
        </p>
      </>
    ),
  },
  {
    number: '3',
    heading: 'Why we collect it',
    content: (
      <ul className="list-disc list-inside space-y-1.5 ml-1">
        <li>To process and confirm your booking</li>
        <li>To send booking confirmation and reminder emails</li>
        <li>To contact you about changes or cancellations</li>
        <li>To accommodate any special requests or needs</li>
      </ul>
    ),
  },
  {
    number: '4',
    heading: 'Third-party services',
    content: (
      <>
        <p className="mb-4">
          We use the following services to operate our website. Your information may pass through or
          be stored by:
        </p>
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li>Supabase — database (data stored in Australia/New Zealand region)</li>
          <li>Resend — transactional email delivery</li>
          <li>Vercel — website hosting</li>
          <li>Cloudflare — content delivery and DNS</li>
        </ul>
        <p className="mt-4">
          We do not sell, rent, or share your personal information with third parties for marketing
          purposes.
        </p>
      </>
    ),
  },
  {
    number: '5',
    heading: 'Data retention',
    content: (
      <p>
        We retain booking records for up to 2 years from the date of your experience, after which
        personal information is deleted or anonymised.
      </p>
    ),
  },
  {
    number: '6',
    heading: 'Your rights',
    content: (
      <>
        <p className="mb-4">
          Under the New Zealand Privacy Act 2020, you have the right to:
        </p>
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li>Request access to the personal information we hold about you</li>
          <li>Request a correction if any information is inaccurate</li>
          <li>Ask us to delete your information (subject to our legal obligations)</li>
        </ul>
        <p className="mt-4">
          To exercise any of these rights, email us at{' '}
          <a href="mailto:hello@mosotea.co.nz" className="text-tea-brown underline underline-offset-2 hover:opacity-80 transition-opacity">
            hello@mosotea.co.nz
          </a>
          . We will respond within 20 working days.
        </p>
      </>
    ),
  },
  {
    number: '7',
    heading: 'Cookies',
    content: (
      <p>
        We use only essential functional cookies required for the website to operate. We do not use
        advertising, tracking, or analytics cookies.
      </p>
    ),
  },
  {
    number: '8',
    heading: 'Changes to this policy',
    content: (
      <p>
        We may update this policy from time to time. The current version will always be available at
        mosotea.co.nz/privacy. Continued use of our website after changes are posted constitutes
        acceptance of the updated policy.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-off-white">
      <Navigation />

      {/* Page Header */}
      <section className="bg-cream pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-tea-brown mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective date: {EFFECTIVE_DATE} &middot; Governed by New Zealand Privacy Act 2020
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Content */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-14">
          {sections.map((section) => (
            <div key={section.number}>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-serif text-sm font-semibold text-tea-brown tabular-nums">
                  {section.number}.
                </span>
                <h2 className="font-serif text-2xl font-semibold text-foreground">
                  {section.heading}
                </h2>
              </div>
              <div className="text-muted-foreground leading-relaxed ml-6">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
