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
  RefreshControl
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { conversationService } from '../../services/conversationService';
import { userService } from '../../services/userService';
import socketService from '../../services/socketService';
import { formatTime, formatMessagePreview } from '../../utils/timeFormat';

const MessagesListScreen = () => {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchConversations();
    initializeSocket();
  }, []);

  const initializeSocket = async () => {
    try {
      await socketService.connect();
      
      // Listen for new messages to update conversation list
      socketService.on('new_message', handleNewMessage);
      socketService.on('conversation_updated', handleConversationUpdated);
      
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  };

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
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchContainer: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 20,
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
    marginBottom: 4,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MessagesListScreen;