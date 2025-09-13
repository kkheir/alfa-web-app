'use client'

import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowUpCircleIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  HashIcon,
  HelpCircleIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useGeneralStore } from '@/stores/general-store'
import { useEffect, useState } from 'react'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userType } = useGeneralStore((state) => state)
  const [type, setType] = useState(userType)

  const adminData = {
    user: {
      name: 'Admin User',
      email: 'phone: 03037842',
      avatar: '/avatars/shadcn.jpg',
    },
    navMain: [
      {
        title: 'Manage Users',
        url: '#',
        icon: UsersIcon,
        tab: 'manage-users',
      },
      // {
      //   title: 'Settings',
      //   url: '#',
      //   icon: SettingsIcon,
      //   tab: 'settings',
      // },
      // Add more admin tabs here
    ],
    navClouds: [
      {
        title: 'Capture',
        icon: CameraIcon,
        isActive: true,
        url: '#',
        items: [
          {
            title: 'Active Proposals',
            url: '#',
          },
          {
            title: 'Archived',
            url: '#',
          },
        ],
      },
      {
        title: 'Proposal',
        icon: FileTextIcon,
        url: '#',
        items: [
          {
            title: 'Active Proposals',
            url: '#',
          },
          {
            title: 'Archived',
            url: '#',
          },
        ],
      },
      {
        title: 'Prompts',
        icon: FileCodeIcon,
        url: '#',
        items: [
          {
            title: 'Active Proposals',
            url: '#',
          },
          {
            title: 'Archived',
            url: '#',
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: 'Settings',
        url: '#',
        icon: SettingsIcon,
      },
      {
        title: 'Get Help',
        url: '#',
        icon: HelpCircleIcon,
      },
      {
        title: 'Search',
        url: '#',
        icon: SearchIcon,
      },
    ],
    documents: [
      {
        name: 'Data Library',
        url: '#',
        icon: DatabaseIcon,
      },
      {
        name: 'Reports',
        url: '#',
        icon: ClipboardListIcon,
      },
      {
        name: 'Word Assistant',
        url: '#',
        icon: FileIcon,
      },
    ],
  }

  const userData = {
    user: {
      name: 'User',
    },
    navMain: [
      {
        title: 'Manage Numbers',
        url: '#',
        icon: HashIcon,
        tab: 'manage-numbers',
      },
      {
        title: 'Bundles',
        url: '#',
        icon: ListIcon,
        tab: 'bundles',
      },
      // Add more user tabs here
    ],
    navClouds: [
      {
        title: 'Capture',
        icon: CameraIcon,
        isActive: true,
        url: '#',
        items: [
          {
            title: 'Active Proposals',
            url: '#',
          },
          {
            title: 'Archived',
            url: '#',
          },
        ],
      },
      {
        title: 'Proposal',
        icon: FileTextIcon,
        url: '#',
        items: [
          {
            title: 'Active Proposals',
            url: '#',
          },
          {
            title: 'Archived',
            url: '#',
          },
        ],
      },
      {
        title: 'Prompts',
        icon: FileCodeIcon,
        url: '#',
        items: [
          {
            title: 'Active Proposals',
            url: '#',
          },
          {
            title: 'Archived',
            url: '#',
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: 'Settings',
        url: '#',
        icon: SettingsIcon,
      },
      {
        title: 'Get Help',
        url: '#',
        icon: HelpCircleIcon,
      },
      {
        title: 'Search',
        url: '#',
        icon: SearchIcon,
      },
    ],
    documents: [
      {
        name: 'Data Library',
        url: '#',
        icon: DatabaseIcon,
      },
      {
        name: 'Reports',
        url: '#',
        icon: ClipboardListIcon,
      },
      {
        name: 'Word Assistant',
        url: '#',
        icon: FileIcon,
      },
    ],
  }

  useEffect(() => {
    if (userType && type !== userType) setType(userType)
  }, [userType])

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      {typeof type === 'undefined' ? (
        <>
          <SidebarHeader>
            <Skeleton className='h-8 w-full mb-2' />
          </SidebarHeader>
          <SidebarContent>
            <Skeleton className='h-7 w-[93%] mb-2 ml-2' />
            <Skeleton className='h-7 w-[93%] mb-2 ml-2' />
            <Skeleton className='h-7 w-[93%] mb-2 ml-2' />
          </SidebarContent>
          <SidebarFooter>
            <Skeleton className='h-10 w-full' />
          </SidebarFooter>
        </>
      ) : (
        <>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className='data-[slot=sidebar-menu-button]:!p-1.5'
                >
                  <a href='#'>
                    <ArrowUpCircleIcon className='h-5 w-5' />
                    <span className='text-base font-semibold'>
                      {type === 'admin' ? 'Admin Panel' : 'User Panel'}
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <NavMain
              items={
                type && type === 'admin'
                  ? adminData.navMain
                  : type && type === 'user'
                  ? userData.navMain
                  : []
              }
            />
            {/* <NavDocuments items={adminData.documents} /> */}
            {/* <NavSecondary items={adminData.navSecondary} className='mt-auto' /> */}
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={type === 'admin' ? adminData.user : userData.user} />
          </SidebarFooter>
        </>
      )}
    </Sidebar>
  )
}
