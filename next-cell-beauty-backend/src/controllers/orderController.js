import { prisma } from "../config/db.js";
import { Product, Coupon } from "../models/index.js";
import { verifyAccessToken } from "../utils/token.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const transformOrder = (o) => {
  const parseAddress = (raw) => {
    if (!raw) return {};
    if (typeof raw === "string") {
      try { return JSON.parse(raw); } catch { return {}; }
    }
    return raw || {};
  };

  return {
    id: o.orderNumber || o.id || o._id?.toString(),
    orderId: o._id?.toString() || o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName || "Customer",
    customerEmail: o.customerEmail || "",
    customerPhone: o.customerPhone || "N/A",
    createdAt: o.createdAt || new Date().toISOString(),
    date: o.createdAt ? new Date(o.createdAt).toISOString().replace("T", " ").substring(0, 16) : "",
    items: Array.isArray(o.items) ? o.items.map((i) => ({
      productId: i.productId || i.id,
      productName: i.productName || i.name || "Product",
      name: i.productName || i.name || "Product",
      image: i.image || "/placeholder-product.svg",
      sku: i.sku || "—",
      quantity: i.quantity || 1,
      price: i.price || 0,
      salePrice: i.salePrice || i.price || 0,
      subtotal: i.subtotal || (i.price * (i.quantity || 1)) || 0
    })) : [],
    subtotal: o.subtotal || 0,
    discount: o.discount || 0,
    couponCode: o.couponCode || "None",
    tax: o.tax || 0,
    shippingCharge: o.shippingCharge || 0,
    totalAmount: o.totalAmount || 0,
    grandTotal: o.totalAmount || 0,
    paymentMethod: o.paymentMethod || "UPI",
    paymentStatus: o.paymentStatus || "Paid",
    orderStatus: o.orderStatus || "Processing",
    shippingStatus: o.shippingStatus || "Pending",
    shippingAddress: parseAddress(o.shippingAddress),
    billingAddress: parseAddress(o.billingAddress),
    timeline: Array.isArray(o.timeline) && o.timeline.length ? o.timeline : [
      { status: "Order Placed", date: o.createdAt ? new Date(o.createdAt).toISOString().replace("T", " ").substring(0, 16) : "", note: `Paid ₹${o.totalAmount || 0}` }
    ],
    customer: o.customer || null
  };
};

export const createOrder = async (req, res, next) => {
  try {
    const { customerName, customerEmail, customerPhone, items, shippingAddress, billingAddress, couponCode } = req.body;

    if (!customerName || !customerEmail || !items || !items.length || !shippingAddress) {
      return sendError(res, "Required order information missing.", 400);
    }

    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = verifyAccessToken(token);
        userId = decoded.id;
      } catch (e) {
        // Invalid token, proceed as guest
      }
    }

    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      if (!item.productId && !item.id) continue;
      const prodId = item.productId || item.id;
      const product = await Product.findOne({ $or: [{ _id: prodId }, { id: prodId }, { sku: prodId }] });
      if (!product) continue;

      const qty = Number(item.quantity || 1);
      if (product.stock !== undefined && product.stock < qty) {
        return sendError(res, `Insufficient stock for ${product.title}. Only ${product.stock} available.`, 400);
      }

      if (product.stock !== undefined) {
        product.stock = Math.max(0, product.stock - qty);
        await product.save();
      }

      const linePrice = product.price || 0;
      subtotal += linePrice * qty;

      orderItemsData.push({
        productId: product._id?.toString() || product.id,
        productName: product.title,
        name: product.title,
        image: product.images?.[0] || product.gallery?.[0] || "/placeholder-product.svg",
        sku: product.sku || "—",
        price: linePrice,
        salePrice: product.compareAtPrice || linePrice,
        subtotal: linePrice * qty,
        quantity: qty
      });
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase() });
      if (coupon && coupon.status !== "INACTIVE") {
        discount = coupon.discountType === "PERCENTAGE" 
          ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount || Infinity)
          : coupon.discountValue;

        coupon.usedCount = (coupon.usedCount || 0) + 1;
        await coupon.save();
      }
    }

    const tax = Math.round((subtotal - discount) * 0.05); // 5% tax
    const shippingCharge = subtotal > 1499 ? 0 : 50;
    const totalAmount = Math.max(0, subtotal - discount + tax + shippingCharge);
    const orderNumber = `NCB-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await prisma.order.create({
      orderNumber,
      customerName,
      customerEmail,
      customerPhone: customerPhone || "",
      userId,
      subtotal,
      discount,
      couponCode: couponCode || "None",
      tax,
      shippingCharge,
      totalAmount,
      currency: "INR",
      paymentMethod: req.body.paymentMethod || "UPI / GPay",
      paymentStatus: "Paid",
      orderStatus: "Processing",
      shippingStatus: "In Transit",
      shippingAddress: typeof shippingAddress === "string" ? shippingAddress : JSON.stringify(shippingAddress),
      billingAddress: typeof billingAddress === "string" ? billingAddress : JSON.stringify(billingAddress || shippingAddress),
      items: orderItemsData,
      timeline: [
        { status: "Order Placed", date: new Date().toISOString().replace("T", " ").substring(0, 16), note: `Customer paid ₹${totalAmount}` }
      ]
    });

    return sendSuccess(res, "Order created successfully", transformOrder(order), 201);
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" }
    });

    const transformed = orders.map(transformOrder);
    return sendSuccess(res, "Orders retrieved", transformed);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const order = await prisma.order.findFirst({
      where: {
        OR: isObjectId
          ? [{ _id: id }, { orderNumber: id }]
          : [{ orderNumber: id }]
      }
    });

    if (!order) return sendError(res, "Order not found", 404);

    return sendSuccess(res, "Order retrieved", transformOrder(order));
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus, shippingStatus, paymentStatus, timeline } = req.body;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const order = await prisma.order.findFirst({
      where: {
        OR: isObjectId
          ? [{ _id: id }, { orderNumber: id }]
          : [{ orderNumber: id }]
      }
    });

    if (!order) return sendError(res, "Order not found", 404);

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (shippingStatus) updateData.shippingStatus = shippingStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (Array.isArray(timeline) && timeline.length) updateData.timeline = timeline;

    const updated = await prisma.order.update({
      where: { _id: order._id?.toString() || order.id },
      data: updateData
    });

    return sendSuccess(res, "Order status updated successfully", transformOrder(updated));
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const where = { userId: req.user.id };

    const statusFilter = req.query.status;
    if (statusFilter && statusFilter !== "All") {
      where.orderStatus = statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).toLowerCase();
    }

    const search = req.query.search;
    if (search && search.trim()) {
      where.OR = [
        { orderNumber: { $regex: search.trim(), $options: "i" } },
        { customerName: { $regex: search.trim(), $options: "i" } }
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.order.count({ where })
    ]);

    const transformed = orders.map(transformOrder);
    return sendSuccess(res, "Orders retrieved", {
      orders: transformed,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
    const order = await prisma.order.findFirst({
      where: {
        userId: req.user.id,
        OR: isObjectId
          ? [{ _id: orderId }, { orderNumber: orderId }]
          : [{ orderNumber: orderId }]
      }
    });

    if (!order) return sendError(res, "Order not found", 404);

    return sendSuccess(res, "Order retrieved", transformOrder(order));
  } catch (error) {
    next(error);
  }
};

export const cancelMyOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
    const order = await prisma.order.findFirst({
      where: {
        userId: req.user.id,
        OR: isObjectId
          ? [{ _id: orderId }, { orderNumber: orderId }]
          : [{ orderNumber: orderId }]
      }
    });

    if (!order) return sendError(res, "Order not found", 404);

    if (["Delivered", "Cancelled"].includes(order.orderStatus)) {
      return sendError(res, "This order cannot be cancelled.", 400);
    }

    const updated = await prisma.order.update({
      where: { _id: order._id?.toString() || order.id },
      data: {
        orderStatus: "Cancelled",
        shippingStatus: "Cancelled",
        timeline: [
          ...(Array.isArray(order.timeline) ? order.timeline : []),
          { status: "Cancelled", date: new Date().toISOString().replace("T", " ").substring(0, 16), note: reason ? `Cancelled: ${reason}` : "Cancelled by customer" }
        ]
      }
    });

    return sendSuccess(res, "Order cancelled successfully", transformOrder(updated));
  } catch (error) {
    next(error);
  }
};
