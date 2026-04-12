import React, { useState, useImperativeHandle, forwardRef } from 'react';
import './Notification.css';

const Notification = forwardRef((props, ref) => {
  const [data, setData] = useState({ show: false, msg: "" });
  const duration = 3000;

  // Lộ hàm 'show' ra ngoài cho Cha gọi
  useImperativeHandle(ref, () => ({
    show: (newMsg) => {
      setData({ show: true, msg: newMsg });

      // Tự động đóng sau 3 giây
      setTimeout(() => {
        setData({ show: false, msg: "" });
      }, duration);
    }
  }));

  // Nếu không hiển thị thì trả về null (Xóa sổ khỏi DOM - display: none)
  if (!data.show) return null;

  return (
    <div className="notification-overlay">
      <div className="notification-content">
        <div className="notification-icon">
          <i className="fas fa-info-circle"></i>
        </div>
        <div className="notification-text">
          <span className="notification-title">System Message</span>
          <p className="notification-message">{data.msg}</p>
        </div>
      </div>
      {/* Thanh tiến trình chạy ngầm */}
      <div
        className="notification-progress"
        style={{ animationDuration: `${duration}ms` }}
      ></div>
    </div>
  );
});

export default Notification;