'use client'

import Navigation from '../components/Navigation'
import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Check if email and password match in database
      const { data: user, error: loginError } = await supabase
        .from('sign_in_tb')
        .select('user_name, password, use_level')
        .eq('user_name', email)
        .eq('password', password)
        .single()

      if (loginError || !user) {
        setError('Invalid email or password. If you have not signed up yet, please create an account.')
        setIsLoading(false)
        return
      }

      // Sign in successful
      signIn(email, user.use_level)
      router.push('/indicators')
    } catch (error: any) {
      setError('An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 p-8">
            <h1 className="text-3xl font-bold text-cyan-400 mb-6 text-center">
              Sign In
            </h1>
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-400 text-slate-900 font-semibold py-3 rounded-lg hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-cyan-400 hover:text-cyan-300 underline"
              >
                Forgot username or password?
              </Link>
            </div>
          </div>
          <div className="mt-6 text-center">
            <span className="text-slate-300 text-sm">
              New to this Site?{' '}
              <Link
                href="/signup"
                className="text-cyan-400 hover:text-cyan-300 underline font-semibold"
              >
                Sign up
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
