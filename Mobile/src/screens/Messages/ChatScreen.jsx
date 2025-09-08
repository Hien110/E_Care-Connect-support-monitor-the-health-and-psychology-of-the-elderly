import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView } from "react-native"

const ChatScreen = () => {
  const [message, setMessage] = useState("")

  const messages = [
    {
      id: 1,
      type: "system",
      text: "Cuộc trò chuyện đã được mã hóa đầu cuối để bảo vệ quyền riêng tư",
    },
    {
      id: 2,
      type: "received",
      text: "Chào cháu! Hôm nay bà cảm thấy hơi mệt và có chút đau đầu",
      time: "10:15",
      sender: "B",
    },
    {
      id: 3,
      type: "sent",
      text: "Bà có uống thuốc dùng giờ không ạ? Con sẽ qua thăm bà chiều nay",
      time: "10:16",
    },
    {
      id: 4,
      type: "received",
      text: "Bà đã uống rồi cháu à. Cảm ơn con quan tâm",
      time: "10:18",
      sender: "B",
    },
    {
      id: 5,
      type: "sent",
      text: "Vậy bà nên nghỉ ngơi thêm. Nếu có gì bất thường thì gọi con ngay nhé",
      time: "10:20",
    },
  ]

  const renderMessage = (msg) => {
    if (msg.type === "system") {
      return (
        <View key={msg.id} style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{msg.text}</Text>
        </View>
      )
    }

    return (
      <View
        key={msg.id}
        style={[styles.messageContainer, msg.type === "sent" ? styles.sentContainer : styles.receivedContainer]}
      >
        {msg.type === "received" && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{msg.sender}</Text>
          </View>
        )}
        <View style={[styles.messageBubble, msg.type === "sent" ? styles.sentBubble : styles.receivedBubble]}>
          <Text style={[styles.messageText, msg.type === "sent" ? styles.sentText : styles.receivedText]}>
            {msg.text}
          </Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{msg.time}</Text>
          {msg.type === "sent" && <Text style={styles.readReceipt}>✓✓</Text>}
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>N</Text>
        </View>

        <Text style={styles.headerTitle}>Nguyễn Thị Lan</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📹</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📞</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachButton}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
          />

          <TouchableOpacity style={styles.emojiButton}>
            <Text style={styles.emojiIcon}>😊</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sendButton}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: "#E3F2FD" }]}>
              <Text style={styles.quickActionEmoji}>📷</Text>
            </View>
            <Text style={styles.quickActionText}>Ảnh</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: "#E8F5E8" }]}>
              <Text style={styles.quickActionEmoji}>🎤</Text>
            </View>
            <Text style={styles.quickActionText}>Ghi âm</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: "#FFF3E0" }]}>
              <Text style={styles.quickActionEmoji}>📍</Text>
            </View>
            <Text style={styles.quickActionText}>Vị trí</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 12,
  },
  backArrow: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE0B2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileAvatarText: {
    color: "#FF8A65",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerTitle: {
    flex: 1,
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
  },
  actionButton: {
    marginLeft: 16,
  },
  actionIcon: {
    color: "white",
    fontSize: 20,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  systemMessage: {
    alignItems: "center",
    marginVertical: 16,
  },
  systemMessageText: {
    backgroundColor: "#E0E0E0",
    color: "#666",
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    textAlign: "center",
    maxWidth: "80%",
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "flex-end",
  },
  sentContainer: {
    justifyContent: "flex-end",
  },
  receivedContainer: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFCDD2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    color: "#E57373",
    fontSize: 14,
    fontWeight: "bold",
  },
  messageBubble: {
    maxWidth: "70%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  sentBubble: {
    backgroundColor: "#2196F3",
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentText: {
    color: "white",
  },
  receivedText: {
    color: "#333",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    marginBottom: 2,
  },
  timeText: {
    fontSize: 11,
    color: "#999",
  },
  readReceipt: {
    fontSize: 11,
    color: "#2196F3",
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  attachIcon: {
    fontSize: 20,
    color: "#666",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  emojiButton: {
    padding: 8,
    marginRight: 8,
  },
  emojiIcon: {
    fontSize: 20,
  },
  sendButton: {
    backgroundColor: "#2196F3",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendIcon: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  quickAction: {
    alignItems: "center",
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  quickActionEmoji: {
    fontSize: 20,
  },
  quickActionText: {
    fontSize: 12,
    color: "#666",
  },
})

export default ChatScreen
