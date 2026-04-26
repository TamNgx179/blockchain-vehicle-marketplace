import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ProductService from "../../services/ProductService"; // Import Service của bạn
import "./CarDetail.css";
import { useCart } from "../../context/CartContext";
import add from '../../assets/icon/add.png';
function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(null); // State lưu dữ liệu từ API
  const [loading, setLoading] = useState(true);
  const [activeHeroImage, setActiveHeroImage] = useState("");
  const { addToCart } = useCart();

  // 1. Gọi API lấy dữ liệu sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await ProductService.getProductById(id);
        setCar(data);
        // Thiết lập ảnh hero mặc định từ API
        setActiveHeroImage(data?.heroImage || data?.thumbnailImage || "");
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // Logic xử lý dữ liệu dựa trên cấu trúc JSON mới của bạn
  const heroImage = car?.heroImage || car?.thumbnailImage || "";
  const gallery = Array.isArray(car?.galleryImages) ? car.galleryImages : [];

  // Ánh xạ specifications từ API (dimensions, engine, power...)
  const specsEntries = car?.specifications
    ? Object.entries(car.specifications).filter(([key]) => key !== "_id")
    : [];

  const safetyList = Array.isArray(car?.safety) ? car.safety : [];
  const convenienceList = Array.isArray(car?.convenience) ? car.convenience : [];

  // Màn hình Loading
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="car-detail"><div className="car-detail-container"><h1>Loading...</h1></div></main>
        <Footer />
      </>
    );
  }

  // Màn hình lỗi/không tìm thấy
  if (!car) {
    return (
      <>
        <Navbar />
        <main className="car-detail">
          <div className="car-detail-container">
            <h1 className="car-detail-title">Không tìm thấy xe</h1>
            <Link className="car-detail-back" to="/cars">Xem danh sách xe</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Logic giá tiền (Giữ nguyên logic của bạn)
  const usdPerEth = Number(import.meta.env.VITE_USD_PER_ETH || 2000000);
  const usdPriceText = typeof car.price === "number"
    ? new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(car.price)
    : null;

  const coinPriceText = typeof car.price === "number" && Number.isFinite(usdPerEth) && usdPerEth > 0
    ? `${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    }).format(car.price / usdPerEth)} ETH`
    : null;

  return (
    <>
      <Navbar />
      <main className="car-detail">
        <div className="car-detail-container">
          <div className="car-detail-top">
            <div className="car-detail-hero">
              <img
                src={"/" + activeHeroImage}
                alt={car.name}
                loading="eager"
                decoding="async"
              />
            </div>

            <div className="car-detail-summary">
              <div className="car-detail-breadcrumb">
                <Link to="/">Home</Link>
                <span>/</span>
                <span>{car.name}</span>
              </div>

              <h1 className="car-detail-title">{car.name}</h1>
              <div className="car-detail-meta">
                <span>{car.brand}</span>
                <span>•</span>
                <span>{car.category}</span> {/* Đổi car.type thành car.category cho khớp JSON */}
              </div>
              {usdPriceText ? <div className="car-detail-price">{usdPriceText}</div> : null}
              {coinPriceText ? (
                <div className="car-detail-price-coin">{coinPriceText}</div>
              ) : null}
              <button className="add-to-cart" onClick={() => addToCart(car)}>
                <img src={add} alt="Add to cart icon" />
              </button>
            </div>
          </div>

          {gallery.length > 0 ? (
            <section className="car-detail-section">
              <h2 className="car-detail-section-title">Gallery</h2>
              <div
                className="car-detail-gallery"
                onMouseLeave={() => setActiveHeroImage(heroImage)}
              >
                {gallery.map((src) => (
                  <img
                    key={src}
                    src={"/" + src}
                    alt={`${car.name} gallery`}
                    loading="lazy"
                    decoding="async"
                    onMouseEnter={() => setActiveHeroImage(src)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {specsEntries.length > 0 ||
            safetyList.length > 0 ||
            convenienceList.length > 0 ? (
            <section className="car-detail-section">
              <h2 className="car-detail-section-title car-detail-technical-title">
                Technical detail
              </h2>

              <div className="car-detail-technical-card">
                <div className="car-detail-technical-grid">
                  <div className="car-detail-tech-table">
                    {specsEntries.map(([key, value]) => (
                      <div key={key} className="car-detail-tech-row">
                        <div className="car-detail-tech-key">{key}</div>
                        <div className="car-detail-tech-value">
                          {/* Xử lý trường hợp value là object (như dimensions) */}
                          {typeof value === 'object'
                            ? JSON.stringify(value).replace(/[{""}]/g, '')
                            : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="car-detail-tech-side">
                    {safetyList.length > 0 ? (
                      <div className="car-detail-tech-block">
                        <h3 className="car-detail-tech-heading">
                          Safety & Driving Assistance
                        </h3>
                        <ul className="car-detail-tech-bullets">
                          {safetyList.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {convenienceList.length > 0 ? (
                      <div className="car-detail-tech-block">
                        <h3 className="car-detail-tech-heading">Convenience</h3>
                        <ul className="car-detail-tech-bullets">
                          {convenienceList.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default CarDetail;