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
  first_price: number | null
  month_ago_price: number | null
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

      // For each product, get the latest, previous, first, and month ago prices
      const productsWithPrices = await Promise.all(
        (products || []).map(async (product) => {
          // Get latest 2 prices
          const { data: priceData } = await supabase
            .from('commodities-inflation-tb')
            .select('price, created_at')
            .eq('product_id', product.id)
            .order('created_at', { ascending: false })
            .limit(2)

          // Get first price
          const { data: firstPriceData } = await supabase
            .from('commodities-inflation-tb')
            .select('price')
            .eq('product_id', product.id)
            .order('created_at', { ascending: true })
            .limit(1)

          // Get price from approximately 30 days ago
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

          const { data: monthAgoPriceData } = await supabase
            .from('commodities-inflation-tb')
            .select('price, created_at')
            .eq('product_id', product.id)
            .lte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(1)

          return {
            ...product,
            price: priceData?.[0]?.price || null,
            price_date: priceData?.[0]?.created_at || null,
            previous_price: priceData?.[1]?.price || null,
            first_price: firstPriceData?.[0]?.price || null,
            month_ago_price: monthAgoPriceData?.[0]?.price || null
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
      <div className="text-center pt-4">
        <h2 className="text-2xl font-semibold text-white">Real Time Inflation Indicators</h2>
      </div>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
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
                    <div key={product.id} className={`w-full max-w-md ${bgColor} rounded-lg p-2 border-2 ${borderColor}`}>
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <span className="text-cyan-400 font-bold text-sm">{product.product_name}</span>
                          {product.product_desc && (
                            <p className="text-[6px] text-slate-400 mt-0.5">{product.product_desc}</p>
                          )}
                          {product.product_url && (
                            <a
                              href={product.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[6px] text-blue-400 hover:text-blue-300 underline"
                            >
                              View Product
                            </a>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-white text-sm font-semibold block">
                            {formatPrice(product.price)}
                          </span>
                          {hasChange && (
                            <span className={`text-xs font-semibold ${change < 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {change > 0 ? '+' : ''}{formatPrice(change)} {change > 0 ? '↑' : '↓'}
                            </span>
                          )}
                          {isUnchanged && (
                            <span className="text-xs font-semibold text-slate-400">
                              unchanged
                            </span>
                          )}
                        </div>
                      </div>
                      {product.price_date && (
                        <p className="text-[6px] text-slate-500 text-right">
                          Last updated: {formatDate(product.price_date)}
                        </p>
                      )}
                    </div>
                  )
                })}

                <div className={`w-full max-w-md rounded-lg p-4 border-2 mb-4 bg-black ${
                  (() => {
                    const currentTotal = productsWithPrices.reduce((sum, product) => sum + (product.price || 0), 0)
                    const previousTotal = productsWithPrices.reduce((sum, product) => sum + (product.previous_price || 0), 0)
                    const firstTotal = productsWithPrices.reduce((sum, product) => sum + (product.first_price || 0), 0)
                    const dailyChange = currentTotal - previousTotal
                    const overallChange = currentTotal - firstTotal

                    if ((previousTotal === 0 || dailyChange === 0) && (firstTotal === 0 || overallChange === 0)) {
                      return 'border-cyan-400'
                    } else if (dailyChange < 0 || overallChange < 0) {
                      return 'border-green-400'
                    } else {
                      return 'border-red-400'
                    }
                  })()
                }`}>
                  <div className="text-left mb-2">
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
                  </div>
                  <div className="flex justify-start items-center">
                    {(() => {
                      const currentTotal = productsWithPrices.reduce((sum, product) => sum + (product.price || 0), 0)
                      const previousTotal = productsWithPrices.reduce((sum, product) => sum + (product.previous_price || 0), 0)
                      const firstTotal = productsWithPrices.reduce((sum, product) => sum + (product.first_price || 0), 0)
                      const dailyChange = currentTotal - previousTotal
                      const overallChange = currentTotal - firstTotal

                      const showDaily = previousTotal > 0 && dailyChange !== 0
                      const showOverall = firstTotal > 0 && overallChange !== 0

                      if (!showDaily && !showOverall) return null

                      return (
                        <span className="text-white text-xs font-semibold">
                          {showDaily && (
                            <>
                              <i className={`fas fa-circle ${dailyChange < 0 ? 'text-green-400' : 'text-red-400'} mr-0.5`}></i>(D) {dailyChange > 0 ? '+' : ''}{((dailyChange / previousTotal) * 100).toFixed(2)}% <i className={`fas ${dailyChange < 0 ? 'fa-arrow-trend-down text-green-400' : 'fa-arrow-trend-up text-red-400'} ml-0.5`}></i>
                            </>
                          )}
                          {showDaily && showOverall && <span className="mx-2"></span>}
                          {showOverall && (
                            <>
                              <i className={`fas fa-circle ${overallChange < 0 ? 'text-green-400' : 'text-red-400'} mr-0.5`}></i>(W) {overallChange > 0 ? '+' : ''}{((overallChange / firstTotal) * 100).toFixed(2)}% <i className={`fas ${overallChange < 0 ? 'fa-arrow-trend-down text-green-400' : 'fa-arrow-trend-up text-red-400'} ml-0.5`}></i>
                            </>
                          )}
                          {showOverall && <span className="mx-2"></span>}
                          {showOverall && (
                            <>
                              <i className={`fas fa-circle ${overallChange < 0 ? 'text-green-400' : 'text-red-400'} mr-0.5`}></i>(M) {overallChange > 0 ? '+' : ''}{((overallChange / firstTotal) * 100).toFixed(2)}% <i className={`fas ${overallChange < 0 ? 'fa-arrow-trend-down text-green-400' : 'fa-arrow-trend-up text-red-400'} ml-0.5`}></i>
                            </>
                          )}
                        </span>
                      )
                    })()}
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
