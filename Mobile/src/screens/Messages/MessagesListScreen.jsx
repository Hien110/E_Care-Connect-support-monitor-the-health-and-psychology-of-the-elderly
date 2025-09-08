import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const MessagesListScreen = () => {
  const navigation = useNavigation();
  const conversations = [
    {
      id: 1,
      name: 'Bà Nguyễn Thị Mai',
      subtitle: 'Bà ngoại',
      message: 'Cháu ơi, hôm nay bà cảm thấy hơi m...',
      time: '5 phút',
      avatar: 'N',
      avatarColor: '#FFE4E1',
    },
    {
      id: 2,
      name: 'Anh Lê Văn Hùng',
      subtitle: 'Anh trai',
      message: 'Cảm ơn em đã quan tâm đến ba',
      time: '2 giờ',
      avatar: 'L',
      avatarColor: '#E6E6FA',
    },
    {
      id: 3,
      name: 'Cô Lê Thị Hoa',
      subtitle: 'Cô ruột',
      message: 'Con có thể qua thăm cô không?',
      time: '3 ngày',
      avatar: 'L',
      avatarColor: '#FFE4E1',
    },
    {
      id: 4,
      name: 'BS. Trần Minh Đức',
      subtitle: '',
      message: 'Kết quả xét nghiệm đã có, mời thứ de...',
      time: '1 giờ',
      avatar: 'T',
      avatarColor: '#E0F6FF',
    },
    {
      id: 5,
      name: 'Ông Phạm Minh Tuấn',
      subtitle: 'Ông nội',
      message: 'Hẹn gặp cháu vào cuối tuần nhé',
      time: '1 ngày',
      avatar: 'P',
      avatarColor: '#E8F5E8',
    },
    {
      id: 6,
      name: 'Ông Phạm Minh Tuấn',
      subtitle: 'Ông nội',
      message: 'Hẹn gặp cháu vào cuối tuần nhé',
      time: '1 ngày',
      avatar: 'P',
      avatarColor: '#E8F5E8',
    },
  ];

  const ConversationItem = ({ item }) => (
    <TouchableOpacity style={styles.conversationItem}>
      <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{item.name}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        </View>
        <Text style={styles.message} numberOfLines={1}>
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
      <ScrollView style={styles.conversationsList}>
        {conversations.map((item) => (
          <ConversationItem key={item.id} item={item} />
        ))}
      </ScrollView>
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
});

export default MessagesListScreen;