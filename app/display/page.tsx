'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navigation from '../components/Navigation'

interface ProductWithPrice {
  id: number
  product_name: string
  product_desc: string
  product_url: string
  price: number | null
  price_date: string | null
  previous_price: number | null
}

export default function DisplayPage() {
  const [productsWithPrices, setProductsWithPrices] = useState<ProductWithPrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    fetchLatestPrices()
  }, [])

  const fetchLatestPrices = async () => {
    try {
      setIsLoading(true)

      // Get all products
      const { data: products, error: productsError } = await supabase
        .from('commodities-source-tb')
        .select('*')
        .order('id')

      if (productsError) throw productsError

      // For each product, get the latest and previous prices
      const productsWithPrices = await Promise.all(
        (products || []).map(async (product) => {
          const { data: priceData } = await supabase
            .from('commodities-inflation-tb')
            .select('price, created_at')
            .eq('product_id', product.id)
            .order('created_at', { ascending: false })
            .limit(2)

          return {
            ...product,
            price: priceData?.[0]?.price || null,
            price_date: priceData?.[0]?.created_at || null,
            previous_price: priceData?.[1]?.price || null
          }
        })
      )

      setProductsWithPrices(productsWithPrices)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A'
    return `$${price.toFixed(2)}`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 p-3 md:p-4">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold text-cyan-400 mb-1">
                  Staple Food Prices
                </h1>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors mb-1"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isExpanded ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    )}
                  </svg>
                </button>
              </div>
              {!isLoading && !error && productsWithPrices.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs">
                    {productsWithPrices.map((p, index) => {
                      const change = (p.price || 0) - (p.previous_price || 0)
                      const hasChange = p.previous_price !== null && change !== 0

                      let textColor = 'text-slate-400'
                      let arrow = ''
                      if (hasChange) {
                        if (change < 0) {
                          textColor = 'text-green-400'
                          arrow = '↓'
                        } else {
                          textColor = 'text-red-400'
                          arrow = '↑'
                        }
                      }

                      return (
                        <span key={p.id}>
                          <span className={textColor}>
                            {p.product_name}
                            {arrow && <span className="ml-0.5">{arrow}</span>}
                          </span>
                          {index < productsWithPrices.length - 1 ? <span className="text-slate-400"> • </span> : ''}
                        </span>
                      )
                    })}
                  </p>
                  {productsWithPrices.some(p => p.price_date) && (
                    <p className="text-slate-400 text-sm mt-1">
                      Last updated: {formatDate(productsWithPrices.find(p => p.price_date)?.price_date || null)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {isLoading && (
              <div className="text-center text-slate-400">
                Loading...
              </div>
            )}

            {error && (
              <div className="text-center text-red-400">
                Error: {error}
              </div>
            )}

            {!isLoading && !error && productsWithPrices.length > 0 && (
              <div className="flex flex-col items-center space-y-4">
                {isExpanded && productsWithPrices.map((product) => {
                  const change = (product.price || 0) - (product.previous_price || 0)
                  const hasChange = product.previous_price !== null && change !== 0
                  const isUnchanged = product.previous_price !== null && change === 0

                  let borderColor = 'border-slate-600'
                  let bgColor = 'bg-slate-700'

                  if (hasChange) {
                    if (change < 0) {
                      borderColor = 'border-green-500'
                      bgColor = 'bg-green-900/30'
                    } else {
                      borderColor = 'border-red-500'
                      bgColor = 'bg-red-900/30'
                    }
                  }

                  return (
                    <div key={product.id} className={`w-full max-w-md ${bgColor} rounded-lg p-4 border-2 ${borderColor}`}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="text-cyan-400 font-bold text-lg">{product.product_name}</span>
                          {product.product_desc && (
                            <p className="text-xs text-slate-400 mt-1">{product.product_desc}</p>
                          )}
                          {product.product_url && (
                            <a
                              href={product.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 underline"
                            >
                              View Product
                            </a>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-white text-lg font-semibold block">
                            {formatPrice(product.price)}
                          </span>
                          {hasChange && (
                            <span className={`text-sm font-semibold ${change < 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {change > 0 ? '+' : ''}{formatPrice(change)} {change > 0 ? '↑' : '↓'}
                            </span>
                          )}
                          {isUnchanged && (
                            <span className="text-sm font-semibold text-slate-400">
                              unchanged
                            </span>
                          )}
                        </div>
                      </div>
                      {product.price_date && (
                        <p className="text-xs text-slate-500 text-right">
                          Last updated: {formatDate(product.price_date)}
                        </p>
                      )}
                    </div>
                  )
                })}

                <div className={`w-full max-w-md rounded-lg p-4 border-2 mb-4 ${
                  (() => {
                    const currentTotal = productsWithPrices.reduce((sum, product) => sum + (product.price || 0), 0)
                    const previousTotal = productsWithPrices.reduce((sum, product) => sum + (product.previous_price || 0), 0)
                    const change = currentTotal - previousTotal

                    if (previousTotal === 0 || change === 0) {
                      return 'bg-cyan-600 border-cyan-400'
                    } else if (change < 0) {
                      return 'bg-green-600 border-green-400'
                    } else {
                      return 'bg-red-600 border-red-400'
                    }
                  })()
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-xl">Total Cost</span>
                    <div className="text-right">
                      <span className="text-white text-2xl font-bold block">
                        {formatPrice(
                          productsWithPrices.reduce((sum, product) => sum + (product.price || 0), 0)
                        )}
                      </span>
                      {(() => {
                        const currentTotal = productsWithPrices.reduce((sum, product) => sum + (product.price || 0), 0)
                        const previousTotal = productsWithPrices.reduce((sum, product) => sum + (product.previous_price || 0), 0)
                        const change = currentTotal - previousTotal

                        if (previousTotal > 0 && change !== 0) {
                          return (
                            <span className="text-white text-sm font-semibold">
                              {change > 0 ? '+' : ''}{formatPrice(change)} {change > 0 ? '↑' : '↓'} from previous
                            </span>
                          )
                        }
                        return null
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !error && productsWithPrices.length === 0 && (
              <div className="text-center text-slate-400">
                No products found. Please add products to the database first.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
