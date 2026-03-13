import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';

import { RefreshCcw, ChevronRight, ShieldAlert } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import newsFallbackData from '../data/newsData.json';

import { EN_CATEGORY_FEEDS, HI_CATEGORY_FEEDS, BLOCKED_KEYWORDS, CATEGORY_KEYWORDS, CATEGORY_META, normArticle, isArticleRelevant, isBlocked, parseXML, diversifySources } from '../data/feeds';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';

// Module-level cache — persists across navigations within the same session
const homeNewsCache = {};

const Home = () => {

    const location = useLocation();
    const [searchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category');
    const cached = homeNewsCache.en || {};

    const [newsData, setNewsData] = useState(cached);
    const [loading, setLoading] = useState(Object.keys(cached).length === 0);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(30);
    const [lastUpdated, setLastUpdated] = useState(null);
    const seenUrls = React.useRef(new Set());

    // Scroll to category section after navigating from another page
    useEffect(() => {
        const scrollTo = location.state?.scrollTo;
        if (!scrollTo || loading) return;
        const timer = setTimeout(() => {
            const element = document.getElementById(`category-${scrollTo}`);
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        return () => clearTimeout(timer);
    }, [location.state, loading]);

    const fetchAllNews = useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            else setSyncing(true);

            const isHindi = false;
            const currentFeeds = isHindi ? HI_CATEGORY_FEEDS : EN_CATEGORY_FEEDS;
            const allCats = Object.keys(currentFeeds);

            // 4-second timeout per proxy
            const withTimeout = (promise, ms = 4000) =>
                Promise.race([
                    promise,
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
                ]);

            // parseXML is now imported from feeds.js

            const PROXY_STRATEGIES = [
                async (u) => {
                    // rss2json is currently the most reliable for these feeds
                    const res = await withTimeout(fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(u)}&count=20&nocache=${Math.random().toString(36).slice(2)}`));
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


            // ── Per-category fetch ──────────────────────────────────────────────────
            const catPromises = allCats.map(async (cat) => {
                const feeds = currentFeeds[cat] || [];
                let catArticles = [];

                const feedPromises = feeds.map(async (feed) => {
                    let result = null;
                    for (const strategy of PROXY_STRATEGIES) {
                        try { result = await strategy(feed.url); if (result) break; }
                        catch { /* try next proxy */ }
                    }
                    if (!result) return;



                    const articles = result.items
                        .map(item => normArticle(item, feed, result, isHindi, cat))
                        .filter(a => isArticleRelevant(a, cat) && !isBlocked(a));

                    if (articles.length === 0) return;
                    catArticles = [...catArticles, ...articles];

                    // ── INITIAL LOAD ONLY: progressively show articles as feeds come in ──
                    if (!isBackground) {
                        const sorted = [...catArticles]
                            .filter((v, i, arr) => arr.findIndex(x => x.sourceUrl === v.sourceUrl) === i)
                            .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
                        const diversified = diversifySources(sorted);
                        if (diversified.length > 0) {
                            diversified[0].isLatest = true;
                            const now = new Date();
                            diversified.forEach(item => { item.isLive = (now - new Date(item.pubDate)) / 60000 < 180; });
                        }
                        setNewsData(prev => {
                            const updated = { ...prev, [cat]: diversified };
                            homeNewsCache.en = updated;
                            return updated;
                        });
                        setLoading(false);
                    }
                    // Background sync: just accumulate — don't touch state yet
                });

                await Promise.all(feedPromises);

                // ── After ALL feeds for this category finish ──────────────────────────
                if (catArticles.length > 0) {
                    const sorted = [...catArticles]
                        .filter((v, i, arr) => arr.findIndex(x => x.sourceUrl === v.sourceUrl) === i)
                        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
                    if (sorted.length > 0) {
                        sorted[0].isLatest = true;
                        const now = new Date();
                        sorted.forEach(item => { item.isLive = (now - new Date(item.pubDate)) / 60000 < 180; });
                    }

                    if (isBackground) {
                        // Merge: prepend ONLY genuinely new articles, keep existing ones intact
                        setNewsData(prev => {
                            const existing = prev[cat] || [];
                            const existingUrls = new Set(existing.map(a => a.sourceUrl));
                            const newOnly = sorted.filter(a => !existingUrls.has(a.sourceUrl));
                            if (newOnly.length === 0) return prev; // nothing new — no re-render
                            const merged = [...newOnly, ...existing]
                                .filter((v, i, arr) => arr.findIndex(x => x.sourceUrl === v.sourceUrl) === i)
                                .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
                            const diversified = diversifySources(merged);
                            if (diversified.length > 0) {
                                diversified[0].isLatest = true;
                                const now = new Date();
                                diversified.forEach(item => { item.isLive = (now - new Date(item.pubDate)) / 60000 < 180; });
                            }
                            const updated = { ...prev, [cat]: diversified };
                            homeNewsCache.en = updated;
                            return updated;
                        });
                    }
                } else if (!isBackground) {
                    // Initial load fallback if nothing came through
                    const fallback = newsFallbackData
                        .filter(item => item.category === cat)
                        .map(item => ({
                            ...item,
                            title: isHindi ? item.title_hi || item.title : item.title,
                            imageUrl: item.imageUrl || CATEGORY_META[cat]?.defaultImage,
                            shortDescription: isHindi ? item.shortDescription_hi || item.shortDescription : item.shortDescription,
                            fullContent: isHindi ? item.fullContent_hi || item.fullContent : item.fullContent,
                            isFallback: true
                        }));
                    if (fallback.length > 0) {
                        setNewsData(prev => {
                            if (prev[cat] && prev[cat].length > 0) return prev;
                            return { ...prev, [cat]: fallback };
                        });
                    }
                }
            });

            await Promise.allSettled(catPromises);

        } catch (err) {
            if (!isBackground) setError(err.message);
            console.error('fetchAllNews error:', err);
        } finally {
            // Ensure loading is false even if everything failed
            setLoading(false);
            setSyncing(false);
            setLastUpdated(new Date());
            // setError(null); // Only clear error if successful, otherwise keep it
        }
    }, []);

    useEffect(() => {
        const hasCached = Object.keys(homeNewsCache.en || {}).length > 0;
        if (!hasCached) {
            seenUrls.current = new Set();
        }
        setCountdown(30);
        fetchAllNews(hasCached);

        const timer = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [fetchAllNews]);

    useEffect(() => {
        if (countdown <= 0) {
            setCountdown(30);
            fetchAllNews(true);
        }
    }, [countdown, fetchAllNews]);




    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-slate-400 font-medium animate-pulse">'Fetching headlines...'</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-red-500">Sync Failed</h2>
                    <p className="text-slate-400">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 bg-blue-600 px-6 py-2 rounded-full hover:bg-blue-500 transition-colors"
                    >
                        Reconnect Feed
                    </button>
                </div>
            </div>
        );
    }

    const isHindi = false;
    const fixedOrder = Object.keys(isHindi ? HI_CATEGORY_FEEDS : EN_CATEGORY_FEEDS);
    const allCategories = fixedOrder;
    const categoriesToRender = categoryFilter
        ? allCategories.filter(cat => cat.toLowerCase() === categoryFilter.toLowerCase())
        : allCategories;

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="w-full max-w-screen-2xl mx-auto">
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
                    {categoryFilter ? categoryFilter + ' Updates' : 'Relevant News'}
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg md:text-xl font-light px-4">
                    {categoryFilter
                        ? `Real-time intelligence and updates for ${categoryFilter}.`
                        : 'Your command center for global business, technology, and strategic shifts.'
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
                                        {cat === 'EconomyUS' ? 'US Economy' : cat === 'EconomyEuro' ? 'Euro Economy' : cat}
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
                                        Economy: '/economy', Geopolitical: '/geopolitics',
                                        Stocks: '/stocks', EconomyUS: '/data/us', EconomyEuro: '/data/euro'
                                    };
                                    const route = routeMap[cat];
                                    return route ? (
                                        <Link
                                            to={route}
                                            className="text-slate-400 hover:text-blue-400 flex items-center gap-1 text-sm font-bold uppercase tracking-widest transition-colors group"
                                        >
                                            VIEW ALL
                                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    ) : null;
                                })()}
                            </div>

                            {(() => {
                                const now = new Date();
                                const filtered = (newsData[cat] || []).filter(a => {
                                    if (a.isFallback) return true;
                                    const pubDate = new Date(a.pubDate);
                                    if (isNaN(pubDate.getTime())) return false; // Strictly reject invalid dates
                                    const maxH = 24; // Strictly 24 hours
                                    return (now - pubDate) / 3600000 < maxH;
                                });
                                return filtered.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {filtered
                                            .slice(0, categoryFilter ? undefined : 6)
                                            .map((article, idx) => (
                                                <div key={idx} className="relative group">
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
                                ) : (
                                    <div className="text-center py-16 bg-slate-800/20 rounded-3xl border border-slate-800/50 flex flex-col items-center">
                                        <div className="bg-slate-800/40 p-5 rounded-full mb-4 border border-slate-700/50">
                                            <ShieldAlert className="w-8 h-8 text-slate-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            {'No Data Points Found'}
                                        </h3>
                                        <p className="text-slate-400 max-w-sm mx-auto mb-6 text-sm">
                                            No recent intelligence reports found for {cat}.
                                        </p>
                                        <button
                                            onClick={() => fetchAllNews()}
                                            className="bg-blue-600/10 text-blue-400 px-6 py-2 rounded-xl border border-blue-500/20 hover:bg-blue-600/20 transition-all font-bold text-xs flex items-center gap-2 uppercase tracking-widest"
                                        >
                                            <RefreshCcw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                                            Reconnect Feed
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
