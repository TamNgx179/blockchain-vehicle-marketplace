import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true
});

// Tự động gắn token từ localStorage vào Header trước khi gửi request
api.interceptors.request.use((config) => {
  // mã token mỗi lần đăng nhập mỗi khác , đâu là dùng tạm lấy từ post man 
  localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZGFiYWYyYTQyMDc2NTcyMDJkYjcxZiIsInVzZXJuYW1lIjoiMjM1MjAxOTUiLCJpc2FkbWluIjpmYWxzZSwiaWF0IjoxNzc2MDE0MjM4LCJleHAiOjE3NzYwMTc4Mzh9.a-NN4RG_n3olZKYoWwrQqySKtwJ0TIVgViGj8ylZkKE');
  const token = localStorage.getItem('token'); // Hoặc nơi bạn lưu token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;