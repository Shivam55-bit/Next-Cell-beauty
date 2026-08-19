import HeroSlider from "../components/home/HeroSlider";
import ServiceHighlights from "../components/home/ServiceHighlights";
import CategorySection from "../components/home/CategorySection";
import BestSellerSection from "../components/home/BestSellerSection";
import BeautyFeaturesSection from "../components/home/BeautyFeaturesSection";
import NewsletterSection from "../components/home/NewsletterSection";


function HomePage() {
  return (
    <main>
      <HeroSlider />
      <ServiceHighlights />
      <CategorySection />
      <BestSellerSection />
      <BeautyFeaturesSection/>
      <NewsletterSection/>

      {/* Existing homepage sections */}
    </main>
  );
}

export default HomePage;