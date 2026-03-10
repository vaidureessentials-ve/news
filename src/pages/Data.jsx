import { useState, useEffect, useCallback } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { ExternalLink, TrendingDown, TrendingUp, RefreshCcw, ShieldAlert } from 'lucide-react';

import NewsCard from '../components/NewsCard';
import { EN_CATEGORY_FEEDS, HI_CATEGORY_FEEDS, normArticle, isArticleRelevant, isBlocked, parseXML, diversifySources } from '../data/feeds';

// ── Historical Data ───────────────────────────────────────────────────
const interestRateData = [
    { date: 'Jan 2015', value: 7.75 },
    { date: 'Mar 2015', value: 7.50 },
    { date: 'Jun 2015', value: 7.25 },
    { date: 'Sep 2015', value: 6.75 },
    { date: 'Apr 2016', value: 6.50 },
    { date: 'Oct 2016', value: 6.25 },
    { date: 'Aug 2017', value: 6.00 },
    { date: 'Jun 2018', value: 6.25 },
    { date: 'Aug 2018', value: 6.50 },
    { date: 'Feb 2019', value: 6.25 },
    { date: 'Apr 2019', value: 6.00 },
    { date: 'Jun 2019', value: 5.75 },
    { date: 'Aug 2019', value: 5.40 },
    { date: 'Oct 2019', value: 5.15 },
    { date: 'Mar 2020', value: 4.40 },
    { date: 'May 2020', value: 4.00 },
    { date: 'Aug 2020', value: 4.00 },
    { date: 'Jan 2021', value: 4.00 },
    { date: 'Jun 2021', value: 4.00 },
    { date: 'Jan 2022', value: 4.00 },
    { date: 'May 2022', value: 4.40 },
    { date: 'Jun 2022', value: 4.90 },
    { date: 'Aug 2022', value: 5.40 },
    { date: 'Sep 2022', value: 5.90 },
    { date: 'Dec 2022', value: 6.25 },
    { date: 'Feb 2023', value: 6.50 },
    { date: 'Jun 2023', value: 6.50 },
    { date: 'Jan 2024', value: 6.50 },
    { date: 'Jun 2024', value: 6.50 },
    { date: 'Feb 2025', value: 6.50 },
    { date: 'Jan 2026', value: 5.25 },
    { date: 'Feb 2026', value: 5.25 },
    { date: 'Mar 2026', value: 5.25 },
];

const unemploymentData = [
    { date: 'Jan 2017', value: 8.70 },
    { date: 'Apr 2017', value: 6.40 },
    { date: 'Jul 2017', value: 4.80 },
    { date: 'Oct 2017', value: 5.00 },
    { date: 'Jan 2018', value: 5.90 },
    { date: 'Apr 2018', value: 5.60 },
    { date: 'Jul 2018', value: 6.20 },
    { date: 'Oct 2018', value: 6.90 },
    { date: 'Jan 2019', value: 7.20 },
    { date: 'Apr 2019', value: 7.40 },
    { date: 'Jul 2019', value: 8.40 },
    { date: 'Oct 2019', value: 7.60 },
    { date: 'Jan 2020', value: 7.20 },
    { date: 'Apr 2020', value: 23.50 },
    { date: 'Jul 2020', value: 8.40 },
    { date: 'Oct 2020', value: 6.98 },
    { date: 'Jan 2021', value: 6.52 },
    { date: 'May 2021', value: 11.90 },
    { date: 'Aug 2021', value: 8.32 },
    { date: 'Nov 2021', value: 7.00 },
    { date: 'Feb 2022', value: 8.10 },
    { date: 'May 2022', value: 7.12 },
    { date: 'Aug 2022', value: 7.68 },
    { date: 'Nov 2022', value: 8.00 },
    { date: 'Feb 2023', value: 7.45 },
    { date: 'May 2023', value: 7.70 },
    { date: 'Aug 2023', value: 7.17 },
    { date: 'Nov 2023', value: 8.65 },
    { date: 'Feb 2024', value: 7.57 },
    { date: 'May 2024', value: 9.20 },
    { date: 'Aug 2024', value: 7.83 },
    { date: 'Nov 2024', value: 7.50 },
    { date: 'Jan 2025', value: 7.90 },
    { date: 'Jan 2026', value: 5.00 },
    { date: 'Mar 2026', value: 4.85 },
];

const urbanUnemploymentData = [
    { date: 'Jan 2024', value: 6.50 },
    { date: 'Apr 2024', value: 6.70 },
    { date: 'Jul 2024', value: 6.60 },
    { date: 'Oct 2024', value: 6.80 },
    { date: 'Jan 2025', value: 6.90 },
    { date: 'Jan 2026', value: 7.00 },
    { date: 'Mar 2026', value: 6.85 },
];

const ruralUnemploymentData = [
    { date: 'Jan 2024', value: 3.50 },
    { date: 'Apr 2024', value: 3.70 },
    { date: 'Jul 2024', value: 3.60 },
    { date: 'Oct 2024', value: 3.80 },
    { date: 'Jan 2025', value: 3.90 },
    { date: 'Jan 2026', value: 4.20 },
    { date: 'Mar 2026', value: 4.10 },
];

const femaleUnemploymentData = [
    { date: 'Jan 2024', value: 4.50 },
    { date: 'Apr 2024', value: 4.70 },
    { date: 'Jul 2024', value: 4.60 },
    { date: 'Oct 2024', value: 4.80 },
    { date: 'Dec 2025', value: 4.90 },
    { date: 'Jan 2026', value: 5.60 },
    { date: 'Mar 2026', value: 5.30 },
];

const youthUnemploymentData = [
    { date: 'Jan 2024', value: 13.80 },
    { date: 'Apr 2024', value: 14.20 },
    { date: 'Jul 2024', value: 14.00 },
    { date: 'Oct 2024', value: 14.50 },
    { date: 'Dec 2025', value: 14.30 },
    { date: 'Jan 2026', value: 14.70 },
    { date: 'Mar 2026', value: 14.20 },
];

const laborForceParticipationData = [
    { date: 'Jan 2024', value: 54.50 },
    { date: 'Apr 2024', value: 55.20 },
    { date: 'Jul 2024', value: 55.80 },
    { date: 'Oct 2024', value: 56.00 },
    { date: 'Dec 2025', value: 56.10 },
    { date: 'Jan 2026', value: 55.90 },
];

const workerPopulationData = [
    { date: 'Jan 2024', value: 52.10 },
    { date: 'Apr 2024', value: 52.80 },
    { date: 'Jul 2024', value: 53.20 },
    { date: 'Oct 2024', value: 53.50 },
    { date: 'Dec 2025', value: 53.40 },
    { date: 'Jan 2026', value: 53.10 },
];

const gdpGrowthData = [
    { date: '2015', value: 8.0 },
    { date: '2016', value: 8.3 },
    { date: '2017', value: 6.8 },
    { date: '2018', value: 6.5 },
    { date: '2019', value: 3.9 },
    { date: '2020', value: -5.8 },
    { date: '2021', value: 9.1 },
    { date: '2022', value: 7.2 },
    { date: '2023', value: 8.2 },
    { date: '2024', value: 7.0 },
    { date: '2025', value: 6.8 },
    { date: '2026', value: 7.8 },
];

// ── Cache for Economy News ───────────────────────────────────────────
const economyNewsCache = { en: [] };

// ── Helpers ───────────────────────────────────────────────────────────
const getLatestTrend = (data) => {
    if (!data || data.length === 0) return { value: 'N/A', change: '0%', dir: 'up', date: 'N/A', ref: 0 };
    const latest = data[data.length - 1];
    const prev = data[data.length - 2] || latest;
    const diff = (latest.value - prev.value).toFixed(2);
    return {
        value: `${latest.value.toFixed(2)}%`,
        change: `${Math.abs(diff).toFixed(2)}%`,
        dir: diff >= 0 ? 'up' : 'down',
        date: latest.date,
        ref: latest.value
    };
};

// ── Custom Tooltip ────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, unit, color }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 shadow-2xl">
                <p className="text-slate-400 text-xs mb-1">{label}</p>
                <p className="font-bold text-white text-lg" style={{ color }}>
                    {payload[0].value}%
                    <span className="text-slate-400 text-xs ml-1">{unit}</span>
                </p>
            </div>
        );
    }
    return null;
};

// ── Indicator Card ────────────────────────────────────────────────────
const IndicatorCard = ({
    title, subtitle, description, color, gradientId, sourceUrl, data, unit
}) => {
    const trend = getLatestTrend(data);
    const isUp = trend.dir === 'up';

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl overflow-hidden">
            <div className="p-6 pb-4 border-b border-slate-700/40">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-1.5 rounded-full" style={{ background: color }}></div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{subtitle}</p>
                            <h2 className="text-xl font-bold text-white mt-0.5">{title}</h2>
                        </div>
                    </div>
                    <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition-colors">
                        Full Data <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <div className="mt-5 flex items-end gap-4 flex-wrap">
                    <span className="text-6xl font-extrabold text-white tracking-tight">{trend.value}</span>
                    <div className="mb-1">
                        <span className={`flex items-center gap-1 text-sm font-bold ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {trend.change} vs previous
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5 block">As of {trend.date}</span>
                    </div>
                </div>
            </div>
            <div className="p-6 pb-4 bg-slate-900/40">
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                        <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                        <Tooltip content={<CustomTooltip unit={unit} color={color} />} />
                        <ReferenceLine y={trend.ref} stroke={color} strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: `Latest: ${trend.ref}%`, fill: color, fontSize: 11, position: 'insideTopRight' }} />
                        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#${gradientId})`} dot={false} activeDot={{ r: 5, fill: color, stroke: '#0f172a', strokeWidth: 2 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="px-6 pb-6">
                <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    );
};

// ── Page Component ─────────────────────────────────────────────────────
const Data = () => {
    const isHindi = false;
    const [news, setNews] = useState(economyNewsCache.en);
    const [loading, setLoading] = useState(economyNewsCache.en.length === 0);
    const [syncing, setSyncing] = useState(false);
    const [countdown, setCountdown] = useState(300); // 5 minutes
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchEconomyNews = useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            else setSyncing(true);

            const feeds = (isHindi ? HI_CATEGORY_FEEDS : EN_CATEGORY_FEEDS)['Economy'] || [];
            if (feeds.length === 0) return;

            const withTimeout = (promise, ms = 4000) =>
                Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

            const PROXY_STRATEGIES = [
                async (u) => {
                    const res = await withTimeout(fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(u)}&count=20&nocache=${Math.random().toString(36).slice(2)}`));
                    const json = await res.json();
                    return json.status === 'ok' && json.items?.length > 0 ? { items: json.items, isJson: true } : null;
                },
                async (u) => {
                    const res = await withTimeout(fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(u)}&t=${Date.now()}`, { cache: 'no-store' }));
                    const json = await res.json();
                    const items = parseXML(json.contents || '');
                    return items.length > 0 ? { items, isJson: false } : null;
                }
            ];

            const feedPromises = feeds.map(async (feed) => {
                let result = null;
                for (const strategy of PROXY_STRATEGIES) {
                    try { result = await strategy(feed.url); if (result) break; } catch { /* ignore and try next proxy */ }
                }
                if (!result) return [];
                return result.items
                    .map(item => normArticle(item, feed, result, isHindi, 'Economy'))
                    .filter(a => isArticleRelevant(a, 'Economy') && !isBlocked(a));
            });

            const results = await Promise.allSettled(feedPromises);
            const allArticles = results
                .filter(r => r.status === 'fulfilled')
                .flatMap(r => r.value);

            if (allArticles.length > 0) {
                const merged = [...allArticles].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
                const diversified = diversifySources(merged, 12);

                setNews(diversified);
                economyNewsCache.en = diversified;
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('fetchEconomyNews error:', error);
        } finally {
            setLoading(false);
            setSyncing(false);
        }
    }, [isHindi]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchEconomyNews();

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    fetchEconomyNews(true);
                    return 300;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [fetchEconomyNews]);

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 text-center">
                    <div className="flex flex-col items-center gap-3 mb-6">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 relative">
                                <span className={`${syncing ? 'animate-spin border-t-blue-400' : 'animate-ping bg-blue-400'} absolute inline-flex h-full w-full rounded-full opacity-75`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${syncing ? 'bg-blue-400' : 'bg-blue-500'}`}></span>
                            </span>
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-400">
                                {syncing ? 'Syncing Economic Developments...' : 'India Economy Insights'}
                            </span>
                        </div>
                        {lastUpdated && (
                            <span className="text-slate-500 text-[10px] tracking-wider font-medium">
                                Data refreshed monthly · News sync in {Math.floor(countdown / 60)}m {countdown % 60}s · Last sync: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-4 tracking-tight text-center w-full">
                        Markets & Indicators
                    </h1>
                    <p className="text-slate-400 max-w-xl mx-auto text-lg">
                        Automated monitoring of India's macro-economic health — combining long-term historical trends with real-time news.
                    </p>
                </header>

                <div className="flex flex-col gap-10">
                    <IndicatorCard title="India GDP Growth" subtitle="Annual Real GDP" color="#fbbf24" gradientId="gdpGrad" sourceUrl="https://tradingeconomics.com/india/gdp-growth-annual" data={gdpGrowthData} unit="growth" description="Annual percentage growth rate of GDP at market prices based on constant local currency. It reflects the overall economic health and expansion of the Indian economy." />
                    <IndicatorCard title="India Interest Rate" subtitle="RBI Repo Rate" color="#3b82f6" gradientId="interestGrad" sourceUrl="https://tradingeconomics.com/india/interest-rate" data={interestRateData} unit="repo rate" description="The Reserve Bank of India (RBI) sets the benchmark repo rate. A lower rate encourages borrowing and growth; a higher rate controls inflation." />
                    <IndicatorCard title="India Unemployment Rate" subtitle="CMIE Monthly Estimate" color="#a855f7" gradientId="unempGrad" sourceUrl="https://tradingeconomics.com/india/unemployment-rate" data={unemploymentData} unit="unemployment" description="India's unemployment rate measures the share of job-seekers unable to find employment, tracked monthly by the CMIE." />
                    <IndicatorCard title="Urban Unemployment Rate" subtitle="PLFS / PIB Estimate" color="#f59e0b" gradientId="urbanGrad" sourceUrl="https://www.pib.gov.in/PressReleasePage.aspx?PRID=2228713" data={urbanUnemploymentData} unit="urban unemployment" description="Tracks joblessness in India's cities and towns, reflecting the health of the formal and service sectors." />
                    <IndicatorCard title="Rural Unemployment Rate" subtitle="PLFS / PolicyEdge" color="#10b981" gradientId="ruralGrad" sourceUrl="https://www.policyedge.in/p/plfs-january-2026-labour-market-remains" data={ruralUnemploymentData} unit="rural unemployment" description="Measures job-seekers in India's agricultural and rural heartlands. Trends here are critical for internal consumption." />
                    <IndicatorCard title="Female Unemployment Rate" subtitle="PLFS / ET Estimate" color="#ec4899" gradientId="femaleGrad" sourceUrl="https://economictimes.indiatimes.com/news/economy/indicators/unemployment-rate-up-a-tad-to-5-in-january-higher-rise-for-females/articleshow/128434909.cms" data={femaleUnemploymentData} unit="female unemployment" description="Tracks the share of women in the labor force who are unable to find work. Recent data shows gender-specific challenges." />
                    <IndicatorCard title="Youth Unemployment Rate" subtitle="PLFS / Financial Express" color="#6366f1" gradientId="youthGrad" sourceUrl="https://www.financialexpress.com/policy/economy/youth-unemployment-rate-rises-14-7-in-january-revised/4145187/" data={youthUnemploymentData} unit="youth unemployment" description="Youth Unemployment (ages 15-29) is a critical metric for long-term economic stability and social development." />
                    <IndicatorCard title="Labor Force Participation Rate (LFPR)" subtitle="PLFS / PIB Estimate" color="#2dd4bf" gradientId="lfprGrad" sourceUrl="https://www.pib.gov.in/PressReleasePage.aspx?PRID=2228713" data={laborForceParticipationData} unit="participation rate" description="LFPR is the percentage of the working-age population (15+) that is either employed or actively seeking work." />
                    <IndicatorCard title="Worker Population Ratio (WPR)" subtitle="PLFS / PIB Estimate" color="#6366f1" gradientId="wprGrad" sourceUrl="https://www.pib.gov.in/PressReleasePage.aspx?PRID=2228713" data={workerPopulationData} unit="worker ratio" description="WPR is the percentage of the total population that is employed. It is a direct indicator of employment levels." />
                </div>

                <section className="mt-20">
                    <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-4">
                        <div className="h-8 w-1.5 bg-indigo-500 rounded-full"></div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Latest Ind Data Economic Headlines</h2>
                        <span className="ml-auto text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full tracking-widest uppercase">
                            LIVE NEWS
                        </span>
                    </div>

                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin" />
                            <p className="text-slate-500 text-sm animate-pulse">Connecting to economic network...</p>
                        </div>
                    ) : news.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {news.map((item, idx) => (
                                <NewsCard key={item.sourceUrl || idx} article={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-slate-800/20 rounded-3xl border border-slate-700/30">
                            <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">No Recent Economic Headlines</h3>
                            <p className="text-slate-500 text-sm">Failed to retrieve real-time data. Retrying in {Math.floor(countdown / 60)}m.</p>
                        </div>
                    )}
                </section>

                <p className="text-center text-slate-600 text-xs mt-16 pb-12">
                    Economic Indicators sourced from <a href="https://tradingeconomics.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400">Trading Economics</a> · RBI · CMIE · PLFS.
                </p>
            </div>
        </div>
    );
};

export default Data;
