import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Moso Tea',
  description:
    'How Moso Tea collects, uses, and protects your personal information under the New Zealand Privacy Act 2020.',
  openGraph: {
    title: 'Privacy Policy | Moso Tea',
    description:
      'How Moso Tea collects, uses, and protects your personal information under the New Zealand Privacy Act 2020.',
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
