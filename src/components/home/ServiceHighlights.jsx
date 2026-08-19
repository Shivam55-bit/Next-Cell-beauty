import { motion } from "framer-motion";
import {
  BadgeCheck,
  Truck,
  RotateCcw,
  ShieldCheck,
  WalletCards,
  Headphones,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import styles from "./ServiceHighlights.module.css";

function ServiceHighlights() {
  const { t } = useLanguage();

  const services = [
    {
      id: 1,
      title: t("authentic100"),
      description: t("authentic100Desc"),
      icon: BadgeCheck,
    },
    {
      id: 2,
      title: t("fastDelivery"),
      description: t("fastDeliveryDesc"),
      icon: Truck,
    },
    {
      id: 3,
      title: t("easyReturns"),
      description: t("easyReturnsDesc"),
      icon: RotateCcw,
    },
    {
      id: 4,
      title: t("securePayments"),
      description: t("securePaymentsDesc"),
      icon: ShieldCheck,
    },
    {
      id: 5,
      title: t("codAvailableTop"),
      description: t("fastDeliveryDesc"),
      icon: WalletCards,
    },
    {
      id: 6,
      title: t("customerService"),
      description: t("madeWithLove"),
      icon: Headphones,
    },
  ];

  return (
    <section className={styles.section} aria-label="Shopping benefits">
      <div className="container">
        <div className={styles.grid}>
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <motion.article
                key={service.id}
                className={styles.item}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.01 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.42, delay: index * 0.05 }}
              >
                <div className={styles.iconBox}>
                  <Icon size={22} strokeWidth={1.9} />
                </div>

                <div className={styles.content}>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ServiceHighlights;