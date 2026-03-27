import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, ShieldAlert } from 'lucide-react';

import NewsCard from '../components/NewsCard';
import newsFallbackData from '../data/newsData.json';

import { EN_CATEGORY_FEEDS, HI_CATEGORY_FEEDS, BLOCKED_KEYWORDS, CATEGORY_KEYWORDS, CATEGORY_META, normArticle, isArticleRelevant, isBlocked, parseXML, diversifySources } from '../data/feeds';


const stockNewsCache = {};

const Stocks = () => {

    const langKey = 'en';
    const cached = stockNewsCache[langKey] || [];

    const [news, setNews] = useState(cached);
    const [loading, setLoading] = useState(cached.length === 0);
    const [syncing, setSyncing] = useState(false);
    const [countdown, setCountdown] = useState(45);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchMarketNews = useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            else setSyncing(true);

            const isHindi = false;
            const allFeeds = isHindi ? HI_CATEGORY_FEEDS : EN_CATEGORY_FEEDS;
            const feeds = allFeeds['Stocks'] || [];

            // Abort slow proxies after 4 seconds
            const withTimeout = (promise, ms = 4000) =>
                Promise.race([
                    promise,
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
                ]);

            // parseXML is now imported from feeds.js

            const getShuffledProxies = () => {
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
                return [...PROXY_STRATEGIES].sort(() => Math.random() - 0.5);
            };


            // ── Progressive rendering: show articles as each feed finishes ──
            const feedPromises = feeds.map(async (feed) => {
                let result = null;
                const shuffled = getShuffledProxies();
                for (const strategy of shuffled) {
                    try { result = await strategy(feed.url); if (result) break; }
                    catch { /* try next proxy */ }
                }
                if (!result) return [];

                const articles = result.items
                    .map(item => normArticle(item, feed, result, isHindi, 'Stocks'))
                    .filter(a => isArticleRelevant(a, 'Stocks') && !isBlocked(a));

                if (articles.length > 0) {
                    setNews(prev => {
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
                                item.isLive = (now - new Date(item.pubDate)) / 60000 < 180;
                            });
                        }
                        // Save to cache so revisit is instant
                        stockNewsCache.en = diversified;
                        return diversified;
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
                    .filter(item => item.category === 'Stocks')
                    .map(item => ({
                        ...item,
                        imageUrl: item.imageUrl || CATEGORY_META.Stocks.defaultImage,
                        shortDescription: isHindi
                            ? item.shortDescription_hi || item.shortDescription
                            : item.shortDescription,
                        isFallback: true
                    }));
            });

            setLastUpdated(new Date());
        } catch (error) {
            console.error('fetchMarketNews error:', error);
        }
    }, []);

    // Scroll to top on mount / tab switch
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Reset + initial fetch on language change
    useEffect(() => {
        const langKey = 'en';
        const hasCached = (stockNewsCache[langKey] || []).length > 0;

        setCountdown(30);
        fetchMarketNews(hasCached); // background if already cached

        const timer = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [fetchMarketNews]);

    useEffect(() => {
        if (countdown <= 0) {
            setCountdown(30);
            fetchMarketNews(true);
        }
    }, [countdown, fetchMarketNews]);

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Hero Header — matches Home page category style */}
                <header className="mb-16 text-center">
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <div className="flex flex-col items-center gap-1">
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
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-7xl font-extrabold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 inline-block font-display tracking-tight text-center w-full px-2">
                        Stocks Updates
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg md:text-xl font-light px-4">
                        Real-time market intelligence — stocks, indices, IPOs, and financial developments across India and global markets.
                    </p>

                    {/* Article count bar */}
                    {news.length > 0 && (
                        <div className="mt-8 flex items-center gap-4 border-b border-slate-800 pb-4 text-left">
                            <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                            <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">Stocks</span>
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
                        const maxH = 48; // Consistent with feeds.js
                        return (now - pubDate) / 3600000 < maxH;
                    });

                    if (loading && news.length === 0) {
                        return (
                            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                <p className="text-slate-400 font-medium animate-pulse">{'Fetching market headlines...'}</p>
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
                            <h3 className="text-xl font-bold text-white mb-2">{'No Market Data Found'}</h3>
                            <p className="text-slate-400 max-w-sm mx-auto mb-6 text-sm">
                                No stock market updates found in the last 48 hours.
                            </p>
                            <button
                                onClick={() => fetchMarketNews()}
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

export default Stocks;
