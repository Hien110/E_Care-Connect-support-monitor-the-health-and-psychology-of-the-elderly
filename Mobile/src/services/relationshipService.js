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
}
export default relationshipService;
