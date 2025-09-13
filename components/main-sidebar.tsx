'use client'

import { useGeneralStore } from '@/stores/general-store'
import { FC, useEffect } from 'react'
import { AppSidebar } from './app-sidebar'
import { SidebarInset, SidebarProvider } from './ui/sidebar'

interface IMainSidebarProps {
  type?: UserType
  children: React.ReactNode
}

const MainSidebar: FC<IMainSidebarProps> = ({ children, type }) => {
  const { userType, actions } = useGeneralStore((state) => state)

  useEffect(() => {
    if (type && type !== userType) {
      actions.setUserType(type)
    }
  }, [type])

  return (
    <SidebarProvider>
      <AppSidebar variant='inset' />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}

export default MainSidebar
