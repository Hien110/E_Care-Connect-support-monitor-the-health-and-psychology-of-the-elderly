// controllers/user.controller.js
const { sendSMS } = require("../../utils/smsClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const hashPassword = require("../../utils/hashPassword");
const redis = require("../../utils/redis");
const sendOTPEmail = require("../../utils/sendOTP");
const avatarDefault =
  "https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg";

function generate4Digits() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
function normalizeVNPhone(phone) {
  const p = phone.replace(/\D/g, "");
  if (!p) return phone;
  if (p.startsWith("0")) return `+84${p.slice(1)}`;
  if (p.startsWith("84")) return `+${p}`;
  if (p.startsWith("+84")) return p;
  return `+${p}`;
}


function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
}

const UserController = {
  // Đăng ký người dùng
  registerUser: async (req, res) => {
    try {
      const { fullName, phoneNumber, password, role, gender, email } = req.body;

      if (!fullName || !phoneNumber || !password || !role || !gender) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
      }

      const existed = await User.findOne({ phoneNumber });
      if (existed) {
        return res.status(409).json({ message: "Số điện thoại đã tồn tại" });
      }

      const hashedPassword = await hashPassword(userData.password);
      const user = new User({
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        password: hashedPassword,
        avatar: avatarDefault,
      });
      const savedUser = await user.save();
      res.status(201).json({ data: savedUser, message: "Đăng ký thành công" });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi" });
    }
  },

  // B1: gửi OTP
  sendOTP: async (req, res) => {
    try {
      const { phoneNumber, role } = req.body;
      if (!phoneNumber || !role) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu phoneNumber hoặc role" });
      }
      if (!["elderly", "family"].includes(role)) {
        return res
          .status(400)
          .json({ success: false, message: "Role không hợp lệ" });
      }

      // Check đã có user active chưa
      const existingActive = await User.findOne({
        phoneNumber,
        isActive: true,
      });
      if (existingActive) {
        return res
          .status(409)
          .json({ success: false, message: "Số điện thoại đã được đăng ký" });
      }

      const e164 = normalizeVNPhone(phoneNumber);
      const code = generate4Digits();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Lưu vào Redis (TTL 5 phút)
      const key = `tempRegister:${phoneNumber}`;
      const tempData = {
        phoneNumber,
        role,
        code,
        expiresAt,
        otpVerified: false,
      };
      await redis.set(key, JSON.stringify(tempData), "EX", 300);

      // Gửi SMS
      const message = `Mã xác nhận OTP của bạn là: ${code}`;
      const smsRes = await sendSMS({ to: e164, message });
      if (!smsRes.success) {
        return res.status(500).json({
          success: false,
          message: "Gửi SMS thất bại: " + smsRes.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Đã gửi OTP",
        data: { phoneNumber, expiresAt },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // B2: verify OTP
  verifyOTP: async (req, res) => {
    try {
      const { phoneNumber, otp } = req.body;
      if (!phoneNumber || !otp) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu phoneNumber hoặc otp" });
      }

      const key = `tempRegister:${phoneNumber}`;
      const dataStr = await redis.get(key);
      if (!dataStr) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy OTP hoặc đã hết hạn",
        });
      }

      const data = JSON.parse(dataStr);
      if (new Date(data.expiresAt) < new Date()) {
        return res
          .status(400)
          .json({ success: false, message: "OTP đã hết hạn" });
      }
      if (data.code !== otp) {
        return res
          .status(400)
          .json({ success: false, message: "OTP không đúng" });
      }

      data.otpVerified = true;
      await redis.set(key, JSON.stringify(data), "EX", 600); // gia hạn thêm 10 phút cho bước tiếp theo

      return res.status(200).json({
        success: true,
        message: "Xác thực OTP thành công",
        phoneNumber: phoneNumber,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // B3: set identity card
  setIdentity: async (req, res) => {
    try {
      const { phoneNumber, identityCard } = req.body;
      if (!phoneNumber || !identityCard) {
        return res.status(400).json({
          success: false,
          message: "Thiếu phoneNumber hoặc identityCard",
        });
      }

      const key = `tempRegister:${phoneNumber}`;
      const dataStr = await redis.get(key);
      if (!dataStr) {
        return res
          .status(404)
          .json({ success: false, message: "Session đăng ký đã hết hạn" });
      }

      const data = JSON.parse(dataStr);
      if (!data.otpVerified) {
        return res
          .status(400)
          .json({ success: false, message: "Vui lòng xác thực OTP trước" });
      }

      // Check CCCD đã có ở DB chưa
      const exists = await User.findOne({ identityCard });
      if (exists) {
        return res
          .status(409)
          .json({ success: false, message: "CCCD đã được đăng ký" });
      }

      data.identityCard = identityCard;
      await redis.set(key, JSON.stringify(data), "EX", 900); // gia hạn thêm

      return res
        .status(200)
        .json({ success: true, message: "Lưu CCCD thành công" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

 // B4: complete profile -> đọc session từ Redis, tạo user và xoá session
  completeProfile: async (req, res) => {
  try {
    const { fullName, dateOfBirth, gender, password } = req.body;
    if (!fullName || !gender || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu dữ liệu bắt buộc" });
    }

    const key = `tempRegister:${phoneNumber}`;
    const dataStr = await redis.get(key);
    if (!dataStr) {
      return res
        .status(404)
        .json({ success: false, message: "Session đăng ký đã hết hạn" });
    }

    const temp = JSON.parse(dataStr);
    if (!temp.otpVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng xác thực OTP trước" });
    }
    if (!temp.identityCard) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập CCCD trước" });
    }

    // Safety checks
    const existedActive = await User.findOne({ phoneNumber, isActive: true });
    if (existedActive) {
      return res
        .status(409)
        .json({ success: false, message: "Số điện thoại đã được đăng ký" });
    }

    const identityUsed = await User.findOne({ identityCard: temp.identityCard });
    if (identityUsed) {
      return res
        .status(409)
        .json({ success: false, message: "CCCD đã được đăng ký" });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = new User({
      phoneNumber,
      password: hashed,
      role: temp.role,
      fullName,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      identityCard: temp.identityCard,
      isActive: true,
      avatar: avatarDefault,
    });

    const savedUser = await user.save();

    const token = jwt.sign(
      { userId: savedUser._id, phoneNumber: savedUser.phoneNumber, role: savedUser.role },
      process.env.JWT_SECRET_KEY || "secret",
      { expiresIn: "7d" }
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Hoàn tất đăng ký",
      data: {
        user: {
          _id: savedUser._id,
          phoneNumber: savedUser.phoneNumber,
          role: savedUser.role,
          fullName: savedUser.fullName,
          dateOfBirth: savedUser.dateOfBirth,
          gender: savedUser.gender,
          avatar: savedUser.avatar,
        },
        token,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
},
    
  // Đăng nhập
  loginUser: async (req, res) => {
    try {
      const { phoneNumber, password } = req.body;

      const user = await User.findOne({ phoneNumber }).select("+password");
      if (!user)
        return res.status(404).json({ message: "Người dùng không tồn tại" });

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid)
        return res.status(401).json({ message: "Mật khẩu không đúng" });

      const token = jwt.sign(
        {
          userId: user._id,
          phoneNumber: user.phoneNumber,
          role: user.role,
          isActive: user.isActive,
        },
        process.env.JWT_SECRET_KEY
      );

      const safeUser = user.toObject();
      delete safeUser.password;

      res.status(200).json({
        token,
        user: safeUser,
        message: "Đăng nhập thành công",
      });
    } catch (error) {
      console.error("loginUser error:", error);
      res.status(500).json({ message: "Đã xảy ra lỗi" });
    }
  },

  // Lấy thông tin người dùng
  getUserInfo: async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId).select("-password");

      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      }

      res.status(200).json({ data: user });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi" });
    }
  },

  // Gửi OTP cho quên mật khẩu
  sendForgotPasswordOTP: async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: "Thiếu số điện thoại",
        });
      }

      // Kiểm tra user có tồn tại và đã active không
      const user = await User.findOne({ phoneNumber, isActive: true });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Số điện thoại không tồn tại trong hệ thống",
        });
      }

      const e164 = normalizeVNPhone(phoneNumber);
      const code = generate4Digits();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

      // Cập nhật OTP cho user
      user.otp = { code, expiresAt };
      await user.save({ validateBeforeSave: false });

      const message = `Mã xác nhận đặt lại mật khẩu của bạn là: ${code}`;
      const smsRes = await sendSMS({ to: e164, message });
      if (!smsRes.success) {
        return res.status(500).json({
          success: false,
          message: "Gửi SMS thất bại: " + smsRes.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Đã gửi mã OTP đến số điện thoại của bạn",
        data: { phoneNumber, expiresAt },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  // Xác thực OTP cho quên mật khẩu
  verifyForgotPasswordOTP: async (req, res) => {
    try {
      const { phoneNumber, otp } = req.body;
      if (!phoneNumber || !otp) {
        return res.status(400).json({
          success: false,
          message: "Thiếu số điện thoại hoặc mã OTP",
        });
      }

      const user = await User.findOne({ phoneNumber, isActive: true });
      if (!user || !user.otp?.code) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy mã OTP",
        });
      }

      if (user.otp.expiresAt < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Mã OTP đã hết hạn",
        });
      }

      if (user.otp.code !== otp) {
        return res.status(400).json({
          success: false,
          message: "Mã OTP không đúng",
        });
      }

      // Tạo token tạm thời để đặt lại mật khẩu (có thời hạn ngắn)
      const resetToken = jwt.sign(
        {
          userId: user._id,
          phoneNumber: user.phoneNumber,
          purpose: "reset-password",
        },
        process.env.JWT_SECRET_KEY || "secret",
        { expiresIn: "10m" } // 10 phút
      );

      // Clear OTP sau khi xác thực thành công
      user.otp = { code: null, expiresAt: null };
      await user.save({ validateBeforeSave: false });

      return res.status(200).json({
        success: true,
        message: "Xác thực OTP thành công",
        data: { resetToken },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  // Đặt lại mật khẩu
  resetPassword: async (req, res) => {
    try {
      const { resetToken, newPassword } = req.body;
      if (!resetToken || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Thiếu token đặt lại hoặc mật khẩu mới",
        });
      }

      // Xác thực reset token
      let decoded;
      try {
        decoded = jwt.verify(
          resetToken,
          process.env.JWT_SECRET_KEY || "secret"
        );
        if (decoded.purpose !== "reset-password") {
          throw new Error("Invalid token purpose");
        }
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          message: "Token không hợp lệ hoặc đã hết hạn",
        });
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      // Hash mật khẩu mới và cập nhật
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Đặt lại mật khẩu thành công",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  // Thay đổi mật khẩu
  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Thiếu mật khẩu cũ hoặc mật khẩu mới",
        });
      }

      const user = await User.findById(req.user.userId).select("+password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu cũ không đúng",
        });
      }

      // Hash mật khẩu mới và cập nhật
      const hashedPassword = await hashPassword(newPassword);
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Thay đổi mật khẩu thành công",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  // Gửi OTP đổi số điện thoại
  changePhoneSendOTP: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const { phoneNumber } = req.body;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Chưa đăng nhập" });
      }
      if (!phoneNumber) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu phoneNumber" });
      }

      const existed = await User.findOne({ phoneNumber, isActive: true });
      if (existed) {
        return res.status(409).json({
          success: false,
          message: "Số điện thoại đã được đăng ký",
        });
      }

      const e164 = normalizeVNPhone(phoneNumber);
      const code = generate4Digits();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Lưu OTP tạm vào redis
      const key = `changePhone:${userId}`;
      const data = { phoneNumber, code, expiresAt };
      await redis.set(key, JSON.stringify(data), "EX", 300);

      // Gửi SMS
      const message = `Mã xác nhận đổi số điện thoại của bạn là: ${code}`;
      const smsRes = await sendSMS({ to: e164, message });
      if (!smsRes.success) {
        return res.status(500).json({
          success: false,
          message: "Gửi SMS thất bại: " + smsRes.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Đã gửi OTP tới số điện thoại mới",
        data: { phoneNumber, expiresAt },
      });
    } catch (err) {
      console.error("changePhoneSendOTP error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // Xác thực OTP và đổi số
  changePhoneVerify: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const { phoneNumber, otp } = req.body;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Chưa đăng nhập" });
      }
      if (!phoneNumber || !otp) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu phoneNumber hoặc otp" });
      }

      const key = `changePhone:${userId}`;
      const dataStr = await redis.get(key);
      if (!dataStr) {
        return res.status(404).json({
          success: false,
          message: "OTP không tồn tại hoặc đã hết hạn",
        });
      }

      const data = JSON.parse(dataStr);
      if (data.phoneNumber !== phoneNumber) {
        return res.status(400).json({
          success: false,
          message: "Số điện thoại không khớp với OTP",
        });
      }
      if (new Date(data.expiresAt) < new Date()) {
        return res
          .status(400)
          .json({ success: false, message: "OTP đã hết hạn" });
      }
      if (data.code !== otp) {
        return res
          .status(400)
          .json({ success: false, message: "OTP không đúng" });
      }

      // Cập nhật số điện thoại mới cho user
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Người dùng không tồn tại" });
      }

      user.phoneNumber = phoneNumber;
      await user.save();

      await redis.del(key);

      return res.status(200).json({
        success: true,
        message: "Đổi số điện thoại thành công",
        data: { userId: user._id, phoneNumber: user.phoneNumber },
      });
    } catch (err) {
      console.error("changePhoneVerify error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // B1: Gửi OTP đổi email
  changeEmailSendOTP: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const { email } = req.body || {};

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Chưa đăng nhập" });
      }
      if (!email) {
        return res.status(400).json({ success: false, message: "Thiếu email" });
      }
      if (!isValidEmail(email)) {
        return res
          .status(400)
          .json({ success: false, message: "Email không hợp lệ" });
      }

      // Tìm user hiện tại
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Người dùng không tồn tại" });
      }

      // Email mới trùng với email hiện tại
      if (user.email && user.email === email) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Email mới trùng với email hiện tại",
          });
      }

      // Email đã được dùng bởi user khác?
      const existed = await User.findOne({ email, isActive: true });
      if (existed) {
        return res
          .status(409)
          .json({ success: false, message: "Email đã được đăng ký" });
      }

      const code = generate4Digits();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

      // Lưu tạm vào Redis (10 phút)
      const key = `changeEmail:${userId}`;
      const payload = { email, code, expiresAt };
      await redis.set(key, JSON.stringify(payload), "EX", 600);

      if (process.env.EMAIL_BYPASS === "1") {
        console.log("[DEV][EMAIL_BYPASS] OTP email:", email, "code:", code);
        return res.status(200).json({
          success: true,
          message: "Đã tạo OTP (DEV bypass)",
          data: { email, expiresAt, devOTP: code },
        });
      }

      // Gửi email OTP
      const mailRes = await sendOTPEmail(email, code);
      if (!mailRes?.success) {
        return res.status(500).json({
          success: false,
          message: "Gửi email thất bại",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Đã gửi OTP tới email của bạn",
        data: { email, expiresAt },
      });
    } catch (err) {
      console.error("changeEmailSendOTP error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },
  changeEmailVerify: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const { email, otp } = req.body || {};

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Chưa đăng nhập" });
      }
      if (!email || !otp) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu email hoặc otp" });
      }

      const key = `changeEmail:${userId}`;
      const dataStr = await redis.get(key);
      if (!dataStr) {
        return res
          .status(404)
          .json({
            success: false,
            message: "OTP không tồn tại hoặc đã hết hạn",
          });
      }

      const data = JSON.parse(dataStr);
      if (data.email !== email) {
        return res
          .status(400)
          .json({ success: false, message: "Email không khớp với OTP" });
      }
      if (new Date(data.expiresAt) < new Date()) {
        return res
          .status(400)
          .json({ success: false, message: "OTP đã hết hạn" });
      }
      if (data.code !== otp) {
        return res
          .status(400)
          .json({ success: false, message: "OTP không đúng" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Người dùng không tồn tại" });
      }

      user.email = email;
      await user.save();

      await redis.del(key);

      return res.status(200).json({
        success: true,
        message: "Đổi email thành công",
        data: { userId: user._id, email: user.email },
      });
    } catch (err) {
      console.error("changeEmailVerify error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = UserController;
