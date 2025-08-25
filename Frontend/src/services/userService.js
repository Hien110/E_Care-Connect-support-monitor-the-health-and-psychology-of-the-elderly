import axios from 'axios';

const API_URL = 'https://ecarebackend-cvfvhjfsc9h5f2fw.southeastasia-01.azurewebsites.net//api/users';

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
};

export default userService;
