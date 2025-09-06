import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, StatusBar, SafeAreaView, Modal } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { relationshipService } from "../../services/relationshipService";


const FamilyConnectionListScreen = () => {
    const navigation = useNavigation();
    const [connectedMembers, setConnectedMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [notificationModalVisible, setNotificationModalVisible] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");

    useEffect(() => {
        const fetchConnectedMembers = async () => {
            try {
                setLoading(true);
                const result = await relationshipService.getAcceptedRelationships();
                if (result.success) {
                    // Transform API data to match component structure
                    const transformedData = result.data.map((relationship, index) => ({
                        id: relationship._id,
                        name: relationship.requestedBy?.fullName || 'Unknown',
                        relationship: getRelationshipLabel(relationship.relationship),
                        phone: relationship.elderly?.phoneNumber || 'N/A',
                        avatar: relationship.requestedBy?.avatar || 'https://via.placeholder.com/100',
                        isAccepted: true,
                    }));
                    setConnectedMembers(transformedData);
                } else {
                    setError(result.message);
                }
            } catch (error) {
                setError('Không thể tải danh sách thành viên');
                console.error('Error fetching connected members:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConnectedMembers();
    }, []);

    const getRelationshipLabel = (relationship) => {
        const relationshipMap = {
            child: 'Con',
            spouse: 'Vợ/Chồng',
            sibling: 'Anh/Chị em',
            parent: 'Cha/Mẹ',
            grandchild: 'Cháu',
            relative: 'Họ hàng',
            friend: 'Bạn bè',
            caregiver: 'Người chăm sóc',
        };
        return relationshipMap[relationship] || relationship;
    };

    const handleBack = () => {
        // Handle back navigation
        console.log("Back pressed")
    }

    const handleCancelConnection = (member) => {
        setSelectedMember(member);
        setCancelModalVisible(true);
    }

    const handleConfirmCancel = async () => {
        try {
            const result = await relationshipService.cancelRelationship(selectedMember.id);
            if (result.success) {
                // Remove from connected members list
                setConnectedMembers(prev => prev.filter(member => member.id !== selectedMember.id));
                setNotificationMessage("Đã hủy kết nối thành công");
            } else {
                setNotificationMessage(`Lỗi: ${result.message}`);
            }
            setCancelModalVisible(false);
            setNotificationModalVisible(true);
        } catch (error) {
            setNotificationMessage("Có lỗi xảy ra khi hủy kết nối");
            setCancelModalVisible(false);
            setNotificationModalVisible(true);
        }
    }

    const handleCloseCancelModal = () => {
        setCancelModalVisible(false);
        setSelectedMember(null);
    }

    const handleCloseNotificationModal = () => {
        setNotificationModalVisible(false);
        setNotificationMessage("");
    }

    const renderMemberCard = (member) => (
        <View key={member.id} style={styles.memberCard}>
            <View style={styles.memberInfo}>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: member.avatar }} style={styles.avatar} />
                </View>

                <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRelationship}>
                        {member.relationship} • {member.phone}
                    </Text>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <View style={styles.acceptedBadge}>
                    <Text style={styles.acceptedText}>Đã chấp nhận</Text>
                </View>
                <TouchableOpacity style={styles.cancelButtonMain} onPress={() => handleCancelConnection(member)}>
                    <Text style={styles.cancelButtonText}>Hủy kết nối</Text>
                </TouchableOpacity>
            </View>
        </View>
    )

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#4F7EFF" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Kết nối gia đình</Text>
                    <Text style={styles.headerSubtitle}>Đã kết nối ({connectedMembers.length})</Text>
                </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Đang tải danh sách...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={() => {
                            setError(null);
                            setLoading(true);
                            // Re-fetch data
                            const fetchData = async () => {
                                try {
                                    const result = await relationshipService.getAcceptedRelationships();
                                    if (result.success) {
                                        const transformedData = result.data.map((relationship, index) => ({
                                            id: relationship._id,
                                            name: relationship.requestedBy?.fullName || 'Unknown',
                                            relationship: getRelationshipLabel(relationship.relationship),
                                            phone: relationship.elderly?.phoneNumber || 'N/A',
                                            avatar: relationship.requestedBy?.avatar || 'https://via.placeholder.com/100',
                                            isAccepted: true,
                                        }));
                                        setConnectedMembers(transformedData);
                                    } else {
                                        setError(result.message);
                                    }
                                } catch (error) {
                                    setError('Không thể tải danh sách thành viên');
                                } finally {
                                    setLoading(false);
                                }
                            };
                            fetchData();
                        }}>
                            <Text style={styles.retryButtonText}>Thử lại</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.sectionHeader}>
                            <View style={styles.userIcon}>
                                <Text style={styles.userIconText}>👥</Text>
                            </View>
                            <Text style={styles.sectionTitle}>Đã kết nối ({connectedMembers.length})</Text>
                        </View>

                        {connectedMembers.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Chưa có thành viên nào được kết nối</Text>
                            </View>
                        ) : (
                            <View style={styles.membersList}>{connectedMembers.map(renderMemberCard)}</View>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Modal Xác nhận hủy kết nối */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={cancelModalVisible}
                onRequestClose={handleCloseCancelModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Xác nhận hủy kết nối</Text>
                            <TouchableOpacity onPress={handleCloseCancelModal} style={styles.closeButton}>
                                <Icon name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            Bạn có chắc chắn muốn hủy kết nối với:
                        </Text>

                        <View style={styles.userInfoModal}>
                            <View style={styles.divider} />

                            <View style={styles.userDetailsModal}>
                                <View style={styles.avatarContainer}>
                                    <Image
                                        source={{ uri: selectedMember?.avatar || "https://via.placeholder.com/48" }}
                                        style={styles.avatar}
                                    />
                                </View>
                                <Text style={styles.userNameModal}>{selectedMember?.name || "Unknown"}</Text>
                                <View style={styles.userMetaModal}>
                                    <Text style={styles.relationshipModal}>
                                        {selectedMember?.relationship || ""}
                                    </Text>
                                </View>
                                <View style={styles.phoneModal}>
                                    <Icon name="phone" size={16} color="#10B981" />
                                    <Text style={styles.phoneTextModal}>{selectedMember?.phone || "N/A"}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCloseCancelModal}>
                                <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmCancel}>
                                <Text style={styles.confirmButtonText}>Hủy kết nối</Text>
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
                                    name={notificationMessage.includes("Lỗi") || notificationMessage.includes("lỗi") ? "error" : "check-circle"}
                                    size={48}
                                    color={notificationMessage.includes("Lỗi") || notificationMessage.includes("lỗi") ? "#EF4444" : "#10B981"}
                                />
                            </View>
                            <Text style={styles.notificationTitle}>
                                {notificationMessage.includes("Lỗi") || notificationMessage.includes("lỗi") ? "Lỗi" : "Thành công"}
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
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        backgroundColor: "#4F7EFF",
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
    backArrow: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "bold",
    },
    headerCenter: {
        flex: 1,
        alignItems: "center",
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    headerSubtitle: {
        color: "#FFFFFF",
        fontSize: 14,
        opacity: 0.9,
    },
    connectionCount: {
        backgroundColor: "#6B8EFF",
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    connectionCountText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    userIcon: {
        marginRight: 12,
    },
    userIconText: {
        fontSize: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333333",
    },
    membersList: {
        gap: 12,
    },
    memberCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: "#B8E6B8",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    memberInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarContainer: {
        position: "relative",
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    checkmarkIcon: {
        position: "absolute",
        bottom: -2,
        right: -2,
        backgroundColor: "#4CAF50",
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    checkmark: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "bold",
    },
    memberDetails: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333333",
        marginBottom: 4,
    },
    memberRelationship: {
        fontSize: 14,
        color: "#666666",
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    acceptedBadge: {
        backgroundColor: "#E8F5E8",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    acceptedText: {
        color: "#4CAF50",
        fontSize: 12,
        fontWeight: "600",
    },
    cancelButton: {
        backgroundColor: "#FF6B6B",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        borderWidth: 1,
        borderColor: "#FF5252",
    },
    cancelButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    cancelButtonMain: {
        backgroundColor: "#FF6B6B",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        borderWidth: 1,
        borderColor: "#FF5252",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 50,
    },
    loadingText: {
        fontSize: 16,
        color: "#666666",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 50,
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: "#E53E3E",
        textAlign: "center",
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: "#4F7EFF",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: "#666666",
        textAlign: "center",
    },
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
        backgroundColor: "#db2b2bff",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
    },
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
})

export default FamilyConnectionListScreen
