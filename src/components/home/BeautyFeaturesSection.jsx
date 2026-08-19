import { Link } from "react-router-dom";
import {
  ArrowRight,
  Palette,
  Sparkles,
  PlayCircle,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import shadeFinderImage from "../../assets/features/shade-finder.png";
import skinQuizImage from "../../assets/features/skin-quiz.png";
import tutorialsImage from "../../assets/features/beauty-tutorials.png";
import styles from "./BeautyFeaturesSection.module.css";

function BeautyFeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      id: 1,
      eyebrow: t("beautyPersonal"),
      title: t("findShadeTitle"),
      description: t("findShadeDesc"),
      buttonText: t("tryShadeFinder"),
      link: "/shade-finder",
      image: shadeFinderImage,
      icon: Palette,
      variant: "navy",
    },
    {
      id: 2,
      eyebrow: t("beautyPersonal"),
      title: t("skinQuizTitle"),
      description: t("skinQuizDesc"),
      buttonText: t("startSkinQuiz"),
      link: "/skin-quiz",
      image: skinQuizImage,
      icon: Sparkles,
      variant: "green",
    },
    {
      id: 3,
      eyebrow: t("beautyPersonal"),
      title: t("tutorialsTitle"),
      description: t("tutorialsDesc"),
      buttonText: t("watchTutorials"),
      link: "/beauty-tutorials",
      image: tutorialsImage,
      icon: PlayCircle,
      variant: "light",
    },
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span>{t("beautyPersonal")}</span>
          <h2>{t("discoverBeautyTitle")}</h2>
          <p>{t("discoverBeautySubtitle")}</p>
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