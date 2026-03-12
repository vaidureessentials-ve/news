
// Mock feeds and logic
const EN_CATEGORY_FEEDS = {
    'Geopolitical': [
        { name: 'The Hindu World', url: 'https://www.thehindu.com/news/international/?service=rss' },
        { name: 'CNN World', url: 'http://rss.cnn.com/rss/edition_world.rss' }
    ],
    'Economy': [
        { name: 'ET Economy', url: 'https://economictimes.indiatimes.com/news/economy/rssfeeds/13733806.cms' }
    ],
    'Business': [
        { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/news/industry/rssfeeds/13352306.cms' }
    ],
    'Tech': [
        { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
        { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' }
    ],
    'Stocks': [
        { name: 'Economic Times Markets', url: 'https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms' }
    ]
};

const isBlocked = (article) => {
    const title = (article.title || '').toLowerCase();
    const desc = (article.shortDescription || '').toLowerCase();
    
    // 1. Script block
    const cjkRegex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef\uac00-\ud7af]/;
    if (cjkRegex.test(article.title) || cjkRegex.test(article.shortDescription)) return { blocked: true, reason: 'CJK' };

    // 1b. Language check
    const hasEnglish = /[a-zA-Z]/.test(title);
    const hasHindi = /[\u0900-\u097F]/.test(title);
    if (!hasEnglish && !hasHindi) return { blocked: true, reason: 'Language' };

    // 2. Staleness block (24 hours)
    if (!article.pubDate) return { blocked: true, reason: 'No Date' };
    const pubDate = new Date(article.pubDate);
    if (!isNaN(pubDate.getTime())) {
        const threshold = new Date();
        threshold.setHours(threshold.getHours() - 24);
        if (pubDate < threshold) return { blocked: true, reason: `Stale (${pubDate.toISOString()} < ${threshold.toISOString()})` };
    } else {
        return { blocked: true, reason: 'Invalid Date Format' };
    }

    return { blocked: false };
};

async function testCategory(cat) {
    console.log(`\n--- Testing ${cat} ---`);
    const feeds = EN_CATEGORY_FEEDS[cat];
    let totalFound = 0;
    let totalPassed = 0;
    let blockReasons = {};

    for (const feed of feeds) {
        try {
            console.log(`Fetching ${feed.name}...`);
            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=20`);
            const data = await res.json();
            const items = data.items || [];
            totalFound += items.length;

            items.forEach(item => {
                const article = {
                    title: item.title,
                    shortDescription: item.description,
                    pubDate: item.pubDate
                };
                const result = isBlocked(article);
                if (!result.blocked) {
                    totalPassed++;
                } else {
                    const reason = result.reason.split(' ')[0];
                    blockReasons[reason] = (blockReasons[reason] || 0) + 1;
                }
            });
        } catch (err) {
            console.error(`  Error fetching ${feed.name}: ${err.message}`);
        }
    }
    console.log(`Results for ${cat}: Found ${totalFound}, Passed ${totalPassed}`);
    if (totalFound > 0) console.log(`Block reasons:`, blockReasons);
}

async function runTests() {
    for (const cat of Object.keys(EN_CATEGORY_FEEDS)) {
        await testCategory(cat);
    }
}

runTests();
