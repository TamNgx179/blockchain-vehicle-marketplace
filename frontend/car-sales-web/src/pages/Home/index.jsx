import { useState, useEffect } from "react";
import SlideShow from "./SlideShow/SlideShow";
import Filter from "./Filter/Filter";
import CarList from "../../components/CarList/CarList";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ProductService from "../../services/ProductService";
import AccountService from "../../services/accountService";

function Home() {
  const [type, setType] = useState("All");
  const [cars, setCars] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const getAuthToken = () => {
    return localStorage.getItem("authToken") || localStorage.getItem("token");
  };

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

  const getWishlistFromResponse = (response) => {
    const data = response?.data || response;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data.wishlist)) {
      return data.wishlist;
    }

    if (Array.isArray(data.products)) {
      return data.products;
    }

    if (Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  };

  const getProductIdFromWishlistItem = (item) => {
    return item?._id || item?.productId || item?.product?._id || item?.productId?._id;
  };

  const fetchWishlist = async () => {
    const token = getAuthToken();

    if (!token) {
      setWishlistIds([]);
      return;
    }

    try {
      const response = await AccountService.getWishlist();
      const wishlist = getWishlistFromResponse(response);

      const ids = wishlist
        .map(getProductIdFromWishlistItem)
        .filter(Boolean)
        .map(String);

      setWishlistIds(ids);
    } catch (error) {
      console.error("Lỗi khi lấy wishlist:", error);
      setWishlistIds([]);
    }
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
    fetchWishlist();
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      const token = getAuthToken();

      if (!token) {
        setWishlistIds([]);
        return;
      }

      fetchWishlist();
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("auth-expired", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("auth-expired", handleAuthChange);
    };
  }, []);

  const handleToggleWishlist = async (productId) => {
    const token = getAuthToken();

    if (!token) {
      alert("Vui lòng đăng nhập để thêm vào wishlist");
      setWishlistIds([]);
      return;
    }

    const id = String(productId);
    const isWishlisted = wishlistIds.includes(id);

    setWishlistIds((prev) =>
      isWishlisted ? prev.filter((item) => item !== id) : [...prev, id]
    );

    try {
      if (isWishlisted) {
        await AccountService.removeFromWishlist(productId);
      } else {
        await AccountService.addToWishlist(productId);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật wishlist:", error);

      setWishlistIds((prev) =>
        isWishlisted ? [...prev, id] : prev.filter((item) => item !== id)
      );
    }
  };

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
          <CarList
            key={type}
            cars={cars}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
          />
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
