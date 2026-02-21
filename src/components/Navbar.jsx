import React from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const categories = [
        { id: 'Tech', label: t('categories.tech'), route: '/tech' },
        { id: 'Business', label: t('categories.business'), route: '/business' },
        { id: 'Economy', label: t('categories.economy'), route: '/economy' },
        { id: 'Geopolitics', label: t('categories.geopolitics'), route: '/geopolitics' },
        { id: 'Stock', label: t('categories.stock'), route: '/stocks' },
    ];

    const isActive = (route) => location.pathname === route;

    const handleLogoClick = () => {
        if (location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (searchParams.get('category')) {
            searchParams.delete('category');
            setSearchParams(searchParams);
        }
    };

    const handleNavClick = (route) => {
        // If already on this page, scroll to top
        if (location.pathname === route) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" onClick={handleLogoClick} className="flex items-center gap-4">
                    <img src="/logo.svg" alt="GFS Logo" className="h-16 w-auto object-contain rounded-xl bg-slate-800/50 p-1 border border-slate-700/50" />
                    <span className="text-2xl font-bold text-white tracking-tight">
                        {t('app_name')}
                    </span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            to={cat.route}
                            onClick={() => handleNavClick(cat.route)}
                            className={`font-medium transition-colors text-sm uppercase tracking-wider ${isActive(cat.route) ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {cat.label}
                        </Link>
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
                    <Link
                        key={cat.id}
                        to={cat.route}
                        onClick={() => handleNavClick(cat.route)}
                        className={`font-medium transition-colors text-xs uppercase tracking-wider whitespace-nowrap ${isActive(cat.route) ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {cat.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default Navbar;
