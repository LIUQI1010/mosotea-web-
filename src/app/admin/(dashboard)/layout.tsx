import { AdminSidebar } from './AdminSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <AdminSidebar />
      <main className="ml-[200px] flex-1 p-8">{children}</main>
    </div>
  )
}
