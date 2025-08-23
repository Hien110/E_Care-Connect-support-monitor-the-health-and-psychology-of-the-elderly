const mongoose = require('mongoose');

const relationshipSchema = new mongoose.Schema({
  elderly: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relationship: {
    type: String,
    required: true,
    enum: ['child', 'spouse', 'sibling', 'parent', 'grandchild', 'relative', 'friend', 'caregiver']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: Date,
  permissions: {
    viewHealthData: {
      type: Boolean,
      default: true
    },
    viewEmotionalData: {
      type: Boolean,
      default: true
    },
    receiveAlerts: {
      type: Boolean,
      default: true
    },
    bookServices: {
      type: Boolean,
      default: false
    },
    emergencyContact: {
      type: Boolean,
      default: true
    },
    accessMedicalRecords: {
      type: Boolean,
      default: false
    }
  },
  // Mức độ quan tâm/chăm sóc
  careLevel: {
    type: String,
    enum: ['primary', 'secondary', 'occasional', 'emergency_only'],
    default: 'secondary'
  },
  // Ghi chú về mối quan hệ
  relationshipNotes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Relationship', relationshipSchema);
