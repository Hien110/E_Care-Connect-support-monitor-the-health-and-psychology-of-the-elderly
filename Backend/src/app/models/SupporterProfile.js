const mongoose = require("mongoose");

const supporterProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    experience: {
      totalYears: Number,
      description: String,
    },
    // Lịch làm việc
    schedule: [
      {
        dayOfWeek: {
          type: Number, // 0-6 (Chủ nhật - Thứ 7)
          min: 2,
          max: 8,
        },
        timeSlots: {
          type: String, // "08:00-12:00", "13:00-17:00"
          enum: ["morning", "afternoon", "evening"],
        },
      },
    ],
    // Phạm vi hoạt động
    serviceArea: {
      type: Number,
      default: 10, // km
      max: 50,
    },
    // Thống kê đánh giá (tự động tính từ bảng Rating)
    ratingStats: {
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalRatings: {
        type: Number,
        default: 0,
      },
      lastRatingAt: Date,
    },
    bankCard: {
      cardNumber: {
        type: String,
        required: true,
        match: /^\d{12,19}$/, 
      },
      cardHolderName: {
        type: String,
        required: true,
        trim: true,
      },
      expiryMonth: {
        type: Number,
        min: 1,
        max: 12,
        required: true,
      },
      expiryYear: {
        type: Number,
        min: new Date().getFullYear(),
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SupporterProfile", supporterProfileSchema);
