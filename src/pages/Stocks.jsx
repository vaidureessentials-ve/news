import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, PieChart, ArrowUpRight, ArrowDownRight, RefreshCcw, ExternalLink, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EN_STOCK_FEEDS = [
    { name: 'Moneycontrol', url: 'https://www.moneycontrol.com/rss/marketreports.xml' },
    { name: 'Economic Times Markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' },
    { name: 'Business Today Markets', url: 'https://www.businesstoday.in/rss/market' }
];

const HI_STOCK_FEEDS = [
    { name: 'Live Hindustan Markets', url: 'https://api.livehindustan.com/feeds/rss/business/stock-market/rssfeed.xml' },
    { name: 'Moneycontrol Hindi', url: 'https://hindi.moneycontrol.com/rss/market-news.xml' }
];

const Stocks = () => {
    const { t, i18n } = useTranslation();
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [indices, setIndices] = useState([
        { name: t('stocks.nifty_50'), price: '22,212.70', change: '+94.85', percent: '+0.43%', isPositive: true },
        { name: t('stocks.sensex'), price: '73,158.24', change: '+535.15', percent: '+0.74%', isPositive: true },
        { name: t('stocks.nifty_bank'), price: '47,019.70', change: '-124.30', percent: '-0.26%', isPositive: false }
    ]);

    const [news, setNews] = useState([]);
    const [newsLoading, setNewsLoading] = useState(true);

    const [topGainers, setTopGainers] = useState([
        { symbol: 'RELIANCE', price: '2,987.50', change: '+2.4%', isPositive: true },
        { symbol: 'TCS', price: '4,120.30', change: '+1.8%', isPositive: true },
        { symbol: 'HDFC BANK', price: '1,422.10', change: '+1.2%', isPositive: true },
        { symbol: 'INFY', price: '1,634.55', change: '+0.9%', isPositive: true }
    ]);

    const [sectors, setSectors] = useState([
        { name: 'Nifty IT', change: '+1.85%', isPositive: true },
        { name: 'Nifty Bank', change: '-0.26%', isPositive: false },
        { name: 'Nifty Pharma', change: '+0.45%', isPositive: true },
        { name: 'Nifty Energy', change: '+2.10%', isPositive: true }
    ]);

    const fetchMarketNews = async () => {
        setNewsLoading(true);
        const feeds = i18n.language === 'hi' ? HI_STOCK_FEEDS : EN_STOCK_FEEDS;
        const allArticles = [];

        try {
            const results = await Promise.all(
                feeds.map(feed =>
                    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`)
                        .then(res => res.json())
                        .then(data => data.items ? data.items.map(item => ({ ...item, source: feed.name })) : [])
                        .catch(() => [])
                )
            );

            results.forEach(articles => allArticles.push(...articles));

            // Sort by pubDate and deduplicate
            const sorted = allArticles
                .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
                .filter((v, i, a) => a.findIndex(t => t.link === v.link) === i)
                .slice(0, 10);

            setNews(sorted);
        } catch (error) {
            console.error('Failed to fetch market news:', error);
        } finally {
            setNewsLoading(false);
        }
    };

    // Initial fetch and Language change fetch
    useEffect(() => {
        fetchMarketNews();
    }, [i18n.language]);

    // Simulate live market updates and poll for new news
    useEffect(() => {
        const marketInterval = setInterval(() => {
            setLastUpdated(new Date());
            setIndices(prev => prev.map(idx => {
                const currentPrice = parseFloat(idx.price.replace(/,/g, ''));
                const nudge = (Math.random() - 0.5) * 5;
                const newPrice = (currentPrice + nudge).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
                return { ...idx, price: newPrice };
            }));
        }, 5000);

        const newsInterval = setInterval(() => {
            fetchMarketNews();
        }, 60000); // Poll news every minute

        return () => {
            clearInterval(marketInterval);
            clearInterval(newsInterval);
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-green-500 text-xs font-bold uppercase tracking-widest">
                                    {t('stocks.market_open')}
                                </span>
                            </div>
                            <h1 className="text-4xl font-extrabold text-white font-display tracking-tight">
                                {t('stocks.live_markets')}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                            <RefreshCcw className="w-5 h-5 text-blue-400" />
                            <div className="text-right">
                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                    {t('last_updated')}
                                </p>
                                <p className="text-white font-mono text-sm">
                                    {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Major Indices */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {indices.map((idx) => (
                        <div key={idx.name} className="bg-slate-800/40 rounded-3xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all group backdrop-blur-md">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-slate-400 font-bold text-sm tracking-wider uppercase">{idx.name}</h3>
                                {idx.isPositive ? <TrendingUp className="text-green-400 w-5 h-5" /> : <TrendingDown className="text-red-400 w-5 h-5" />}
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-3xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                                        ₹{idx.price}
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm font-bold ${idx.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                        {idx.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                        {idx.change} ({idx.percent})
                                    </div>
                                </div>
                                <div className="h-12 w-24 bg-slate-700/20 rounded-lg flex items-center justify-center border border-slate-700/30 overflow-hidden">
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 40">
                                        <path
                                            d={idx.isPositive ? "M0 30 Q 25 20, 50 25 T 100 5" : "M0 5 Q 25 15, 50 10 T 100 35"}
                                            fill="none"
                                            stroke={idx.isPositive ? "#4ade80" : "#f87171"}
                                            strokeWidth="3"
                                            className="drop-shadow-lg"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Market Highlights - Left Column */}
                    <div className="lg:col-span-1 space-y-12">
                        {/* Trending Stocks */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <Activity className="text-blue-500 w-6 h-6" />
                                <h2 className="text-2xl font-bold text-white tracking-tight">{t('stocks.trending_now')}</h2>
                            </div>
                            <div className="bg-slate-800/30 rounded-3xl border border-slate-800 overflow-hidden backdrop-blur-sm">
                                <div className="divide-y divide-slate-800/50">
                                    {topGainers.map((stock) => (
                                        <div key={stock.symbol} className="p-5 flex items-center justify-between hover:bg-slate-800/40 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center text-white font-bold text-xs ring-1 ring-slate-600/50">
                                                    {stock.symbol[0]}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold group-hover:text-blue-400 transition-colors">{stock.symbol}</h4>
                                                    <p className="text-slate-500 text-xs font-medium">NSE India</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-mono font-bold">₹{stock.price}</p>
                                                <p className={`text-xs font-bold flex items-center justify-end gap-1 ${stock.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                                    <ArrowUpRight className="w-3 h-3" />
                                                    {stock.change}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Sector Watch */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <PieChart className="text-purple-500 w-6 h-6" />
                                <h2 className="text-2xl font-bold text-white tracking-tight">{t('stocks.sector_watch')}</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {sectors.map((sector) => (
                                    <div key={sector.name} className="bg-slate-800/40 rounded-3xl p-5 border border-slate-700/50 hover:bg-slate-800/60 transition-all flex items-center justify-between group">
                                        <div>
                                            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{sector.name}</h4>
                                            <div className={`text-xl font-bold ${sector.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                                {sector.change}
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-xl scale-95 group-hover:scale-100 transition-transform ${sector.isPositive ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                                            {sector.isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Live Market News - Center/Right Column (Spans 2 columns) */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="text-green-500 w-6 h-6" />
                                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Market Intel</h2>
                                </div>
                                {newsLoading && (
                                    <div className="flex items-center gap-2 text-blue-400 text-xs font-bold animate-pulse">
                                        <RefreshCcw className="w-3 h-3 animate-spin" />
                                        REFRESHING...
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {newsLoading && news.length === 0 ? (
                                    [...Array(5)].map((_, i) => (
                                        <div key={i} className="bg-slate-800/20 rounded-3xl p-8 border border-slate-800 animate-pulse h-32"></div>
                                    ))
                                ) : (
                                    news.map((item, idx) => (
                                        <a
                                            key={idx}
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block bg-slate-800/30 hover:bg-slate-800/50 rounded-3xl p-8 border border-slate-700/40 transition-all group backdrop-blur-sm relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-500/20">
                                                            {item.source}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                                                </div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                                                    {item.title}
                                                </h3>
                                                <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                                                    {item.description ? item.description.replace(/<[^>]*>?/gm, '') : 'Click to read full market coverage...'}
                                                </p>
                                            </div>
                                        </a>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stocks;
