import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Cấu hình cho đường dẫn bắt đầu bằng /images
      '/images': {
        target: 'http://localhost:3000', // Địa chỉ Backend
        changeOrigin: true,
        secure: false,
        // Logic kiểm tra: Nếu Backend trả về 404, Proxy sẽ bỏ qua và Vite sẽ tìm ở FE
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Nếu BE trả về 404, chúng ta có thể log ở đây để theo dõi
            if (proxyRes.statusCode === 404) {
              // Bạn có thể để trống, Vite sẽ tự động xử lý request tiếp theo tại nội bộ FE
            }
          });
        },
      },
    }
  }
})