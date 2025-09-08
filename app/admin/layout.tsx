import MainSidebar from "@/components/main-sidebar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MainSidebar>{children}</MainSidebar>
  )
}
