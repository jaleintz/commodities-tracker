const https = require('https');
const fs = require('fs');

const fredApiKey = '33b92820d805c914e12d2f2b9b2fec73';
// Get the last 24 months of unemployment data
const url = `https://api.stlouisfed.org/fred/series/observations?series_id=UNRATE&api_key=${fredApiKey}&file_type=json&sort_order=desc&limit=24`;

console.log('Fetching unemployment rate data from FRED...');

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
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

      // Display the latest unemployment rate
      if (jsonData.observations && jsonData.observations.length > 0) {
        const latest = jsonData.observations[0];
        console.log(`\nLatest Unemployment Rate: ${latest.value}%`);
        console.log(`Date: ${latest.date}`);
      }

    } catch (error) {
      console.error('Error:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('Error fetching unemployment data:', error.message);
});
