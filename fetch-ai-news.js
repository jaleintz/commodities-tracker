const https = require('https');
const fs = require('fs');

// Calculate date 24 hours ago
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const fromDate = yesterday.toISOString().split('T')[0];

const apiKey = 'b4aaef63526c4a70bcf07e9d2f46ab0f';
const url = `https://newsapi.org/v2/everything?q=AI&from=${fromDate}&sortBy=popularity&apiKey=${apiKey}`;

console.log('Fetching AI news from NewsAPI...');
console.log(`From date: ${fromDate}`);

const options = {
  headers: {
    'User-Agent': 'CommoditiesTracker/1.0'
  }
};

https.get(url, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);

      // Save to file
      fs.writeFileSync('ainews.json', JSON.stringify(jsonData, null, 2));

      console.log('✓ Successfully fetched and saved AI news to ainews.json');
      console.log(`  Total articles: ${jsonData.articles ? jsonData.articles.length : 0}`);
      console.log(`  Status: ${jsonData.status}`);
    } catch (error) {
      console.error('Error parsing JSON:', error.message);
      console.error('Raw data:', data);
    }
  });
}).on('error', (error) => {
  console.error('Error fetching news:', error.message);
});
