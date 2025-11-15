'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Track visit on mount
    const trackVisit = async () => {
      try {
        await fetch('/api/track-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: window.location.href
          })
        })
      } catch (error) {
        // Silently fail - don't block user experience
        console.error('Failed to track visit:', error)
      }
    }

    trackVisit()
  }, [pathname])

  return null // This component doesn't render anything
}
