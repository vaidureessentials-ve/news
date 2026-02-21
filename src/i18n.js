import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "app_name": "News",
            "subscribe": "Subscribe",
            "read_more": "Read More",
            "read_full_story": "Read Full Story",
            "latest": "Latest",
            "live": "Live",
            "published_on": "Published on",
            "india": "India",
            "view_all": "View All",
            "live_network": "Live: GFS Global Network",
            "one_platform": "This Platform, Your Relevant News",
            "hero_subtitle_default": "Your command center for global business, technology, and strategic shifts.",
            "hero_subtitle_category": "Comprehensive live coverage of {{category}} trends and breaking developments.",
            "fetching_headlines": "Fetching latest headlines...",
            "sync_failed": "Global News Sync Failed",
            "reconnect_feed": "Reconnect Feed",
            "no_updates": "No live updates for {{category}} at this moment.",
            "syncing": "Syncing Data...",
            "no_news_found": "Intelligence Network Offline",

            "back_to_home": "Back to Home",
            "back_to_feed": "Back to Feed",
            "article_missing": "Article Detail Missing",
            "session_expired": "The live data for this session has expired. Please return to the homepage to refresh the feed.",
            "min_read": "{{count}} min read",
            "read_original": "Read Original at {{source}}",
            "share_article": "Share Article",
            "categories": {
                "national": "National",
                "tech": "Tech",
                "business": "Business",
                "economy": "Economy",
                "international": "International",
                "geopolitics": "Geopolitical",
                "stock": "Stocks"
            },
            "common": {
                "loading": "Loading...",
                "error": "Error loading news",
                "no_news": "No news found",
                "back_to_home": "Back to Home"
            },
            "stocks": {
                "top_losers": "Top Losers",
                "last_price": "Last Traded Price"
            },
            "sources": {
                "india_today_tech": "India Today Tech",
                "hindustan_times": "Hindustan Times",
                "the_hindu": "The Hindu",
                "the_hindu_businessline": "The Hindu BusinessLine",
                "cnbc_tv18": "CNBC TV18",
                "moneycontrol": "Moneycontrol",
                "financial_times": "Financial Times",
                "yahoo_finance": "Yahoo Finance",
                "geopolitical_monitor": "Geopolitical Monitor",
                "india_today": "India Today",
                "times_of_india": "Times of India",
                "ndtv_tech": "NDTV Tech",
                "news18_tech": "News18 Tech",
                "indian_express_business": "Indian Express Business",
                "ndtv_profit": "NDTV Profit",
                "ndtv_news": "NDTV News",
                "indian_express": "Indian Express",
                "ndtv_profit_markets": "NDTV Profit Markets",
                "ndtv_gadgets_express": "NDTV Gadgets Express",
                "ndtv_business": "NDTV Business",
                "abp_news_business": "ABP News Business",
                "ndtv_india": "NDTV India",
                "abp_news": "ABP News",
                "google_news_india": "Google News India",
                "google_news_hindi": "Google News Hindi"
            }
        }
    },
    hi: {
        translation: {
            "app_name": "न्यूज़",
            "subscribe": "सब्सक्राइब करें",
            "read_more": "और पढ़ें",
            "read_full_story": "पूरी खबर पढ़ें",
            "latest": "ताज़ा खबर",
            "live": "लाइव",
            "published_on": "प्रकाशित तिथि",
            "india": "भारत",
            "view_all": "सभी देखें",
            "live_network": "लाइव: जीएफएस ग्लोबल नेटवर्क",
            "one_platform": "यह प्लेटफ़ॉर्म, आपकी न्यूज़",
            "hero_subtitle_default": "वैश्विक व्यापार, प्रौद्योगिकी और रणनीतिक बदलावों के लिए आपका कमांड सेंटर।",
            "hero_subtitle_category": "{{category}} के रुझानों और ब्रेकिंग घटनाक्रमों का व्यापक लाइव कवरेज।",
            "fetching_headlines": "नवीनतम सुर्खियाँ प्राप्त की जा रही हैं...",
            "sync_failed": "ग्लोबल न्यूज़ सिंक विफल",
            "reconnect_feed": "फीड को फिर से जोड़ें",
            "no_updates": "इस समय {{category}} के लिए कोई लाइव अपडेट नहीं है।",
            "syncing": "डेटा सिंक हो रहा है...",
            "no_news_found": "खुफिया नेटवर्क ऑफलाइन है",

            "back_to_home": "होम पर वापस जाएं",
            "back_to_feed": "फीड पर वापस जाएं",
            "article_missing": "लेख का विवरण मौजूद नहीं है",
            "session_expired": "इस सत्र का लाइव डेटा समाप्त हो गया है। कृपया फीड रिफ्रेश करने के लिए होमपेज पर वापस जाएं।",
            "min_read": "{{count}} मिनट का पाठ",
            "read_original": "{{source}} पर मूल खबर पढ़ें",
            "share_article": "लेख साझा करें",
            "categories": {
                "national": "राष्ट्रीय",
                "tech": "तकनीक",
                "business": "व्यापार",
                "economy": "अर्थव्यवस्था",
                "international": "अंतरराष्ट्रीय",
                "geopolitics": "भू-राजनीति",
                "stock": "शेयर बाज़ार"
            },
            "common": {
                "loading": "लोड हो रहा है...",
                "error": "समाचार लोड करने में त्रुटि",
                "no_news": "कोई समाचार नहीं मिला",
                "back_to_home": "होम पर वापस जाएं"
            },
            "stocks": {
                "top_losers": "टॉप लूजर्स",
                "last_price": "नवीनतम मूल्य"
            },
            "sources": {
                "bbc_world": "बीबीसी वर्ल्ड",
                "al_jazeera": "अल जज़ीरा",
                "cnn_world": "सीएनएन वर्ल्ड",
                "nyt_world": "एनवाईटी वर्ल्ड",
                "reuters_world": "रॉयटर्स वर्ल्ड",
                "the_guardian": "द गार्जियन",
                "dw": "डीडब्ल्यू",
                "france_24": "फ्रांस 24",
                "le_monde": "ले मोंडे",
                "techcrunch": "टेकक्रंच",
                "the_verge": "द वर्ज",
                "wired": "वायर्ड",
                "forbes": "फोर्ब्स",
                "cnbc_international": "सीएनबीसी इंटरनेशनल",
                "india_today_tech": "इंडिया टुडे टेक",
                "hindustan_times": "हिंदुस्तान टाइम्स",
                "the_hindu": "द हिंदू",
                "the_hindu_businessline": "द हिंदू बिजनेसलाइन",
                "cnbc_tv18": "सीएनबीसी टीवी18",
                "moneycontrol": "मनीकंट्रोल",
                "financial_times": "फाइनेंशियल टाइम्स",
                "yahoo_finance": "याहू फाइनेंस",
                "geopolitical_monitor": "जियोपॉलिटिकल मॉनिटर",
                "india_today": "इंडिया टुडे",
                "times_of_india": "टाइम्स ऑफ इंडिया",
                "ndtv_tech": "एनडीटीवी टेक",
                "news18_tech": "न्यूज़18 टेक",
                "indian_express_business": "इंडियन एक्सप्रेस बिज़नेस",
                "ndtv_profit": "एनडीटीवी प्रॉफिट",
                "ndtv_news": "एनडीटीवी न्यूज़",
                "indian_express": "इंडियन एक्सप्रेस",
                "ndtv_profit_markets": "एनडीटीवी प्रॉफिट मार्केट्स",
                "ndtv_gadgets_express": "एनडीटीवी गैजेट्स",
                "ndtv_business": "एनडीटीवी बिज़नेस",
                "abp_news_business": "एबीपी न्यूज़ बिज़नेस",
                "ndtv_india": "एनडीटीवी इंडिया",
                "abp_news": "एबीपी न्यूज़",
                "google_news_india": "गूगल न्यूज़ इंडिया",
                "google_news_hindi": "गूगल न्यूज़ हिंदी"
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
