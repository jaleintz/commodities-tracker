const fs = require('fs');

const fredApiKey = '33b92820d805c914e12d2f2b9b2fec73';
const seriesId = 'DCOILWTICO'; // Crude Oil Prices: West Texas Intermediate (WTI)
const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredApiKey}&file_type=json&sort_order=desc&limit=60`;

async function fetchWTIData() {
  try {
    console.log('Fetching FRED WTI Crude Oil data...');

    const response = await fetch(url);
    const data = await response.json();

    if (data.observations && data.observations.length > 0) {
      // Save to JSON file
      fs.writeFileSync('FRED_WTI.JSON', JSON.stringify(data, null, 2));

      console.log(`✓ Successfully fetched ${data.observations.length} data points`);
      console.log(`Latest WTI price: $${data.observations[0].value} per barrel (${data.observations[0].date})`);
    } else {
      console.error('No data received from FRED API');
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}

fetchWTIData();
