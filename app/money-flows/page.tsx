'use client'

import Navigation from '../components/Navigation'

export default function MoneyFlowsPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 p-6">
            <h1 className="text-3xl font-bold text-cyan-400 mb-6 text-center">
              Money Flows
            </h1>
            <div className="text-slate-400 text-center">
              <p>Money flows content coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
