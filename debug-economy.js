const https = require('https');

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function testEconomy() {
    // Testing one of the ET Economy feeds via rss2json
    const rssUrl = 'https://economictimes.indiatimes.com/news/economy/rssfeeds/13733806.cms';
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=10`;

    console.log("Fetching ET Economy via rss2json...");
    try {
        const responseText = await fetchUrl(proxyUrl);
        const json = JSON.parse(responseText);
        
        if (json.status !== 'ok') {
            console.error("RSS2JSON Failed:", json.message);
            return;
        }

        console.log(`Found ${json.items.length} items.`);
        
        json.items.forEach((item, i) => {
            console.log(`\n--- Item ${i+1} ---`);
            console.log(`Title: ${item.title}`);
            console.log(`PubDate: ${item.pubDate}`);
            
            // Replicate staleness check
            const pubDate = new Date(item.pubDate);
            const now = new Date();
            const diffHours = (now - pubDate) / (1000 * 60 * 60);
            console.log(`Staleness: ${diffHours.toFixed(1)} hours`);
            
            const isStale = diffHours > 72; // Our new threshold
            console.log(`Is Stale (>72h)? ${isStale}`);
        });

    } catch (e) {
        console.error("Test failed:", e);
    }
}

testEconomy();
