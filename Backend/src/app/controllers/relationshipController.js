const Relationship = require("../models/Relationship.js");
const User = require("../models/User.js");

const RelationshipController = {
  getAllRelationships: async (req, res) => {
    try {
      const relationships = await Relationship.findAll();
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

      // Kiểm tra relationship có hợp lệ không
      const validRelationships = ['child', 'spouse', 'sibling', 'parent', 'grandchild', 'relative', 'friend', 'caregiver'];
      if (!validRelationships.includes(relationship)) {
        return res.status(400).json({
          success: false,
          message: "Mối quan hệ không hợp lệ"
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
          message: "Không tìm thấy thông tin người thân"
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

  
};

module.exports = RelationshipController;
