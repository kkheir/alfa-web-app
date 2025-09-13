'use client'

import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useGeneralStore } from '@/stores/general-store'
import { useEffect, useState } from 'react'
import { ModeToggle } from './mode-toggle'
import { Skeleton } from './ui/skeleton'

export function SiteHeader() {
  const { userTab, userType } = useGeneralStore((state) => state)
  const [tab, setTab] = useState(userTab)

  useEffect(() => {
    if (!userTab || userTab === '') {
      if (userType === 'admin') {
        setTab('manage-users')
      } else if (userType === 'user') {
        setTab('manage-numbers')
      }
    } else if (userTab && userTab !== tab) {
      setTab(userTab)
    }
  }, [userTab, userType])

  return (
    <header className='group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear'>
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1' />
        <Separator
          orientation='vertical'
          className='mx-2 data-[orientation=vertical]:h-4'
        />
        {tab ? (
          <h1 className='text-base font-medium capitalize'>
            {tab ? tab.replace('-', ' ') : 'Manage'}
          </h1>
        ) : (
          <Skeleton className='h-6 w-32' />
        )}
        <div className='ml-auto flex items-center gap-2'>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
