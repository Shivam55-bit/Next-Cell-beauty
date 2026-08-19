import HeroSlider from "../components/home/HeroSlider";
import ServiceHighlights from "../components/home/ServiceHighlights";
import CategorySection from "../components/home/CategorySection";
import BestSellerSection from "../components/home/BestSellerSection";
import ComboDealsSection from "../components/home/ComboDealsSection";
import BeforeAfterSlider from "../components/common/BeforeAfterSlider";
import BeautyFeaturesSection from "../components/home/BeautyFeaturesSection";
import RecentlyViewedSection from "../components/home/RecentlyViewedSection";
import NewsletterSection from "../components/home/NewsletterSection";

function HomePage() {
  return (
    <main>
      <HeroSlider />
      <ServiceHighlights />
      <CategorySection />
      <BestSellerSection />
      <ComboDealsSection />
      <BeforeAfterSlider />
      <BeautyFeaturesSection />
      <RecentlyViewedSection />
      <NewsletterSection />
    </main>
  );
}

export default HomePage;