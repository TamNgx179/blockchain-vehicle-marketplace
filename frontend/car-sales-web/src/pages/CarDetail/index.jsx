import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import cars from "../../data/cars";
import "./CarDetail.css";

function CarDetail() {
  // Read car id from URL, e.g. /product/:id
  const { id } = useParams();
  // Find the car data from the local dataset
  const car = cars.find((item) => item.id === id);
  const heroImage = car?.hero || car?.display || "";
  const gallery = Array.isArray(car?.gallery) ? car.gallery : [];
  const specsEntries = car?.specs ? Object.entries(car.specs) : [];
  const safetyList = Array.isArray(car?.safety) ? car.safety : [];
  const convenienceList = Array.isArray(car?.convenience) ? car.convenience : [];
  const [activeHeroImage, setActiveHeroImage] = useState(heroImage);

  useEffect(() => {
    setActiveHeroImage(heroImage);
  }, [heroImage]);

  if (!car) {
    return (
      <>
        <Navbar />
        <main className="car-detail">
          <div className="car-detail-container">
            <h1 className="car-detail-title">Không tìm thấy xe</h1>
            <Link className="car-detail-back" to="/cars">
              Xem danh sách xe
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const usdPerEth = Number(import.meta.env.VITE_USD_PER_ETH || 2000000);
  const usdPriceText =
    typeof car.priceUSD === "number"
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(car.priceUSD)
      : null;
  const coinPriceText =
    typeof car.priceUSD === "number" && Number.isFinite(usdPerEth) && usdPerEth > 0
      ? `${new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 6,
        }).format(car.priceUSD / usdPerEth)} ETH`
      : null;

  return (
    <>
      <Navbar />
      <main className="car-detail">
        <div className="car-detail-container">
          <div className="car-detail-top">
            <div className="car-detail-hero">
              <img
                src={activeHeroImage}
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
                <span>{car.type}</span>
              </div>
              {usdPriceText ? <div className="car-detail-price">{usdPriceText}</div> : null}
              {coinPriceText ? (
                <div className="car-detail-price-coin">{coinPriceText}</div>
              ) : null}
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
                    src={src}
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
                          {String(value)}
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
