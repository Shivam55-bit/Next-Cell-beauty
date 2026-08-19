import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Sparkles, Check, Flame } from "lucide-react";
import { addToCart } from "../../redux/cartSlice";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";
import toast from "react-hot-toast";
import styles from "./ComboDealsSection.module.css";

export default function ComboDealsSection() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let mounted = true;
    const loadCombos = async () => {
      try {
        const res = await api.get("/combos");
        const list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        const activeList = list.filter((item) => (item.status === "Active" || item.status === "ACTIVE") && item.name && item.bundlePrice);
        if (mounted) {
          setBundles(activeList);
        }
      } catch (err) {
        if (mounted) setBundles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadCombos();
    return () => { mounted = false; };
  }, []);

  // If loading or no active combo deals in database, do not render section
  if (loading || bundles.length === 0) {
    return null;
  }

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
        originalPrice: Number(bundle.originalPrice || bundle.bundlePrice),
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
                    {bundle.originalPrice && Number(bundle.originalPrice) > Number(bundle.bundlePrice) && (
                      <span className={styles.oldPrice}>₹{Number(bundle.originalPrice).toLocaleString("en-IN")}</span>
                    )}
                  </div>
                  <span className={styles.savePill}>
                    Save ₹{Number(bundle.savings || (bundle.originalPrice ? bundle.originalPrice - bundle.bundlePrice : 0))}
                  </span>
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
