'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.isAdmin) {
          router.push('/admin')
        } else {
          router.push('/alfa-manager')
        }
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login failed:', error)
      setError('Login failed. Please try again.')
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='rounded-2xl shadow-xl border border-foreground w-full max-w-sm overflow-hidden'>
        {/* Header with gradient background */}
        <div className='bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-center'>
          <div className='w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20'>
            <svg
              className='w-8 h-8 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
              />
            </svg>
          </div>
          <h1 className='text-3xl font-bold text-white mb-2'>Welcome Back</h1>
          <p className='text-blue-100'>Sign in to your account</p>
        </div>

        {/* Form area */}
        <div className='pt-5 p-8'>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className='p-3 bg-red-50 mb-3 border-l-4 border-red-400 text-red-700 rounded'>
                <p className='text-sm'>{error}</p>
              </div>
            )}

            <div className='pb-4'>
              <label
                className='block mb-2 text-sm font-semibold'
                htmlFor='username'
              >
                Username
              </label>
              <Input
                id='username'
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                // className='w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                placeholder='Enter your username'
                required
              />
            </div>

            <div className='pb-6'>
              <label
                className='block mb-2 text-sm font-semibold'
                htmlFor='password'
              >
                Password
              </label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // className='w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                placeholder='Enter your password'
                required
              />
            </div>

            <Button
              type='submit'
              className='w-full px-6 py-3 font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200'
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
