import { api } from './api';

export const relationshipService = {

  // Tạo mối quan hệ
  createRelationship: async ({ elderlyId, relationship }) => {
    try {
      const response = await api.post('/relationships/create', {
        elderlyId,
        relationship,
      });
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
  // Lấy các yêu cầu kết nối
  getRequestRelationshipsById: async () => {
    try {
      const response = await api.get('/relationships/requests');
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
  // Chấp nhận yêu cầu kết nối
  acceptRelationship: async (relationshipId) => {
    try {
      const response = await api.put(`/relationships/request/${relationshipId}/accept`);
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

  // Từ chối yêu cầu kết nối
  rejectRelationship: async (relationshipId) => {
    try {
      const response = await api.put(`/relationships/request/${relationshipId}/reject`);
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

  // Lấy các mối quan hệ đã chấp nhận
  getAcceptedRelationships: async () => {
    try {
      const response = await api.get('/relationships/accepted');
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

  // Hủy mối quan hệ
  cancelRelationship: async (relationshipId) => {
    try {
      const response = await api.put(`/relationships/${relationshipId}/cancel`);
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
};
export default relationshipService;
