import { prisma } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const getSettings = async (req, res, next) => {
  try {
    const settingRecord = await prisma.setting.findUnique({
      where: { key: "store_config" }
    });

    let data = {
      storeName: "NEXT CELL BEAUTY",
      supportEmail: "support@nextcellbeauty.com",
      contactPhone: "+91 1800 234 5678",
      address: "Suite 804, Tech Park Tower B, Outer Ring Road, Bengaluru, KA - 560103",
      adminName: "Super Admin",
      adminEmail: "admin@nextcall.com",
      orderNotifications: true,
      customerNotifications: true,
      reviewNotifications: true,
      returnNotifications: true,
      currency: "INR (₹)",
      shippingFee: 50,
      freeShippingThreshold: 1499,
      paymentProvider: "Razorpay / UPI"
    };

    if (settingRecord && settingRecord.value) {
      try {
        data = { ...data, ...JSON.parse(settingRecord.value) };
      } catch (e) {}
    }

    return sendSuccess(res, "Settings retrieved", data);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const body = req.body;

    const settingRecord = await prisma.setting.findUnique({ where: { key: "store_config" } });
    let existingData = {};
    if (settingRecord && settingRecord.value) {
      try { existingData = JSON.parse(settingRecord.value); } catch (e) {}
    }

    const updatedData = { ...existingData, ...body };

    await prisma.setting.upsert({
      where: { key: "store_config" },
      update: { value: JSON.stringify(updatedData) },
      create: { key: "store_config", value: JSON.stringify(updatedData) }
    });

    return sendSuccess(res, "Settings saved successfully", updatedData);
  } catch (error) {
    next(error);
  }
};
