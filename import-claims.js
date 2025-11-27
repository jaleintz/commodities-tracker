const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://qojknttexykrmlqnkudv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvamtudHRleHlrcm1scW5rdWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMzQ4MjAsImV4cCI6MjA0ODkxMDgyMH0.PrYN-9iGFrXTGGHbZCnkLN2XRNXSK7tUnBUxjQb1YY8';
const supabase = createClient(supabaseUrl, supabaseKey);

const fredApiKey = '33b92820d805c914e12d2f2b9b2fec73';
const seriesId = 'ICSA'; // Initial Claims
const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredApiKey}&file_type=json&sort_order=desc&limit=24`;

async function importClaimsData() {
  try {
    console.log('Fetching FRED Initial Claims data...');

    const response = await fetch(url);
    const data = await response.json();

    if (data.observations && data.observations.length > 0) {
      // Save to JSON file
      fs.writeFileSync('FRED_Claims.JSON', JSON.stringify(data, null, 2));
      console.log(`✓ Saved data to FRED_Claims.JSON`);

      // Delete all existing ICSA records from the table
      console.log('Clearing existing ICSA data from fred_claims_tb...');
      const { error: deleteError } = await supabase
        .from('fred_claims_tb')
        .delete()
        .eq('series_id', 'ICSA');

      if (deleteError) {
        console.error('Error clearing table:', deleteError.message);
        return;
      }
      console.log('✓ Successfully cleared existing ICSA data');

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
          .from('fred_claims_tb')
          .insert([indicatorData]);

        if (insertError) {
          console.error(`Error inserting data for ${observation.date}:`, insertError.message);
        } else {
          successCount++;
        }
      }

      console.log(`✓ Successfully imported ${successCount} out of ${data.observations.length} data points`);
      console.log(`Latest claims: ${data.observations[0].value} (${data.observations[0].date})`);
    } else {
      console.error('No data received from FRED API');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

importClaimsData();
