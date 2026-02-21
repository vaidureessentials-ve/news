import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RefreshCcw, ChevronRight, ShieldAlert } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import newsFallbackData from '../data/newsData.json';

import { EN_CATEGORY_FEEDS, HI_CATEGORY_FEEDS, BLOCKED_KEYWORDS, CATEGORY_KEYWORDS } from '../data/feeds';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';

// Module-level cache — persists across navigations within the same session
const homeNewsCache = {};

const Home = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category');
    const lk = i18n.language?.startsWith('hi') ? 'hi' : 'en';
    const cached = homeNewsCache[lk] || {};

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

    const fetchAllNews = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            else setSyncing(true);

            const isHindi = i18n.language?.startsWith('hi');
            const currentFeeds = isHindi ? HI_CATEGORY_FEEDS : EN_CATEGORY_FEEDS;
            const allCats = Object.keys(currentFeeds);

            // 4-second timeout per proxy
            const withTimeout = (promise, ms = 4000) =>
                Promise.race([
                    promise,
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
                ]);

            const parseXML = (xmlText) => {
                try {
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(xmlText, 'text/xml');
                    const getText = (el, tag) => el?.querySelector(tag)?.textContent?.trim() || '';
                    const rssItems = Array.from(xml.querySelectorAll('item'));
                    if (rssItems.length > 0) {
                        return rssItems.slice(0, 20).map(el => ({
                            title: getText(el, 'title'),
                            link: getText(el, 'link') || el.querySelector('link')?.getAttribute('href') || '',
                            pubDate: getText(el, 'pubDate') || getText(el, 'published') || new Date().toISOString(),
                            description: getText(el, 'description') || getText(el, 'summary') || '',
                            content: getText(el, 'encoded') || getText(el, 'content') || getText(el, 'description') || '',
                            thumbnail: el.querySelector('thumbnail')?.getAttribute('url') || el.querySelector('enclosure')?.getAttribute('url') || ''
                        }));
                    }
                    const atomEntries = Array.from(xml.querySelectorAll('entry'));
                    return atomEntries.slice(0, 20).map(el => ({
                        title: getText(el, 'title'),
                        link: el.querySelector('link')?.getAttribute('href') || getText(el, 'link') || '',
                        pubDate: getText(el, 'published') || getText(el, 'updated') || new Date().toISOString(),
                        description: getText(el, 'summary') || getText(el, 'content') || '',
                        content: getText(el, 'content') || getText(el, 'summary') || '',
                        thumbnail: el.querySelector('thumbnail')?.getAttribute('url') || ''
                    }));
                } catch (_) { return []; }
            };

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
                    const res = await withTimeout(fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(u)}&count=20&nocache=${Math.random().toString(36).slice(2)}`));
                    const json = await res.json();
                    return json.status === 'ok' && json.items?.length > 0 ? { items: json.items, isJson: true } : null;
                },
                async (u) => {
                    const res = await withTimeout(fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(u)}&count=20`));
                    const json = await res.json();
                    return json.status === 'ok' && json.items?.length > 0 ? { items: json.items, isJson: true } : null;
                }
            ];

            const isArticleRelevant = (item, cat) => {
                const keywords = CATEGORY_KEYWORDS[cat] || [];
                if (keywords.length === 0) return true;
                const text = `${item.title} ${item.description || ''} ${item.content || ''}`.toLowerCase();
                return keywords.some(kw => text.includes(kw.toLowerCase()));
            };

            const isArticleBlocked = (item) => {
                const text = `${item.title} ${item.shortDescription || ''}`.toLowerCase();
                return BLOCKED_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
            };

            // ── Per-category fetch ──────────────────────────────────────────────────
            const catPromises = allCats.map(async (cat) => {
                const feeds = currentFeeds[cat] || [];
                let catArticles = [];

                const feedPromises = feeds.map(async (feed) => {
                    let result = null;
                    for (const strategy of PROXY_STRATEGIES) {
                        try { result = await strategy(feed.url); if (result) break; }
                        catch (_) { /* try next proxy */ }
                    }
                    if (!result) return;

                    const sourceKey = feed.name.toLowerCase().replace(/\s+/g, '_');
                    const localizedSource = t(`sources.${sourceKey}`);
                    const sourceName = localizedSource && localizedSource !== `sources.${sourceKey}`
                        ? localizedSource
                        : (isHindi && feed.name === 'Economic Times' ? 'इकोनॉमिक टाइम्स' : feed.name);

                    const articles = result.items.map((item, index) => {
                        const description = result.isJson ? (item.description || '') : (item.description || '');
                        const content = result.isJson ? (item.content || item.description || '') : (item.content || item.description || '');
                        const thumbnail = result.isJson
                            ? (item.thumbnail || item.enclosure?.link || '')
                            : (item.thumbnail || '');
                        return {
                            id: `${cat}-${feed.name}-${index}`.replace(/\s+/g, '-').toLowerCase(),
                            title: item.title || '',
                            imageUrl: thumbnail || DEFAULT_IMG,
                            location: isHindi ? 'भारत' : 'India',
                            sourceName,
                            sourceUrl: result.isJson ? item.link : item.link,
                            category: cat,
                            pubDate: item.pubDate || new Date().toISOString(),
                            shortDescription: description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
                            fullContent: content.replace(/<[^>]*>?/gm, ''),
                            isLatest: false, isLive: false,
                            description, content // temporary for relevance check
                        };
                    }).filter(a => isArticleRelevant(a, cat) && !isArticleBlocked(a));

                    if (articles.length === 0) return;
                    catArticles = [...catArticles, ...articles];

                    // ── INITIAL LOAD ONLY: progressively show articles as feeds come in ──
                    if (!isBackground) {
                        const sorted = [...catArticles]
                            .filter((v, i, arr) => arr.findIndex(x => x.sourceUrl === v.sourceUrl) === i)
                            .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
                        if (sorted.length > 0) {
                            sorted[0].isLatest = true;
                            const now = new Date();
                            sorted.forEach(item => { item.isLive = (now - new Date(item.pubDate)) / 60000 < 180; });
                        }
                        setNewsData(prev => {
                            const updated = { ...prev, [cat]: sorted };
                            const cLk = isHindi ? 'hi' : 'en';
                            homeNewsCache[cLk] = updated;
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
                            if (merged.length > 0) {
                                merged[0].isLatest = true;
                                const now = new Date();
                                merged.forEach(item => { item.isLive = (now - new Date(item.pubDate)) / 60000 < 180; });
                            }
                            const updated = { ...prev, [cat]: merged };
                            const cLk = isHindi ? 'hi' : 'en';
                            homeNewsCache[cLk] = updated;
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
                            shortDescription: isHindi ? item.shortDescription_hi || item.shortDescription : item.shortDescription,
                            fullContent: isHindi ? item.fullContent_hi || item.fullContent : item.fullContent,
                            isFallback: true
                        }));
                    if (fallback.length > 0) {
                        setNewsData(prev => ({ ...prev, [cat]: fallback }));
                    }
                }
            });

            await Promise.allSettled(catPromises);
            setError(null);

        } catch (err) {
            if (!isBackground) setError(err.message);
            console.error('fetchAllNews error:', err);
        } finally {
            setLoading(false);
            setSyncing(false);
            setLastUpdated(new Date());
        }
    };

    useEffect(() => {
        const langKey = i18n.language?.startsWith('hi') ? 'hi' : 'en';
        const hasCached = Object.keys(homeNewsCache[langKey] || {}).length > 0;

        if (!hasCached) {
            seenUrls.current = new Set();
            setNewsData({});
            setLoading(true);
        } else {
            setNewsData(homeNewsCache[langKey]);
            setLoading(false);
        }
        setCountdown(30);
        fetchAllNews(hasCached);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { fetchAllNews(true); return 30; }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [i18n.language]);

    const handleCategoryClick = (category) => {
        const element = document.getElementById(`category-${category}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    const isHindi = i18n.language?.startsWith('hi');
    const fixedOrder = Object.keys(isHindi ? HI_CATEGORY_FEEDS : EN_CATEGORY_FEEDS);
    const allCategories = fixedOrder.filter(cat => newsData[cat]);
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
                                    {countdown <= 5 ? 'Next sync soon.' : `Next sync in ${countdown}s.`}
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
