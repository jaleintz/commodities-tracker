'use client'

import Navigation from '../components/Navigation'
import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-cyan-400 mb-4">
              Premium Features
            </h1>
            <p className="text-slate-300 text-lg">
              Sign up to access exclusive features including Alerts and Money Flows
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Free Tier */}
            <div className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Free Access</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-cyan-400">$0</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-300">View Indicators</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-300">AI News</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-300">AI Stocks</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-300">Betting Markets</span>
                </li>
              </ul>
            </div>

            {/* Premium Tier */}
            <div className="bg-slate-800 rounded-3xl shadow-2xl border-2 border-cyan-400 p-8 relative">
              <div className="absolute top-0 right-0 bg-cyan-400 text-slate-900 px-4 py-1 rounded-bl-lg rounded-tr-2xl font-semibold text-sm">
                Popular
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Premium Access</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-cyan-400">Free</span>
                <span className="text-slate-400"> during beta</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-300">Everything in Free</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-cyan-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-semibold">Custom Alerts</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-cyan-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-semibold">Money Flows Analysis</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-cyan-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-300">Priority Support</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full bg-cyan-400 text-slate-900 font-semibold py-3 rounded-lg hover:bg-cyan-300 transition-colors text-center"
              >
                Get Started Free
              </Link>
            </div>
          </div>

          <div className="text-center">
            <p className="text-slate-400 mb-4">
              Already have an account?{' '}
              <Link href="/signin" className="text-cyan-400 hover:text-cyan-300 underline font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
