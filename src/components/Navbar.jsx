import React from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentCategory = searchParams.get('category');

    const categories = [
        { id: 'Tech', label: t('categories.tech') },
        { id: 'Business', label: t('categories.business') },
        { id: 'Economy', label: t('categories.economy') },
        { id: 'Geopolitics', label: t('categories.geopolitics') }
    ];

    const handleCategoryClick = (category) => {
        if (location.pathname !== '/') {
            navigate(`/?category=${category}`);
            return;
        }

        // On home page, scroll to the category section if it exists
        const element = document.getElementById(`category-${category}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Update search params without causing a hard filter if desired, 
            // but the user wants "same page show not landing page".
            // Let's remove the filter logic and just scroll.
            searchParams.delete('category');
            setSearchParams(searchParams);
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-1 rounded-lg transition-transform group-hover:scale-110">
                        <img src="/logo.svg" alt="Amigo News Logo" className="w-10 h-10 object-contain" />
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
