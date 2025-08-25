const mongoose = require('mongoose');

const familyProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Cài đặt thông báo
  notificationSettings: {
    healthAlerts: {
      enabled: {
        type: Boolean,
        default: true
      },
      severity: {
        type: [String],
        enum: ['low', 'medium', 'high', 'critical'],
        default: ['medium', 'high', 'critical']
      }
    },
    emotionalAlerts: {
      enabled: {
        type: Boolean,
        default: true
      },
      sentimentThreshold: {
        type: String,
        enum: ['all', 'negative_only', 'severe_only'],
        default: 'negative_only'
      }
    },
    emergencyAlerts: {
      enabled: {
        type: Boolean,
        default: true
      },
      immediateCall: {
        type: Boolean,
        default: true // Gọi ngay khi có SOS
      },
      priority: {
        type: Number,
        default: 1 // Thứ tự ưu tiên khi gọi khẩn cấp
      }
    },
    medicationReminders: {
      enabled: {
        type: Boolean,
        default: false // Mặc định không nhận nhắc uống thuốc
      }
    },
    appointmentReminders: {
      enabled: {
        type: Boolean,
        default: true
      },
      advanceHours: {
        type: Number,
        default: 24 // Nhắc trước 24h
      }
    }
  },
  // Phương thức liên lạc ưu tiên
  preferredContactMethods: [{
    method: {
      type: String,
      enum: ['call', 'sms', 'email', 'push_notification'],
      required: true
    },
    priority: {
      type: Number,
      required: true // 1 = cao nhất
    },
    enabled: {
      type: Boolean,
      default: true
    },
    // Thời gian có thể liên lạc
    availableHours: {
      start: String, // "08:00"
      end: String    // "22:00"
    }
  }],
  // Quyền hạn và vai trò
  caregivingRole: {
    isPrimaryCaregiver: {
      type: Boolean,
      default: false
    },
    canBookServices: {
      type: Boolean,
      default: false
    },
    canAccessMedicalInfo: {
      type: Boolean,
      default: true
    },
    canMakeHealthDecisions: {
      type: Boolean,
      default: false
    },
    emergencyContactPriority: {
      type: Number,
      default: 1
    }
  },
  // Lịch sử chăm sóc
  careHistory: {
    totalElderlyConnections: {
      type: Number,
      default: 0
    },
    servicesBooked: {
      type: Number,
      default: 0
    },
    emergenciesHandled: {
      type: Number,
      default: 0
    },
    lastActiveDate: Date
  },
  // Cài đặt dashboard
  dashboardPreferences: {
    defaultView: {
      type: String,
      enum: ['health_overview', 'recent_activities', 'alerts', 'appointments'],
      default: 'health_overview'
    },
    healthDataDisplay: {
      showVitals: {
        type: Boolean,
        default: true
      },
      showEmotionalData: {
        type: Boolean,
        default: true
      },
      showMedications: {
        type: Boolean,
        default: true
      },
      timeRange: {
        type: String,
        enum: ['7days', '30days', '90days', '1year'],
        default: '30days'
      }
    },
    alertFilters: {
      hideResolvedAlerts: {
        type: Boolean,
        default: true
      },
      groupByType: {
        type: Boolean,
        default: false
      }
    }
  },
  // Thông tin khẩn cấp
  emergencyInfo: {
    alternativeContacts: [{
      name: {
        type: String,
        required: true
      },
      relationship: String,
      phoneNumber: {
        type: String,
        required: true
      },
      isBackup: {
        type: Boolean,
        default: false
      }
    }],
    medicalKnowledge: {
      hasFirstAidTraining: {
        type: Boolean,
        default: false
      },
      hasMedicalBackground: {
        type: Boolean,
        default: false
      },
      specializedIn: [String] // Alzheimer, Diabetes, etc.
    }
  },
  // Cài đặt riêng tư
  privacySettings: {
    shareProfileWithSupporters: {
      type: Boolean,
      default: false
    },
    shareProfileWithDoctors: {
      type: Boolean,
      default: false
    },
    allowDataAnalytics: {
      type: Boolean,
      default: true
    }
  },
  // Ghi chú và theo dõi
  notes: [{
    content: String,
    category: {
      type: String,
      enum: ['health_observation', 'behavior_change', 'appointment_note', 'general'],
      default: 'general'
    },
    isPrivate: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Cảnh báo được đánh dấu quan trọng
  bookmarkedAlerts: [{
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyAlert'
    },
    bookmarkedAt: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('FamilyProfile', familyProfileSchema);
