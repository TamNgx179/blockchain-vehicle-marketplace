import { useState, useEffect } from "react"; // Thêm useEffect
import SlideShow from "./SlideShow/SlideShow";
import Filter from "./Filter/Filter";
import CarList from "../../components/CarList/CarList";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

// Import ProductService bạn vừa tạo
import ProductService from "../../services/ProductService";

function Home() {
  const [type, setType] = useState("EV");
  const [cars, setCars] = useState([]); // State để lưu danh sách xe từ API
  const [loading, setLoading] = useState(true); // State để hiển thị loading

  // Gọi API mỗi khi 'type' thay đổi
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        // Bạn có thể dùng filterProducts để lấy theo type từ Backend
        // Ví dụ: GET /api/products/filter?type=EV
        const data = await ProductService.filterProducts({ type: type });
        setCars(data.products);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách xe:", error);
        // Nếu lỗi, có thể set cars về mảng rỗng
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [type]); // Chạy lại mỗi khi type thay đổi

  return (
    <>
      <Navbar />
      <SlideShow />
      <Filter type={type} setType={setType} />

      {/* Hiển thị trạng thái Loading nếu đang tải */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h3>Đang tải danh sách xe...</h3>
        </div>
      ) : (
        /* Render danh sách xe từ API */
        <CarList key={type} cars={cars} />
      )}

      <Footer />
    </>
  );
}

export default Home;