import { useState, useEffect, useCallback } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { ExternalLink, TrendingDown, TrendingUp, RefreshCcw, ShieldAlert } from 'lucide-react';

import NewsCard from '../components/NewsCard';
import { EN_CATEGORY_FEEDS, HI_CATEGORY_FEEDS, normArticle, isArticleRelevant, isBlocked, parseXML, diversifySources } from '../data/feeds';

// ── Euro Area Historical Data ─────────────────────────────────────────
const ecbRateData = [
    { date: 'Jan 2023', value: 2.50 },
    { date: 'Mar 2023', value: 3.50 },
    { date: 'May 2023', value: 3.75 },
    { date: 'Aug 2023', value: 4.25 },
    { date: 'Sep 2023', value: 4.50 },
    { date: 'Jun 2024', value: 4.25 },
    { date: 'Sep 2024', value: 3.65 },
    { date: 'Oct 2024', value: 3.40 },
    { date: 'Dec 2025', value: 2.50 },
    { date: 'Jan 2026', value: 2.15 },
    { date: 'Mar 2026', value: 2.15 },
];

const euroEmploymentData = [
    { date: 'Jan 2024', value: 70.1 },
    { date: 'Mar 2024', value: 70.2 },
    { date: 'Jun 2024', value: 70.4 },
    { date: 'Sep 2024', value: 70.3 },
    { date: 'Dec 2024', value: 70.5 },
    { date: 'Jan 2025', value: 70.4 },
    { date: 'Jan 2026', value: 70.6 },
    { date: 'Mar 2026', value: 70.7 },
];

const euroInflationData = [
    { date: 'Jan 2025', value: 2.40 },
    { date: 'Mar 2025', value: 1.80 },
    { date: 'Jun 2025', value: 2.10 },
    { date: 'Sep 2025', value: 2.20 },
    { date: 'Dec 2025', value: 2.00 },
    { date: 'Jan 2026', value: 1.70 },
    { date: 'Feb 2026', value: 1.90 },
    { date: 'Mar 2026', value: 1.95 },
];

const euroPPIData = [
    { date: 'Jan 2025', value: -4.50 },
    { date: 'Mar 2025', value: -3.80 },
    { date: 'Jun 2025', value: -2.70 },
    { date: 'Sep 2025', value: -2.30 },
    { date: 'Dec 2025', value: -2.10 },
    { date: 'Jan 2026', value: -2.10 },
    { date: 'Feb 2026', value: -1.80 },
    { date: 'Mar 2026', value: -1.75 },
];

const euroRPIData = [
    { date: 'Jan 2025', value: 2.40 },
    { date: 'Mar 2025', value: 2.10 },
    { date: 'Jun 2025', value: 2.30 },
    { date: 'Sep 2025', value: 2.40 },
    { date: 'Dec 2025', value: 2.20 },
    { date: 'Jan 2026', value: 2.10 },
    { date: 'Feb 2026', value: 2.25 },
    { date: 'Mar 2026', value: 2.30 },
];

const euroPopulationData = [
    { date: '2010', value: 331.0 },
    { date: '2015', value: 340.2 },
    { date: '2020', value: 345.5 },
    { date: '2021', value: 346.0 },
    { date: '2022', value: 348.4 },
    { date: '2023', value: 349.8 },
    { date: '2024', value: 351.1 },
    { date: '2025', value: 351.4 },
    { date: '2026', value: 352.4 },
];

const euroPMIData = [
    { date: 'Sep 2025', value: 44.5 },
    { date: 'Oct 2025', value: 45.2 },
    { date: 'Nov 2025', value: 46.1 },
    { date: 'Dec 2025', value: 45.8 },
    { date: 'Jan 2026', value: 46.5 },
    { date: 'Feb 2026', value: 47.1 },
    { date: 'Mar 2026', value: 47.8 },
];

const euroTradeBalanceData = [
    { date: 'Sep 2025', value: 10.5 },
    { date: 'Oct 2025', value: 11.2 },
    { date: 'Nov 2025', value: 12.1 },
    { date: 'Dec 2025', value: 12.6 },
    { date: 'Jan 2026', value: 13.1 },
    { date: 'Feb 2026', value: 13.5 },
    { date: 'Mar 2026', value: 14.1 },
];

const euroDebtGDPData = [
    { date: '2020', value: 97.2 },
    { date: '2021', value: 95.4 },
    { date: '2022', value: 91.5 },
    { date: '2023', value: 89.9 },
    { date: '2024', value: 88.6 },
    { date: '2025', value: 87.8 },
    { date: '2026', value: 87.1 },
];

const euroGdpData = [
    { date: '2015', value: 2.0 },
    { date: '2016', value: 1.9 },
    { date: '2017', value: 2.6 },
    { date: '2018', value: 1.8 },
    { date: '2019', value: 1.6 },
    { date: '2020', value: -6.1 },
    { date: '2021', value: 5.9 },
    { date: '2022', value: 3.4 },
    { date: '2023', value: 0.4 },
    { date: '2024', value: 0.8 },
    { date: '2025', value: 1.2 },
    { date: '2026', value: 1.2 },
];

// ── Helpers ───────────────────────────────────────────────────────────
const getLatestTrend = (data, isPopulation = false) => {
    if (!data || data.length === 0) return { value: 'N/A', change: '0%', dir: 'up', date: 'N/A', ref: 0 };
    const latest = data[data.length - 1];
    const prev = data[data.length - 2] || latest;
    const diff = (latest.value - prev.value).toFixed(2);
    return {
        value: isPopulation ? `${latest.value.toFixed(1)}M` : `${latest.value.toFixed(2)}%`,
        change: `${Math.abs(diff).toFixed(2)}${isPopulation ? 'M' : '%'}`,
        dir: diff >= 0 ? 'up' : 'down',
        date: latest.date,
        ref: latest.value
    };
};

const CustomTooltip = ({ active, payload, label, unit, color, isPopulation }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 shadow-2xl">
                <p className="text-slate-400 text-xs mb-1">{label}</p>
                <p className="font-bold text-white text-lg" style={{ color }}>
                    {payload[0].value}{isPopulation ? 'M' : '%'}
                    <span className="text-slate-400 text-xs ml-1">{unit}</span>
                </p>
            </div>
        );
    }
    return null;
};

const IndicatorCard = ({
    title, subtitle, description, color, gradientId, sourceUrl, data, unit, isPopulation = false
}) => {
    const trend = getLatestTrend(data, isPopulation);
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
                <div className="mt-5 flex items-end gap-3 flex-wrap">
                    <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">{trend.value}</span>
                    <div className="mb-0.5 sm:mb-1">
                        <span className={`flex items-center gap-1 text-xs sm:text-sm font-bold ${isUp ? (isPopulation ? 'text-emerald-400' : 'text-red-400') : (isPopulation ? 'text-red-400' : 'text-emerald-400')}`}>
                            {isUp ? <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                            {trend.change} vs previous
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-500 mt-0.5 block">As of {trend.date}</span>
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
                        <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => isPopulation ? `${v}M` : `${v}%`} />
                        <Tooltip content={<CustomTooltip unit={unit} color={color} isPopulation={isPopulation} />} />
                        <ReferenceLine y={trend.ref} stroke={color} strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: `Latest: ${trend.value}`, fill: color, fontSize: 11, position: 'insideTopRight' }} />
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

const EuroData = () => {
    const [countdown, setCountdown] = useState(30);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const fetchEuroNews = useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            else setSyncing(true);

            const feeds = EN_CATEGORY_FEEDS['EconomyEuro'] || [];
            if (feeds.length === 0) return;

            const withTimeout = (promise, ms = 4000) =>
                Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

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

            const feedPromises = feeds.map(async (feed) => {
                let result = null;
                const shuffled = getShuffledProxies();
                for (const strategy of shuffled) {
                    try { result = await strategy(feed.url); if (result) break; } catch { /* ignore */ }
                }
                if (!result) return [];
                return result.items
                    .map(item => normArticle(item, feed, result, false, 'EconomyEuro'))
                    .filter(a => isArticleRelevant(a, 'EconomyEuro') && !isBlocked(a));
            });

            const results = await Promise.allSettled(feedPromises);
            const allArticles = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);

            if (allArticles.length > 0) {
                const merged = [...allArticles].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
                setNews(diversifySources(merged, 12));
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('fetchEuroNews error:', error);
        } finally {
            setLoading(false);
            setSyncing(false);
        }
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchEuroNews();
        const timer = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [fetchEuroNews]);

    useEffect(() => {
        if (countdown <= 0) {
            setCountdown(30);
            fetchEuroNews(true);
        }
    }, [countdown, fetchEuroNews]);

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="w-full max-w-6xl mx-auto">
                <header className="mb-12 text-center">
                    <div className="flex flex-col items-center gap-3 mb-6">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 relative">
                                <span className={`${syncing ? 'animate-spin border-t-blue-400' : 'animate-ping bg-blue-400'} absolute inline-flex h-full w-full rounded-full opacity-75`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${syncing ? 'bg-blue-400' : 'bg-blue-500'}`}></span>
                            </span>
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-400">
                                {syncing ? 'Syncing Euro Area Insights...' : 'Euro Area Economy Insights'}
                            </span>
                        </div>
                        <span className="text-slate-500 text-[10px] tracking-wider font-medium">
                            Latest data points · News sync in {Math.floor(countdown / 60)}m {countdown % 60}s · Last sync: {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-4 tracking-tight w-full text-center px-2">
                        Euro Area Markets
                    </h1>
                </header>

                <div className="flex flex-col gap-10">
                    <IndicatorCard title="Euro Area GDP Growth" subtitle="Annual Real GDP" color="#fbbf24" gradientId="euroGdpGrad" sourceUrl="https://tradingeconomics.com/euro-area/gdp-growth-annual" data={euroGdpData} unit="growth" description="Annual percentage growth rate of Euro Area GDP. It highlights the economic performance of countries using the Euro." />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <IndicatorCard title="ECB Refinancing Rate" subtitle="ECB Policy Benchmark" color="#3b82f6" gradientId="ecbGrad" sourceUrl="https://tradingeconomics.com/euro-area/interest-rate" data={ecbRateData} unit="interest rate" description="The rate at which the European Central Bank provides liquidity to the banking system. It's the key interest rate for the Euro Area." />
                        <IndicatorCard title="Euro Inflation (HICP)" subtitle="Harmonised Index" color="#a855f7" gradientId="infEuroGrad" sourceUrl="https://tradingeconomics.com/euro-area/inflation-cpi" data={euroInflationData} unit="HICP" description="Consumer price inflation as measured by the Harmonised Index of Consumer Prices (HICP), the primary measure for ECB price stability." />
                        <IndicatorCard title="Euro Area Employment Rate" subtitle="Employment Rate (15-64)" color="#10b981" gradientId="empEuroGrad" sourceUrl="https://tradingeconomics.com/euro-area/employment-rate" data={euroEmploymentData} unit="employment" description="The percentage of the Euro Area's working-age population (15-64) that is currently employed." />
                        <IndicatorCard title="Manufacturing PMI" subtitle="S&P Global Eurozone" color="#0ea5e9" gradientId="euroPmiGrad" sourceUrl="https://tradingeconomics.com/euro-area/manufacturing-pmi" data={euroPMIData} unit="index" description="The Manufacturing Purchasing Managers' Index (PMI) highlights the health of the Eurozone manufacturing sector. A reading above 50 indicates expansion." />
                        <IndicatorCard title="Trade Balance" subtitle="Goods & Services" color="#10b981" gradientId="euroTradeGrad" sourceUrl="https://tradingeconomics.com/euro-area/balance-of-trade" data={euroTradeBalanceData} unit="EUR Billion" description="The difference between the value of exports and imports for the Euro Area. The region often maintains a trade surplus." />
                        <IndicatorCard title="Govt Debt to GDP" subtitle="Eurozone Debt Ratio" color="#6366f1" gradientId="euroDebtGrad" sourceUrl="https://tradingeconomics.com/euro-area/government-debt-to-gdp" data={euroDebtGDPData} unit="%" description="The ratio of total public debt to gross domestic product for the Euro Area. Key to assessing regional fiscal stability." />
                        <IndicatorCard title="Producer Price Index (WPI)" subtitle="PPI Wholesale" color="#f97316" gradientId="ppiEuroGrad" sourceUrl="https://tradingeconomics.com/euro-area/producer-prices" data={euroPPIData} unit="PPI" description="Tracks the average change over time in the prices received by domestic producers for their output." />
                        <IndicatorCard title="Retail Price Index (RPI)" subtitle="Retail Price Trends" color="#06b6d4" gradientId="rpiEuroGrad" sourceUrl="https://tradingeconomics.com/euro-area/consumer-price-index-cpi" data={euroRPIData} unit="RPI" description="A measure of inflation reflecting the final cost of a representative basket of retail goods and services." />
                    </div>
                    <IndicatorCard title="Euro Area Population" subtitle="EA19 Total Estimate" color="#10b981" gradientId="popEuroGrad" sourceUrl="https://tradingeconomics.com/euro-area/population" data={euroPopulationData} unit="people" isPopulation={true} description="The total population of the Euro Area member states. Reflects the demographic foundation of the single currency zone." />
                </div>

                <section className="mt-20">
                    <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-4">
                        <div className="h-8 w-1.5 bg-indigo-500 rounded-full"></div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Latest Euro Area Headlines</h2>
                    </div>
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                            <RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin" />
                            <p className="text-slate-500 text-sm animate-pulse">Syncing with ECB data network...</p>
                        </div>
                    ) : news.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
                            {news
                                .filter(a => {
                                    const pubDate = new Date(a.pubDate);
                                    if (isNaN(pubDate.getTime())) return false;
                                    return (new Date() - pubDate) / 3600000 < 24;
                                })
                                .map((item, idx) => <NewsCard key={item.sourceUrl || idx} article={item} />)}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-slate-800/20 rounded-3xl border border-slate-700/30">
                            <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-500 text-sm">No recent Euro Area headlines found. Retrying in minutes.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default EuroData;
