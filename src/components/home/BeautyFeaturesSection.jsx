import { Link } from "react-router-dom";
import {
  ArrowRight,
  Palette,
  Sparkles,
  PlayCircle,
} from "lucide-react";

import shadeFinderImage from "../../assets/features/shade-finder.png";
import skinQuizImage from "../../assets/features/skin-quiz.png";
import tutorialsImage from "../../assets/features/beauty-tutorials.png";

import styles from "./BeautyFeaturesSection.module.css";

const features = [
  {
    id: 1,
    eyebrow: "Personalised Beauty",
    title: "Find Your Perfect Shade",
    description:
      "Discover foundation, concealer and lipstick shades selected for your skin tone and undertone.",
    buttonText: "Try Shade Finder",
    link: "/shade-finder",
    image: shadeFinderImage,
    icon: Palette,
    variant: "navy",
  },
  {
    id: 2,
    eyebrow: "Made for Your Skin",
    title: "Take the Skin Quiz",
    description:
      "Answer a few simple questions and receive a personalised skincare routine.",
    buttonText: "Start Skin Quiz",
    link: "/skin-quiz",
    image: skinQuizImage,
    icon: Sparkles,
    variant: "green",
  },
  {
    id: 3,
    eyebrow: "Learn & Create",
    title: "Beauty Tutorials",
    description:
      "Explore makeup looks, skincare routines, product guides and expert beauty tips.",
    buttonText: "Watch Tutorials",
    link: "/beauty-tutorials",
    image: tutorialsImage,
    icon: PlayCircle,
    variant: "light",
  },
];

function BeautyFeaturesSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span>Beauty Made Personal</span>
          <h2>More Ways to Discover Your Beauty</h2>
          <p>
            Helpful tools, personalised recommendations and expert guidance for
            your complete beauty journey.
          </p>
        </div>

        <div className={styles.featureGrid}>
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.id}
                className={`${styles.featureCard} ${
                  styles[feature.variant]
                }`}
              >
                <img
                  src={feature.image}
                  alt=""
                  className={styles.backgroundImage}
                  loading="lazy"
                />

                <div className={styles.overlay} />

                <div className={styles.content}>
                  <div className={styles.iconBox}>
                    <Icon size={24} strokeWidth={1.8} />
                  </div>

                  <span className={styles.eyebrow}>{feature.eyebrow}</span>

                  <h3>{feature.title}</h3>

                  <p>{feature.description}</p>

                  <Link to={feature.link} className={styles.actionLink}>
                    {feature.buttonText}
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BeautyFeaturesSection;