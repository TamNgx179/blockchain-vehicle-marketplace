import { createContext, useState, useContext, useEffect } from 'react';
import cartService from '../services/cartService'; // Import cái service mình vừa tạo

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Tự động đồng bộ giỏ hàng từ Backend khi load trang
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await cartService.getCart();
        const data = res.data;
        // Giả sử Backend trả về { items: [ { productId: {...}, quantity: 1 } ] }
        console.log("Cart data from server:", data);
        if (data && data.items) {
          const formattedItems = data.items
            .filter(item => item.productId) // Chỉ lấy những item có sản phẩm tồn tại
            .map(item => ({
              ...item.productId,
              quantity: item.quantity,
              _id: item.productId._id
            }));
          setCartItems(formattedItems);
        }
      } catch (error) {
        console.error("Không thể lấy giỏ hàng từ server:", error);
      } finally {
        setLoading(false); // Tắt loading dù thành công hay thất bại
      }
    };
    fetchCart();
  }, []);

  // 2. Thêm vào giỏ (Cập nhật cả UI và Backend)
  const addToCart = async (car) => {
    try {
      setLoading(true);
      // Gọi API lên Backend trước
      await cartService.addToCart(car._id, 1);

      // Sau đó cập nhật UI
      setCartItems((prev) => {
        const isExist = prev.find(item => item._id === car._id);
        if (isExist) {
          return prev.map(item => item._id === car._id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item);
        }
        return [...prev, { ...car, quantity: 1 }];
      });
      console.log("Đã đồng bộ 'Add to Cart' lên Backend");
    } catch (error) {
      alert("Lỗi khi thêm vào giỏ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Xóa sản phẩm
  const removeFromCart = async (id) => {
    try {
      await cartService.removeCartItem(id);
      setCartItems(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    }
  };

  // 4. Cập nhật số lượng
  const updateQuantity = async (id, amount) => {
    try {
      const item = cartItems.find(i => i._id === id);
      const newQty = Math.max(1, item.quantity + amount);

      await cartService.updateCartItem(id, newQty);

      setCartItems(prev => prev.map(item =>
        item._id === id ? { ...item, quantity: newQty } : item
      ));
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);