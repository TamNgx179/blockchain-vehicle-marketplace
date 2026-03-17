import React, { useState, useEffect } from 'react';
import CarCard from './CarCard/CarCard';
import './CarList.css';

function CarList({ cars }) {
  // Quản lý vị trí bắt đầu của 8 xe đang hiển thị
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 8;
  // QUAN TRỌNG: Reset về trang 1 mỗi khi danh sách xe thay đổi (do lọc)
  useEffect(() => {
    setStartIndex(0);
  }, [cars]);
  // Cắt mảng để chỉ lấy 8 xe tùy theo startIndex
  const visibleCars = cars.slice(startIndex, startIndex + itemsPerPage);

  const handleNext = () => {
    // Nếu còn xe phía sau thì mới cho chuyển
    if (startIndex + itemsPerPage < cars.length) {
      setStartIndex(startIndex + itemsPerPage);
    }
  };

  const handlePrev = () => {
    // Nếu đang ở trang sau thì cho quay về trang trước
    if (startIndex - itemsPerPage >= 0) {
      setStartIndex(startIndex - itemsPerPage);
    }
  };

  return (
    <div className="car-list-wrapper">
      <div className="car-list-container">
        <div className="car-list grid-4">
          {visibleCars.map((car, index) => (
            <CarCard
              key={car.id}
              car={car}
              /* Animation delay chạy từ 0 đến 0.35s cho 8 card */
              delay={index * 0.05}
            />
          ))}
        </div>
      </div>

      {/* Bộ điều hướng */}
      <div className="pagination-controls">
        <button
          onClick={handlePrev}
          disabled={startIndex === 0}
          className="nav-btn"
        >
          &lt; {/* Biểu tượng < */}
        </button>

        <span className="page-info">
          {Math.floor(startIndex / itemsPerPage) + 1} / {Math.ceil(cars.length / itemsPerPage)}
        </span>

        <button
          onClick={handleNext}
          disabled={startIndex + itemsPerPage >= cars.length}
          className="nav-btn"
        >
          &gt; {/* Biểu tượng > */}
        </button>
      </div>
    </div>
  );
}

export default CarList;