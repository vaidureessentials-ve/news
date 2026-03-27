import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dataDropdownOpen, setDataDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const categories = [
        { id: 'Global Market', label: 'Global Market', route: '/global-market' },
        { id: 'Geopolitical', label: 'Geopolitical', route: '/geopolitics' },
        { id: 'Economy', label: 'Economy', route: '/economy' },
        { id: 'Business', label: 'Business', route: '/business' },
        { id: 'Tech', label: 'Tech', route: '/tech' },
        { id: 'Stocks', label: 'Stocks', route: '/stocks' },
    ];

    const dataInsights = [
        { id: 'DataIndia', label: 'Ind Data', route: '/data' },
        { id: 'DataUS', label: 'US Data', route: '/data/us' },
        { id: 'DataEuro', label: 'Euro Data', route: '/data/euro' },
    ];

    const isActive = (route) => location.pathname === route;
    const isDataActive = dataInsights.some(item => isActive(item.route));

    const handleNavClick = (route) => {
        setMenuOpen(false);
        setDataDropdownOpen(false);
        if (location.pathname === route) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDataDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link
                    to="/"
                    onClick={() => { setMenuOpen(false); setDataDropdownOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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

                    {/* Data Insights Dropdown */}
                    <div
                        className="relative"
                        ref={dropdownRef}
                        onMouseEnter={() => setDataDropdownOpen(true)}
                        onMouseLeave={() => setDataDropdownOpen(false)}
                    >
                        <button
                            onClick={() => setDataDropdownOpen(!dataDropdownOpen)}
                            className={`flex items-center gap-1 font-medium transition-colors text-sm uppercase tracking-wider ${isDataActive || dataDropdownOpen ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Data Insights
                        </button>

                        {dataDropdownOpen && (
                            <div className="absolute left-0 top-full pt-1.5 w-56 z-[100]">
                                <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                                    <div className="py-2">
                                        {dataInsights.map((item) => (
                                            <Link
                                                key={item.id}
                                                to={item.route}
                                                onClick={() => handleNavClick(item.route)}
                                                className={`block px-4 py-3 text-sm font-semibold transition-colors ${isActive(item.route)
                                                    ? 'bg-blue-600/20 text-blue-400'
                                                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                                    }`}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
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
                <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-md max-h-[80vh] overflow-y-auto">
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

                        {/* Mobile Data Insights Group */}
                        <div className="mt-4 mb-2 px-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                Data Insights
                            </h3>
                        </div>
                        {dataInsights.map((item) => (
                            <Link
                                key={item.id}
                                to={item.route}
                                onClick={() => handleNavClick(item.route)}
                                className={`py-3 px-8 rounded-xl font-semibold text-sm uppercase tracking-wider transition-colors ${isActive(item.route)
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

