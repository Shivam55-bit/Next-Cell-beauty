export const translations = {
  en: {
    freeShipping: "🚚 Free Shipping on Orders Above ₹999",
    codAvailable: "💳 COD Available Across India",
    premiumBeauty: "✨ 100% Authentic Beauty Products",
    searchPlaceholder: "Search for skincare, makeup, haircare and more...",
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
    cart: "Cart",
    wishlist: "Wishlist",
    account: "Account",
    login: "Login",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    viewDetails: "View Details",
    bestSellers: "Best Sellers",
    recentlyViewed: "Recently Viewed Products",
    comboDeals: "Value Combo Packs & Bundles",
    beforeAfter: "Real Results: Before & After",
    shadeFinder: "Find Your Shade",
    skinQuiz: "Take Skin Quiz",
    tutorials: "Beauty Tutorials",
    reviews: "Customer Reviews",
    writeReview: "Write a Review",
    shareProduct: "Share Product",
    onlyLeft: "Only {stock} items left in stock",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    viewingNow: "{count} people are viewing this right now",
    originalAuthentic: "100% Original",
    easyReturns: "Easy 7-Day Returns",
    securePayment: "100% Secure Checkout"
  },
  hi: {
    freeShipping: "🚚 ₹999 से अधिक के ऑर्डर पर मुफ़्त डिलीवरी",
    codAvailable: "💳 पूरे भारत में कैश ऑन डिलीवरी (COD) उपलब्ध",
    premiumBeauty: "✨ 100% असली व प्रामाणिक सौंदर्य उत्पाद",
    searchPlaceholder: "स्किनकेयर, मेकअप, हेयरकेयर सर्च करें...",
    shopByCategory: "कैटेगरी अनुसार खरीदें",
    skincare: "स्किनकेयर",
    makeup: "मेकअप",
    haircare: "हेयरकेयर",
    fragrance: "परफ्यूम",
    bathBody: "बाथ व बॉडी",
    beautyTools: "ब्यूटी टूल्स",
    beautyBlog: "ब्यूटी ब्लॉग",
    faqs: "अक्सर पूछे जाने वाले सवाल",
    brands: "ब्रांड्स",
    offers: "ऑफ़र्स व डील्स",
    newArrivals: "नए प्रोडक्ट्स",
    cart: "कार्ट",
    wishlist: "विशलिस्ट",
    account: "अकाउंट",
    login: "लॉगिन",
    addToCart: "कार्ट में जोड़ें",
    buyNow: "अभी खरीदें",
    viewDetails: "विवरण देखें",
    bestSellers: "सबसे ज़्यादा बिकने वाले",
    recentlyViewed: "हाल ही में देखे गए प्रोडक्ट्स",
    comboDeals: "स्पेशल कॉम्बो और वैल्यू पैक्स",
    beforeAfter: "असरदार परिणाम: पहले और बाद में",
    shadeFinder: "अपना शेड खोजें",
    skinQuiz: "स्किन क्विज़ लें",
    tutorials: "ब्यूटी ट्यूटोरियल्स",
    reviews: "ग्राहक समीक्षाएं",
    writeReview: "समीक्षा लिखें",
    shareProduct: "प्रोडक्ट शेयर करें",
    onlyLeft: "केवल {stock} आइटम स्टॉक में बाकी हैं",
    inStock: "उपलब्ध है",
    outOfStock: "स्टॉक खत्म",
    viewingNow: "इस समय {count} लोग इसे देख रहे हैं",
    originalAuthentic: "100% असली उत्पाद",
    easyReturns: "7 दिनों में आसान रिटर्न",
    securePayment: "सुरक्षित भुगतान"
  }
};

export function getLanguage() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("app_lang") || "en";
  }
  return "en";
}

export function setLanguage(lang) {
  if (typeof window !== "undefined") {
    localStorage.setItem("app_lang", lang);
    window.dispatchEvent(new Event("language:change"));
  }
}

export function useTranslation() {
  const lang = getLanguage();
  const t = (key, params = {}) => {
    let text = translations[lang]?.[key] || translations.en[key] || key;
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
    return text;
  };
  return { t, currentLang: lang, setLang: setLanguage };
}
