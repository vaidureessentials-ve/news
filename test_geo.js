import { EN_CATEGORY_FEEDS, analyzeSentiment, analyzeImpact, isArticleRelevant, parseXML, normArticle, CATEGORY_KEYWORDS, isBlocked, BLOCKED_KEYWORDS } from './src/data/feeds.js';

const fetchGeopolitics = async () => {
    try {
        const feeds = EN_CATEGORY_FEEDS['Geopolitical'];
        const feed = feeds[0];
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;

        console.log(`Fetching: ${feed.url}`);

        const res = await fetch(proxyUrl);
        const json = await res.json();
        const xmlText = json.contents;
        const result = { isJson: false, items: parseXML(xmlText) };
        console.log(`Parsed ${result.items.length} items from XML`);

        let passed = 0;
        let failedStats = {
            notRelevant: 0,
            blocked_cjk: 0,
            blocked_lang: 0,
            blocked_keyword: 0,
            blocked_stale: 0,
        };

        result.items.forEach(item => {
            const article = normArticle(item, feed, result, false, 'Geopolitical');

            const relevant = isArticleRelevant(article, 'Geopolitical');
            if (!relevant) {
                failedStats.notRelevant++;
                return;
            }

            // Test isBlocked manually to see exactly what fails
            const title = (article.title || '').toLowerCase();
            const desc = (article.shortDescription || '').toLowerCase();
            const text = `${title} ${desc}`;

            const cjkRegex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef\uac00-\ud7af]/;
            if (cjkRegex.test(article.title) || cjkRegex.test(article.shortDescription)) {
                failedStats.blocked_cjk++; return;
            }

            const hasEnglish = /[a-zA-Z]/.test(title);
            const hasHindi = /[\u0900-\u097F]/.test(title);
            if (!hasEnglish && !hasHindi) {
                failedStats.blocked_lang++; return;
            }

            if (BLOCKED_KEYWORDS.some(kw => text.includes(kw.toLowerCase()))) {
                failedStats.blocked_keyword++; return;
            }

            const pubDate = new Date(article.pubDate);
            if (!isNaN(pubDate.getTime())) {
                const threshold = new Date();
                const dayOfWeek = threshold.getDay();
                const maxStalenessHours = (dayOfWeek === 0 || dayOfWeek === 1 || dayOfWeek === 6) ? 72 : 24;
                threshold.setHours(threshold.getHours() - maxStalenessHours);
                if (pubDate < threshold) {
                    failedStats.blocked_stale++; return;
                }
            }

            passed++;
            console.log("PASSED ARTICLE:", article.title);
        });

        console.log(`Out of ${result.items.length}, ${passed} passed relevance filter.`);
        console.log("Failed Stats:", failedStats);
    } catch (e) {
        console.error(e);
    }
}
fetchGeopolitics();
