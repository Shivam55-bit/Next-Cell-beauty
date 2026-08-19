import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  WalletCards,
  Zap,
  Play,
  Flame,
  MessageSquarePlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye
} from "lucide-react";

import { addToCart } from "../redux/cartSlice.js";
import { toggleWishlist } from "../redux/wishlistSlice.js";
import { fetchProductBySlug, fetchProducts } from "../services/productService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import api from "../services/api.js";
import { recordRecentlyViewed } from "../components/home/RecentlyViewedSection.jsx";
import ShareModal from "../components/common/ShareModal.jsx";
import toast from "react-hot-toast";
import styles from "./ProductDetailPage.module.css";

const defaultMockProduct = {
  id: "default-pdp",
  name: "Velvet Matte Liquid Lipstick",
  slug: "velvet-matte-liquid-lipstick",
  brand: "NEXT CELL BEAUTY",
  category: "Makeup",
  subcategory: "Lipstick",
  sku: "NCB-LIP-001",
  rating: 4.8,
  reviewsCount: 126,
  price: 599,
  oldPrice: 799,
  discount: 25,
  stock: 18,
  taxIncluded: true,
  shortDescription:
    "A richly pigmented, lightweight matte lipstick designed for smooth application, comfortable wear and long-lasting colour.",
  images: [
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1000&q=90",
    "https://images.unsplash.com/photo-1631214540553-ff044a3ff121?auto=format&fit=crop&w=1000&q=90",
    "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?auto=format&fit=crop&w=1000&q=90",
    "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1000&q=90"
  ],
  shades: [
    { id: 1, name: "Rose Nude", color: "#a65c60", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1000&q=90", stock: 10 },
    { id: 2, name: "Ruby Red", color: "#941d32", image: "https://images.unsplash.com/photo-1631214540553-ff044a3ff121?auto=format&fit=crop&w=1000&q=90", stock: 8 },
    { id: 3, name: "Berry Wine", color: "#6d263d", image: "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?auto=format&fit=crop&w=1000&q=90", stock: 6 },
    { id: 4, name: "Coral Bloom", color: "#c65f55", image: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1000&q=90", stock: 0 }
  ],
  sizes: [
    { id: 1, label: "3 ml", price: 499, oldPrice: 699 },
    { id: 2, label: "5 ml", price: 599, oldPrice: 799 },
    { id: 3, label: "8 ml", price: 749, oldPrice: 999 }
  ],
  features: [
    "Up to 16 hours long-wear formula without flaking",
    "Infused with Vitamin E and Jojoba Oil for hydration",
    "Transfer-proof, smudge-resistant matte finish",
    "100% Vegan and Cruelty-Free formulation"
  ],
  ingredients: "Isododecane, Dimethicone, Trimethylsiloxysilicate, Polybutene, Silica Dimethyl Silylate, Simmondsia Chinensis (Jojoba) Seed Oil, Tocopheryl Acetate (Vitamin E), Phenoxyethanol.",
  howToUse: [
    "Exfoliate and moisturize lips lightly before application.",
    "Use the precision applicator tip to define the lip contour.",
    "Fill in lips with a single even coat and let it set for 60 seconds."
  ],
  details: {
    skinType: "All Skin Types",
    finish: "Velvet Matte",
    coverage: "Full Coverage",
    country: "India",
    expiry: "24 Months from MFG Date"
  },
  youtubeVideoId: "dQw4w9WgXcQ"
};

const productTabs = [
  { id: "description", label: "Description" },
  { id: "features", label: "Key Features" },
  { id: "ingredients", label: "Ingredients" },
  { id: "how-to-use", label: "How to Use" },
  { id: "reviews", label: "Reviews & Ratings" },
  { id: "video", label: "Application Video" },
  { id: "additional-info", label: "Additional Info" }
];

function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [product, setProduct] = useState(defaultMockProduct);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(defaultMockProduct.images[0]);
  const [selectedShade, setSelectedShade] = useState(defaultMockProduct.shades[0]);
  const [selectedSize, setSelectedSize] = useState(defaultMockProduct.sizes[1]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [pinCode, setPinCode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ name: "", rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Live visitor simulation between 8 and 22
  const viewerCount = useMemo(() => {
    return Math.floor(Math.sin((product?.name?.length || 10) * 1.5) * 6 + 14);
  }, [product?.name]);

  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const isWishlisted = wishlistItems.some((item) => (item.id || item.slug) === (product.id || product.slug));

  // 1. Fetch Product Data dynamically
  useEffect(() => {
    let mounted = true;
    const loadProduct = async () => {
      setLoading(true);
      try {
        if (slug) {
          const remoteProduct = await fetchProductBySlug(slug);
          if (remoteProduct && mounted) {
            const rawImages = (Array.isArray(remoteProduct.images) && remoteProduct.images.length > 0)
              ? remoteProduct.images
              : (remoteProduct.gallery?.length > 0
                ? remoteProduct.gallery
                : (remoteProduct.image ? [remoteProduct.image] : defaultMockProduct.images));

            const shadesList = Array.isArray(remoteProduct.shades) && remoteProduct.shades.length > 0
              ? remoteProduct.shades
              : [];

            const sizesList = Array.isArray(remoteProduct.sizes) && remoteProduct.sizes.length > 0
              ? remoteProduct.sizes
              : [];

            const cat = typeof remoteProduct.category === 'object'
              ? (remoteProduct.category?.name || remoteProduct.category?.title || '')
              : (remoteProduct.category || defaultMockProduct.category);

            const br = typeof remoteProduct.brand === 'object'
              ? (remoteProduct.brand?.name || '')
              : (remoteProduct.brand || defaultMockProduct.brand);

            const merged = {
              ...defaultMockProduct,
              ...remoteProduct,
              category: cat,
              brand: br,
              images: rawImages,
              shades: shadesList,
              sizes: sizesList,
              price: Number(remoteProduct.price || defaultMockProduct.price),
              oldPrice: Number(remoteProduct.oldPrice || remoteProduct.compareAtPrice || defaultMockProduct.oldPrice),
            };
            setProduct(merged);
            setSelectedImage(rawImages[0] || defaultMockProduct.images[0]);
            setSelectedShade(shadesList[0] || null);
            setSelectedSize(sizesList[0] || null);
            recordRecentlyViewed(merged);
          } else if (mounted) {
            recordRecentlyViewed(defaultMockProduct);
          }
        }
      } catch (err) {
        console.warn("Using fallback product details:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProduct();
    return () => { mounted = false; };
  }, [slug]);

  // 2. Fetch Related Products & Reviews
  useEffect(() => {
    const loadExtras = async () => {
      try {
        const all = await fetchProducts();
        const related = all.filter((p) => (p.slug || p.id) !== (product.slug || product.id)).slice(0, 4);
        setRelatedProducts(related);
      } catch (e) {}

      try {
        const res = await api.get("/reviews");
        const allReviews = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        setReviewsList(allReviews.slice(0, 6));
      } catch (e) {}
    };

    loadExtras();
  }, [product.slug, product.id]);

  const currentPrice = selectedSize?.price || product.price || 599;
  const currentOldPrice = selectedSize?.oldPrice || product.oldPrice || 799;
  const discountPercentage = currentOldPrice > currentPrice
    ? Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)
    : 0;

  const isStockAvailable = selectedShade
    ? (selectedShade.stock > 0)
    : (product.stock === undefined || product.stock > 0);

  const handleShadeSelect = (shade) => {
    if (shade.stock <= 0) return;
    setSelectedShade(shade);
    if (shade.image) setSelectedImage(shade.image);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart!");
      navigate("/login");
      return;
    }

    const variantSuffix = selectedShade || selectedSize
      ? ` (${[selectedShade?.name, selectedSize?.label].filter(Boolean).join(', ')})`
      : '';

    const item = {
      id: `${product.id || product._id || product.slug}-${selectedShade?.name || "std"}-${selectedSize?.label || "std"}`,
      productId: product.id || product._id || product.slug,
      name: `${product.name}${variantSuffix}`,
      slug: product.slug,
      price: currentPrice,
      originalPrice: currentOldPrice,
      image: selectedImage || (product.images && product.images[0]) || product.image,
      quantity,
      shade: selectedShade?.name,
      size: selectedSize?.label,
      stock: selectedShade?.stock || selectedSize?.stock || product.stock || 10
    };
    dispatch(addToCart(item));
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error("Please login to purchase items!");
      navigate("/login");
      return;
    }
    handleAddToCart();
    navigate("/checkout");
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your wishlist!");
      navigate("/login");
      return;
    }

    dispatch(toggleWishlist({
      id: product.id || product._id || product.slug,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      image: selectedImage || (product.images && product.images[0]) || product.image
    }));
  };

  const handleDeliveryCheck = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pinCode.trim())) {
      setDeliveryMessage("Please enter a valid 6-digit Indian PIN code.");
      return;
    }
    setDeliveryMessage("✅ Delivery Available! Estimated delivery in 3–5 business days with Free Shipping.");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewData.name.trim() || !reviewData.comment.trim()) {
      toast.error("Please provide your name and review comments.");
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post("/reviews", {
        customerName: reviewData.name,
        productName: product.name,
        productId: product.id || product.slug,
        rating: Number(reviewData.rating),
        comment: reviewData.comment
      });
      toast.success("Thank you! Your verified review has been submitted.");
      setReviewsList((prev) => [
        {
          id: Date.now(),
          customerName: reviewData.name,
          rating: Number(reviewData.rating),
          comment: reviewData.comment,
          date: new Date().toISOString().split("T")[0]
        },
        ...prev
      ]);
      setReviewData({ name: "", rating: 5, comment: "" });
      setReviewFormOpen(false);
    } catch (err) {
      toast.error("Review submitted locally for preview.");
      setReviewFormOpen(false);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "features":
        return (
          <ul className={styles.featuresList}>
            {(product.features || defaultMockProduct.features).map((feature) => (
              <li key={feature}>
                <BadgeCheck size={18} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        );

      case "ingredients":
        return <p className={styles.paragraphText}>{product.ingredients || defaultMockProduct.ingredients}</p>;

      case "how-to-use":
        return (
          <ol className={styles.stepsList}>
            {(product.howToUse || defaultMockProduct.howToUse).map((step, idx) => (
              <li key={step}>
                <span>{idx + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        );

      case "video":
        return (
          <div className={styles.videoTabContainer}>
            <div className={styles.videoEmbedWrapper}>
              <iframe
                src={`https://www.youtube.com/embed/${product.youtubeVideoId || "dQw4w9WgXcQ"}?rel=0`}
                title={`${product.name} Application Tutorial`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className={styles.videoCaption}>
              Watch professional makeup artist application tips and swatch demos for {product.name}.
            </p>
          </div>
        );

      case "reviews":
        return (
          <div className={styles.reviewsTabWrapper}>
            <div className={styles.reviewsSummaryBar}>
              <div className={styles.ratingBig}>
                <h3>{product.rating || 4.8}</h3>
                <div className={styles.starCluster}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} fill="currentColor" className={styles.starFill} />
                  ))}
                </div>
                <span>Based on {product.reviewsCount || 126} verified customer ratings</span>
              </div>

              <button
                type="button"
                className={styles.writeReviewBtn}
                onClick={() => setReviewFormOpen((prev) => !prev)}
              >
                <MessageSquarePlus size={18} />
                {reviewFormOpen ? "Cancel Review" : "Write a Verified Review"}
              </button>
            </div>

            {reviewFormOpen && (
              <form className={styles.reviewFormCard} onSubmit={handleReviewSubmit}>
                <h4>Write Your Review</h4>
                <div className={styles.formRow}>
                  <label>
                    Your Name
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={reviewData.name}
                      onChange={(e) => setReviewData({ ...reviewData, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Rating
                    <select
                      value={reviewData.rating}
                      onChange={(e) => setReviewData({ ...reviewData, rating: Number(e.target.value) })}
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 - Outstanding)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                      <option value={3}>⭐⭐⭐ (3 - Average)</option>
                      <option value={2}>⭐⭐ (2 - Below Expectation)</option>
                      <option value={1}>⭐ (1 - Poor)</option>
                    </select>
                  </label>
                </div>
                <label>
                  Review Comments
                  <textarea
                    rows={4}
                    required
                    placeholder="Share details about texture, shade accuracy, and wear time..."
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  />
                </label>
                <button type="submit" disabled={submittingReview} className={styles.submitReviewBtn}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}

            <div className={styles.reviewsListGrid}>
              {(reviewsList.length ? reviewsList : [
                { id: 1, customerName: "Ananya Roy", rating: 5, comment: "The velvet finish is so smooth! Doesn't dry out lips and stayed intact through dinner.", date: "2026-08-10" },
                { id: 2, customerName: "Kavita M.", rating: 5, comment: "Rose Nude is the absolute perfect everyday shade for Indian skin tones. 10/10 recommendation!", date: "2026-08-04" },
                { id: 3, customerName: "Rhea Sen", rating: 4, comment: "Very lightweight feel and rich pigment. Loved the packaging and fast delivery!", date: "2026-07-28" }
              ]).map((rev) => (
                <div key={rev.id} className={styles.reviewItemCard}>
                  <div className={styles.revHeader}>
                    <strong>{rev.customerName}</strong>
                    <span className={styles.verifiedBadge}>Verified Buyer</span>
                    <span className={styles.revDate}>{rev.date}</span>
                  </div>
                  <div className={styles.revStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill={s <= rev.rating ? "currentColor" : "none"} className={styles.starFill} />
                    ))}
                  </div>
                  <p>{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "additional-info":
        return (
          <div className={styles.informationTable}>
            <div>
              <span>Suitable For</span>
              <strong>{product.details?.skinType || "All Skin Types"}</strong>
            </div>
            <div>
              <span>Finish</span>
              <strong>{product.details?.finish || "Velvet Matte"}</strong>
            </div>
            <div>
              <span>Coverage</span>
              <strong>{product.details?.coverage || "Full Coverage"}</strong>
            </div>
            <div>
              <span>Country of Origin</span>
              <strong>{product.details?.country || "India"}</strong>
            </div>
            <div>
              <span>Expiry Date</span>
              <strong>{product.details?.expiry || "24 Months from MFG"}</strong>
            </div>
            <div>
              <span>SKU Code</span>
              <strong>{product.sku || "NCB-001"}</strong>
            </div>
          </div>
        );

      default:
        return (
          <>
            <p className={styles.paragraphText}>{product.shortDescription}</p>
            <p className={styles.paragraphText}>
              Formulated with nourishing botanicals and dermatologically tested pigments for a flawless, long-lasting luxury beauty finish.
            </p>
          </>
        );
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <div className="container flex min-h-[65vh] flex-col items-center justify-center py-24 text-center">
          <Loader2 className="animate-spin text-brand-600 mb-4" size={42} />
          <h2 className="text-xl font-bold text-slate-800">Loading Product Details...</h2>
          <p className="text-sm text-slate-500 mt-2">Fetching luxury formula and shade details</p>
        </div>
      </main>
    );
  }

  const categoryName = typeof product.category === 'object'
    ? (product.category?.name || product.category?.title || 'Skincare')
    : (product.category || 'Skincare');

  const brandName = typeof product.brand === 'object'
    ? (product.brand?.name || product.brand?.title || 'NEXT CELL BEAUTY')
    : (product.brand || 'NEXT CELL BEAUTY');

  const maxStock = selectedShade?.stock ?? selectedSize?.stock ?? product.stock ?? 10;
  const isOutOfStock = !isStockAvailable || maxStock <= 0;

  return (
    <main className={styles.page}>
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} product={product} />

      <section className={styles.breadcrumbSection}>
        <div className={`container ${styles.breadcrumb}`}>
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${encodeURIComponent(categoryName)}`}>{categoryName}</Link>
          <span>/</span>
          <strong>{product.name}</strong>
        </div>
      </section>

      <section className={styles.productSection}>
        <div className={`container ${styles.productLayout}`}>
          {/* Gallery Column */}
          <div className={styles.galleryColumn}>
            <div className={styles.galleryLayout}>
              <div className={styles.thumbnailList}>
                {(product.images || [selectedImage]).filter(Boolean).map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    className={`${styles.thumbnailButton} ${selectedImage === img ? styles.activeThumbnail : ""}`}
                    onClick={() => setSelectedImage(img)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} />
                  </button>
                ))}
              </div>

              <div className={styles.mainImageBox}>
                {discountPercentage > 0 && (
                  <span className={styles.discountBadge}>{discountPercentage}% OFF</span>
                )}

                <img src={selectedImage} alt={product.name} className={styles.mainImage} />

                <button
                  type="button"
                  className={styles.imageWishlistButton}
                  onClick={handleWishlistToggle}
                  aria-label="Add to wishlist"
                >
                  <Heart size={22} fill={isWishlisted ? "currentColor" : "none"} />
                </button>

                <button
                  type="button"
                  className={styles.shareButton}
                  onClick={() => setIsShareOpen(true)}
                  aria-label="Share product"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <div className={styles.mobileThumbnails}>
              {(product.images || [selectedImage]).filter(Boolean).map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  className={`${styles.thumbnailButton} ${selectedImage === img ? styles.activeThumbnail : ""}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Info Column */}
          <div className={styles.informationColumn}>
            <div className={styles.topMetaRow}>
              <span className={styles.brandName}>{brandName}</span>
              <div className={styles.liveViewerPill}>
                <Flame size={14} className={styles.flameIcon} />
                <span>{viewerCount} people viewing now</span>
              </div>
            </div>

            <h1>{product.name}</h1>
            <p className={styles.shortDescription}>{product.shortDescription}</p>

            <div className={styles.ratingRow}>
              <div className={styles.ratingBadge}>
                <Star size={15} fill="currentColor" />
                <strong>{product.rating || 4.8}</strong>
              </div>
              <button type="button" onClick={() => setActiveTab("reviews")}>
                {product.reviewsCount || 126} Verified Reviews
              </button>
              <span>SKU: {product.sku || "NCB-001"}</span>
            </div>

            <div className={styles.priceSection}>
              <div className={styles.priceRow}>
                <strong>₹{currentPrice.toLocaleString("en-IN")}</strong>
                {currentOldPrice > currentPrice && (
                  <span>₹{currentOldPrice.toLocaleString("en-IN")}</span>
                )}
                {discountPercentage > 0 && (
                  <small>Save ₹{(currentOldPrice - currentPrice).toLocaleString("en-IN")} ({discountPercentage}% OFF)</small>
                )}
              </div>
              <span className={styles.taxNote}>Inclusive of all taxes • Free Shipping Above ₹999</span>
            </div>

            {/* Shades Selection */}
            {Array.isArray(product.shades) && product.shades.length > 0 && selectedShade && (
              <div className={styles.optionSection}>
                <div className={styles.optionHeader}>
                  <span>Select Shade: <strong>{selectedShade.name}</strong></span>
                  <Link to="/shade-finder" className={styles.shadeFinderLink}>✨ Find My Shade</Link>
                </div>

                <div className={styles.shadeGrid}>
                  {product.shades.map((shade) => (
                    <button
                      key={shade.id || shade.name}
                      type="button"
                      className={`${styles.shadeButton} ${selectedShade?.id === shade.id || selectedShade?.name === shade.name ? styles.activeShade : ""} ${shade.stock <= 0 ? styles.disabledShade : ""}`}
                      onClick={() => handleShadeSelect(shade)}
                      disabled={shade.stock <= 0}
                      title={shade.stock <= 0 ? `${shade.name} is Out of Stock` : shade.name}
                    >
                      <span style={{ backgroundColor: shade.color || "#ccc" }} />
                      <small>{shade.name}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size / Variant Selection */}
            {Array.isArray(product.sizes) && product.sizes.length > 0 && selectedSize && (
              <div className={styles.optionSection}>
                <div className={styles.optionHeader}>
                  <span>Select Size: <strong>{selectedSize.label}</strong></span>
                </div>
                <div className={styles.sizeGrid}>
                  {product.sizes.map((size) => (
                    <button
                      key={size.id || size.label}
                      type="button"
                      className={`${styles.sizeBtn} ${selectedSize?.id === size.id || selectedSize?.label === size.label ? styles.activeSize : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      <strong>{size.label}</strong>
                      <span>₹{Number(size.price || currentPrice).toLocaleString("en-IN")}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Availability */}
            <div className={styles.stockMessage}>
              <span />
              {!isOutOfStock
                ? `${t("inStock")} • ${t("onlyLeft", { stock: maxStock })}`
                : t("outOfStock")}
            </div>

            {/* Purchase CTA row */}
            <div className={styles.purchaseRow}>
              <div className={styles.quantitySelector}>
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1 || isOutOfStock}>
                  <Minus size={17} />
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))} disabled={quantity >= maxStock || isOutOfStock}>
                  <Plus size={17} />
                </button>
              </div>

              <button
                type="button"
                className={styles.addToCartButton}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingBag size={20} />
                {isOutOfStock ? t("outOfStock") : t("addToCart")}
              </button>

              <button
                type="button"
                className={styles.buyNowButton}
                onClick={handleBuyNow}
                disabled={isOutOfStock}
              >
                <Zap size={20} />
                {t("buyNow")}
              </button>
            </div>

            {/* PIN Code Delivery Checker */}
            <form className={styles.deliveryChecker} onSubmit={handleDeliveryCheck}>
              <div className={styles.deliveryHeading}>
                <Truck size={20} />
                <div>
                  <strong>Check Delivery Availability</strong>
                  <span>Enter your PIN code for estimated delivery date</span>
                </div>
              </div>

              <div className={styles.deliveryForm}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit PIN code"
                />
                <button type="submit">Check</button>
              </div>

              {deliveryMessage && <p className={styles.deliveryMessage}>{deliveryMessage}</p>}
            </form>

            {/* Badges */}
            <div className={styles.purchaseBenefits}>
              <article>
                <ShieldCheck size={22} />
                <div>
                  <strong>100% Original</strong>
                  <span>Direct from Brand</span>
                </div>
              </article>
              <article>
                <RotateCcw size={22} />
                <div>
                  <strong>7-Day Easy Returns</strong>
                  <span>Hassle-Free Policy</span>
                </div>
              </article>
              <article>
                <WalletCards size={22} />
                <div>
                  <strong>Secure Payment</strong>
                  <span>UPI, Cards & COD</span>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className={styles.detailsSection}>
        <div className="container">
          <div className={styles.detailsBox}>
            <div className={styles.desktopTabs}>
              {productTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`${styles.tabItem} ${activeTab === tab.id ? styles.activeTab : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <label className={styles.mobileTabSelect}>
              <span>Product Information</span>
              <div>
                <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                  {productTabs.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={17} />
              </div>
            </label>

            <div className={styles.tabContent}>{renderTabContent()}</div>
          </div>
        </div>
      </section>

      {/* Recommended & Related Products */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <div className="container">
            <div className={styles.relatedHeader}>
              <span className={styles.eyebrow}>Pairs Well With</span>
              <h2>You May Also Like</h2>
            </div>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((rel) => {
                const relSlug = rel.slug || rel._id || rel.id;
                const relCat = typeof rel.category === 'object' ? (rel.category?.name || '') : (rel.category || '');
                return (
                  <div key={rel.id || rel._id || relSlug} className={styles.relatedCard}>
                    <Link to={`/product/${relSlug}`} className={styles.relatedImgBox}>
                      <img src={rel.image || (rel.images && rel.images[0])} alt={rel.name} loading="lazy" />
                    </Link>
                    <div className={styles.relatedInfo}>
                      {relCat && <span className={styles.relCat}>{relCat}</span>}
                      <Link to={`/product/${relSlug}`} className={styles.relTitle}>{rel.name}</Link>
                      <div className={styles.relPrice}>₹{Number(rel.price).toLocaleString("en-IN")}</div>
                      <Link to={`/product/${relSlug}`} className={styles.relBtn}>View Details</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Sticky Mobile Purchase Bar */}
      <div className={styles.mobilePurchaseBar}>
        <div>
          <span>₹{currentPrice.toLocaleString("en-IN")}</span>
          <small>{selectedShade?.name || selectedSize?.label || brandName}</small>
        </div>
        <button type="button" onClick={handleAddToCart} disabled={isOutOfStock}>
          <ShoppingBag size={18} />
          Add to Cart
        </button>
        <button type="button" onClick={handleBuyNow} disabled={isOutOfStock}>
          Buy Now
        </button>
      </div>
    </main>
  );
}

export default ProductDetailPage;