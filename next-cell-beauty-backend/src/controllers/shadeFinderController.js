import { prisma } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const normalizeStatus = (status) => {
  if (!status) return "ACTIVE";
  return ["INACTIVE", "Inactive", "inactive"].includes(status) ? "INACTIVE" : "ACTIVE";
};

const transformQuestion = (q) => ({
  id: q.id || q._id?.toString(),
  key: q.key,
  title: q.title,
  description: q.description || "",
  type: q.type || "choice",
  options: Array.isArray(q.options)
    ? q.options.map((o) => ({
        id: o.id || o._id?.toString(),
        label: o.label,
        value: o.value || "",
        swatch: o.swatch || "",
        accent: o.accent || "",
        status: normalizeStatus(o.status)
      }))
    : [],
  status: normalizeStatus(q.status)
});

const transformResult = (r) => ({
  id: r.id || r._id?.toString(),
  title: r.title || "",
  description: r.description || "",
  skinTone: r.skinTone || "",
  undertone: r.undertone || "",
  productType: r.productType || "",
  finish: r.finish || "",
  shadeName: r.shadeName || "",
  blendHex: r.blendHex || "",
  toneHex: r.toneHex || "",
  undertoneHex: r.undertoneHex || "",
  explanation: r.explanation || "",
  suggestedProductType: r.suggestedProductType || "",
  recommendedProducts: Array.isArray(r.recommendedProducts) ? r.recommendedProducts : [],
  status: normalizeStatus(r.status)
});

export const getQuestions = async (req, res, next) => {
  try {
    const questions = await prisma.shadeFinderQuestion.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "asc" }
    });
    const transformed = questions.map(transformQuestion);
    return sendSuccess(res, "Shade finder questions retrieved", transformed);
  } catch (error) {
    next(error);
  }
};

export const getResults = async (req, res, next) => {
  try {
    const results = await prisma.shadeFinderResult.findMany({
      where: { status: "ACTIVE" }
    });
    const transformed = results.map(transformResult);
    return sendSuccess(res, "Shade finder results retrieved", transformed);
  } catch (error) {
    next(error);
  }
};

export const getAdminQuestions = async (req, res, next) => {
  try {
    const questions = await prisma.shadeFinderQuestion.findMany({
      orderBy: { createdAt: "desc" }
    });
    const transformed = questions.map(transformQuestion);
    return sendSuccess(res, "Shade finder questions retrieved", transformed);
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.key || !body.title) return sendError(res, "Key and title are required", 400);

    const question = await prisma.shadeFinderQuestion.create({
      key: body.key,
      title: body.title,
      description: body.description || "",
      type: body.type || "choice",
      options: Array.isArray(body.options) ? body.options : [],
      status: normalizeStatus(body.status)
    });

    return sendSuccess(res, "Question created successfully", transformQuestion(question), 201);
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const question = await prisma.shadeFinderQuestion.update({
      where: { _id: id },
      data: {
        ...(body.key !== undefined ? { key: body.key } : {}),
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.type !== undefined ? { type: body.type } : {}),
        ...(body.options !== undefined ? { options: Array.isArray(body.options) ? body.options : [] } : {}),
        ...(body.status !== undefined ? { status: normalizeStatus(body.status) } : {})
      }
    });

    if (!question) return sendError(res, "Question not found", 404);
    return sendSuccess(res, "Question updated successfully", transformQuestion(question));
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.shadeFinderQuestion.delete({ where: { _id: id } });
    return sendSuccess(res, "Question deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const getAdminResults = async (req, res, next) => {
  try {
    const results = await prisma.shadeFinderResult.findMany({
      orderBy: { createdAt: "desc" }
    });
    const transformed = results.map(transformResult);
    return sendSuccess(res, "Shade finder results retrieved", transformed);
  } catch (error) {
    next(error);
  }
};

export const createResult = async (req, res, next) => {
  try {
    const body = req.body;

    const result = await prisma.shadeFinderResult.create({
      title: body.title || "",
      description: body.description || "",
      skinTone: body.skinTone || "",
      undertone: body.undertone || "",
      productType: body.productType || "",
      finish: body.finish || "",
      shadeName: body.shadeName || "",
      blendHex: body.blendHex || "",
      toneHex: body.toneHex || "",
      undertoneHex: body.undertoneHex || "",
      explanation: body.explanation || "",
      suggestedProductType: body.suggestedProductType || "",
      recommendedProducts: Array.isArray(body.recommendedProducts) ? body.recommendedProducts : [],
      status: normalizeStatus(body.status)
    });

    return sendSuccess(res, "Result created successfully", transformResult(result), 201);
  } catch (error) {
    next(error);
  }
};

export const updateResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const result = await prisma.shadeFinderResult.update({
      where: { _id: id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.skinTone !== undefined ? { skinTone: body.skinTone } : {}),
        ...(body.undertone !== undefined ? { undertone: body.undertone } : {}),
        ...(body.productType !== undefined ? { productType: body.productType } : {}),
        ...(body.finish !== undefined ? { finish: body.finish } : {}),
        ...(body.shadeName !== undefined ? { shadeName: body.shadeName } : {}),
        ...(body.blendHex !== undefined ? { blendHex: body.blendHex } : {}),
        ...(body.toneHex !== undefined ? { toneHex: body.toneHex } : {}),
        ...(body.undertoneHex !== undefined ? { undertoneHex: body.undertoneHex } : {}),
        ...(body.explanation !== undefined ? { explanation: body.explanation } : {}),
        ...(body.suggestedProductType !== undefined ? { suggestedProductType: body.suggestedProductType } : {}),
        ...(body.recommendedProducts !== undefined ? { recommendedProducts: Array.isArray(body.recommendedProducts) ? body.recommendedProducts : [] } : {}),
        ...(body.status !== undefined ? { status: normalizeStatus(body.status) } : {})
      }
    });

    if (!result) return sendError(res, "Result not found", 404);
    return sendSuccess(res, "Result updated successfully", transformResult(result));
  } catch (error) {
    next(error);
  }
};

export const deleteResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.shadeFinderResult.delete({ where: { _id: id } });
    return sendSuccess(res, "Result deleted successfully");
  } catch (error) {
    next(error);
  }
};
