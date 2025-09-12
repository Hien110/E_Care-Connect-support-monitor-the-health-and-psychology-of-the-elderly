// controllers/SupporterProfileController.js
const User = require("../models/User.js");
const SupporterProfile = require("../models/SupporterProfile.js");

// Không dùng mongoose.Types.ObjectId — kiểm tra bằng regex 24 hex
const isValidObjectId = (v) => typeof v === "string" && /^[a-fA-F0-9]{24}$/.test(v);

const VALID_TIME_SLOTS = ["morning", "afternoon", "evening"];
const BANK_CARD_NUMBER_RE = /^\d{12,19}$/;

/* ------------ Helpers ------------ */
function validateAndNormalizeSchedule(scheduleInput) {
  if (!Array.isArray(scheduleInput)) return null;

  const seen = new Set();
  const out = [];

  for (const raw of scheduleInput) {
    if (!raw || typeof raw !== "object") continue;

    const day = Number(raw.dayOfWeek);
    const slot = String(raw.timeSlots || "").trim();

    if (!Number.isInteger(day) || day < 2 || day > 8) continue;
    if (!VALID_TIME_SLOTS.includes(slot)) continue;

    const key = `${day}-${slot}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ dayOfWeek: day, timeSlots: slot });
    }
  }
  return out;
}

// Validate & chuẩn hoá thẻ ngân hàng.
// Trả null nếu không hợp lệ; trả object đã chuẩn hoá nếu hợp lệ.
// Cho phép client gửi null để xoá thẻ (xử lý tại pickUpdatableFields).
function normalizeAndValidateBankCard(input) {
  if (!input || typeof input !== "object") return null;

  const out = {};

  // cardNumber: chỉ lấy số, bỏ khoảng trắng/dấu gạch
  if (typeof input.cardNumber === "string") {
    const digits = input.cardNumber.replace(/[^\d]/g, "");
    if (!BANK_CARD_NUMBER_RE.test(digits)) return null;
    out.cardNumber = digits;
  } else {
    return null;
  }

  if (typeof input.cardHolderName === "string" && input.cardHolderName.trim()) {
    out.cardHolderName = input.cardHolderName.trim();
  } else {
    return null;
  }

  const m = Number(input.expiryMonth);
  const y = Number(input.expiryYear);
  const now = new Date();
  const curM = now.getMonth() + 1;
  const curY = now.getFullYear();

  if (!Number.isInteger(m) || m < 1 || m > 12) return null;
  if (!Number.isInteger(y) || y < curY) return null;
  if (y === curY && m < curM) return null;

  out.expiryMonth = m;
  out.expiryYear = y;

  return out;
}

/**
 * Chỉ cho phép update các field hợp lệ để tránh user ghi bừa
 * Trả về object đã chuẩn hoá; có thể rỗng.
 * Nếu schedule gửi sai kiểu -> gắn cờ __invalidSchedule
 * Nếu bankCard gửi sai -> ném lỗi {status:400}
 */
function pickUpdatableFields(body) {
  const picked = {};
  if (!body || typeof body !== "object") return picked;

  // experience
  if (body.experience && typeof body.experience === "object") {
    const exp = {};
    if (typeof body.experience.totalYears === "number" && Number.isFinite(body.experience.totalYears)) {
      exp.totalYears = Math.max(0, Math.min(60, body.experience.totalYears));
    }
    if (typeof body.experience.description === "string") {
      exp.description = body.experience.description.trim();
    }
    if (Object.keys(exp).length) picked.experience = exp;
  }

  // schedule
  if ("schedule" in body) {
    const norm = validateAndNormalizeSchedule(body.schedule);
    if (norm === null) {
      picked.__invalidSchedule = true;
    } else {
      picked.schedule = norm; // chấp nhận mảng rỗng sau chuẩn hoá
    }
  }

  // serviceArea
  if (typeof body.serviceArea === "number" && Number.isFinite(body.serviceArea)) {
    picked.serviceArea = Math.max(0, Math.min(50, body.serviceArea));
  }

  // bankCard
  if ("bankCard" in body) {
    // Cho phép xoá thẻ: client gửi null
    if (body.bankCard === null) {
      picked.bankCard = null; // sẽ $unset phía dưới
    } else {
      const bc = normalizeAndValidateBankCard(body.bankCard);
      if (!bc) {
        const err = new Error("Dữ liệu thẻ ngân hàng không hợp lệ");
        err.status = 400;
        throw err;
      }
      picked.bankCard = bc;
    }
  }

  return picked;
}

/* ------------ Controller ------------ */
const SupporterProfileController = {
  // POST /supporter-profiles
  createMyProfile: async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!isValidObjectId(userId)) {
        return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
      }

      const me = await User.findById(userId).select("role");
      if (!me || me.role !== "supporter") {
        return res.status(403).json({ success: false, message: "Chỉ tài khoản supporter mới được tạo hồ sơ" });
      }

      const existed = await SupporterProfile.exists({ user: userId });
      if (existed) {
        return res.status(409).json({ success: false, message: "Hồ sơ đã tồn tại. Vui lòng dùng API cập nhật." });
      }

      let payload;
      try {
        payload = pickUpdatableFields(req.body);
      } catch (e) {
        const code = e.status || 400;
        return res.status(code).json({ success: false, message: e.message || "Payload không hợp lệ" });
      }

      if (payload.__invalidSchedule) {
        return res.status(400).json({ success: false, message: "Dữ liệu lịch làm việc (schedule) không hợp lệ" });
      }
      delete payload.__invalidSchedule;

      const doc = await SupporterProfile.create({ user: userId, ...payload });
      await doc.populate("user", "fullName avatar phoneNumber role");

      return res.status(201).json({
        success: true,
        message: "Tạo hồ sơ mô tả công việc thành công",
        data: doc,
      });
    } catch (err) {
      console.error("Error createMyProfile:", err);
      return res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi tạo hồ sơ" });
    }
  },

  // GET /supporter-profiles/me
  getMyProfile: async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!isValidObjectId(userId)) {
        return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
      }

      const doc = await SupporterProfile.findOne({ user: userId })
        .populate("user", "fullName avatar phoneNumber role");

      if (!doc) {
        return res.status(404).json({ success: false, message: "Bạn chưa có hồ sơ. Hãy tạo hồ sơ trước." });
      }

      return res.status(200).json({ success: true, data: doc });
    } catch (err) {
      console.error("Error getMyProfile:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // PATCH /supporter-profiles/me
  updateMyProfile: async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!isValidObjectId(userId)) {
        return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
      }

      const me = await User.findById(userId).select("role");
      if (!me || me.role !== "supporter") {
        return res.status(403).json({ success: false, message: "Chỉ tài khoản supporter mới được cập nhật hồ sơ" });
      }

      let update;
      try {
        update = pickUpdatableFields(req.body);
      } catch (e) {
        const code = e.status || 400;
        return res.status(code).json({ success: false, message: e.message || "Payload không hợp lệ" });
      }

      if (update.__invalidSchedule) {
        return res.status(400).json({ success: false, message: "Dữ liệu lịch làm việc (schedule) không hợp lệ" });
      }
      delete update.__invalidSchedule;

      // Nếu client muốn xoá bankCard (bankCard === null) thì dùng $unset
      const setObj = {};
      const unsetObj = {};
      Object.entries(update).forEach(([k, v]) => {
        if (k === "bankCard" && v === null) unsetObj.bankCard = 1;
        else setObj[k] = v;
      });

      const doc = await SupporterProfile.findOneAndUpdate(
        { user: userId },
        Object.keys(unsetObj).length ? { $set: setObj, $unset: unsetObj } : { $set: setObj },
        {
          new: true,
          runValidators: true,   // ✅ bật validator của schema
          context: "query",      // ✅ cần cho min/max/enum khi dùng findOneAndUpdate
        }
      ).populate("user", "fullName avatar phoneNumber role");

      if (!doc) {
        return res.status(404).json({ success: false, message: "Chưa có hồ sơ để cập nhật. Hãy tạo hồ sơ trước." });
      }

      return res.status(200).json({ success: true, message: "Cập nhật hồ sơ thành công", data: doc });
    } catch (err) {
      console.error("Error updateMyProfile:", err);
      return res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi cập nhật hồ sơ" });
    }
  },
};

module.exports = SupporterProfileController;
