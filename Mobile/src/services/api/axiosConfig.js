import axios from 'axios';

// Base URL của API - thay đổi theo địa chỉ server của bạn
const BASE_URL = 'http://192.168.5.172:3000/api'; // Thay bằng IP máy bạn
 
// Tạo instance axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    // Thêm token nếu có
    const token = ''; // Lấy từ AsyncStorage hoặc Redux
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.log('❌ API Error:', error.response?.data || error.message);
    
    // Xử lý lỗi chung
    if (error.response?.status === 401) {
      // Token hết hạn, đăng xuất
    }
    
    return Promise.reject(error);
  }
);

export default api;