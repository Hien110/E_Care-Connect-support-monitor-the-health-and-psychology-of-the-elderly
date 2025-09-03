// controllers/user.controller.js
const { sendSMS } = require("../../utils/smsClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const hashPassword = require("../../utils/hashPassword");

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

  // B1: Chọn role + nhập sđt -> gửi OTP
  sendOTP: async (req, res) => {
  try {
    const { phoneNumber, role } = req.body;
    if (!phoneNumber || !role)
      return res.status(400).json({ success: false, message: "Thiếu phoneNumber hoặc role" });

    if (!["elderly", "family"].includes(role))
      return res.status(400).json({ success: false, message: "Role không hợp lệ" });

    const existingActive = await User.findOne({ phoneNumber, isActive: true });
    if (existingActive)
      return res.status(409).json({ success: false, message: "Số điện thoại đã được đăng ký" });

    const e164 = normalizeVNPhone(phoneNumber);
    const code = generate4Digits();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({
        phoneNumber,
        role,
        isActive: false,
        otp: { code, expiresAt },
      });
      // bỏ qua validate khi save
      await user.save({ validateBeforeSave: false });
    } else {
      user.role = role;
      user.otp = { code, expiresAt };
      await user.save({ validateBeforeSave: false });
    }

    const message = `Mã xác nhận OTP của bạn là: ${code}`;
    const smsRes = await sendSMS({ to: e164, message });
    if (!smsRes.success) {
      return res.status(500).json({ success: false, message: "Gửi SMS thất bại: " + smsRes.message });
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
      if (!phoneNumber || !otp)
        return res
          .status(400)
          .json({ success: false, message: "Thiếu phoneNumber hoặc otp" });

      const user = await User.findOne({ phoneNumber });
      if (!user || !user.otp?.code)
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy OTP" });
      if (user.otp.expiresAt < new Date())
        return res
          .status(400)
          .json({ success: false, message: "OTP đã hết hạn" });
      if (user.otp.code !== otp)
        return res
          .status(400)
          .json({ success: false, message: "OTP không đúng" });

      // mark verified by clearing otp (or set otpVerified flag if you want)
      user.otp = { code: null, expiresAt: null };
      await user.save({ validateBeforeSave: false });
      return res
        .status(200)
        .json({ success: true, message: "Xác thực OTP thành công" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // B3: set identity card (CMND/CCCD)
  setIdentity: async (req, res) => {
    try {
      const { phoneNumber, identityCard } = req.body;
      if (!phoneNumber || !identityCard)
        return res
          .status(400)
          .json({
            success: false,
            message: "Thiếu phoneNumber hoặc identityCard",
          });

      const user = await User.findOne({ phoneNumber });
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy user" });

      // Check user passed OTP (otp cleared)
      if (user.otp?.code)
        return res
          .status(400)
          .json({
            success: false,
            message: "Vui lòng xác thực OTP trước khi nhập CCCD",
          });

      // Check CCCD unique among active users
      const exists = await User.findOne({ identityCard });
      if (exists && exists.phoneNumber !== phoneNumber) {
        return res
          .status(409)
          .json({ success: false, message: "CCCD đã được đăng ký" });
      }

      user.identityCard = identityCard;
      await user.save({ validateBeforeSave: false });
      return res
        .status(200)
        .json({ success: true, message: "Cập nhật CCCD thành công" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // B4: complete profile -> fullName, dateOfBirth, gender => set active + hash password
  completeProfile: async (req, res) => {
  try {
    const { fullName, dateOfBirth, gender, password } = req.body;
    if (!fullName || !gender || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu dữ liệu bắt buộc" });
    }

    // tìm user qua identityCard (đã lưu ở bước setIdentity)
    const user = await User.findOne({ identityCard: { $exists: true, $ne: null } })
      .sort({ createdAt: -1 }); // lấy user mới nhất nếu có nhiều
    
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy user" });
    }

    // kiểm tra OTP + CCCD
    if (user.otp?.code) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng xác thực OTP trước" });
    }
    if (!user.identityCard) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập CCCD trước" });
    }

    // hash password & update profile
    const hashed = await bcrypt.hash(password, 12);
    user.password = hashed;
    user.fullName = fullName;
    user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    user.gender = gender;
    user.isActive = true;
    user.avatar = user.avatar || avatarDefault;

    // tạo token mới
    const token = jwt.sign(
      { userId: user._id, phoneNumber: user.phoneNumber, role: user.role },
      process.env.JWT_SECRET_KEY || "secret",
      { expiresIn: "7d" }
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Hoàn tất đăng ký",
      data: {
        user: {
          _id: user._id,
          phoneNumber: user.phoneNumber,
          role: user.role,
          fullName: user.fullName,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          avatar: user.avatar,
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
        process.env.JWT_SECRET_KEY,
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
          message: "Thiếu số điện thoại" 
        });
      }

      // Kiểm tra user có tồn tại và đã active không
      const user = await User.findOne({ phoneNumber, isActive: true });
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "Số điện thoại không tồn tại trong hệ thống" 
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
          message: "Gửi SMS thất bại: " + smsRes.message 
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
        message: err.message 
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
          message: "Thiếu số điện thoại hoặc mã OTP" 
        });
      }

      const user = await User.findOne({ phoneNumber, isActive: true });
      if (!user || !user.otp?.code) {
        return res.status(404).json({ 
          success: false, 
          message: "Không tìm thấy mã OTP" 
        });
      }

      if (user.otp.expiresAt < new Date()) {
        return res.status(400).json({ 
          success: false, 
          message: "Mã OTP đã hết hạn" 
        });
      }

      if (user.otp.code !== otp) {
        return res.status(400).json({ 
          success: false, 
          message: "Mã OTP không đúng" 
        });
      }

      // Tạo token tạm thời để đặt lại mật khẩu (có thời hạn ngắn)
      const resetToken = jwt.sign(
        { userId: user._id, phoneNumber: user.phoneNumber, purpose: 'reset-password' },
        process.env.JWT_SECRET_KEY || "secret",
        { expiresIn: "10m" } // 10 phút
      );

      // Clear OTP sau khi xác thực thành công
      user.otp = { code: null, expiresAt: null };
      await user.save({ validateBeforeSave: false });

      return res.status(200).json({ 
        success: true, 
        message: "Xác thực OTP thành công",
        data: { resetToken }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ 
        success: false, 
        message: err.message 
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
          message: "Thiếu token đặt lại hoặc mật khẩu mới" 
        });
      }

      // Xác thực reset token
      let decoded;
      try {
        decoded = jwt.verify(resetToken, process.env.JWT_SECRET_KEY || "secret");
        if (decoded.purpose !== 'reset-password') {
          throw new Error('Invalid token purpose');
        }
      } catch (jwtError) {
        return res.status(401).json({ 
          success: false, 
          message: "Token không hợp lệ hoặc đã hết hạn" 
        });
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "Người dùng không tồn tại" 
        });
      }

      // Hash mật khẩu mới và cập nhật
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({ 
        success: true, 
        message: "Đặt lại mật khẩu thành công" 
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ 
        success: false, 
        message: err.message 
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
          message: "Thiếu mật khẩu cũ hoặc mật khẩu mới" 
        });
      }

      const user = await User.findById(req.user.userId).select('+password');
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "Người dùng không tồn tại" 
        });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false, 
          message: "Mật khẩu cũ không đúng" 
        });
      }

      // Hash mật khẩu mới và cập nhật
      const hashedPassword = await hashPassword(newPassword);
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({ 
        success: true, 
        message: "Thay đổi mật khẩu thành công" 
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ 
        success: false, 
        message: err.message 
      });
    }
  },

};

module.exports = UserController;
