import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar, Modal } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const FindPeopleScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState("Ông/Bà");

  const users = [
    {
      id: 1,
      name: "Nguyễn Thị Mai",
      age: 68,
      location: "Quận 1, TP.HCM",
      status: "Tốt",
      statusColor: "#4CAF50",
      lastSeen: "2 giờ trước",
      avatar: "N",
      avatarBg: "#FFB6C1",
      verified: true,
    },
    {
      id: 2,
      name: "Trần Văn Hùng",
      age: 72,
      location: "Quận 3, TP.HCM",
      status: "Bình thường",
      statusColor: "#FF9800",
      lastSeen: "1 ngày trước",
      avatar: "T",
      avatarBg: "#ADD8E6",
      verified: true,
    },
    {
      id: 3,
      name: "Lê Thị Hoa",
      age: 75,
      location: "Quận 7, TP.HCM",
      status: "Cần chú ý",
      statusColor: "#F44336",
      lastSeen: "3 giờ trước",
      avatar: "L",
      avatarBg: "#DDA0DD",
      verified: false,
    },
    {
      id: 4,
      name: "Phạm Minh Tuấn",
      age: 70,
      location: "Quận 10, TP.HCM",
      status: "Tốt",
      statusColor: "#4CAF50",
      lastSeen: "5 giờ trước",
      avatar: "P",
      avatarBg: "#90EE90",
      verified: true,
    },
  ];

  const relationships = ["Ông/Bà", "Bố/Mẹ", "Chú/Cô/Dì/Bác", "Người thân khác"];

  const handleConnect = (user) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  };

  const handleConfirmConnection = () => {
    // Xử lý logic xác nhận kết nối ở đây
    console.log(`Kết nối với ${selectedUser.name} với mối quan hệ: ${selectedRelationship}`);
    setShowConfirmModal(false);
    setShowSuccessModal(true);
  };

  const handleCancelConnection = () => {
    setShowConfirmModal(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
  };

  const renderUserItem = (user) => (
    <View key={user.id} style={styles.userItem}>
      <View style={styles.userInfo}>
        <View style={[styles.avatar, { backgroundColor: user.avatarBg }]}>
          <Text style={styles.avatarText}>{user.avatar}</Text>
          {user.verified && (
            <View style={styles.verifiedBadgeSmall}>
              <Icon name="checkmark-circle" size={16} color="#2196F3" />
            </View>
          )}
        </View>

        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userLocation}>
            {user.age} tuổi • {user.location}
          </Text>

          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: user.statusColor }]} />
            <Text style={[styles.statusText, { color: user.statusColor }]}>{user.status}</Text>
            <Icon name="time-outline" size={14} color="#999" style={styles.timeIcon} />
            <Text style={styles.timeText}>{user.lastSeen}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.connectButton}
        onPress={() => handleConnect(user)}
      >
        <Text style={styles.connectButtonText}>Kết nối</Text>
      </TouchableOpacity>
    </View>
  );

  const ConfirmConnectionModal = () => (
    <Modal
      visible={showConfirmModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowConfirmModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={[styles.largeAvatar, { backgroundColor: selectedUser?.avatarBg || "#FFB6C1" }]}>
              <Text style={styles.largeAvatarText}>{selectedUser?.avatar || "N"}</Text>
              {selectedUser?.verified && (
                <View style={styles.verificationBadge}>
                  <Icon name="checkmark" size={12} color="white" />
                </View>
              )}
            </View>
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>Xác nhận kết nối</Text>

          {/* Subtitle */}
          <Text style={styles.modalSubtitle}>Bạn muốn kết nối với</Text>

          {/* User Info */}
          <View style={styles.userInfoSection}>
            <Text style={styles.userNameModal}>{selectedUser?.name || "Nguyễn Thị Mai"}</Text>
            <Text style={styles.userDetailsModal}>
              {selectedUser?.age || 68} tuổi • {selectedUser?.location || "Quận 1, TP.HCM"}
            </Text>
          </View>

          {/* Relationship Selection */}
          <View style={styles.relationshipSection}>
            <Text style={styles.relationshipTitle}>Mối quan hệ với bạn:</Text>
            <View style={styles.relationshipOptions}>
              {relationships.map((relationship) => (
                <TouchableOpacity
                  key={relationship}
                  style={styles.relationshipOption}
                  onPress={() => setSelectedRelationship(relationship)}
                >
                  <View style={styles.radioContainer}>
                    <View
                      style={[
                        styles.radioOuter,
                        selectedRelationship === relationship && styles.radioOuterSelected,
                      ]}
                    >
                      {selectedRelationship === relationship && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </View>
                  <Text style={styles.relationshipText}>{relationship}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmConnection}
            >
              <Text style={styles.confirmButtonText}>Xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelConnection}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const ConnectionSuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCloseSuccess}
    >
      <View style={styles.modalContainer}>
        <View style={styles.successModalContent}>
          {/* Success Icon */}
          <View style={styles.successIcon}>
            <Icon name="checkmark" size={40} color="white" />
          </View>

          {/* Title */}
          <Text style={styles.successTitle}>Đã xác nhận kết nối</Text>

          {/* Subtitle */}
          <Text style={styles.successSubtitle}>Yêu cầu kết nối với</Text>

          {/* User Info */}
          <View style={styles.successUserInfo}>
            <Text style={styles.successUserName}>{selectedUser?.name || "Nguyễn Thị Mai"}</Text>
            <Text style={styles.successUserRelationship}>({selectedRelationship})</Text>
          </View>

          {/* Pending Approval Notice */}
          <View style={styles.pendingNotice}>
            <View style={styles.pendingNoticeHeader}>
              <View style={styles.noticeIcon}>
                <Icon name="information-circle" size={16} color="white" />
              </View>
              <Text style={styles.noticeTitle}>Chờ duyệt yêu cầu</Text>
            </View>
            <Text style={styles.noticeText}>
              Yêu cầu kết nối đã được gửi. Bạn sẽ nhận được thông báo khi yêu cầu được duyệt.
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseSuccess}
          >
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm kiếm người thân</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên hoặc địa chỉ..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Kết quả tìm kiếm</Text>
        <Text style={styles.resultsCount}>{users.length} người</Text>
      </View>

      {/* User List */}
      <ScrollView style={styles.userList} showsVerticalScrollIndicator={false}>
        {users.map(renderUserItem)}
      </ScrollView>

      {/* Confirm Connection Modal */}
      <ConfirmConnectionModal />

      {/* Success Connection Modal */}
      <ConnectionSuccessModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2196F3",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  searchContainer: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    backgroundColor: "white",
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  resultsCount: {
    fontSize: 14,
    color: "#666",
  },
  userList: {
    flex: 1,
    backgroundColor: "white",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  verifiedBadgeSmall: {
    position: "absolute",
    bottom: -2,
    right: -2,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginRight: 12,
  },
  timeIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  connectButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  connectButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  successModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  largeAvatarText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#333",
  },
  verificationBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  modalSubtitle: {
    color: "#666",
    marginBottom: 8,
  },
  userInfoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  userNameModal: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  userDetailsModal: {
    color: "#666",
    fontSize: 14,
  },
  relationshipSection: {
    width: "100%",
    marginBottom: 24,
  },
  relationshipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  relationshipOptions: {
    width: "100%",
  },
  relationshipOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  radioContainer: {
    marginRight: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: "#2196F3",
    backgroundColor: "#2196F3",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
  relationshipText: {
    fontSize: 16,
    color: "#333",
  },
  actionButtons: {
    width: "100%",
  },
  confirmButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  // Success Modal styles
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  successSubtitle: {
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  successUserInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  successUserName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  successUserRelationship: {
    color: "#666",
    fontSize: 14,
  },
  pendingNotice: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  pendingNoticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  noticeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF9800",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  noticeText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FindPeopleScreen;