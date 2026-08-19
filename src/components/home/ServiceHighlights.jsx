import { motion } from "framer-motion";
import {
  BadgeCheck,
  Truck,
  RotateCcw,
  ShieldCheck,
  WalletCards,
  Headphones,
} from "lucide-react";

import styles from "./ServiceHighlights.module.css";

const services = [
  {
    id: 1,
    title: "100% Original Products",
    description: "Sourced from trusted beauty houses",
    icon: BadgeCheck,
  },
  {
    id: 2,
    title: "Complimentary Shipping",
    description: "Above ₹999 in India",
    icon: Truck,
  },
  {
    id: 3,
    title: "Easy Returns",
    description: "Polished exchange experience",
    icon: RotateCcw,
  },
  {
    id: 4,
    title: "Secure Payments",
    description: "Luxury checkout with confidence",
    icon: ShieldCheck,
  },
  {
    id: 5,
    title: "COD Available",
    description: "Anywhere in India",
    icon: WalletCards,
  },
  {
    id: 6,
    title: "Concierge Support",
    description: "Beauty assistance 24×7",
    icon: Headphones,
  },
];

function ServiceHighlights() {
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