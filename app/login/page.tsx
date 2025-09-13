'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGeneralStore } from '@/stores/general-store'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { actions } = useGeneralStore((state) => state)
  const { setUserType, setUserTab } = actions

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.isAdmin) {
          setUserType('admin')
          setUserTab('manage-users')
          router.push('/admin')
        } else {
          setUserType('user')
          setUserTab('manage-numbers')
          router.push('/alfa-manager')
        }
      } else {
        setError(data.message || 'Login failed')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Login failed:', error)
      setError('Login failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='rounded-2xl shadow-xl border border-border w-full max-w-sm overflow-hidden bg-card'>
        {/* Header with gradient background */}
        <div className='bg-gradient-to-r from-primary to-primary/80 p-5 text-center'>
          <div className='w-16 h-16 bg-background backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20'>
            <svg
              className='w-8 h-8'
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
          <h1 className='text-3xl font-bold text-primary-foreground mb-2'>
            Welcome Back
          </h1>
          <p className='text-primary-foreground/80'>Sign in to your account</p>
        </div>

        {/* Form area */}
        <div className='pt-5 p-8'>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className='p-3 bg-destructive/10 mb-3 border-l-4 border-destructive text-destructive rounded'>
                <p className='text-sm'>{error}</p>
              </div>
            )}

            <div className='pb-4'>
              <label
                className='block mb-2 text-sm font-semibold text-foreground'
                htmlFor='username'
              >
                Username
              </label>
              <Input
                id='username'
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='Enter your username'
                disabled={isLoading}
                required
              />
            </div>

            <div className='pb-6'>
              <label
                className='block mb-2 text-sm font-semibold text-foreground'
                htmlFor='password'
              >
                Password
              </label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter your password'
                disabled={isLoading}
                required
              />
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
