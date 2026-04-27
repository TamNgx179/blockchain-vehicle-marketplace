import React, { useState, useImperativeHandle, forwardRef } from 'react';
import './Notification.css';

const Notification = forwardRef((props, ref) => {
  const [notifications, setNotifications] = useState([]);
  const duration = 3000;

  const show = (newMsg) => {
    const id = Date.now();

    setNotifications((prev) => [...prev, { id, msg: newMsg }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  };

  useImperativeHandle(ref, () => ({
    show,
    showNotification: (_title, message) => show(message || _title)
  }));

  return (
    <div className="notification-container">
      {notifications.map((notify) => (
        <div key={notify.id} className="notification-item">
          <div className="notification-content">
            <div className="notification-icon">
              <i className="fas fa-info-circle"></i>
            </div>
            <div className="notification-text">
              <span className="notification-title">System Message</span>
              <p className="notification-message">{notify.msg}</p>
            </div>
          </div>
          <div
            className="notification-progress"
            style={{ animationDuration: `${duration}ms` }}
          ></div>
        </div>
      ))}
    </div>
  );
});

export default Notification;
