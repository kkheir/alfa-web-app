import { SiteHeader } from '@/components/site-header'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '../../../lib/auth'
import ManagerView from './ManagerView'

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

export default async function AlfaManagerPage() {
  const user = await getAuth()

  if (!user) {
    redirect('/login')
  }

  return (
    // <div className='h-full bg-background flex flex-col items-center justify-center p-4'>
    //   <Card className='w-full max-w-md'>
    //     <CardHeader className='bg-gradient-to-r from-green-600 to-emerald-700 text-center rounded-t-lg'>
    //       <CardTitle className='text-3xl font-bold text-white mb-2'>
    //         Alfa Manager
    //       </CardTitle>
    //       <p className='text-green-100'>Welcome to your dashboard</p>
    //     </CardHeader>

    //     <CardContent className='p-8 text-center'>
    //       <div className='mb-6'>
    //         <div className='w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4'>
    //           <User className='w-8 h-8 text-white' />
    //         </div>
    //         <p className='text-xl font-semibold text-foreground mb-2'>
    //           Hello, {user.username}!
    //         </p>
    //         <p className='text-muted-foreground'>
    //           You have access to the Alfa Manager dashboard
    //         </p>
    //       </div>

    //       <div className='space-y-4'>
    //         <div className='p-4 bg-muted rounded-lg border'>
    //           <div className='text-sm text-muted-foreground'>
    //             Your role:{' '}
    //             <Badge
    //               variant='secondary'
    //               className='bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    //             >
    //               Alfa Manager
    //             </Badge>
    //           </div>
    //         </div>
    //         <LogoutButton />
    //       </div>
    //     </CardContent>
    //   </Card>
    // </div>
    <>
      <SiteHeader />
      <ManagerView />
    </>
  )
}
