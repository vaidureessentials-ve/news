import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NewsCard from '../components/NewsCard';
import { ChevronRight } from 'lucide-react';

const EN_CATEGORY_FEEDS = {
    'Tech': 'https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms',
    'Business': 'https://economictimes.indiatimes.com/news/industry/rssfeeds/13352306.cms',
    'Economy': 'https://economictimes.indiatimes.com/news/economy/rssfeeds/13733806.cms',
    'International': 'https://economictimes.indiatimes.com/news/international/world/rssfeeds/8584773.cms',
    'Geopolitics': 'https://economictimes.indiatimes.com/news/politics/rssfeeds/16462970.cms'
};

const HI_CATEGORY_FEEDS = {
    'Tech': 'https://api.livehindustan.com/feeds/rss/gadgets/rssfeed.xml',
    'Business': 'https://api.livehindustan.com/feeds/rss/business/rssfeed.xml',
    'Economy': 'https://api.livehindustan.com/feeds/rss/career/rssfeed.xml',
    'International': 'https://api.livehindustan.com/feeds/rss/international/rssfeed.xml',
    'Geopolitics': 'https://api.livehindustan.com/feeds/rss/national/rssfeed.xml'
};

const Home = () => {
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category');
    const [newsData, setNewsData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllNews = async () => {
            try {
                setLoading(true);
                const currentLanguage = i18n.language || 'en';
                const isHindi = currentLanguage.startsWith('hi');
                const currentFeeds = isHindi ? HI_CATEGORY_FEEDS : EN_CATEGORY_FEEDS;
                const categories = Object.keys(currentFeeds);

                const fetchResults = await Promise.all(
                    categories.map(async (cat) => {
                        const cacheBust = new Date().getTime();
                        const response = await fetch(
                            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(currentFeeds[cat])}&t=${cacheBust}`
                        );
                        const data = await response.json();
                        if (data.status === 'ok') {
                            return {
                                category: cat,
                                items: data.items.map((item, index) => ({
                                    id: `${cat}-${index}`,
                                    title: item.title,
                                    imageUrl: item.thumbnail || item.enclosure?.link || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800',
                                    location: isHindi ? 'भारत' : 'India',
                                    sourceName: isHindi ? 'इकोनॉमिक टाइम्स' : 'Economic Times',
                                    sourceUrl: item.link,
                                    category: cat,
                                    shortDescription: item.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
                                    fullContent: item.content || item.description.replace(/<[^>]*>?/gm, ''),
                                    isLatest: index === 0
                                }))
                            };
                        }
                        return { category: cat, items: [] };
                    })
                );

                const newsMap = fetchResults.reduce((acc, curr) => {
                    acc[curr.category] = curr.items;
                    return acc;
                }, {});

                setNewsData(newsMap);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllNews();
    }, [i18n.language]);

    const handleCategoryClick = (category) => {
        searchParams.set('category', category);
        setSearchParams(searchParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const categoriesToRender = categoryFilter ? [categoryFilter] : Object.keys(newsData);

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span className="text-red-500 text-sm font-bold tracking-widest uppercase">{t('live_network')}</span>
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
                        <section key={cat} id={cat.toLowerCase()} className="relative">
                            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                        {t(`categories.${cat.toLowerCase()}`)}
                                    </h2>
                                </div>
                                {!categoryFilter && (
                                    <button
                                        onClick={() => handleCategoryClick(cat)}
                                        className="text-slate-400 hover:text-blue-400 flex items-center gap-1 text-sm font-bold uppercase tracking-widest transition-colors group"
                                    >
                                        {t('view_all')}
                                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {(newsData[cat] || []).slice(0, categoryFilter ? newsData[cat].length : 3).map((article) => (
                                    <NewsCard key={article.id} article={article} />
                                ))}
                            </div>

                            {(!newsData[cat] || newsData[cat].length === 0) && (
                                <div className="text-center py-10 bg-slate-800/30 rounded-2xl border border-slate-800">
                                    <p className="text-slate-500 italic">{t('no_updates', { category: t(`categories.${cat.toLowerCase()}`) })}</p>
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
