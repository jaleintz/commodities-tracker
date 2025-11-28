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
  const [mortgageData, setMortgageData] = useState<UnemploymentDataPoint[]>([])
  const [latestMortgage, setLatestMortgage] = useState<number | null>(null)
  const [previousMortgage, setPreviousMortgage] = useState<number | null>(null)
  const [stickyCoreData, setStickyCoreData] = useState<UnemploymentDataPoint[]>([])
  const [latestStickyCore, setLatestStickyCore] = useState<number | null>(null)
  const [previousStickyCore, setPreviousStickyCore] = useState<number | null>(null)
  const [wtiData, setWtiData] = useState<UnemploymentDataPoint[]>([])
  const [latestWti, setLatestWti] = useState<number | null>(null)
  const [previousWti, setPreviousWti] = useState<number | null>(null)
  const [housePriceData, setHousePriceData] = useState<UnemploymentDataPoint[]>([])
  const [latestHousePrice, setLatestHousePrice] = useState<number | null>(null)
  const [previousHousePrice, setPreviousHousePrice] = useState<number | null>(null)
  const [jobOpeningsData, setJobOpeningsData] = useState<UnemploymentDataPoint[]>([])
  const [latestJobOpenings, setLatestJobOpenings] = useState<number | null>(null)
  const [previousJobOpenings, setPreviousJobOpenings] = useState<number | null>(null)
  const [activeListingsData, setActiveListingsData] = useState<UnemploymentDataPoint[]>([])
  const [latestActiveListings, setLatestActiveListings] = useState<number | null>(null)
  const [previousActiveListings, setPreviousActiveListings] = useState<number | null>(null)
  const [m2Data, setM2Data] = useState<UnemploymentDataPoint[]>([])
  const [latestM2, setLatestM2] = useState<number | null>(null)
  const [previousM2, setPreviousM2] = useState<number | null>(null)
  const [consumerSentimentData, setConsumerSentimentData] = useState<UnemploymentDataPoint[]>([])
  const [latestConsumerSentiment, setLatestConsumerSentiment] = useState<number | null>(null)
  const [previousConsumerSentiment, setPreviousConsumerSentiment] = useState<number | null>(null)
  const [vixData, setVixData] = useState<UnemploymentDataPoint[]>([])
  const [latestVix, setLatestVix] = useState<number | null>(null)
  const [previousVix, setPreviousVix] = useState<number | null>(null)
  const [inflationData, setInflationData] = useState<UnemploymentDataPoint[]>([])
  const [latestInflation, setLatestInflation] = useState<number | null>(null)
  const [previousInflation, setPreviousInflation] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isChartExpanded, setIsChartExpanded] = useState(false)
  const [isMonthChartExpanded, setIsMonthChartExpanded] = useState(false)
  const [isUnemploymentChartExpanded, setIsUnemploymentChartExpanded] = useState(false)
  const [isClaimsChartExpanded, setIsClaimsChartExpanded] = useState(false)
  const [isMortgageChartExpanded, setIsMortgageChartExpanded] = useState(false)
  const [isStickyCoreChartExpanded, setIsStickyCoreChartExpanded] = useState(false)
  const [isWtiChartExpanded, setIsWtiChartExpanded] = useState(false)
  const [isHousePriceChartExpanded, setIsHousePriceChartExpanded] = useState(false)
  const [isJobOpeningsChartExpanded, setIsJobOpeningsChartExpanded] = useState(false)
  const [isActiveListingsChartExpanded, setIsActiveListingsChartExpanded] = useState(false)
  const [isM2ChartExpanded, setIsM2ChartExpanded] = useState(false)
  const [isConsumerSentimentChartExpanded, setIsConsumerSentimentChartExpanded] = useState(false)
  const [isVixChartExpanded, setIsVixChartExpanded] = useState(false)
  const [isInflationChartExpanded, setIsInflationChartExpanded] = useState(false)
  const [viewMode, setViewMode] = useState<'mini' | 'medium' | 'max'>('medium')
  const [showViewModeArrows, setShowViewModeArrows] = useState(true)

  useEffect(() => {
    // Hide arrows after 10 seconds
    const timer = setTimeout(() => {
      setShowViewModeArrows(false)
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    fetchLatestPrices()
    fetchChartData()
    fetchMonthChartData()
    fetchUnemploymentData()
    fetchClaimsData()
    fetchMortgageData()
    fetchStickyCoreData()
    fetchWtiData()
    fetchHousePriceData()
    fetchJobOpeningsData()
    fetchActiveListingsData()
    fetchM2Data()
    fetchConsumerSentimentData()
    fetchVixData()
    fetchInflationData()
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

  const fetchMortgageData = async () => {
    try {
      // Fetch mortgage rate data from database
      const { data: mortgageRecords, error: mortgageError } = await supabase
        .from('fred_mortgage_tb')
        .select('observation_date, value')
        .eq('series_id', 'MORTGAGE30US')
        .order('observation_date', { ascending: false })
        .limit(24) // Get last 24 weeks (about 6 months)

      if (mortgageError) throw mortgageError

      if (mortgageRecords && mortgageRecords.length > 0) {
        // Set latest mortgage rate
        setLatestMortgage(mortgageRecords[0].value)

        // Set previous mortgage rate (if available)
        if (mortgageRecords.length > 1) {
          setPreviousMortgage(mortgageRecords[1].value)
        }

        // Format data for chart (reverse to show oldest to newest)
        const chartData = mortgageRecords.reverse().map(record => {
          const date = new Date(record.observation_date)
          const displayDate = `${date.getMonth() + 1}/${date.getDate()}`
          return {
            date: displayDate,
            value: record.value
          }
        })
        setMortgageData(chartData)
      }
    } catch (error: any) {
      console.error('Error fetching mortgage data:', error)
    }
  }

  const fetchStickyCoreData = async () => {
    try {
      // Fetch sticky core CPI data from database
      const { data: stickyCoreRecords, error: stickyCoreError } = await supabase
        .from('fred_stickycore_tb')
        .select('observation_date, value')
        .eq('series_id', 'CORESTICKM159SFRBATL')
        .order('observation_date', { ascending: false })
        .limit(12) // Get last 12 months

      if (stickyCoreError) throw stickyCoreError

      if (stickyCoreRecords && stickyCoreRecords.length > 0) {
        // Set latest sticky core CPI
        setLatestStickyCore(stickyCoreRecords[0].value)

        // Set previous sticky core CPI (if available)
        if (stickyCoreRecords.length > 1) {
          setPreviousStickyCore(stickyCoreRecords[1].value)
        }

        // Format data for chart (reverse to show oldest to newest)
        const chartData = stickyCoreRecords.reverse().map(record => {
          const date = new Date(record.observation_date)
          const displayDate = `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`
          return {
            date: displayDate,
            value: record.value
          }
        })
        setStickyCoreData(chartData)
      }
    } catch (error: any) {
      console.error('Error fetching sticky core CPI data:', error)
    }
  }

  const fetchWtiData = async () => {
    try {
      // Fetch WTI data from database
      const { data: wtiRecords, error: wtiError } = await supabase
        .from('fred_wti_tb')
        .select('observation_date, value')
        .eq('series_id', 'DCOILWTICO')
        .order('observation_date', { ascending: false })
        .limit(60) // Get last 60 days

      if (wtiError) throw wtiError

      if (wtiRecords && wtiRecords.length > 0) {
        // Set latest WTI price
        setLatestWti(wtiRecords[0].value)

        // Set previous WTI price (if available)
        if (wtiRecords.length > 1) {
          setPreviousWti(wtiRecords[1].value)
        }

        // Format data for chart (reverse to show oldest to newest)
        const chartData = wtiRecords.reverse().map(record => {
          const date = new Date(record.observation_date)
          const displayDate = `${date.getMonth() + 1}/${date.getDate()}`
          return {
            date: displayDate,
            value: record.value
          }
        })
        setWtiData(chartData)
      }
    } catch (error: any) {
      console.error('Error fetching WTI data:', error)
    }
  }

  const fetchHousePriceData = async () => {
    try {
      // Fetch house price data from database
      const { data: housePriceRecords, error: housePriceError } = await supabase
        .from('fred_house_price_tb')
        .select('observation_date, value')
        .eq('series_id', 'ASPUS')
        .order('observation_date', { ascending: false })
        .limit(40) // Get last 40 quarters (10 years)

      if (housePriceError) throw housePriceError

      if (housePriceRecords && housePriceRecords.length > 0) {
        // Set latest house price
        setLatestHousePrice(housePriceRecords[0].value)

        // Set previous house price (if available)
        if (housePriceRecords.length > 1) {
          setPreviousHousePrice(housePriceRecords[1].value)
        }

        // Format data for chart (reverse to show oldest to newest)
        const chartData = housePriceRecords.reverse().map(record => {
          const date = new Date(record.observation_date)
          const displayDate = `${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`
          return {
            date: displayDate,
            value: record.value
          }
        })
        setHousePriceData(chartData)
      }
    } catch (error: any) {
      console.error('Error fetching house price data:', error)
    }
  }

  const fetchJobOpeningsData = async () => {
    try {
      // Fetch job openings data from database
      const { data: jobOpeningsRecords, error: jobOpeningsError } = await supabase
        .from('fred_job_openings_tb')
        .select('observation_date, value')
        .eq('series_id', 'JTSJOL')
        .order('observation_date', { ascending: false })
        .limit(60) // Get last 60 months (5 years)

      if (jobOpeningsError) throw jobOpeningsError

      if (jobOpeningsRecords && jobOpeningsRecords.length > 0) {
        // Set latest job openings
        setLatestJobOpenings(jobOpeningsRecords[0].value)

        // Set previous job openings (if available)
        if (jobOpeningsRecords.length > 1) {
          setPreviousJobOpenings(jobOpeningsRecords[1].value)
        }

        // Format data for chart (reverse to show oldest to newest)
        const chartData = jobOpeningsRecords.reverse().map(record => {
          const date = new Date(record.observation_date)
          const displayDate = `${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`
          return {
            date: displayDate,
            value: record.value
          }
        })
        setJobOpeningsData(chartData)
      }
    } catch (error: any) {
      console.error('Error fetching job openings data:', error)
    }
  }

  const fetchActiveListingsData = async () => {
    try {
      // Fetch active listings data from database
      const { data: activeListingsRecords, error: activeListingsError } = await supabase
        .from('fred_active_listings_tb')
        .select('observation_date, value')
        .eq('series_id', 'ACTLISCOUUS')
        .order('observation_date', { ascending: false })
        .limit(60) // Get last 60 months (5 years)

      if (activeListingsError) throw activeListingsError

      if (activeListingsRecords && activeListingsRecords.length > 0) {
        // Set latest active listings
        setLatestActiveListings(activeListingsRecords[0].value)

        // Set previous active listings (if available)
        if (activeListingsRecords.length > 1) {
          setPreviousActiveListings(activeListingsRecords[1].value)
        }

        // Format data for chart (reverse to show oldest to newest)
        const chartData = activeListingsRecords.reverse().map(record => {
          const date = new Date(record.observation_date)
          const displayDate = `${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`
          return {
            date: displayDate,
            value: record.value
          }
        })
        setActiveListingsData(chartData)
      }
    } catch (error: any) {
      console.error('Error fetching active listings data:', error)
    }
  }

  const fetchM2Data = async () => {
    try {
      // Fetch M2 money stock data from database
      const { data: m2Records, error: m2Error } = await supabase
        .from('fred_m2_money_stock_tb')
        .select('observation_date, value')
        .eq('series_id', 'M2SL')
        .order('observation_date', { ascending: false })
        .limit(60) // Get last 60 months (5 years)

      if (m2Error) throw m2Error

      if (m2Records && m2Records.length > 0) {
        // Set latest M2
        setLatestM2(m2Records[0].value)

        // Set previous M2 (if available)
        if (m2Records.length > 1) {
          setPreviousM2(m2Records[1].value)
        }

        // Format data for chart (reverse to show oldest to newest)
        const chartData = m2Records.reverse().map(record => {
          const date = new Date(record.observation_date)
          const displayDate = `${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`
          return {
            date: displayDate,
            value: record.value
          }
        })
        setM2Data(chartData)
      }
    } catch (error: any) {
      console.error('Error fetching M2 data:', error)
    }
  }

  const fetchConsumerSentimentData = async () => {
    try {
      // Fetch consumer sentiment data from database
      const { data: sentimentRecords, error: sentimentError } = await supabase
        .from('fred_consumer_sentiment_tb')
        .select('observation_date, value')
        .eq('series_id', 'UMCSENT')
        .order('observation_date', { ascending: false })
        .limit(60) // Get last 60 months (5 years)

      if (sentimentError) throw sentimentError

      if (sentimentRecords && sentimentRecords.length > 0) {
        // Set latest consumer sentiment
        setLatestConsumerSentiment(sentimentRecords[0].value)

        // Set previous consumer sentiment (if available)
        if (sentimentRecords.length > 1) {
          setPreviousConsumerSentiment(sentimentRecords[1].value)
        }

        // Format data for chart (reverse to show oldest to newest)
        const chartData = sentimentRecords.reverse().map(record => {
          const date = new Date(record.observation_date)
          const displayDate = `${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`
          return {
            date: displayDate,
            value: record.value
          }
        })
        setConsumerSentimentData(chartData)
      }
    } catch (error: any) {
      console.error('Error fetching consumer sentiment data:', error)
    }
  }

  const fetchVixData = async () => {
    try {
      // Fetch VIX data from database
      const { data: vixRecords, error: vixError } = await supabase
        .from('fred_vix_tb')
        .select('observation_date, value')
        .eq('series_id', 'VIXCLS')
        .order('observation_date', { ascending: false })
        .limit(365) // Get last year of daily data

      if (vixError) throw vixError

      if (vixRecords && vixRecords.length > 0) {
        // Set latest VIX
        setLatestVix(vixRecords[0].value)

        // Set previous VIX (if available)
        if (vixRecords.length > 1) {
          setPreviousVix(vixRecords[1].value)
        }

        // Format data for chart (reverse to show oldest to newest)
        const chartData = vixRecords.reverse().map(record => {
          const date = new Date(record.observation_date)
          const displayDate = `${date.getMonth() + 1}/${date.getDate()}`
          return {
            date: displayDate,
            value: record.value
          }
        })
        setVixData(chartData)
      }
    } catch (error: any) {
      console.error('Error fetching VIX data:', error)
    }
  }

  const fetchInflationData = async () => {
    try {
      // Fetch inflation data from database
      const { data: inflationRecords, error: inflationError } = await supabase
        .from('fred_inflation_tb')
        .select('observation_date, value')
        .eq('series_id', 'FPCPITOTLZGUSA')
        .order('observation_date', { ascending: false })
        .limit(30) // Get last 30 years

      if (inflationError) throw inflationError

      if (inflationRecords && inflationRecords.length > 0) {
        // Set latest inflation
        setLatestInflation(inflationRecords[0].value)

        // Set previous inflation (if available)
        if (inflationRecords.length > 1) {
          setPreviousInflation(inflationRecords[1].value)
        }

        // Format data for chart (reverse to show oldest to newest)
        const chartData = inflationRecords.reverse().map(record => {
          const date = new Date(record.observation_date)
          const displayDate = `${date.getFullYear()}`
          return {
            date: displayDate,
            value: record.value
          }
        })
        setInflationData(chartData)
      }
    } catch (error: any) {
      console.error('Error fetching inflation data:', error)
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
    setIsMortgageChartExpanded(newState)
  }

  const handleViewUp = () => {
    if (viewMode === 'medium') {
      setViewMode('mini')
    } else if (viewMode === 'max') {
      setViewMode('medium')
      // Collapse all charts when going back to medium
      setIsChartExpanded(false)
      setIsMonthChartExpanded(false)
      setIsUnemploymentChartExpanded(false)
      setIsClaimsChartExpanded(false)
      setIsMortgageChartExpanded(false)
      setIsStickyCoreChartExpanded(false)
      setIsWtiChartExpanded(false)
      setIsHousePriceChartExpanded(false)
      setIsJobOpeningsChartExpanded(false)
      setIsActiveListingsChartExpanded(false)
      setIsM2ChartExpanded(false)
      setIsConsumerSentimentChartExpanded(false)
      setIsVixChartExpanded(false)
      setIsInflationChartExpanded(false)
    }
  }

  const handleViewDown = () => {
    if (viewMode === 'mini') {
      setViewMode('medium')
    } else if (viewMode === 'medium') {
      setViewMode('max')
      // Expand all charts when going to max
      setIsChartExpanded(true)
      setIsMonthChartExpanded(true)
      setIsUnemploymentChartExpanded(true)
      setIsClaimsChartExpanded(true)
      setIsMortgageChartExpanded(true)
      setIsStickyCoreChartExpanded(true)
      setIsWtiChartExpanded(true)
      setIsHousePriceChartExpanded(true)
      setIsJobOpeningsChartExpanded(true)
      setIsActiveListingsChartExpanded(true)
      setIsM2ChartExpanded(true)
      setIsConsumerSentimentChartExpanded(true)
      setIsVixChartExpanded(true)
      setIsInflationChartExpanded(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation pulseHamburger={true} />
      <div className="flex flex-col items-center justify-center pt-6">
        {showViewModeArrows && (
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes pulseArrow {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
              }
              .pulse-arrow {
                animation: pulseArrow 2s ease-in-out infinite;
              }
            `
          }} />
        )}
        <h1 className="text-2xl font-light text-white tracking-widest">I N D I C A T O R S</h1>
        <div className="flex items-center gap-3 mt-2">
          {showViewModeArrows && (
            <svg
              className="w-6 h-6 text-green-400 pulse-arrow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          )}
          <span className="text-slate-400 font-semibold capitalize" style={{ fontSize: '0.625rem' }}>{viewMode} view</span>
          <div className="flex flex-col">
            <button
              onClick={handleViewUp}
              disabled={viewMode === 'mini'}
              className={`transition-colors ${viewMode === 'mini' ? 'text-gray-600 cursor-not-allowed' : 'text-cyan-400 hover:text-cyan-300'}`}
              aria-label="View less"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={handleViewDown}
              disabled={viewMode === 'max'}
              className={`transition-colors ${viewMode === 'max' ? 'text-gray-600 cursor-not-allowed' : 'text-cyan-400 hover:text-cyan-300'}`}
              aria-label="View more"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {showViewModeArrows && (
            <svg
              className="w-6 h-6 text-green-400 pulse-arrow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
          )}
        </div>
      </div>
      <div className="pt-2 pb-8 px-4 sm:px-6 lg:px-8">
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

          {/* 30-Year Mortgage Rate Section */}
          {!isLoading && !error && latestMortgage !== null && (
            <div className="flex flex-col items-center space-y-4">
              <div className={`w-full max-w-md rounded-lg ${viewMode === 'mini' ? 'py-1 px-2' : 'py-2.5 px-4'} border-2 bg-black border-green-400`}>
                  <div className={viewMode === 'mini' ? 'mb-1' : 'mb-2'}>
                    <div className={viewMode === 'mini' ? 'flex items-center justify-between mb-1' : 'flex items-center justify-between mb-2'}>
                      <p className={`font-semibold ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`} style={{ color: 'rgb(0, 197, 255)' }}>30-Year Mortgage Rate:</p>
                      <div className="flex items-end gap-2">
                        <p className="font-semibold text-slate-400 mb-1" style={{ fontSize: '0.5em' }}>(Weekly)</p>
                        <p className={`font-bold text-white ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}>{latestMortgage.toFixed(2)}%</p>
                        {previousMortgage !== null && latestMortgage !== null && (
                          <>
                            {latestMortgage > previousMortgage && (
                              <i className={`fas fa-arrow-trend-up text-red-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                            )}
                            {latestMortgage < previousMortgage && (
                              <i className={`fas fa-arrow-trend-down text-green-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                            )}
                            {latestMortgage === previousMortgage && (
                              <i className={`fas fa-arrow-right text-cyan-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {viewMode !== 'mini' && (
                      <p className="text-xs text-slate-500">
                        Source: <a href="https://fred.stlouisfed.org/series/MORTGAGE30US/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Federal Reserve Economic Data (FRED)</a>
                      </p>
                    )}
                  </div>

                  {/* Mortgage Rate Chart */}
                  {viewMode !== 'mini' && mortgageData.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 font-semibold">24-Week Trend</span>
                        <button
                          onClick={() => setIsMortgageChartExpanded(!isMortgageChartExpanded)}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                          aria-label={isMortgageChartExpanded ? "Collapse chart" : "Expand chart"}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {isMortgageChartExpanded ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            )}
                          </svg>
                        </button>
                      </div>
                      {isMortgageChartExpanded && (
                        <div className="relative h-32">
                          {(() => {
                            const maxValue = Math.max(...mortgageData.map(d => d.value))
                            const minValue = Math.min(...mortgageData.map(d => d.value))
                            const range = maxValue - minValue || 1

                            return (
                              <svg viewBox="0 0 400 100" className="w-full h-full">
                                {/* Grid lines */}
                                <line x1="0" y1="0" x2="400" y2="0" stroke="#475569" strokeWidth="0.5" />
                                <line x1="0" y1="50" x2="400" y2="50" stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
                                <line x1="0" y1="100" x2="400" y2="100" stroke="#475569" strokeWidth="0.5" />

                                {/* Line chart */}
                                <polyline
                                  points={mortgageData.map((point, index) => {
                                    const x = (index / (mortgageData.length - 1)) * 380 + 10
                                    const y = 90 - ((point.value - minValue) / range) * 80
                                    return `${x},${y}`
                                  }).join(' ')}
                                  fill="none"
                                  stroke="#22d3ee"
                                  strokeWidth="2"
                                />

                                {/* Data points */}
                                {mortgageData.map((point, index) => {
                                  const x = (index / (mortgageData.length - 1)) * 380 + 10
                                  const y = 90 - ((point.value - minValue) / range) * 80
                                  const showLabel = index % 4 === 0 || index === mortgageData.length - 1
                                  return (
                                    <g key={index}>
                                      <circle cx={x} cy={y} r="3" fill="#22d3ee" />
                                      {showLabel && (
                                        <text x={x} y="105" textAnchor="middle" fill="#94a3b8" fontSize="10">
                                          {point.date}
                                        </text>
                                      )}
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

          {/* Active Listing Count Section */}
          {!isLoading && !error && latestActiveListings !== null && (
            <div className="mt-2.5">
              <div className="flex flex-col items-center space-y-4">
                <div className={`w-full max-w-md rounded-lg ${viewMode === 'mini' ? 'py-1 px-2' : 'py-2.5 px-4'} border-2 bg-black border-green-400`}>
                    <div className={viewMode === 'mini' ? 'mb-1' : 'mb-2'}>
                      <div className={viewMode === 'mini' ? 'flex items-center justify-between mb-1' : 'flex items-center justify-between mb-2'}>
                        <p className={`font-semibold ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`} style={{ color: 'rgb(0, 197, 255)' }}>Active Listing Count:</p>
                        <div className="flex items-end gap-2">
                          <p className="font-semibold text-slate-400 mb-1" style={{ fontSize: '0.5em' }}>(Monthly)</p>
                          <p className={`font-bold text-white ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}>{(latestActiveListings / 1000).toFixed(2)}M</p>
                          {previousActiveListings !== null && latestActiveListings !== null && (
                            <>
                              {latestActiveListings > previousActiveListings && (
                                <i className={`fas fa-arrow-trend-up text-red-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                              {latestActiveListings < previousActiveListings && (
                                <i className={`fas fa-arrow-trend-down text-green-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                              {latestActiveListings === previousActiveListings && (
                                <i className={`fas fa-arrow-right text-cyan-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {viewMode !== 'mini' && (
                        <p className="text-xs text-slate-500">
                          Source: <a href="https://fred.stlouisfed.org/series/ACTLISCOUUS/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Federal Reserve Economic Data (FRED)</a>
                        </p>
                      )}
                    </div>

                    {/* Active Listings Chart */}
                    {viewMode !== 'mini' && activeListingsData.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400 font-semibold">5-Year Trend</span>
                          <button
                            onClick={() => setIsActiveListingsChartExpanded(!isActiveListingsChartExpanded)}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            aria-label={isActiveListingsChartExpanded ? "Collapse chart" : "Expand chart"}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {isActiveListingsChartExpanded ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          </button>
                        </div>
                        {isActiveListingsChartExpanded && (
                          <div className="relative h-32">
                            {(() => {
                              const maxValue = Math.max(...activeListingsData.map(d => d.value))
                              const minValue = Math.min(...activeListingsData.map(d => d.value))
                              const range = maxValue - minValue || 1

                              return (
                                <svg viewBox="0 0 400 100" className="w-full h-full">
                                  {/* Grid lines */}
                                  <line x1="0" y1="0" x2="400" y2="0" stroke="#475569" strokeWidth="0.5" />
                                  <line x1="0" y1="50" x2="400" y2="50" stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
                                  <line x1="0" y1="100" x2="400" y2="100" stroke="#475569" strokeWidth="0.5" />

                                  {/* Line chart */}
                                  <polyline
                                    points={activeListingsData.map((point, index) => {
                                      const x = (index / (activeListingsData.length - 1)) * 380 + 10
                                      const y = 90 - ((point.value - minValue) / range) * 80
                                      return `${x},${y}`
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#22d3ee"
                                    strokeWidth="2"
                                  />

                                  {/* Data points */}
                                  {activeListingsData.map((point, index) => {
                                    const x = (index / (activeListingsData.length - 1)) * 380 + 10
                                    const y = 90 - ((point.value - minValue) / range) * 80
                                    const showLabel = index % 10 === 0 || index === activeListingsData.length - 1
                                    return (
                                      <g key={index}>
                                        <circle cx={x} cy={y} r="3" fill="#22d3ee" />
                                        {showLabel && (
                                          <text x={x} y="105" textAnchor="middle" fill="#94a3b8" fontSize="10">
                                            {point.date}
                                          </text>
                                        )}
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

          {/* Average Sales Price of Houses Section */}
          {!isLoading && !error && latestHousePrice !== null && (
            <div className="mt-2.5">
              <div className="flex flex-col items-center space-y-4">
                <div className={`w-full max-w-md rounded-lg ${viewMode === 'mini' ? 'py-1 px-2' : 'py-2.5 px-4'} border-2 bg-black border-green-400`}>
                    <div className={viewMode === 'mini' ? 'mb-1' : 'mb-2'}>
                      <div className={viewMode === 'mini' ? 'flex items-center justify-between mb-1' : 'flex items-center justify-between mb-2'}>
                        <p className={`font-semibold ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`} style={{ color: 'rgb(0, 197, 255)' }}>Average Price of Houses:</p>
                        <div className="flex items-end gap-2">
                          <p className="font-semibold text-slate-400 mb-1" style={{ fontSize: '0.5em' }}>(Quarterly)</p>
                          <p className={`font-bold text-white ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}>${latestHousePrice.toLocaleString()}</p>
                          {previousHousePrice !== null && latestHousePrice !== null && (
                            <>
                              {latestHousePrice > previousHousePrice && (
                                <i className={`fas fa-arrow-trend-up text-green-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                              {latestHousePrice < previousHousePrice && (
                                <i className={`fas fa-arrow-trend-down text-red-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                              {latestHousePrice === previousHousePrice && (
                                <i className={`fas fa-arrow-right text-cyan-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {viewMode !== 'mini' && (
                        <p className="text-xs text-slate-500">
                          Source: <a href="https://fred.stlouisfed.org/series/ASPUS/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Federal Reserve Economic Data (FRED)</a>
                        </p>
                      )}
                    </div>

                    {/* House Price Chart */}
                    {viewMode !== 'mini' && housePriceData.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400 font-semibold">10-Year Trend</span>
                          <button
                            onClick={() => setIsHousePriceChartExpanded(!isHousePriceChartExpanded)}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            aria-label={isHousePriceChartExpanded ? "Collapse chart" : "Expand chart"}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {isHousePriceChartExpanded ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          </button>
                        </div>
                        {isHousePriceChartExpanded && (
                          <div className="relative h-32">
                            {(() => {
                              const maxValue = Math.max(...housePriceData.map(d => d.value))
                              const minValue = Math.min(...housePriceData.map(d => d.value))
                              const range = maxValue - minValue || 1

                              return (
                                <svg viewBox="0 0 400 100" className="w-full h-full">
                                  {/* Grid lines */}
                                  <line x1="0" y1="0" x2="400" y2="0" stroke="#475569" strokeWidth="0.5" />
                                  <line x1="0" y1="50" x2="400" y2="50" stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
                                  <line x1="0" y1="100" x2="400" y2="100" stroke="#475569" strokeWidth="0.5" />

                                  {/* Line chart */}
                                  <polyline
                                    points={housePriceData.map((point, index) => {
                                      const x = (index / (housePriceData.length - 1)) * 380 + 10
                                      const y = 90 - ((point.value - minValue) / range) * 80
                                      return `${x},${y}`
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#22d3ee"
                                    strokeWidth="2"
                                  />

                                  {/* Data points */}
                                  {housePriceData.map((point, index) => {
                                    const x = (index / (housePriceData.length - 1)) * 380 + 10
                                    const y = 90 - ((point.value - minValue) / range) * 80
                                    const showLabel = index % 6 === 0 || index === housePriceData.length - 1
                                    return (
                                      <g key={index}>
                                        <circle cx={x} cy={y} r="3" fill="#22d3ee" />
                                        {showLabel && (
                                          <text x={x} y="105" textAnchor="middle" fill="#94a3b8" fontSize="10">
                                            {point.date}
                                          </text>
                                        )}
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

          {/* Consumer Sentiment Section */}
          {!isLoading && !error && latestConsumerSentiment !== null && (
            <div className="mt-2.5">
              <div className="flex flex-col items-center space-y-4">
                <div className={`w-full max-w-md rounded-lg ${viewMode === 'mini' ? 'py-1 px-2' : 'py-2.5 px-4'} border-2 bg-black border-green-400`}>
                    <div className={viewMode === 'mini' ? 'mb-1' : 'mb-2'}>
                      <div className={viewMode === 'mini' ? 'flex items-center justify-between mb-1' : 'flex items-center justify-between mb-2'}>
                        <p className={`font-semibold ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`} style={{ color: 'rgb(0, 197, 255)' }}>Consumer Sentiment:</p>
                        <div className="flex items-end gap-2">
                          <p className="font-semibold text-slate-400 mb-1" style={{ fontSize: '0.5em' }}>(Monthly)</p>
                          <p className={`font-bold text-white ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}>{latestConsumerSentiment.toFixed(1)}</p>
                          {previousConsumerSentiment !== null && latestConsumerSentiment !== null && (
                            <>
                              {latestConsumerSentiment > previousConsumerSentiment && (
                                <i className={`fas fa-arrow-trend-up text-green-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                              {latestConsumerSentiment < previousConsumerSentiment && (
                                <i className={`fas fa-arrow-trend-down text-red-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                              {latestConsumerSentiment === previousConsumerSentiment && (
                                <i className={`fas fa-arrow-right text-cyan-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {viewMode !== 'mini' && (
                        <p className="text-xs text-slate-500">
                          Source: <a href="https://fred.stlouisfed.org/series/UMCSENT/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Federal Reserve Economic Data (FRED)</a>
                        </p>
                      )}
                    </div>

                    {/* Consumer Sentiment Chart */}
                    {viewMode !== 'mini' && consumerSentimentData.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400 font-semibold">5-Year Trend</span>
                          <button
                            onClick={() => setIsConsumerSentimentChartExpanded(!isConsumerSentimentChartExpanded)}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            aria-label={isConsumerSentimentChartExpanded ? "Collapse chart" : "Expand chart"}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {isConsumerSentimentChartExpanded ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          </button>
                        </div>
                        {isConsumerSentimentChartExpanded && (
                          <div className="relative h-32">
                            {(() => {
                              const maxValue = Math.max(...consumerSentimentData.map(d => d.value))
                              const minValue = Math.min(...consumerSentimentData.map(d => d.value))
                              const range = maxValue - minValue || 1

                              return (
                                <svg viewBox="0 0 400 100" className="w-full h-full">
                                  {/* Grid lines */}
                                  <line x1="0" y1="0" x2="400" y2="0" stroke="#475569" strokeWidth="0.5" />
                                  <line x1="0" y1="50" x2="400" y2="50" stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
                                  <line x1="0" y1="100" x2="400" y2="100" stroke="#475569" strokeWidth="0.5" />

                                  {/* Line chart */}
                                  <polyline
                                    points={consumerSentimentData.map((point, index) => {
                                      const x = (index / (consumerSentimentData.length - 1)) * 380 + 10
                                      const y = 90 - ((point.value - minValue) / range) * 80
                                      return `${x},${y}`
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#22d3ee"
                                    strokeWidth="2"
                                  />

                                  {/* Data points */}
                                  {consumerSentimentData.map((point, index) => {
                                    const x = (index / (consumerSentimentData.length - 1)) * 380 + 10
                                    const y = 90 - ((point.value - minValue) / range) * 80
                                    const showLabel = index % 10 === 0 || index === consumerSentimentData.length - 1
                                    return (
                                      <g key={index}>
                                        <circle cx={x} cy={y} r="3" fill="#22d3ee" />
                                        {showLabel && (
                                          <text x={x} y="105" textAnchor="middle" fill="#94a3b8" fontSize="10">
                                            {point.date}
                                          </text>
                                        )}
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

          {/* Inflation Section */}
          {!isLoading && !error && latestInflation !== null && (
            <div className="mt-2.5">
              <div className="flex flex-col items-center space-y-4">
                <div className={`w-full max-w-md rounded-lg ${viewMode === 'mini' ? 'py-1 px-2' : 'py-2.5 px-4'} border-2 bg-black border-green-400`}>
                    <div className={viewMode === 'mini' ? 'mb-1' : 'mb-2'}>
                      <div className={viewMode === 'mini' ? 'flex items-center justify-between mb-1' : 'flex items-center justify-between mb-2'}>
                        <p className={`font-semibold ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`} style={{ color: 'rgb(0, 197, 255)' }}>Inflation Rate:</p>
                        <div className="flex items-end gap-2">
                          <p className="font-semibold text-slate-400 mb-1" style={{ fontSize: '0.5em' }}>(Annual)</p>
                          <p className={`font-bold text-white ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}>{latestInflation.toFixed(2)}%</p>
                          {previousInflation !== null && latestInflation !== null && (
                            <>
                              {latestInflation > previousInflation && (
                                <i className={`fas fa-arrow-trend-up text-red-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                              {latestInflation < previousInflation && (
                                <i className={`fas fa-arrow-trend-down text-green-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                              {latestInflation === previousInflation && (
                                <i className={`fas fa-arrow-right text-cyan-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {viewMode !== 'mini' && (
                        <p className="text-xs text-slate-500">
                          Source: <a href="https://fred.stlouisfed.org/series/FPCPITOTLZGUSA/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Federal Reserve Economic Data (FRED)</a>
                        </p>
                      )}
                    </div>

                    {/* Inflation Chart */}
                    {viewMode !== 'mini' && inflationData.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400 font-semibold">30-Year Trend</span>
                          <button
                            onClick={() => setIsInflationChartExpanded(!isInflationChartExpanded)}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            aria-label={isInflationChartExpanded ? "Collapse chart" : "Expand chart"}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {isInflationChartExpanded ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          </button>
                        </div>
                        {isInflationChartExpanded && (
                          <div className="relative h-32">
                            {(() => {
                              const maxValue = Math.max(...inflationData.map(d => d.value))
                              const minValue = Math.min(...inflationData.map(d => d.value))
                              const range = maxValue - minValue || 1

                              return (
                                <svg viewBox="0 0 400 100" className="w-full h-full">
                                  {/* Grid lines */}
                                  <line x1="0" y1="0" x2="400" y2="0" stroke="#475569" strokeWidth="0.5" />
                                  <line x1="0" y1="50" x2="400" y2="50" stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
                                  <line x1="0" y1="100" x2="400" y2="100" stroke="#475569" strokeWidth="0.5" />

                                  {/* Line chart */}
                                  <polyline
                                    points={inflationData.map((point, index) => {
                                      const x = (index / (inflationData.length - 1)) * 380 + 10
                                      const y = 90 - ((point.value - minValue) / range) * 80
                                      return `${x},${y}`
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#22d3ee"
                                    strokeWidth="2"
                                  />

                                  {/* Data points */}
                                  {inflationData.map((point, index) => {
                                    const x = (index / (inflationData.length - 1)) * 380 + 10
                                    const y = 90 - ((point.value - minValue) / range) * 80
                                    const showLabel = index % 5 === 0 || index === inflationData.length - 1
                                    return (
                                      <g key={index}>
                                        <circle cx={x} cy={y} r="3" fill="#22d3ee" />
                                        {showLabel && (
                                          <text x={x} y="105" textAnchor="middle" fill="#94a3b8" fontSize="10">
                                            {point.date}
                                          </text>
                                        )}
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

          {/* Job Openings Section */}
          {!isLoading && !error && latestJobOpenings !== null && (
            <div className="mt-2.5">
              <div className="flex flex-col items-center space-y-4">
                <div className={`w-full max-w-md rounded-lg ${viewMode === 'mini' ? 'py-1 px-2' : 'py-2.5 px-4'} border-2 bg-black border-green-400`}>
                    <div className={viewMode === 'mini' ? 'mb-1' : 'mb-2'}>
                      <div className={viewMode === 'mini' ? 'flex items-center justify-between mb-1' : 'flex items-center justify-between mb-2'}>
                        <p className={`font-semibold ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`} style={{ color: 'rgb(0, 197, 255)' }}>Job Openings:</p>
                        <div className="flex items-end gap-2">
                          <p className="font-semibold text-slate-400 mb-1" style={{ fontSize: '0.5em' }}>(Monthly)</p>
                          <p className={`font-bold text-white ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}>{(latestJobOpenings / 1000).toFixed(2)}M</p>
                          {previousJobOpenings !== null && latestJobOpenings !== null && (
                            <>
                              {latestJobOpenings > previousJobOpenings && (
                                <i className={`fas fa-arrow-trend-up text-green-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                              {latestJobOpenings < previousJobOpenings && (
                                <i className={`fas fa-arrow-trend-down text-red-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                              {latestJobOpenings === previousJobOpenings && (
                                <i className={`fas fa-arrow-right text-cyan-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {viewMode !== 'mini' && (
                        <p className="text-xs text-slate-500">
                          Source: <a href="https://fred.stlouisfed.org/series/JTSJOL/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Federal Reserve Economic Data (FRED)</a>
                        </p>
                      )}
                    </div>

                    {/* Job Openings Chart */}
                    {viewMode !== 'mini' && jobOpeningsData.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400 font-semibold">5-Year Trend</span>
                          <button
                            onClick={() => setIsJobOpeningsChartExpanded(!isJobOpeningsChartExpanded)}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            aria-label={isJobOpeningsChartExpanded ? "Collapse chart" : "Expand chart"}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {isJobOpeningsChartExpanded ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          </button>
                        </div>
                        {isJobOpeningsChartExpanded && (
                          <div className="relative h-32">
                            {(() => {
                              const maxValue = Math.max(...jobOpeningsData.map(d => d.value))
                              const minValue = Math.min(...jobOpeningsData.map(d => d.value))
                              const range = maxValue - minValue || 1

                              return (
                                <svg viewBox="0 0 400 100" className="w-full h-full">
                                  {/* Grid lines */}
                                  <line x1="0" y1="0" x2="400" y2="0" stroke="#475569" strokeWidth="0.5" />
                                  <line x1="0" y1="50" x2="400" y2="50" stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
                                  <line x1="0" y1="100" x2="400" y2="100" stroke="#475569" strokeWidth="0.5" />

                                  {/* Line chart */}
                                  <polyline
                                    points={jobOpeningsData.map((point, index) => {
                                      const x = (index / (jobOpeningsData.length - 1)) * 380 + 10
                                      const y = 90 - ((point.value - minValue) / range) * 80
                                      return `${x},${y}`
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#22d3ee"
                                    strokeWidth="2"
                                  />

                                  {/* Data points */}
                                  {jobOpeningsData.map((point, index) => {
                                    const x = (index / (jobOpeningsData.length - 1)) * 380 + 10
                                    const y = 90 - ((point.value - minValue) / range) * 80
                                    const showLabel = index % 10 === 0 || index === jobOpeningsData.length - 1
                                    return (
                                      <g key={index}>
                                        <circle cx={x} cy={y} r="3" fill="#22d3ee" />
                                        {showLabel && (
                                          <text x={x} y="105" textAnchor="middle" fill="#94a3b8" fontSize="10">
                                            {point.date}
                                          </text>
                                        )}
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

          {/* M2 Money Stock Section */}
          {!isLoading && !error && latestM2 !== null && (
            <div className="mt-2.5">
              <div className="flex flex-col items-center space-y-4">
                <div className={`w-full max-w-md rounded-lg ${viewMode === 'mini' ? 'py-1 px-2' : 'py-2.5 px-4'} border-2 bg-black border-green-400`}>
                    <div className={viewMode === 'mini' ? 'mb-1' : 'mb-2'}>
                      <div className={viewMode === 'mini' ? 'flex items-center justify-between mb-1' : 'flex items-center justify-between mb-2'}>
                        <div className="flex items-baseline gap-2">
                          <p className={`font-semibold ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`} style={{ color: 'rgb(0, 197, 255)' }}>M2 Money Stock:</p>
                          {m2Data.length >= 13 && (
                            <p className="text-xs text-slate-400">
                              Growth = {(() => {
                                const latest = m2Data[m2Data.length - 1].value
                                const yearAgo = m2Data[m2Data.length - 13].value
                                const growth = ((latest - yearAgo) / yearAgo * 100).toFixed(2)
                                return `${growth}%`
                              })()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-end gap-2">
                          <p className="font-semibold text-slate-400 mb-1" style={{ fontSize: '0.5em' }}>(Monthly)</p>
                          <p className={`font-bold text-white ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}>${(latestM2 / 1000).toFixed(2)}T</p>
                          {previousM2 !== null && latestM2 !== null && (
                            <>
                              {latestM2 > previousM2 && (
                                <i className={`fas fa-arrow-trend-up text-red-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                              {latestM2 < previousM2 && (
                                <i className={`fas fa-arrow-trend-down text-green-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                              {latestM2 === previousM2 && (
                                <i className={`fas fa-arrow-right text-cyan-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {viewMode !== 'mini' && (
                        <p className="text-xs text-slate-500">
                          Source: <a href="https://fred.stlouisfed.org/series/M2SL/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Federal Reserve Economic Data (FRED)</a>
                        </p>
                      )}
                    </div>

                    {/* M2 Money Stock Chart */}
                    {viewMode !== 'mini' && m2Data.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400 font-semibold">5-Year Trend</span>
                          <button
                            onClick={() => setIsM2ChartExpanded(!isM2ChartExpanded)}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            aria-label={isM2ChartExpanded ? "Collapse chart" : "Expand chart"}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {isM2ChartExpanded ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          </button>
                        </div>
                        {isM2ChartExpanded && (
                          <div className="relative h-32">
                            {(() => {
                              const maxValue = Math.max(...m2Data.map(d => d.value))
                              const minValue = Math.min(...m2Data.map(d => d.value))
                              const range = maxValue - minValue || 1

                              return (
                                <svg viewBox="0 0 400 100" className="w-full h-full">
                                  {/* Grid lines */}
                                  <line x1="0" y1="0" x2="400" y2="0" stroke="#475569" strokeWidth="0.5" />
                                  <line x1="0" y1="50" x2="400" y2="50" stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
                                  <line x1="0" y1="100" x2="400" y2="100" stroke="#475569" strokeWidth="0.5" />

                                  {/* Line chart */}
                                  <polyline
                                    points={m2Data.map((point, index) => {
                                      const x = (index / (m2Data.length - 1)) * 380 + 10
                                      const y = 90 - ((point.value - minValue) / range) * 80
                                      return `${x},${y}`
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#22d3ee"
                                    strokeWidth="2"
                                  />

                                  {/* Data points */}
                                  {m2Data.map((point, index) => {
                                    const x = (index / (m2Data.length - 1)) * 380 + 10
                                    const y = 90 - ((point.value - minValue) / range) * 80
                                    const showLabel = index % 10 === 0 || index === m2Data.length - 1
                                    return (
                                      <g key={index}>
                                        <circle cx={x} cy={y} r="3" fill="#22d3ee" />
                                        {showLabel && (
                                          <text x={x} y="105" textAnchor="middle" fill="#94a3b8" fontSize="10">
                                            {point.date}
                                          </text>
                                        )}
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

          {!isLoading && !error && productsWithPrices.length > 0 && (
            <div className="mt-2.5">
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

                <div className={`w-full max-w-md rounded-lg ${viewMode === 'mini' ? 'py-1 px-2' : 'py-2.5 px-4'} border-2 bg-black border-green-400`}>
                  <div className={viewMode === 'mini' ? 'mb-1' : 'mb-3'}>
                    <div className="flex items-center justify-between">
                      <p className={`font-semibold ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`} style={{ color: 'rgb(0, 197, 255)' }}>Staple Food Prices at Walmart:</p>
                      {(() => {
                        const currentTotal = productsWithPrices.reduce((sum, product) => sum + (product.price || 0), 0)
                        const previousTotal = productsWithPrices.reduce((sum, product) => sum + (product.previous_price || 0), 0)
                        const dailyChange = currentTotal - previousTotal
                        const dailyPercentage = previousTotal > 0 ? ((dailyChange / previousTotal) * 100).toFixed(2) : '0.00'

                        return (
                          <div className="flex items-end gap-2">
                            <p className="font-semibold text-slate-400 mb-1" style={{ fontSize: '0.5em' }}>(Daily)</p>
                            <p className={`font-bold text-white ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}>{dailyChange > 0 ? '+' : ''}{dailyPercentage}%</p>
                            {dailyChange < 0 && (
                              <i className={`fas fa-arrow-trend-down text-green-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                            )}
                            {dailyChange > 0 && (
                              <i className={`fas fa-arrow-trend-up text-red-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                            )}
                            {dailyChange === 0 && (
                              <i className={`fas fa-arrow-right text-cyan-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                  {viewMode !== 'mini' && (
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
                  )}
                  {viewMode !== 'mini' && (
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
                  )}

                  {/* 30-Day Chart */}
                  {viewMode !== 'mini' && monthChartData.length > 0 && (
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
                                  const showLabel = index % 3 === 0 || index === monthChartData.length - 1
                                  return (
                                    <g key={index}>
                                      <circle cx={x} cy={y} r="3" fill="#22d3ee" />
                                      {showLabel && (
                                        <text x={x} y="105" textAnchor="middle" fill="#94a3b8" fontSize="10">
                                          {point.date}
                                        </text>
                                      )}
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

            {/* Sticky Core CPI Section */}
            {!isLoading && !error && latestStickyCore !== null && (
              <div className="mt-2.5">
                <div className="flex flex-col items-center space-y-4">
                  <div className={`w-full max-w-md rounded-lg ${viewMode === 'mini' ? 'py-1 px-2' : 'py-2.5 px-4'} border-2 bg-black border-green-400`}>
                      <div className={viewMode === 'mini' ? 'mb-1' : 'mb-2'}>
                        <div className={viewMode === 'mini' ? 'flex items-center justify-between mb-1' : 'flex items-center justify-between mb-2'}>
                          <p className={`font-semibold ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`} style={{ color: 'rgb(0, 197, 255)' }}>Sticky Core CPI:</p>
                          <div className="flex items-end gap-2">
                            <p className="font-semibold text-slate-400 mb-1" style={{ fontSize: '0.5em' }}>(Monthly)</p>
                            <p className={`font-bold text-white ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}>{latestStickyCore.toFixed(2)}%</p>
                            {previousStickyCore !== null && latestStickyCore !== null && (
                              <>
                                {latestStickyCore > previousStickyCore && (
                                  <i className={`fas fa-arrow-trend-up text-red-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                                )}
                                {latestStickyCore < previousStickyCore && (
                                  <i className={`fas fa-arrow-trend-down text-green-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                                )}
                                {latestStickyCore === previousStickyCore && (
                                  <i className={`fas fa-arrow-right text-cyan-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        {viewMode !== 'mini' && (
                          <p className="text-xs text-slate-500">
                            Source: <a href="https://fred.stlouisfed.org/series/CORESTICKM159SFRBATL/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Federal Reserve Economic Data (FRED)</a>
                          </p>
                        )}
                      </div>

                      {/* Sticky Core CPI Chart */}
                      {viewMode !== 'mini' && stickyCoreData.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-600">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-400 font-semibold">12-Month Trend</span>
                            <button
                              onClick={() => setIsStickyCoreChartExpanded(!isStickyCoreChartExpanded)}
                              className="text-cyan-400 hover:text-cyan-300 transition-colors"
                              aria-label={isStickyCoreChartExpanded ? "Collapse chart" : "Expand chart"}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                {isStickyCoreChartExpanded ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                )}
                              </svg>
                            </button>
                          </div>
                          {isStickyCoreChartExpanded && (
                            <div className="relative h-32">
                              {(() => {
                                const maxValue = Math.max(...stickyCoreData.map(d => d.value))
                                const minValue = Math.min(...stickyCoreData.map(d => d.value))
                                const range = maxValue - minValue || 1

                                return (
                                  <svg viewBox="0 0 400 100" className="w-full h-full">
                                    {/* Grid lines */}
                                    <line x1="0" y1="0" x2="400" y2="0" stroke="#475569" strokeWidth="0.5" />
                                    <line x1="0" y1="50" x2="400" y2="50" stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
                                    <line x1="0" y1="100" x2="400" y2="100" stroke="#475569" strokeWidth="0.5" />

                                    {/* Line chart */}
                                    <polyline
                                      points={stickyCoreData.map((point, index) => {
                                        const x = (index / (stickyCoreData.length - 1)) * 380 + 10
                                        const y = 90 - ((point.value - minValue) / range) * 80
                                        return `${x},${y}`
                                      }).join(' ')}
                                      fill="none"
                                      stroke="#22d3ee"
                                      strokeWidth="2"
                                    />

                                    {/* Data points */}
                                    {stickyCoreData.map((point, index) => {
                                      const x = (index / (stickyCoreData.length - 1)) * 380 + 10
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

            {/* U.S. Unemployment Claims Section */}
            {!isLoading && !error && latestClaims !== null && (
              <div className="mt-2.5">
                <div className="flex flex-col items-center space-y-4">
                  <div className={`w-full max-w-md rounded-lg ${viewMode === 'mini' ? 'py-1 px-2' : 'py-2.5 px-4'} border-2 bg-black border-green-400`}>
                      <div className={viewMode === 'mini' ? 'mb-1' : 'mb-2'}>
                        <div className={viewMode === 'mini' ? 'flex items-center justify-between mb-1' : 'flex items-center justify-between mb-2'}>
                          <p className={`font-semibold ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`} style={{ color: 'rgb(0, 197, 255)' }}>U.S. Unemployment Claims:</p>
                          <div className="flex items-end gap-2">
                            <p className="font-semibold text-slate-400 mb-1" style={{ fontSize: '0.5em' }}>(Weekly)</p>
                            <p className={`font-bold text-white ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}>{latestClaims.toLocaleString()}</p>
                            {previousClaims !== null && latestClaims !== null && (
                              <>
                                {latestClaims > previousClaims && (
                                  <i className={`fas fa-arrow-trend-up text-red-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                                )}
                                {latestClaims < previousClaims && (
                                  <i className={`fas fa-arrow-trend-down text-green-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                                )}
                                {latestClaims === previousClaims && (
                                  <i className={`fas fa-arrow-right text-cyan-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        {viewMode !== 'mini' && (
                          <p className="text-xs text-slate-500">
                            Source: <a href="https://fred.stlouisfed.org/series/ICSA/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Federal Reserve Economic Data (FRED)</a>
                          </p>
                        )}
                      </div>

                      {/* Claims Chart */}
                      {viewMode !== 'mini' && claimsData.length > 0 && (
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
                                      const showLabel = index % 4 === 0 || index === claimsData.length - 1
                                      return (
                                        <g key={index}>
                                          <circle cx={x} cy={y} r="3" fill="#22d3ee" />
                                          {showLabel && (
                                            <text x={x} y="105" textAnchor="middle" fill="#94a3b8" fontSize="10">
                                              {point.date}
                                            </text>
                                          )}
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

            {/* U.S. Unemployment Rate Section */}
            {!isLoading && !error && latestUnemployment !== null && (
              <div className="mt-2.5">
                <div className="flex flex-col items-center space-y-4">
                  <div className={`w-full max-w-md rounded-lg ${viewMode === 'mini' ? 'py-1 px-2' : 'py-2.5 px-4'} border-2 bg-black border-green-400`}>
                      <div className={viewMode === 'mini' ? 'mb-1' : 'mb-2'}>
                        <div className={viewMode === 'mini' ? 'flex items-center justify-between mb-1' : 'flex items-center justify-between mb-2'}>
                          <p className={`font-semibold ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`} style={{ color: 'rgb(0, 197, 255)' }}>U.S. Unemployment Rate:</p>
                          <div className="flex items-end gap-2">
                            <p className="font-semibold text-slate-400 mb-1" style={{ fontSize: '0.5em' }}>(Monthly)</p>
                            <p className={`font-bold text-white ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}>{latestUnemployment.toFixed(1)}%</p>
                            {previousUnemployment !== null && latestUnemployment !== null && (
                              <>
                                {latestUnemployment > previousUnemployment && (
                                  <i className={`fas fa-arrow-trend-up text-red-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                                )}
                                {latestUnemployment < previousUnemployment && (
                                  <i className={`fas fa-arrow-trend-down text-green-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        {viewMode !== 'mini' && (
                          <p className="text-xs text-slate-500">
                            Source: <a href="https://fred.stlouisfed.org/series/UNRATE/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Federal Reserve Economic Data (FRED)</a>
                          </p>
                        )}
                      </div>

                      {/* Unemployment Rate Chart */}
                      {viewMode !== 'mini' && unemploymentData.length > 0 && (
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

            {/* VIX Section */}
            {!isLoading && !error && latestVix !== null && (
              <div className="mt-2.5">
                <div className="flex flex-col items-center space-y-4">
                  <div className={`w-full max-w-md rounded-lg ${viewMode === 'mini' ? 'py-1 px-2' : 'py-2.5 px-4'} border-2 bg-black border-green-400`}>
                      <div className={viewMode === 'mini' ? 'mb-1' : 'mb-2'}>
                        <div className={viewMode === 'mini' ? 'flex items-center justify-between mb-1' : 'flex items-center justify-between mb-2'}>
                          <p className={`font-semibold ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`} style={{ color: 'rgb(0, 197, 255)' }}>VIX:</p>
                          <div className="flex items-end gap-2">
                            <p className="font-semibold text-slate-400 mb-1" style={{ fontSize: '0.5em' }}>(Daily)</p>
                            <p className={`font-bold text-white ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}>{latestVix.toFixed(2)}</p>
                            {previousVix !== null && latestVix !== null && (
                              <>
                                {latestVix > previousVix && (
                                  <i className={`fas fa-arrow-trend-up text-red-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                                )}
                                {latestVix < previousVix && (
                                  <i className={`fas fa-arrow-trend-down text-green-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                                )}
                                {latestVix === previousVix && (
                                  <i className={`fas fa-arrow-right text-cyan-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        {viewMode !== 'mini' && (
                          <p className="text-xs text-slate-500">
                            Source: <a href="https://fred.stlouisfed.org/series/VIXCLS/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Federal Reserve Economic Data (FRED)</a>
                          </p>
                        )}
                      </div>

                      {/* VIX Chart */}
                      {viewMode !== 'mini' && vixData.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-600">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-400 font-semibold">1-Year Trend</span>
                            <button
                              onClick={() => setIsVixChartExpanded(!isVixChartExpanded)}
                              className="text-cyan-400 hover:text-cyan-300 transition-colors"
                              aria-label={isVixChartExpanded ? "Collapse chart" : "Expand chart"}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                {isVixChartExpanded ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                )}
                              </svg>
                            </button>
                          </div>
                          {isVixChartExpanded && (
                            <div className="relative h-32">
                              {(() => {
                                const maxValue = Math.max(...vixData.map(d => d.value))
                                const minValue = Math.min(...vixData.map(d => d.value))
                                const range = maxValue - minValue || 1

                                return (
                                  <svg viewBox="0 0 400 100" className="w-full h-full">
                                    {/* Grid lines */}
                                    <line x1="0" y1="0" x2="400" y2="0" stroke="#475569" strokeWidth="0.5" />
                                    <line x1="0" y1="50" x2="400" y2="50" stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
                                    <line x1="0" y1="100" x2="400" y2="100" stroke="#475569" strokeWidth="0.5" />

                                    {/* Line chart */}
                                    <polyline
                                      points={vixData.map((point, index) => {
                                        const x = (index / (vixData.length - 1)) * 380 + 10
                                        const y = 90 - ((point.value - minValue) / range) * 80
                                        return `${x},${y}`
                                      }).join(' ')}
                                      fill="none"
                                      stroke="#22d3ee"
                                      strokeWidth="2"
                                    />

                                    {/* Data points */}
                                    {vixData.map((point, index) => {
                                      const x = (index / (vixData.length - 1)) * 380 + 10
                                      const y = 90 - ((point.value - minValue) / range) * 80
                                      const showLabel = index % 60 === 0 || index === vixData.length - 1
                                      return (
                                        <g key={index}>
                                          <circle cx={x} cy={y} r="3" fill="#22d3ee" />
                                          {showLabel && (
                                            <text x={x} y="105" textAnchor="middle" fill="#94a3b8" fontSize="10">
                                              {point.date}
                                            </text>
                                          )}
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

            {/* WTI Crude Oil Section */}
            {!isLoading && !error && latestWti !== null && (
              <div className="mt-2.5">
                <div className="flex flex-col items-center space-y-4">
                  <div className={`w-full max-w-md rounded-lg ${viewMode === 'mini' ? 'py-1 px-2' : 'py-2.5 px-4'} border-2 bg-black border-green-400`}>
                      <div className={viewMode === 'mini' ? 'mb-1' : 'mb-2'}>
                        <div className={viewMode === 'mini' ? 'flex items-center justify-between mb-1' : 'flex items-center justify-between mb-2'}>
                          <p className={`font-semibold ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`} style={{ color: 'rgb(0, 197, 255)' }}>WTI Crude Oil:</p>
                          <div className="flex items-end gap-2">
                            <p className="font-semibold text-slate-400 mb-1" style={{ fontSize: '0.5em' }}>(Daily)</p>
                            <p className={`font-bold text-white ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}>${latestWti.toFixed(2)}</p>
                            {previousWti !== null && latestWti !== null && (
                              <>
                                {latestWti > previousWti && (
                                  <i className={`fas fa-arrow-trend-up text-red-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                                )}
                                {latestWti < previousWti && (
                                  <i className={`fas fa-arrow-trend-down text-green-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                                )}
                                {latestWti === previousWti && (
                                  <i className={`fas fa-arrow-right text-cyan-400 ${viewMode === 'mini' ? 'text-sm' : 'text-lg'}`}></i>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        {viewMode !== 'mini' && (
                          <p className="text-xs text-slate-500">
                            Source: <a href="https://fred.stlouisfed.org/series/DCOILWTICO/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Federal Reserve Economic Data (FRED)</a>
                          </p>
                        )}
                      </div>

                      {/* WTI Chart */}
                      {viewMode !== 'mini' && wtiData.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-600">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-400 font-semibold">60-Day Trend</span>
                            <button
                              onClick={() => setIsWtiChartExpanded(!isWtiChartExpanded)}
                              className="text-cyan-400 hover:text-cyan-300 transition-colors"
                              aria-label={isWtiChartExpanded ? "Collapse chart" : "Expand chart"}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                {isWtiChartExpanded ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                )}
                              </svg>
                            </button>
                          </div>
                          {isWtiChartExpanded && (
                            <div className="relative h-32">
                              {(() => {
                                const maxValue = Math.max(...wtiData.map(d => d.value))
                                const minValue = Math.min(...wtiData.map(d => d.value))
                                const range = maxValue - minValue || 1

                                return (
                                  <svg viewBox="0 0 400 100" className="w-full h-full">
                                    {/* Grid lines */}
                                    <line x1="0" y1="0" x2="400" y2="0" stroke="#475569" strokeWidth="0.5" />
                                    <line x1="0" y1="50" x2="400" y2="50" stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
                                    <line x1="0" y1="100" x2="400" y2="100" stroke="#475569" strokeWidth="0.5" />

                                    {/* Line chart */}
                                    <polyline
                                      points={wtiData.map((point, index) => {
                                        const x = (index / (wtiData.length - 1)) * 380 + 10
                                        const y = 90 - ((point.value - minValue) / range) * 80
                                        return `${x},${y}`
                                      }).join(' ')}
                                      fill="none"
                                      stroke="#22d3ee"
                                      strokeWidth="2"
                                    />

                                    {/* Data points */}
                                    {wtiData.map((point, index) => {
                                      const x = (index / (wtiData.length - 1)) * 380 + 10
                                      const y = 90 - ((point.value - minValue) / range) * 80
                                      const showLabel = index % 10 === 0 || index === wtiData.length - 1
                                      return (
                                        <g key={index}>
                                          <circle cx={x} cy={y} r="3" fill="#22d3ee" />
                                          {showLabel && (
                                            <text x={x} y="105" textAnchor="middle" fill="#94a3b8" fontSize="10">
                                              {point.date}
                                            </text>
                                          )}
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
