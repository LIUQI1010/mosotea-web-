import { AdminSidebar } from './AdminSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <AdminSidebar />
      <main className="flex-1 p-4 pt-18 sm:p-6 sm:pt-20 md:ml-[200px] md:p-8 md:pt-8">{children}</main>
    </div>
  )
}
