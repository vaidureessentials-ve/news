import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { ExternalLink, TrendingDown, TrendingUp } from 'lucide-react';

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
    { date: 'Oct 2024', value: 6.50 },
    { date: 'Feb 2025', value: 6.25 },
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
    { date: 'Apr 2020', value: 23.50 }, // COVID spike
    { date: 'Jul 2020', value: 8.40 },
    { date: 'Oct 2020', value: 6.98 },
    { date: 'Jan 2021', value: 6.52 },
    { date: 'May 2021', value: 11.90 }, // 2nd wave
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
];

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
    title, subtitle, value, change, changeDir, date,
    description, color, gradientId, sourceUrl, data, unit, refValue
}) => {
    const isUp = changeDir === 'up';

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-700/40">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-1.5 rounded-full" style={{ background: color }}></div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{subtitle}</p>
                            <h2 className="text-xl font-bold text-white mt-0.5">{title}</h2>
                        </div>
                    </div>
                    <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition-colors"
                    >
                        Full Data <ExternalLink className="w-3 h-3" />
                    </a>
                </div>

                {/* Big value */}
                <div className="mt-5 flex items-end gap-4 flex-wrap">
                    <span className="text-6xl font-extrabold text-white tracking-tight">
                        {value}
                    </span>
                    <div className="mb-1">
                        <span className={`flex items-center gap-1 text-sm font-bold ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {change} vs previous
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5 block">As of {date}</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="p-6 pb-4 bg-slate-900/40">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-4">
                    Historical Trend
                </p>
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={v => `${v}%`}
                        />
                        <Tooltip content={<CustomTooltip unit={unit} color={color} />} />
                        {refValue && (
                            <ReferenceLine
                                y={refValue}
                                stroke={color}
                                strokeDasharray="4 4"
                                strokeOpacity={0.4}
                                label={{ value: `Current: ${refValue}%`, fill: color, fontSize: 11, position: 'insideTopRight' }}
                            />
                        )}
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2.5}
                            fill={`url(#${gradientId})`}
                            dot={false}
                            activeDot={{ r: 5, fill: color, stroke: '#0f172a', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Description */}
            <div className="px-6 pb-6">
                <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    );
};

// ── Page ──────────────────────────────────────────────────────────────
const Data = () => (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
            {/* Page header */}
            <header className="mb-12 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-400">
                        India Economic Data
                    </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-4 tracking-tight">
                    Key Indicators
                </h1>
                <p className="text-slate-400 max-w-xl mx-auto text-lg">
                    Historical economic data for India — interest rates and employment trends.
                </p>
            </header>

            {/* Cards */}
            <div className="flex flex-col gap-10">
                <IndicatorCard
                    title="India Interest Rate"
                    subtitle="RBI Repo Rate"
                    value="6.25%"
                    change="-0.25%"
                    changeDir="down"
                    date="Feb 2025"
                    color="#3b82f6"
                    gradientId="interestGrad"
                    sourceUrl="https://tradingeconomics.com/india/interest-rate"
                    data={interestRateData}
                    unit="repo rate"
                    refValue={6.25}
                    description="The Reserve Bank of India (RBI) sets the benchmark repo rate — the rate at which it lends to commercial banks. A lower rate encourages borrowing and growth; a higher rate controls inflation. The RBI cut the rate from 6.50% to 6.25% in February 2025, the first cut since May 2020."
                />
                <IndicatorCard
                    title="India Unemployment Rate"
                    subtitle="CMIE Monthly Estimate"
                    value="7.90%"
                    change="+0.40%"
                    changeDir="up"
                    date="Jan 2025"
                    color="#a855f7"
                    gradientId="unempGrad"
                    sourceUrl="https://tradingeconomics.com/india/unemployment-rate"
                    data={unemploymentData}
                    unit="unemployment"
                    refValue={7.90}
                    description="India's unemployment rate measures the share of job-seekers unable to find employment. Data is tracked monthly by the Centre for Monitoring Indian Economy (CMIE). The large COVID-19 spike (April 2020: 23.5%) and the 2nd wave (May 2021: 11.9%) are visible in the chart. The rate has stabilised between 7–9% in recent years."
                />
            </div>

            {/* Footer attribution */}
            <p className="text-center text-slate-600 text-xs mt-10">
                Data sourced from{' '}
                <a href="https://tradingeconomics.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400">
                    Trading Economics
                </a>
                {' '}· RBI · CMIE
            </p>
        </div>
    </div>
);

export default Data;
