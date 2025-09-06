import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Modal, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { relationshipService } from "../../services/relationshipService";

const FamilyConnectionScreen = () => {
  const navigation = useNavigation();
  const [friendRequests, setFriendRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null); // Xác định loại hành động
  const [notificationModalVisible, setNotificationModalVisible] = useState(false); // Thêm trạng thái cho modal thông báo
  const [notificationMessage, setNotificationMessage] = useState(""); // Tin nhắn thông báo

  useEffect(() => {
    const fetchData = async () => {
      const result = await relationshipService.getRequestRelationshipsById();
      console.log("API result:", result);
      if (result.success) {
        console.log("Friend requests data:", result.data);
        setFriendRequests(result.data);
      } else {
        console.log("API error:", result.message);
      }
    };
    fetchData();
  }, []);

  const privacyOptions = [
    {
      id: 1,
      title: "Dữ liệu được bảo mật",
      subtitle: "Thông tin sức khỏe của bạn được mã hóa và chỉ chia sẻ với người được chấp nhận",
      icon: "🔒",
      color: "#3B82F6",
    },
    {
      id: 2,
      title: "Kiểm soát quyền truy cập",
      subtitle: "Bạn có thể kiểm soát ai có thể xem dữ liệu sức khỏe kết nối với các ứng dụng",
      icon: "👁️",
      color: "#F59E0B",
    },
    {
      id: 3,
      title: "Thông báo minh bạch",
      subtitle: "Bạn sẽ được thông báo mỗi khi có ai đó yêu cầu truy cập thông tin của bạn",
      icon: "🔔",
      color: "#10B981",
    },
  ];

  const relationshipMap = {
    child: "con",
    spouse: "vợ/chồng",
    sibling: "anh chị em",
    parent: "cha mẹ",
    grandchild: "cháu",
    relative: "họ hàng",
    friend: "bạn bè",
    caregiver: "người chăm sóc",
  };

  const handleAccept = (request) => {
    console.log("Accept request:", request._id);
    setSelectedRequest(request);
    setActionType("accept");
    setModalVisible(true);
  };

  const handleDecline = (request) => {
    console.log("Decline request:", request._id);
    setSelectedRequest(request);
    setActionType("decline");
    setModalVisible(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (actionType === "accept") {
        const result = await relationshipService.acceptRelationship(selectedRequest._id);
        if (result.success) {
          setFriendRequests((prev) => prev.filter((req) => req._id !== selectedRequest._id));
          setNotificationMessage("Đã chấp nhận kết nối");
        } else {
          setNotificationMessage(`Lỗi: ${result.message}`);
        }
      } else if (actionType === "decline") {
        const result = await relationshipService.rejectRelationship(selectedRequest._id);
        if (result.success) {
          setFriendRequests((prev) => prev.filter((req) => req._id !== selectedRequest._id));
          setNotificationMessage("Đã từ chối kết nối");
        } else {
          setNotificationMessage(`Lỗi: ${result.message}`);
        }
      }
    } catch (error) {
      setNotificationMessage("Có lỗi xảy ra khi thực hiện hành động");
    }
    setModalVisible(false);
    setNotificationModalVisible(true); // Hiển thị modal thông báo
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleCloseNotificationModal = () => {
    setNotificationModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Kết nối gia đình</Text>
          <Text style={styles.headerSubtitle}>Yêu cầu kết nối</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Friend Requests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="person-add" size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Yêu cầu mới</Text>
            </View>
            <View style={styles.requestBadge}>
              <Text style={styles.requestBadgeText}>{friendRequests.length} yêu cầu</Text>
            </View>
          </View>

          {friendRequests.length === 0 ? (
            <Text style={styles.noRequestsText}>Không có yêu cầu kết nối nào.</Text>
          ) : (
            friendRequests.map((request) => (
              <View key={request._id} style={styles.requestCard}>
                <View style={styles.userInfo}>
                  <View style={styles.avatarContainer}>
                    <Image source={{ uri: request.requestedBy?.avatar || "https://via.placeholder.com/48" }} style={styles.avatar} />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{request.requestedBy?.fullName || "Unknown"}</Text>
                    <View style={styles.userMeta}>
                      <View style={styles.relationshipTag}>
                        <Icon name="verified" size={16} color="#3B82F6" />
                        <Text style={styles.relationshipText}>{relationshipMap[request.relationship] || request.relationship}</Text>
                      </View>
                      <View style={styles.phoneContainer}>
                        <Icon name="phone" size={16} color="#10B981" />
                        <Text style={styles.phoneText}>{request.elderly?.phoneNumber || "N/A"}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.declineButton} onPress={() => handleDecline(request)}>
                    <Icon name="close" size={16} color="#6B7280" />
                    <Text style={styles.declineButtonText}>Từ chối</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(request)}>
                    <Icon name="check" size={16} color="white" />
                    <Text style={styles.acceptButtonText}>Chấp nhận</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="security" size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Quyền riêng tư</Text>
            </View>
          </View>

          {privacyOptions.map((option) => (
            <View key={option.id} style={styles.privacyCard}>
              <View style={[styles.privacyIcon, { backgroundColor: `${option.color}15` }]}>
                <Text style={styles.privacyEmoji}>{option.icon}</Text>
              </View>
              <View style={styles.privacyContent}>
                <Text style={styles.privacyTitle}>{option.title}</Text>
                <Text style={styles.privacySubtitle}>{option.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal Xác nhận kết nối */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {actionType === "accept" ? "Xác nhận chấp nhận" : "Xác nhận từ chối"}
              </Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {actionType === "accept"
                ? "Bạn có chắc chắn muốn chấp nhận kết nối với:"
                : "Bạn có chắc chắn muốn từ chối kết nối với:"}
            </Text>

            <View style={styles.userInfoModal}>
              <View style={styles.divider} />

              <View style={styles.userDetailsModal}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{ uri: selectedRequest?.requestedBy?.avatar || "https://via.placeholder.com/48" }}
                    style={styles.avatar}
                  />
                </View>
                <Text style={styles.userNameModal}>{selectedRequest?.requestedBy?.fullName || "Unknown"}</Text>
                <View style={styles.userMetaModal}>
                  <Text style={styles.relationshipModal}>
                    {relationshipMap[selectedRequest?.relationship] || selectedRequest?.relationship}
                  </Text>
                </View>
                <View style={styles.phoneModal}>
                  <Icon name="phone" size={16} color="#10B981" />
                  <Text style={styles.phoneTextModal}>{selectedRequest?.elderly?.phoneNumber || "N/A"}</Text>
                </View>
              </View>

              <View style={styles.divider} />
            </View>

            {actionType === "accept" && (
              <View style={styles.permissionsContainer}>
                <Text style={styles.permissionsTitle}>Quyền truy cập sẽ được cấp:</Text>

                <View style={styles.permissionItem}>
                  <View style={styles.checkbox}>
                    <Icon name="check" size={16} color="#3B82F6" />
                  </View>
                  <Text style={styles.permissionText}>Xem chỉ số sức khỏe hàng ngày</Text>
                </View>

                <View style={styles.permissionItem}>
                  <View style={styles.checkbox}>
                    <Icon name="check" size={16} color="#3B82F6" />
                  </View>
                  <Text style={styles.permissionText}>Nhận thông báo về lịch uống thuốc</Text>
                </View>

                <View style={styles.permissionItem}>
                  <View style={styles.checkbox}>
                    <Icon name="check" size={16} color="#3B82F6" />
                  </View>
                  <Text style={styles.permissionText}>Theo dõi tình trạng cảm xúc</Text>
                </View>

                <View style={styles.permissionItem}>
                  <View style={styles.checkbox}>
                    <Icon name="check" size={16} color="#3B82F6" />
                  </View>
                  <Text style={styles.permissionText}>Nhận cảnh báo khẩn cấp</Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
                <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmAction}>
                <Text style={styles.confirmButtonText}>
                  {actionType === "accept" ? "Chấp nhận" : "Từ chối"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Thông báo */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={notificationModalVisible}
        onRequestClose={handleCloseNotificationModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notificationModalContainer}>
            <View style={styles.notificationHeader}>
              <View style={styles.notificationIconContainer}>
                <Icon 
                  name={notificationMessage.includes("Lỗi") ? "error" : "check-circle"} 
                  size={48} 
                  color={notificationMessage.includes("Lỗi") ? "#EF4444" : "#10B981"} 
                />
              </View>
              <Text style={styles.notificationTitle}>
                {notificationMessage.includes("Lỗi") ? "Lỗi" : "Thành công"}
              </Text>
              <TouchableOpacity onPress={handleCloseNotificationModal} style={styles.closeButton}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.notificationMessage}>{notificationMessage}</Text>
            <TouchableOpacity style={styles.okButton} onPress={handleCloseNotificationModal}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#3B82F6",
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
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  requestBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requestBadgeText: {
    fontSize: 12,
    color: "#D97706",
    fontWeight: "500",
  },
  requestCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    backgroundColor: "#10B981",
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "white",
  },
  userDetails: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  relationshipTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF4FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  relationshipText: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "500",
    marginLeft: 4,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  declineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 8,
  },
  declineButtonText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginLeft: 4,
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
  },
  acceptButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
    marginLeft: 4,
  },
  privacyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  privacyEmoji: {
    fontSize: 20,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  privacySubtitle: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  noRequestsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
    marginTop: 20,
  },
  // Styles for modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  userInfoModal: {
    marginVertical: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  userDetailsModal: {
    paddingVertical: 8,
    alignItems: "center",
  },
  userNameModal: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 4,
  },
  userMetaModal: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  relationshipModal: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  genderModal: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  phoneModal: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  phoneTextModal: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  permissionsContainer: {
    marginVertical: 16,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  permissionText: {
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  // Styles for notification modal
  notificationModalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
  },
  notificationHeader: {
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
    position: "relative",
  },
  notificationIconContainer: {
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
  },
  notificationMessage: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
  },
  okButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  okButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default FamilyConnectionScreen;