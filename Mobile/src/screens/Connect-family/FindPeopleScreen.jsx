import { useState, useEffect, useCallback, memo } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar, Modal, Image, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { userService } from '../../services/userService';
import { relationshipService } from '../../services/relationshipService';

const relationships = ['Con cái', 'Vợ/Chồng', 'Anh/Chị/Em', 'Bố/Mẹ', 'Cháu', 'Người thân', 'Bạn bè', 'Người chăm sóc'];

// Memoized Relationship Option Component
const RelationshipOption = memo(({ relationship, isSelected, onPress }) => (
  <TouchableOpacity
    style={styles.relationshipOption}
    onPress={() => onPress(relationship)}
    activeOpacity={0.7}
  >
    <View style={styles.radioContainer}>
      <View
        style={[
          styles.radioOuter,
          isSelected && styles.radioOuterSelected,
        ]}
      >
        <View
          style={[
            styles.radioInner,
            { opacity: isSelected ? 1 : 0 }
          ]}
        />
      </View>
    </View>
    <Text style={styles.relationshipText}>{relationship}</Text>
  </TouchableOpacity>
));

const ConfirmConnectionModal = ({ selectedUser, showConfirmModal, setShowConfirmModal, selectedRelationship, handleRelationshipChange, handleConfirmConnection, handleCancelConnection }) => (
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
          <View style={styles.largeAvatar}>
            {selectedUser?.avatar && selectedUser.avatar.startsWith('http') ? (
              <Image
                source={{ uri: selectedUser.avatar }}
                style={styles.largeAvatarImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.largeAvatarPlaceholder, { backgroundColor: "#FFB6C1" }]}>
                <Text style={styles.largeAvatarText}>
                  {selectedUser?.avatar || selectedUser?.name?.charAt(0).toUpperCase() || "N"}
                </Text>
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
          <ScrollView
            style={styles.relationshipOptions}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            {relationships.map((relationship) => (
              <RelationshipOption
                key={relationship}
                relationship={relationship}
                isSelected={selectedRelationship === relationship}
                onPress={handleRelationshipChange}
              />
            ))}
          </ScrollView>
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

const ConnectionSuccessModal = ({ showSuccessModal, selectedUser, selectedRelationship, handleCloseSuccess }) => (
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

const FindPeopleScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState("Con cái");
  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const relationships = ['Con cái', 'Vợ/Chồng', 'Anh/Chị/Em', 'Bố/Mẹ', 'Cháu', 'Người thân', 'Bạn bè', 'Người chăm sóc'];

  const relationshipMapping = {
    'Con cái': 'child',
    'Vợ/Chồng': 'spouse',
    'Anh/Chị/Em': 'sibling',
    'Bố/Mẹ': 'parent',
    'Cháu': 'grandchild',
    'Người thân': 'relative',
    'Bạn bè': 'friend',
    'Người chăm sóc': 'caregiver'
  };

  // Gọi API lấy danh sách người già khi component mount
  useEffect(() => {
    const fetchElderlyUsers = async () => {
      try {
        setLoading(true);
        const result = await userService.getAllElderly();
        if (result.success) {
          const transformedUsers = result.data.map((user, index) => ({
            id: user._id,
            name: user.fullName,
            age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 65,
            location: user.address || "Chưa cập nhật",
            avatar: user.avatar,
          }));
          setUsers(transformedUsers);
          setOriginalUsers(transformedUsers);
        } else {
          console.error('Lỗi khi lấy danh sách người già:', result.message);
        }
      } catch (error) {
        console.error('Lỗi khi gọi API:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchElderlyUsers();
  }, []);

  // Tìm kiếm realtime
  useEffect(() => {
    if (searchText.trim() === '') {
      setUsers([]);
    } else {
      const filteredUsers = originalUsers.filter(user =>
        user.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setUsers(filteredUsers);
    }
  }, [searchText, originalUsers]);

  const handleConnect = useCallback((user) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  }, []);

  const handleRelationshipChange = useCallback((relationship) => {
    setSelectedRelationship(relationship);
  }, []);

  const handleConfirmConnection = useCallback(async () => {
    if (!selectedUser || !selectedRelationship) {
      Alert.alert('Lỗi', 'Vui lòng chọn mối quan hệ');
      return;
    }

    try {
      const englishRelationship = relationshipMapping[selectedRelationship];
      const result = await relationshipService.createRelationship({
        elderlyId: selectedUser.id,
        relationship: englishRelationship
      });

      if (result.success) {
        setShowConfirmModal(false);
        setShowSuccessModal(true);
      } else {
        Alert.alert('Lỗi', result.message);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi yêu cầu kết nối');
      console.error('Create relationship error:', error);
    }
  }, [selectedUser, selectedRelationship]);

  const handleCancelConnection = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  const handleCloseSuccess = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  const renderUserItem = (user) => (
    <View key={user.id} style={styles.userItem}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          {user.avatar && user.avatar.startsWith('http') ? (
            <Image
              source={{ uri: user.avatar }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: "#FFB6C1" }]}>
              <Text style={styles.avatarText}>
                {user.avatar || user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userLocation}>
            {user.age} tuổi • {user.location}
          </Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
            placeholder="Tìm kiếm theo tên..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchText('')}
            >
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          {searchText.trim() ? `Kết quả tìm kiếm "${searchText}"` : 'Tìm kiếm người thân'}
        </Text>
        <Text style={styles.resultsCount}>
          {loading ? "Đang tải..." : searchText.trim() ? `${users.length} người` : ''}
        </Text>
      </View>

      {/* User List */}
      <ScrollView style={styles.userList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang tải danh sách người già...</Text>
          </View>
        ) : !searchText.trim() ? (
          <View style={styles.emptyContainer}>
            <Icon name="search" size={48} color="#ccc" style={styles.searchIconLarge} />
            <Text style={styles.emptyText}>Nhập tên để tìm kiếm người thân</Text>
            <Text style={styles.emptySubtext}>Bắt đầu nhập tên người bạn muốn tìm</Text>
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="search" size={48} color="#ccc" style={styles.searchIconLarge} />
            <Text style={styles.emptyText}>
              Không tìm thấy người nào với tên "{searchText}"
            </Text>
            <Text style={styles.emptySubtext}>Thử tìm với tên khác</Text>
          </View>
        ) : (
          users.map(renderUserItem)
        )}
      </ScrollView>

      {/* Confirm Connection Modal */}
      <ConfirmConnectionModal
        selectedUser={selectedUser}
        showConfirmModal={showConfirmModal}
        setShowConfirmModal={setShowConfirmModal}
        selectedRelationship={selectedRelationship}
        handleRelationshipChange={handleRelationshipChange}
        handleConfirmConnection={handleConfirmConnection}
        handleCancelConnection={handleCancelConnection}
      />

      {/* Success Connection Modal */}
      <ConnectionSuccessModal
        showSuccessModal={showSuccessModal}
        selectedUser={selectedUser}
        selectedRelationship={selectedRelationship}
        handleCloseSuccess={handleCloseSuccess}
      />
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
  clearButton: {
    marginLeft: 8,
    padding: 4,
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
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
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
    minHeight: 500,
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
    overflow: "hidden",
  },
  largeAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  largeAvatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  largeAvatarText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#333",
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
    maxHeight: 200,
  },
  relationshipOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },
  radioContainer: {
    marginRight: 12,
    width: 20,
    height: 20,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
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
    position: "absolute",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  searchIconLarge: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
  },
});

export default FindPeopleScreen;