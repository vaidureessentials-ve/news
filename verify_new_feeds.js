import fetch from 'node-fetch';

const proxies = [
    'https://api.rss2json.com/v1/api.json?rss_url=',
    'https://api.codetabs.com/v1/proxy/?quest=',
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?'
];

const newEconomyFeeds = [
    { name: 'CNBC Economy', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258' },
    { name: 'Google News Economy', url: 'https://news.google.com/rss/search?q=india+economy+gdp&hl=en-IN&gl=IN&ceid=IN:en' },
    { name: 'BBC Business', url: 'http://feeds.bbci.co.uk/news/business/rss.xml' }
];

async function testFeeds() {
    for (const feed of newEconomyFeeds) {
        console.log(`\nTesting Feed: ${feed.name} (${feed.url})`);
        let success = false;
        for (const proxy of proxies) {
            try {
                const fetchUrl = proxy + encodeURIComponent(feed.url);
                const res = await fetch(fetchUrl, { timeout: 8000 });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                
                if (proxy.includes('rss2json')) {
                    const data = await res.json();
                    if (data.items?.length > 0) {
                        console.log(`    Success with RSS2JSON! Items: ${data.items.length}`);
                        success = true;
                    }
                } else {
                    const text = await res.text();
                    if (text.includes('<item>')) {
                        console.log(`    Success with Proxy! Articles found in XML.`);
                        success = true;
                    }
                }
                if (success) break;
            } catch (e) {
                // console.log(`    Proxy ${proxy.split('/')[2]} failed`);
            }
        }
        if (!success) console.log(`    FAILED: All proxies failed for this feed.`);
    }
}

testFeeds();
