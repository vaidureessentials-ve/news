import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, ShieldAlert } from 'lucide-react';

import NewsCard from '../components/NewsCard';
import newsFallbackData from '../data/newsData.json';
import { EN_CATEGORY_FEEDS, HI_CATEGORY_FEEDS, BLOCKED_KEYWORDS, CATEGORY_KEYWORDS, CATEGORY_META, normArticle, isArticleRelevant, isBlocked, parseXML, diversifySources } from '../data/feeds';

// 4-proxy cascade (shared logic)
// parseXML is now imported from feeds.js

// Abort slow proxies after 4 seconds
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
        const res = await withTimeout(fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`, { cache: 'no-store' }));
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
        const res = await withTimeout(fetch(`https://corsproxy.io/?${encodeURIComponent(u)}`, { cache: 'no-store' }));
        const xml = await res.text();
        const items = parseXML(xml);
        return items.length > 0 ? { items, isJson: false } : null;
    }
];

// Module-level cache — survives navigation within the same browser session
const newsCache = {};

const CategoryPage = ({ category }) => {

    const langCode = false ? 'hi' : 'en';
    const initialCacheKey = `${category}-${langCode}`;
    const cached = newsCache[initialCacheKey] || [];

    const [news, setNews] = useState(cached);
    const [loading, setLoading] = useState(cached.length === 0);
    const [syncing, setSyncing] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [lastUpdated, setLastUpdated] = useState(null);

    const meta = CATEGORY_META[category] || CATEGORY_META['Tech'];

    const activeCategoryRef = React.useRef(category);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        activeCategoryRef.current = category;
    }, [category]);


    const fetchNews = useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            else setSyncing(true);

            const currentLang = 'en';
            const isHindi = currentLang.startsWith('hi');
            const langCode = isHindi ? 'hi' : 'en';
            const allFeeds = isHindi ? HI_CATEGORY_FEEDS : EN_CATEGORY_FEEDS;
            const feeds = allFeeds[category] || [];
            const currentCacheKey = `${category}-${langCode}`;

            // ── Progressive rendering: update state as each feed resolves ──
            const feedPromises = feeds.map(async (feed) => {
                let result = null;
                for (const strategy of PROXY_STRATEGIES) {
                    try { result = await strategy(feed.url); if (result) break; }
                    catch { /* try next proxy */ }
                }
                if (!result) return [];

                const articles = result.items
                    .map(item => normArticle(item, feed, result, isHindi, category))
                    .filter(a => isArticleRelevant(a, category) && !isBlocked(a));

                if (articles.length > 0) {
                    // Show articles immediately as this feed completes
                    setNews(prev => {
                        // Crucial check: Prevent stale closure leak if user has navigated to another tab
                        if (activeCategoryRef.current !== category) return prev;

                        const existingUrls = new Set(prev.map(a => a.sourceUrl));
                        const fresh = articles.filter(a => !existingUrls.has(a.sourceUrl));
                        if (fresh.length === 0) return prev;
                        const merged = [...prev, ...fresh];
                        merged.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
                        const diversified = diversifySources(merged);
                        if (diversified.length > 0) {
                            diversified[0].isLatest = true;
                            const now = new Date();
                            diversified.forEach(item => {
                                const pub = new Date(item.pubDate);
                                if (!isNaN(pub.getTime())) {
                                    item.isLive = (now - pub) / (1000 * 60) < 180;
                                }
                            });
                        }
                        // Save to correct cache key
                        newsCache[currentCacheKey] = diversified;
                        return diversified;
                    });
                    // Hide spinner as soon as first articles arrive
                    setLoading(false);
                }

                return articles;
            });

            await Promise.allSettled(feedPromises);

            // Fallback if still nothing after all feeds
            setNews(prev => {
                if (activeCategoryRef.current !== category) return prev;
                if (prev.length > 0) return prev;
                const fallback = newsFallbackData
                    .filter(item => item.category === category)
                    .map(item => ({
                        ...item,
                        imageUrl: item.imageUrl || meta.defaultImage,
                        shortDescription: isHindi ? item.shortDescription_hi || item.shortDescription : item.shortDescription,
                        isFallback: true
                    }));

                if (fallback.length > 0) {
                    newsCache[currentCacheKey] = fallback;
                }
                return fallback;
            });

            setLastUpdated(new Date());
        } catch (err) {
            console.error(`[${category}] fetchNews error:`, err);
        } finally {
            setLoading(false);
            setSyncing(false);
        }
    }, [category, 'en', meta.defaultImage]);

    // Re-fetch when category or language changes
    useEffect(() => {
        const langCode = false ? 'hi' : 'en';
        const key = `${category}-${langCode}`;
        const hasCached = (newsCache[key] || []).length > 0;

        if (!hasCached) {
            setNews([]);
            setLoading(true);
        } else {
            setNews(newsCache[key]);
            setLoading(false);
        }
        setCountdown(30);
        fetchNews(hasCached);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    fetchNews(true);
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [category, fetchNews]);
    const categoryLabel = category;

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-screen-2xl mx-auto">

                {/* Hero Header */}
                <header className="mb-16 text-center">
                    <div className="flex flex-col items-center gap-1 mb-4">
                        <span className={`${syncing ? 'text-blue-500' : 'text-red-500'} text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-2`}>
                            {syncing ? (
                                <>
                                    <RefreshCcw className="w-3 h-3 animate-spin text-blue-400" />
                                    {'Syncing...'}
                                </>
                            ) : (
                                <>
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                    {'Live: GFS Global Network'}
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

                    <h1 className={`text-4xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r ${meta.gradient} inline-block font-display tracking-tight text-center w-full`}>
                        {categoryLabel} Updates
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-light">
                        {meta.subtitle}
                    </p>

                    {/* Article count bar */}
                    {news.length > 0 && (
                        <div className="mt-8 flex items-center gap-4 border-b border-slate-800 pb-4 text-left">
                            <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                            <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">{categoryLabel}</span>
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full tracking-widest uppercase">
                                {news.length}
                            </span>
                        </div>
                    )}

                </header>

                {/* News Grid */}
                {(() => {
                    const now = new Date();
                    const filteredNews = news.filter(a => {
                        if (a.isFallback) return true;
                        const pubDate = new Date(a.pubDate);
                        if (isNaN(pubDate.getTime())) return true;
                        return (now - pubDate) / 3600000 < 24; // Strictly 24 hours
                    });

                    if (loading && news.length === 0) {
                        return (
                            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                <p className="text-slate-400 font-medium animate-pulse">{'Fetching headlines...'}</p>
                            </div>
                        );
                    }

                    if (filteredNews.length > 0) {
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredNews
                                    .map((article, idx) => (
                                        <div key={article.sourceUrl || idx} className="relative group">
                                            {article.isFallback && (
                                                <div className="absolute top-4 right-4 z-10">
                                                    <span className="bg-slate-800/90 text-slate-400 text-[10px] font-bold px-2 py-1 rounded shadow-lg border border-slate-700/50 flex items-center gap-1 backdrop-blur-sm">
                                                        <ShieldAlert className="w-3 h-3" />
                                                        {'FEATURED'}
                                                    </span>
                                                </div>
                                            )}
                                            <NewsCard article={article} />
                                        </div>
                                    ))}
                            </div>
                        );
                    }

                    return (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-800/10 rounded-3xl border border-slate-800/50">
                            <div className="bg-slate-800/50 p-6 rounded-full mb-6 border border-slate-700/50">
                                <ShieldAlert className="w-10 h-10 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{'No Articles Found'}</h3>
                            <p className="text-slate-400 max-w-sm mx-auto mb-6 text-sm">
                                No articles from the last 24 hours found for {categoryLabel}.
                            </p>
                            <button
                                onClick={() => fetchNews()}
                                className="bg-blue-600/20 text-blue-400 px-6 py-2 rounded-xl border border-blue-500/20 hover:bg-blue-600/30 transition-all font-bold text-xs flex items-center gap-2 uppercase tracking-widest"
                            >
                                <RefreshCcw className="w-3 h-3" />
                                Reconnect Feed
                            </button>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default CategoryPage;
