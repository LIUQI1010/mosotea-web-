import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Moso Tea Admin',
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
