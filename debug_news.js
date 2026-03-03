import fs from 'fs';

async function testFetch() {
    try {
        const url = 'https://economictimes.indiatimes.com/news/economy/rssfeeds/13733806.cms';
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (json.items) {
            console.log("ET Economy Items:");
            json.items.slice(0, 3).forEach(i => console.log(i.title, i.pubDate));
        }

        const url2 = 'https://news.google.com/rss/search?q=rbi+interest+rate+india&hl=en-IN&gl=IN&ceid=IN:en';
        const res2 = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url2)}`);
        const json2 = await res2.json();
        console.log("Google News length:", json2.contents.length);

    } catch (e) {
        console.error(e);
    }
}
testFetch();
