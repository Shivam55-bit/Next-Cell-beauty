import { createContext, useContext, useState, useEffect } from "react";

export const translations = {
  en: {
    // Topbar
    freeShippingTop: "🚚 Free Shipping on Orders Above ₹999",
    codAvailableTop: "💳 COD Available Across India",
    exclusiveOffersTop: "✨ Exclusive Offers on Premium Beauty",
    langSwitch: "हिंदी",

    // Navbar
    searchPlaceholder: "Search for skincare, makeup, haircare and more...",
    account: "Account",
    login: "Login",
    register: "Register",
    logout: "Logout",
    wishlist: "Wishlist",
    cart: "Cart",
    shopByCategory: "Shop By Category",
    skincare: "Skincare",
    makeup: "Makeup",
    haircare: "Haircare",
    fragrance: "Fragrance",
    bathBody: "Bath & Body",
    beautyTools: "Beauty Tools",
    beautyBlog: "Beauty Blog",
    faqs: "FAQs",
    brands: "Brands",
    offers: "Offers",
    newArrivals: "New Arrivals",
    bestSellers: "Best Sellers",
    contact: "Contact",
    trackOrder: "Track Order",
    myOrders: "My Orders",
    myProfile: "My Profile",

    // Highlights
    fastDelivery: "Free Express Shipping",
    fastDeliveryDesc: "On all prepaid & COD orders above ₹999",
    authentic100: "100% Genuine & Authentic",
    authentic100Desc: "Directly sourced from trusted brands",
    easyReturns: "Easy 7-Day Returns",
    easyReturnsDesc: "Hassle-free refunds & exchange policy",
    securePayments: "Secure & Safe Payments",
    securePaymentsDesc: "UPI, Cards, NetBanking & COD supported",

    // Categories Section
    exploreCollections: "Explore Our Collections",
    shopByCategoryTitle: "Shop by Category",
    categorySubtitle: "Discover beauty essentials thoughtfully selected for your daily routine.",
    viewAllProducts: "View All Products",

    // Best Sellers Section
    lovedByEnthusiasts: "Loved by Beauty Enthusiasts",
    ourBestSellers: "Our Best Sellers",
    bestSellersSubtitle: "Discover our most-loved beauty products, selected for quality, performance and everyday confidence.",
    addToCart: "Add to Cart",
    addedToCart: "Added to Cart",
    buyNow: "Buy Now",

    // Combo Deals Section
    valueBundles: "Value Bundles",
    specialComboDeals: "Special Combo Deals & Kits",
    comboSubtitle: "Curated beauty routines packed together at unbeatable bundle prices. Maximum glow, maximum savings.",
    addBundleToCart: "Add Bundle to Cart",
    save: "Save",

    // Before & After Section
    provenEfficacy: "Proven Efficacy",
    realResults: "Real Results: Before & After",
    beforeAfterSubtitle: "See the visible transformation with Next Cell Beauty formulas. Slide to compare.",
    dragSlider: "Drag slider left or right",

    // Beauty Features
    beautyPersonal: "Beauty Made Personal",
    discoverBeautyTitle: "More Ways to Discover Your Beauty",
    discoverBeautySubtitle: "Helpful tools, personalised recommendations and expert guidance for your complete beauty journey.",
    findShadeTitle: "Find Your Perfect Shade",
    findShadeDesc: "Discover foundation, concealer and lipstick shades selected for your skin tone and undertone.",
    tryShadeFinder: "Try Shade Finder",
    skinQuizTitle: "Take the Skin Quiz",
    skinQuizDesc: "Answer a few simple questions and receive a personalised skincare routine.",
    startSkinQuiz: "Start Skin Quiz",
    tutorialsTitle: "Beauty Tutorials",
    tutorialsDesc: "Explore makeup looks, skincare routines, product guides and expert beauty tips.",
    watchTutorials: "Watch Tutorials",

    // Recently Viewed
    recentlyViewedTitle: "Recently Viewed Products",
    recentlyViewedSubtitle: "Quickly pick up where you left off and explore products you looked at.",

    // Newsletter
    joinClub: "Join Next Cell Beauty Club",
    newsletterSubtitle: "Subscribe to receive exclusive beauty offers, routine tips, and early access to new launches.",
    emailPlaceholder: "Enter your email address",
    subscribe: "Subscribe",
    subscribing: "Subscribing...",
    subscribedSuccess: "Thank you for subscribing to Next Cell Beauty!",

    // Product Detail Page
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    share: "Share",
    viewingNowBadge: "{count} people are viewing this right now",
    productHighlights: "Product Highlights",
    keyBenefits: "Key Benefits",
    howToUse: "How to Use",
    ingredients: "Ingredients",
    customerReviews: "Customer Reviews",
    writeReviewBtn: "Write a Review",
    ratingSummary: "Based on {count} verified customer reviews",
    relatedProducts: "You May Also Like",
    applicationVideo: "Application Video",

    // Footer
    aboutNextCell: "About Next Cell Beauty",
    aboutFooterText: "Premium beauty, skincare, and cosmetics curated for modern Indian skin tones and everyday confidence.",
    quickLinks: "Quick Links",
    customerService: "Customer Care",
    policies: "Policies & Terms",
    privacyPolicy: "Privacy Policy",
    termsConditions: "Terms & Conditions",
    shippingPolicy: "Shipping Policy",
    returnPolicy: "Return & Refund Policy",
    allRightsReserved: "All rights reserved.",
    madeWithLove: "Crafted with passion for radiant beauty."
  },

  hi: {
    // Topbar
    freeShippingTop: "🚚 ₹999 से अधिक के ऑर्डर पर मुफ़्त डिलीवरी",
    codAvailableTop: "💳 पूरे भारत में कैश ऑन डिलीवरी (COD) उपलब्ध",
    exclusiveOffersTop: "✨ प्रीमियम ब्यूटी प्रोडक्ट्स पर विशेष छूट",
    langSwitch: "English",

    // Navbar
    searchPlaceholder: "स्किनकेयर, मेकअप, हेयरकेयर सर्च करें...",
    account: "अकाउंट",
    login: "लॉगिन",
    register: "रजिस्टर",
    logout: "लॉगआउट",
    wishlist: "विशलिस्ट",
    cart: "कार्ट",
    shopByCategory: "कैटेगरी अनुसार खरीदें",
    skincare: "स्किनकेयर",
    makeup: "मेकअप",
    haircare: "हेयरकेयर",
    fragrance: "परफ्यूम व इत्र",
    bathBody: "बाथ व बॉडी",
    beautyTools: "ब्यूटी टूल्स",
    beautyBlog: "ब्यूटी ब्लॉग",
    faqs: "अक्सर पूछे जाने वाले सवाल",
    brands: "ब्रांड्स",
    offers: "ऑफ़र्स व डील्स",
    newArrivals: "नए प्रोडक्ट्स",
    bestSellers: "बेस्ट सेलर्स",
    contact: "संपर्क करें",
    trackOrder: "ऑर्डर ट्रैक करें",
    myOrders: "मेरे ऑर्डर्स",
    myProfile: "मेरी प्रोफ़ाइल",

    // Highlights
    fastDelivery: "मुफ़्त एक्सप्रेस डिलीवरी",
    fastDeliveryDesc: "₹999 से अधिक के सभी ऑर्डर्स पर मुफ़्त शिपिंग",
    authentic100: "100% असली व प्रामाणिक",
    authentic100Desc: "भरोसेमंद ब्रांड्स से सीधे मंगवाए गए उत्पाद",
    easyReturns: "7 दिनों में आसान रिटर्न",
    easyReturnsDesc: "आसान रिफंड व एक्सचेंज की सुविधा",
    securePayments: "100% सुरक्षित भुगतान",
    securePaymentsDesc: "UPI, कार्ड, नेटबैंकिंग और COD उपलब्ध",

    // Categories Section
    exploreCollections: "हमारी कलेक्शन देखें",
    shopByCategoryTitle: "कैटेगरी अनुसार ख़रीदें",
    categorySubtitle: "अपनी रोज़ाना की देखभाल के लिए बेहतरीन ब्यूटी प्रोडक्ट्स खोजें।",
    viewAllProducts: "सभी प्रोडक्ट्स देखें",

    // Best Sellers Section
    lovedByEnthusiasts: "ग्राहकों की पहली पसंद",
    ourBestSellers: "हमारे बेस्ट सेलर्स",
    bestSellersSubtitle: "हमारे सबसे लोकप्रिय प्रोडक्ट्स, जो बेहतरीन गुणवत्ता और निखार के लिए जाने जाते हैं।",
    addToCart: "कार्ट में जोड़ें",
    addedToCart: "कार्ट में जोड़ा गया",
    buyNow: "अभी खरीदें",

    // Combo Deals Section
    valueBundles: "वैल्यू कॉम्बो",
    specialComboDeals: "स्पेशल कॉम्बो डील्स व किट्स",
    comboSubtitle: "पसंदीदा ब्यूटी प्रोडक्ट्स के बेहतरीन कॉम्बो पैक्स भारी छूट के साथ।",
    addBundleToCart: "कॉम्बो कार्ट में जोड़ें",
    save: "बचत",

    // Before & After Section
    provenEfficacy: "असरदार परिणाम",
    realResults: "वास्तविक परिणाम: पहले और बाद में",
    beforeAfterSubtitle: "Next Cell Beauty से त्वचा में आए वास्तविक बदलाव को स्लाइड करके देखें।",
    dragSlider: "तुलना करने के लिए स्लाइडर को खींचें",

    // Beauty Features
    beautyPersonal: "पर्सनलाइज़्ड ब्यूटी केयर",
    discoverBeautyTitle: "अपनी खूबसूरती को निखारने के खास तरीके",
    discoverBeautySubtitle: "आपकी सुंदरता के लिए स्मार्ट टूल्स, सही सुझाव और एक्सपर्ट गाइडेंस।",
    findShadeTitle: "अपना सही शेड चुनें",
    findShadeDesc: "अपनी स्किन टोन और अंडरटोन के अनुसार सही फाउंडेशन व लिपस्टिक शेड खोजें।",
    tryShadeFinder: "शेड फाइंडर आज़माएं",
    skinQuizTitle: "स्किन क्विज़ लें",
    skinQuizDesc: "कुछ आसान सवालों के जवाब देकर अपनी त्वचा के अनुकूल रूटीन पाएं।",
    startSkinQuiz: "स्किन क्विज़ शुरू करें",
    tutorialsTitle: "ब्यूटी ट्यूटोरियल्स",
    tutorialsDesc: "मेकअप, स्किनकेयर और ब्यूटी टिप्स के आसान वीडियो व गाइड देखें।",
    watchTutorials: "ट्यूटोरियल्स देखें",

    // Recently Viewed
    recentlyViewedTitle: "हाल ही में देखे गए प्रोडक्ट्स",
    recentlyViewedSubtitle: "वे प्रोडक्ट्स जिन्हें आपने हाल ही में देखा था।",

    // Newsletter
    joinClub: "Next Cell Beauty क्लब से जुड़ें",
    newsletterSubtitle: "विशेष ऑफ़र्स, ब्यूटी टिप्स और नए प्रोडक्ट्स की जानकारी सबसे पहले पाने के लिए सब्सक्राइब करें।",
    emailPlaceholder: "अपना ईमेल दर्ज करें",
    subscribe: "सब्सक्राइब करें",
    subscribing: "सब्सक्राइब हो रहा है...",
    subscribedSuccess: "Next Cell Beauty को सब्सक्राइब करने के लिए धन्यवाद!",

    // Product Detail Page
    inStock: "स्टॉक में उपलब्ध",
    outOfStock: "स्टॉक खत्म",
    share: "शेयर करें",
    viewingNowBadge: "इस समय {count} लोग इसे देख रहे हैं",
    productHighlights: "मुख्य विशेषताएं",
    keyBenefits: "प्रमुख फायदे",
    howToUse: "इस्तेमाल करने का तरीका",
    ingredients: "सामग्री (Ingredients)",
    customerReviews: "ग्राहक समीक्षाएं",
    writeReviewBtn: "समीक्षा लिखें",
    ratingSummary: "{count} सत्यापित ग्राहकों की समीक्षाओं के आधार पर",
    relatedProducts: "आपको ये भी पसंद आ सकते हैं",
    applicationVideo: "एप्लीकेशन वीडियो गाइड",

    // Footer
    aboutNextCell: "Next Cell Beauty के बारे में",
    aboutFooterText: "भारतीय त्वचा के अनुकूल प्रीमियम सौंदर्य, स्किनकेयर और कॉस्मेटिक्स प्रोडक्ट्स।",
    quickLinks: "त्वरित लिंक",
    customerService: "ग्राहक सेवा",
    policies: "नीतियां व शर्तें",
    privacyPolicy: "गोपनीयता नीति",
    termsConditions: "नियम व शर्तें",
    shippingPolicy: "शिपिंग नीति",
    returnPolicy: "रिटर्न व रिफंड नीति",
    allRightsReserved: "सर्वाधिकार सुरक्षित।",
    madeWithLove: "निखार और खूबसूरती के लिए प्यार से निर्मित।"
  }
};

const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
  toggleLanguage: () => {},
  t: (key) => key
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("app_lang") || "en";
    }
    return "en";
  });

  const setLanguage = (newLang) => {
    const validLang = newLang === "hi" ? "hi" : "en";
    setLangState(validLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("app_lang", validLang);
      document.documentElement.lang = validLang;
    }
  };

  const toggleLanguage = () => {
    setLanguage(lang === "en" ? "hi" : "en");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t = (key, params = {}) => {
    let text = translations[lang]?.[key] || translations.en?.[key] || key;
    if (typeof text === "string" && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), v);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTranslation() {
  const { t, lang, setLang, toggleLanguage } = useLanguage();
  return { t, currentLang: lang, lang, setLang, toggleLanguage };
}
