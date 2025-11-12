'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex space-x-1">
          <Link
            href="/"
            className={`px-6 py-4 font-semibold transition-colors ${
              pathname === '/'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Price Entry
          </Link>
          <Link
            href="/display"
            className={`px-6 py-4 font-semibold transition-colors ${
              pathname === '/display'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Price Display
          </Link>
        </div>
      </div>
    </nav>
  )
}
