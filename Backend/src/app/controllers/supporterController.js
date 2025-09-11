const mongoose = require("mongoose");
const User = require("../models/User.js");
const SupporterProfile = require("../models/SupporterProfile.js");

const VALID_TIME_SLOTS = ["morning", "afternoon", "evening"];

function validateAndNormalizeSchedule(scheduleInput) {
  if (!Array.isArray(scheduleInput)) return null;

  const set = new Set();
  const out = [];

  for (const raw of scheduleInput) {
    if (!raw || typeof raw !== "object") continue;

    const day = Number(raw.dayOfWeek);
    const slot = String(raw.timeSlots || "").trim();

    if (!Number.isInteger(day) || day < 2 || day > 8) continue;
    if (!VALID_TIME_SLOTS.includes(slot)) continue;

    const key = `${day}-${slot}`;
    if (!set.has(key)) {
      set.add(key);
      out.push({ dayOfWeek: day, timeSlots: slot });
    }
  }

  return out;
}

/**
 * Chỉ cho phép update các field này để tránh user ghi bậy vào các trường khác
 */
function pickUpdatableFields(body) {
  const picked = {};
  if (body && typeof body === "object") {
    if (body.experience && typeof body.experience === "object") {
      picked.experience = {};
      if (typeof body.experience.totalYears === "number") {
        picked.experience.totalYears = body.experience.totalYears;
      }
      if (typeof body.experience.description === "string") {
        picked.experience.description = body.experience.description.trim();
      }
      // Nếu rỗng cả 2 thì bỏ hẳn
      if (
        picked.experience.totalYears === undefined &&
        picked.experience.description === undefined
      ) {
        delete picked.experience;
      }
    }

    if (Array.isArray(body.schedule)) {
      const norm = validateAndNormalizeSchedule(body.schedule);
      if (norm && norm.length >= 0) picked.schedule = norm; 
    }

    if (typeof body.serviceArea === "number") {
      // Theo schema: default 10, max 50
      const v = Math.max(0, Math.min(50, body.serviceArea));
      picked.serviceArea = v;
    }
  }
  return picked;
}

const SupporterProfileController = {
  /**
   * POST /supporter-profiles
   * Tạo hồ sơ mô tả công việc (mỗi supporter chỉ có 1 hồ sơ)
   */
  createMyProfile: async (req, res) => {
    try {
      const userId = req.user?.userId;

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
      }

      // Check role = supporter
      const me = await User.findById(userId);
      if (!me || me.role !== "supporter") {
        return res.status(403).json({
          success: false,
          message: "Chỉ tài khoản supporter mới được tạo hồ sơ",
        });
      }

      // Chặn tạo trùng
      const existed = await SupporterProfile.findOne({ user: userId });
      if (existed) {
        return res.status(409).json({
          success: false,
          message: "Hồ sơ đã tồn tại. Vui lòng dùng API cập nhật.",
        });
      }

      const payload = pickUpdatableFields(req.body);

      // Schedule nếu có thì validate
      if (req.body?.schedule) {
        const schedule = validateAndNormalizeSchedule(req.body.schedule);
        if (!schedule) {
          return res.status(400).json({
            success: false,
            message: "Dữ liệu lịch làm việc (schedule) không hợp lệ",
          });
        }
        payload.schedule = schedule;
      }

      const doc = await SupporterProfile.create({
        user: userId,
        ...payload,
      });

      await doc.populate("user", "fullName avatar phoneNumber role");

      return res.status(201).json({
        success: true,
        message: "Tạo hồ sơ mô tả công việc thành công",
        data: doc,
      });
    } catch (err) {
      console.error("Error createMyProfile:", err);
      return res.status(500).json({
        success: false,
        message: "Đã xảy ra lỗi khi tạo hồ sơ",
      });
    }
  },

  /**
   * GET /supporter-profiles/me
   * Xem hồ sơ mô tả công việc 
   */
  getMyProfile: async (req, res) => {
    try {
      const userId = req.user?.userId;

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
      }

      const doc = await SupporterProfile.findOne({ user: userId }).populate(
        "user",
        "fullName avatar phoneNumber role"
      );

      if (!doc) {
        return res.status(404).json({
          success: false,
          message: "Bạn chưa có hồ sơ. Hãy tạo hồ sơ trước.",
        });
      }

      return res.status(200).json({ success: true, data: doc });
    } catch (err) {
      console.error("Error getMyProfile:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  /**
   * PATCH /supporter-profiles/me
   * Cập nhật hồ sơ mô tả công việc của chính mình (cập nhật từng phần)
   */
  updateMyProfile: async (req, res) => {
    try {
      const userId = req.user?.userId;

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
      }

      // Chỉ supporter được cập nhật
      const me = await User.findById(userId);
      if (!me || me.role !== "supporter") {
        return res.status(403).json({
          success: false,
          message: "Chỉ tài khoản supporter mới được cập nhật hồ sơ",
        });
      }

      const update = pickUpdatableFields(req.body);

      // Nếu client gửi schedule nhưng validate fail, báo lỗi rõ ràng
      if (req.body?.schedule && !Array.isArray(update.schedule)) {
        return res.status(400).json({
          success: false,
          message: "Dữ liệu lịch làm việc (schedule) không hợp lệ",
        });
      }

      const doc = await SupporterProfile.findOneAndUpdate(
        { user: userId },
        { $set: update },
        { new: true }
      ).populate("user", "fullName avatar phoneNumber role");

      if (!doc) {
        return res.status(404).json({
          success: false,
          message: "Chưa có hồ sơ để cập nhật. Hãy tạo hồ sơ trước.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Cập nhật hồ sơ thành công",
        data: doc,
      });
    } catch (err) {
      console.error("Error updateMyProfile:", err);
      return res.status(500).json({
        success: false,
        message: "Đã xảy ra lỗi khi cập nhật hồ sơ",
      });
    }
  },
};

module.exports = SupporterProfileController;
