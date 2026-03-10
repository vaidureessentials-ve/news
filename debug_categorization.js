import { isArticleRelevant, isBlocked } from './src/data/feeds.js';

const problematicArticle = {
    title: "Dhurandhar 2' Sets New Benchmark In Premiere Bookings,...",
    shortDescription: "Early reports suggest that more than 1.2 lakh tickets were sold for the preview screenings",
    fullContent: "...",
    sourceName: "NDTV Profit"
};

const category = 'Stocks';

const isRelevant = isArticleRelevant(problematicArticle, category);
const blocked = isBlocked(problematicArticle);

console.log(`Article: "${problematicArticle.title}"`);
console.log(`Category: ${category}`);
console.log(`Is Relevant: ${isRelevant}`);
console.log(`Is Blocked: ${blocked}`);
console.log(`Will be displayed: ${isRelevant && !blocked}`);

if (!isRelevant || blocked) {
    console.log("\nSUCCESS: The article was correctly filtered out.");
} else {
    console.log("\nFAILURE: The article was not filtered out.");
}
