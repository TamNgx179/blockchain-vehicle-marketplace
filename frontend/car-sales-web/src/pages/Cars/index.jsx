import { useMemo, useState, useEffect } from "react"; // Thêm useEffect
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ProductService from "../../services/ProductService"; // Import Service bạn đã cung cấp
import "./Cars.css";

function DualRange({
  min,
  max,
  step,
  valueMin,
  valueMax,
  disabled,
  onChangeMin,
  onChangeMax,
}) {
  const range = max - min;
  const left = range > 0 ? ((valueMin - min) / range) * 100 : 0;
  const right = range > 0 ? ((valueMax - min) / range) * 100 : 100;

  return (
    <div className="cars-dual-range" style={{ "--left": `${left}%`, "--right": `${right}%` }}>
      <input
        className="cars-dual-range-input"
        style={{ zIndex: valueMin > valueMax - step * 2 ? 5 : 3 }}
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        disabled={disabled}
        onChange={(e) => {
          const next = Number(e.target.value);
          onChangeMin(Math.min(next, valueMax - step));
        }}
      />
      <input
        className="cars-dual-range-input"
        style={{ zIndex: 4 }}
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        disabled={disabled}
        onChange={(e) => {
          const next = Number(e.target.value);
          onChangeMax(Math.max(next, valueMin + step));
        }}
      />
    </div>
  );
}

function CarSpecItem({ icon, text }) {
  return (
    <div className="cars-item-spec">
      <span className="cars-item-spec-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="cars-item-spec-text">{text}</span>
    </div>
  );
}

function IconMileage() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M4.5 15a7.5 7.5 0 1 1 15 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 9v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconYear() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M7 3v3M17 3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function IconTransmission() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 21h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 15l-3 3M12 15l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconFuel() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M6 3h9a1 1 0 0 1 1 1v17H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 7h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 8l2 2v8a2 2 0 0 1-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconDrive() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M7 14h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5.5 16.5a2 2 0 1 0 0.01 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18.5 16.5a2 2 0 1 0 0.01 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 7h8l2 5H6l2-5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function IconPower() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 3v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.5 5.5a8 8 0 1 0 9 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 22s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 11.5a2 2 0 1 0 0.01 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Cars() {
  const [carsList, setCarsList] = useState([]); // State lưu danh sách xe từ API
  const [selectedMakes, setSelectedMakes] = useState([]);
  const [isMakeOpen, setIsMakeOpen] = useState(false);
  const [makeQuery, setMakeQuery] = useState("");
  const [expandedTagsById, setExpandedTagsById] = useState({});
  const [priceMin, setPriceMin] = useState(10000);
  const [priceMax, setPriceMax] = useState(200000);
  const [mileageMin, setMileageMin] = useState(0);
  const [mileageMax, setMileageMax] = useState(200000);
  const [transmission, setTransmission] = useState("All");
  const [fuel, setFuel] = useState("All");
  const [powerMin, setPowerMin] = useState(20);
  const [powerMax, setPowerMax] = useState(1000);
  const [vehicleType, setVehicleType] = useState("All");
  const [featureQuery, setFeatureQuery] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu từ API khi component mount
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await ProductService.getAllProducts();
        setCarsList(data);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const brandList = useMemo(() => {
    const values = Array.from(new Set(carsList.map((c) => c.brand).filter(Boolean)));
    values.sort((a, b) => a.localeCompare(b));
    return values;
  }, [carsList]);

  const filteredBrands = useMemo(() => {
    const q = makeQuery.trim().toLowerCase();
    if (!q) return brandList;
    return brandList.filter((b) => b.toLowerCase().includes(q));
  }, [brandList, makeQuery]);

  const mostSearchedBrands = useMemo(() => {
    const preferred = ["BMW", "Honda", "Mercedes", "Porsche", "Toyota", "Vinfast"];
    const set = new Set(brandList);
    const picks = preferred.filter((b) => set.has(b)).slice(0, 6);
    if (picks.length >= 6) return picks;
    const remainder = brandList.filter((b) => !picks.includes(b));
    return [...picks, ...remainder].slice(0, 6);
  }, [brandList]);

  const brandLogo = (brand) => {
    const key = String(brand || "").toLowerCase();
    const known = new Set(["bmw", "honda", "mercedes", "porsche", "toyota", "vinfast"]);
    if (!known.has(key)) return null;
    return `/images/logos/${key}-logo.png`;
  };

  const toggleMake = (brand) => {
    setSelectedMakes((prev) => {
      const next = Array.isArray(prev) ? prev : [];
      if (next.includes(brand)) return next.filter((x) => x !== brand);
      return [...next, brand];
    });
    setPage(1);
  };

  const removeMake = (brand) => {
    setSelectedMakes((prev) => {
      const next = Array.isArray(prev) ? prev : [];
      return next.filter((x) => x !== brand);
    });
    setPage(1);
  };

  const typeCategories = useMemo(() => {
    const values = Array.from(new Set(carsList.map((c) => c.category).filter(Boolean)));
    values.sort((a, b) => a.localeCompare(b));
    return values;
  }, [carsList]);

  const allFeatures = useMemo(() => {
    const set = new Set();
    carsList.forEach((c) => {
      (Array.isArray(c.safety) ? c.safety : []).forEach((x) => set.add(x));
      (Array.isArray(c.convenience) ? c.convenience : []).forEach((x) => set.add(x));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [carsList]);

  const visibleFeatures = useMemo(() => {
    const q = featureQuery.trim().toLowerCase();
    const list = q ? allFeatures.filter((f) => f.toLowerCase().includes(q)) : allFeatures;
    return showAllFeatures ? list : list.slice(0, 8);
  }, [allFeatures, featureQuery, showAllFeatures]);

  const canShowMoreFeatures = useMemo(() => {
    const q = featureQuery.trim().toLowerCase();
    const list = q ? allFeatures.filter((f) => f.toLowerCase().includes(q)) : allFeatures;
    return !showAllFeatures && list.length > 8;
  }, [allFeatures, featureQuery, showAllFeatures]);

  // HELPER FUNCTIONS CẬP NHẬT THEO CẤU TRÚC JSON MỚI
  const getPowerHP = (car) => {
    const value = car?.specifications?.power;
    return typeof value === "number" ? value : 0;
  };

  const getTransmission = (car) => {
    const gear = car?.specifications?.gear;
    if (gear === 1 || car?.specifications?.powertrainType === "electric") return "Automatic";
    return "Manual";
  };

  const getFuel = (car) => {
    const type = car?.specifications?.powertrainType;
    if (type === "electric") return "Electric";
    if (type === "hybrid") return "Hybrid";
    return "Gasoline";
  };

  const getDrive = (car) => {
    const engine = car?.specifications?.engine?.toLowerCase() || "";
    if (engine.includes("awd") || engine.includes("all electric") || engine.includes("dual")) return "AWD";
    return null;
  };

  const filteredCars = useMemo(() => {
    return carsList.filter((c) => {
      const matchMake = selectedMakes.length === 0 ? true : selectedMakes.includes(c.brand);
      const matchPrice = typeof c.price === "number" ? c.price >= priceMin && c.price <= priceMax : true;
      // API hiện tại chưa có trường mileageKM, mặc định true hoặc xử lý tùy ý
      const matchMileage = true;
      const matchTransmission = transmission === "All" ? true : getTransmission(c) === transmission;
      const matchFuel = fuel === "All" ? true : getFuel(c) === fuel;
      const power = getPowerHP(c);
      const matchPower = power >= powerMin && power <= powerMax;
      const matchType = vehicleType === "All" ? true : c.category === vehicleType;
      const matchFeatures =
        selectedFeatures.length === 0
          ? true
          : selectedFeatures.every((f) => {
            const list = [...(Array.isArray(c.safety) ? c.safety : []), ...(Array.isArray(c.convenience) ? c.convenience : [])];
            return list.includes(f);
          });

      return matchMake && matchPrice && matchMileage && matchTransmission && matchFuel && matchPower && matchType && matchFeatures;
    });
  }, [carsList, selectedMakes, priceMin, priceMax, transmission, fuel, powerMin, powerMax, vehicleType, selectedFeatures]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredCars.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleCars = filteredCars.slice(startIndex, startIndex + pageSize);

  const heroCar = visibleCars[0] || filteredCars[0] || carsList[0];
  const heroImage = heroCar?.heroImage || heroCar?.thumbnailImage || "/images/car.webp";

  const priceText = (value) => {
    if (typeof value !== "number") return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const toggleFeature = (feature) => {
    setSelectedFeatures((prev) => {
      if (prev.includes(feature)) return prev.filter((x) => x !== feature);
      return [...prev, feature];
    });
    setPage(1);
  };

  if (loading) return <div className="loading">Loading cars...</div>;

  return (
    <>
      <Navbar />
      <main className="cars-page">
        <section className="cars-hero">
          <div className="cars-hero-inner">
            <div className="cars-hero-text">
              <h1>Find your<br />favorite car</h1>
            </div>
            <div className="cars-hero-media">
              <img src={heroImage} alt="Hero car" loading="eager" decoding="async" />
            </div>
          </div>
        </section>

        <div className="cars-layout">
          <aside className="cars-sidebar">
            <div className="cars-filter-card">
              <div className="cars-filter-title">Filter</div>

              <div className="cars-filter-group">
                <div className="cars-filter-label">Car model</div>
                {selectedMakes.length > 0 ? (
                  <div className="cars-selected-makes">
                    {selectedMakes.map((brand) => {
                      const logo = brandLogo(brand);
                      return (
                        <div key={brand} className="cars-selected-make">
                          {logo ? (
                            <img className="cars-selected-make-logo" src={logo} alt={brand} />
                          ) : (
                            <span className="cars-selected-make-logo cars-selected-make-fallback">
                              {brand.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                          <div className="cars-selected-make-name">{brand}</div>
                          <button
                            type="button"
                            className="cars-selected-make-remove"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeMake(brand);
                            }}
                            aria-label={`Remove ${brand}`}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                <button type="button" className="cars-model-row cars-model-trigger" onClick={() => setIsMakeOpen(true)}>
                  <span className="cars-model-select">
                    <span className="cars-model-plus">+</span>
                    <span className="cars-model-value">Add a car</span>
                  </span>
                  <span className="cars-model-go" aria-hidden="true">›</span>
                </button>
              </div>

              <div className="cars-filter-group">
                <div className="cars-filter-label">Price</div>
                <div className="cars-filter-range-meta cars-filter-range-meta-top">
                  <span>{priceText(priceMin)}</span>
                  <span>{priceText(priceMax)}</span>
                </div>
                <DualRange
                  min={10000}
                  max={200000}
                  step={500}
                  valueMin={priceMin}
                  valueMax={priceMax}
                  onChangeMin={(v) => { setPriceMin(v); setPage(1); }}
                  onChangeMax={(v) => { setPriceMax(v); setPage(1); }}
                />
              </div>

              <div className="cars-filter-group">
                <div className="cars-filter-label">Mileage (km)</div>
                <div className="cars-filter-range-meta cars-filter-range-meta-top">
                  <span>{mileageMin.toLocaleString("en-US")} km</span>
                  <span>{mileageMax.toLocaleString("en-US")} km</span>
                </div>
                <DualRange
                  min={0}
                  max={200000}
                  step={500}
                  valueMin={mileageMin}
                  valueMax={mileageMax}
                  onChangeMin={(v) => { setMileageMin(v); setPage(1); }}
                  onChangeMax={(v) => { setMileageMax(v); setPage(1); }}
                />
              </div>

              <div className="cars-filter-group">
                <div className="cars-filter-label">Transmission</div>
                <select className="cars-filter-select" value={transmission} onChange={(e) => { setTransmission(e.target.value); setPage(1); }}>
                  <option value="All">All</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div className="cars-filter-group">
                <div className="cars-filter-label">Fuel</div>
                <select className="cars-filter-select" value={fuel} onChange={(e) => { setFuel(e.target.value); setPage(1); }}>
                  <option value="All">All</option>
                  <option value="Gasoline">Gasoline</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>

              <div className="cars-filter-group">
                <div className="cars-filter-label">Power (HP)</div>
                <div className="cars-filter-range-meta cars-filter-range-meta-top">
                  <span>{powerMin} HP</span>
                  <span>{powerMax} HP</span>
                </div>
                <DualRange
                  min={20}
                  max={1000}
                  step={10}
                  valueMin={powerMin}
                  valueMax={powerMax}
                  onChangeMin={(v) => { setPowerMin(v); setPage(1); }}
                  onChangeMax={(v) => { setPowerMax(v); setPage(1); }}
                />
              </div>

              <div className="cars-filter-group">
                <div className="cars-filter-label">Vehicle type</div>
                <select className="cars-filter-select" value={vehicleType} onChange={(e) => { setVehicleType(e.target.value); setPage(1); }}>
                  <option value="All">All</option>
                  {typeCategories.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="cars-filter-group">
                <div className="cars-filter-label">Feature</div>
                <input
                  className="cars-filter-input"
                  value={featureQuery}
                  onChange={(e) => { setFeatureQuery(e.target.value); setShowAllFeatures(false); }}
                  placeholder="Search for feature"
                />
                <div className="cars-feature-list">
                  {visibleFeatures.map((feature) => {
                    const checked = selectedFeatures.includes(feature);
                    return (
                      <label key={feature} className="cars-feature-item">
                        <input type="checkbox" checked={checked} onChange={() => toggleFeature(feature)} />
                        <span>{feature}</span>
                      </label>
                    );
                  })}
                </div>
                {canShowMoreFeatures ? (
                  <button type="button" className="cars-feature-more" onClick={() => setShowAllFeatures(true)}>More feature</button>
                ) : null}
              </div>

              <button
                type="button"
                className="cars-filter-submit"
                onClick={() => {
                  setPage(1);
                  const el = document.getElementById("cars-results");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Detail search
              </button>
            </div>
          </aside>

          <section className="cars-results" id="cars-results">
            <div className="cars-results-header">
              <div className="cars-results-title">Available Car</div>
              <div className="cars-results-pager">
                <button type="button" className="cars-pager-btn" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
                <div className="cars-pager-pages">
                  {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} type="button" className={`cars-page-btn ${p === safePage ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                    );
                  })}
                </div>
                <button type="button" className="cars-pager-btn" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
              </div>
            </div>

            <div className="cars-results-subtitle">{filteredCars.length} cars</div>

            <div className="cars-list">
              {visibleCars.map((car) => {
                const chipItems = [...(Array.isArray(car.safety) ? car.safety : []), ...(Array.isArray(car.convenience) ? car.convenience : [])];
                const isExpanded = Boolean(expandedTagsById[car._id]);
                const visibleChips = isExpanded ? chipItems : chipItems.slice(0, 4);
                const remaining = Math.max(0, chipItems.length - 4);
                const cardImage = car.thumbnailImage || "/images/car.webp";

                return (
                  <Link key={car._id} className="cars-item" to={`/product/${car._id}`}>
                    <div className="cars-item-media">
                      <img src={cardImage} alt={car.name} loading="lazy" decoding="async" />
                    </div>

                    <div className="cars-item-body">
                      <div className="cars-item-top">
                        <div className="cars-item-name">{car.name}</div>
                        <div className="cars-item-brand">
                          <span className="cars-item-brand-icon" aria-hidden="true"><IconPin /></span>
                          <span>{car.brand}</span>
                        </div>
                      </div>

                      <div className="cars-item-specs">
                        <CarSpecItem icon={<IconYear />} text={`${new Date(car.createdAt).getFullYear()}`} />
                        <CarSpecItem icon={<IconTransmission />} text={getTransmission(car)} />
                        <CarSpecItem icon={<IconFuel />} text={getFuel(car)} />
                        {getDrive(car) ? <CarSpecItem icon={<IconDrive />} text={getDrive(car)} /> : null}
                        <CarSpecItem icon={<IconPower />} text={`${getPowerHP(car)} HP`} />
                      </div>

                      <div className="cars-item-meta">
                        {visibleChips.map((text) => (
                          <span key={text} className="cars-chip">{text}</span>
                        ))}
                        {remaining > 0 ? (
                          <button
                            type="button"
                            className="cars-chip cars-chip-more cars-chip-button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setExpandedTagsById((prev) => ({ ...prev, [car._id]: !isExpanded }));
                            }}
                          >
                            {isExpanded ? "Less" : `${remaining} more`}
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="cars-item-price">{priceText(car.price)}</div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        {isMakeOpen ? (
          <div className="cars-make-overlay" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsMakeOpen(false); }}>
            <div className="cars-make-modal">
              <div className="cars-make-header">
                <div className="cars-make-title">Select make</div>
                <div className="cars-make-actions">
                  <button type="button" className="cars-make-done" onClick={() => setIsMakeOpen(false)}>Done</button>
                  <button type="button" className="cars-make-close" onClick={() => setIsMakeOpen(false)}>×</button>
                </div>
              </div>
              <div className="cars-make-search">
                <span className="cars-make-search-icon" aria-hidden="true">⌕</span>
                <input value={makeQuery} onChange={(e) => setMakeQuery(e.target.value)} placeholder="Make or model" />
              </div>

              <div className="cars-make-section">
                <div className="cars-make-section-title">MOST SEARCHED TAGS</div>
                <div className="cars-make-tags">
                  {mostSearchedBrands.map((brand) => {
                    const logo = brandLogo(brand);
                    const active = selectedMakes.includes(brand);
                    return (
                      <button key={brand} type="button" className={`cars-make-tag ${active ? "active" : ""}`} onClick={() => toggleMake(brand)}>
                        {logo ? <img src={logo} alt={brand} /> : <span className="cars-make-tag-fallback">{brand.slice(0, 1).toUpperCase()}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="cars-make-section cars-make-list-wrap">
                <div className="cars-make-section-title">ALL BRANDS</div>
                <div className="cars-make-list">
                  <button type="button" className={`cars-make-row ${selectedMakes.length === 0 ? "active" : ""}`} onClick={() => { setSelectedMakes([]); setPage(1); }}>
                    <span className="cars-make-row-logo cars-make-row-fallback">A</span>
                    <span className="cars-make-row-name">All</span>
                  </button>
                  {filteredBrands.map((brand) => {
                    const logo = brandLogo(brand);
                    const active = selectedMakes.includes(brand);
                    return (
                      <button key={brand} type="button" className={`cars-make-row ${active ? "active" : ""}`} onClick={() => toggleMake(brand)}>
                        {logo ? <img className="cars-make-row-logo" src={logo} alt={brand} /> : <span className="cars-make-row-logo cars-make-row-fallback">{brand.slice(0, 1).toUpperCase()}</span>}
                        <span className="cars-make-row-name">{brand}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </>
  );
}

export default Cars;