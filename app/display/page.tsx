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

      // For each product, get the latest price
      const productsWithPrices = await Promise.all(
        (products || []).map(async (product) => {
          const { data: priceData } = await supabase
            .from('commodities-inflation-tb')
            .select('price, created_at')
            .eq('product_id', product.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...product,
            price: priceData?.price || null,
            price_date: priceData?.created_at || null
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
          <div className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 p-12 md:p-16">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold text-cyan-400 mb-1">
                  Staple Prices
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
              {!isLoading && !error && productsWithPrices.length > 0 && productsWithPrices.some(p => p.price_date) && (
                <p className="text-slate-400 text-sm mt-2">
                  Last updated: {formatDate(productsWithPrices.find(p => p.price_date)?.price_date || null)}
                </p>
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
                {isExpanded && productsWithPrices.map((product) => (
                  <div key={product.id} className="w-full max-w-md bg-slate-700 rounded-lg p-4 border border-slate-600">
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
                      <span className="text-white text-lg font-semibold">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    {product.price_date && (
                      <p className="text-xs text-slate-500 text-right">
                        Last updated: {formatDate(product.price_date)}
                      </p>
                    )}
                  </div>
                ))}

                <div className="w-full max-w-md bg-cyan-600 rounded-lg p-4 border-2 border-cyan-400 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-xl">Total Cost</span>
                    <span className="text-white text-2xl font-bold">
                      {formatPrice(
                        productsWithPrices.reduce((sum, product) => sum + (product.price || 0), 0)
                      )}
                    </span>
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
