import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // process.env.MONGODB_URI sẽ lấy từ file .env của bạn
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        console.log(`MongoDB đã kết nối: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Lỗi kết nối: ${error.message}`);
        // Thoát chương trình với mã lỗi (1) nếu không kết nối được DB
        process.exit(1);
    }
};

export default connectDB;