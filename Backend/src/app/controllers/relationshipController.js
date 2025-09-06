const { get } = require("mongoose");
const Relationship = require("../models/Relationship.js");
const User = require("../models/User.js");

const RelationshipController = {
  getAllRelationships: async (req, res) => {
    try {
      const userId = req.user.userId; // Lấy từ token JWT
      
      // Tìm tất cả relationships mà user là family hoặc elderly
      const relationships = await Relationship.find({
        $or: [
          { family: userId },
          { elderly: userId }
        ]
      }).populate('elderly', 'fullName phoneNumber avatar')
        .populate('family', 'fullName phoneNumber avatar');
      
      return res.status(200).json({
        success: true,
        data: relationships
      });
    } catch (error) {
      console.error("Error fetching relationships:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  },

  // Tạo mối quan hệ mới
  createRelationship: async (req, res) => {
    try {
      const { elderlyId, relationship } = req.body;
      const familyId = req.user.userId; // Lấy từ token JWT

      // Validation
      if (!elderlyId || !relationship) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin elderlyId hoặc relationship"
        });
      }

      // Kiểm tra người già có tồn tại không
      const elderly = await User.findById(elderlyId);
      if (!elderly || elderly.role !== 'elderly') {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người già"
        });
      }

      // Kiểm tra người thân có tồn tại không
      const family = await User.findById(familyId);
      if (!family || family.role !== 'family') {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin người thân" + familyId
        });
      }

      // Kiểm tra xem mối quan hệ đã tồn tại chưa
      const existingRelationship = await Relationship.findOne({
        elderly: elderlyId,
        family: familyId,
        $or: [
          { status: 'pending' },
          { status: 'accepted' }
        ]
      });

      if (existingRelationship) {
        return res.status(409).json({
          success: false,
          message: "Mối quan hệ đã tồn tại hoặc đang chờ duyệt"
        });
      }

      // Tạo mối quan hệ mới
      const newRelationship = new Relationship({
        elderly: elderlyId,
        family: familyId,
        relationship: relationship,
        requestedBy: familyId,
        status: 'pending'
      });

      const savedRelationship = await newRelationship.save();

      // Populate thông tin để trả về
      await savedRelationship.populate('elderly', 'fullName phoneNumber');
      await savedRelationship.populate('family', 'fullName phoneNumber');
      await savedRelationship.populate('requestedBy', 'fullName');

      return res.status(201).json({
        success: true,
        message: "Yêu cầu kết nối đã được gửi thành công",
        data: savedRelationship
      });

    } catch (error) {
      console.error("Error creating relationship:", error);
      return res.status(500).json({
        success: false,
        message: "Đã xảy ra lỗi khi tạo mối quan hệ"
      });
    }
  },

  getRequestRelationshipsById: async (req, res) => {
    try {
      const userId = req.user.userId; // Lấy từ token JWT
      const relationships = await Relationship.find({
        elderly: userId,
        status: 'pending'
      }).populate('elderly', 'fullName avatar phoneNumber').populate('requestedBy', 'fullName avatar phoneNumber');
      return res.status(200).json({
        success: true,
        data: relationships
      });
    } catch (error) {
      console.error("Error fetching relationships:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  },

  acceptRelationship: async (req, res) => {
    try {
      const { relationshipId } = req.params;
      const userId = req.user.userId; // Lấy từ token JWT
      const relationship = await Relationship.findById(relationshipId);

      if (!relationship) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy mối quan hệ"
        });
      }
      if (relationship.elderly.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền thực hiện hành động này"
        });
      }
      if (relationship.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: "Mối quan hệ không ở trạng thái chờ duyệt"
        });
      }
      relationship.status = 'accepted';
      relationship.respondedAt = new Date();
      await relationship.save();
      return res.status(200).json({
        success: true,
        message: "Mối quan hệ đã được chấp nhận",
        data: relationship
      });
    } catch (error) {
      console.error("Error accepting relationship:", error);
      return res.status(500).json({
        success: false,
        message: "Đã xảy ra lỗi khi chấp nhận mối quan hệ"
      });
    }
  },

  rejectRelationship: async (req, res) => {
    try {
      const { relationshipId } = req.params;
      const userId = req.user.userId; // Lấy từ token JWT
      const relationship = await Relationship.findById(relationshipId);
      if (!relationship) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy mối quan hệ"
        });
      }
      if (relationship.elderly.toString() !== userId && relationship.family.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền thực hiện hành động này"
        });
      }
      if (relationship.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: "Mối quan hệ không ở trạng thái chờ duyệt"
        });
      }
      relationship.status = 'rejected';
      relationship.respondedAt = new Date();
      await relationship.save();
      return res.status(200).json({
        success: true,
        message: "Mối quan hệ đã bị từ chối",
        data: relationship
      });
    } catch (error) {
      console.error("Error rejecting relationship:", error);
      return res.status(500).json({
        success: false,
        message: "Đã xảy ra lỗi khi từ chối mối quan hệ"
      });
    }
  },

  getAcceptRelationshipByUserId: async (req, res) => {
    try {
      const userId = req.user.userId; // Lấy từ token JWT
      const relationships = await Relationship.find({
        elderly: userId,
        status: 'accepted'
      }).populate('elderly', 'fullName avatar phoneNumber').populate('requestedBy', 'fullName avatar phoneNumber');
      return res.status(200).json({
        success: true,
        data: relationships
      });
    } catch (error) {
      console.error("Error fetching relationships:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  },

  getAcceptRelationshipByFamilyId: async (req, res) => {
    try {
      const userId = req.user.userId; // Lấy từ token JWT
      const relationships = await Relationship.find({
        family: userId,
        status: 'accepted'
      }).populate('elderly', 'fullName avatar phoneNumber').populate('requestedBy', 'fullName avatar phoneNumber');

      return res.status(200).json({
        success: true,
        data: relationships
      });
    } catch (error) {
      console.error("Error fetching relationships:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  },

  cancelRelationship: async (req, res) => {
    try {
      const { relationshipId } = req.params;
      const userId = req.user.userId; // Lấy từ token JWT
      const relationship = await Relationship.findById(relationshipId);

      if (!relationship) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy mối quan hệ"
        });
      }
      if (relationship.elderly.toString() !== userId && relationship.family.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền thực hiện hành động này"
        });
      }
      relationship.status = 'cancelled';
      await relationship.save();
      return res.status(200).json({
        success: true,
        message: "Đã hủy kết nối thành công"
      });
    } catch (error) {
      console.error("Error canceling relationship:", error);
      return res.status(500).json({
        success: false,
        message: "Đã xảy ra lỗi khi hủy kết nối"
      });
    }
  }

};

module.exports = RelationshipController;
