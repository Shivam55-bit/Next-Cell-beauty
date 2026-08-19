import { prisma } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const transformReturn = (r) => ({
  id: r.id || r._id?.toString(),
  returnId: r._id?.toString() || r.id,
  orderId: r.orderId || "",
  customerName: r.customerName || "Customer",
  customerEmail: r.customerEmail || "",
  productName: r.productName || "Product",
  reason: r.reason || "Defective or damaged",
  requestDate: r.requestDate || r.createdAt || "2026-08-06",
  returnStatus: r.returnStatus || r.status || "Requested",
  refundStatus: r.refundStatus || "Pending",
  refundAmount: r.refundAmount || r.amount || 0,
  amount: r.refundAmount || r.amount || 0,
  adminNote: r.adminNote || ""
});

export const getReturns = async (req, res, next) => {
  try {
    const returns = await prisma.return.findMany({
      orderBy: { createdAt: "desc" }
    });

    const transformed = returns.map(transformReturn);
    return sendSuccess(res, "Returns retrieved", transformed);
  } catch (error) {
    next(error);
  }
};

export const createReturn = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.orderId || !body.customerName) {
      return sendError(res, "Order ID and customer name are required.", 400);
    }

    const ret = await prisma.return.create({
      orderId: body.orderId,
      customerName: body.customerName,
      customerEmail: body.customerEmail || "",
      productName: body.productName || "Product",
      reason: body.reason || "Return requested",
      requestDate: new Date().toISOString().split("T")[0],
      returnStatus: body.returnStatus || "Requested",
      refundStatus: body.refundStatus || "Pending",
      refundAmount: Number(body.refundAmount || body.amount || 0),
      amount: Number(body.refundAmount || body.amount || 0),
      adminNote: body.adminNote || ""
    });

    return sendSuccess(res, "Return request created", transformReturn(ret), 201);
  } catch (error) {
    next(error);
  }
};

export const updateReturnStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { returnStatus, refundStatus, adminNote, status } = req.body;

    const existing = await prisma.return.findFirst({
      where: { OR: [{ _id: id }, { id }, { orderId: id }] }
    });

    if (!existing) return sendError(res, "Return record not found", 404);

    const updated = await prisma.return.update({
      where: { _id: existing._id?.toString() || existing.id },
      data: {
        ...(returnStatus || status ? { returnStatus: returnStatus || status } : {}),
        ...(refundStatus ? { refundStatus } : {}),
        ...(adminNote !== undefined ? { adminNote } : {}),
        ...(req.body.refundAmount !== undefined ? { refundAmount: Number(req.body.refundAmount) } : {}),
        ...(req.body.amount !== undefined ? { amount: Number(req.body.amount) } : {})
      }
    });

    return sendSuccess(res, "Return claim updated successfully", transformReturn(updated));
  } catch (error) {
    next(error);
  }
};
