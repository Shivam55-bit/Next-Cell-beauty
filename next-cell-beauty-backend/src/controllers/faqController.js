import { prisma } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const transformFaq = (f) => ({
  id: f.id || f._id?.toString(),
  question: f.question,
  answer: f.answer,
  category: f.category || "General",
  displayOrder: f.displayOrder || 1,
  status: (f.status === "INACTIVE" || f.status === "Inactive") ? "Inactive" : "Active"
});

export const getFaqs = async (req, res, next) => {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { displayOrder: "asc" }
    });

    const transformed = faqs.map(transformFaq);
    return sendSuccess(res, "FAQs retrieved", transformed);
  } catch (error) {
    next(error);
  }
};

export const createFaq = async (req, res, next) => {
  try {
    const { question, answer, category, displayOrder, status } = req.body;
    if (!question || !answer) return sendError(res, "Question and answer required", 400);

    const faq = await prisma.fAQ.create({
      question,
      answer,
      category: category || "General",
      displayOrder: Number(displayOrder || 1),
      status: (status === "Inactive" || status === "INACTIVE") ? "INACTIVE" : "ACTIVE"
    });

    return sendSuccess(res, "FAQ created successfully", transformFaq(faq), 201);
  } catch (error) {
    next(error);
  }
};

export const updateFaq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const faq = await prisma.fAQ.update({
      where: { _id: id },
      data: {
        ...(body.question ? { question: body.question } : {}),
        ...(body.answer ? { answer: body.answer } : {}),
        ...(body.category ? { category: body.category } : {}),
        ...(body.displayOrder !== undefined ? { displayOrder: Number(body.displayOrder) } : {}),
        ...(body.status ? { status: (body.status === "Inactive" || body.status === "INACTIVE") ? "INACTIVE" : "ACTIVE" } : {})
      }
    });

    if (!faq) return sendError(res, "FAQ not found", 404);

    return sendSuccess(res, "FAQ updated successfully", transformFaq(faq));
  } catch (error) {
    next(error);
  }
};

export const deleteFaq = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.fAQ.delete({ where: { _id: id } });
    return sendSuccess(res, "FAQ deleted successfully");
  } catch (error) {
    next(error);
  }
};
