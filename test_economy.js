import { EN_CATEGORY_FEEDS, normArticle, isArticleRelevant, isBlocked, parseXML } from './src/data/feeds.js';

const withTimeout = (promise, ms = 4000) =>
    Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ]);

const PROXY_STRATEGIES = [
    async (u) => {
        const res = await withTimeout(fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(u)}&count=25&nocache=${Math.random().toString(36).slice(2)}`));
        const json = await res.json();
        return json.status === 'ok' && json.items?.length > 0 ? { items: json.items, isJson: true } : null;
    },
    async (u) => {
        const res = await withTimeout(fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`));
        const xml = await res.text();
        const items = parseXML(xml);
        return items.length > 0 ? { items, isJson: false } : null;
    },
    async (u) => {
        const res = await withTimeout(fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(u)}&t=${Date.now()}`));
        const json = await res.json();
        const items = parseXML(json.contents || '');
        return items.length > 0 ? { items, isJson: false } : null;
    },
    async (u) => {
        const res = await withTimeout(fetch(`https://corsproxy.io/?${encodeURIComponent(u)}`));
        const xml = await res.text();
        const items = parseXML(xml);
        return items.length > 0 ? { items, isJson: false } : null;
    }
];

async function testEconomy() {
    const feeds = EN_CATEGORY_FEEDS['Economy'];
    let totalFeedsPassed = 0;

    for (const feed of feeds.slice(0, 5)) {
        console.log("\nTesting feed:", feed.name);
        let result = null;
        let proxyUsed = -1;
        for (let i = 0; i < PROXY_STRATEGIES.length; i++) {
            try {
                result = await PROXY_STRATEGIES[i](feed.url);
                if (result) {
                    proxyUsed = i;
                    break;
                }
            } catch (e) {
                // Ignore
            }
        }

        if (!result) {
            console.log("All proxies failed for", feed.name);
            continue;
        }

        console.log(`Success with proxy ${proxyUsed}. Items: ${result.items.length}`);

        const articles = result.items.map(item => normArticle(item, feed, result, false, 'Economy'));

        let passed = 0;
        let blockedTotal = 0;
        let notRel = 0;

        articles.forEach(a => {
            const isRel = isArticleRelevant(a, 'Economy');
            const isBlk = isBlocked(a);

            if (!isRel) notRel++;
            if (isBlk) blockedTotal++;
            if (isRel && !isBlk) passed++;
        });

        console.log(`Passed: ${passed} | Not Relevant: ${notRel} | Blocked: ${blockedTotal}`);
        totalFeedsPassed += passed;
    }
    console.log("\nTOTAL ARTICLES PASSED:", totalFeedsPassed);
}
testEconomy();
