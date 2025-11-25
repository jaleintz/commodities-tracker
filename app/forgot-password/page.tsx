'use client'

import Navigation from '../components/Navigation'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 p-8">
            <h1 className="text-3xl font-bold text-cyan-400 mb-4 text-center">
              Verify your identity
            </h1>
            <p className="text-slate-300 text-center mb-6">
              Let's confirm some basic information about your account.
            </p>
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  placeholder="Enter your phone number"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-cyan-400 text-slate-900 font-semibold py-3 rounded-lg hover:bg-cyan-300 transition-colors"
              >
                Verify Identity
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
