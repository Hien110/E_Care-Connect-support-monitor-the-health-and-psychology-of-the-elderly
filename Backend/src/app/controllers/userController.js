const User = require("../models/User");
const hashPassword = require("../../utils/hashPassword");
const jwt = require("jsonwebtoken");

const avatarDefault =
  "https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg";

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

      // 🔑 Hash password trước khi lưu
      const hashedPassword = await hashPassword(password);

      const user = new User({
        fullName,
        phoneNumber,
        password: hashedPassword, // Lưu hash thay vì plain
        role,
        gender,
        email,
        avatar: avatarDefault,
      });

      const savedUser = await user.save();
      const safe = savedUser.toObject();
      delete safe.password;

      return res
        .status(201)
        .json({ data: safe, message: "Đăng ký thành công" });
    } catch (error) {
      console.error("[registerUser] error:", error?.name, error?.code, error?.message);

      if (error?.code === 11000) {
        return res.status(409).json({ message: "Số điện thoại đã tồn tại" });
      }
      if (error?.name === "ValidationError") {
        const details = Object.values(error.errors).map((e) => e.message);
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", details });
      }
      return res.status(500).json({ message: "Đã xảy ra lỗi" });
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
};

module.exports = UserController;
