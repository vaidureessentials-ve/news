import fetch from 'node-fetch';

const proxies = [
    'https://api.rss2json.com/v1/api.json?rss_url=',
    'https://api.codetabs.com/v1/proxy/?quest=',
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?'
];

const economyFeeds = [
    'https://economictimes.indiatimes.com/news/economy/rssfeeds/13733806.cms',
    'https://news.google.com/rss/search?q=india+economy+gdp&hl=en-IN&gl=IN&ceid=IN:en'
];

async function testFeeds() {
    for (const url of economyFeeds) {
        console.log(`\nTesting Feed: ${url}`);
        for (const proxy of proxies) {
            try {
                const fetchUrl = proxy.includes('rss2json') ? proxy + encodeURIComponent(url) : proxy + encodeURIComponent(url);
                console.log(`  Trying Proxy: ${proxy}`);
                const res = await fetch(fetchUrl, { timeout: 5000 });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                
                let data;
                if (proxy.includes('rss2json')) {
                    data = await res.json();
                    console.log(`    Success! Items found: ${data.items?.length || 0}`);
                    if (data.items?.length > 0) {
                        console.log(`    First Item Title: ${data.items[0].title}`);
                        console.log(`    First Item Date: ${data.items[0].pubDate}`);
                    }
                } else {
                    const text = await res.text();
                    console.log(`    Success! Response length: ${text.length}`);
                    if (text.includes('<item>')) {
                        console.log(`    Articles found in XML!`);
                    } else {
                        console.log(`    No <item> tags found in XML.`);
                    }
                }
                break; // Stop if proxy works
            } catch (e) {
                console.log(`    Failed: ${e.message}`);
            }
        }
    }
}

testFeeds();
