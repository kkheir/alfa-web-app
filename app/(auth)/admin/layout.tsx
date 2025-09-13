import MainSidebar from '@/components/main-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainSidebar type={'admin'}>{children}</MainSidebar>
}
