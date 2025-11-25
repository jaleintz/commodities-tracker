'use client'

import Navigation from '../components/Navigation'
import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNum, setPhoneNum] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '')

    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNum(formatted)
  }

  const validatePhoneNumber = (phone: string) => {
    // Remove formatting to check length
    const digits = phone.replace(/\D/g, '')
    return digits.length === 10
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsLoading(true)

    // Validate phone number
    if (!validatePhoneNumber(phoneNum)) {
      setError('Please enter a valid 10-digit phone number.')
      setIsLoading(false)
      return
    }

    try {
      // Check if email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('sign_in_tb')
        .select('user_name')
        .eq('user_name', email)

      // If there's an error checking (like table doesn't exist), we'll catch it below
      if (checkError && !checkError.message.includes('does not exist')) {
        throw checkError
      }

      if (existingUsers && existingUsers.length > 0) {
        setError('This email has already been used. Please use a different email or sign in.')
        setIsLoading(false)
        return
      }

      // Insert new user
      const { error: insertError } = await supabase
        .from('sign_in_tb')
        .insert([
          {
            user_name: email,
            password: password,
            phone_num: phoneNum,
            use_level: 'user'
          }
        ])

      if (insertError) throw insertError

      setSuccess(true)
      setEmail('')
      setPassword('')
      setPhoneNum('')
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign up')
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
              Sign Up
            </h1>
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-500 rounded-lg text-green-400 text-sm">
                Account created successfully! You can now <Link href="/signin" className="underline font-semibold">sign in</Link>.
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email <span className="text-red-400">*</span>
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
                  Password <span className="text-red-400">*</span>
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
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={phoneNum}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  placeholder="(555) 555-5555"
                  maxLength={14}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-400 text-slate-900 font-semibold py-3 rounded-lg hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </form>
          </div>
          <div className="mt-6 text-center">
            <span className="text-slate-300 text-sm">
              Already have an account?{' '}
              <Link
                href="/signin"
                className="text-cyan-400 hover:text-cyan-300 underline font-semibold"
              >
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
