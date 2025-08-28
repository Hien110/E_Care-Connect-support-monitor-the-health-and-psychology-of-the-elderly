import { api } from './api';

export const userService = {
  // Đăng ký user
  register: async (userData) => {
    try {
      const response = await api.post('/users/registerUser', userData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message || error.message
      };
    }
  },

  // Đăng nhập
  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy thông tin user
  getProfile: async (userId) => {
    try {
      const response = await api.get(`/users/profile/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật thông tin user
  updateProfile: async (userId, userData) => {
    try {
      const response = await api.put(`/users/profile/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đổi mật khẩu
  changePassword: async (userId, passwordData) => {
    try {
      const response = await api.put(`/users/change-password/${userId}`, passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
    // B1: Gửi OTP
  sendOTP: async ({ phoneNumber, role }) => {
    try {
      const response = await api.post('/users/send-otp', { phoneNumber, role });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message || error.message
      };
    }
  },

  // B2: Xác thực OTP
  verifyOTP: async ({ phoneNumber, otp }) => {
    try {
      const response = await api.post('/users/verify-otp', { phoneNumber, otp });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message || error.message
      };
    }
  },

  // B3: Nhập CCCD
  setIdentity: async ({ phoneNumber, identityCard }) => {
    try {
      const response = await api.put('/users/set-identity', { phoneNumber, identityCard });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message || error.message
      };
    }
  },

  // B4: Hoàn tất hồ sơ
completeProfile: async ({ fullName, dateOfBirth, gender, password }) => {
  try {
    const response = await api.put("/users/complete-profile", {
      fullName,
      dateOfBirth,
      gender,
      password
    });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
}
};

export default userService;