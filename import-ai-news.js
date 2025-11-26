const https = require('https');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://uzgnghfqkcktfjcreipr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Z25naGZxa2NrdGZqY3JlaXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTg5ODIsImV4cCI6MjA3ODQzNDk4Mn0.XsB6gyeL6iwXOishQikPKVBGT40MOTxQokeMmtBX-7E';
const supabase = createClient(supabaseUrl, supabaseKey);

// Calculate date 2 days ago to get yesterday and today
const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const fromDate = twoDaysAgo.toISOString().split('T')[0];

const apiKey = 'b4aaef63526c4a70bcf07e9d2f46ab0f';
const url = `https://newsapi.org/v2/everything?q=AI&from=${fromDate}&sortBy=publishedAt&apiKey=${apiKey}`;

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

  res.on('end', async () => {
    try {
      const jsonData = JSON.parse(data);

      if (jsonData.status !== 'ok') {
        console.error('Error from NewsAPI:', jsonData.message);
        return;
      }

      console.log(`✓ Successfully fetched ${jsonData.articles.length} articles`);

      // Save to JSON file
      fs.writeFileSync('ainews.json', JSON.stringify(jsonData, null, 2));
      console.log('✓ Saved to ainews.json');

      console.log('Inserting articles into database...');

      let insertedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const article of jsonData.articles) {
        // Prepare the data for insertion
        const newsData = {
          source_id: article.source.id,
          source_name: article.source.name,
          author: article.author,
          title: article.title,
          description: article.description,
          url: article.url,
          url_to_image: article.urlToImage,
          published_at: article.publishedAt,
          content: article.content
        };

        // Insert into database
        const { data, error } = await supabase
          .from('ai_news_tb')
          .insert([newsData]);

        if (error) {
          // Check if it's a duplicate URL error
          if (error.code === '23505') {
            skippedCount++;
          } else {
            console.error(`Error inserting article "${article.title}":`, error.message);
            errorCount++;
          }
        } else {
          insertedCount++;
        }
      }

      console.log('\n--- Import Summary ---');
      console.log(`✓ Inserted: ${insertedCount} articles`);
      console.log(`- Skipped (duplicates): ${skippedCount} articles`);
      if (errorCount > 0) {
        console.log(`✗ Errors: ${errorCount} articles`);
      }
      console.log('----------------------\n');

    } catch (error) {
      console.error('Error:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('Error fetching news:', error.message);
});
