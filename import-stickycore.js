const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://uzgnghfqkcktfjcreipr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Z25naGZxa2NrdGZqY3JlaXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTg5ODIsImV4cCI6MjA3ODQzNDk4Mn0.XsB6gyeL6iwXOishQikPKVBGT40MOTxQokeMmtBX-7E';
const supabase = createClient(supabaseUrl, supabaseKey);

const fredApiKey = '33b92820d805c914e12d2f2b9b2fec73';
const seriesId = 'CORESTICKM159SFRBATL'; // Sticky Price Consumer Price Index less Food and Energy
const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredApiKey}&file_type=json&sort_order=desc&limit=12`;

async function importStickyCoreData() {
  try {
    console.log('Fetching FRED Sticky Core CPI data...');

    const response = await fetch(url);
    const data = await response.json();

    if (data.observations && data.observations.length > 0) {
      // Save to JSON file
      fs.writeFileSync('FRED_StickyCore.JSON', JSON.stringify(data, null, 2));
      console.log(`✓ Saved data to FRED_StickyCore.JSON`);

      // Delete all existing CORESTICKM159SFRBATL records from the table
      console.log('Clearing existing CORESTICKM159SFRBATL data from fred_stickycore_tb...');
      const { error: deleteError } = await supabase
        .from('fred_stickycore_tb')
        .delete()
        .eq('series_id', 'CORESTICKM159SFRBATL');

      if (deleteError) {
        console.error('Error clearing table:', deleteError.message);
        return;
      }
      console.log('✓ Successfully cleared existing CORESTICKM159SFRBATL data');

      // Insert new data
      console.log(`Importing ${data.observations.length} data points...`);
      let successCount = 0;

      for (const observation of data.observations) {
        const indicatorData = {
          series_id: seriesId,
          observation_date: observation.date,
          value: parseFloat(observation.value),
          realtime_start: observation.realtime_start,
          realtime_end: observation.realtime_end
        };

        const { error: insertError } = await supabase
          .from('fred_stickycore_tb')
          .insert([indicatorData]);

        if (insertError) {
          console.error(`Error inserting data for ${observation.date}:`, insertError.message);
        } else {
          successCount++;
        }
      }

      console.log(`✓ Successfully imported ${successCount} out of ${data.observations.length} data points`);
      console.log(`Latest Sticky Core CPI: ${data.observations[0].value}% (${data.observations[0].date})`);
    } else {
      console.error('No data received from FRED API');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

importStickyCoreData();
