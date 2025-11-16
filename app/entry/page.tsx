'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navigation from '../components/Navigation'

interface Product {
  id: number
  product_name: string
  product_desc: string
  product_url: string
}

export default function EntryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [prices, setPrices] = useState<{ [key: number]: string }>({})
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setProductsLoading(true)
      const { data, error } = await supabase
        .from('commodities-source-tb')
        .select('*')
        .order('id')

      if (error) throw error
      setProducts(data || [])

      // Fetch last prices for each product
      if (data && data.length > 0) {
        await fetchLastPrices(data)
      }
    } catch (error: any) {
      setMessage(`Error loading products: ${error.message}`)
    } finally {
      setProductsLoading(false)
    }
  }

  const fetchLastPrices = async (products: Product[]) => {
    try {
      const lastPrices: { [key: number]: string } = {}

      for (const product of products) {
        const { data, error } = await supabase
          .from('commodities-inflation-tb')
          .select('price')
          .eq('product_id', product.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (!error && data && data.length > 0) {
          lastPrices[product.id] = data[0].price.toString()
        }
      }

      setPrices(lastPrices)
    } catch (error: any) {
      console.error('Error fetching last prices:', error)
    }
  }

  const handleChange = (productId: number, value: string) => {
    setPrices(prev => ({
      ...prev,
      [productId]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      // Validate all fields are filled
      for (const product of products) {
        if (!prices[product.id]) {
          throw new Error(`All fields are required. Please fill in ${product.product_name} price.`)
        }
      }

      // Validate all fields are valid numbers
      const priceEntries = []
      for (const product of products) {
        const priceValue = prices[product.id]
        const numValue = parseFloat(priceValue)

        if (isNaN(numValue)) {
          throw new Error(`${product.product_name} must be a valid number.`)
        }
        if (numValue < 0) {
          throw new Error(`${product.product_name} cannot be negative.`)
        }

        priceEntries.push({
          product_id: product.id,
          price: numValue
        })
      }

      // Insert all prices
      const { error } = await supabase
        .from('commodities-inflation-tb')
        .insert(priceEntries)

      if (error) {
        throw error
      }

      setMessage('Data saved successfully!')
      // Don't clear prices - they'll remain prefilled for next entry
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 p-12 md:p-16">
          <div className="text-center mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-cyan-400 mb-1">
              Price Changes Over Time
            </h1>
          </div>

          {productsLoading ? (
            <div className="text-center text-slate-400 py-8">
              Loading products...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col items-center space-y-2">
                {products.map((product) => (
                  <div key={product.id} className="w-full max-w-md">
                    <div className="mb-1">
                      <label htmlFor={`price_${product.id}`} className="block text-sm font-bold text-cyan-400">
                        {product.product_name}
                      </label>
                      {product.product_desc && (
                        <p className="text-xs text-slate-400 mt-0.5">{product.product_desc}</p>
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
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        id={`price_${product.id}`}
                        value={prices[product.id] || ''}
                        onChange={(e) => handleChange(product.id, e.target.value)}
                        className="w-full pl-6 pr-3 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all hover:border-slate-500 text-center text-white text-base font-semibold placeholder-slate-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}
              </div>

            <div className="flex justify-center mt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="max-w-md w-full bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base transition-all shadow-lg"
              >
                {isLoading ? 'Saving...' : 'Save Prices'}
              </button>
            </div>

            {message && (
              <div className="flex justify-center">
                <div
                  className={`max-w-md w-full p-3 rounded-lg text-sm font-semibold ${
                    message.includes('Error')
                      ? 'bg-red-900/50 text-red-200 border-2 border-red-500'
                      : 'bg-green-900/50 text-green-200 border-2 border-green-500'
                  }`}
                >
                  {message}
                </div>
              </div>
            )}
            </form>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
