import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
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
} from "lucide-react";

import { addToCart } from "../redux/cartSlice.js";
import toast from "react-hot-toast";
import styles from "./ProductDetailPage.module.css";

const productData = {
  id: 1,
  name: "Velvet Matte Liquid Lipstick",
  slug: "velvet-matte-liquid-lipstick",
  brand: "NEXT CELL BEAUTY",
  category: "Makeup",
  subcategory: "Lipstick",
  sku: "NCB-LIP-001",
  rating: 4.8,
  reviews: 126,
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
    "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1000&q=90",
  ],

  shades: [
    {
      id: 1,
      name: "Rose Nude",
      color: "#a65c60",
      image:
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1000&q=90",
      stock: 10,
    },
    {
      id: 2,
      name: "Ruby Red",
      color: "#941d32",
      image:
        "https://images.unsplash.com/photo-1631214540553-ff044a3ff121?auto=format&fit=crop&w=1000&q=90",
      stock: 8,
    },
    {
      id: 3,
      name: "Berry Wine",
      color: "#6d263d",
      image:
        "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?auto=format&fit=crop&w=1000&q=90",
      stock: 6,
    },
    {
      id: 4,
      name: "Coral Bloom",
      color: "#c65f55",
      image:
        "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1000&q=90",
      stock: 0,
    },
  ],

  sizes: [
    {
      id: 1,
      label: "3 ml",
      price: 499,
      oldPrice: 699,
    },
    {
      id: 2,
      label: "5 ml",
      price: 599,
      oldPrice: 799,
    },
    {
      id: 3,
      label: "8 ml",
      price: 749,
      oldPrice: 949,
    },
  ],

  benefits: [
    "Rich colour payoff",
    "Comfortable matte finish",
    "Lightweight texture",
    "Long-lasting formula",
    "Easy and smooth application",
  ],

  ingredients:
    "Isododecane, Dimethicone, Silica, Vitamin E, Natural Wax Blend, Cosmetic Pigments and Fragrance.",

  howToUse: [
    "Start with clean and moisturised lips.",
    "Outline your lips using the applicator tip.",
    "Fill the centre evenly with one smooth layer.",
    "Allow the product to dry for a few seconds.",
  ],

  details: {
    skinType: "Suitable for all skin types",
    finish: "Velvet matte",
    coverage: "Full coverage",
    country: "India",
    expiry: "24 months from manufacturing",
  },
};

const productTabs = [
  {
    id: "description",
    label: "Description",
  },
  {
    id: "benefits",
    label: "Benefits",
  },
  {
    id: "ingredients",
    label: "Ingredients",
  },
  {
    id: "how-to-use",
    label: "How to Use",
  },
  {
    id: "additional-info",
    label: "Additional Info",
  },
];

function ProductDetailPage() {
  const dispatch = useDispatch();

  const [selectedImage, setSelectedImage] = useState(
    productData.images[0],
  );
  const [selectedShade, setSelectedShade] = useState(
    productData.shades[0],
  );
  const [selectedSize, setSelectedSize] = useState(
    productData.sizes[1],
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [pinCode, setPinCode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);

  const currentPrice = selectedSize?.price || productData.price;
  const currentOldPrice =
    selectedSize?.oldPrice || productData.oldPrice;

  const savedAmount = currentOldPrice - currentPrice;

  const discountPercentage = useMemo(() => {
    return Math.round(
      ((currentOldPrice - currentPrice) / currentOldPrice) * 100,
    );
  }, [currentOldPrice, currentPrice]);

  const handleShadeSelect = (shade) => {
    if (shade.stock <= 0) return;

    setSelectedShade(shade);
    setSelectedImage(shade.image);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(selectedShade.stock, current + 1),
    );
  };

  const handleDeliveryCheck = (event) => {
    event.preventDefault();

    const normalizedPinCode = pinCode.trim();

    if (!/^\d{6}$/.test(normalizedPinCode)) {
      setDeliveryMessage("Please enter a valid 6-digit PIN code.");
      return;
    }

    setDeliveryMessage(
      "Delivery available. Estimated delivery within 3–5 business days.",
    );
  };

  const handleAddToCart = () => {
    const cartItem = {
      productId: productData.id,
      id: productData.id,
      name: productData.name,
      slug: productData.slug,
      image: selectedImage,
      shade: selectedShade,
      size: selectedSize,
      quantity,
      price: currentPrice,
    };

    dispatch(addToCart({ ...cartItem, quantity }));
    toast.success("Product added to cart");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/checkout";
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "benefits":
        return (
          <ul className={styles.bulletList}>
            {productData.benefits.map((benefit) => (
              <li key={benefit}>
                <BadgeCheck size={18} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        );

      case "ingredients":
        return <p>{productData.ingredients}</p>;

      case "how-to-use":
        return (
          <ol className={styles.stepsList}>
            {productData.howToUse.map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        );

      case "additional-info":
        return (
          <div className={styles.informationTable}>
            <div>
              <span>Suitable For</span>
              <strong>{productData.details.skinType}</strong>
            </div>

            <div>
              <span>Finish</span>
              <strong>{productData.details.finish}</strong>
            </div>

            <div>
              <span>Coverage</span>
              <strong>{productData.details.coverage}</strong>
            </div>

            <div>
              <span>Country of Origin</span>
              <strong>{productData.details.country}</strong>
            </div>

            <div>
              <span>Expiry</span>
              <strong>{productData.details.expiry}</strong>
            </div>

            <div>
              <span>SKU</span>
              <strong>{productData.sku}</strong>
            </div>
          </div>
        );

      default:
        return (
          <>
            <p>{productData.shortDescription}</p>

            <p>
              This premium beauty formula is designed for an even,
              comfortable finish while helping you create polished looks
              for everyday wear and special occasions.
            </p>
          </>
        );
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.breadcrumbSection}>
        <div className={`container ${styles.breadcrumb}`}>
          <Link to="/">Home</Link>
          <span>/</span>

          <Link to="/shop">Shop</Link>
          <span>/</span>

          <Link to="/shop?category=makeup">
            {productData.category}
          </Link>
          <span>/</span>

          <strong>{productData.name}</strong>
        </div>
      </section>

      <section className={styles.productSection}>
        <div className={`container ${styles.productLayout}`}>
          <div className={styles.galleryColumn}>
            <div className={styles.galleryLayout}>
              <div className={styles.thumbnailList}>
                {productData.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    className={`${styles.thumbnailButton} ${
                      selectedImage === image
                        ? styles.activeThumbnail
                        : ""
                    }`}
                    onClick={() => setSelectedImage(image)}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${productData.name} view ${index + 1}`}
                    />
                  </button>
                ))}
              </div>

              <div className={styles.mainImageBox}>
                <img
                  src={selectedImage}
                  alt={`${productData.name} - ${selectedShade.name}`}
                />

                <span className={styles.discountBadge}>
                  {discountPercentage}% OFF
                </span>

                <button
                  type="button"
                  className={`${styles.imageWishlistButton} ${
                    isWishlisted ? styles.wishlisted : ""
                  }`}
                  onClick={() =>
                    setIsWishlisted((current) => !current)
                  }
                  aria-label="Add product to wishlist"
                >
                  <Heart
                    size={22}
                    fill={isWishlisted ? "currentColor" : "none"}
                  />
                </button>

                <button
                  type="button"
                  className={styles.shareButton}
                  aria-label="Share product"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <div className={styles.mobileThumbnails}>
              {productData.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className={`${styles.thumbnailButton} ${
                    selectedImage === image
                      ? styles.activeThumbnail
                      : ""
                  }`}
                  onClick={() => setSelectedImage(image)}
                  aria-label={`View product image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`${productData.name} view ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.informationColumn}>
            <span className={styles.brandName}>
              {productData.brand}
            </span>

            <h1>{productData.name}</h1>

            <p className={styles.shortDescription}>
              {productData.shortDescription}
            </p>

            <div className={styles.ratingRow}>
              <div className={styles.ratingBadge}>
                <Star size={15} fill="currentColor" />
                <strong>{productData.rating}</strong>
              </div>

              <button type="button">
                {productData.reviews} Verified Reviews
              </button>

              <span>SKU: {productData.sku}</span>
            </div>

            <div className={styles.priceSection}>
              <div className={styles.priceRow}>
                <strong>
                  ₹{currentPrice.toLocaleString("en-IN")}
                </strong>

                <span>
                  ₹{currentOldPrice.toLocaleString("en-IN")}
                </span>

                <em>{discountPercentage}% OFF</em>
              </div>

              <p>
                Inclusive of all taxes. You save ₹
                {savedAmount.toLocaleString("en-IN")}.
              </p>
            </div>

            <div className={styles.offerBox}>
              <div className={styles.offerIcon}>
                <Zap size={21} />
              </div>

              <div>
                <strong>Special Beauty Offer</strong>
                <p>
                  Get an additional 10% off on prepaid orders above
                  ₹1,499.
                </p>
              </div>
            </div>

            <div className={styles.optionSection}>
              <div className={styles.optionHeader}>
                <div>
                  <span>Select Shade</span>
                  <strong>{selectedShade.name}</strong>
                </div>

                <button type="button">
                  View Shade Guide
                </button>
              </div>

              <div className={styles.shadeGrid}>
                {productData.shades.map((shade) => (
                  <button
                    key={shade.id}
                    type="button"
                    className={`${styles.shadeButton} ${
                      selectedShade.id === shade.id
                        ? styles.activeShade
                        : ""
                    } ${
                      shade.stock <= 0
                        ? styles.disabledShade
                        : ""
                    }`}
                    onClick={() => handleShadeSelect(shade)}
                    disabled={shade.stock <= 0}
                    aria-label={`Select shade ${shade.name}`}
                    title={
                      shade.stock <= 0
                        ? `${shade.name} is out of stock`
                        : shade.name
                    }
                  >
                    <span
                      style={{
                        backgroundColor: shade.color,
                      }}
                    />

                    <small>{shade.name}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.optionSection}>
              <div className={styles.optionHeader}>
                <div>
                  <span>Select Size</span>
                </div>
              </div>

              <div className={styles.sizeGrid}>
                {productData.sizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    className={
                      selectedSize.id === size.id
                        ? styles.activeSize
                        : ""
                    }
                    onClick={() => setSelectedSize(size)}
                  >
                    <strong>{size.label}</strong>
                    <span>
                      ₹{size.price.toLocaleString("en-IN")}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.stockMessage}>
              <span />
              Only {selectedShade.stock} items left in this shade
            </div>

            <div className={styles.purchaseRow}>
              <div className={styles.quantitySelector}>
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={17} />
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={quantity >= selectedShade.stock}
                  aria-label="Increase quantity"
                >
                  <Plus size={17} />
                </button>
              </div>

              <button
                type="button"
                className={styles.addToCartButton}
                onClick={handleAddToCart}
              >
                <ShoppingBag size={20} />
                Add to Cart
              </button>

              <button
                type="button"
                className={styles.buyNowButton}
                onClick={handleBuyNow}
              >
                <Zap size={20} />
                Buy Now
              </button>
            </div>

            <form
              className={styles.deliveryChecker}
              onSubmit={handleDeliveryCheck}
            >
              <div className={styles.deliveryHeading}>
                <Truck size={20} />

                <div>
                  <strong>Check Delivery Availability</strong>
                  <span>
                    Enter your PIN code to check estimated delivery.
                  </span>
                </div>
              </div>

              <div className={styles.deliveryForm}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinCode}
                  onChange={(event) =>
                    setPinCode(
                      event.target.value.replace(/\D/g, ""),
                    )
                  }
                  placeholder="Enter PIN code"
                />

                <button type="submit">Check</button>
              </div>

              {deliveryMessage && (
                <p className={styles.deliveryMessage}>
                  {deliveryMessage}
                </p>
              )}
            </form>

            <div className={styles.purchaseBenefits}>
              <article>
                <ShieldCheck size={22} />

                <div>
                  <strong>100% Original</strong>
                  <span>Authentic beauty products</span>
                </div>
              </article>

              <article>
                <RotateCcw size={22} />

                <div>
                  <strong>Easy Returns</strong>
                  <span>Hassle-free return policy</span>
                </div>
              </article>

              <article>
                <WalletCards size={22} />

                <div>
                  <strong>Secure Payment</strong>
                  <span>Safe and trusted checkout</span>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.detailsSection}>
        <div className="container">
          <div className={styles.detailsBox}>
            <div className={styles.desktopTabs}>
              {productTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={
                    activeTab === tab.id
                      ? styles.activeTab
                      : ""
                  }
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <label className={styles.mobileTabSelect}>
              <span>Product Information</span>

              <div>
                <select
                  value={activeTab}
                  onChange={(event) =>
                    setActiveTab(event.target.value)
                  }
                >
                  {productTabs.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.label}
                    </option>
                  ))}
                </select>

                <ChevronDown size={17} />
              </div>
            </label>

            <div className={styles.tabContent}>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </section>

      <div className={styles.mobilePurchaseBar}>
        <div>
          <span>
            ₹{currentPrice.toLocaleString("en-IN")}
          </span>

          <small>{selectedShade.name}</small>
        </div>

        <button type="button" onClick={handleAddToCart}>
          <ShoppingBag size={18} />
          Add to Cart
        </button>

        <button type="button" onClick={handleBuyNow}>
          Buy Now
        </button>
      </div>
    </main>
  );
}

export default ProductDetailPage;