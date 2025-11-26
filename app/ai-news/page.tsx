'use client'

import Navigation from '../components/Navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://uzgnghfqkcktfjcreipr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Z25naGZxa2NrdGZqY3JlaXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTg5ODIsImV4cCI6MjA3ODQzNDk4Mn0.XsB6gyeL6iwXOishQikPKVBGT40MOTxQokeMmtBX-7E'
)

interface NewsArticle {
  id: number
  source_id: string | null
  source_name: string | null
  author: string | null
  title: string
  description: string | null
  url: string
  url_to_image: string | null
  published_at: string | null
  content: string | null
  created_at: string
}

export default function AINewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_news_tb')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(200)

      if (error) {
        throw error
      }

      // Filter to only show articles from approved sources
      const filtered = (data || []).filter(article => {
        const url = article.url.toLowerCase()
        const sourceName = (article.source_name || '').toLowerCase()

        return (
          url.includes('businessline') || sourceName.includes('businessline') ||
          url.includes('theinformation.com') ||
          url.includes('pymnts.com') ||
          url.includes('channelnewsasia.com') || sourceName.includes('cna') ||
          url.includes('timesofindia') || sourceName.includes('times of india') ||
          sourceName.includes('livemin') ||
          url.includes('oilprice.com') ||
          url.includes('gizmodo.com')
        )
      })

      setArticles(filtered)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news')
      console.error('Error fetching news:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-cyan-400 mb-6 text-center">
            AI News
          </h1>

          {loading && (
            <div className="text-slate-400 text-center py-8">
              <p>Loading news...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400 text-center">
              <p>Error: {error}</p>
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <div className="text-slate-400 text-center py-8">
              <p>No news articles found. Run the import script to fetch news.</p>
            </div>
          )}

          <div className="space-y-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6 hover:border-cyan-400 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-xl font-bold text-white hover:text-cyan-400">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {article.title}
                    </a>
                  </h2>
                </div>

                <div className="flex items-center gap-3 mb-3 text-sm text-slate-400">
                  {article.source_name && (
                    <span className="font-semibold text-cyan-400">
                      {article.source_name}
                    </span>
                  )}
                  {article.author && (
                    <span>by {article.author}</span>
                  )}
                  <span>{formatDate(article.published_at)}</span>
                </div>

                {article.description && (
                  <p className="text-slate-300 mb-3">
                    {article.description}
                  </p>
                )}

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm"
                >
                  Read more →
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
