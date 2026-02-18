import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import newsData from '../data/newsData.json';
import { ArrowLeft, Clock, User, Share2 } from 'lucide-react';

const ArticlePage = () => {
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const location = useLocation();

    const currentLanguage = i18n.language || 'en';
    const isHindi = currentLanguage.startsWith('hi');
    const article = location.state?.article || newsData.find((a) => a.id === parseInt(id));

    if (!article) return null; // Handle loading or error more gracefully

    const displayTitle = isHindi && article.title_hi ? article.title_hi : article.title;
    const displayShortDesc = isHindi && article.shortDescription_hi ? article.shortDescription_hi : article.shortDescription;
    const displayFullContent = isHindi && article.fullContent_hi ? article.fullContent_hi : article.fullContent;

    if (!article) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-red-500">{t('article_missing')}</h2>
                    <p className="text-slate-400 max-w-md">{t('session_expired')}</p>
                    <Link to="/" className="inline-block bg-blue-600 px-8 py-3 rounded-full hover:bg-blue-500 transition-colors font-bold shadow-lg shadow-blue-900/40">
                        {t('back_to_feed')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Link
                    to="/"
                    className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft className="mr-2 w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    {t('back_to_home')}
                </Link>

                <article>
                    <img
                        src={article.imageUrl}
                        alt={displayTitle}
                        className="w-full aspect-video object-cover rounded-2xl shadow-2xl mb-8 border border-slate-700"
                    />

                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-blue-600 text-white rounded-full">
                            {t(`categories.${article.category.toLowerCase()}`)}
                        </span>
                        <div className="flex items-center gap-4 text-slate-400 text-sm">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {t('min_read', { count: 5 })}
                            </span>
                            <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {article.sourceName}
                            </span>
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight font-display">
                        {displayTitle}
                    </h1>

                    {article.sourceUrl && (
                        <a
                            href={article.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm mb-8 border border-slate-700 transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            {t('read_original', { source: article.sourceName })}
                        </a>
                    )}

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8 font-light italic border-l-4 border-blue-500 pl-6">
                            {displayShortDesc}
                        </p>

                        <div className="text-slate-200 text-lg leading-relaxed space-y-6">
                            {displayFullContent}
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-between">
                        <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <Share2 className="w-5 h-5" />
                            {t('share_article')}
                        </button>
                        <Link
                            to="/"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg shadow-blue-900/20"
                        >
                            {t('back_to_feed')}
                        </Link>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default ArticlePage;
