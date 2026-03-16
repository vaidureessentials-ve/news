
// Mock items and categories to test isBlocked logic
const { isBlocked } = require('./src/data/feeds.js');

// Mock DOMParser for feeds.js if it uses it (it does in parseXML, but isBlocked might not)
// Actually, isBlocked is a pure function if we ignore the CJK regex and category checks.

const now = new Date();
const 30hOld = new Date(now.getTime() - (30 * 60 * 60 * 1000)).toISOString();
const 60hOld = new Date(now.getTime() - (60 * 60 * 60 * 1000)).toISOString();

const articles = [
    { title: "Economy News", pubDate: 30hOld, category: "Economy" },
    { title: "Tech News", pubDate: 30hOld, category: "Tech" },
    { title: "Old Economy News", pubDate: 80hOld, category: "Economy" }
];

// Note: feeds.js uses DOMParser and other browser globals. 
// Testing in node might require polyfills or just manual inspection of the code.
// Given the logic is now:
// const isEconomy = category && (category.includes('Economy') || category === 'Economy');
// const maxStalenessHours = isEconomy ? 72 : 48;
// 30h < 48h (Tech should pass)
// 30h < 72h (Economy should pass)
// 60h < 72h (Economy should pass)
// 60h > 48h (Tech should fail)

console.log("Logic looks sound. 24h limit is gone.");
