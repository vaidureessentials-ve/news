import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NewsCard from '../components/NewsCard';
import { ChevronRight } from 'lucide-react';

const EN_CATEGORY_FEEDS = {
    'Tech': [
        { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms' },
        { name: 'Livemint', url: 'https://www.livemint.com/rss/technology' }
    ],
    'Business': [
        { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/news/industry/rssfeeds/13352306.cms' },
        { name: 'Business Standard', url: 'https://www.business-standard.com/rss/companies-101.rss' },
        { name: 'Business Today', url: 'https://www.businesstoday.in/rss/corporate' }
    ],
    'Economy': [
        { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/news/economy/rssfeeds/13733806.cms' },
        { name: 'Business Standard', url: 'https://www.business-standard.com/rss/economy-policy-102.rss' },
        { name: 'Livemint', url: 'https://www.livemint.com/rss/economy' }
    ],
    'Geopolitics': [
        { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/news/international/world/rssfeeds/8584773.cms' },
        { name: 'India Today', url: 'https://www.indiatoday.in/rss/1206550' },
        { name: 'ABP Live', url: 'https://news.abplive.com/news/world/rss' },
        { name: 'Livemint', url: 'https://www.livemint.com/rss/world' },
        { name: 'Hindustan Times', url: 'https://www.hindustantimes.com/rss/world/rssfeed.xml' },
        { name: 'Firstpost', url: 'https://www.firstpost.com/rss/world.xml' },
        { name: 'Business Standard', url: 'https://www.business-standard.com/rss/international-106.rss' },
        { name: 'Business Today', url: 'https://www.businesstoday.in/rss/world' }
    ]
};

const HI_CATEGORY_FEEDS = {
    'Tech': [{ name: 'Live Hindustan', url: 'https://api.livehindustan.com/feeds/rss/gadgets/rssfeed.xml' }],
    'Business': [{ name: 'Live Hindustan', url: 'https://api.livehindustan.com/feeds/rss/business/rssfeed.xml' }],
    'Economy': [{ name: 'Live Hindustan', url: 'https://api.livehindustan.com/feeds/rss/career/rssfeed.xml' }],
    'Geopolitics': [
        { name: 'Live Hindustan International', url: 'https://api.livehindustan.com/feeds/rss/international/rssfeed.xml' },
        { name: 'Daily Bhaskar', url: 'https://www.bhaskarenglish.in/feed/' }
    ]
};

const Home = () => {
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category');
    const [newsData, setNewsData] = useState({});
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

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
                            try {
                                const cacheBust = new Date().getTime();
                                const response = await fetch(
                                    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&t=${cacheBust}`
                                );
                                const data = await response.json();
                                if (data.status === 'ok') {
                                    return data.items.map((item, index) => ({
                                        id: `${cat}-${feed.name}-${index}`.replace(/\s+/g, '-').toLowerCase(),
                                        title: item.title,
                                        imageUrl: item.thumbnail || item.enclosure?.link || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800',
                                        location: isHindi ? 'भारत' : 'India',
                                        sourceName: isHindi && feed.name === 'Economic Times' ? 'इकोनॉमिक टाइम्स' : feed.name,
                                        sourceUrl: item.link,
                                        category: cat,
                                        pubDate: item.pubDate,
                                        shortDescription: item.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
                                        fullContent: item.content || item.description.replace(/<[^>]*>?/gm, ''),
                                        isLatest: false
                                    }));
                                }
                            } catch (err) {
                                console.error(`Error fetching ${feed.name}:`, err);
                            }
                            return [];
                        })
                    );

                    // Flatten and sort items by publication date
                    const SPORTS_KEYWORDS = [
                        'cricket', 'ipl', 'football', 'soccer', 'tennis', 'hockey', 'badminton', 'match', 'score', 'wicket',
                        'stadium', 'olympics', 'fifa', 'icc', 'bcci', 'basketball', 'baseball', 'rugby', 'golf', 'athletics',
                        'swimming', 'boxing', 'mma', 'ufc', 'wrestling', 'player', 'coach', 'tournament', 'championship',
                        'league', 'medal', 'trophy', 'sports', 'athlete', 'pga', 'nba', 'nfl', 'grand slam', 'wimbledon',
                        'olympic', 'squad', 'series', 'batsman', 'bowler', 'wicketkeeper', 'fielder', 'goal', 'f1', 'grand prix',
                        'premier league', 'super league', 'world cup', 't20', 'test match', 'odi', 'knockout', 'quarterfinal',
                        'semifinal', 'finalists', 'champions', 'runner-up', 'top-scorer', 'pitch', 'umpire', 'referee',
                        'over', 'boundary', 'sixer', 'four', 'century', 'half-century', 'clean-bowled', 'lbw', 'stumping',
                        'atp', 'wta', 'grand-slam', 'paralympics', 'bcci', 'fifa', 'victory', 'defeated', 'won the match',
                        'scorecard', 'playing xi', 'point table', 'points table', 'rankings', 'team india', 'indian team',
                        'खेल', 'क्रिकेट', 'मैच', 'स्कोर', 'खिलाड़ी', 'टूर्नामेंट', 'लीग', 'कप', 'मेडल', 'ट्रॉफी', 'स्टेडियम',
                        'ओलिंपिक', 'फुटबॉल', 'हॉकी', 'बैडमिंटन', 'कुश्ती', 'खिलाड़ियों', 'बल्लेबाज', 'गेंदबाज', 'जीता', 'हार',
                        'khel', 'scorecard', 'khiladi', 'pahalwan'
                    ];

                    const flattenedItems = categoryItems.flat()
                        .filter(item => {
                            const title = (item.title || "").toLowerCase();
                            const fullContent = (item.fullContent || "").toLowerCase();
                            const combined = `${title} ${fullContent}`;
                            return !SPORTS_KEYWORDS.some(keyword => combined.includes(keyword.toLowerCase()));
                        })
                        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

                    // Mark the most recent item as latest
                    if (flattenedItems.length > 0) {
                        flattenedItems[0].isLatest = true;
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

            setNewsData(newsMap);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            if (!isBackground) setError(err.message);
            console.error('Background sync failed:', err);
        } finally {
            setLoading(false);
            setSyncing(false);
        }
    };

    useEffect(() => {
        fetchAllNews();

        // Polling every 5 minutes (300,000ms)
        const interval = setInterval(() => {
            fetchAllNews(true);
        }, 300000);

        return () => clearInterval(interval);
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
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <div className="flex items-center justify-center gap-2">
                            <span className="flex h-3 w-3 relative">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${syncing ? 'bg-blue-400' : 'bg-red-400'} opacity-75`}></span>
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${syncing ? 'bg-blue-500' : 'bg-red-500'}`}></span>
                            </span>
                            <span className={`${syncing ? 'text-blue-500' : 'text-red-500'} text-sm font-bold tracking-widest uppercase`}>
                                {syncing ? t('syncing') || 'Syncing...' : t('live_network')}
                            </span>
                        </div>
                        {lastUpdated && (
                            <div className="text-slate-500 text-xs font-medium tracking-tight">
                                {t('last_updated') || 'Last Updated'}: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                        )}
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
