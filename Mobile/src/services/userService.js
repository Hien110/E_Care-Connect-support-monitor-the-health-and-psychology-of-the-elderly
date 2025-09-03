import { api } from './api';

let RNStorage = null;
try {
  RNStorage = require('@react-native-async-storage/async-storage').default;
} catch (_) {
  // Nếu chạy web thì bỏ qua
}

/* ======================
   Biến RAM (session in-memory)
====================== */
let memoryToken = null;
let memoryUser = null;

export const userService = {
  /* ======================
   Helpers Token/User
====================== */

  getToken: async () => {
    if (memoryToken) return memoryToken;

    if (RNStorage) {
      const token = await RNStorage.getItem('ecare_token');
      memoryToken = token || null;
      return memoryToken;
    }

    return null;
  },

  setToken: async token => {
    if (RNStorage) {
      if (token) {
        await RNStorage.setItem('ecare_token', token);
        memoryToken = token;
      } else {
        await RNStorage.removeItem('ecare_token');
        memoryToken = null;
      }
    }
  },

  // --- USER ---
  getUser: async () => {
    if (memoryUser) return memoryUser;

    if (RNStorage) {
      const userStr = await RNStorage.getItem('ecare_user');
      memoryUser = userStr ? JSON.parse(userStr) : null;
      return memoryUser;
    }

    return null;
  },

  setUser: async user => {
    if (RNStorage) {
      if (user) {
        await RNStorage.setItem('ecare_user', JSON.stringify(user));
        memoryUser = user;
      } else {
        await RNStorage.removeItem('ecare_user');
        memoryUser = null;
      }
    }
  },
  // B1: Gửi OTP
  sendOTP: async ({ phoneNumber, role }) => {
    try {
      const response = await api.post('/users/send-otp', { phoneNumber, role });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message || error.message,
      };
    }
  },

  // B2: Xác thực OTP
  verifyOTP: async ({ phoneNumber, otp }) => {
    try {
      const response = await api.post('/users/verify-otp', {
        phoneNumber,
        otp,
      });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message || error.message,
      };
    }
  },

  // B3: Nhập CCCD
  setIdentity: async ({ phoneNumber, identityCard }) => {
    try {
      const response = await api.put('/users/set-identity', {
        phoneNumber,
        identityCard,
      });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message || error.message,
      };
    }
  },

  // B4: Hoàn tất hồ sơ
  completeProfile: async ({ fullName, dateOfBirth, gender, password }) => {
    try {
      const response = await api.put('/users/complete-profile', {
        fullName,
        dateOfBirth,
        gender,
        password,
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
  },
  // Đăng nhập
  loginUser: async ({ phoneNumber, password }) => {
    try {
      const res = await api.post('/users/loginUser', { phoneNumber, password });
      const token = res.data?.token || res.data?.data?.token;
      const user = res.data?.user || res.data?.data?.user;

      return {
        success: true,
        token,
        user,
        message: res.data?.message || 'Đăng nhập thành công',
      };
    } catch (error) {
      const msg = error?.response?.data?.message || 'Đăng nhập thất bại';
      return { success: false, token: null, user: null, message: msg };
    }
  },

  // Lấy thông tin user
  getUserInfo: async () => {
    try {
      const res = await api.get('/users/getUserInfo');
      return { success: true, data: res.data?.data };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error?.response?.data?.message || 'Lấy thông tin người dùng thất bại',
      };
    }
  },

  logout: async () => {
    await userService.setToken(null);
    await userService.setUser(null);
  },


  //Thay đổi mật khẩu
  changePassword: async ({ oldPassword, newPassword }) => {
    try {
      const response = await api.put('/users/change-password', {
        oldPassword,
        newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${await userService.getToken()}`,
        },
      });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message || error.message,
      };
    }
  },
};

export default userService;
