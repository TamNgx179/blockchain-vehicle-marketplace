import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ProductService from "../../services/ProductService"; // Import Service của bạn
import ReviewService from "../../services/reviewService";
import "./CarDetail.css";
import { useCart } from "../../context/CartContext";
import add from '../../assets/icon/add.png';
function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(null); // State lưu dữ liệu từ API
  const [loading, setLoading] = useState(true);
  const [activeHeroImage, setActiveHeroImage] = useState("");
  const { addToCart } = useCart();
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState("");
  const [reviewSubmitMessage, setReviewSubmitMessage] = useState("");

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

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      setReviewsLoading(true);
      setReviewsError("");
      try {
        const res = await ReviewService.getReviewsByProductId(id);
        setReviews(Array.isArray(res?.data) ? res.data : []);
      } catch (error) {
        setReviewsError(error?.response?.data?.message || "Unable to load reviews");
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
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

  const authToken = localStorage.getItem("authToken");
  const authUsername = localStorage.getItem("authUsername") || "You";
  const ratingValue = Number.isFinite(Number(car?.averageRating))
    ? Number(car.averageRating)
    : reviews.length
      ? reviews.reduce((sum, item) => sum + Number(item?.rating || 0), 0) / reviews.length
      : 0;

  const reviewCountValue = Number.isFinite(Number(car?.reviewCount))
    ? Number(car.reviewCount)
    : reviews.length;

  const ratingText = reviewCountValue
    ? `${ratingValue.toFixed(1)} / 5 (${reviewCountValue})`
    : "No reviews";

  const renderStars = (value) => {
    const normalized = Math.max(0, Math.min(5, Number(value) || 0));
    const full = Math.round(normalized);
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewSubmitError("");
    setReviewSubmitMessage("");

    if (!authToken) {
      setReviewSubmitError("Please sign in to leave a review");
      return;
    }

    const numericRating = Number(reviewRating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      setReviewSubmitError("Rating must be between 1 and 5");
      return;
    }

    try {
      setReviewSubmitting(true);
      await ReviewService.createReview({
        productId: id,
        rating: numericRating,
        comment: reviewComment?.trim() || "",
      });

      setReviewSubmitMessage("Review submitted successfully");
      setReviewComment("");

      const [product, reviewsRes] = await Promise.all([
        ProductService.getProductById(id),
        ReviewService.getReviewsByProductId(id),
      ]);
      setCar(product);
      setReviews(Array.isArray(reviewsRes?.data) ? reviewsRes.data : []);
    } catch (error) {
      setReviewSubmitError(error?.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

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
              <div className="car-detail-rating">
                <span className="car-detail-stars" aria-label={ratingText}>
                  {renderStars(ratingValue)}
                </span>
                <span className="car-detail-rating-text">{ratingText}</span>
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

          <section className="car-detail-section">
            <h2 className="car-detail-section-title">Reviews</h2>

            <div className="car-detail-review-card">
              {!authToken ? (
                <div className="car-detail-review-auth">
                  <span>Please sign in to write a review.</span>
                  <Link to="/login">Sign in</Link>
                </div>
              ) : (
                <form className="car-detail-review-form" onSubmit={submitReview}>
                  <div className="car-detail-review-form-top">
                    <div className="car-detail-review-author">{authUsername}</div>
                    <label className="car-detail-review-rating">
                      <span>Rating</span>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        disabled={reviewSubmitting}
                      >
                        <option value={5}>5</option>
                        <option value={4}>4</option>
                        <option value={3}>3</option>
                        <option value={2}>2</option>
                        <option value={1}>1</option>
                      </select>
                    </label>
                  </div>

                  <textarea
                    className="car-detail-review-textarea"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your comment (optional)"
                    rows={4}
                    disabled={reviewSubmitting}
                  />

                  {reviewSubmitError ? (
                    <div className="car-detail-review-error">{reviewSubmitError}</div>
                  ) : null}
                  {reviewSubmitMessage ? (
                    <div className="car-detail-review-success">{reviewSubmitMessage}</div>
                  ) : null}

                  <button className="car-detail-review-submit" type="submit" disabled={reviewSubmitting}>
                    {reviewSubmitting ? "Submitting..." : "Submit review"}
                  </button>
                </form>
              )}
            </div>

            {reviewsLoading ? (
              <div className="car-detail-review-state">Loading reviews...</div>
            ) : reviewsError ? (
              <div className="car-detail-review-state car-detail-review-error">{reviewsError}</div>
            ) : reviews.length === 0 ? (
              <div className="car-detail-review-state">No reviews yet.</div>
            ) : (
              <div className="car-detail-review-list">
                {reviews
                  .slice()
                  .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
                  .map((review) => (
                    <div key={review?._id} className="car-detail-review-item">
                      <div className="car-detail-review-item-top">
                        <div className="car-detail-review-item-user">
                          {review?.userId?.username || "User"}
                        </div>
                        <div className="car-detail-review-item-stars">
                          {renderStars(review?.rating)}
                        </div>
                      </div>
                      {review?.comment ? (
                        <div className="car-detail-review-item-comment">{review.comment}</div>
                      ) : (
                        <div className="car-detail-review-item-comment car-detail-review-item-muted">
                          (No comment)
                        </div>
                      )}
                      <div className="car-detail-review-item-date">
                        {review?.createdAt
                          ? new Date(review.createdAt).toLocaleString("en-US")
                          : ""}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default CarDetail;
