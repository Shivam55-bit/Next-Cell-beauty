import { prisma } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const getPolicies = async (req, res, next) => {
  try {
    const policies = await prisma.policy.findMany({
      orderBy: { createdAt: "asc" }
    });

    return sendSuccess(res, "Policies retrieved", policies);
  } catch (error) {
    next(error);
  }
};

export const getPolicyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const policy = await prisma.policy.findFirst({
      where: { OR: [{ id }, { type: id.toUpperCase().replace(/-/g, "_") }] }
    });

    if (!policy) return sendError(res, "Policy document not found", 404);

    return sendSuccess(res, "Policy document retrieved", policy);
  } catch (error) {
    next(error);
  }
};

export const getPolicyByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const policyType = type.toUpperCase().replace(/-/g, "_");

    const policy = await prisma.policy.findFirst({
      where: {
        type: policyType
      }
    });

    if (!policy) return sendError(res, `Policy document '${type}' not found`, 404);

    return sendSuccess(res, "Policy document retrieved", policy);
  } catch (error) {
    next(error);
  }
};

export const updatePolicy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, status } = req.body;

    const policy = await prisma.policy.findFirst({
      where: { OR: [{ id }, { type: id.toUpperCase().replace(/-/g, "_") }] }
    });

    if (!policy) return sendError(res, "Policy document not found", 404);

    const updated = await prisma.policy.update({
      where: { id: policy.id },
      data: {
        ...(title ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(status ? { status: status === "Draft" ? "DRAFT" : "PUBLISHED" } : {}),
        lastUpdated: new Date().toISOString().split("T")[0]
      }
    });

    return sendSuccess(res, "Policy updated successfully", updated);
  } catch (error) {
    next(error);
  }
};
