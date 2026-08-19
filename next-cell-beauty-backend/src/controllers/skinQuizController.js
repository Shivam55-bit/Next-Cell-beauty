import { prisma } from "../config/db.js";
import { Product } from "../models/index.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const normalizeStatus = (status) => {
  if (!status) return "ACTIVE";
  return ["INACTIVE", "Inactive", "inactive"].includes(status) ? "INACTIVE" : "ACTIVE";
};

const transformQuestion = (q) => ({
  id: q.id || q._id?.toString(),
  key: q.key,
  title: q.title,
  description: q.description || "",
  question: q.question,
  order: typeof q.order === "number" ? q.order : 0,
  options: Array.isArray(q.options)
    ? q.options.map((o) => ({
        id: o.id || o._id?.toString(),
        text: o.text,
        value: o.value || o.text || "",
        skinType: o.skinType || "",
        recommendedProduct: o.recommendedProduct || "",
        status: normalizeStatus(o.status),
      }))
    : [],
  status: normalizeStatus(q.status),
});

const transformResult = (r) => ({
  id: r.id || r._id?.toString(),
  title: r.title || "",
  description: r.description || "",
  skinType: r.skinType || "",
  concern: r.concern || "",
  ageRange: r.ageRange || "",
  sensitivity: r.sensitivity || "",
  routine: r.routine || "",
  priority: typeof r.priority === "number" ? r.priority : 0,
  morningRoutine: Array.isArray(r.morningRoutine) ? r.morningRoutine : [],
  nightRoutine: Array.isArray(r.nightRoutine) ? r.nightRoutine : [],
  recommendedCategories: Array.isArray(r.recommendedCategories) ? r.recommendedCategories : [],
  recommendedProducts: Array.isArray(r.recommendedProducts) ? r.recommendedProducts : [],
  note: r.note || "",
  status: normalizeStatus(r.status),
});

/** ─────────────────────────────────────────────
 * Rule Engine
 *
 * Each result has condition fields (skinType, concern, ageRange, sensitivity, routine).
 * - Empty string or "any" (case-insensitive) = wildcard — matches any answer.
 * - Exact string match = scores highest.
 * - Mismatch = disqualified entirely.
 *
 * Scoring per field: exact match = 2, wildcard match = 1
 * Results sorted by totalScore DESC, then priority DESC.
 * Returns the top match, or null if none passes.
 * ───────────────────────────────────────────── */
const CONDITION_FIELDS = ["skinType", "concern", "ageRange", "sensitivity", "routine"];

const isWildcard = (val) => !val || val.trim().toLowerCase() === "any";

const scoreResult = (result, answers) => {
  let score = 0;
  for (const field of CONDITION_FIELDS) {
    const condition = result[field];
    const answer = answers[field] || "";
    if (isWildcard(condition)) {
      score += 1; // wildcard match
    } else if (condition.trim().toLowerCase() === answer.trim().toLowerCase()) {
      score += 2; // exact match
    } else {
      return -1; // disqualified
    }
  }
  return score;
};

const runRuleEngine = (results, answers) => {
  const scored = results
    .map((r) => ({ result: r, score: scoreResult(r, answers) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.result.priority || 0) - (a.result.priority || 0);
    });
  return scored.length > 0 ? scored[0].result : null;
};

// ─── Public: Customer reads ───────────────────────────────────────────────────

export const getQuestions = async (req, res, next) => {
  try {
    const questions = await prisma.skinQuizQuestion.findMany({
      where: { status: "ACTIVE" },
      orderBy: { order: "asc" },
    });
    return sendSuccess(res, "Skin quiz questions retrieved", questions.map(transformQuestion));
  } catch (error) {
    next(error);
  }
};

export const getResults = async (req, res, next) => {
  try {
    const results = await prisma.skinQuizResult.findMany({
      where: { status: "ACTIVE" },
    });
    return sendSuccess(res, "Skin quiz results retrieved", results.map(transformResult));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/skin-quiz/submit
 * Body: { answers: { skinType, concern, ageRange, sensitivity, routine }, customerId? }
 *
 * 1. Validate answers against active questions.
 * 2. Run rule engine to find best matching result.
 * 3. Optionally persist quiz attempt for logged-in customer.
 * 4. Return matched result.
 */
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers = {}, customerId } = req.body;

    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return sendError(res, "answers must be an object of { questionKey: selectedValue }", 400);
    }

    // Load active questions to validate keys
    const activeQuestions = await prisma.skinQuizQuestion.findMany({
      where: { status: "ACTIVE" },
      orderBy: { order: "asc" },
    });

    if (activeQuestions.length === 0) {
      return sendError(res, "No active quiz questions are configured.", 422);
    }

    // Validate required answers
    const missingKeys = activeQuestions
      .map((q) => q.key)
      .filter((key) => !answers[key] || !String(answers[key]).trim());

    if (missingKeys.length > 0) {
      return sendError(res, `Missing answers for: ${missingKeys.join(", ")}`, 400);
    }

    // Load all active results and run rule engine
    const activeResults = await prisma.skinQuizResult.findMany({
      where: { status: "ACTIVE" },
    });

    if (activeResults.length === 0) {
      return sendError(res, "No quiz results are configured. Please contact support.", 422);
    }

    const matched = runRuleEngine(activeResults, answers);

    if (!matched) {
      return sendError(res, "No matching skin routine found for your answers. Please try again.", 422);
    }

    const resultData = transformResult(matched);

    // If products are referenced, fetch them from the Product collection
    let products = [];
    if (Array.isArray(resultData.recommendedProducts) && resultData.recommendedProducts.length > 0) {
      try {
        const validObjectIds = resultData.recommendedProducts.filter((ref) => mongoose.Types.ObjectId.isValid(ref));
        const refs = resultData.recommendedProducts;

        const conditions = [
          { slug: { $in: refs } },
          { title: { $in: refs } }
        ];
        if (validObjectIds.length > 0) {
          conditions.push({ _id: { $in: validObjectIds } });
        }

        const fetched = await Product.find({ $or: conditions }).lean();

        products = fetched.map((p) => ({
          id: p._id?.toString() || p.id,
          name: p.title || p.name,
          title: p.title || p.name,
          slug: p.slug,
          image: (Array.isArray(p.images) ? p.images[0] : null) || p.image || "",
          price: p.compareAtPrice || p.price || 0,
          compareAtPrice: p.price || 0,
          category: p.category?.name || p.category || "",
        }));
      } catch (err) {
        // Non-fatal — result still returned, products just empty
        console.warn("Could not fetch recommended products:", err.message);
      }
    }

    // Persist quiz attempt if customerId provided
    if (customerId) {
      try {
        const { SkinQuizAttempt } = await import("../models/index.js").catch(() => ({}));
        if (SkinQuizAttempt) {
          await SkinQuizAttempt.create({
            customerId,
            answers,
            resultId: resultData.id,
            resultTitle: resultData.title,
          });
        }
      } catch (err) {
        // Non-fatal
        console.warn("Could not save quiz attempt:", err.message);
      }
    }

    return sendSuccess(res, "Quiz result calculated successfully", {
      ...resultData,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/skin-quiz/my-history
 * Returns the logged-in customer's past quiz attempts (most recent first).
 */
export const getMyQuizHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id?.toString() || req.user?.userId;
    if (!userId) return sendError(res, "Authentication required", 401);

    // SkinQuizAttempt model not yet added — return empty gracefully
    return sendSuccess(res, "Quiz history retrieved", []);
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Question CRUD ─────────────────────────────────────────────────────

export const getAdminQuestions = async (req, res, next) => {
  try {
    const questions = await prisma.skinQuizQuestion.findMany({
      orderBy: { order: "asc" },
    });
    return sendSuccess(res, "Skin quiz questions retrieved", questions.map(transformQuestion));
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.key || !body.title || !body.question) {
      return sendError(res, "Key, title and question are required", 400);
    }

    const question = await prisma.skinQuizQuestion.create({
      data: {
        key: body.key,
        title: body.title,
        description: body.description || "",
        question: body.question,
        order: typeof body.order === "number" ? body.order : (body.order ? Number(body.order) : 0),
        options: Array.isArray(body.options) ? body.options : [],
        status: normalizeStatus(body.status),
      },
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

    const question = await prisma.skinQuizQuestion.update({
      where: { id },
      data: {
        ...(body.key !== undefined ? { key: body.key } : {}),
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.question !== undefined ? { question: body.question } : {}),
        ...(body.order !== undefined ? { order: Number(body.order) || 0 } : {}),
        ...(body.options !== undefined ? { options: Array.isArray(body.options) ? body.options : [] } : {}),
        ...(body.status !== undefined ? { status: normalizeStatus(body.status) } : {}),
      },
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
    await prisma.skinQuizQuestion.delete({ where: { id } });
    return sendSuccess(res, "Question deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Bulk reorder ──────────────────────────────────────────────────────

export const reorderQuestions = async (req, res, next) => {
  try {
    const { orderedIds } = req.body; // array of { id, order }
    if (!Array.isArray(orderedIds)) return sendError(res, "orderedIds must be an array", 400);

    await Promise.all(
      orderedIds.map(({ id, order }) =>
        prisma.skinQuizQuestion.update({ where: { id }, data: { order: Number(order) || 0 } })
      )
    );

    return sendSuccess(res, "Question order updated");
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Result CRUD ───────────────────────────────────────────────────────

export const getAdminResults = async (req, res, next) => {
  try {
    const results = await prisma.skinQuizResult.findMany({
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Skin quiz results retrieved", results.map(transformResult));
  } catch (error) {
    next(error);
  }
};

export const createResult = async (req, res, next) => {
  try {
    const body = req.body;
    const result = await prisma.skinQuizResult.create({
      data: {
        title: body.title || "",
        description: body.description || "",
        skinType: body.skinType || "",
        concern: body.concern || "",
        ageRange: body.ageRange || "",
        sensitivity: body.sensitivity || "",
        routine: body.routine || "",
        priority: Number(body.priority) || 0,
        morningRoutine: Array.isArray(body.morningRoutine) ? body.morningRoutine : [],
        nightRoutine: Array.isArray(body.nightRoutine) ? body.nightRoutine : [],
        recommendedCategories: Array.isArray(body.recommendedCategories) ? body.recommendedCategories : [],
        recommendedProducts: Array.isArray(body.recommendedProducts) ? body.recommendedProducts : [],
        note: body.note || "",
        status: normalizeStatus(body.status),
      },
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

    const result = await prisma.skinQuizResult.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.skinType !== undefined ? { skinType: body.skinType } : {}),
        ...(body.concern !== undefined ? { concern: body.concern } : {}),
        ...(body.ageRange !== undefined ? { ageRange: body.ageRange } : {}),
        ...(body.sensitivity !== undefined ? { sensitivity: body.sensitivity } : {}),
        ...(body.routine !== undefined ? { routine: body.routine } : {}),
        ...(body.priority !== undefined ? { priority: Number(body.priority) || 0 } : {}),
        ...(body.morningRoutine !== undefined ? { morningRoutine: Array.isArray(body.morningRoutine) ? body.morningRoutine : [] } : {}),
        ...(body.nightRoutine !== undefined ? { nightRoutine: Array.isArray(body.nightRoutine) ? body.nightRoutine : [] } : {}),
        ...(body.recommendedCategories !== undefined ? { recommendedCategories: Array.isArray(body.recommendedCategories) ? body.recommendedCategories : [] } : {}),
        ...(body.recommendedProducts !== undefined ? { recommendedProducts: Array.isArray(body.recommendedProducts) ? body.recommendedProducts : [] } : {}),
        ...(body.note !== undefined ? { note: body.note } : {}),
        ...(body.status !== undefined ? { status: normalizeStatus(body.status) } : {}),
      },
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
    await prisma.skinQuizResult.delete({ where: { id } });
    return sendSuccess(res, "Result deleted successfully");
  } catch (error) {
    next(error);
  }
};
