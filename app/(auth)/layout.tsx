import { verifyToken } from '@/lib/auth'
import { cookies, headers } from 'next/headers'

export async function getAuth() {
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

export async function getUsers(): Promise<User[]> {
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

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
