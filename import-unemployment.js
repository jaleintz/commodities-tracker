const https = require('https');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://uzgnghfqkcktfjcreipr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Z25naGZxa2NrdGZqY3JlaXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTg5ODIsImV4cCI6MjA3ODQzNDk4Mn0.XsB6gyeL6iwXOishQikPKVBGT40MOTxQokeMmtBX-7E';
const supabase = createClient(supabaseUrl, supabaseKey);

const fredApiKey = '33b92820d805c914e12d2f2b9b2fec73';
// Get the last 24 months of unemployment data
const url = `https://api.stlouisfed.org/fred/series/observations?series_id=UNRATE&api_key=${fredApiKey}&file_type=json&sort_order=desc&limit=24`;

console.log('Fetching unemployment rate data from FRED...');

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', async () => {
    try {
      const jsonData = JSON.parse(data);

      if (jsonData.error_message) {
        console.error('Error from FRED API:', jsonData.error_message);
        return;
      }

      console.log(`✓ Successfully fetched ${jsonData.observations?.length || 0} data points`);

      // Save to JSON file
      fs.writeFileSync('FRED_Unemploment.JSON', JSON.stringify(jsonData, null, 2));
      console.log('✓ Saved to FRED_Unemploment.JSON');

      console.log('Clearing existing data from fred_indicators_tb...');

      // Delete all existing records from the table
      const { error: deleteError } = await supabase
        .from('fred_indicators_tb')
        .delete()
        .neq('id', 0); // This deletes all rows

      if (deleteError) {
        console.error('Error clearing table:', deleteError.message);
        return;
      }

      console.log('✓ Successfully cleared existing data');
      console.log('Inserting data into database...');

      let insertedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const observation of jsonData.observations) {
        // Prepare the data for insertion
        const indicatorData = {
          series_id: 'UNRATE',
          observation_date: observation.date,
          value: parseFloat(observation.value),
          realtime_start: observation.realtime_start,
          realtime_end: observation.realtime_end
        };

        // Insert into database
        const { data, error } = await supabase
          .from('fred_indicators_tb')
          .insert([indicatorData]);

        if (error) {
          // Check if it's a duplicate error
          if (error.code === '23505') {
            skippedCount++;
          } else {
            console.error(`Error inserting data for ${observation.date}:`, error.message);
            errorCount++;
          }
        } else {
          insertedCount++;
        }
      }

      console.log('\n--- Import Summary ---');
      console.log(`✓ Inserted: ${insertedCount} data points`);
      console.log(`- Skipped (duplicates): ${skippedCount} data points`);
      if (errorCount > 0) {
        console.log(`✗ Errors: ${errorCount} data points`);
      }
      console.log('----------------------\n');

      // Display the latest unemployment rate
      if (jsonData.observations && jsonData.observations.length > 0) {
        const latest = jsonData.observations[0];
        console.log(`Latest Unemployment Rate: ${latest.value}%`);
        console.log(`Date: ${latest.date}`);
      }

    } catch (error) {
      console.error('Error:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('Error fetching unemployment data:', error.message);
});
