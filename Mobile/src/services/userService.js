import {api} from "./api"; // Đảm bảo bạn import axiosConfig

let RNStorage = null;
try {
  RNStorage = require("@react-native-async-storage/async-storage").default;
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

 getToken : async () => {
  // ƯU TIÊN token trong RAM (session)
  if (memoryToken) return memoryToken;

  if (RNStorage) return await RNStorage.getItem("ecare_token");
  return typeof localStorage !== "undefined"
    ? localStorage.getItem("token") || sessionStorage.getItem("token")
    : null;
},

 setToken : async (token, remember = true) => {
  if (RNStorage) {
    if (remember) {
      // LƯU VĨNH VIỄN vào AsyncStorage
      if (token) await RNStorage.setItem("ecare_token", token);
      else await RNStorage.removeItem("ecare_token");
      memoryToken = null;
    } else {
      // CHỈ LƯU TRONG RAM
      memoryToken = token || null;
    }
  } else if (typeof localStorage !== "undefined") {
    if (token) {
      if (remember) localStorage.setItem("token", token);
      else sessionStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
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
    const response = await api.put('/users/complete-profile', {
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
}



export default userService;
