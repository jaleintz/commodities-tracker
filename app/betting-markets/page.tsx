'use client'

import Navigation from '../components/Navigation'

export default function BettingMarketsPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 p-6">
            <h1 className="text-3xl font-bold text-cyan-400 mb-6 text-center">
              Prediction Markets
            </h1>
            <div className="flex flex-col items-center space-y-4">
              <a
                href="https://polymarket.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors border border-slate-600 w-48 text-center"
              >
                Polymarket
              </a>
              <a
                href="https://kalshi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors border border-slate-600 w-48 text-center"
              >
                Kalshi
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
