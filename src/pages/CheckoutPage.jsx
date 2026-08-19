import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext.jsx";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Check,
  ChevronDown,
  CreditCard,
  MapPin,
  ShieldCheck,
  Smartphone,
  Truck,
  WalletCards,
} from "lucide-react";

import { createOrder } from "../api/orderApi.js";
import {
  createPaymentOrder,
  verifyPayment,
} from "../services/paymentService.js";

import styles from "./CheckoutPage.module.css";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  addressLineOne: "",
  addressLineTwo: "",
  landmark: "",
  city: "",
  state: "",
  pinCode: "",
};

const paymentMethods = [
  {
    id: "upi",
    title: "UPI Payment",
    description: "Google Pay, PhonePe, Paytm and other UPI apps",
    icon: Smartphone,
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    description: "Visa, Mastercard, RuPay and supported cards",
    icon: CreditCard,
  },
  {
    id: "netbanking",
    title: "Net Banking",
    description: "Pay securely using your bank account",
    icon: WalletCards,
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    description: "Pay when your order is delivered",
    icon: Banknote,
  },
];

const deliveryMethods = [
  {
    id: "standard",
    title: "Standard Delivery",
    description: "Delivery within 4–6 business days",
    price: 0,
  },
  {
    id: "express",
    title: "Express Delivery",
    description: "Delivery within 2–3 business days",
    price: 149,
  },
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), {
        once: true,
      });

      existingScript.addEventListener("error", () => resolve(false), {
        once: true,
      });

      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

function getCartItems(cartState) {
  return (
    cartState?.items ||
    cartState?.cartItems ||
    cartState?.products ||
    []
  );
}

function getProductId(item) {
  return (
    item?.productId ||
    item?._id ||
    item?.id ||
    item?.product?._id ||
    item?.product?.id ||
    ""
  );
}

function getProductName(item) {
  return (
    item?.name ||
    item?.productName ||
    item?.product?.name ||
    "Beauty Product"
  );
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

function getProductPrice(item) {
  return Number(
    item?.price ||
      item?.sellingPrice ||
      item?.salePrice ||
      item?.product?.sellingPrice ||
      item?.product?.salePrice ||
      item?.product?.price ||
      0,
  );
}

function getProductQuantity(item) {
  return Number(item?.quantity || item?.qty || 1);
}

function normalizeOrderResponse(response) {
  return (
    response?.order ||
    response?.data?.order ||
    response?.data?.data?.order ||
    response?.data?.data ||
    response?.data ||
    response
  );
}

function getCreatedOrderId(order, response) {
  return (
    order?._id ||
    order?.id ||
    order?.orderId ||
    order?.orderNumber ||
    response?.orderId ||
    response?.data?.orderId ||
    ""
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const cartState = useSelector((state) => state.cart);
  const cartItems = getCartItems(cartState);

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        addressLineOne: prev.addressLineOne || user.address || "",
      }));
    }
  }, [user]);
  const [errors, setErrors] = useState({});

  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [selectedDelivery, setSelectedDelivery] =
    useState("standard");

  const [billingSame, setBillingSame] = useState(true);
  const [saveAddress, setSaveAddress] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponStatus, setCouponStatus] = useState("");

  const [discount, setDiscount] = useState(
    Number(cartState?.discount || 0),
  );

  const [checkoutError, setCheckoutError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return (
        total +
        getProductPrice(item) * getProductQuantity(item)
      );
    }, 0);
  }, [cartItems]);

  const selectedDeliveryData =
    deliveryMethods.find(
      (method) => method.id === selectedDelivery,
    ) || deliveryMethods[0];

  const deliveryCharge =
    subtotal >= 999 && selectedDelivery === "standard"
      ? 0
      : selectedDeliveryData.price;

  const finalTotal = Math.max(
    0,
    subtotal + deliveryCharge - discount,
  );

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === "phone") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "pinCode") {
      nextValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setForm((current) => ({
      ...current,
      [name]: nextValue,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }

    if (checkoutError) {
      setCheckoutError("");
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      nextErrors.phone =
        "Enter a valid 10-digit Indian mobile number.";
    }

    if (!form.addressLineOne.trim()) {
      nextErrors.addressLineOne = "Address is required.";
    }

    if (!form.city.trim()) {
      nextErrors.city = "City is required.";
    }

    if (!form.state.trim()) {
      nextErrors.state = "State is required.";
    }

    if (!/^\d{6}$/.test(form.pinCode)) {
      nextErrors.pinCode = "Enter a valid 6-digit PIN code.";
    }

    if (!acceptTerms) {
      nextErrors.terms =
        "Please accept the terms and conditions.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleCouponApply = () => {
    const code = couponCode.trim().toUpperCase();

    setCouponMessage("");
    setCouponStatus("");

    if (!code) {
      setCouponStatus("error");
      setCouponMessage("Please enter a coupon code.");
      return;
    }

    if (subtotal <= 0) {
      setCouponStatus("error");
      setCouponMessage("Add products before applying a coupon.");
      return;
    }

    if (code === "BEAUTY10") {
      const couponDiscount = Math.min(
        Math.round(subtotal * 0.1),
        500,
      );

      setDiscount(couponDiscount);
      setCouponStatus("success");
      setCouponMessage(
        `Coupon applied. You saved ₹${couponDiscount.toLocaleString(
          "en-IN",
        )}.`,
      );

      return;
    }

    setDiscount(Number(cartState?.discount || 0));
    setCouponStatus("error");
    setCouponMessage("This coupon code is not valid.");
  };

  const createOrderPayload = () => {
    const normalizedItems = cartItems.map((item) => {
      const productId = getProductId(item);

      const selectedShade =
        item?.selectedShade || item?.shade || null;

      const selectedSize =
        item?.selectedSize || item?.size || null;

      return {
        product: productId,
        productId,
        name: getProductName(item),
        image: getProductImage(item),
        slug: item?.slug || item?.product?.slug || "",
        quantity: getProductQuantity(item),
        price: getProductPrice(item),

        selectedShade:
          typeof selectedShade === "object"
            ? selectedShade
            : selectedShade
              ? { name: selectedShade }
              : null,

        selectedSize:
          typeof selectedSize === "object"
            ? selectedSize
            : selectedSize
              ? { label: selectedSize }
              : null,
      };
    });

    const address = {
      fullName: form.fullName.trim(),
      name: form.fullName.trim(),
      phone: form.phone,
      addressLineOne: form.addressLineOne.trim(),
      addressLine1: form.addressLineOne.trim(),
      addressLineTwo: form.addressLineTwo.trim(),
      addressLine2: form.addressLineTwo.trim(),
      landmark: form.landmark.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pinCode: form.pinCode,
      postalCode: form.pinCode,
      country: "India",
    };

    return {
      customer: {
        fullName: form.fullName.trim(),
        name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
      },

      customerName: form.fullName.trim(),
      customerEmail: form.email.trim().toLowerCase(),
      customerPhone: form.phone,

      shippingAddress: address,
      billingAddress: billingSame ? address : null,

      billingSameAsShipping: billingSame,
      saveAddress,

      items: normalizedItems,
      orderItems: normalizedItems,

      paymentMethod: selectedPayment,
      paymentMode: selectedPayment,

      deliveryMethod: selectedDelivery,
      shippingMethod: selectedDelivery,

      subtotal,
      shippingCharge: deliveryCharge,
      deliveryCharge,
      discount,

      totalAmount: finalTotal,
      grandTotal: finalTotal,
      total: finalTotal,

      pricing: {
        subtotal,
        shippingCharge: deliveryCharge,
        deliveryCharge,
        discount,
        total: finalTotal,
        grandTotal: finalTotal,
      },

      couponCode: couponCode.trim().toUpperCase() || null,
      currency: "INR",
    };
  };

  const handlePlaceOrder = async () => {
    setCheckoutError("");

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });

      return;
    }

    if (!cartItems.length) {
      navigate("/cart");
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = createOrderPayload();

      const orderResponse = await createOrder(orderPayload);
      const createdOrder = normalizeOrderResponse(orderResponse);

      const applicationOrderId = getCreatedOrderId(
        createdOrder,
        orderResponse,
      );

      if (!applicationOrderId) {
        throw new Error(
          "Order was created, but the server did not return an order ID.",
        );
      }

      if (selectedPayment === "cod") {
        navigate(`/order-success/${applicationOrderId}`, {
          state: {
            order: createdOrder,
            orderResponse,
            paymentMethod: "cod",
          },
        });

        return;
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Payment gateway could not be loaded. Please check your internet connection.",
        );
      }

      const paymentOrderResponse = await createPaymentOrder({
        orderId: applicationOrderId,
        applicationOrderId,
        amount: finalTotal,
        currency: "INR",

        customer: {
          name: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone,
        },
      });

      const paymentData =
        paymentOrderResponse?.data?.data ||
        paymentOrderResponse?.data ||
        paymentOrderResponse;

      const razorpayOrderId =
        paymentData?.razorpayOrderId ||
        paymentData?.razorpay_order_id ||
        paymentData?.orderId ||
        paymentData?.id;

      const razorpayKey =
        paymentData?.key ||
        paymentData?.keyId ||
        paymentData?.razorpayKey ||
        paymentData?.razorpayKeyId ||
        import.meta.env.VITE_RAZORPAY_KEY_ID;

      const razorpayAmount = Number(
        paymentData?.amount || Math.round(finalTotal * 100),
      );

      if (!razorpayOrderId) {
        throw new Error(
          "Payment order ID was not returned by the server.",
        );
      }

      if (!razorpayKey) {
        throw new Error(
          "Razorpay public key is missing. Check the payment API response or VITE_RAZORPAY_KEY_ID.",
        );
      }

      const options = {
        key: razorpayKey,
        amount: razorpayAmount,
        currency: paymentData?.currency || "INR",

        name: "NEXT CELL BEAUTY",
        description: `Payment for order ${applicationOrderId}`,

        order_id: razorpayOrderId,

        prefill: {
          name: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          contact: form.phone,
        },

        notes: {
          applicationOrderId,
          deliveryMethod: selectedDelivery,
        },

        theme: {
          color: "#00633f",
        },

        modal: {
          ondismiss: () => {
            setIsSubmitting(false);

            setCheckoutError(
              "Payment was cancelled. Your order may have been created with pending payment status.",
            );
          },
        },

        handler: async (paymentResponse) => {
          try {
            setIsSubmitting(true);
            setCheckoutError("");

            const verificationResponse = await verifyPayment({
              orderId: applicationOrderId,
              applicationOrderId,

              razorpayOrderId:
                paymentResponse.razorpay_order_id,

              razorpayPaymentId:
                paymentResponse.razorpay_payment_id,

              razorpaySignature:
                paymentResponse.razorpay_signature,

              razorpay_order_id:
                paymentResponse.razorpay_order_id,

              razorpay_payment_id:
                paymentResponse.razorpay_payment_id,

              razorpay_signature:
                paymentResponse.razorpay_signature,
            });

            const verificationData =
              verificationResponse?.data?.data ||
              verificationResponse?.data ||
              verificationResponse;

            const paymentVerified =
              verificationData?.success !== false &&
              verificationData?.verified !== false &&
              verificationData?.status !== "failed";

            if (!paymentVerified) {
              throw new Error(
                verificationData?.message ||
                  "Payment verification failed.",
              );
            }

            navigate(`/order-success/${applicationOrderId}`, {
              state: {
                order: createdOrder,
                orderResponse,
                payment: paymentResponse,
                verification: verificationData,
                paymentMethod: selectedPayment,
              },
            });
          } catch (verificationError) {
            console.error(
              "Payment verification failed:",
              verificationError,
            );

            setCheckoutError(
              verificationError?.response?.data?.message ||
                verificationError?.response?.data?.error ||
                verificationError?.message ||
                "Payment was received, but verification failed. Please contact customer support.",
            );
          } finally {
            setIsSubmitting(false);
          }
        },
      };

      const razorpayCheckout = new window.Razorpay(options);

      razorpayCheckout.on(
        "payment.failed",
        (failureResponse) => {
          console.error(
            "Razorpay payment failed:",
            failureResponse,
          );

          setIsSubmitting(false);

          setCheckoutError(
            failureResponse?.error?.description ||
              failureResponse?.error?.reason ||
              "Payment failed. Please retry or select another payment method.",
          );
        },
      );

      razorpayCheckout.open();
    } catch (error) {
      console.error("Order placement failed:", error);

      setCheckoutError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to place your order. Please try again.",
      );

      setIsSubmitting(false);
    }
  };

  if (!cartItems.length) {
    return (
      <main className={styles.emptyPage}>
        <div className="container">
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              <Truck size={38} />
            </div>

            <h1>Your cart is empty</h1>

            <p>
              Add skincare, makeup, haircare or other beauty products
              before proceeding to checkout.
            </p>

            <Link to="/shop">Continue Shopping</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.pageHeader}>
        <div className={`container ${styles.headerInner}`}>
          <Link to="/cart">
            <ArrowLeft size={17} />
            Back to Cart
          </Link>

          <div className={styles.headerTitle}>
            <span>Secure Checkout</span>
            <h1>Complete Your Order</h1>
          </div>

          <div className={styles.secureHeader}>
            <ShieldCheck size={20} />

            <span>
              100% Secure
              <small>Encrypted checkout</small>
            </span>
          </div>
        </div>
      </section>

      <section className={styles.checkoutSection}>
        <div className={`container ${styles.checkoutLayout}`}>
          <div className={styles.formColumn}>
            <div className={styles.stepsRow}>
              <div className={styles.activeStep}>
                <span>1</span>
                <strong>Address</strong>
              </div>

              <i />

              <div className={styles.activeStep}>
                <span>2</span>
                <strong>Delivery</strong>
              </div>

              <i />

              <div className={styles.activeStep}>
                <span>3</span>
                <strong>Payment</strong>
              </div>
            </div>

            {checkoutError && (
              <div className={styles.checkoutError} role="alert">
                <strong>Checkout Error</strong>
                <p>{checkoutError}</p>
              </div>
            )}

            <section className={styles.checkoutCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardNumber}>01</div>

                <div>
                  <span>Customer Information</span>
                  <h2>Contact Details</h2>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div
                  className={`${styles.formGroup} ${
                    errors.fullName ? styles.hasError : ""
                  }`}
                >
                  <label htmlFor="fullName">
                    Full Name <em>*</em>
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />

                  {errors.fullName && (
                    <small>{errors.fullName}</small>
                  )}
                </div>

                <div
                  className={`${styles.formGroup} ${
                    errors.phone ? styles.hasError : ""
                  }`}
                >
                  <label htmlFor="phone">
                    Mobile Number <em>*</em>
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    autoComplete="tel"
                  />

                  {errors.phone && <small>{errors.phone}</small>}
                </div>

                <div
                  className={`${styles.formGroup} ${
                    styles.fullWidth
                  } ${errors.email ? styles.hasError : ""}`}
                >
                  <label htmlFor="email">
                    Email Address <em>*</em>
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />

                  {errors.email && <small>{errors.email}</small>}

                  <p>
                    Order confirmation and invoice will be sent to
                    this email.
                  </p>
                </div>
              </div>
            </section>

            <section className={styles.checkoutCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardNumber}>02</div>

                <div>
                  <span>Where Should We Deliver?</span>
                  <h2>Shipping Address</h2>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div
                  className={`${styles.formGroup} ${
                    styles.fullWidth
                  } ${
                    errors.addressLineOne
                      ? styles.hasError
                      : ""
                  }`}
                >
                  <label htmlFor="addressLineOne">
                    Address Line 1 <em>*</em>
                  </label>

                  <input
                    id="addressLineOne"
                    name="addressLineOne"
                    type="text"
                    value={form.addressLineOne}
                    onChange={handleInputChange}
                    placeholder="House number, building and street"
                    autoComplete="address-line1"
                  />

                  {errors.addressLineOne && (
                    <small>{errors.addressLineOne}</small>
                  )}
                </div>

                <div
                  className={`${styles.formGroup} ${styles.fullWidth}`}
                >
                  <label htmlFor="addressLineTwo">
                    Address Line 2
                  </label>

                  <input
                    id="addressLineTwo"
                    name="addressLineTwo"
                    type="text"
                    value={form.addressLineTwo}
                    onChange={handleInputChange}
                    placeholder="Area, colony or locality"
                    autoComplete="address-line2"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="landmark">Landmark</label>

                  <input
                    id="landmark"
                    name="landmark"
                    type="text"
                    value={form.landmark}
                    onChange={handleInputChange}
                    placeholder="Nearby landmark"
                  />
                </div>

                <div
                  className={`${styles.formGroup} ${
                    errors.pinCode ? styles.hasError : ""
                  }`}
                >
                  <label htmlFor="pinCode">
                    PIN Code <em>*</em>
                  </label>

                  <input
                    id="pinCode"
                    name="pinCode"
                    type="text"
                    value={form.pinCode}
                    onChange={handleInputChange}
                    placeholder="6-digit PIN code"
                    inputMode="numeric"
                    autoComplete="postal-code"
                  />

                  {errors.pinCode && (
                    <small>{errors.pinCode}</small>
                  )}
                </div>

                <div
                  className={`${styles.formGroup} ${
                    errors.city ? styles.hasError : ""
                  }`}
                >
                  <label htmlFor="city">
                    City <em>*</em>
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    autoComplete="address-level2"
                  />

                  {errors.city && <small>{errors.city}</small>}
                </div>

                <div
                  className={`${styles.formGroup} ${
                    errors.state ? styles.hasError : ""
                  }`}
                >
                  <label htmlFor="state">
                    State <em>*</em>
                  </label>

                  <div className={styles.selectWrapper}>
                    <select
                      id="state"
                      name="state"
                      value={form.state}
                      onChange={handleInputChange}
                      autoComplete="address-level1"
                    >
                      <option value="">Select state</option>
                      <option value="Andhra Pradesh">
                        Andhra Pradesh
                      </option>
                      <option value="Bihar">Bihar</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Madhya Pradesh">
                        Madhya Pradesh
                      </option>
                      <option value="Maharashtra">
                        Maharashtra
                      </option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Uttar Pradesh">
                        Uttar Pradesh
                      </option>
                      <option value="West Bengal">
                        West Bengal
                      </option>
                      <option value="Other">Other</option>
                    </select>

                    <ChevronDown size={17} />
                  </div>

                  {errors.state && <small>{errors.state}</small>}
                </div>
              </div>

              <div className={styles.checkboxRows}>
                <label>
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(event) =>
                      setSaveAddress(event.target.checked)
                    }
                  />

                  <span>
                    <Check size={13} />
                  </span>

                  Save this address for future orders
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={billingSame}
                    onChange={(event) =>
                      setBillingSame(event.target.checked)
                    }
                  />

                  <span>
                    <Check size={13} />
                  </span>

                  Billing address is the same as shipping address
                </label>
              </div>
            </section>

            <section className={styles.checkoutCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardNumber}>03</div>

                <div>
                  <span>Select Shipping Speed</span>
                  <h2>Delivery Method</h2>
                </div>
              </div>

              <div className={styles.deliveryOptions}>
                {deliveryMethods.map((method) => (
                  <label
                    key={method.id}
                    className={
                      selectedDelivery === method.id
                        ? styles.selectedOption
                        : ""
                    }
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={method.id}
                      checked={selectedDelivery === method.id}
                      onChange={() =>
                        setSelectedDelivery(method.id)
                      }
                    />

                    <div className={styles.optionRadio}>
                      <span />
                    </div>

                    <div className={styles.deliveryIcon}>
                      <Truck size={22} />
                    </div>

                    <div className={styles.optionText}>
                      <strong>{method.title}</strong>
                      <span>{method.description}</span>
                    </div>

                    <strong className={styles.optionPrice}>
                      {method.price === 0
                        ? "FREE"
                        : `₹${method.price}`}
                    </strong>
                  </label>
                ))}
              </div>
            </section>

            <section className={styles.checkoutCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardNumber}>04</div>

                <div>
                  <span>Choose How to Pay</span>
                  <h2>Payment Method</h2>
                </div>
              </div>

              <div className={styles.paymentOptions}>
                {paymentMethods.map((method) => {
                  const Icon = method.icon;

                  return (
                    <label
                      key={method.id}
                      className={
                        selectedPayment === method.id
                          ? styles.selectedOption
                          : ""
                      }
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={() =>
                          setSelectedPayment(method.id)
                        }
                      />

                      <div className={styles.optionRadio}>
                        <span />
                      </div>

                      <div className={styles.paymentIcon}>
                        <Icon size={22} />
                      </div>

                      <div className={styles.optionText}>
                        <strong>{method.title}</strong>
                        <span>{method.description}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {selectedPayment === "cod" && (
                <div className={styles.paymentNotice}>
                  <BadgeCheck size={19} />

                  <p>
                    Cash on Delivery availability may depend on the
                    delivery PIN code and final order value.
                  </p>
                </div>
              )}
            </section>

            <label
              className={`${styles.termsCheckbox} ${
                errors.terms ? styles.termsError : ""
              }`}
            >
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(event) => {
                  setAcceptTerms(event.target.checked);

                  if (errors.terms) {
                    setErrors((current) => ({
                      ...current,
                      terms: "",
                    }));
                  }
                }}
              />

              <span>
                <Check size={13} />
              </span>

              <p>
                I agree to the{" "}
                <Link to="/terms-and-conditions">
                  Terms & Conditions
                </Link>
                ,{" "}
                <Link to="/privacy-policy">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link to="/return-refund-policy">
                  Return & Refund Policy
                </Link>
                .
              </p>
            </label>

            {errors.terms && (
              <p className={styles.termsErrorMessage}>
                {errors.terms}
              </p>
            )}
          </div>

          <aside className={styles.summaryColumn}>
            <div className={styles.summaryCard}>
              <span className={styles.summaryEyebrow}>
                Review Your Purchase
              </span>

              <h2>Order Summary</h2>

              <div className={styles.productList}>
                {cartItems.map((item, index) => {
                  const quantity = getProductQuantity(item);
                  const price = getProductPrice(item);

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
                      key={`${getProductId(item)}-${index}`}
                      className={styles.productItem}
                    >
                      <div className={styles.productImage}>
                        <img
                          src={getProductImage(item)}
                          alt={getProductName(item)}
                        />

                        <span>{quantity}</span>
                      </div>

                      <div className={styles.productInformation}>
                        <strong>{getProductName(item)}</strong>

                        {(shade || size) && (
                          <small>
                            {[shade, size]
                              .filter(Boolean)
                              .join(" • ")}
                          </small>
                        )}
                      </div>

                      <strong className={styles.productPrice}>
                        ₹
                        {(price * quantity).toLocaleString(
                          "en-IN",
                        )}
                      </strong>
                    </article>
                  );
                })}
              </div>

              <div className={styles.couponBox}>
                <label htmlFor="checkoutCoupon">
                  Apply Coupon
                </label>

                <div>
                  <input
                    id="checkoutCoupon"
                    type="text"
                    value={couponCode}
                    onChange={(event) => {
                      setCouponCode(event.target.value);

                      if (couponMessage) {
                        setCouponMessage("");
                        setCouponStatus("");
                      }
                    }}
                    placeholder="Coupon code"
                  />

                  <button type="button" onClick={handleCouponApply}>
                    Apply
                  </button>
                </div>

                {couponMessage && (
                  <p
                    className={
                      couponStatus === "success"
                        ? styles.couponSuccess
                        : styles.couponError
                    }
                  >
                    {couponMessage}
                  </p>
                )}
              </div>

              <div className={styles.priceSummary}>
                <div>
                  <span>Subtotal</span>
                  <strong>
                    ₹{subtotal.toLocaleString("en-IN")}
                  </strong>
                </div>

                <div>
                  <span>Delivery</span>

                  <strong
                    className={
                      deliveryCharge === 0 ? styles.freeText : ""
                    }
                  >
                    {deliveryCharge === 0
                      ? "FREE"
                      : `₹${deliveryCharge.toLocaleString(
                          "en-IN",
                        )}`}
                  </strong>
                </div>

                {discount > 0 && (
                  <div>
                    <span>Discount</span>

                    <strong className={styles.discountText}>
                      −₹{discount.toLocaleString("en-IN")}
                    </strong>
                  </div>
                )}
              </div>

              <div className={styles.totalRow}>
                <div>
                  <span>Total Payable</span>
                  <small>Inclusive of all taxes</small>
                </div>

                <strong>
                  ₹{finalTotal.toLocaleString("en-IN")}
                </strong>
              </div>

              <button
                type="button"
                className={styles.placeOrderButton}
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Processing Order..."
                  : selectedPayment === "cod"
                    ? "Place Order"
                    : "Proceed to Payment"}
              </button>

              <div className={styles.securityMessage}>
                <ShieldCheck size={18} />

                <p>
                  Your payment and personal information are securely
                  encrypted.
                </p>
              </div>
            </div>

            <div className={styles.supportCard}>
              <MapPin size={22} />

              <div>
                <strong>Delivery Support</strong>

                <p>
                  Need help with delivery or checkout? Contact our
                  customer support team.
                </p>

                <Link to="/contact">Get Support</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div className={styles.mobilePaymentBar}>
        <div>
          <span>Total Payable</span>

          <strong>₹{finalTotal.toLocaleString("en-IN")}</strong>
        </div>

        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Processing..."
            : selectedPayment === "cod"
              ? "Place Order"
              : "Pay Now"}
        </button>
      </div>
    </main>
  );
}

export default CheckoutPage;