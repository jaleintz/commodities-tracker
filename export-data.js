const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Read .env.local file manually
const envContent = fs.readFileSync('.env.local', 'utf8')
const envLines = envContent.split('\n')
let supabaseUrl = ''
let supabaseKey = ''

envLines.forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim()
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    supabaseKey = line.split('=')[1].trim()
  }
})

async function exportData() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Fetching data from commodities-inflation-tb...')

    const { data, error } = await supabase
      .from('commodities-inflation-tb')
      .select('product_id, price, created_at')
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    console.log(`Found ${data.length} records`)

    // Filter to keep only the most recent entry per product per day
    const filteredData = {}

    data.forEach(record => {
      const date = new Date(record.created_at)
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const key = `${record.product_id}_${dateKey}`

      // Keep the most recent entry (since data is ordered by created_at ascending, later entries will overwrite earlier ones)
      if (!filteredData[key] || new Date(record.created_at) > new Date(filteredData[key].created_at)) {
        filteredData[key] = record
      }
    })

    // Convert back to array and sort by created_at, then by product_id
    const uniqueData = Object.values(filteredData).sort((a, b) => {
      const dateCompare = new Date(a.created_at) - new Date(b.created_at)
      if (dateCompare !== 0) return dateCompare
      // If dates are the same, sort by product_id
      return a.product_id - b.product_id
    })

    // Convert UTC timestamps to Central US time
    const convertedData = uniqueData.map(record => {
      const utcDate = new Date(record.created_at)
      // Convert to Central Time (America/Chicago)
      const centralTime = utcDate.toLocaleString('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })

      return {
        ...record,
        created_at: centralTime
      }
    })

    console.log(`After removing duplicates: ${uniqueData.length} records (removed ${data.length - uniqueData.length} duplicates)`)

    // Write to JSON file
    const jsonContent = JSON.stringify(convertedData, null, 2)
    fs.writeFileSync('export_commodities_Inflation_tb.json', jsonContent, 'utf8')

    console.log('Data exported successfully to export_commodities_Inflation_tb.json (timestamps converted to Central US time)')
  } catch (error) {
    console.error('Error exporting data:', error.message)
    process.exit(1)
  }
}

exportData()
