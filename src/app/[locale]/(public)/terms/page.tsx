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
    heading: 'The experience',
    content: (
      <p>
        Moso Tea offers The Workshop — a 90-minute guided tea ceremony experience for up to 8 guests
        per session, priced at NZD $75 per person. Two sessions are available daily at 10:00–11:30
        and 14:00–15:30 NZDT.
      </p>
    ),
  },
  {
    number: '2',
    heading: 'Bookings',
    content: (
      <>
        <p className="mb-4">
          A booking is confirmed when you receive a confirmation email from us. Bookings are subject
          to availability. We reserve the right to decline or cancel bookings at our discretion.
        </p>
        <p>
          Payment is made in person on the day of your experience. No advance payment is required to
          secure a booking.
        </p>
      </>
    ),
  },
  {
    number: '3',
    heading: 'Cancellation policy',
    content: (
      <>
        <p className="mb-4">
          We understand plans can change. There are no cancellation fees — we simply ask that you
          give us as much notice as possible.
        </p>
        <ul className="list-disc list-inside space-y-2 ml-1">
          <li>
            <span className="font-medium text-foreground">More than 48 hours before:</span> cancel
            freely, no action needed beyond letting us know
          </li>
          <li>
            <span className="font-medium text-foreground">24–48 hours before:</span> please notify
            us so we can offer your spot to other guests
          </li>
          <li>
            <span className="font-medium text-foreground">Less than 24 hours / no-show:</span> no
            charge, but repeated no-shows may affect future booking eligibility
          </li>
        </ul>
        <p className="mt-4">
          You can cancel using the link in your confirmation email or by contacting us at{' '}
          <a
            href="mailto:hello@mosotea.co.nz"
            className="text-tea-brown underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            hello@mosotea.co.nz
          </a>
          .
        </p>
      </>
    ),
  },
  {
    number: '4',
    heading: 'Studio cancellations',
    content: (
      <p>
        If we need to cancel a session — due to severe weather, illness, or circumstances beyond our
        control — we will notify you as soon as possible and offer a rescheduled date. We are not
        liable for any costs you may incur as a result of a studio-initiated cancellation.
      </p>
    ),
  },
  {
    number: '5',
    heading: 'Guest requirements',
    content: (
      <ul className="list-disc list-inside space-y-1.5 ml-1">
        <li>Maximum 8 guests per session</li>
        <li>
          Guests are welcome to bring children; please notify us in advance so we can prepare
          appropriately
        </li>
        <li>
          Please inform us of any food allergies or dietary requirements at the time of booking
        </li>
        <li>
          Guests are expected to arrive on time. Late arrivals may not be able to join a session in
          progress
        </li>
      </ul>
    ),
  },
  {
    number: '6',
    heading: 'Liability',
    content: (
      <>
        <p className="mb-4">
          Moso Tea takes all reasonable care to provide a safe and enjoyable experience. However, we
          are not liable for:
        </p>
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li>Adverse reactions arising from undisclosed allergies or dietary conditions</li>
          <li>Loss or damage to personal belongings during your visit</li>
          <li>Any indirect or consequential loss</li>
        </ul>
        <p className="mt-4">
          Nothing in these terms limits your rights under the New Zealand Consumer Guarantees Act
          1993.
        </p>
      </>
    ),
  },
  {
    number: '7',
    heading: 'Intellectual property',
    content: (
      <p>
        All content on mosotea.co.nz — including text, images, and design — is owned by Moso Tea
        and may not be reproduced without written permission.
      </p>
    ),
  },
  {
    number: '8',
    heading: 'Governing law',
    content: (
      <p>
        These terms are governed by the laws of New Zealand. Any disputes will be subject to the
        exclusive jurisdiction of the courts of Wellington, New Zealand.
      </p>
    ),
  },
  {
    number: '9',
    heading: 'Contact',
    content: (
      <p>
        Questions about these terms? Email us at{' '}
        <a
          href="mailto:hello@mosotea.co.nz"
          className="text-tea-brown underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          hello@mosotea.co.nz
        </a>
        .
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-off-white">
      <Navigation />

      {/* Page Header */}
      <section className="bg-cream pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-tea-brown mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective date: {EFFECTIVE_DATE} &middot; Governed by the laws of New Zealand
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
