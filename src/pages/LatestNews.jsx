import React, { useState, useEffect } from 'react';
import { RefreshCcw, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import NewsCard from '../components/NewsCard';
import { EN_CATEGORY_FEEDS, HI_CATEGORY_FEEDS, CATEGORY_META, normArticle, isArticleRelevant, isBlocked } from '../data/feeds';

const LatestNews = () => {
    const { t, i18n } = useTranslation();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const meta = CATEGORY_META.Latest;

    // 4-proxy cascade (shared logic)
    const parseXML = (xmlText) => {
        try {
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, 'text/xml');
            const getText = (el, tag) => el?.querySelector(tag)?.textContent?.trim() || '';
            const rssItems = Array.from(xml.querySelectorAll('item'));
            if (rssItems.length > 0) {
                return rssItems.slice(0, 15).map(el => ({
                    title: getText(el, 'title'),
                    link: getText(el, 'link') || el.querySelector('link')?.getAttribute('href') || '',
                    pubDate: getText(el, 'pubDate') || getText(el, 'published') || new Date().toISOString(),
                    description: getText(el, 'description') || getText(el, 'summary') || '',
                    thumbnail: el.querySelector('thumbnail')?.getAttribute('url') || el.querySelector('enclosure')?.getAttribute('url') || ''
                }));
            }
            const atomEntries = Array.from(xml.querySelectorAll('entry'));
            return atomEntries.slice(0, 15).map(el => ({
                title: getText(el, 'title'),
                link: el.querySelector('link')?.getAttribute('href') || getText(el, 'link') || '',
                pubDate: getText(el, 'published') || getText(el, 'updated') || new Date().toISOString(),
                description: getText(el, 'summary') || getText(el, 'content') || '',
                thumbnail: el.querySelector('thumbnail')?.getAttribute('url') || ''
            }));
        } catch (_) { return []; }
    };

    const withTimeout = (promise, ms = 4000) =>
        Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
        ]);

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
            const res = await withTimeout(fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(u)}&count=15&nocache=${Math.random().toString(36).slice(2)}`));
            const json = await res.json();
            return json.status === 'ok' && json.items?.length > 0 ? { items: json.items, isJson: true } : null;
        }
    ];

    const fetchAllNews = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            else setSyncing(true);

            const isHindi = i18n.language?.startsWith('hi');
            const allFeeds = isHindi ? HI_CATEGORY_FEEDS : EN_CATEGORY_FEEDS;
            const categories = Object.keys(allFeeds);

            let allArticles = [];

            const categoryPromises = categories.map(async (category) => {
                const feeds = allFeeds[category] || [];
                // Just take the top 2 feeds from each category to avoid overwhelming
                const selectedFeeds = feeds.slice(0, 2);

                const feedPromises = selectedFeeds.map(async (feed) => {
                    let result = null;
                    for (const strategy of PROXY_STRATEGIES) {
                        try { result = await strategy(feed.url); if (result) break; }
                        catch (_) { }
                    }
                    if (!result) return [];

                    const normalized = result.items
                        .map(item => normArticle(item, feed, result, isHindi, category, CATEGORY_META[category].defaultImage))
                        .filter(a => isArticleRelevant(a, category) && !isBlocked(a));

                    return normalized;
                });

                const results = await Promise.allSettled(feedPromises);
                results.forEach(res => {
                    if (res.status === 'fulfilled') {
                        allArticles = [...allArticles, ...res.value];
                    }
                });
            });

            await Promise.allSettled(categoryPromises);

            // Sort and unique
            const uniqueArticles = allArticles
                .filter((v, i, a) => a.findIndex(t => (t.sourceUrl === v.sourceUrl)) === i)
                .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

            setNews(uniqueArticles);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Fetch Latest News error:', err);
        } finally {
            setLoading(false);
            setSyncing(false);
        }
    };

    useEffect(() => {
        fetchAllNews();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [i18n.language]);

    const filteredNews = news;

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16 text-center">
                    <div className="flex flex-col items-center gap-1 mb-4">
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
                                    LIVE DASHBOARD
                                </>
                            )}
                        </span>
                    </div>

                    <h1 className={`text-4xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r ${meta.gradient} inline-block font-display tracking-tight text-center w-full`}>
                        {t('categories.latest') || 'Latest'} Updates
                    </h1>
                </header>

                {loading ? (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="text-slate-400 font-medium animate-pulse">Syncing Global Feeds...</p>
                    </div>
                ) : filteredNews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredNews.map((article, idx) => (
                            <NewsCard key={article.sourceUrl || idx} article={article} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-slate-800">
                        <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Articles Found</h3>
                        <p className="text-slate-400">Please check back later for live updates.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LatestNews;
