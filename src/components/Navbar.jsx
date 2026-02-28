import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const categories = [
        { id: 'Geopolitical', label: 'Geopolitical', route: '/geopolitics' },
        { id: 'Economy', label: 'Economy', route: '/economy' },
        { id: 'Business', label: 'Business', route: '/business' },
        { id: 'Tech', label: 'Tech', route: '/tech' },
        { id: 'Stocks', label: 'Stocks', route: '/stocks' },
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
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
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
                        News
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
                    <div className="max-w-screen-2xl mx-auto px-4 py-4 flex flex-col gap-1">
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
