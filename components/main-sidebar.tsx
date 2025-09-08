import { FC } from 'react'
import { AppSidebar } from './app-sidebar'
import { SidebarInset, SidebarProvider } from './ui/sidebar'

interface IMainSidebarProps {
  children: React.ReactNode
}

const MainSidebar: FC<IMainSidebarProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSidebar variant='inset' />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}

export default MainSidebar
