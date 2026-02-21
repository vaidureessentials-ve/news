import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const categories = [
        { id: 'Tech', label: t('categories.tech'), route: '/tech' },
        { id: 'Business', label: t('categories.business'), route: '/business' },
        { id: 'Economy', label: t('categories.economy'), route: '/economy' },
        { id: 'Geopolitics', label: t('categories.geopolitics'), route: '/geopolitics' },
        { id: 'Stock', label: t('categories.stock'), route: '/stocks' },
        { id: 'Data', label: 'Data Insights', route: '/data' },
    ];

    const isActive = (route) => location.pathname === route;

    const handleNavClick = (route) => {
        setMenuOpen(false);
        if (location.pathname === route) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link
                    to="/"
                    onClick={() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="flex items-center gap-3"
                >
                    <img
                        src="/logo.svg"
                        alt="GFS Logo"
                        className="h-14 w-auto object-contain rounded-xl bg-slate-800/50 p-1 border border-slate-700/50"
                    />
                    <span className="text-2xl font-bold text-white tracking-tight">
                        {t('app_name')}
                    </span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-6">
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

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <LanguageSelector />
                    {/* Hamburger — mobile only */}
                    <button
                        className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        onClick={() => setMenuOpen(prev => !prev)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={cat.route}
                                onClick={() => handleNavClick(cat.route)}
                                className={`py-3 px-4 rounded-xl font-semibold text-sm uppercase tracking-wider transition-colors ${isActive(cat.route)
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {cat.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
