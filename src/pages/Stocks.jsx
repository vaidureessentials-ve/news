import React, { useState, useEffect } from 'react';
import { RefreshCcw, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import NewsCard from '../components/NewsCard';
import newsFallbackData from '../data/newsData.json';

const EN_STOCK_FEEDS = [
    { name: 'Moneycontrol', url: 'https://www.moneycontrol.com/rss/marketreports.xml' },
    { name: 'Economic Times Markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' },
    { name: 'ET Stocks', url: 'https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms' },
    { name: 'Livemint Markets', url: 'https://www.livemint.com/rss/markets' },
    { name: 'Business Standard Markets', url: 'https://www.business-standard.com/rss/markets-106.rss' },
    { name: 'Financial Express Markets', url: 'https://www.financialexpress.com/market/feed/' },
    { name: 'NDTV Profit', url: 'https://feeds.feedburner.com/ndtvprofit-latest' },
    { name: 'Business Today Markets', url: 'https://www.businesstoday.in/rss/market' },
    { name: 'HBL Markets', url: 'https://www.thehindubusinessline.com/markets/?service=rss' },
    { name: 'Yahoo Finance India', url: 'https://finance.yahoo.com/news/rssindex' }
];

const HI_STOCK_FEEDS = [
    { name: 'Live Hindustan Markets', url: 'https://api.livehindustan.com/feeds/rss/business/stock-market/rssfeed.xml' },
    { name: 'Moneycontrol Hindi', url: 'https://hindi.moneycontrol.com/rss/market-news.xml' },
    { name: 'ET Now Swadesh', url: 'https://hindi.etnownews.com/feeds/gns-etn-hindi-markets' },
    { name: 'Zee Business', url: 'https://www.zeebiz.com/rss' }
];

const DEFAULT_STOCK_IMAGE = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800';

// Keywords that block entertainment/sports articles
const BLOCKED_KEYWORDS = [
    'cricket', 'ipl', 'football', 'soccer', 'tennis', 'hockey', 'badminton',
    'wicket', 'stadium', 'olympics', 'icc', 'bcci', 'basketball', 'baseball',
    'rugby', 'golf', 'athletics', 'swimming', 'boxing', 'mma', 'ufc',
    'wrestling match', 'pga', 'nba', 'nfl', 'wimbledon', 'batsman', 'bowler',
    'playing xi', 'point table', 'scorecard', 'lbw', 'sixer',
    'atp', 'wta', 'paralympics', 'खेल', 'क्रिकेट',
    'movie', 'movies', 'film', 'films', 'cinema', 'bollywood', 'hollywood',
    'tollywood', 'kollywood', 'box office', 'ott', 'netflix', 'amazon prime',
    'disney+', 'hotstar', 'zee5', 'sonyliv', 'web series', 'tv show', 'tv serial',
    'actor', 'actress', 'celebrity', 'celeb', 'trailer', 'teaser',
    'award show', 'filmfare', 'iifa', 'oscars', 'grammy', 'bafta', 'cannes',
    'red carpet', 'fashion', 'gossip', 'dating', 'breakup',
    'entertainment', 'showbiz', 'paparazzi',
    'फिल्म', 'सिनेमा', 'बॉलीवुड', 'अभिनेता', 'अभिनेत्री', 'मनोरंजन',
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

const Stocks = () => {
    const { t, i18n } = useTranslation();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [countdown, setCountdown] = useState(45);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchMarketNews = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            else setSyncing(true);

            const isHindi = i18n.language?.startsWith('hi');
            const feeds = isHindi ? HI_STOCK_FEEDS : EN_STOCK_FEEDS;

            // Abort slow proxies after 4 seconds
            const withTimeout = (promise, ms = 4000) =>
                Promise.race([
                    promise,
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
                ]);

            // Helper: parse RSS/Atom XML into items array
            const parseXML = (xmlText) => {
                try {
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(xmlText, 'text/xml');
                    const getText = (el, tag) => el?.querySelector(tag)?.textContent?.trim() || '';
                    const rssItems = Array.from(xml.querySelectorAll('item'));
                    if (rssItems.length > 0) {
                        return rssItems.slice(0, 25).map(el => ({
                            title: getText(el, 'title'),
                            link: getText(el, 'link') || el.querySelector('link')?.getAttribute('href') || '',
                            pubDate: getText(el, 'pubDate') || getText(el, 'published') || new Date().toISOString(),
                            description: getText(el, 'description') || getText(el, 'summary') || '',
                            thumbnail: el.querySelector('thumbnail')?.getAttribute('url') || el.querySelector('enclosure')?.getAttribute('url') || ''
                        }));
                    }
                    const atomEntries = Array.from(xml.querySelectorAll('entry'));
                    return atomEntries.slice(0, 25).map(el => ({
                        title: getText(el, 'title'),
                        link: el.querySelector('link')?.getAttribute('href') || getText(el, 'link') || '',
                        pubDate: getText(el, 'published') || getText(el, 'updated') || new Date().toISOString(),
                        description: getText(el, 'summary') || getText(el, 'content') || '',
                        thumbnail: el.querySelector('thumbnail')?.getAttribute('url') || ''
                    }));
                } catch (_) { return []; }
            };

            // 4-proxy cascade with timeout
            const PROXY_STRATEGIES = [
                async (u) => {
                    const res = await withTimeout(fetch(`https://corsproxy.io/?${encodeURIComponent(u)}`, { cache: 'no-store' }));
                    const xml = await res.text();
                    const items = parseXML(xml);
                    return items.length > 0 ? { items, isJson: false } : null;
                },
                async (u) => {
                    const res = await withTimeout(fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(u)}&t=${Date.now()}`, { cache: 'no-store' }));
                    const json = await res.json();
                    const items = parseXML(json.contents || '');
                    return items.length > 0 ? { items, isJson: false } : null;
                },
                async (u) => {
                    const res = await withTimeout(fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(u)}&count=25&nocache=${Math.random().toString(36).slice(2)}`));
                    const json = await res.json();
                    return json.status === 'ok' && json.items?.length > 0 ? { items: json.items, isJson: true } : null;
                },
                async (u) => {
                    const res = await withTimeout(fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(u)}&count=25`));
                    const json = await res.json();
                    return json.status === 'ok' && json.items?.length > 0 ? { items: json.items, isJson: true } : null;
                }
            ];

            // Stock-safe block list — only hard non-financial junk
            const STOCK_BLOCK_KEYWORDS = [
                'cricket', 'ipl', 'football', 'soccer', 'tennis', 'hockey', 'badminton',
                'bollywood', 'hollywood', 'tollywood', 'box office', 'ott', 'netflix',
                'amazon prime', 'disney+', 'hotstar', 'web series', 'tv serial',
                'celebrity', 'celeb', 'award show', 'filmfare', 'grammy', 'oscars',
                'gossip', 'breakup', 'wedding reception', 'onlyfans', 'only fans',
                'adult content', 'porn', 'xxx', 'nude', 'naked', 'nsfw', 'escort',
                'strip club', 'cam girl', 'sexting', 'explicit content', 'adult film',
                'nintendo', 'pokemon', 'playstation', 'xbox', 'fortnite', 'minecraft',
                'esports', 'gaming', 'video game', 'unboxing', 'recipe', 'cooking',
                'home decor', 'interior design'
            ];

            const isBlocked = (article) => {
                const text = `${article.title} ${article.shortDescription}`.toLowerCase();
                return STOCK_BLOCK_KEYWORDS.some(kw => text.includes(kw));
            };

            // ── Progressive rendering: show articles as each feed finishes ──
            const feedPromises = feeds.map(async (feed) => {
                let result = null;
                for (const strategy of PROXY_STRATEGIES) {
                    try { result = await strategy(feed.url); if (result) break; }
                    catch (_) { /* try next proxy */ }
                }
                if (!result) return [];

                const articles = result.items.map((item, index) => {
                    const description = (result.isJson ? item.description : item.description) || '';
                    const thumbnail = result.isJson
                        ? (item.thumbnail || item.enclosure?.link || '')
                        : (item.thumbnail || '');
                    return {
                        id: `stock-${feed.name}-${index}`.replace(/\s+/g, '-').toLowerCase(),
                        title: item.title || '',
                        imageUrl: thumbnail || DEFAULT_STOCK_IMAGE,
                        sourceName: feed.name,
                        sourceUrl: result.isJson ? item.link : item.link,
                        category: 'Stock',
                        location: isHindi ? 'भारत' : 'India',
                        pubDate: item.pubDate || new Date().toISOString(),
                        shortDescription: description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
                        fullContent: description.replace(/<[^>]*>?/gm, ''),
                        isLatest: false,
                        isLive: false
                    };
                }).filter(a => !isBlocked(a));

                if (articles.length > 0) {
                    setNews(prev => {
                        const existingUrls = new Set(prev.map(a => a.sourceUrl));
                        const fresh = articles.filter(a => !existingUrls.has(a.sourceUrl));
                        if (fresh.length === 0) return prev;
                        const merged = [...prev, ...fresh];
                        merged.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
                        if (merged.length > 0) {
                            merged[0].isLatest = true;
                            const now = new Date();
                            merged.forEach(item => {
                                item.isLive = (now - new Date(item.pubDate)) / 60000 < 180;
                            });
                        }
                        return merged;
                    });
                    // Hide spinner as soon as the first feed responds
                    setLoading(false);
                }

                return articles;
            });

            await Promise.allSettled(feedPromises);

            // Fallback only if completely empty after all feeds
            setNews(prev => {
                if (prev.length > 0) return prev;
                return newsFallbackData
                    .filter(item => item.category === 'Stock')
                    .map(item => ({
                        ...item,
                        imageUrl: item.imageUrl || DEFAULT_STOCK_IMAGE,
                        shortDescription: isHindi
                            ? item.shortDescription_hi || item.shortDescription
                            : item.shortDescription
                    }));
            });

            setLastUpdated(new Date());
        } catch (error) {
            console.error('fetchMarketNews error:', error);
        } finally {
            setLoading(false);
            setSyncing(false);
        }
    };

    // Scroll to top on mount / tab switch
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Reset + initial fetch on language change
    useEffect(() => {
        setNews([]);
        setLoading(true);
        setCountdown(45);
        fetchMarketNews();

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    fetchMarketNews(true);
                    return 45;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [i18n.language]);

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Hero Header — matches Home page category style */}
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
                                        {t('live_network') || 'Live: GFS Global Network'}
                                    </>
                                )}
                            </span>
                            {lastUpdated && (
                                <span className="text-slate-500 text-[10px] tracking-wider font-medium">
                                    {countdown <= 5 ? 'Next sync soon.' : `Next sync in ${countdown}s.`}
                                    {' '}Last update: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                </span>
                            )}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 inline-block font-display tracking-tight text-center w-full">
                        {t('categories.stock')} Updates
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-light">
                        Real-time market intelligence — stocks, indices, IPOs, and financial developments across India and global markets.
                    </p>

                    {/* Article count bar */}
                    {news.length > 0 && (
                        <div className="mt-8 flex items-center gap-4 border-b border-slate-800 pb-4 text-left">
                            <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                            <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">{t('categories.stock')}</span>
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full tracking-widest uppercase">
                                {news.length}
                            </span>
                        </div>
                    )}
                </header>

                {/* News Grid */}
                {loading && news.length === 0 ? (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="text-slate-400 font-medium animate-pulse">{t('fetching_headlines') || 'Fetching market headlines...'}</p>
                    </div>
                ) : news.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {news.map((article, idx) => (
                            <NewsCard key={article.sourceUrl || idx} article={article} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-800/10 rounded-3xl border border-slate-800/50">
                        <div className="bg-slate-800/50 p-6 rounded-full mb-6 border border-slate-700/50">
                            <ShieldAlert className="w-10 h-10 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{t('no_news_found') || 'No Market Data Found'}</h3>
                        <p className="text-slate-400 max-w-sm mx-auto mb-6 text-sm">
                            Our market scanners are syncing. Please wait for the next cycle.
                        </p>
                        <button
                            onClick={() => fetchMarketNews()}
                            className="bg-blue-600/20 text-blue-400 px-6 py-2 rounded-xl border border-blue-500/20 hover:bg-blue-600/30 transition-all font-bold text-xs flex items-center gap-2 uppercase tracking-widest"
                        >
                            <RefreshCcw className="w-3 h-3" />
                            {t('reconnect_feed')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Stocks;
