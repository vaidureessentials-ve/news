import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NewsCard = ({ article }) => {
    const { t } = useTranslation();
    return (
        <div className={`news-card flex flex-col h-full group ${article.isLive ? 'pulse-new border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : ''}`}>
            <div className="relative overflow-hidden h-56 md:h-64">
                <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-blue-600 text-white rounded-full shadow-lg">
                        {t(`categories.${article.category.toLowerCase()}`)}
                    </span>
                    {article.isLive ? (
                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-red-600 text-white rounded-full shadow-lg animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                            {t('live')}
                        </span>
                    ) : (
                        article.isLatest && (
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-red-600 text-white rounded-full shadow-lg">
                                {t('latest')}
                            </span>
                        )
                    )}
                </div>
            </div>

            <div className="p-7 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-slate-100 mb-3 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                    {article.title}
                </h3>
                <div className="flex items-center gap-3 mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span className="text-blue-500">{article.sourceName}</span>
                    <span className="opacity-20">/</span>
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {article.location === 'India' || article.location === 'भारत' ? t('india') : article.location}
                    </span>
                </div>
                <p className="text-slate-400 text-sm mb-6 line-clamp-4 leading-relaxed">
                    {article.shortDescription}
                </p>

                <div className="mt-auto flex items-center justify-between">
                    <Link
                        to={`/news/${article.id}`}
                        state={{ article }}
                        className="inline-flex items-center text-blue-400 font-bold text-xs uppercase tracking-widest hover:text-blue-300 transition-colors group/link"
                    >
                        {t('read_full_story')}
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                    {article.sourceUrl && (
                        <a
                            href={article.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-600 hover:text-blue-400 transition-colors p-1"
                            title={`Read on ${article.sourceName}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Share2 className="w-4 h-4" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsCard;
