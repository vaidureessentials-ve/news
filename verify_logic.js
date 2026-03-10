
const BLOCKED_KEYWORDS = [
    'interest into 2024', 'interest into 2023', 'avoid credit card interest',
    '0% intro', 'intro apr', '0% apr', 'credit card offer', 'credit score'
];

function isBlocked(article) {
    const title = (article.title || '').toLowerCase();
    const desc = (article.shortDescription || '').toLowerCase();
    const text = `${title} ${desc}`;

    // Keyword block
    if (BLOCKED_KEYWORDS.some(kw => text.includes(kw.toLowerCase()))) return true;

    // Staleness block
    if (!article.pubDate) return true;

    const pubDate = new Date(article.pubDate);
    if (!isNaN(pubDate.getTime())) {
        const threshold = new Date();
        const maxStalenessHours = 24;
        threshold.setHours(threshold.getHours() - maxStalenessHours);
        if (pubDate < threshold) return true;
    } else {
        return true;
    }

    return false;
}

const testArticles = [
    { title: "Valid Recent", pubDate: new Date().toISOString(), shortDescription: "Recent news" },
    { title: "Old 2024", pubDate: "2024-08-22T15:32:30Z", shortDescription: "Old news" },
    { title: "No Date Ad", pubDate: "", shortDescription: "It's official: now avoid credit card interest" },
    { title: "Ad Keyword", pubDate: new Date().toISOString(), shortDescription: "0% intro APR" }
];

testArticles.forEach(a => {
    console.log(`[${a.title}] Blocked: ${isBlocked(a)}`);
});
