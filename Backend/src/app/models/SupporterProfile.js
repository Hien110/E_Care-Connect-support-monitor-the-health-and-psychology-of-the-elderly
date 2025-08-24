const mongoose = require('mongoose');

const supporterProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Thông tin dịch vụ
  services: [{
    serviceType: {
      type: String,
      required: true,
      enum: ['basic_care', 'medical_support', 'transportation', 'shopping', 'cleaning', 'cooking', 'companionship', 'personal_care', 'other']
    },
    serviceName: {
      type: String,
      required: true
    },
    description: String,
    pricePerSession: {
      type: Number,
      required: true
    },
    duration: Number, // phút
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  // Kinh nghiệm và chứng chỉ
  experience: {
    totalYears: Number,
    description: String,
    previousJobs: [{
      position: String,
      company: String,
      duration: String,
      description: String
    }]
  },
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    certificateUrl: String, // URL ảnh chứng chỉ
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  // Lịch làm việc
  availability: {
    schedule: [{
      dayOfWeek: {
        type: Number,
        required: true, // 0-6 (Chủ nhật - Thứ 7)
        min: 0,
        max: 6
      },
      timeSlots: [{
        start: {
          type: String,
          required: true // "07:30"
        },
        end: {
          type: String,
          required: true // "11:30"
        },
        slotType: {
          type: String,
          enum: ['morning', 'afternoon', 'evening', 'night'],
          required: true
        },
        isAvailable: {
          type: Boolean,
          default: true
        }
      }]
    }],
    timeZone: {
      type: String,
      default: 'Asia/Ho_Chi_Minh'
    }
  },
  // Phạm vi hoạt động
  serviceArea: {
    radius: {
      type: Number,
      default: 20, // km
      max: 50
    },
    preferredDistricts: [String],
    transportationMode: {
      type: String,
      enum: ['motorbike', 'car', 'public_transport', 'bicycle'],
      default: 'motorbike'
    }
  },
  // Thống kê đánh giá (tự động tính từ bảng Rating)
  ratingStats: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    lastRatingAt: Date
  },
  // Trạng thái tài khoản
  verificationStatus: {
    identityVerified: {
      type: Boolean,
      default: false
    },
    backgroundCheckPassed: {
      type: Boolean,
      default: false
    },
    certificationsVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  isAvailableNow: {
    type: Boolean,
    default: false
  },
  lastActiveAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('SupporterProfile', supporterProfileSchema);
