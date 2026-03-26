import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Moso Tea',
  description:
    'Terms and conditions for booking and attending a Moso Tea workshop experience in Wellington, New Zealand.',
  openGraph: {
    title: 'Terms of Service | Moso Tea',
    description:
      'Terms and conditions for booking and attending a Moso Tea workshop experience in Wellington, New Zealand.',
  },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
