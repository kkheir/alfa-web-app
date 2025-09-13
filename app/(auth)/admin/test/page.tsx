import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// This is a server-side check.
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

export default async function AdminPageTest() {
  const user = await getAuth()

  if (!user || !user.isAdmin) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard - Test</h1>
        <p className="text-gray-600">Welcome, {user.username}!</p>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">CSS Test</h2>
          <div className="space-y-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Test Button
            </button>
            <div className="border border-gray-200 p-4 rounded">
              <p>This should have a border and padding</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
