// CartContext.jsx
import { createContext, useState, useContext } from 'react';
// 1. Tạo Context cho giỏ hàng
const CartContext = createContext();
// 2. Tạo Component Provider để bao bọc ứng dụng và
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (car) => {
    setCartItems((prev) => {
      const isExist = prev.find(item => item.id === car.id);
      if (isExist) {
        console.log(`-> Xe ID ${car.id} ĐÃ CÓ. Tiến hành tăng số lượng.`);
        return prev.map(item => item.id === car.id
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item);
      }
      console.log(`-> Xe ID ${car.id} CHƯA CÓ. Thêm mới vào giỏ với số lượng 1.`, cartItems);
      return [...prev, { ...car, quantity: 1 }];
    });
    console.log(cartItems);
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    console.log(`-> Đã xóa xe ID ${id} khỏi giỏ hàng.`, cartItems);
  };

  const updateQuantity = (id, amount) => {
    setCartItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
    ));
    console.log(`-> Đã cập nhật số lượng xe ID ${id} thêm ${amount}.`, cartItems);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);