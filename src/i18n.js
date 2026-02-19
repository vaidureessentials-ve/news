import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "app_name": "Amigo News",
            "subscribe": "Subscribe",
            "read_more": "Read More",
            "read_full_story": "Read Full Story",
            "latest": "Latest",
            "published_on": "Published on",
            "india": "India",
            "view_all": "View All",
            "live_network": "Live: Amigo Global Network",
            "one_platform": "One Platform, Every News",
            "hero_subtitle_default": "Your command center for global business, technology, and strategic shifts.",
            "hero_subtitle_category": "Comprehensive live coverage of {{category}} trends and breaking developments.",
            "fetching_headlines": "Fetching latest headlines...",
            "sync_failed": "Global News Sync Failed",
            "reconnect_feed": "Reconnect Feed",
            "no_updates": "No live updates for {{category}} at this moment.",
            "syncing": "Syncing Data...",
            "last_updated": "Next sync soon. Last update",
            "back_to_home": "Back to Home",
            "back_to_feed": "Back to Feed",
            "article_missing": "Article Detail Missing",
            "session_expired": "The live data for this session has expired. Please return to the homepage to refresh the feed.",
            "min_read": "{{count}} min read",
            "read_original": "Read Original at {{source}}",
            "share_article": "Share Article",
            "categories": {
                "tech": "Tech",
                "business": "Business",
                "economy": "Economy",
                "international": "International",
                "geopolitics": "Geopolitics"
            },
            "common": {
                "loading": "Loading...",
                "error": "Error loading news",
                "no_news": "No news found",
                "back_to_home": "Back to Home"
            }
        }
    },
    hi: {
        translation: {
            "app_name": "अमिगो न्यूज़",
            "subscribe": "सब्सक्राइब करें",
            "read_more": "और पढ़ें",
            "read_full_story": "पूरी खबर पढ़ें",
            "latest": "ताज़ा खबर",
            "published_on": "प्रकाशित तिथि",
            "india": "भारत",
            "view_all": "सभी देखें",
            "live_network": "लाइव: अमिगो ग्लोबल नेटवर्क",
            "one_platform": "एक प्लेटफ़ॉर्म, हर खबर",
            "hero_subtitle_default": "वैश्विक व्यापार, प्रौद्योगिकी और रणनीतिक बदलावों के लिए आपका कमांड सेंटर।",
            "hero_subtitle_category": "{{category}} के रुझानों और ब्रेकिंग घटनाक्रमों का व्यापक लाइव कवरेज।",
            "fetching_headlines": "नवीनतम सुर्खियाँ प्राप्त की जा रही हैं...",
            "sync_failed": "ग्लोबल न्यूज़ सिंक विफल",
            "reconnect_feed": "फीड को फिर से जोड़ें",
            "no_updates": "इस समय {{category}} के लिए कोई लाइव अपडेट नहीं है।",
            "syncing": "डेटा सिंक हो रहा है...",
            "last_updated": "अगला सिंक जल्द होगा। आख़िरी अपडेट",
            "back_to_home": "होम पर वापस जाएं",
            "back_to_feed": "फीड पर वापस जाएं",
            "article_missing": "लेख का विवरण मौजूद नहीं है",
            "session_expired": "इस सत्र का लाइव डेटा समाप्त हो गया है। कृपया फीड रिफ्रेश करने के लिए होमपेज पर वापस जाएं।",
            "min_read": "{{count}} मिनट का पाठ",
            "read_original": "{{source}} पर मूल खबर पढ़ें",
            "share_article": "लेख साझा करें",
            "categories": {
                "tech": "तकनीक",
                "business": "व्यापार",
                "economy": "अर्थव्यवस्था",
                "international": "अंतरराष्ट्रीय",
                "geopolitics": "भू-राजनीति"
            },
            "common": {
                "loading": "लोड हो रहा है...",
                "error": "समाचार लोड करने में त्रुटि",
                "no_news": "कोई समाचार नहीं मिला",
                "back_to_home": "होम पर वापस जाएं"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
