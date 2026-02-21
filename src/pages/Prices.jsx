import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, RefreshCcw, DollarSign, Globe, BarChart2, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Yahoo Finance symbols config
const MARKET_SYMBOLS = [
    // Indian Indices
    { symbol: '^NSEI', name: 'Nifty 50', category: 'Indian Indices', flag: '🇮🇳', unit: '₹' },
    { symbol: '^BSESN', name: 'Sensex', category: 'Indian Indices', flag: '🇮🇳', unit: '₹' },
    { symbol: '^NSEBANK', name: 'Bank Nifty', category: 'Indian Indices', flag: '🇮🇳', unit: '₹' },
    { symbol: '^CNXIT', name: 'Nifty IT', category: 'Indian Indices', flag: '🇮🇳', unit: '₹' },
    // Global Indices
    { symbol: '^DJI', name: 'Dow Jones', category: 'Global Indices', flag: '🇺🇸', unit: '$' },
    { symbol: '^GSPC', name: 'S&P 500', category: 'Global Indices', flag: '🇺🇸', unit: '$' },
    { symbol: '^IXIC', name: 'NASDAQ', category: 'Global Indices', flag: '🇺🇸', unit: '$' },
    { symbol: '^FTSE', name: 'FTSE 100', category: 'Global Indices', flag: '🇬🇧', unit: '£' },
    { symbol: '^N225', name: 'Nikkei 225', category: 'Global Indices', flag: '🇯🇵', unit: '¥' },
    // Commodities
    { symbol: 'GC=F', name: 'Gold', category: 'Commodities', flag: '🪙', unit: '$/oz' },
    { symbol: 'SI=F', name: 'Silver', category: 'Commodities', flag: '⚪', unit: '$/oz' },
    { symbol: 'CL=F', name: 'Crude Oil', category: 'Commodities', flag: '🛢️', unit: '$/bbl' },
    { symbol: 'NG=F', name: 'Nat. Gas', category: 'Commodities', flag: '🔥', unit: '$/MMBtu' },
];

const FOREX_PAIRS = [
    { from: 'USD', to: 'INR', name: 'US Dollar', flag: '🇺🇸' },
    { from: 'EUR', to: 'INR', name: 'Euro', flag: '🇪🇺' },
    { from: 'GBP', to: 'INR', name: 'British Pound', flag: '🇬🇧' },
    { from: 'JPY', to: 'INR', name: 'Japanese Yen', flag: '🇯🇵', divisor: 100 },
    { from: 'AED', to: 'INR', name: 'UAE Dirham', flag: '🇦🇪' },
    { from: 'SGD', to: 'INR', name: 'Singapore $', flag: '🇸🇬' },
    { from: 'CHF', to: 'INR', name: 'Swiss Franc', flag: '🇨🇭' },
    { from: 'AUD', to: 'INR', name: 'Aus Dollar', flag: '🇦🇺' },
];

const CATEGORY_ICONS = {
    'Indian Indices': <BarChart2 className="w-5 h-5 text-blue-400" />,
    'Global Indices': <Globe className="w-5 h-5 text-purple-400" />,
    'Commodities': <DollarSign className="w-5 h-5 text-yellow-400" />,
    'Forex': <DollarSign className="w-5 h-5 text-green-400" />,
};

const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined || isNaN(num)) return '—';
    return num.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const PriceRow = ({ name, flag, price, change, changePct, unit, loading }) => {
    const isPositive = change > 0;
    const isNeutral = change === 0 || change === null || change === undefined || isNaN(change);

    return (
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800/20 hover:bg-slate-800/40 border border-slate-700/30 rounded-2xl transition-all group relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full transition-all ${isNeutral ? 'bg-slate-600/30' : isPositive ? 'bg-green-500/50 group-hover:bg-green-500' : 'bg-red-500/50 group-hover:bg-red-500'}`}></div>

            <div className="flex items-center gap-3">
                <span className="text-xl">{flag}</span>
                <div>
                    <div className="text-sm font-bold text-slate-100">{name}</div>
                    {unit && <div className="text-[10px] text-slate-500 font-black tracking-widest uppercase">{unit}</div>}
                </div>
            </div>

            {loading ? (
                <div className="flex gap-4 animate-pulse">
                    <div className="h-4 w-20 bg-slate-700 rounded"></div>
                    <div className="h-4 w-16 bg-slate-700 rounded"></div>
                </div>
            ) : (
                <div className="flex items-center gap-4 text-right">
                    <span className="font-black text-white text-base tabular-nums">{formatNumber(price)}</span>
                    <div className={`flex items-center gap-1 min-w-[90px] justify-end text-sm font-bold tabular-nums ${isNeutral ? 'text-slate-400' : isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isNeutral ? <Minus className="w-3.5 h-3.5" /> : isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {!isNeutral && <span>{isPositive ? '+' : ''}{formatNumber(changePct)}%</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

const Prices = () => {
    const { t } = useTranslation();
    const [marketData, setMarketData] = useState({});
    const [forexData, setForexData] = useState({});
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [countdown, setCountdown] = useState(60);

    const fetchMarketData = useCallback(async () => {
        try {
            const symbols = MARKET_SYMBOLS.map(s => s.symbol).join(',');
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent`)}`;

            const res = await fetch(proxyUrl);
            const raw = await res.json();
            const parsed = JSON.parse(raw.contents);
            const quotes = parsed?.quoteResponse?.result || [];

            const map = {};
            quotes.forEach(q => {
                map[q.symbol] = {
                    price: q.regularMarketPrice,
                    change: q.regularMarketChange,
                    changePct: q.regularMarketChangePercent,
                };
            });
            setMarketData(map);
        } catch (e) {
            console.error('Market data fetch failed:', e);
        }
    }, []);

    const fetchForexData = useCallback(async () => {
        try {
            const res = await fetch('https://api.frankfurter.app/latest?from=INR&to=USD,EUR,GBP,JPY,AED,SGD,CHF,AUD');
            const data = await res.json();
            // data.rates gives how much 1 INR = X foreign, we want X foreign = Y INR
            const inverted = {};
            Object.entries(data.rates || {}).forEach(([currency, rate]) => {
                inverted[currency] = 1 / rate;
            });
            setForexData(inverted);
        } catch (e) {
            console.error('Forex fetch failed:', e);
        }
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchMarketData(), fetchForexData()]);
        setLoading(false);
        setLastUpdated(new Date());
        setCountdown(60);
    }, [fetchMarketData, fetchForexData]);

    useEffect(() => {
        fetchAll();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    fetchAll();
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [fetchAll]);

    // Group by category
    const categories = ['Indian Indices', 'Global Indices', 'Commodities'];

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <header className="mb-10 text-center">
                    <div className="flex flex-col items-center gap-1 mb-4">
                        <span className="text-red-500 text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-2">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Live Market Data
                        </span>
                        {lastUpdated && (
                            <span className="text-slate-500 text-[10px] tracking-wider font-medium">
                                {countdown <= 5 ? 'Refreshing soon.' : `Refreshes in ${countdown}s.`}
                                {' '}Last update: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 inline-block tracking-tight mb-3">
                        Market Prices
                    </h1>
                    <p className="text-slate-400 text-lg">Live indices, forex & commodities</p>
                </header>

                {/* Refresh Button */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={fetchAll}
                        className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl border border-slate-700 transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                <div className="space-y-10">

                    {/* Market Categories */}
                    {categories.map(cat => (
                        <section key={cat}>
                            <div className="flex items-center gap-3 mb-4 border-b border-slate-800/50 pb-4">
                                <div className="h-7 w-1.5 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
                                {CATEGORY_ICONS[cat]}
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">{cat}</h2>
                            </div>
                            <div className="flex flex-col gap-2">
                                {MARKET_SYMBOLS.filter(s => s.category === cat).map(sym => {
                                    const d = marketData[sym.symbol];
                                    return (
                                        <PriceRow
                                            key={sym.symbol}
                                            name={sym.name}
                                            flag={sym.flag}
                                            unit={sym.unit}
                                            price={d?.price}
                                            change={d?.change}
                                            changePct={d?.changePct}
                                            loading={loading && !d}
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    ))}

                    {/* Forex Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-4 border-b border-slate-800/50 pb-4">
                            <div className="h-7 w-1.5 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)]"></div>
                            {CATEGORY_ICONS['Forex']}
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Forex vs ₹ INR</h2>
                        </div>
                        <div className="flex flex-col gap-2">
                            {FOREX_PAIRS.map(pair => {
                                const rate = forexData[pair.from];
                                return (
                                    <PriceRow
                                        key={pair.from}
                                        name={`${pair.name} (${pair.from})`}
                                        flag={pair.flag}
                                        unit={`1 ${pair.from} = ? INR`}
                                        price={rate ? (pair.divisor ? rate / pair.divisor : rate) : null}
                                        change={null}
                                        changePct={null}
                                        loading={loading && rate === undefined}
                                    />
                                );
                            })}
                        </div>
                        <p className="text-slate-600 text-[10px] mt-3 text-center tracking-wider">
                            Forex rates from Frankfurter.app · Indices from Yahoo Finance
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default Prices;
