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
                "geopolitics": "Geopolitics",
                "stock": "Stock"
            },
            "common": {
                "loading": "Loading...",
                "error": "Error loading news",
                "no_news": "No news found",
                "back_to_home": "Back to Home"
            },
            "stocks": {
                "live_markets": "Indian Live Markets",
                "trending_now": "Trending Stocks",
                "top_gainers": "Top Gainers",
                "top_losers": "Top Losers",
                "sector_watch": "Sector Performance",
                "nifty_50": "NIFTY 50",
                "sensex": "SENSEX",
                "nifty_bank": "NIFTY BANK",
                "market_open": "Market Open",
                "market_closed": "Market Closed",
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
                "times_of_india": "Times of India"
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
                "live_markets": "भारतीय लाइव मार्केट",
                "trending_now": "ट्रेंडिंग शेयर्स",
                "top_gainers": "टॉप गेनर्स",
                "top_losers": "टॉप लूजर्स",
                "sector_watch": "सेक्टर प्रदर्शन",
                "nifty_50": "निफ्टी 50",
                "sensex": "सेंसेक्स",
                "nifty_bank": "निफ्टी बैंक",
                "market_open": "मार्केट ओपन",
                "market_closed": "मार्केट बंद",
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
                "times_of_india": "टाइम्स ऑफ इंडिया"
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
