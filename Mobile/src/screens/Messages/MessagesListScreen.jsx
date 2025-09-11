import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  RefreshControl,
  Dimensions
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { conversationService } from '../../services/conversationService';
import { userService } from '../../services/userService';
import socketService from '../../services/socketService';
import { formatTime, formatMessagePreview } from '../../utils/timeFormat';

// Responsive helpers
const { width, height } = Dimensions.get('window');
const wp = (percent) => width * (parseFloat(percent) / 100);
const hp = (percent) => height * (parseFloat(percent) / 100);

const MessagesListScreen = () => {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchConversations();
    // Lắng nghe sự kiện socket, không connect lại socket ở đây
    socketService.on('new_message', handleNewMessage);
    socketService.on('conversation_updated', handleConversationUpdated);
    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('conversation_updated', handleConversationUpdated);
    };
  }, [handleNewMessage, handleConversationUpdated]);

  // Helper function để update conversation với latest message
  const updateConversationList = useCallback((conversationId, latestMessage) => {
    setConversations(prev => {
      const updatedConversations = prev.map(conv => {
        if (conv._id === conversationId) {
          return {
            ...conv,
            latestMessage: latestMessage
          };
        }
        return conv;
      });

      // Sắp xếp lại theo thời gian tin nhắn mới nhất
      return updatedConversations.sort((a, b) => {
        const timeA = a.latestMessage ? new Date(a.latestMessage.createdAt) : new Date(a.createdAt);
        const timeB = b.latestMessage ? new Date(b.latestMessage.createdAt) : new Date(b.createdAt);
        return timeB - timeA;
      });
    });
  }, []);

  const handleNewMessage = useCallback((data) => {
    console.log('� New message received in conversations list:', data);
    updateConversationList(data.conversationId, data.message);
  }, [updateConversationList]);

  const handleConversationUpdated = useCallback((data) => {
    console.log('💬 Conversation updated via direct event:', data);
    updateConversationList(data.conversationId, data.latestMessage);
  }, [updateConversationList]);

  // Cleanup socket listeners
  useEffect(() => {
    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('conversation_updated', handleConversationUpdated);
    };
  }, [handleNewMessage, handleConversationUpdated]);

  // Refresh conversations when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('📱 MessagesListScreen focused - refreshing conversations');
      fetchConversations();
    }, [])
  );

  const fetchConversations = async () => {
    try {
      const userResponse = await userService.getUser();
      if (!userResponse.success) {
        setError('Không thể lấy thông tin người dùng');
        return;
      }

      console.log('Current user:', userResponse.data);
      
      const userId = userResponse.data._id;
      setCurrentUser(userResponse.data);
      const response = await conversationService.getAllConversationsByUserId(userId);
      if (response.success) {
        const conversationsData = response.data.data || response.data;
        console.log('Conversations loaded:', conversationsData.length);
        setConversations(conversationsData);
        setError(null);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setError(null);
    fetchConversations();
  }, []);

  const ConversationItem = useCallback(({ item }) => {
    // Giả sử conversation giữa 2 người, lấy thông tin của người kia
    const otherParticipant = item.participants.find(p => p.user._id !== currentUser?._id);
    const name = otherParticipant ? otherParticipant.user.fullName : 'Unknown';
    const avatar = otherParticipant ? otherParticipant.user.avatar : '';
    const avatarLetter = name.charAt(0).toUpperCase();
  // Không tạo màu avatar dựa trên tên nữa
  const avatarColor = undefined;
    
    // Format tin nhắn mới nhất và thời gian
    const latestMessage = item.latestMessage;
    const messagePreview = formatMessagePreview(latestMessage, currentUser?._id);
    const timeText = formatTime(latestMessage?.createdAt);
    
    // Kiểm tra tin nhắn chưa đọc - chỉ với tin nhắn từ người khác
    const isUnread = latestMessage && 
                    latestMessage.sender?._id !== currentUser?._id && 
                    latestMessage.status !== 'read' &&
                    !latestMessage.readBy?.some(read => read.user === currentUser?._id);
    
    console.log('Conversation item:', {
      conversationId: item._id,
      latestMessage: latestMessage,
      messagePreview,
      isUnread,
      currentUserId: currentUser?._id,
      senderId: latestMessage?.sender?._id
    });
    
    return (
      <TouchableOpacity
        style={[styles.conversationItem, isUnread && styles.unreadItem]}
        onPress={() => navigation.navigate('Chat', { conversationId: item._id, otherParticipant: otherParticipant })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.avatar, avatarColor ? { backgroundColor: avatarColor } : null]}> 
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            )}
          </View>
          <View style={styles.conversationContent}>
            <View style={styles.conversationHeader}>
              <View style={styles.nameContainer}>
                <Text style={[styles.name, isUnread && styles.unreadName]}>{name}</Text>
              </View>
              <View style={styles.timeContainer}>
                <Text style={[styles.time, isUnread && styles.unreadTime]}>{timeText}</Text>
                {isUnread && <View style={styles.unreadDot} />}
              </View>
            </View>
            <Text style={[styles.message, isUnread && styles.unreadMessage]} numberOfLines={1}>
              {messagePreview || 'Cuộc trò chuyện mới'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [currentUser, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={24} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm cuộc trò chuyện..."
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Conversations List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lỗi: {error}</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.conversationsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2196F3']}
              tintColor="#2196F3"
            />
          }
        >
          {conversations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="message" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
              <Text style={styles.emptySubText}>Kéo xuống để làm mới</Text>
            </View>
          ) : (
            conversations.map((item) => (
              <ConversationItem key={item._id} item={item} />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp(0.2) },
    shadowOpacity: 0.1,
    shadowRadius: wp(1),
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: wp(4),
    padding: wp(2),
  },
  headerTitle: {
    color: 'white',
    fontSize: wp(4.5),
    fontWeight: '600',
    textAlign: 'center',
  },
  searchContainer: {
    backgroundColor: '#2196F3',
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: wp(6),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp(0.1) },
    shadowOpacity: 0.1,
    shadowRadius: wp(0.5),
  },
  searchIcon: {
    marginRight: wp(3),
    fontSize: wp(5),
  },
  searchInput: {
    flex: 1,
    fontSize: wp(4),
    color: '#333',
  },
  conversationsList: {
    flex: 1,
    backgroundColor: 'white',
  },
  conversationItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: wp(6),
  },
  avatarText: {
    fontSize: wp(5),
    fontWeight: '600',
    color: '#666',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(0.5),
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp(0.3),
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: wp(3),
    color: '#999',
    marginBottom: hp(0.3),
  },
  message: {
    fontSize: wp(3.5),
    color: '#666',
    lineHeight: hp(2.5),
  },
  // Styles cho tin nhắn chưa đọc
  unreadItem: {
    backgroundColor: '#f8f9ff',
  },
  unreadName: {
    fontWeight: '700',
    color: '#000',
  },
  unreadTime: {
    fontWeight: '600',
    color: '#2196F3',
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#333',
  },
  unreadDot: {
    width: wp(2.2),
    height: wp(2.2),
    borderRadius: wp(1.1),
    backgroundColor: '#2196F3',
    marginTop: hp(0.3),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(6),
  },
  loadingText: {
    marginTop: hp(1),
    fontSize: wp(4),
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  errorText: {
    fontSize: wp(4),
    color: 'red',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(8),
  },
  emptyText: {
    fontSize: wp(4),
    color: '#666',
    marginTop: hp(2),
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: wp(3.5),
    color: '#999',
    marginTop: hp(1),
    textAlign: 'center',
  },
});

export default MessagesListScreen;