import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

const FamilyConnectionScreen = () => {
  const friendRequests = [
    {
      id: 1,
      name: "Trần Thu Hằng",
      relationship: "Con gái",
      phone: "0907654321",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      isOnline: true,
    },
    {
      id: 2,
      name: "Trần Thu Phương",
      relationship: "Chú gái",
      phone: "0907687421",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      isOnline: true,
    },
  ]

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
  ]

  const handleAccept = (id) => {
    console.log("Accept request:", id)
  }

  const handleDecline = (id) => {
    console.log("Decline request:", id)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Kết nối gia đình</Text>
          <Text style={styles.headerSubtitle}>Yêu cầu kết nối</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>2</Text>
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
              <Text style={styles.requestBadgeText}>2 yêu cầu</Text>
            </View>
          </View>

          {friendRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: request.avatar }} style={styles.avatar} />
                  {request.isOnline && <View style={styles.onlineIndicator} />}
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{request.name}</Text>
                  <View style={styles.userMeta}>
                    <View style={styles.relationshipTag}>
                      <Icon name="verified" size={16} color="#3B82F6" />
                      <Text style={styles.relationshipText}>{request.relationship}</Text>
                    </View>
                    <View style={styles.phoneContainer}>
                      <Icon name="phone" size={16} color="#10B981" />
                      <Text style={styles.phoneText}>{request.phone}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.declineButton} onPress={() => handleDecline(request.id)}>
                  <Icon name="close" size={16} color="#6B7280" />
                  <Text style={styles.declineButtonText}>Từ chối</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(request.id)}>
                  <Icon name="check" size={16} color="white" />
                  <Text style={styles.acceptButtonText}>Chấp nhận</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
    </SafeAreaView>
  )
}

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
})

export default FamilyConnectionScreen
