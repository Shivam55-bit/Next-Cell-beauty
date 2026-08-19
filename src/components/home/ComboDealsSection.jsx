import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Sparkles, Check, Flame } from "lucide-react";
import { addToCart } from "../../redux/cartSlice";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";
import toast from "react-hot-toast";
import styles from "./ComboDealsSection.module.css";

const defaultBundles = [
  {
    id: "bundle-glow-duo",
    name: "Complete Radiant Glow Combo",
    badge: "Save 35%",
    tag: "Bestseller Bundle",
    originalPrice: 1998,
    bundlePrice: 1299,
    savings: 699,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
    description: "HydraGlow Vitamin C Serum + Rosehip Day Cream for maximum glass-skin radiance.",
    items: [
      "Vitamin C Illuminating Face Serum (30ml)",
      "HydraGlow Moisture Day Cream (50g)",
      "Free Velvet Beauty Pouch"
    ],
    status: "Active"
  },
  {
    id: "bundle-matte-lip-trio",
    name: "Velvet Matte Lip Trio Box",
    badge: "Save 40%",
    tag: "Limited Edition",
    originalPrice: 2397,
    bundlePrice: 1449,
    savings: 948,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80",
    description: "3 iconic shades (Rose Nude, Ruby Red, Berry Plum) in ultra-matte non-drying finish.",
    items: [
      "Velvet Liquid Lipstick - Rose Nude",
      "Velvet Liquid Lipstick - Ruby Red",
      "Velvet Liquid Lipstick - Berry Plum"
    ],
    status: "Active"
  },
  {
    id: "bundle-night-repair-kit",
    name: "Overnight Intensive Repair Kit",
    badge: "Save 30%",
    tag: "Dermatologist Recommended",
    originalPrice: 2899,
    bundlePrice: 1999,
    savings: 900,
    image: "https://images.unsplash.com/photo-1608248597359-28c049615a6b?auto=format&fit=crop&w=800&q=80",
    description: "Peptide Night Cream + Caffeine Eye Serum + Gua Sha stone for sculpted firm skin.",
    items: [
      "Deep Recovery Peptide Night Balm (50g)",
      "Awakening Caffeine Eye Serum (15ml)",
      "Rose Quartz Sculpting Gua Sha"
    ],
    status: "Active"
  }
];

export default function ComboDealsSection() {
  const [bundles, setBundles] = useState(defaultBundles);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let mounted = true;
    const loadCombos = async () => {
      try {
        const res = await api.get("/combos");
        const list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        const activeList = list.filter((item) => item.status === "Active" || item.status === "ACTIVE");
        if (mounted && activeList.length > 0) {
          setBundles(activeList);
        }
      } catch (err) {
        // Fallback to default bundled kits
      }
    };
    loadCombos();
    return () => { mounted = false; };
  }, []);

  const handleAddBundle = (bundle) => {
    if (!isAuthenticated) {
      toast.error("Please login to add bundles to your cart!");
      navigate("/login");
      return;
    }

    dispatch(
      addToCart({
        id: bundle.id || bundle._id,
        productId: bundle.id || bundle._id,
        name: bundle.name,
        price: Number(bundle.bundlePrice),
        originalPrice: Number(bundle.originalPrice),
        image: bundle.image,
        quantity: 1,
        isBundle: true
      })
    );
    toast.success(`${bundle.name} added to cart with bundle savings!`);
  };

  return (
    <section className={styles.sectionWrapper}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.badge}>
            <Flame size={16} />
            <span>Value Bundles</span>
          </div>
          <h2>Special Combo Deals & Kits</h2>
          <p>Curated beauty routines packed together at unbeatable bundle prices. Maximum glow, maximum savings.</p>
        </div>

        <div className={styles.bundleGrid}>
          {bundles.map((bundle) => (
            <div key={bundle.id || bundle._id} className={styles.bundleCard}>
              <div className={styles.imageBox}>
                <img src={bundle.image} alt={bundle.name} loading="lazy" />
                <span className={styles.savingsTag}>{bundle.badge || "Special Deal"}</span>
                <span className={styles.popularBadge}>{bundle.tag || "Combo Kit"}</span>
              </div>

              <div className={styles.content}>
                <h3>{bundle.name}</h3>
                <p className={styles.description}>{bundle.description}</p>

                <div className={styles.itemsList}>
                  {(Array.isArray(bundle.items) ? bundle.items : []).map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <Check size={14} className={styles.checkIcon} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.pricingRow}>
                  <div>
                    <span className={styles.bundlePrice}>₹{Number(bundle.bundlePrice).toLocaleString("en-IN")}</span>
                    <span className={styles.oldPrice}>₹{Number(bundle.originalPrice).toLocaleString("en-IN")}</span>
                  </div>
                  <span className={styles.savePill}>Save ₹{Number(bundle.savings || (bundle.originalPrice - bundle.bundlePrice))}</span>
                </div>

                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => handleAddBundle(bundle)}
                >
                  <ShoppingBag size={18} />
                  Add Bundle to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
