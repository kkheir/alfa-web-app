import { verifyToken } from '@/lib/auth'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { SiteHeader } from '@/components/site-header'
import AdminTabs from './AdminTabs'
import DataTab from './DataTab'
import DistributionTab from './DistributionTab'
import UsersTab from './UsersTab'

// This is a server-side check.
// The middleware should have already caught unauthenticated users,
// but this is an extra layer of protection.
async function getAuth() {
  const token = cookies().get('auth_token')?.value
  if (!token) return null

  const decoded = await verifyToken(token)
  return decoded as {
    userId: number
    username: string
    isAdmin: boolean
  } | null
}

type User = {
  id: number
  username: string
}

async function getUsers(): Promise<User[]> {
  const host = headers().get('host')
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const url = `${protocol}://${host}/api/users`

  try {
    const res = await fetch(url, {
      headers: {
        Cookie: cookies().toString(),
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error(`Failed to fetch users: ${res.status} ${res.statusText}`)
      return []
    }

    return res.json()
  } catch (error) {
    console.error('An error occurred while fetching users:', error)
    return []
  }
}

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
      <div className='p-6 space-y-6'>
        {/* Header */}
        {/* <div className='p-6'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-3xl font-bold mb-1'>Admin Panel</h1>
              <p className=''>Manage users, data, and distributions</p>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='backdrop-blur-sm rounded-lg px-4 py-2'>
                <p className='font-medium'>Welcome, {user.username}!</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div> */}

        {/* Tabbed Content */}
        <AdminTabs tabs={tabs} defaultTab='users'>
          <UsersTab initialUsers={users} />
          <DataTab />
          <DistributionTab />
        </AdminTabs>
      </div>
    </>
    // <>
    //   <SiteHeader />
    //   <div className='flex flex-1 flex-col'>
    //     <div className='@container/main flex flex-1 flex-col gap-2'>
    //       <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
    //         <SectionCards />
    //         <div className='px-4 lg:px-6'>
    //           <ChartAreaInteractive />
    //         </div>
    //         <DataTable data={data} />
    //       </div>
    //     </div>
    //   </div>
    // </>
  )
}
