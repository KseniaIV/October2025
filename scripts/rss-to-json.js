import fs from "node:fs";
import Parser from "rss-parser";

const feeds = [
  { name: "google-news-top", url: "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en" },
  { name: "google-news-tech", url: "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y0RvU0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en" },
  { name: "google-news-business", url: "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlhNU0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en" },
  { name: "google-news-sports", url: "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en" },
  { name: "google-news-health", url: "https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ?hl=en&gl=US&ceid=US:en" },
  { name: "google-news-science", url: "https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRFp0Y0RvU0FtVnVHZ0pWVXlnQVAB?hl=en&gl=US&ceid=US:en" }
];

const parser = new Parser({ 
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
  }
});

console.log('📰 Starting RSS feed processing...');
await fs.promises.mkdir("data", { recursive: true });

let successCount = 0;
let failCount = 0;

for (const f of feeds) {
  try {
    console.log(`🔄 Fetching ${f.name}...`);
    const feed = await parser.parseURL(f.url);
    const json = {
      source: f.url,
      title: feed.title || "",
      updatedAt: new Date().toISOString(),
      items: (feed.items || []).slice(0, 50).map(i => ({
        title: i.title || "",
        link: i.link || "",
        isoDate: i.isoDate || i.pubDate || null,
        summary: i.contentSnippet || null
      }))
    };
    await fs.promises.writeFile(`data/${f.name}.json`, JSON.stringify(json, null, 2));
    console.log(`✅ Wrote ${f.name} (${json.items.length} articles)`);
    successCount++;
  } catch (e) {
    console.error(`❌ Failed ${f.name}:`, e.message);
    failCount++;
  }
}

console.log(`\n📊 Summary: ${successCount} successful, ${failCount} failed`);

if (failCount > 0) {
  console.log('⚠️  Some feeds failed, but continuing...');
}

if (successCount === 0) {
  console.error('💥 All feeds failed! Exiting with error.');
  process.exit(1);
}

console.log('🎉 RSS processing complete!');
