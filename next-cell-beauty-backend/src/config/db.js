import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  seedDefaultData,
  User,
  RefreshToken,
  Product,
  Category,
  Brand,
  Banner,
  Blog,
  FAQ,
  Policy,
  Setting,
  Order,
  Address,
  Wishlist,
  Customer,
  ReturnRequest,
  Coupon,
  Review,
  Tutorial,
  SkinQuizQuestion,
  SkinQuizResult,
  ShadeFinderQuestion,
  ShadeFinderResult,
  Shade,
  ComboDeal,
  BeforeAfter
} from "../models/index.js";

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/next-cell-beauty";

let cachedConnection = null;
let memoryServer = null;

const modelMap = {
  user: User,
  refreshToken: RefreshToken,
  product: Product,
  category: Category,
  brand: Brand,
  banner: Banner,
  blog: Blog,
  fAQ: FAQ,
  policy: Policy,
  setting: Setting,
  order: Order,
  address: Address,
  wishlist: Wishlist,
  customer: Customer,
  return: ReturnRequest,
  coupon: Coupon,
  review: Review,
  tutorial: Tutorial,
  skinQuizQuestion: SkinQuizQuestion,
  skinQuizResult: SkinQuizResult,
  shadeFinderQuestion: ShadeFinderQuestion,
  shadeFinderResult: ShadeFinderResult,
  shade: Shade,
  comboDeal: ComboDeal,
  beforeAfter: BeforeAfter
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isOperatorObject = (value) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value).some((key) =>
    ["equals", "contains", "gte", "lte", "in", "mode", "not", "startsWith", "endsWith", "$regex", "$options", "$ne", "$in", "$eq", "$gte", "$lte"].includes(key)
  );

const buildWhereQuery = (where = {}) => {
  if (!where || typeof where !== "object" || Array.isArray(where)) return {};

  const query = {};

  const addCondition = (target, prefix = "") => {
    Object.entries(target).forEach(([key, value]) => {
      if (key === "OR" || key === "AND" || key === "$or" || key === "$and") {
        const op = (key === "OR" || key === "$or") ? "$or" : "$and";
        query[op] = value.map((entry) => buildWhereQuery(entry));
        return;
      }

      if (key.startsWith("$")) {
        query[key] = value;
        return;
      }

      const normalizedKey = key === "id" ? "_id" : key;
      const normalizedPath = prefix ? `${prefix}.${normalizedKey}` : normalizedKey;

      if (value && typeof value === "object" && !Array.isArray(value) && !isOperatorObject(value)) {
        addCondition(value, normalizedPath);
        return;
      }

      if (isOperatorObject(value)) {
        const operatorValue = value;
        if (operatorValue.contains !== undefined) {
          query[normalizedPath] = {
            $regex: escapeRegExp(operatorValue.contains),
            $options: operatorValue.mode === "insensitive" ? "i" : ""
          };
        } else if (operatorValue.equals !== undefined) {
          query[normalizedPath] = { $eq: operatorValue.equals };
        } else if (operatorValue.gte !== undefined) {
          query[normalizedPath] = { $gte: operatorValue.gte };
        } else if (operatorValue.lte !== undefined) {
          query[normalizedPath] = { $lte: operatorValue.lte };
        } else if (operatorValue.in !== undefined) {
          query[normalizedPath] = { $in: operatorValue.in };
        } else if (operatorValue.not !== undefined) {
          query[normalizedPath] = { $ne: operatorValue.not };
        } else if (operatorValue.startsWith !== undefined) {
          query[normalizedPath] = { $regex: `^${escapeRegExp(operatorValue.startsWith)}` };
        } else if (operatorValue.endsWith !== undefined) {
          query[normalizedPath] = { $regex: `${escapeRegExp(operatorValue.endsWith)}$` };
        } else {
          query[normalizedPath] = value;
        }
        return;
      }

      query[normalizedPath] = value;
    });
  };

  addCondition(where);
  return query;
};

const createModelFacade = (Model) => ({
  async findMany(args = {}) {
    const { where = {}, skip = 0, take = 0, orderBy } = args;
    let query = Model.find(buildWhereQuery(where));

    if (orderBy) {
      Object.entries(orderBy).forEach(([field, direction]) => {
        query = query.sort({ [field]: direction === "desc" ? -1 : 1 });
      });
    }

    if (skip) query = query.skip(skip);
    if (take) query = query.limit(take);

    return query.exec();
  },

  async findFirst(args = {}) {
    const { where = {} } = args;
    return Model.findOne(buildWhereQuery(where)).exec();
  },

  async findUnique(args = {}) {
    const { where = {} } = args;
    const query = buildWhereQuery(where);
    const result = await Model.findOne(query).exec();
    return result;
  },

  async count(args = {}) {
    const { where = {} } = args;
    return Model.countDocuments(buildWhereQuery(where));
  },

  async create(args = {}) {
    const payload = args.data ?? args;
    return Model.create(payload);
  },

  async update(args = {}) {
    const { where = {}, data = {} } = args;
    const query = buildWhereQuery(where);
    const result = await Model.findOneAndUpdate(query, data, { new: true, runValidators: false }).exec();
    return result;
  },

  async upsert(args = {}) {
    const { where = {}, update = {}, create = {} } = args;
    const query = buildWhereQuery(where);
    const doc = await Model.findOneAndUpdate(query, update, { new: true, upsert: true, setDefaultsOnInsert: true }).exec();
    if (!doc) return Model.create(create);
    return doc;
  },

  async delete(args = {}) {
    const { where = {} } = args;
    const query = buildWhereQuery(where);
    return Model.deleteOne(query).exec();
  },

  async deleteMany(args = {}) {
    const { where = {} } = args;
    return Model.deleteMany(buildWhereQuery(where)).exec();
  },

  async updateMany(args = {}) {
    const { where = {}, data = {} } = args;
    return Model.updateMany(buildWhereQuery(where), data).exec();
  }
});

export const prisma = new Proxy({}, {
  get(_target, prop) {
    if (prop === "$queryRaw") return async () => [{ 1: 1 }];
    if (prop === "$transaction") return async (callback) => callback(prisma);
    if (prop === "$disconnect") return async () => disconnectDb();
    if (prop in modelMap) return createModelFacade(modelMap[prop]);
    return undefined;
  }
});

export const connectDb = async () => {
  if (cachedConnection) return cachedConnection;

  try {
    cachedConnection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create();
      cachedConnection = await mongoose.connect(memoryServer.getUri(), {
        serverSelectionTimeoutMS: 5000,
      });
    } else {
      throw error;
    }
  }

  await seedDefaultData();
  return cachedConnection;
};

export const disconnectDb = async () => {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
  }

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

export const isDbConnected = () => mongoose.connection.readyState === 1;

