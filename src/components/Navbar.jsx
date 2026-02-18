import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentCategory = searchParams.get('category');
    const categories = [
        { id: 'Tech', label: t('categories.tech') },
        { id: 'Business', label: t('categories.business') },
        { id: 'Economy', label: t('categories.economy') },
        { id: 'International', label: t('categories.international') },
        { id: 'Geopolitics', label: t('categories.geopolitics') }
    ];

    const handleCategoryClick = (category) => {
        if (currentCategory === category) {
            searchParams.delete('category');
        } else {
            searchParams.set('category', category);
        }
        setSearchParams(searchParams);
    };

    return (
        <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-500 transition-colors">
                        <Newspaper className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">{t('app_name')}</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className={`font-medium transition-colors text-sm uppercase tracking-wider ${currentCategory === cat.id ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <LanguageSelector />
                    <button className="bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-slate-700 transition-colors border border-slate-700">
                        {t('subscribe')}
                    </button>
                </div>
            </div>

            {/* Mobile Categories Scroller */}
            <div className="md:hidden mt-4 flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`font-medium transition-colors text-xs uppercase tracking-wider whitespace-nowrap ${currentCategory === cat.id ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default Navbar;
