const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../../app/models/User');

class SocketConfig {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // Map để lưu userId -> socketId
  }

  init(server) {
    this.io = new Server(server, {
      cors: {
        origin: ["http://localhost:3000", "http://192.168.0.109:3000"], // Frontend URLs
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Middleware xác thực
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        console.log('🔑 Socket auth attempt:', {
          hasToken: !!token,
          tokenLength: token ? token.length : 0,
          authHeader: socket.handshake.headers.authorization,
          auth: socket.handshake.auth
        });
        
        if (!token) {
          console.error('❌ No token provided in socket handshake');
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || 'secret');
        console.log('✅ Token decoded successfully:', { userId: decoded.userId, phoneNumber: decoded.phoneNumber });
        
        const user = await User.findById(decoded.userId);
        
        if (!user) {
          console.error('❌ User not found:', decoded.userId);
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        console.log('✅ Socket authentication successful:', { userId: socket.userId, userName: user.fullName });
        next();
      } catch (error) {
        console.error('❌ Socket authentication error:', error.message);
        next(new Error('Authentication failed: ' + error.message));
      }
    });

    this.setupEventHandlers();

    console.log('🚀 Socket.IO server initialized');
    return this.io;
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`👤 User connected: ${socket.user.fullName} (${socket.userId})`);
      
      // Lưu thông tin user đã kết nối
      this.connectedUsers.set(socket.userId, socket.id);

      // Tham gia các conversation rooms
      this.joinUserConversations(socket);

      // Event handlers
      this.handleMessageEvents(socket);
      this.handleConversationEvents(socket);
      this.handleTypingEvents(socket);
      this.handleDisconnect(socket);
    });
  }

  async joinUserConversations(socket) {
    try {
      const Conversation = require('../../app/models/Conversation');
      const conversations = await Conversation.find({
        'participants.user': socket.userId
      });

      conversations.forEach(conversation => {
        socket.join(`conversation_${conversation._id}`);
      });

      console.log(`📱 User ${socket.userId} joined ${conversations.length} conversation rooms`);
    } catch (error) {
      console.error('Error joining conversations:', error);
    }
  }

  handleMessageEvents(socket) {
    // Gửi tin nhắn
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, messageType, content } = data;
        
        // Validate data
        if (!conversationId || !content) {
          socket.emit('message_error', { error: 'Missing required fields' });
          return;
        }

        // Tạo tin nhắn mới
        const Message = require('../../app/models/Message');
        const Conversation = require('../../app/models/Conversation');

        // Kiểm tra user có quyền gửi tin nhắn trong conversation này không
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.some(p => p.user.toString() === socket.userId)) {
          socket.emit('message_error', { error: 'Unauthorized' });
          return;
        }

        // Chuẩn bị content
        let messageContent = {};
        if (messageType === 'text' || !messageType) {
          messageContent = { text: content };
        } else if (messageType === 'image') {
          messageContent = { fileUrl: content };
        } else if (messageType === 'file') {
          messageContent = { 
            fileUrl: content.fileUrl || content,
            fileName: content.fileName,
            fileSize: content.fileSize,
            mimeType: content.mimeType
          };
        } else {
          messageContent = { text: content };
        }

        // Tạo tin nhắn
        const newMessage = new Message({
          conversation: conversationId,
          sender: socket.userId,
          messageType: messageType || 'text',
          content: messageContent,
        });

        await newMessage.save();

        // Populate thông tin sender
        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', 'fullName avatar')
          .populate('conversation', 'participants');

        // Gửi tin nhắn đến tất cả members trong conversation
        this.io.to(`conversation_${conversationId}`).emit('new_message', {
          message: populatedMessage,
          conversationId
        });

        console.log(`💬 Message sent in conversation ${conversationId} by ${socket.user.fullName}`);

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message_error', { error: error.message });
      }
    });

    // Đánh dấu tin nhắn đã đọc
    socket.on('mark_messages_read', async (data) => {
      try {
        const { conversationId, messageIds } = data;
        
        const Message = require('../../app/models/Message');
        
        // Cập nhật trạng thái đã đọc
        await Message.updateMany(
          { 
            _id: { $in: messageIds },
            conversation: conversationId,
            sender: { $ne: socket.userId } // Không đánh dấu tin nhắn của chính mình
          },
          {
            $addToSet: {
              readBy: {
                user: socket.userId,
                readAt: new Date()
              }
            }
          }
        );

        // Thông báo đến các user khác trong conversation
        socket.to(`conversation_${conversationId}`).emit('messages_read', {
          conversationId,
          messageIds,
          readBy: socket.userId
        });

        console.log(`📖 Messages marked as read in conversation ${conversationId} by ${socket.user.fullName}`);

      } catch (error) {
        console.error('Mark messages read error:', error);
        socket.emit('message_error', { error: error.message });
      }
    });
  }

  handleConversationEvents(socket) {
    // Tham gia conversation mới
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`📱 User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Rời khỏi conversation
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`📱 User ${socket.userId} left conversation ${conversationId}`);
    });
  }

  handleTypingEvents(socket) {
    // Bắt đầu typing
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.fullName,
        conversationId
      });
    });

    // Kết thúc typing
    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
        userId: socket.userId,
        conversationId
      });
    });
  }

  handleDisconnect(socket) {
    socket.on('disconnect', () => {
      this.connectedUsers.delete(socket.userId);
      console.log(`👋 User disconnected: ${socket.user.fullName} (${socket.userId})`);
    });
  }

  // Utility methods
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  getUserSocketId(userId) {
    return this.connectedUsers.get(userId);
  }

  emitToUser(userId, event, data) {
    const socketId = this.getUserSocketId(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  emitToConversation(conversationId, event, data) {
    this.io.to(`conversation_${conversationId}`).emit(event, data);
  }

  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  getConnectedUsersList() {
    return Array.from(this.connectedUsers.keys());
  }
}

module.exports = new SocketConfig();
