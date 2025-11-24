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

async function importData() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Read the JSON file
    console.log('Reading export_commodities_Inflation_tb.json...')
    const jsonContent = fs.readFileSync('export_commodities_Inflation_tb.json', 'utf8')
    const importData = JSON.parse(jsonContent)

    console.log(`Found ${importData.length} records to import`)

    // Step 1: Delete all existing records
    console.log('Deleting all existing records from commodities-inflation-tb...')
    const { error: deleteError } = await supabase
      .from('commodities-inflation-tb')
      .delete()
      .neq('id', 0) // This will match all records

    if (deleteError) {
      throw new Error(`Error deleting records: ${deleteError.message}`)
    }

    console.log('All existing records deleted successfully')

    // Step 2: Convert dates to UTC format for database insertion
    console.log('Converting dates and preparing data for import...')
    const recordsToInsert = importData.map(record => {
      // Parse the date string (MM/DD/YYYY format, no time)
      const dateStr = record.created_at
      const [month, day, year] = dateStr.split('/')

      // Create a UTC date at noon to keep the date stable
      // Using UTC directly avoids timezone conversion issues
      const dateAtNoonUTC = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00.000Z`
      const utcDate = new Date(dateAtNoonUTC)

      return {
        product_id: record.product_id,
        price: record.price,
        created_at: utcDate.toISOString()
      }
    })

    // Step 3: Insert new records in batches (Supabase has a limit)
    console.log('Inserting new records...')
    const batchSize = 100
    for (let i = 0; i < recordsToInsert.length; i += batchSize) {
      const batch = recordsToInsert.slice(i, i + batchSize)
      const { error: insertError } = await supabase
        .from('commodities-inflation-tb')
        .insert(batch)

      if (insertError) {
        throw new Error(`Error inserting batch ${i / batchSize + 1}: ${insertError.message}`)
      }

      console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} records)`)
    }

    console.log(`\nSuccess! Imported ${recordsToInsert.length} records into commodities-inflation-tb`)

  } catch (error) {
    console.error('Error importing data:', error.message)
    process.exit(1)
  }
}

importData()
