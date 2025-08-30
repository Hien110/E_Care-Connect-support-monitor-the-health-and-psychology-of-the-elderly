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

/* ======================
   Helpers Token/User
====================== */

const getToken = async () => {
  // ƯU TIÊN token trong RAM (session)
  if (memoryToken) return memoryToken;

  if (RNStorage) return await RNStorage.getItem("ecare_token");
  return typeof localStorage !== "undefined"
    ? localStorage.getItem("token") || sessionStorage.getItem("token")
    : null;
};

const setToken = async (token, remember = true) => {
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
};

const getUser = async () => {
  if (memoryUser) return memoryUser;

  if (RNStorage) {
    const val = await RNStorage.getItem("ecare_user");
    return val ? JSON.parse(val) : null;
  } else if (typeof localStorage !== "undefined") {
    const val = localStorage.getItem("currentUser");
    return val ? JSON.parse(val) : null;
  }
  return null;
};

const setUser = async (user, remember = true) => {
  const val = user ? JSON.stringify(user) : null;

  if (RNStorage) {
    if (remember) {
      if (val) await RNStorage.setItem("ecare_user", val);
      else await RNStorage.removeItem("ecare_user");
      memoryUser = null;
    } else {
      memoryUser = user || null;
    }
  } else if (typeof localStorage !== "undefined") {
    if (val) {
      if (remember) localStorage.setItem("currentUser", val);
      else sessionStorage.setItem("currentUser", val);
    } else {
      localStorage.removeItem("currentUser");
      sessionStorage.removeItem("currentUser");
    }
  }
};

const authHeader = async () => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ======================
   API methods
====================== */

// Đăng ký
const registerUser = async (payload) => {
  try {
    const res = await api.post("/users/registerUser", payload);
    return {
      success: true,
      data: res.data?.data,
      message: res.data?.message || "Đăng ký thành công",
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error?.response?.data?.message || "Đăng ký người dùng thất bại",
    };
  }
};

// Đăng nhập
const loginUser = async ({ phoneNumber, password}) => {
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
};

// Lấy thông tin user
const getUserInfo = async () => {
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
};

// Logout
const logout = async () => {
  await setToken(null, true);
  await setUser(null, true);
  memoryToken = null;
  memoryUser = null;
  return { success: true };
};

/* ======================
   Export
====================== */
const userService = {
  registerUser,
  loginUser,
  getUserInfo,
  logout,
  getToken,
  setToken,
  getUser,
  setUser,
};

export default userService;
