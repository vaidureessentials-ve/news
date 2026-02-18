import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const currentLng = i18n.language || 'en';
        const nextLng = currentLng.startsWith('hi') ? 'en' : 'hi';
        i18n.changeLanguage(nextLng);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-all group"
            title={(i18n.language || 'en').startsWith('en') ? "हिन्दी में बदलें" : "Switch to English"}
        >
            <Languages className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">
                {(i18n.language || 'en').startsWith('en') ? 'HI' : 'EN'}
            </span>
        </button>
    );
};

export default LanguageSelector;
