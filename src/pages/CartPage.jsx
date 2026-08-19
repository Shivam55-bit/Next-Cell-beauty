import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";

import styles from "./CartPage.module.css";

// Apne cartSlice ke actual action names ke according imports adjust karo.
import {
  removeFromCart,
  updateQuantity,
} from "../redux/cartSlice.js";

function getProductId(item) {
  return item?.productId || item?._id || item?.id;
}

function getProductImage(item) {
  return (
    item?.selectedImage ||
    item?.image ||
    item?.images?.[0] ||
    item?.product?.image ||
    item?.product?.images?.[0] ||
    "/placeholder-product.webp"
  );
}

function getProductName(item) {
  return item?.name || item?.productName || item?.product?.name || "Beauty Product";
}

function getProductPrice(item) {
  return Number(
    item?.price ||
      item?.sellingPrice ||
      item?.product?.sellingPrice ||
      item?.product?.price ||
      0,
  );
}

function getProductQuantity(item) {
  return Number(item?.quantity || item?.qty || 1);
}

function CartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartState = useSelector((state) => state.cart);

  const cartItems =
    cartState?.items ||
    cartState?.cartItems ||
    cartState?.products ||
    [];

  const subtotal = cartItems.reduce((total, item) => {
    return total + getProductPrice(item) * getProductQuantity(item);
  }, 0);

  const freeShippingLimit = 999;
  const shippingCharge =
    subtotal === 0 || subtotal >= freeShippingLimit ? 0 : 99;

  const discount = Number(cartState?.discount || 0);
  const finalTotal = Math.max(0, subtotal + shippingCharge - discount);
  const remainingForFreeShipping = Math.max(0, freeShippingLimit - subtotal);

  const handleQuantityChange = (item, nextQuantity) => {
    if (nextQuantity < 1) return;

    dispatch(
      updateQuantity({
        id: getProductId(item),
        quantity: nextQuantity,
      }),
    );
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart(getProductId(item)));
  };

  if (!cartItems.length) {
    return (
      <main className={styles.page}>
        <section className={styles.pageHero}>
          <div className="container">
            <span>Your Beauty Bag</span>
            <h1>Shopping Cart</h1>
          </div>
        </section>

        <section className={styles.emptySection}>
          <div className={`container ${styles.emptyContainer}`}>
            <div className={styles.emptyIcon}>
              <ShoppingBag size={44} />
            </div>

            <h2>Your beauty bag is empty</h2>

            <p>
              Discover premium skincare, makeup, haircare and beauty essentials
              selected for you.
            </p>

            <Link to="/shop" className={styles.shopButton}>
              Start Shopping
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.pageHero}>
        <div className="container">
          <span>Your Beauty Bag</span>
          <h1>Shopping Cart</h1>

          <div className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>/</span>
            <strong>Cart</strong>
          </div>
        </div>
      </section>

      <section className={styles.cartSection}>
        <div className={`container ${styles.cartLayout}`}>
          <div className={styles.cartContent}>
            <div className={styles.cartHeader}>
              <div>
                <span>Selected Products</span>
                <h2>
                  Your Cart
                  <small>{cartItems.length} items</small>
                </h2>
              </div>

              <Link to="/shop">
                <ArrowLeft size={17} />
                Continue Shopping
              </Link>
            </div>

            {remainingForFreeShipping > 0 ? (
              <div className={styles.shippingProgress}>
                <div className={styles.shippingText}>
                  <Truck size={20} />

                  <p>
                    Add{" "}
                    <strong>
                      ₹{remainingForFreeShipping.toLocaleString("en-IN")}
                    </strong>{" "}
                    more to unlock free shipping.
                  </p>
                </div>

                <div className={styles.progressTrack}>
                  <span
                    style={{
                      width: `${Math.min(
                        100,
                        (subtotal / freeShippingLimit) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className={styles.freeShippingMessage}>
                <Truck size={20} />
                You have unlocked free shipping.
              </div>
            )}

            <div className={styles.cartList}>
              {cartItems.map((item, index) => {
                const productId = getProductId(item);
                const quantity = getProductQuantity(item);
                const price = getProductPrice(item);
                const oldPrice = Number(
                  item?.oldPrice ||
                    item?.mrp ||
                    item?.product?.mrp ||
                    price,
                );

                const shade =
                  item?.selectedShade?.name ||
                  item?.shade?.name ||
                  item?.shade ||
                  "";

                const size =
                  item?.selectedSize?.label ||
                  item?.selectedSize?.name ||
                  item?.size?.label ||
                  item?.size ||
                  "";

                return (
                  <article
                    key={`${productId}-${shade}-${size}-${index}`}
                    className={styles.cartItem}
                  >
                    <Link
                      to={`/product/${item?.slug || item?.product?.slug || productId}`}
                      className={styles.imageWrapper}
                    >
                      <img
                        src={getProductImage(item)}
                        alt={getProductName(item)}
                      />
                    </Link>

                    <div className={styles.itemInformation}>
                      <span className={styles.category}>
                        {item?.category?.name ||
                          item?.category ||
                          item?.product?.category?.name ||
                          "NEXT CELL BEAUTY"}
                      </span>

                      <Link
                        to={`/product/${item?.slug || item?.product?.slug || productId}`}
                        className={styles.productName}
                      >
                        {getProductName(item)}
                      </Link>

                      {(shade || size) && (
                        <div className={styles.variantList}>
                          {shade && (
                            <span>
                              Shade: <strong>{shade}</strong>
                            </span>
                          )}

                          {size && (
                            <span>
                              Size: <strong>{size}</strong>
                            </span>
                          )}
                        </div>
                      )}

                      <div className={styles.mobilePrice}>
                        <strong>₹{price.toLocaleString("en-IN")}</strong>

                        {oldPrice > price && (
                          <span>₹{oldPrice.toLocaleString("en-IN")}</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.quantityBox}>
                      <span>Quantity</span>

                      <div>
                        <button
                          type="button"
                          disabled={quantity <= 1}
                          onClick={() =>
                            handleQuantityChange(item, quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>

                        <strong>{quantity}</strong>

                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(item, quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.itemPrice}>
                      <span>Price</span>
                      <strong>₹{price.toLocaleString("en-IN")}</strong>

                      {oldPrice > price && (
                        <del>₹{oldPrice.toLocaleString("en-IN")}</del>
                      )}
                    </div>

                    <div className={styles.itemTotal}>
                      <span>Total</span>
                      <strong>
                        ₹{(price * quantity).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemove(item)}
                      aria-label={`Remove ${getProductName(item)} from cart`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className={styles.summaryColumn}>
            <div className={styles.summaryCard}>
              <span className={styles.summaryEyebrow}>Order Details</span>
              <h2>Cart Summary</h2>

              <div className={styles.summaryRows}>
                <div>
                  <span>Subtotal</span>
                  <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
                </div>

                <div>
                  <span>Shipping</span>
                  <strong className={shippingCharge === 0 ? styles.free : ""}>
                    {shippingCharge === 0
                      ? "FREE"
                      : `₹${shippingCharge.toLocaleString("en-IN")}`}
                  </strong>
                </div>

                {discount > 0 && (
                  <div>
                    <span>Discount</span>
                    <strong className={styles.discount}>
                      −₹{discount.toLocaleString("en-IN")}
                    </strong>
                  </div>
                )}
              </div>

              <div className={styles.couponBox}>
                <label htmlFor="coupon">Have a coupon?</label>

                <div>
                  <input
                    id="coupon"
                    type="text"
                    placeholder="Enter coupon code"
                  />

                  <button type="button">Apply</button>
                </div>
              </div>

              <div className={styles.totalRow}>
                <div>
                  <span>Total Amount</span>
                  <small>Inclusive of all taxes</small>
                </div>

                <strong>₹{finalTotal.toLocaleString("en-IN")}</strong>
              </div>

              <button
                type="button"
                className={styles.checkoutButton}
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>

              <div className={styles.secureMessage}>
                <ShieldCheck size={18} />

                <span>
                  Secure checkout with trusted payment methods
                </span>
              </div>
            </div>

            <div className={styles.helpCard}>
              <strong>Need help with your order?</strong>
              <p>Our beauty support team is available to assist you.</p>
              <Link to="/contact">Contact Support</Link>
            </div>
          </aside>
        </div>
      </section>

      <div className={styles.mobileCheckoutBar}>
        <div>
          <span>Total</span>
          <strong>₹{finalTotal.toLocaleString("en-IN")}</strong>
        </div>

        <button type="button" onClick={() => navigate("/checkout")}>
          Checkout
          <ArrowRight size={17} />
        </button>
      </div>
    </main>
  );
}

export default CartPage;