const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Thông tin chuyên môn
  medicalInfo: {
    licenseNumber: {
      type: String,
      required: true,
      unique: true
    },
    licenseImages: [String], // URLs của ảnh giấy phép
    specializations: [{
      type: String,
      required: true
    }],
    subSpecializations: [String],
    medicalDegrees: [{
      degree: String, // MD, PhD, etc.
      university: String,
      graduationYear: Number,
      certificateUrl: String
    }],
    boardCertifications: [{
      certification: String,
      issuedBy: String,
      issuedDate: Date,
      expiryDate: Date,
      certificateUrl: String
    }]
  },
  // Kinh nghiệm
  experience: {
    totalYears: {
      type: Number,
      required: true
    },
    description: String,
    previousPositions: [{
      position: String,
      hospital: String,
      department: String,
      startDate: Date,
      endDate: Date,
      responsibilities: String
    }]
  },
  // Nơi làm việc hiện tại
  currentWorkPlace: {
    hospitalName: String,
    department: String,
    position: String,
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    contactInfo: {
      phone: String,
      email: String
    }
  },
  // Lịch làm việc và tư vấn
  availability: {
    consultationTypes: [{
      type: {
        type: String,
        enum: ['online', 'offline'],
        required: true
      },
      isAvailable: {
        type: Boolean,
        default: true
      }
    }],
    schedule: [{
      dayOfWeek: {
        type: Number,
        required: true, // 0-6
        min: 0,
        max: 6
      },
      timeSlots: [{
        start: {
          type: String,
          required: true
        },
        end: {
          type: String,
          required: true
        },
        consultationType: {
          type: String,
          enum: ['online', 'offline', 'both'],
          required: true
        },
        maxPatients: {
          type: Number,
          default: 1
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
    },
    bookingAdvanceTime: {
      type: Number,
      default: 24 // hours
    }
  },
  // Phí tư vấn
  consultationFees: {
    online: {
      type: Number,
      required: true
    },
    offline: {
      type: Number,
      required: true
    },
    followUp: Number,
    emergency: Number,
    currency: {
      type: String,
      default: 'VND'
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
  // Thống kê
  stats: {
    totalConsultations: {
      type: Number,
      default: 0
    },
    totalPatients: {
      type: Number,
      default: 0
    },
    averageConsultationDuration: Number, // phút
    totalEarnings: {
      type: Number,
      default: 0
    },
    lastConsultationDate: Date
  },
  // Cài đặt tư vấn
  consultationSettings: {
    languages: [String],
    maxPatientsPerDay: {
      type: Number,
      default: 8
    },
    consultationDuration: {
      type: Number,
      default: 30 // phút
    },
    allowEmergencyConsultations: {
      type: Boolean,
      default: false
    },
    requirePreConsultationForm: {
      type: Boolean,
      default: true
    }
  },
  // Trạng thái xác minh
  verificationStatus: {
    licenseVerified: {
      type: Boolean,
      default: false
    },
    hospitalAffiliationVerified: {
      type: Boolean,
      default: false
    },
    identityVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  // Trạng thái hiện tại
  isAvailableNow: {
    type: Boolean,
    default: false
  },
  lastActiveAt: Date,
  // Ghi chú admin
  adminNotes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
