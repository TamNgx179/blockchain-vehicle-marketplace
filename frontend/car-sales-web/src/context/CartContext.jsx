import { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Hàm thêm sản phẩm vào giỏ (có ngăn trùng lặp)
  const addToCart = (car) => {
    setCartItems((prevItems) => {
      // 1. Kiểm tra xem xe (car) này đã có trong giỏ hàng chưa dựa vào car.id
      const isCarInCart = prevItems.some((item) => item.id === car.id);

      if (isCarInCart) {
        // 2a. Nếu đã tồn tại, trả về mảng cũ mà không thay đổi gì cả
        // (Bạn có thể thêm thông báo cho người dùng tại đây nếu muốn)
        console.log(`Xe với ID ${car.id} đã có trong giỏ hàng.`);
        return prevItems;
      } else {
        // 2b. Nếu chưa tồn tại, thêm xe mới vào mảng
        return [...prevItems, car];
      }
    });
    console.log(cartItems);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng context nhanh hơn
export const useCart = () => useContext(CartContext);