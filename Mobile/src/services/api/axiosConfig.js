import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = "http://192.168.1.12:3000/api";

// ===== Token storage (in-memory + AsyncStorage) =====
const TOKEN_KEY = "ecare_token";
let inMemoryToken = null;

export async function getAPIToken() {
  if (inMemoryToken) return inMemoryToken;
  const t = await AsyncStorage.getItem(TOKEN_KEY);
  inMemoryToken = t;
  return t;
}

export async function setAPIToken(token) {
  inMemoryToken = token || null;
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

// (tuỳ chọn) Lưu/đọc user để reuse ở UI
const USER_KEY = "ecare_user";
export async function setSavedUser(user) {
  if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  else await AsyncStorage.removeItem(USER_KEY);
}
export async function getSavedUser() {
  const u = await AsyncStorage.getItem(USER_KEY);
  return u ? JSON.parse(u) : null;
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Gắn Authorization mỗi request
api.interceptors.request.use(
  async (config) => {
    const token = await getAPIToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// (tuỳ chọn) Nếu 401 có thể auto-logout tại đây
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // if (error?.response?.status === 401) {
    //   await setAPIToken(null);
    //   await setSavedUser(null);
    // }
    return Promise.reject(error);
  }
);

export default api;
export { api };