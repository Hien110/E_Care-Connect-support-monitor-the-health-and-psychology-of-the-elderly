const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    }, // Mã hóa số điện thoại
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },  // Mã hóa
    role: {
      type: String,
      enum: ["elderly", "family", " ", "doctor", "admin"],
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },  // Mã hóa
    avatar: {
      type: String, // URL từ Cloudinary
      default: "https://cdn.sforum.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg",
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      default: null,
    }, // Mã hóa
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Thông tin căn cước (được mã hóa)
    identityCard: {
      type: Number,
    }, // Mã  hóa
    // OTP cho xác thực
    otp: {
      code: String,
      expiresAt: Date,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);
userSchema.methods.comparePassword = function (plain) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", userSchema);
