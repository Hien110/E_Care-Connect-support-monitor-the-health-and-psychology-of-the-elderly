const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  // Người đánh giá
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Người/dịch vụ được đánh giá
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Loại đánh giá
  ratingType: {
    type: String,
    enum: ['support_service', 'consultation', 'supporter_profile', 'doctor_profile'],
    required: true
  },
  // ID của dịch vụ được đánh giá (nếu có)
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'serviceModel'
  },
  serviceModel: {
    type: String,
    enum: ['SupportRequest', 'Consultation']
  },
  // Điểm số tổng thể
  overallScore: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // Điểm chi tiết theo từng tiêu chí
  criteria: {
    // Cho supporter
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    professionalism: {
      type: Number,
      min: 1,
      max: 5
    },
    // Cho doctor
    expertise: {
      type: Number,
      min: 1,
      max: 5
    },
    bedside_manner: {
      type: Number,
      min: 1,
      max: 5
    },
    // Tiêu chí chung
    satisfaction: {
      type: Number,
      min: 1,
      max: 5
    },
    value_for_money: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  // Bình luận
  comment: {
    type: String,
    maxlength: 1000
  },
  // Ưu điểm
  pros: [String],
  // Nhược điểm
  cons: [String],
  // Trạng thái
  status: {
    type: String,
    enum: ['active', 'hidden', 'reported', 'deleted'],
    default: 'active'
  },
  // Báo cáo (nếu có)
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate_content', 'fake_review', 'spam', 'offensive_language', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending'
    }
  }],
  // Thời gian đánh giá
  ratedAt: {
    type: Date,
    default: Date.now
  },
  // Đánh giá có hữu ích không (voted by other users)
  helpfulness: {
    helpful: {
      type: Number,
      default: 0
    },
    notHelpful: {
      type: Number,
      default: 0
    },
    voters: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      vote: {
        type: String,
        enum: ['helpful', 'not_helpful']
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Rating', ratingSchema);
