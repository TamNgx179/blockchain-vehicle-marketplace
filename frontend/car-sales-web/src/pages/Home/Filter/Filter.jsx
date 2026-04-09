import React from 'react';
import './Filter.css';

function Filter({ type, setType }) {
  // Danh sách các danh mục xe
  const categories = [
    { label: "EVs", value: "EV" },
    { label: "SUVs", value: "SUV" },
    { label: "Sedans", value: "Sedan" },
    { label: "Coupes", value: "Coupe" },
    { label: "Convertibles", value: "Convertible" }
  ];

  return (
    <div className="popular-container">
      <h1>Popular Categories</h1>
      <div className="popular">
        <div className="reveal active">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`category ${type === cat.value ? "active" : ""}`}
              onClick={() => setType(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Filter;
