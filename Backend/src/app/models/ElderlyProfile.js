const mongoose = require("mongoose");

const elderlyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Thông tin sức khỏe
    healthInfo: {
      bloodType: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      },
      chronicDiseases: [String], // Các bệnh nền
    },
    healthSettings: {
      dailyHealthReminder: {
        enabled: { type: Boolean, default: true },
        time: { type: String, default: "08:00" }, // giờ mặc định 8h sáng
      },
      medicationReminder: {
        enabled: { type: Boolean, default: true },
        times: [{ type: String }], // danh sách giờ uống thuốc: ["06:30", "12:30", "20:00"]
      },
      exerciseReminder: {
        enabled: { type: Boolean, default: false },
        frequency: {
          type: String,
          enum: ["daily", "weekly"],
          default: "daily",
        },
        time: { type: String, default: "18:00" }, // mặc định 6h chiều
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ElderlyProfile", elderlyProfileSchema);
