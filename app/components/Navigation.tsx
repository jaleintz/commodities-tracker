'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, isAdmin, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = () => {
    signOut()
    router.push('/indicators')
  }

  const handleRestrictedLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isAuthenticated) {
      e.preventDefault()
      router.push('/pricing')
    }
  }

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div className="hidden lg:flex space-x-0.5">
            <Link
              href="/ai-news"
              className={`px-3 py-4 text-xs font-semibold transition-colors ${
                pathname === '/ai-news'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AI News
            </Link>
            <Link
              href="/alerts"
              onClick={(e) => handleRestrictedLink(e, '/alerts')}
              className={`px-3 py-4 text-xs font-semibold transition-colors ${
                isAuthenticated
                  ? pathname === '/alerts'
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                  : 'text-red-400 hover:text-red-300'
              }`}
            >
              Alerts
            </Link>
          <Link
            href="/ai-stocks"
            className={`px-3 py-4 text-xs font-semibold transition-colors ${
              pathname === '/ai-stocks'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Stocks
          </Link>
          <Link
            href="/betting-markets"
            className={`px-3 py-4 text-xs font-semibold transition-colors ${
              pathname === '/betting-markets'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Prediction Markets
          </Link>
          <Link
            href="/indicators"
            className={`px-3 py-4 text-xs font-semibold transition-colors ${
              pathname === '/indicators'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Indicators
          </Link>
            <Link
              href="/money-flows"
              onClick={(e) => handleRestrictedLink(e, '/money-flows')}
              className={`px-3 py-4 text-xs font-semibold transition-colors ${
                isAuthenticated
                  ? pathname === '/money-flows'
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                  : 'text-red-400 hover:text-red-300'
              }`}
            >
              Money Flows
            </Link>
            {isAdmin && (
              <Link
                href="/entry"
                className={`px-3 py-4 text-xs font-semibold transition-colors ${
                  pathname === '/entry'
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Price Entry
              </Link>
            )}
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-16 left-0 right-0 bg-slate-800 border-b border-slate-700 z-50">
              <div className="flex flex-col">
                <Link
                  href="/ai-news"
                  className={`px-6 py-4 font-semibold transition-colors ${
                    pathname === '/ai-news'
                      ? 'text-cyan-400 bg-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  AI News
                </Link>
                <Link
                  href="/alerts"
                  className={`px-6 py-4 font-semibold transition-colors ${
                    isAuthenticated
                      ? pathname === '/alerts'
                        ? 'text-cyan-400 bg-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                      : 'text-red-400 hover:text-red-300 hover:bg-slate-700'
                  }`}
                  onClick={(e) => {
                    handleRestrictedLink(e, '/alerts')
                    setIsMenuOpen(false)
                  }}
                >
                  Alerts
                </Link>
                <Link
                  href="/ai-stocks"
                  className={`px-6 py-4 font-semibold transition-colors ${
                    pathname === '/ai-stocks'
                      ? 'text-cyan-400 bg-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  AI Stocks
                </Link>
                <Link
                  href="/betting-markets"
                  className={`px-6 py-4 font-semibold transition-colors ${
                    pathname === '/betting-markets'
                      ? 'text-cyan-400 bg-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Prediction Markets
                </Link>
                <Link
                  href="/indicators"
                  className={`px-6 py-4 font-semibold transition-colors ${
                    pathname === '/indicators'
                      ? 'text-cyan-400 bg-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Indicators
                </Link>
                <Link
                  href="/money-flows"
                  className={`px-6 py-4 font-semibold transition-colors ${
                    isAuthenticated
                      ? pathname === '/money-flows'
                        ? 'text-cyan-400 bg-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                      : 'text-red-400 hover:text-red-300 hover:bg-slate-700'
                  }`}
                  onClick={(e) => {
                    handleRestrictedLink(e, '/money-flows')
                    setIsMenuOpen(false)
                  }}
                >
                  Money Flows
                </Link>
                {isAdmin && (
                  <Link
                    href="/entry"
                    className={`px-6 py-4 font-semibold transition-colors ${
                      pathname === '/entry'
                        ? 'text-cyan-400 bg-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Price Entry
                  </Link>
                )}
              </div>
            </div>
          )}

          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-white text-slate-900 text-xs font-semibold rounded hover:bg-slate-200 transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/signin"
              className="px-4 py-2 bg-white text-slate-900 text-xs font-semibold rounded hover:bg-slate-200 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
