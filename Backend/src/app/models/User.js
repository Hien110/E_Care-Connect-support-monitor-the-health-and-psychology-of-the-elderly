const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["elderly", "family", "supporter", "doctor", "admin"],
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
    },
    avatar: {
      type: String, // URL từ Cloudinary
      default: null,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      default: null,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false, // Cho supporter và doctor cần admin duyệt
    },
    // Thông tin căn cước (được mã hóa)
    identityCard: {
      cardNumber: String, // Mã hóa
      fullName: String, // Không mã hóa
      dateOfBirth: Date, // Mã hóa
      address: String, // Mã hóa
    },
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

module.exports = mongoose.model("User", userSchema);
