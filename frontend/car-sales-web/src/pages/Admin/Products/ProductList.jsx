import { useMemo, useState, useEffect } from "react"; // Thêm useEffect
import { Link } from "react-router-dom";
import ProductService from "../../../services/ProductService"; // Import Service bạn đã cung cấp
import "./ProductList.css";
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
    <div className="ProductList-dual-range" style={{ "--left": `${left}%`, "--right": `${right}%` }}>
      <input
        className="ProductList-dual-range-input"
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
        className="ProductList-dual-range-input"
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

function ProductListpecItem({ icon, text }) {
  return (
    <div className="ProductList-item-spec">
      <span className="ProductList-item-spec-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="ProductList-item-spec-text">{text}</span>
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

function ProductList() {
  const [ProductListList, setProductListList] = useState([]); // State lưu danh sách xe từ API
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
    const fetchProductList = async () => {
      try {
        const data = await ProductService.getAllProducts();
        setProductListList(data);
      } catch (error) {
        console.error("Error fetching ProductList:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductList();
  }, []);

  const brandList = useMemo(() => {
    const values = Array.from(new Set(ProductListList.map((c) => c.brand).filter(Boolean)));
    values.sort((a, b) => a.localeCompare(b));
    return values;
  }, [ProductListList]);

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
    const values = Array.from(new Set(ProductListList.map((c) => c.category).filter(Boolean)));
    values.sort((a, b) => a.localeCompare(b));
    return values;
  }, [ProductListList]);

  const allFeatures = useMemo(() => {
    const set = new Set();
    ProductListList.forEach((c) => {
      (Array.isArray(c.safety) ? c.safety : []).forEach((x) => set.add(x));
      (Array.isArray(c.convenience) ? c.convenience : []).forEach((x) => set.add(x));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [ProductListList]);

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

  const filteredProductList = useMemo(() => {
    return ProductListList.filter((c) => {
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
  }, [ProductListList, selectedMakes, priceMin, priceMax, transmission, fuel, powerMin, powerMax, vehicleType, selectedFeatures]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredProductList.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleProductList = filteredProductList.slice(startIndex, startIndex + pageSize);

  const heroCar = visibleProductList[0] || filteredProductList[0] || ProductListList[0];
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

  if (loading) return <div className="loading">Loading ProductList...</div>;

  return (
    <>
      <main className="ProductList-page">
        <section className="ProductList-hero">
          <div className="ProductList-hero-inner">
            <div className="ProductList-hero-text">
              <h1>Find your<br />favorite car</h1>
            </div>
            <div className="ProductList-hero-media">
              <img src={"/" + heroImage} alt="Hero car" loading="eager" decoding="async" />
            </div>
          </div>
        </section>

        <div className="ProductList-layout">
          <aside className="ProductList-sidebar">
            <div className="ProductList-filter-card">
              <div className="ProductList-filter-title">Filter</div>

              <div className="ProductList-filter-group">
                <div className="ProductList-filter-label">Car model</div>
                {selectedMakes.length > 0 ? (
                  <div className="ProductList-selected-makes">
                    {selectedMakes.map((brand) => {
                      const logo = brandLogo(brand);
                      return (
                        <div key={brand} className="ProductList-selected-make">
                          {logo ? (
                            <img className="ProductList-selected-make-logo" src={"/" + logo} alt={brand} />
                          ) : (
                            <span className="ProductList-selected-make-logo ProductList-selected-make-fallback">
                              {brand.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                          <div className="ProductList-selected-make-name">{brand}</div>
                          <button
                            type="button"
                            className="ProductList-selected-make-remove"
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
                <button type="button" className="ProductList-model-row ProductList-model-trigger" onClick={() => setIsMakeOpen(true)}>
                  <span className="ProductList-model-select">
                    <span className="ProductList-model-plus">+</span>
                    <span className="ProductList-model-value">Add a car</span>
                  </span>
                  <span className="ProductList-model-go" aria-hidden="true">›</span>
                </button>
              </div>

              <div className="ProductList-filter-group">
                <div className="ProductList-filter-label">Price</div>
                <div className="ProductList-filter-range-meta ProductList-filter-range-meta-top">
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

              <div className="ProductList-filter-group">
                <div className="ProductList-filter-label">Mileage (km)</div>
                <div className="ProductList-filter-range-meta ProductList-filter-range-meta-top">
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

              <div className="ProductList-filter-group">
                <div className="ProductList-filter-label">Transmission</div>
                <select className="ProductList-filter-select" value={transmission} onChange={(e) => { setTransmission(e.target.value); setPage(1); }}>
                  <option value="All">All</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div className="ProductList-filter-group">
                <div className="ProductList-filter-label">Fuel</div>
                <select className="ProductList-filter-select" value={fuel} onChange={(e) => { setFuel(e.target.value); setPage(1); }}>
                  <option value="All">All</option>
                  <option value="Gasoline">Gasoline</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>

              <div className="ProductList-filter-group">
                <div className="ProductList-filter-label">Power (HP)</div>
                <div className="ProductList-filter-range-meta ProductList-filter-range-meta-top">
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

              <div className="ProductList-filter-group">
                <div className="ProductList-filter-label">Vehicle type</div>
                <select className="ProductList-filter-select" value={vehicleType} onChange={(e) => { setVehicleType(e.target.value); setPage(1); }}>
                  <option value="All">All</option>
                  {typeCategories.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="ProductList-filter-group">
                <div className="ProductList-filter-label">Feature</div>
                <input
                  className="ProductList-filter-input"
                  value={featureQuery}
                  onChange={(e) => { setFeatureQuery(e.target.value); setShowAllFeatures(false); }}
                  placeholder="Search for feature"
                />
                <div className="ProductList-feature-list">
                  {visibleFeatures.map((feature) => {
                    const checked = selectedFeatures.includes(feature);
                    return (
                      <label key={feature} className="ProductList-feature-item">
                        <input type="checkbox" checked={checked} onChange={() => toggleFeature(feature)} />
                        <span>{feature}</span>
                      </label>
                    );
                  })}
                </div>
                {canShowMoreFeatures ? (
                  <button type="button" className="ProductList-feature-more" onClick={() => setShowAllFeatures(true)}>More feature</button>
                ) : null}
              </div>

              <button
                type="button"
                className="ProductList-filter-submit"
                onClick={() => {
                  setPage(1);
                  const el = document.getElementById("ProductList-results");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Detail search
              </button>
            </div>
          </aside>

          <section className="ProductList-results" id="ProductList-results">
            <div className="ProductList-results-header">
              <div className="ProductList-results-title">Available Car</div>
              <div className="ProductList-results-pager">
                <button type="button" className="ProductList-pager-btn" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
                <div className="ProductList-pager-pages">
                  {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} type="button" className={`ProductList-page-btn ${p === safePage ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                    );
                  })}
                </div>
                <button type="button" className="ProductList-pager-btn" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
              </div>
            </div>

            <div className="ProductList-results-subtitle">{filteredProductList.length} ProductList</div>

            <div className="ProductList-list">
              {visibleProductList.map((car) => {
                const chipItems = [...(Array.isArray(car.safety) ? car.safety : []), ...(Array.isArray(car.convenience) ? car.convenience : [])];
                const isExpanded = Boolean(expandedTagsById[car._id]);
                const visibleChips = isExpanded ? chipItems : chipItems.slice(0, 4);
                const remaining = Math.max(0, chipItems.length - 4);
                const cardImage = car.thumbnailImage || "/images/car.webp";

                return (
                  <div key={car._id} className="ProductList-item" >
                    <Link to={`/admin/productEdit/${car._id}`}>
                      <div className="ProductList-item-media">
                        <img src={"/" + cardImage} alt={car.name} loading="lazy" decoding="async" />
                      </div>
                    </Link>
                    <Link to={`/admin/productEdit/${car._id}`}>
                      <div className="ProductList-item-body">
                        <div className="ProductList-item-top">
                          <div className="ProductList-item-name">{car.name}</div>
                          <div className="ProductList-item-brand">
                            <span className="ProductList-item-brand-icon" aria-hidden="true"><IconPin /></span>
                            <span>{car.brand}</span>
                          </div>
                        </div>

                        <div className="ProductList-item-specs">
                          <ProductListpecItem icon={<IconYear />} text={`${new Date(car.createdAt).getFullYear()}`} />
                          <ProductListpecItem icon={<IconTransmission />} text={getTransmission(car)} />
                          <ProductListpecItem icon={<IconFuel />} text={getFuel(car)} />
                          {getDrive(car) ? <ProductListpecItem icon={<IconDrive />} text={getDrive(car)} /> : null}
                          <ProductListpecItem icon={<IconPower />} text={`${getPowerHP(car)} HP`} />
                        </div>

                        <div className="ProductList-item-meta">
                          {visibleChips.map((text) => (
                            <span key={text} className="ProductList-chip">{text}</span>
                          ))}
                          {remaining > 0 ? (
                            <button
                              type="button"
                              className="ProductList-chip ProductList-chip-more ProductList-chip-button"
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
                    </Link>
                    <div className="ProductList-item-price">
                      {priceText(car.price)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {isMakeOpen ? (
          <div className="ProductList-make-overlay" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsMakeOpen(false); }}>
            <div className="ProductList-make-modal">
              <div className="ProductList-make-header">
                <div className="ProductList-make-title">Select make</div>
                <div className="ProductList-make-actions">
                  <button type="button" className="ProductList-make-done" onClick={() => setIsMakeOpen(false)}>Done</button>
                  <button type="button" className="ProductList-make-close" onClick={() => setIsMakeOpen(false)}>×</button>
                </div>
              </div>
              <div className="ProductList-make-search">
                <span className="ProductList-make-search-icon" aria-hidden="true">⌕</span>
                <input value={makeQuery} onChange={(e) => setMakeQuery(e.target.value)} placeholder="Make or model" />
              </div>

              <div className="ProductList-make-section">
                <div className="ProductList-make-section-title">MOST SEARCHED TAGS</div>
                <div className="ProductList-make-tags">
                  {mostSearchedBrands.map((brand) => {
                    const logo = brandLogo(brand);
                    const active = selectedMakes.includes(brand);
                    return (
                      <button key={brand} type="button" className={`ProductList-make-tag ${active ? "active" : ""}`} onClick={() => toggleMake(brand)}>
                        {logo ? <img src={logo} alt={brand} /> : <span className="ProductList-make-tag-fallback">{brand.slice(0, 1).toUpperCase()}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="ProductList-make-section ProductList-make-list-wrap">
                <div className="ProductList-make-section-title">ALL BRANDS</div>
                <div className="ProductList-make-list">
                  <button type="button" className={`ProductList-make-row ${selectedMakes.length === 0 ? "active" : ""}`} onClick={() => { setSelectedMakes([]); setPage(1); }}>
                    <span className="ProductList-make-row-logo ProductList-make-row-fallback">A</span>
                    <span className="ProductList-make-row-name">All</span>
                  </button>
                  {filteredBrands.map((brand) => {
                    const logo = brandLogo(brand);
                    const active = selectedMakes.includes(brand);
                    return (
                      <button key={brand} type="button" className={`ProductList-make-row ${active ? "active" : ""}`} onClick={() => toggleMake(brand)}>
                        {logo ? <img className="ProductList-make-row-logo" src={logo} alt={brand} /> : <span className="ProductList-make-row-logo ProductList-make-row-fallback">{brand.slice(0, 1).toUpperCase()}</span>}
                        <span className="ProductList-make-row-name">{brand}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}

export default ProductList;