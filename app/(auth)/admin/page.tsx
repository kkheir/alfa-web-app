import { redirect } from 'next/navigation'

import { SiteHeader } from '@/components/site-header'
import { getAuth, getUsers } from '../layout'
import AdminTabs from './AdminTabs'
import DataTab from './DataTab'
import DistributionTab from './DistributionTab'
import UsersTab from './UsersTab'

// This is a server-side check.
// The middleware should have already caught unauthenticated users,
// but this is an extra layer of protection.

export default async function AdminPage() {
  const user = await getAuth()

  if (!user || !user.isAdmin) {
    redirect('/login')
  }

  const users = await getUsers()

  // Define tabs
  const tabs = [
    {
      id: 'users',
      label: 'Manage Users',
      icon: (
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
          />
        </svg>
      ),
    },
    {
      id: 'data',
      label: 'Manage Data',
      icon: (
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
          />
        </svg>
      ),
    },
    {
      id: 'distribution',
      label: 'Panel Distribution',
      icon: (
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
          />
        </svg>
      ),
    },
  ]

  return (
    <>
      <SiteHeader />
      <div className='h-full bg-background'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Page Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-foreground mb-2'>
              Admin Dashboard
            </h1>
            <p className='text-muted-foreground'>
              Manage users, data, and system configurations
            </p>
          </div>

          {/* Tabbed Content */}
          <AdminTabs tabs={tabs} defaultTab='users'>
            <UsersTab initialUsers={users} />
            <DataTab />
            <DistributionTab />
          </AdminTabs>
        </div>
      </div>
    </>
  )
}
