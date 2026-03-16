const fs = require('fs');
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

async function testFeeds() {
    const urls = [
        'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com/business/economy&hl=en-US&gl=US&ceid=US:en') + '&count=5',
        'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258') + '&count=5'
    ];

    for (const u of urls) {
        console.log("Fetching:", u);
        try {
            const data = await fetchUrl(u);
            console.log(data.substring(0, 500));
        } catch (e) {
            console.error(e);
        }
    }
}

testFeeds();
