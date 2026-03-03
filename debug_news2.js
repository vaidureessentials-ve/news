import { isArticleRelevant, isBlocked, parseXML, normArticle } from './src/data/feeds.js';
import fs from 'fs';

async function testFetch() {
    try {
        const feed = { name: 'Google RBI', url: 'https://news.google.com/rss/search?q=rbi+interest+rate+india&hl=en-IN&gl=IN&ceid=IN:en' };
        const res2 = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
        const json2 = await res2.json();
        const items = parseXML(json2.contents);

        console.log("Parsed Google News items:", items.length);
        if (items.length > 0) {
            let rel = 0, blk = 0, pass = 0;
            items.forEach(item => {
                const article = normArticle(item, feed, { isJson: false }, false, 'Economy');
                const r = isArticleRelevant(article, 'Economy');
                const b = isBlocked(article);
                if (r && !b) pass++;
                if (!r) { console.log('Not rel:', article.title); rel++; }
                if (b) { console.log('Blocked:', article.title); blk++; }
            });
            console.log(`Google News - Passed: ${pass}, Not Rel: ${rel}, Blocked: ${blk}`);
        }
    } catch (e) {
        console.error(e);
    }
}
testFetch();
