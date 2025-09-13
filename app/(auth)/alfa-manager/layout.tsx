import MainSidebar from '@/components/main-sidebar'

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainSidebar type={'user'}>{children}</MainSidebar>
}
