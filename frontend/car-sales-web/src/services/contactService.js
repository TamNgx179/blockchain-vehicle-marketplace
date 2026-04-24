import api from "./api"; // Instance axios của bạn

const ContactService = {
  /**
   * [USER] Gửi liên hệ mới
   * API: POST /api/contacts/create
   * @param {Object} contactData - { name, email, phone, subject, message }
   */
  createContact: async (contactData) => {
    try {
      const response = await api.post("/contacts/create", contactData);
      return response; // Trả về thông tin liên hệ vừa tạo
    } catch (error) {
      throw error;
    }
  },

  /**
   * [ADMIN] Lấy toàn bộ danh sách liên hệ khách hàng
   * API: GET /api/contacts/getAll
   * Yêu cầu: Token Admin
   */
  getAllContacts: async () => {
    try {
      const response = await api.get("/contacts/getAll");
      return response; // Trả về mảng danh sách liên hệ (đã sort mới nhất ở BE)
    } catch (error) {
      throw error;
    }
  },

  /**
   * [ADMIN] Xem chi tiết một liên hệ cụ thể
   * API: GET /api/contacts/:id
   * Yêu cầu: Token Admin
   */
  getContactById: async (id) => {
    try {
      const response = await api.get(`/contacts/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * [ADMIN] Đánh dấu liên hệ là đã đọc/đã xử lý
   * API: PUT /api/contacts/read/:id
   * Yêu cầu: Token Admin
   */
  markAsRead: async (id) => {
    try {
      const response = await api.put(`/contacts/read/${id}`);
      return response; // Trả về liên hệ đã cập nhật ischecked = true
    } catch (error) {
      throw error;
    }
  },
};

export default ContactService;