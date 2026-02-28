import { isArticleRelevant } from './src/data/feeds.js';

const article = {
    title: "Reliance Industries hits record high amid strong earnings",
    shortDescription: "The stock market saw a massive bull run today as Reliance Industries posted a record profit.",
    fullContent: "The company reported a surplus in growth and positive recovery across all sectors."
};

console.log("Business:", isArticleRelevant(article, 'Business'));
console.log("Stocks:", isArticleRelevant(article, 'Stocks'));
console.log("Geopolitical:", isArticleRelevant(article, 'Geopolitical'));
