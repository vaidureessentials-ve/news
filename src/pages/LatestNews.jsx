import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, ShieldAlert } from 'lucide-react';

import NewsCard from '../components/NewsCard';
import newsFallbackData from '../data/newsData.json';
import { EN_CATEGORY_FEEDS, HI_CATEGORY_FEEDS, CATEGORY_META, normArticle, isArticleRelevant, isBlocked, parseXML, diversifySources } from '../data/feeds';

const withTimeout = (promise, ms = 4000) =>
    Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ]);

const getShuffledProxies = () => {
    const PROXY_STRATEGIES = [
        async (u) => {
            const res = await withTimeout(fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(u)}`));
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

const LatestNews = () => {

    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const meta = CATEGORY_META.Latest;



    const fetchAllNewsData = useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            else setSyncing(true);

            const isHindi = false;
            const allFeeds = isHindi ? HI_CATEGORY_FEEDS : EN_CATEGORY_FEEDS;
            const categories = Object.keys(allFeeds);

            const categoryPromises = categories.map(async (category) => {
                const feeds = allFeeds[category] || [];
                const feedPromises = feeds.map(async (feed) => {
                    let result = null;
                    const shuffled = getShuffledProxies();
                    for (const strategy of shuffled) {
                        try { result = await strategy(feed.url); if (result) break; }
                        catch (e) { /* ignore and try next */ }
                    }
                    if (!result) return [];

                    const normalized = result.items
                        .map(item => normArticle(item, feed, result, isHindi, category))
                        .filter(a => isArticleRelevant(a, category) && !isBlocked(a));

                    return normalized;
                });

                const results = await Promise.allSettled(feedPromises);
                const fetchedArticles = results
                    .filter(res => res.status === 'fulfilled')
                    .flatMap(res => res.value);

                if (fetchedArticles.length > 0) {
                    setNews(prev => {
                        const merged = [...prev, ...fetchedArticles];
                        const unique = merged.filter((v, i, arr) =>
                            arr.findIndex(x => x.sourceUrl === v.sourceUrl) === i
                        );
                        return diversifySources(unique);
                    });
                    if (!isBackground) setLoading(false);
                }
            });

            // ── Execute categories sequentially to avoid rate-limiting ──────────────
            for (const categoryPromise of categoryPromises) {
                await categoryPromise;
                await new Promise(resolve => setTimeout(resolve, 800));
            }

            setNews(prev => {
                if (prev.length > 0) return prev;
                return (newsFallbackData || []).map(item => ({
                    ...item,
                    imageUrl: item.imageUrl || CATEGORY_META[item.category]?.defaultImage || CATEGORY_META.Tech.defaultImage,
                    shortDescription: isHindi ? item.shortDescription_hi || item.shortDescription : item.shortDescription,
                    isFallback: true
                }));
            });

        } catch (err) {
            console.error('Fetch Latest News error:', err);
        } finally {
            setLoading(false);
            setSyncing(false);
        }
    }, ['en']);

    useEffect(() => {
        fetchAllNewsData();
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const timer = setInterval(() => {
            fetchAllNewsData(true);
        }, 300000); // Fetch every 5 minutes

        return () => clearInterval(timer);
    }, [fetchAllNewsData]);



    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="w-full max-w-screen-2xl mx-auto">
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
                                    LIVE DASHBOARD
                                </>
                            )}
                        </span>
                    </div>

                    <h1 className={`text-3xl sm:text-4xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r ${meta.gradient} inline-block font-display tracking-tight text-center w-full px-2`}>
                        Latest Updates
                    </h1>
                </header>

                {(() => {
                    const filteredNews = news.filter(a => {
                        if (a.isFallback) return true;
                        const pubDate = new Date(a.pubDate);
                        if (isNaN(pubDate.getTime())) return false;
                        return (new Date() - pubDate) / 3600000 < 24;
                    });

                    // Fallback removed per user request

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
                                No recent articles found from our live news network.
                            </p>
                            <button
                                onClick={() => fetchAllNewsData()}
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

export default LatestNews;
