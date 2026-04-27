import { useState, useEffect } from "react";
import SlideShow from "./SlideShow/SlideShow";
import Filter from "./Filter/Filter";
import CarList from "../../components/CarList/CarList";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ProductService from "../../services/ProductService";

function Home() {
  const [type, setType] = useState("All");
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const buildFilterParams = (selectedType) => {
    if (selectedType === "EV") {
      return { powertrainType: "electric" };
    }

    return { category: selectedType };
  };

  const getCarsFromResponse = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.products)) {
      return response.products;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  };

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);

      try {
        let response;

        if (type === "All") {
          response = await ProductService.getAllProducts();
        } else {
          const params = buildFilterParams(type);
          response = await ProductService.filterProducts(params);
        }

        setCars(getCarsFromResponse(response));
      } catch (error) {
        console.error("Lỗi khi lấy danh sách xe:", error);
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [type]);

  useEffect(() => {
    let timer;

    if (loading) {
      timer = setTimeout(() => setShowLoading(true), 200);
    } else {
      setShowLoading(false);
    }

    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <>
      <Navbar />
      <SlideShow />
      <Filter type={type} setType={setType} />

      <div style={{ minHeight: "520px", position: "relative" }}>
        <div
          style={{
            opacity: loading ? 0.45 : 1,
            transition: "opacity 0.2s ease",
            pointerEvents: loading ? "none" : "auto",
          }}
        >
          <CarList key={type} cars={cars} />
        </div>

        {showLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              paddingTop: "24px",
              background: "rgba(255, 255, 255, 0.4)",
              zIndex: 2,
            }}
          >
            <h3>Đang tải danh sách xe...</h3>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Home;