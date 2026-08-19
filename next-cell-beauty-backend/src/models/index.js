import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const transformDefault = {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString?.() || ret.id;
    delete ret._id;
    return ret;
  }
};

const makeSchema = (definition, options = {}) => new Schema(definition, {
  timestamps: true,
  strict: false,
  toJSON: transformDefault,
  toObject: transformDefault,
  ...options
});

export const User = mongoose.model(
  "User",
  makeSchema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    role: { type: String, default: "ADMIN" },
    status: { type: String, default: "ACTIVE" },
    googleId: { type: String },
    provider: { type: String, default: "email" },
    avatar: { type: String }
  })
);

export const RefreshToken = mongoose.model(
  "RefreshToken",
  makeSchema({
    token: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    expiresAt: { type: Date, required: true }
  })
);

export const Product = mongoose.model(
  "Product",
  makeSchema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, required: true, unique: true },
    price: Number,
    compareAtPrice: Number,
    stock: Number,
    lowStockThreshold: Number,
    shortDescription: String,
    description: String,
    categoryId: String,
    category: { type: Object, default: {} },
    brandId: String,
    brand: { type: Object, default: {} },
    images: [{ type: String }],
    ingredients: String,
    howToUse: String,
    benefits: String,
    skinType: String,
    concern: String,
    shade: String,
    tags: String,
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    rating: Number,
    reviewsCount: Number,
    status: { type: String, default: "ACTIVE" }
  })
);

export const Category = mongoose.model(
  "Category",
  makeSchema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
    parentId: String,
    parent: { type: Object, default: null },
    status: { type: String, default: "ACTIVE" }
  })
);

export const Brand = mongoose.model(
  "Brand",
  makeSchema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    logo: String,
    website: String,
    status: { type: String, default: "ACTIVE" }
  })
);

export const Banner = mongoose.model(
  "Banner",
  makeSchema({
    title: { type: String, required: true },
    subtitle: String,
    description: String,
    desktopImage: String,
    mobileImage: String,
    buttonText: String,
    buttonUrl: String,
    position: Number,
    startDate: String,
    endDate: String,
    status: { type: String, default: "ACTIVE" }
  })
);

export const Blog = mongoose.model(
  "Blog",
  makeSchema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    featuredImage: String,
    shortDescription: String,
    content: String,
    author: String,
    category: String,
    tags: String,
    seoTitle: String,
    seoDescription: String,
    status: { type: String, default: "PUBLISHED" },
    publishedAt: String
  })
);

export const FAQ = mongoose.model(
  "FAQ",
  makeSchema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: String,
    displayOrder: Number,
    status: { type: String, default: "ACTIVE" }
  })
);

export const Policy = mongoose.model(
  "Policy",
  makeSchema({
    title: String,
    type: { type: String, required: true, unique: true },
    content: String,
    status: { type: String, default: "PUBLISHED" },
    lastUpdated: String
  })
);

export const Setting = mongoose.model(
  "Setting",
  makeSchema({
    key: { type: String, required: true, unique: true },
    value: String
  })
);

export const Order = mongoose.model(
  "Order",
  makeSchema({
    orderNumber: String,
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    userId: String,
    customerId: String,
    items: Array,
    subtotal: Number,
    discount: Number,
    couponCode: String,
    tax: Number,
    shippingCharge: Number,
    totalAmount: Number,
    paymentMethod: String,
    paymentStatus: String,
    orderStatus: String,
    shippingStatus: String,
    shippingAddress: String,
    billingAddress: String,
    timeline: Array,
    status: String
  })
);

export const Address = mongoose.model(
  "Address",
  makeSchema({
    userId: { type: String, required: true },
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: { type: String, default: "India" },
    postalCode: String,
    addressType: { type: String, default: "home" },
    isDefault: { type: Boolean, default: false }
  })
);

export const Wishlist = mongoose.model(
  "Wishlist",
  makeSchema({
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    product: { type: Object, default: {} }
  })
);

export const Customer = mongoose.model(
  "Customer",
  makeSchema({
    name: String,
    email: { type: String, required: true, unique: true },
    phone: String,
    status: String
  })
);

export const ReturnRequest = mongoose.model(
  "ReturnRequest",
  makeSchema({
    orderId: String,
    customerName: String,
    reason: String,
    refundAmount: Number,
    returnStatus: String,
    status: String
  })
);

export const Coupon = mongoose.model(
  "Coupon",
  makeSchema({
    code: { type: String, required: true, unique: true },
    discountType: String,
    discountValue: Number,
    minOrderAmount: Number,
    maxDiscount: Number,
    startDate: String,
    endDate: String,
    expiresAt: String,
    usageLimit: Number,
    usedCount: Number,
    perUserLimit: Number,
    applicableCategories: String,
    applicableProducts: String,
    status: String
  })
);

export const Review = mongoose.model(
  "Review",
  makeSchema({
    productId: String,
    customerName: String,
    rating: Number,
    comment: String,
    status: String
  })
);

export const Tutorial = mongoose.model(
  "Tutorial",
  makeSchema({
    title: String,
    slug: String,
    description: String,
    thumbnail: String,
    videoUrl: String,
    category: String,
    productsUsed: String,
    author: String,
    publishedDate: String,
    duration: String,
    difficulty: String,
    featured: { type: Boolean, default: false },
    stepByStepGuide: Array,
    status: String
  })
);

export const Shade = mongoose.model(
  "Shade",
  makeSchema({
    name: String,
    hex: String,
    status: String
  })
);

export const SkinQuizQuestion = mongoose.model(
  "SkinQuizQuestion",
  makeSchema({
    key: { type: String, required: true },
    title: { type: String, required: true },
    question: { type: String, required: true },
    description: String,
    order: { type: Number, default: 0 },
    options: [
      {
        id: String,
        text: { type: String, required: true },
        value: String,
        skinType: String,
        recommendedProduct: String,
        status: String
      }
    ],
    status: { type: String, default: "ACTIVE" }
  })
);

export const ShadeFinderQuestion = mongoose.model(
  "ShadeFinderQuestion",
  makeSchema({
    key: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    options: [
      {
        id: String,
        label: { type: String, required: true },
        value: String,
        swatch: String,
        accent: String,
        status: String
      }
    ],
    type: { type: String, default: "choice" },
    status: { type: String, default: "ACTIVE" }
  })
);

export const ShadeFinderResult = mongoose.model(
  "ShadeFinderResult",
  makeSchema({
    title: String,
    description: String,
    skinTone: String,
    undertone: String,
    productType: String,
    finish: String,
    shadeName: String,
    blendHex: String,
    toneHex: String,
    undertoneHex: String,
    explanation: String,
    suggestedProductType: String,
    recommendedProducts: [String],
    status: { type: String, default: "ACTIVE" }
  })
);

export const SkinQuizResult = mongoose.model(
  "SkinQuizResult",
  makeSchema({
    title: String,
    description: String,
    skinType: String,        // match condition — "" or "any" = wildcard
    concern: String,         // match condition — "" or "any" = wildcard
    ageRange: String,        // match condition — "" or "any" = wildcard
    sensitivity: String,     // match condition — "" or "any" = wildcard
    routine: String,         // match condition — "" or "any" = wildcard
    priority: { type: Number, default: 0 }, // higher wins on tie
    morningRoutine: [String],
    nightRoutine: [String],
    recommendedCategories: [String],
    recommendedProducts: [String], // product IDs or slugs
    note: String,
    status: { type: String, default: "ACTIVE" }
  })
);

export const seedDefaultData = async () => {
  const adminEmail = "admin@nextcall.com";
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: bcrypt.hashSync("admin123", 10),
      role: "ADMIN",
      status: "ACTIVE"
    });
  }

  const categoriesCount = await Category.countDocuments();
  if (!categoriesCount) {
    await Category.create([
      { name: "Skincare", slug: "skincare", description: "Advanced skincare", image: "", status: "ACTIVE" },
      { name: "Serums", slug: "serums", description: "High-performance serums", image: "", parent: { name: "Skincare" }, status: "ACTIVE" },
      { name: "Makeup", slug: "makeup", description: "Color cosmetics", image: "", status: "ACTIVE" }
    ]);
  }

  const brandsCount = await Brand.countDocuments();
  if (!brandsCount) {
    await Brand.create([
      { name: "Lumière Cell", slug: "lumiere-cell", description: "Swiss anti-aging", logo: "", website: "https://example.com", status: "ACTIVE" },
      { name: "Cellular Botanicals", slug: "cellular-botanicals", description: "Botanical science", logo: "", website: "https://example.com", status: "ACTIVE" }
    ]);
  }

  const productsCount = await Product.countDocuments();
  if (!productsCount) {
    await Product.create([
      {
        title: "Cellular Renewal Night Cream",
        slug: "cellular-renewal-night-cream",
        sku: "NCB-CRN-001",
        price: 2499,
        compareAtPrice: 1999,
        stock: 45,
        shortDescription: "Deeply moisturizing night cream powered by bioactive peptide cell therapy.",
        description: "Formulated with bio-identical peptide complex and botanical stem cells to accelerate cellular repair during sleep.",
        category: { name: "Skincare" },
        brand: { name: "Lumière Cell" },
        images: ["https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80"],
        featured: true,
        bestSeller: true,
        status: "ACTIVE"
      },
      {
        title: "Radiant Vitamin C Glow Serum",
        slug: "radiant-vitamin-c-glow-serum",
        sku: "NCB-RVC-002",
        price: 1899,
        compareAtPrice: 1699,
        stock: 18,
        shortDescription: "15% Pure Vitamin C + Ferulic Acid antioxidant brightening serum.",
        description: "High-potency serum targeting dark spots, hyperpigmentation, and dull skin texture.",
        category: { name: "Serums" },
        brand: { name: "Cellular Botanicals" },
        images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80"],
        featured: true,
        status: "ACTIVE"
      }
    ]);
  }

  const bannersCount = await Banner.countDocuments();
  if (!bannersCount) {
    await Banner.create([
      { title: "Glow Naturally", subtitle: "New arrivals", desktopImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80", mobileImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80", position: 1, status: "ACTIVE" }
    ]);
  }

  const blogsCount = await Blog.countDocuments();
  if (!blogsCount) {
    await Blog.create([
      {
        title: "How to Build a Skin Care Ritual",
        slug: "how-to-build-a-skin-care-ritual",
        featuredImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        shortDescription: "A simple step-by-step guide",
        content: "Consistency and gentle ingredients make the biggest difference.",
        author: "Dr. Sophia Vance",
        category: "Dermatology",
        tags: "skincare, routine",
        status: "PUBLISHED"
      }
    ]);
  }

  const faqsCount = await FAQ.countDocuments();
  if (!faqsCount) {
    await FAQ.create([
      { question: "Do you offer international shipping?", answer: "Yes, we ship worldwide.", category: "Shipping", displayOrder: 1, status: "ACTIVE" }
    ]);
  }

  const policiesCount = await Policy.countDocuments();
  if (!policiesCount) {
    await Policy.create([
      { title: "Privacy Policy", type: "PRIVACY_POLICY", content: "We respect your privacy.", status: "PUBLISHED" }
    ]);
  }

  const settingsCount = await Setting.countDocuments();
  if (!settingsCount) {
    await Setting.create({ key: "store_config", value: JSON.stringify({ storeName: "NEXT CELL BEAUTY" }) });
  }

  const shadeFinderQuestionsCount = await ShadeFinderQuestion.countDocuments();
  if (!shadeFinderQuestionsCount) {
    await ShadeFinderQuestion.create([
      {
        key: "skinTone",
        title: "Select Skin Tone",
        description: "Pick the undertone range that best matches your complexion.",
        type: "swatch",
        options: [
          { id: "sf-st-1", label: "Fair", value: "Fair", swatch: "#f8e8dc", accent: "Light porcelain", status: "ACTIVE" },
          { id: "sf-st-2", label: "Light", value: "Light", swatch: "#e6cbb4", accent: "Warm beige", status: "ACTIVE" },
          { id: "sf-st-3", label: "Medium", value: "Medium", swatch: "#c99469", accent: "Golden tan", status: "ACTIVE" },
          { id: "sf-st-4", label: "Tan", value: "Tan", swatch: "#9a5f35", accent: "Deep bronze", status: "ACTIVE" },
          { id: "sf-st-5", label: "Deep", value: "Deep", swatch: "#5f341f", accent: "Rich espresso", status: "ACTIVE" }
        ],
        status: "ACTIVE"
      },
      {
        key: "undertone",
        title: "Select Undertone",
        description: "Your undertone helps narrow the match.",
        type: "swatch",
        options: [
          { id: "sf-ut-1", label: "Cool", value: "Cool", swatch: "#f3dbe8", accent: "Cool pink", status: "ACTIVE" },
          { id: "sf-ut-2", label: "Neutral", value: "Neutral", swatch: "#f3e0c7", accent: "Balanced", status: "ACTIVE" },
          { id: "sf-ut-3", label: "Warm", value: "Warm", swatch: "#e7bd75", accent: "Golden", status: "ACTIVE" },
          { id: "sf-ut-4", label: "Olive", value: "Olive", swatch: "#8c7b45", accent: "Muted green", status: "ACTIVE" }
        ],
        status: "ACTIVE"
      },
      {
        key: "productType",
        title: "Select Product Type",
        description: "Choose the type of product you want to shop.",
        type: "card",
        options: [
          { id: "sf-pt-1", label: "Foundation", value: "Foundation", status: "ACTIVE" },
          { id: "sf-pt-2", label: "Concealer", value: "Concealer", status: "ACTIVE" },
          { id: "sf-pt-3", label: "Lipstick", value: "Lipstick", status: "ACTIVE" }
        ],
        status: "ACTIVE"
      },
      {
        key: "finish",
        title: "Preferred Finish",
        description: "This helps us refine your ideal look.",
        type: "card",
        options: [
          { id: "sf-fn-1", label: "Natural", value: "Natural", status: "ACTIVE" },
          { id: "sf-fn-2", label: "Matte", value: "Matte", status: "ACTIVE" },
          { id: "sf-fn-3", label: "Dewy", value: "Dewy", status: "ACTIVE" },
          { id: "sf-fn-4", label: "Full Coverage", value: "Full Coverage", status: "ACTIVE" }
        ],
        status: "ACTIVE"
      }
    ]);
  }

  const shadeFinderResultsCount = await ShadeFinderResult.countDocuments();
  if (!shadeFinderResultsCount) {
    await ShadeFinderResult.create([
      {
        title: "Porcelain Rose",
        description: "A cool-toned fair shade perfect for porcelain skin with pink undertones.",
        skinTone: "Fair",
        undertone: "Cool",
        productType: "Foundation",
        finish: "Natural",
        shadeName: "Porcelain Rose",
        blendHex: "#f8e8dc",
        toneHex: "#f8e8dc",
        undertoneHex: "#f3dbe8",
        explanation: "Foundation in Porcelain Rose gives a balanced natural finish with a seamless transition from fair skin to cool pink undertones.",
        suggestedProductType: "Foundation",
        recommendedProducts: ["Cellular Renewal Night Cream", "Radiant Vitamin C Glow Serum"],
        status: "ACTIVE"
      }
    ]);
  }

  const skinQuizQuestionsCount = await SkinQuizQuestion.countDocuments();
  if (!skinQuizQuestionsCount) {
    await SkinQuizQuestion.create([
      {
        key: "skinType",
        title: "Step 1: Skin Type",
        description: "Choose the skin type that feels closest to your own.",
        question: "Choose the skin type that feels closest to your own.",
        order: 1,
        options: [
          { id: "sq-st-1", text: "Normal", value: "Normal", skinType: "Normal", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-st-2", text: "Dry", value: "Dry", skinType: "Dry", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-st-3", text: "Oily", value: "Oily", skinType: "Oily", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-st-4", text: "Combination", value: "Combination", skinType: "Combination", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-st-5", text: "Sensitive", value: "Sensitive", skinType: "Sensitive", recommendedProduct: "", status: "ACTIVE" }
        ],
        status: "ACTIVE"
      },
      {
        key: "concern",
        title: "Step 2: Main Skin Concern",
        description: "Select the concern you want to focus on first.",
        question: "Select the concern you want to focus on first.",
        order: 2,
        options: [
          { id: "sq-co-1", text: "Acne", value: "Acne", skinType: "Oily", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-co-2", text: "Pigmentation", value: "Pigmentation", skinType: "Normal", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-co-3", text: "Dryness", value: "Dryness", skinType: "Dry", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-co-4", text: "Dullness", value: "Dullness", skinType: "Normal", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-co-5", text: "Fine Lines", value: "Fine Lines", skinType: "Normal", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-co-6", text: "Uneven Texture", value: "Uneven Texture", skinType: "Normal", recommendedProduct: "", status: "ACTIVE" }
        ],
        status: "ACTIVE"
      },
      {
        key: "ageRange",
        title: "Step 3: Age Range",
        description: "This helps us suggest age-appropriate nourishment.",
        question: "Select your age range.",
        order: 3,
        options: [
          { id: "sq-ar-1", text: "Under 20", value: "Under 20", skinType: "", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-ar-2", text: "20-29", value: "20-29", skinType: "", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-ar-3", text: "30-39", value: "30-39", skinType: "", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-ar-4", text: "40-49", value: "40-49", skinType: "", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-ar-5", text: "50+", value: "50+", skinType: "", recommendedProduct: "", status: "ACTIVE" }
        ],
        status: "ACTIVE"
      },
      {
        key: "sensitivity",
        title: "Step 4: Sensitivity",
        description: "We will keep your routine gentle if your skin is reactive.",
        question: "How sensitive is your skin?",
        order: 4,
        options: [
          { id: "sq-se-1", text: "Not Sensitive", value: "Not Sensitive", skinType: "", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-se-2", text: "Mildly Sensitive", value: "Mildly Sensitive", skinType: "Sensitive", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-se-3", text: "Very Sensitive", value: "Very Sensitive", skinType: "Sensitive", recommendedProduct: "", status: "ACTIVE" }
        ],
        status: "ACTIVE"
      },
      {
        key: "routine",
        title: "Step 5: Preferred Routine",
        description: "Choose the level of care you want in your daily ritual.",
        question: "Choose the level of care you want in your daily ritual.",
        order: 5,
        options: [
          { id: "sq-ru-1", text: "Simple Routine", value: "Simple Routine", skinType: "", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-ru-2", text: "Complete Routine", value: "Complete Routine", skinType: "", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-ru-3", text: "Budget-Friendly Routine", value: "Budget-Friendly Routine", skinType: "", recommendedProduct: "", status: "ACTIVE" },
          { id: "sq-ru-4", text: "Premium Routine", value: "Premium Routine", skinType: "", recommendedProduct: "", status: "ACTIVE" }
        ],
        status: "ACTIVE"
      }
    ]);
  }

  const skinQuizResultsCount = await SkinQuizResult.countDocuments();
  if (!skinQuizResultsCount) {
    await SkinQuizResult.create([
      {
        title: "Dry Skin — Dullness Focus",
        description: "Your skin needs deep hydration and a brightening boost to restore natural radiance.",
        skinType: "Dry",
        concern: "Dullness",
        ageRange: "any",
        sensitivity: "any",
        routine: "any",
        priority: 10,
        morningRoutine: ["Hydrating gel cleanser", "Vitamin C brightening serum", "Rich ceramide moisturiser", "Broad-spectrum SPF 50"],
        nightRoutine: ["Gentle oil cleanser", "Deep hydration serum", "Barrier repair night cream", "Lip and eye moisture balm"],
        recommendedCategories: ["Cleansers", "Brightening Serums", "Moisturisers", "Sunscreen"],
        recommendedProducts: [],
        note: "Focus on restoring your skin barrier and adding luminosity with targeted brightening actives.",
        status: "ACTIVE"
      },
      {
        title: "Dry Skin — Hydration Routine",
        description: "An intensive hydration-first routine to restore moisture balance and plumpness.",
        skinType: "Dry",
        concern: "Dryness",
        ageRange: "any",
        sensitivity: "any",
        routine: "any",
        priority: 10,
        morningRoutine: ["Cream cleanser", "Hyaluronic acid serum", "Rich moisturiser with ceramides", "Mineral SPF 50"],
        nightRoutine: ["Oil cleanser", "Deep hydration serum", "Overnight barrier cream", "Eye cream"],
        recommendedCategories: ["Cream Cleansers", "Hydrating Serums", "Barrier Repair Creams", "Sunscreen"],
        recommendedProducts: [],
        note: "Consistent hydration morning and night will rebuild your skin barrier over time.",
        status: "ACTIVE"
      },
      {
        title: "Oily Skin — Acne Control Routine",
        description: "A lightweight, targeted routine to reduce breakouts and control excess oil.",
        skinType: "Oily",
        concern: "Acne",
        ageRange: "any",
        sensitivity: "any",
        routine: "any",
        priority: 10,
        morningRoutine: ["Foaming gel cleanser", "Salicylic acid serum", "Oil-free gel moisturiser", "SPF 50 matte finish"],
        nightRoutine: ["Gel cleanser", "Niacinamide treatment", "Lightweight moisturiser", "Spot treatment if needed"],
        recommendedCategories: ["Gel Cleansers", "Acne Treatments", "Oil-Free Moisturisers", "Matte Sunscreen"],
        recommendedProducts: [],
        note: "Keep your routine lightweight to avoid congesting pores. Consistency is key for acne control.",
        status: "ACTIVE"
      },
      {
        title: "Sensitive Skin — Calming Routine",
        description: "A fragrance-free, barrier-supporting routine formulated to soothe reactive skin.",
        skinType: "Sensitive",
        concern: "any",
        ageRange: "any",
        sensitivity: "Very Sensitive",
        routine: "any",
        priority: 9,
        morningRoutine: ["Gentle micellar cleanser", "Centella asiatica soothing serum", "Calming oat moisturiser", "Mineral SPF 50"],
        nightRoutine: ["Gentle cream cleanser", "Calming niacinamide serum", "Barrier repair cream", "Soothing eye gel"],
        recommendedCategories: ["Gentle Cleansers", "Soothing Serums", "Fragrance-Free Moisturisers", "Mineral Sunscreen"],
        recommendedProducts: [],
        note: "A calming and fragrance-free approach will help your skin stay comfortable and resilient.",
        status: "ACTIVE"
      },
      {
        title: "Combination Skin — Uneven Tone Routine",
        description: "A balancing routine that targets uneven tone while managing oily and dry zones.",
        skinType: "Combination",
        concern: "Uneven Texture",
        ageRange: "any",
        sensitivity: "any",
        routine: "any",
        priority: 10,
        morningRoutine: ["Balancing gel cleanser", "Vitamin C and niacinamide serum", "Lightweight gel moisturiser", "Broad-spectrum SPF 50"],
        nightRoutine: ["Double cleanse", "AHA exfoliating toner (2–3×/week)", "Peptide serum", "Barrier moisturiser"],
        recommendedCategories: ["Balancing Cleansers", "Vitamin C Serums", "Lightweight Moisturisers", "Exfoliants"],
        recommendedProducts: [],
        note: "Use targeted actives on congested areas and hydrating formulas on dry zones for a harmonised complexion.",
        status: "ACTIVE"
      },
      {
        title: "Mature Skin — Fine Lines & Anti-Ageing Routine",
        description: "An age-defying routine rich in peptides, antioxidants and collagen-supporting actives.",
        skinType: "any",
        concern: "Fine Lines",
        ageRange: "any",
        sensitivity: "any",
        routine: "any",
        priority: 8,
        morningRoutine: ["Gentle cream cleanser", "Vitamin C antioxidant serum", "Collagen-boosting moisturiser", "Broad-spectrum SPF 50"],
        nightRoutine: ["Cleansing balm", "Retinol serum (start 2×/week)", "Peptide night cream", "Eye and lip treatment"],
        recommendedCategories: ["Cream Cleansers", "Retinol Serums", "Anti-Ageing Moisturisers", "SPF"],
        recommendedProducts: [],
        note: "SPF is your most powerful anti-ageing tool — apply every morning without exception.",
        status: "ACTIVE"
      },
      {
        title: "Your Personalised Skincare Routine",
        description: "A balanced routine designed to support your skin at every step.",
        skinType: "any",
        concern: "any",
        ageRange: "any",
        sensitivity: "any",
        routine: "any",
        priority: 0,
        morningRoutine: ["Gentle cleanser", "Hydrating serum", "Moisturiser", "SPF 50"],
        nightRoutine: ["Cleanser", "Treatment serum", "Night moisturiser", "Eye cream"],
        recommendedCategories: ["Cleansers", "Serums", "Moisturisers", "Sunscreen"],
        recommendedProducts: [],
        note: "A consistent routine built around cleansing, hydration and SPF is the foundation of healthy skin.",
        status: "ACTIVE"
      }
    ]);
  }
};
