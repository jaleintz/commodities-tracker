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
  week_ago_price: number | null
  month_ago_price: number | null
}

interface ChartDataPoint {
  date: string
  total: number
}

export default function DisplayPage() {
  const [productsWithPrices, setProductsWithPrices] = useState<ProductWithPrice[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [monthChartData, setMonthChartData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isChartExpanded, setIsChartExpanded] = useState(false)
  const [isMonthChartExpanded, setIsMonthChartExpanded] = useState(false)

  useEffect(() => {
    fetchLatestPrices()
    fetchChartData()
    fetchMonthChartData()
  }, [])

  const fetchChartData = async () => {
    try {
      // Get all products
      const { data: products, error: productsError } = await supabase
        .from('commodities-source-tb')
        .select('id')
        .order('id')

      if (productsError) throw productsError

      // Get data for last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6) // 6 days ago + today = 7 days
      sevenDaysAgo.setHours(0, 0, 0, 0)

      const { data: priceData, error: priceError } = await supabase
        .from('commodities-inflation-tb')
        .select('price, created_at, product_id')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      if (priceError) throw priceError

      // Group by date and calculate totals
      const dataByDate: { [key: string]: { [productId: number]: number } } = {}

      priceData?.forEach(record => {
        const date = new Date(record.created_at)
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

        if (!dataByDate[dateKey]) {
          dataByDate[dateKey] = {}
        }
        // Keep the latest price for each product on each date
        dataByDate[dateKey][record.product_id] = record.price
      })

      // Create chart data points
      const chartPoints: ChartDataPoint[] = []
      const sortedDates = Object.keys(dataByDate).sort()

      sortedDates.forEach(dateKey => {
        const total = Object.values(dataByDate[dateKey]).reduce((sum, price) => sum + price, 0)
        const [year, month, day] = dateKey.split('-')
        const displayDate = `${month}/${day}`
        chartPoints.push({ date: displayDate, total })
      })

      setChartData(chartPoints)
    } catch (error: any) {
      console.error('Error fetching chart data:', error)
    }
  }

  const fetchMonthChartData = async () => {
    try {
      // Get all products
      const { data: products, error: productsError } = await supabase
        .from('commodities-source-tb')
        .select('id')
        .order('id')

      if (productsError) throw productsError

      // Get data for last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29) // 29 days ago + today = 30 days
      thirtyDaysAgo.setHours(0, 0, 0, 0)

      const { data: priceData, error: priceError } = await supabase
        .from('commodities-inflation-tb')
        .select('price, created_at, product_id')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      if (priceError) throw priceError

      // Group by date and calculate totals
      const dataByDate: { [key: string]: { [productId: number]: number } } = {}

      priceData?.forEach(record => {
        const date = new Date(record.created_at)
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

        if (!dataByDate[dateKey]) {
          dataByDate[dateKey] = {}
        }
        // Keep the latest price for each product on each date
        dataByDate[dateKey][record.product_id] = record.price
      })

      // Create chart data points
      const chartPoints: ChartDataPoint[] = []
      const sortedDates = Object.keys(dataByDate).sort()

      sortedDates.forEach(dateKey => {
        const total = Object.values(dataByDate[dateKey]).reduce((sum, price) => sum + price, 0)
        const [year, month, day] = dateKey.split('-')
        const displayDate = `${month}/${day}`
        chartPoints.push({ date: displayDate, total })
      })

      setMonthChartData(chartPoints)
    } catch (error: any) {
      console.error('Error fetching month chart data:', error)
    }
  }

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
          // Get today's date range (start and end of today)
          const now = new Date()
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

          // Get yesterday's date range
          const yesterdayStart = new Date(todayStart)
          yesterdayStart.setDate(yesterdayStart.getDate() - 1)
          const yesterdayEnd = new Date(todayStart)
          yesterdayEnd.setMilliseconds(yesterdayEnd.getMilliseconds() - 1)

          // Get latest price from today
          const { data: todayPriceData } = await supabase
            .from('commodities-inflation-tb')
            .select('price, created_at')
            .eq('product_id', product.id)
            .gte('created_at', todayStart.toISOString())
            .lte('created_at', todayEnd.toISOString())
            .order('created_at', { ascending: false })
            .limit(1)

          // Get latest price from yesterday
          const { data: yesterdayPriceData } = await supabase
            .from('commodities-inflation-tb')
            .select('price, created_at')
            .eq('product_id', product.id)
            .gte('created_at', yesterdayStart.toISOString())
            .lte('created_at', yesterdayEnd.toISOString())
            .order('created_at', { ascending: false })
            .limit(1)

          // Get overall latest price (for display if no today price)
          const { data: latestPriceData } = await supabase
            .from('commodities-inflation-tb')
            .select('price, created_at')
            .eq('product_id', product.id)
            .order('created_at', { ascending: false })
            .limit(1)

          // Get first price
          const { data: firstPriceData } = await supabase
            .from('commodities-inflation-tb')
            .select('price')
            .eq('product_id', product.id)
            .order('created_at', { ascending: true })
            .limit(1)

          // Get price from 7 days ago
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          const sevenDaysAgoStart = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate())
          const sevenDaysAgoEnd = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate(), 23, 59, 59, 999)

          const { data: weekAgoPriceData } = await supabase
            .from('commodities-inflation-tb')
            .select('price, created_at')
            .eq('product_id', product.id)
            .gte('created_at', sevenDaysAgoStart.toISOString())
            .lte('created_at', sevenDaysAgoEnd.toISOString())
            .order('created_at', { ascending: false })
            .limit(1)

          // Get price from 30 days ago
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const thirtyDaysAgoStart = new Date(thirtyDaysAgo.getFullYear(), thirtyDaysAgo.getMonth(), thirtyDaysAgo.getDate())
          const thirtyDaysAgoEnd = new Date(thirtyDaysAgo.getFullYear(), thirtyDaysAgo.getMonth(), thirtyDaysAgo.getDate(), 23, 59, 59, 999)

          const { data: monthAgoPriceData } = await supabase
            .from('commodities-inflation-tb')
            .select('price, created_at')
            .eq('product_id', product.id)
            .gte('created_at', thirtyDaysAgoStart.toISOString())
            .lte('created_at', thirtyDaysAgoEnd.toISOString())
            .order('created_at', { ascending: false })
            .limit(1)

          return {
            ...product,
            price: todayPriceData?.[0]?.price || latestPriceData?.[0]?.price || null,
            price_date: todayPriceData?.[0]?.created_at || latestPriceData?.[0]?.created_at || null,
            previous_price: yesterdayPriceData?.[0]?.price || null,
            first_price: firstPriceData?.[0]?.price || null,
            week_ago_price: weekAgoPriceData?.[0]?.price || null,
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

  const toggleBothCharts = () => {
    const newState = !isChartExpanded
    setIsChartExpanded(newState)
    setIsMonthChartExpanded(newState)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 p-3 md:p-4">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                  Staple Food Prices
                </h1>
                <button
                  onClick={toggleBothCharts}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors mb-1"
                  aria-label={isChartExpanded ? "Collapse charts" : "Expand charts"}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isChartExpanded ? (
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
                    const weekAgoTotal = productsWithPrices.reduce((sum, product) => sum + (product.week_ago_price || product.price || 0), 0)
                    const monthAgoTotal = productsWithPrices.reduce((sum, product) => sum + (product.month_ago_price || product.price || 0), 0)
                    const firstTotal = productsWithPrices.reduce((sum, product) => sum + (product.first_price || 0), 0)
                    const dailyChange = currentTotal - previousTotal
                    const weeklyChange = currentTotal - weekAgoTotal
                    const monthlyChange = currentTotal - monthAgoTotal

                    if (previousTotal === 0 && weekAgoTotal === 0 && monthAgoTotal === 0 && firstTotal === 0) {
                      return 'border-cyan-400'
                    } else if (dailyChange === 0 && weeklyChange === 0 && monthlyChange === 0) {
                      return 'border-cyan-400'
                    } else if (dailyChange < 0 || weeklyChange < 0 || monthlyChange < 0) {
                      return 'border-green-400'
                    } else {
                      return 'border-red-400'
                    }
                  })()
                }`}>
                  <div className="text-left mb-2">
                    <p className="text-xs">
                      <span className="text-white font-semibold mr-1">(D) -</span>
                      {productsWithPrices.map((p, index) => {
                        const change = (p.price || 0) - (p.previous_price || 0)
                        const hasChange = p.previous_price !== null && change !== 0

                        let textColor = 'text-white'
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
                      <span className="text-white"> - (Walmart)</span>
                    </p>
                  </div>
                  <div className="flex justify-start items-center">
                    {(() => {
                      const currentTotal = productsWithPrices.reduce((sum, product) => sum + (product.price || 0), 0)
                      const previousTotal = productsWithPrices.reduce((sum, product) => sum + (product.previous_price || 0), 0)
                      const weekAgoTotal = productsWithPrices.reduce((sum, product) => sum + (product.week_ago_price || product.price || 0), 0)
                      const monthAgoTotal = productsWithPrices.reduce((sum, product) => sum + (product.month_ago_price || product.price || 0), 0)
                      const firstTotal = productsWithPrices.reduce((sum, product) => sum + (product.first_price || 0), 0)
                      const dailyChange = currentTotal - previousTotal
                      const weeklyChange = currentTotal - weekAgoTotal
                      const monthlyChange = currentTotal - monthAgoTotal

                      const showMetrics = firstTotal > 0

                      // Calculate daily percentage
                      const dailyPercentage = previousTotal > 0 ? ((dailyChange / previousTotal) * 100).toFixed(2) : '0.00'
                      const dailyChangeValue = previousTotal > 0 ? dailyChange : 0

                      // Calculate weekly percentage (if no week ago price, assume same as current, so 0% change)
                      const weeklyPercentage = weekAgoTotal > 0 ? ((weeklyChange / weekAgoTotal) * 100).toFixed(2) : '0.00'
                      const weeklyChangeValue = weeklyChange

                      // Calculate monthly percentage (if no month ago price, assume same as current, so 0% change)
                      const monthlyPercentage = monthAgoTotal > 0 ? ((monthlyChange / monthAgoTotal) * 100).toFixed(2) : '0.00'
                      const monthlyChangeValue = monthlyChange

                      return (
                        <span className="text-white text-xs font-semibold">
                          Total Change <i className={`fas fa-circle ${dailyChangeValue < 0 ? 'text-green-400' : dailyChangeValue > 0 ? 'text-red-400' : 'text-cyan-400'} mr-0.5`}></i>(D) {dailyChangeValue > 0 ? '+' : ''}{dailyPercentage}% <i className={`fas ${dailyChangeValue < 0 ? 'fa-arrow-trend-down text-green-400' : dailyChangeValue > 0 ? 'fa-arrow-trend-up text-red-400' : 'fa-arrow-trend-up text-cyan-400'} ml-0.5`}></i>
                          {showMetrics && <span className="mx-1"></span>}
                          {showMetrics && (
                            <>
                              <i className={`fas fa-circle ${weeklyChangeValue < 0 ? 'text-green-400' : weeklyChangeValue > 0 ? 'text-red-400' : 'text-cyan-400'} mr-0.5`}></i>(W) {weeklyChangeValue > 0 ? '+' : ''}{weeklyPercentage}% <i className={`fas ${weeklyChangeValue < 0 ? 'fa-arrow-trend-down text-green-400' : weeklyChangeValue > 0 ? 'fa-arrow-trend-up text-red-400' : 'fa-arrow-trend-up text-cyan-400'} ml-0.5`}></i>
                            </>
                          )}
                          {showMetrics && <span className="mx-1"></span>}
                          {showMetrics && (
                            <>
                              <i className={`fas fa-circle ${monthlyChangeValue < 0 ? 'text-green-400' : monthlyChangeValue > 0 ? 'text-red-400' : 'text-cyan-400'} mr-0.5`}></i>(M) {monthlyChangeValue > 0 ? '+' : ''}{monthlyPercentage}% <i className={`fas ${monthlyChangeValue < 0 ? 'fa-arrow-trend-down text-green-400' : monthlyChangeValue > 0 ? 'fa-arrow-trend-up text-red-400' : 'fa-arrow-trend-up text-cyan-400'} ml-0.5`}></i>
                            </>
                          )}
                        </span>
                      )
                    })()}
                  </div>

                  {/* 7-Day Chart */}
                  {chartData.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 font-semibold">7-Day Price Trend</span>
                        <button
                          onClick={() => setIsChartExpanded(!isChartExpanded)}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                          aria-label={isChartExpanded ? "Collapse chart" : "Expand chart"}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {isChartExpanded ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            )}
                          </svg>
                        </button>
                      </div>
                      {isChartExpanded && (
                        <div className="relative h-32">
                          {(() => {
                            const maxTotal = Math.max(...chartData.map(d => d.total))
                            const minTotal = Math.min(...chartData.map(d => d.total))
                            const range = maxTotal - minTotal || 1

                            return (
                              <svg viewBox="0 0 400 100" className="w-full h-full">
                                {/* Grid lines */}
                                <line x1="0" y1="0" x2="400" y2="0" stroke="#475569" strokeWidth="0.5" />
                                <line x1="0" y1="50" x2="400" y2="50" stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
                                <line x1="0" y1="100" x2="400" y2="100" stroke="#475569" strokeWidth="0.5" />

                                {/* Line chart */}
                                <polyline
                                  points={chartData.map((point, index) => {
                                    const x = (index / (chartData.length - 1)) * 380 + 10
                                    const y = 90 - ((point.total - minTotal) / range) * 80
                                    return `${x},${y}`
                                  }).join(' ')}
                                  fill="none"
                                  stroke="#22d3ee"
                                  strokeWidth="2"
                                />

                                {/* Data points */}
                                {chartData.map((point, index) => {
                                  const x = (index / (chartData.length - 1)) * 380 + 10
                                  const y = 90 - ((point.total - minTotal) / range) * 80
                                  return (
                                    <g key={index}>
                                      <circle cx={x} cy={y} r="3" fill="#22d3ee" />
                                      <text x={x} y="105" textAnchor="middle" fill="#94a3b8" fontSize="10">
                                        {point.date}
                                      </text>
                                    </g>
                                  )
                                })}
                              </svg>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 30-Day Chart */}
                  {monthChartData.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 font-semibold">30-Day Price Trend</span>
                        <button
                          onClick={() => setIsMonthChartExpanded(!isMonthChartExpanded)}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                          aria-label={isMonthChartExpanded ? "Collapse chart" : "Expand chart"}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {isMonthChartExpanded ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            )}
                          </svg>
                        </button>
                      </div>
                      {isMonthChartExpanded && (
                        <div className="relative h-32">
                          {(() => {
                            const maxTotal = Math.max(...monthChartData.map(d => d.total))
                            const minTotal = Math.min(...monthChartData.map(d => d.total))
                            const range = maxTotal - minTotal || 1

                            return (
                              <svg viewBox="0 0 400 100" className="w-full h-full">
                                {/* Grid lines */}
                                <line x1="0" y1="0" x2="400" y2="0" stroke="#475569" strokeWidth="0.5" />
                                <line x1="0" y1="50" x2="400" y2="50" stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
                                <line x1="0" y1="100" x2="400" y2="100" stroke="#475569" strokeWidth="0.5" />

                                {/* Line chart */}
                                <polyline
                                  points={monthChartData.map((point, index) => {
                                    const x = (index / (monthChartData.length - 1)) * 380 + 10
                                    const y = 90 - ((point.total - minTotal) / range) * 80
                                    return `${x},${y}`
                                  }).join(' ')}
                                  fill="none"
                                  stroke="#22d3ee"
                                  strokeWidth="2"
                                />

                                {/* Data points */}
                                {monthChartData.map((point, index) => {
                                  const x = (index / (monthChartData.length - 1)) * 380 + 10
                                  const y = 90 - ((point.total - minTotal) / range) * 80
                                  return (
                                    <g key={index}>
                                      <circle cx={x} cy={y} r="3" fill="#22d3ee" />
                                      <text x={x} y="105" textAnchor="middle" fill="#94a3b8" fontSize="10">
                                        {point.date}
                                      </text>
                                    </g>
                                  )
                                })}
                              </svg>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  )}
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
