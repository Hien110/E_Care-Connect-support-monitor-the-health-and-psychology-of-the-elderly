const mongoose = require('mongoose');

const elderlyProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Thông tin sức khỏe
  healthInfo: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    chronicDiseases: [String], // Các bệnh nền
  },
  // Cài đặt sức khỏe
  healthSettings: {
    dailyHealthReminder: {
      type: Boolean,
      default: true
    },
    medicationReminder: {
      type: Boolean,
      default: true
    },
    exerciseReminder: {
      type: Boolean,
      default: false
    }
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('ElderlyProfile', elderlyProfileSchema);
