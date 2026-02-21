import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RefreshCcw, ChevronRight, LayoutGrid, Clock, Newspaper, ShieldAlert, ExternalLink } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import newsFallbackData from '../data/newsData.json';

// ─────────────────────────────────────────────────────────────
// ENGLISH FEEDS — 20+ sources per category for maximum coverage
// ─────────────────────────────────────────────────────────────
const EN_CATEGORY_FEEDS = {
    'Tech': [
        { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
        { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
        { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
        { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
        { name: 'Engadget', url: 'https://www.engadget.com/rss.xml' },
        { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' },
        { name: 'VentureBeat', url: 'https://venturebeat.com/feed/' },
        { name: 'ZDNet', url: 'https://www.zdnet.com/news/rss.xml' },
        { name: 'ET Tech', url: 'https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms' },
        { name: 'Livemint Tech', url: 'https://www.livemint.com/rss/technology' },
        { name: 'NDTV Gadgets', url: 'https://feeds.feedburner.com/ndtvgadgets-latest' },
        { name: 'India Today Tech', url: 'https://www.indiatoday.in/rss/1206550' },
        { name: 'Hindustan Times Tech', url: 'https://www.hindustantimes.com/feeds/rss/tech/rssfeed.xml' },
        { name: 'The Hindu Tech', url: 'https://www.thehindu.com/sci-tech/technology/?service=rss' },
        { name: 'News18 Tech', url: 'https://www.news18.com/commonfeeds/v1/eng/rss/tech.xml' },
        { name: 'Google Tech News', url: 'https://news.google.com/rss/search?q=technology+india&hl=en-IN&gl=IN&ceid=IN:en' },
        { name: 'Digit.in', url: 'https://www.digit.in/rss/news.rss' }
    ],
    'Business': [
        { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/news/industry/rssfeeds/13352306.cms' },
        { name: 'Business Standard', url: 'https://www.business-standard.com/rss/companies-101.rss' },
        { name: 'Business Today', url: 'https://www.businesstoday.in/rss/corporate' },
        { name: 'Livemint Business', url: 'https://www.livemint.com/rss/companies' },
        { name: 'The Hindu BusinessLine', url: 'https://www.thehindubusinessline.com/news/?service=rss' },
        { name: 'Moneycontrol', url: 'https://www.moneycontrol.com/rss/latestnews.xml' },
        { name: 'CNBC TV18', url: 'https://www.news18.com/commonfeeds/v1/eng/rss/business.xml' },
        { name: 'CNBC International', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147' },
        { name: 'Forbes', url: 'https://www.forbes.com/business/feed/' },
        { name: 'Bloomberg', url: 'https://feeds.bloomberg.com/news/rss' },
        { name: 'Reuters Business', url: 'https://feeds.reuters.com/reuters/businessNews' },
        { name: 'Indian Express Biz', url: 'https://indianexpress.com/section/business/feed/' },
        { name: 'NDTV Profit', url: 'https://feeds.feedburner.com/ndtvprofit-latest' },
        { name: 'Financial Express', url: 'https://www.financialexpress.com/feed/' },
        { name: 'Inc42', url: 'https://inc42.com/feed/' },
        { name: 'YourStory', url: 'https://yourstory.com/feed' },
        { name: 'Google Business News', url: 'https://news.google.com/rss/search?q=business+india&hl=en-IN&gl=IN&ceid=IN:en' }
    ],
    'Economy': [
        { name: 'ET Economy', url: 'https://economictimes.indiatimes.com/news/economy/rssfeeds/13733806.cms' },
        { name: 'ET Policy', url: 'https://economictimes.indiatimes.com/news/economy/policy/rssfeeds/13357540.cms' },
        { name: 'ET Finance', url: 'https://economictimes.indiatimes.com/news/economy/finance/rssfeeds/13357559.cms' },
        { name: 'Business Standard', url: 'https://www.business-standard.com/rss/economy-policy-102.rss' },
        { name: 'Livemint Economy', url: 'https://www.livemint.com/rss/economy' },
        { name: 'Financial Express', url: 'https://www.financialexpress.com/economy/feed/' },
        { name: 'Moneycontrol', url: 'https://www.moneycontrol.com/rss/latestnews.xml' },
        { name: 'Google Economy', url: 'https://news.google.com/rss/search?q=india+economy+gdp&hl=en-IN&gl=IN&ceid=IN:en' },
        { name: 'Google RBI', url: 'https://news.google.com/rss/search?q=rbi+interest+rate+india&hl=en-IN&gl=IN&ceid=IN:en' },
        { name: 'Google Inflation', url: 'https://news.google.com/rss/search?q=india+inflation+fiscal+budget&hl=en-IN&gl=IN&ceid=IN:en' },
        { name: 'Google Trade', url: 'https://news.google.com/rss/search?q=india+trade+export+import&hl=en-IN&gl=IN&ceid=IN:en' }
    ],
    'Geopolitics': [
        { name: 'The Hindu World', url: 'https://www.thehindu.com/news/international/?service=rss' },
        { name: 'Indian Express World', url: 'https://indianexpress.com/section/world/feed/' },
        { name: 'ET World', url: 'https://economictimes.indiatimes.com/news/international/rssfeeds/13357255.cms' },
        { name: 'DW English', url: 'https://rss.dw.com/rdf/rss-en-all' },
        { name: 'Diplomat', url: 'https://thediplomat.com/feed/' },
        { name: 'Geopolitical Monitor', url: 'https://www.geopoliticalmonitor.com/feed/' },
        { name: 'Google India World', url: 'https://news.google.com/rss/search?q=india+foreign+policy+diplomacy&hl=en-IN&gl=IN&ceid=IN:en' },
        { name: 'Google Geopolitics', url: 'https://news.google.com/rss/search?q=geopolitics+conflict+war+sanctions&hl=en-IN&gl=IN&ceid=IN:en' },
        { name: 'Google China India', url: 'https://news.google.com/rss/search?q=china+india+border+pakistan&hl=en-IN&gl=IN&ceid=IN:en' },
        { name: 'Google US India', url: 'https://news.google.com/rss/search?q=india+united+states+relations&hl=en-IN&gl=IN&ceid=IN:en' },
        { name: 'Google UN', url: 'https://news.google.com/rss/search?q=united+nations+global+security&hl=en-IN&gl=IN&ceid=IN:en' }
    ],
    'Stock': [
        { name: 'Moneycontrol', url: 'https://www.moneycontrol.com/rss/marketreports.xml' },
        { name: 'ET Markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' },
        { name: 'Business Today Mkt', url: 'https://www.businesstoday.in/rss/market' },
        { name: 'NDTV Profit', url: 'https://feeds.feedburner.com/ndtvprofit-latest' }
    ]
};

// ─────────────────────────────────────────────────────────────
// HINDI FEEDS
// ─────────────────────────────────────────────────────────────
const HI_CATEGORY_FEEDS = {
    'Tech': [
        { name: 'Live Hindustan Tech', url: 'https://api.livehindustan.com/feeds/rss/gadgets/rssfeed.xml' },
        { name: 'NDTV Gadgets Hindi', url: 'https://hindi.gadgets360.com/rss/news' },
        { name: 'Aaj Tak Tech', url: 'https://www.aajtak.in/rss/technology.xml' },
        { name: 'Google Tech Hindi', url: 'https://news.google.com/rss/search?q=technology&hl=hi&gl=IN&ceid=IN:hi' },
        { name: 'ABP Tech', url: 'https://www.abplive.com/technology/feed' },
        { name: 'Navbharat Times Tech', url: 'https://navbharattimes.indiatimes.com/rss.cms?feedtype=sjson' }
    ],
    'Business': [
        { name: 'Live Hindustan Biz', url: 'https://api.livehindustan.com/feeds/rss/business/rssfeed.xml' },
        { name: 'NDTV Business Hindi', url: 'https://feeds.feedburner.com/ndtvindia-business' },
        { name: 'ABP Business', url: 'https://www.abplive.com/business/feed' },
        { name: 'Aaj Tak Business', url: 'https://www.aajtak.in/rss/business.xml' },
        { name: 'Zee Business', url: 'https://www.zeebiz.com/rss' },
        { name: 'Google Biz Hindi', url: 'https://news.google.com/rss/search?q=business&hl=hi&gl=IN&ceid=IN:hi' }
    ],
    'Economy': [
        { name: 'Live Hindustan Eco', url: 'https://api.livehindustan.com/feeds/rss/career/rssfeed.xml' },
        { name: 'CNBC Economy', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258' },
        { name: 'Aaj Tak Economy', url: 'https://www.aajtak.in/rss/economy.xml' },
        { name: 'Google Economy Hindi', url: 'https://news.google.com/rss/search?q=economy+india&hl=hi&gl=IN&ceid=IN:hi' }
    ],
    'Geopolitics': [
        { name: 'BBC Hindi', url: 'https://www.bbc.com/hindi/index.xml' },
        { name: 'LH International', url: 'https://api.livehindustan.com/feeds/rss/international/rssfeed.xml' },
        { name: 'Google News Hindi', url: 'https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi' },
        { name: 'Aaj Tak World', url: 'https://www.aajtak.in/rss/world.xml' },
        { name: 'NDTV India World', url: 'https://feeds.feedburner.com/ndtvindia' },
        { name: 'ABP World', url: 'https://www.abplive.com/world/feed' },
        { name: 'Navbharat World', url: 'https://navbharattimes.indiatimes.com/world/rss.cms' }
    ],
    'Stock': [
        { name: 'LH Markets', url: 'https://api.livehindustan.com/feeds/rss/business/stock-market/rssfeed.xml' },
        { name: 'Moneycontrol Hindi', url: 'https://hindi.moneycontrol.com/rss/market-news.xml' },
        { name: 'Zee Business', url: 'https://www.zeebiz.com/rss' }
    ]
};
const Home = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category');
    const [newsData, setNewsData] = useState({});
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(30);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [newArticleCount, setNewArticleCount] = useState(0);
    // Track seen article URLs so we can detect genuinely new ones
    const seenUrls = React.useRef(new Set());

    // Scroll to category section after navigating from another page
    useEffect(() => {
        const scrollTo = location.state?.scrollTo;
        if (!scrollTo || loading) return;
        const timer = setTimeout(() => {
            const element = document.getElementById(`category-${scrollTo}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 150);
        return () => clearTimeout(timer);
    }, [location.state, loading]);

    const fetchAllNews = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            else setSyncing(true);

            const currentLanguage = i18n.language || 'en';
            const isHindi = currentLanguage.startsWith('hi');
            const currentFeeds = isHindi ? HI_CATEGORY_FEEDS : EN_CATEGORY_FEEDS;
            const categories = Object.keys(currentFeeds);

            const fetchResults = await Promise.all(
                categories.map(async (cat) => {
                    const feeds = currentFeeds[cat];
                    const categoryItems = await Promise.all(
                        feeds.map(async (feed) => {
                            // Helper: parse raw RSS/Atom XML into items array
                            const parseXML = (xmlText) => {
                                try {
                                    const parser = new DOMParser();
                                    const xml = parser.parseFromString(xmlText, 'text/xml');
                                    const getText = (el, tag) => el?.querySelector(tag)?.textContent?.trim() || '';
                                    // RSS 2.0
                                    const rssItems = Array.from(xml.querySelectorAll('item'));
                                    if (rssItems.length > 0) {
                                        return rssItems.slice(0, 25).map(el => ({
                                            title: getText(el, 'title'),
                                            link: getText(el, 'link') || el.querySelector('link')?.getAttribute('href') || '',
                                            pubDate: getText(el, 'pubDate') || getText(el, 'published') || new Date().toISOString(),
                                            description: getText(el, 'description') || getText(el, 'summary') || '',
                                            content: getText(el, 'encoded') || getText(el, 'content') || getText(el, 'description') || '',
                                            thumbnail: el.querySelector('thumbnail')?.getAttribute('url') || el.querySelector('enclosure')?.getAttribute('url') || ''
                                        }));
                                    }
                                    // Atom
                                    const atomEntries = Array.from(xml.querySelectorAll('entry'));
                                    return atomEntries.slice(0, 25).map(el => ({
                                        title: getText(el, 'title'),
                                        link: el.querySelector('link')?.getAttribute('href') || getText(el, 'link') || '',
                                        pubDate: getText(el, 'published') || getText(el, 'updated') || new Date().toISOString(),
                                        description: getText(el, 'summary') || getText(el, 'content') || '',
                                        content: getText(el, 'content') || getText(el, 'summary') || '',
                                        thumbnail: el.querySelector('thumbnail')?.getAttribute('url') || ''
                                    }));
                                } catch (_) { return []; }
                            };

                            // 4-proxy cascade: fresh proxies first, rss2json as fallback
                            const PROXY_STRATEGIES = [
                                // 1. corsproxy.io — no caching, direct RSS XML
                                async (u) => {
                                    const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(u)}`, { cache: 'no-store' });
                                    const xml = await res.text();
                                    const items = parseXML(xml);
                                    if (items.length > 0) return { items, source: 'corsproxy' };
                                    return null;
                                },
                                // 2. allorigins.win — low cache, returns JSON wrapper
                                async (u) => {
                                    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(u)}&t=${Date.now()}`, { cache: 'no-store' });
                                    const json = await res.json();
                                    const items = parseXML(json.contents || '');
                                    if (items.length > 0) return { items, source: 'allorigins' };
                                    return null;
                                },
                                // 3. rss2json with strong cache-bust
                                async (u) => {
                                    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(u)}&count=25&nocache=${Math.random().toString(36).slice(2)}`);
                                    const json = await res.json();
                                    if (json.status === 'ok' && json.items?.length > 0) return { items: json.items, source: 'rss2json', isJson: true };
                                    return null;
                                },
                                // 4. rss2json plain
                                async (u) => {
                                    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(u)}&count=25`);
                                    const json = await res.json();
                                    if (json.status === 'ok' && json.items?.length > 0) return { items: json.items, source: 'rss2json-plain', isJson: true };
                                    return null;
                                }
                            ];

                            let result = null;
                            for (const strategy of PROXY_STRATEGIES) {
                                try { result = await strategy(feed.url); if (result) break; }
                                catch (_) { /* try next */ }
                            }
                            if (!result) { console.warn(`[${feed.name}] All proxies failed`); return []; }

                            const sourceKey = feed.name.toLowerCase().replace(/\s+/g, '_');
                            const localizedSource = t(`sources.${sourceKey}`);
                            const sourceName = localizedSource && localizedSource !== `sources.${sourceKey}`
                                ? localizedSource
                                : (isHindi && feed.name === 'Economic Times' ? 'इकोनॉमिक टाइम्स' : feed.name);

                            return result.items.map((item, index) => {
                                // Normalise between XML-parsed and rss2json-parsed shapes
                                const title = result.isJson ? item.title : item.title;
                                const link = result.isJson ? item.link : item.link;
                                const pubDate = result.isJson ? item.pubDate : item.pubDate;
                                const description = result.isJson ? (item.description || '') : (item.description || '');
                                const content = result.isJson ? (item.content || item.description || '') : (item.content || item.description || '');
                                const thumbnail = result.isJson
                                    ? (item.thumbnail || item.enclosure?.link || '')
                                    : (item.thumbnail || '');

                                return {
                                    id: `${cat}-${feed.name}-${index}`.replace(/\s+/g, '-').toLowerCase(),
                                    title,
                                    imageUrl: thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800',
                                    location: isHindi ? 'भारत' : 'India',
                                    sourceName,
                                    sourceUrl: link,
                                    category: cat,
                                    pubDate,
                                    shortDescription: description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
                                    fullContent: content.replace(/<[^>]*>?/gm, ''),
                                    isLatest: false
                                };
                            });
                        })
                    );


                    // Flatten and sort items by publication date
                    const BLOCKED_KEYWORDS = [
                        // Sports
                        'cricket', 'ipl', 'football', 'soccer', 'tennis', 'hockey', 'badminton',
                        'wicket', 'stadium', 'olympics', 'icc', 'bcci', 'basketball', 'baseball',
                        'rugby', 'golf', 'athletics', 'swimming', 'boxing', 'mma', 'ufc',
                        'wrestling match', 'pga', 'nba', 'nfl', 'wimbledon', 'batsman', 'bowler',
                        'wicketkeeper', 'fielder', 'f1 race', 'grand prix', 'premier league',
                        'super league', 'world cup cricket', 't20', 'test match', 'odi match',
                        'playing xi', 'point table', 'scorecard', 'lbw', 'sixer', 'clean-bowled',
                        'atp', 'wta', 'paralympics', 'खेल', 'क्रिकेट', 'स्टेडियम',
                        'ओलिंपिक', 'फुटबॉल', 'हॉकी', 'बैडमिंटन', 'कुश्ती',
                        'बल्लेबाज', 'गेंदबाज', 'khiladi', 'pahalwan',
                        // Entertainment & Movies
                        'movie', 'movies', 'film', 'films', 'cinema', 'bollywood', 'hollywood',
                        'tollywood', 'kollywood', 'box office', 'ott', 'netflix', 'amazon prime',
                        'disney+', 'hotstar', 'zee5', 'sonyliv', 'web series', 'tv show', 'tv serial',
                        'actor', 'actress', 'celebrity', 'celeb', 'star', 'stars', 'director', 'producer',
                        'trailer', 'teaser', 'review', 'release date', 'song', 'album', 'music video',
                        'award show', 'filmfare', 'iifa', 'oscars', 'grammy', 'bafta', 'cannes',
                        'red carpet', 'fashion', 'gossip', 'dating', 'breakup', 'marriage ceremony',
                        'wedding reception', 'baby shower', 'ex-boyfriend', 'ex-girlfriend',
                        'entertainment', 'showbiz', 'limelight', 'paparazzi', 'fan club',
                        'फिल्म', 'सिनेमा', 'बॉलीवुड', 'अभिनेता', 'अभिनेत्री', 'सेलिब्रिटी',
                        'मनोरंजन', 'वेब सीरीज', 'टीवी शो', 'गाना', 'संगीत',
                        // Adult / NSFW
                        'onlyfans', 'only fans', 'adult content', 'porn', 'pornography', 'xxx',
                        'nude', 'naked', 'nsfw', 'escort', 'erotic', 'erotica', 'sex tape',
                        'strip club', 'stripper', 'cam girl', 'cam model', 'sexting', 'nudes',
                        'explicit content', 'adult film', 'adult video', 'playboy', 'hooker',
                        'prostitute', 'prostitution', 'brothel', 'sex worker', 'fetish',
                        'lingerie model', 'bikini model', 'crush model', 'look like your',
                        // Gaming
                        'nintendo', 'pokemon', 'pokémon', 'game boy', 'gba', 'gameboy',
                        'playstation', 'xbox', 'ps5', 'ps4', 'switch online', 'video game',
                        'gaming', 'gamer', 'esports', 'twitch', 'steam', 'epic games',
                        'call of duty', 'fortnite', 'minecraft', 'roblox', 'valorant',
                        'league of legends', 'dota', 'mobile legends', 'bgmi', 'pubg',
                        'console game', 'rpg game', 'fps game', 'game release', 'dlc',
                        // Product Reviews & Lifestyle
                        "we've tested", "we have tested", 'best we tested', 'on sale',
                        'buyer guide', "buyer's guide", 'best buy', 'top picks', 'top 5',
                        'best coffee', 'coffee grinder', 'coffee maker', 'coffee brewer',
                        'best chairs', 'best desks', 'best laptops', 'best headphones',
                        'best earbuds', 'best tv', 'best phone', 'best camera',
                        'product review', 'hands-on review', 'unboxing', 'deal of the day',
                        'discount', 'coupon', 'promo code', 'flash sale', 'mega sale',
                        'shopping guide', 'gift guide', 'deal alert', 'limited time offer',
                        'lifestyle', 'home decor', 'interior design', 'recipe', 'cooking'
                    ];


                    const totalItemsBeforeFilter = categoryItems.flat().length;
                    const flattenedItems = categoryItems.flat()
                        .filter(item => {
                            const title = (item.title || "").toLowerCase();
                            const fullContent = (item.fullContent || "").toLowerCase();
                            const combined = `${title} ${fullContent}`;
                            const isBlocked = BLOCKED_KEYWORDS.some(keyword => combined.includes(keyword.toLowerCase()));
                            return !isBlocked;
                        })
                        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

                    console.log(`Category ${cat}: ${flattenedItems.length}/${totalItemsBeforeFilter} items remaining after filtering.`);

                    // Mark the most recent item as latest and flag items within last 3 hours as "Live"
                    if (flattenedItems.length > 0) {
                        flattenedItems[0].isLatest = true;
                        const now = new Date();
                        flattenedItems.forEach(item => {
                            const pubDate = new Date(item.pubDate);
                            const diffInMinutes = (now - pubDate) / (1000 * 60);
                            item.isLive = diffInMinutes < 180; // Published within last 3 hours
                        });
                    }

                    return {
                        category: cat,
                        items: flattenedItems
                    };
                })
            );

            const newsMap = fetchResults.reduce((acc, curr) => {
                acc[curr.category] = curr.items;
                return acc;
            }, {});

            // Per-category fallback: if a category has 0 items, fill from local data
            const formattedFallback = newsFallbackData.map(item => ({
                ...item,
                title: isHindi ? item.title_hi || item.title : item.title,
                shortDescription: isHindi ? item.shortDescription_hi || item.shortDescription : item.shortDescription,
                fullContent: isHindi ? item.fullContent_hi || item.fullContent : item.fullContent,
                isFallback: true
            }));

            const allCats = ['Tech', 'Business', 'Economy', 'Geopolitics', 'Stock'];
            allCats.forEach(cat => {
                if (!newsMap[cat] || newsMap[cat].length === 0) {
                    console.warn(`[${cat}] No live news — using local fallback.`);
                    newsMap[cat] = formattedFallback.filter(item => item.category === cat);
                }
            });

            if (isBackground) {
                // Merge: prepend genuinely new articles, keep existing ones
                setNewsData(prev => {
                    const merged = {};
                    allCats.forEach(cat => {
                        const existingItems = prev[cat] || [];
                        const existingUrls = new Set(existingItems.map(a => a.sourceUrl));
                        const newItems = (newsMap[cat] || []).filter(a => !existingUrls.has(a.sourceUrl));
                        merged[cat] = [...newItems, ...existingItems];
                    });
                    return merged;
                });
            } else {
                setNewsData(newsMap);
            }
            setError(null);

        } catch (err) {
            if (!isBackground) setError(err.message);
            console.error('Background sync failed:', err);
        } finally {
            setLoading(false);
            setSyncing(false);
            setLastUpdated(new Date());
        }
    };

    useEffect(() => {
        // Reset on language change — clear everything and refetch fresh
        seenUrls.current = new Set();
        setNewsData({});
        setLoading(true);
        setCountdown(30);
        setNewArticleCount(0);
        fetchAllNews();

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    fetchAllNews(true);
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [i18n.language]);

    const handleCategoryClick = (category) => {
        const element = document.getElementById(`category-${category}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Remove filter so all categories remain visible
            searchParams.delete('category');
            setSearchParams(searchParams);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-slate-400 font-medium animate-pulse">{t('fetching_headlines')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-red-500">{t('sync_failed')}</h2>
                    <p className="text-slate-400">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 bg-blue-600 px-6 py-2 rounded-full hover:bg-blue-500 transition-colors"
                    >
                        {t('reconnect_feed')}
                    </button>
                </div>
            </div>
        );
    }

    const allCategories = Object.keys(newsData);
    const categoriesToRender = categoryFilter
        ? allCategories.filter(cat => cat.toLowerCase() === categoryFilter.toLowerCase())
        : allCategories;


    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16 text-center">
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <div className="flex flex-col items-center gap-1">
                            <span className={`${syncing ? 'text-blue-500' : 'text-red-500'} text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-2`}>
                                {syncing ? (
                                    <>
                                        <RefreshCcw className="w-3 h-3 animate-spin text-blue-400" />
                                        {t('syncing') || 'Syncing...'}
                                    </>
                                ) : (
                                    <>
                                        <span className="flex h-2 w-2 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </span>
                                        {t('live_network')}
                                    </>
                                )}
                            </span>
                            {lastUpdated && (
                                <span className="text-slate-500 text-[10px] tracking-wider font-medium">
                                    {countdown <= 5
                                        ? 'Next sync soon.'
                                        : `Next sync in ${countdown}s.`
                                    }
                                    {' '}Last update: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                </span>
                            )}
                        </div>

                    </div>
                    <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 inline-block font-display tracking-tight text-center w-full">
                        {categoryFilter ? t(`categories.${categoryFilter.toLowerCase()}`) + ' Updates' : t('one_platform')}
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-light">
                        {categoryFilter
                            ? t('hero_subtitle_category', { category: t(`categories.${categoryFilter.toLowerCase()}`).toLowerCase() })
                            : t('hero_subtitle_default')
                        }
                    </p>
                </header>

                <div className="space-y-20">
                    {categoriesToRender.map((cat) => (
                        <div key={cat} id={`category-${cat}`} className="mb-16">
                            {/* Category Header */}
                            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                        {t(`categories.${cat.toLowerCase()}`)}
                                    </h2>
                                    {newsData[cat]?.length > 0 && (
                                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full tracking-widest uppercase">
                                            {newsData[cat].length}
                                        </span>
                                    )}
                                </div>
                                {!categoryFilter && newsData[cat]?.length > 0 && (() => {
                                    const routeMap = {
                                        Tech: '/tech', Business: '/business',
                                        Economy: '/economy', Geopolitics: '/geopolitics',
                                        Stock: '/stocks'
                                    };
                                    const route = routeMap[cat];
                                    return route ? (
                                        <Link
                                            to={route}
                                            className="text-slate-400 hover:text-blue-400 flex items-center gap-1 text-sm font-bold uppercase tracking-widest transition-colors group"
                                        >
                                            {t('view_all')}
                                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    ) : null;
                                })()}
                            </div>

                            {newsData[cat] && newsData[cat].length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {newsData[cat].slice(0, categoryFilter ? newsData[cat].length : 6).map((article, idx) => (
                                        <NewsCard key={idx} article={article} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-slate-800/20 rounded-3xl border border-slate-800/50 flex flex-col items-center">
                                    <div className="bg-slate-800/40 p-5 rounded-full mb-4 border border-slate-700/50">
                                        <ShieldAlert className="w-8 h-8 text-slate-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {t('no_news_found') || 'No News Found'}
                                    </h3>
                                    <p className="text-slate-400 max-w-sm mx-auto mb-6 text-sm">
                                        {t('no_updates', { category: t(`categories.${cat.toLowerCase()}`) })}
                                    </p>
                                    <button
                                        onClick={() => fetchAllNews()}
                                        className="bg-blue-600/10 text-blue-400 px-6 py-2 rounded-xl border border-blue-500/20 hover:bg-blue-600/20 transition-all font-bold text-xs flex items-center gap-2 uppercase tracking-widest"
                                    >
                                        <RefreshCcw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                                        {t('reconnect_feed')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
