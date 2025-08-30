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
},

  // Forgot Password - Gửi OTP
  sendForgotPasswordOTP: async ({ phoneNumber }) => {
    try {
      const response = await api.post('/users/forgot-password/send-otp', { phoneNumber });
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

  // Forgot Password - Xác thực OTP
  verifyForgotPasswordOTP: async ({ phoneNumber, otp }) => {
    try {
      const response = await api.post('/users/forgot-password/verify-otp', { phoneNumber, otp });
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

  // Forgot Password - Đặt lại mật khẩu
  resetPassword: async ({ resetToken, newPassword }) => {
    try {
      const response = await api.post('/users/forgot-password/reset', { resetToken, newPassword });
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
// Đăng nhập
 loginUser : async ({ phoneNumber, password}) => {
  console.log(api);

  try {
    const res = await api.post("/users/loginUser", { phoneNumber, password });

    const token = res.data?.token || res.data?.data?.token;
    const user = res.data?.user || res.data?.data?.user;

    return {
      success: true,
      token,
      user,
      message: res.data?.message || "Đăng nhập thành công",
    };
  } catch (error) {
    // Kiểm tra xem có lỗi mạng hoặc không có phản hồi từ server
    console.log(error, "XIn chào hello");

    if (!error?.response) {
      console.error("Login Error: No response from server", error);
      return {
        success: false,
        token: null,
        user: null,
        message: "Không thể kết nối với máy chủ. Vui lòng thử lại sau.",
        error: error
      };
    }

    // Lỗi từ server (ví dụ: sai mật khẩu, tài khoản không tồn tại)
    const errorMessage = error?.response?.data?.message || "Đăng nhập thất bại";

    // console.error("Login Error:", errorMessage);

    return {
      success: false,
      token: null,
      user: null,
      message: errorMessage,
    };
  }
},

// Lấy thông tin user
 getUserInfo : async () => {
  try {
    const headers = await authHeader();
    if (!headers.Authorization) {
      return { success: false, data: null, message: "Chưa đăng nhập" };
    }

    const res = await api.get("/users/getUserInfo", { headers });

    if (res.data?.data) {
      // Cập nhật lại user
      const current = await getUser();
      const isRemember =
        (RNStorage && (await RNStorage.getItem("ecare_user"))) ||
        (typeof localStorage !== "undefined" && localStorage.getItem("currentUser"));
      await setUser(res.data.data, !!isRemember);
    }

    return { success: true, data: res.data?.data };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error?.response?.data?.message || "Lấy thông tin người dùng thất bại",
    };
  }
},
}



export default userService;
