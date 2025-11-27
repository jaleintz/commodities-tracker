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

interface UnemploymentDataPoint {
  date: string
  value: number
}

export default function DisplayPage() {
  const [productsWithPrices, setProductsWithPrices] = useState<ProductWithPrice[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [monthChartData, setMonthChartData] = useState<ChartDataPoint[]>([])
  const [unemploymentData, setUnemploymentData] = useState<UnemploymentDataPoint[]>([])
  const [latestUnemployment, setLatestUnemployment] = useState<number | null>(null)
  const [previousUnemployment, setPreviousUnemployment] = useState<number | null>(null)
  const [claimsData, setClaimsData] = useState<UnemploymentDataPoint[]>([])
  const [latestClaims, setLatestClaims] = useState<number | null>(null)
  const [previousClaims, setPreviousClaims] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isChartExpanded, setIsChartExpanded] = useState(false)
  const [isMonthChartExpanded, setIsMonthChartExpanded] = useState(false)
  const [isUnemploymentChartExpanded, setIsUnemploymentChartExpanded] = useState(false)
  const [isClaimsChartExpanded, setIsClaimsChartExpanded] = useState(false)

  useEffect(() => {
    fetchLatestPrices()
    fetchChartData()
    fetchMonthChartData()
    fetchUnemploymentData()
    fetchClaimsData()
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

  const fetchUnemploymentData = async () => {
    try {
      // Fetch unemployment data from database
      const { data: unemploymentRecords, error: unemploymentError } = await supabase
        .from('fred_indicators_tb')
        .select('observation_date, value')
        .eq('series_id', 'UNRATE')
        .order('observation_date', { ascending: false })
        .limit(12) // Get last 12 months

      if (unemploymentError) throw unemploymentError

      if (unemploymentRecords && unemploymentRecords.length > 0) {
        // Set latest unemployment rate
        setLatestUnemployment(unemploymentRecords[0].value)

        // Set previous unemployment rate (if available)
        if (unemploymentRecords.length > 1) {
          setPreviousUnemployment(unemploymentRecords[1].value)
        }

        // Format data for chart (reverse to show oldest to newest)
        const chartData = unemploymentRecords.reverse().map(record => {
          const date = new Date(record.observation_date)
          const displayDate = `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`
          return {
            date: displayDate,
            value: record.value
          }
        })
        setUnemploymentData(chartData)
      }
    } catch (error: any) {
      console.error('Error fetching unemployment data:', error)
    }
  }

  const fetchClaimsData = async () => {
    try {
      // Fetch claims data from database
      const { data: claimsRecords, error: claimsError } = await supabase
        .from('fred_claims_tb')
        .select('observation_date, value')
        .eq('series_id', 'ICSA')
        .order('observation_date', { ascending: false })
        .limit(24) // Get last 24 weeks (about 6 months)

      if (claimsError) throw claimsError

      if (claimsRecords && claimsRecords.length > 0) {
        // Set latest claims number
        setLatestClaims(claimsRecords[0].value)

        // Set previous claims number (if available)
        if (claimsRecords.length > 1) {
          setPreviousClaims(claimsRecords[1].value)
        }

        // Format data for chart (reverse to show oldest to newest)
        const chartData = claimsRecords.reverse().map(record => {
          const date = new Date(record.observation_date)
          const displayDate = `${date.getMonth() + 1}/${date.getDate()}`
          return {
            date: displayDate,
            value: record.value
          }
        })
        setClaimsData(chartData)
      }
    } catch (error: any) {
      console.error('Error fetching claims data:', error)
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

  const toggleAllCharts = () => {
    const newState = !isMonthChartExpanded
    setIsChartExpanded(newState)
    setIsMonthChartExpanded(newState)
    setIsUnemploymentChartExpanded(newState)
    setIsClaimsChartExpanded(newState)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="flex items-center justify-center gap-4 pt-8">
        <h1 className="text-2xl font-light text-white tracking-widest">I N D I C A T O R S</h1>
        <button
          onClick={toggleAllCharts}
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
          aria-label={isMonthChartExpanded ? "Collapse all charts" : "Expand all charts"}
        >
          <svg
            className="w-6 h-6"
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
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
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

                <div className="w-full max-w-md rounded-lg p-4 border-2 mb-4 bg-black border-green-400">
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold" style={{ color: 'rgb(0, 197, 255)' }}>Staple Food Prices at Walmart:</p>
                      {(() => {
                        const currentTotal = productsWithPrices.reduce((sum, product) => sum + (product.price || 0), 0)
                        const previousTotal = productsWithPrices.reduce((sum, product) => sum + (product.previous_price || 0), 0)
                        const dailyChange = currentTotal - previousTotal
                        const dailyPercentage = previousTotal > 0 ? ((dailyChange / previousTotal) * 100).toFixed(2) : '0.00'

                        return (
                          <div className="flex items-end gap-2">
                            <p className="font-semibold text-slate-400 mb-1" style={{ fontSize: '0.5em' }}>(Updated Daily)</p>
                            <p className="text-lg font-bold text-white">{dailyChange > 0 ? '+' : ''}{dailyPercentage}%</p>
                            {dailyChange < 0 && (
                              <i className="fas fa-arrow-trend-down text-green-400 text-lg"></i>
                            )}
                            {dailyChange > 0 && (
                              <i className="fas fa-arrow-trend-up text-red-400 text-lg"></i>
                            )}
                            {dailyChange === 0 && (
                              <i className="fas fa-arrow-right text-cyan-400 text-lg"></i>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                  <div className="text-left mb-2">
                    <p className="text-xs">
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
                          <i className={`fas fa-circle ${dailyChangeValue < 0 ? 'text-green-400' : dailyChangeValue > 0 ? 'text-red-400' : 'text-cyan-400'} mr-0.5`}></i>(D) {dailyChangeValue > 0 ? '+' : ''}{dailyPercentage}% <i className={`fas ${dailyChangeValue < 0 ? 'fa-arrow-trend-down text-green-400' : dailyChangeValue > 0 ? 'fa-arrow-trend-up text-red-400' : 'fa-arrow-right text-cyan-400'} ml-0.5`}></i>
                          {showMetrics && <span className="mx-1"></span>}
                          {showMetrics && (
                            <>
                              <i className={`fas fa-circle ${weeklyChangeValue < 0 ? 'text-green-400' : weeklyChangeValue > 0 ? 'text-red-400' : 'text-cyan-400'} mr-0.5`}></i>(W) {weeklyChangeValue > 0 ? '+' : ''}{weeklyPercentage}% <i className={`fas ${weeklyChangeValue < 0 ? 'fa-arrow-trend-down text-green-400' : weeklyChangeValue > 0 ? 'fa-arrow-trend-up text-red-400' : 'fa-arrow-right text-cyan-400'} ml-0.5`}></i>
                            </>
                          )}
                          {showMetrics && <span className="mx-1"></span>}
                          {showMetrics && (
                            <>
                              <i className={`fas fa-circle ${monthlyChangeValue < 0 ? 'text-green-400' : monthlyChangeValue > 0 ? 'text-red-400' : 'text-cyan-400'} mr-0.5`}></i>(M) {monthlyChangeValue > 0 ? '+' : ''}{monthlyPercentage}% <i className={`fas ${monthlyChangeValue < 0 ? 'fa-arrow-trend-down text-green-400' : monthlyChangeValue > 0 ? 'fa-arrow-trend-up text-red-400' : 'fa-arrow-right text-cyan-400'} ml-0.5`}></i>
                            </>
                          )}
                        </span>
                      )
                    })()}
                  </div>

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

            {/* Unemployment Rate Section */}
            {!isLoading && !error && latestUnemployment !== null && (
              <div className="mt-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full max-w-md rounded-lg p-4 border-2 bg-black border-green-400">
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-lg font-semibold" style={{ color: 'rgb(0, 197, 255)' }}>U.S. Unemployment Rate:</p>
                          <div className="flex items-end gap-2">
                            <p className="font-semibold text-slate-400 mb-1" style={{ fontSize: '0.5em' }}>(Updated Monthly)</p>
                            <p className="text-lg font-bold text-white">{latestUnemployment.toFixed(1)}%</p>
                            {previousUnemployment !== null && latestUnemployment !== null && (
                              <>
                                {latestUnemployment > previousUnemployment && (
                                  <i className="fas fa-arrow-trend-up text-red-400 text-lg"></i>
                                )}
                                {latestUnemployment < previousUnemployment && (
                                  <i className="fas fa-arrow-trend-down text-green-400 text-lg"></i>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">
                          Source: <a href="https://fred.stlouisfed.org/series/UNRATE/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Federal Reserve Economic Data (FRED)</a>
                        </p>
                      </div>

                      {/* Unemployment Chart */}
                      {unemploymentData.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-600">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-400 font-semibold">12-Month Trend</span>
                            <button
                              onClick={() => setIsUnemploymentChartExpanded(!isUnemploymentChartExpanded)}
                              className="text-cyan-400 hover:text-cyan-300 transition-colors"
                              aria-label={isUnemploymentChartExpanded ? "Collapse chart" : "Expand chart"}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                {isUnemploymentChartExpanded ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                )}
                              </svg>
                            </button>
                          </div>
                          {isUnemploymentChartExpanded && (
                            <div className="relative h-32">
                              {(() => {
                                const maxValue = Math.max(...unemploymentData.map(d => d.value))
                                const minValue = Math.min(...unemploymentData.map(d => d.value))
                                const range = maxValue - minValue || 1

                                return (
                                  <svg viewBox="0 0 400 100" className="w-full h-full">
                                    {/* Grid lines */}
                                    <line x1="0" y1="0" x2="400" y2="0" stroke="#475569" strokeWidth="0.5" />
                                    <line x1="0" y1="50" x2="400" y2="50" stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
                                    <line x1="0" y1="100" x2="400" y2="100" stroke="#475569" strokeWidth="0.5" />

                                    {/* Line chart */}
                                    <polyline
                                      points={unemploymentData.map((point, index) => {
                                        const x = (index / (unemploymentData.length - 1)) * 380 + 10
                                        const y = 90 - ((point.value - minValue) / range) * 80
                                        return `${x},${y}`
                                      }).join(' ')}
                                      fill="none"
                                      stroke="#22d3ee"
                                      strokeWidth="2"
                                    />

                                    {/* Data points */}
                                    {unemploymentData.map((point, index) => {
                                      const x = (index / (unemploymentData.length - 1)) * 380 + 10
                                      const y = 90 - ((point.value - minValue) / range) * 80
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
                </div>
            )}

            {/* Unemployment Claims Section */}
            {!isLoading && !error && latestClaims !== null && (
              <div className="mt-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full max-w-md rounded-lg p-4 border-2 bg-black border-green-400">
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-lg font-semibold" style={{ color: 'rgb(0, 197, 255)' }}>U.S. Unemployment Claims:</p>
                          <div className="flex items-end gap-2">
                            <p className="font-semibold text-slate-400 mb-1" style={{ fontSize: '0.5em' }}>(Updated Weekly)</p>
                            <p className="text-lg font-bold text-white">{latestClaims.toLocaleString()}</p>
                            {previousClaims !== null && latestClaims !== null && (
                              <>
                                {latestClaims > previousClaims && (
                                  <i className="fas fa-arrow-trend-up text-red-400 text-lg"></i>
                                )}
                                {latestClaims < previousClaims && (
                                  <i className="fas fa-arrow-trend-down text-green-400 text-lg"></i>
                                )}
                                {latestClaims === previousClaims && (
                                  <i className="fas fa-arrow-right text-cyan-400 text-lg"></i>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">
                          Source: <a href="https://fred.stlouisfed.org/series/ICSA/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Federal Reserve Economic Data (FRED)</a>
                        </p>
                      </div>

                      {/* Claims Chart */}
                      {claimsData.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-600">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-400 font-semibold">24-Week Trend</span>
                            <button
                              onClick={() => setIsClaimsChartExpanded(!isClaimsChartExpanded)}
                              className="text-cyan-400 hover:text-cyan-300 transition-colors"
                              aria-label={isClaimsChartExpanded ? "Collapse chart" : "Expand chart"}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                {isClaimsChartExpanded ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                )}
                              </svg>
                            </button>
                          </div>
                          {isClaimsChartExpanded && (
                            <div className="relative h-32">
                              {(() => {
                                const maxValue = Math.max(...claimsData.map(d => d.value))
                                const minValue = Math.min(...claimsData.map(d => d.value))
                                const range = maxValue - minValue || 1

                                return (
                                  <svg viewBox="0 0 400 100" className="w-full h-full">
                                    {/* Grid lines */}
                                    <line x1="0" y1="0" x2="400" y2="0" stroke="#475569" strokeWidth="0.5" />
                                    <line x1="0" y1="50" x2="400" y2="50" stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
                                    <line x1="0" y1="100" x2="400" y2="100" stroke="#475569" strokeWidth="0.5" />

                                    {/* Line chart */}
                                    <polyline
                                      points={claimsData.map((point, index) => {
                                        const x = (index / (claimsData.length - 1)) * 380 + 10
                                        const y = 90 - ((point.value - minValue) / range) * 80
                                        return `${x},${y}`
                                      }).join(' ')}
                                      fill="none"
                                      stroke="#22d3ee"
                                      strokeWidth="2"
                                    />

                                    {/* Data points */}
                                    {claimsData.map((point, index) => {
                                      const x = (index / (claimsData.length - 1)) * 380 + 10
                                      const y = 90 - ((point.value - minValue) / range) * 80
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
  )
}
