import axios from 'axios';

const API_URL = 'http://localhost:3000/api/users';


const api = axios.create({
  baseURL: API_URL,
});

const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
}; 


const persistedToken = localStorage.getItem('token');
if (persistedToken) setAuthToken(persistedToken); 


const userService = {
    registerUser: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/registerUser`, userData);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || "Đăng ký thành công"
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: error.response.data.message || "Đăng ký người dùng thất bại"
            };
        }
    },


    loginUser: async ({ phoneNumber, password }) => {
    try {
      const res = await api.post('/loginUser', { phoneNumber, password });

      const token = res.data?.token;
      const user = res.data?.user;

      // Lưu token + set header cho các request sau
      setAuthToken(token);

      return {
        success: true,
        token,
        user,
        message: res.data?.message || 'Đăng nhập thành công',
      };
    } catch (error) {
      return {
        success: false,
        token: null,
        user: null,
        message:
          error?.response?.data?.message || 'Đăng nhập thất bại',
      };
    }
  },

  // Lấy thông tin user hiện tại (cần token)
  getUserInfo: async () => {
    try {
      const res = await api.get('/getUserInfo');
      return {
        success: true,
        data: res.data?.data,
      };
    } catch (error) {
      // Nếu 401, có thể token hết hạn → xoá token local
      if (error?.response?.status === 401) setAuthToken(null);
      return {
        success: false,
        data: null,
        message:
          error?.response?.data?.message || 'Lấy thông tin người dùng thất bại',
      };
    }
  },

  // Đăng xuất
  logout: () => {
    setAuthToken(null);
    return { success: true };
  },
};





export default userService;
