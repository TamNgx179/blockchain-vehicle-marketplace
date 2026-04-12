import api from './api'; // Import instance axios bạn đã tạo

const ProductService = {
  // 1. Lấy tất cả sản phẩm
  getAllProducts: async () => {
    const response = await api.get('/products/getAll');
    return response.data;
  },

  // 2. Lọc sản phẩm (theo query params như /filter?brand=Audi&price=1000)
  filterProducts: async (params) => {
    const response = await api.get('/products/filter', { params });
    return response.data;
  },

  // 3. Lấy chi tiết 1 sản phẩm theo ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // 4. Tạo sản phẩm mới (Dùng FormData vì có upload ảnh)
  createProduct: async (productData) => {
    // productData nên là một instance của FormData
    const response = await api.post('/products/create', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 5. Cập nhật sản phẩm (Dùng FormData)
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/edit/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 6. Xóa sản phẩm
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/deleteOne/${id}`);
    return response.data;
  },
};

export default ProductService;