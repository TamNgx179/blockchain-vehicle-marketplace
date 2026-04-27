import { createContext, useState, useContext, useEffect } from 'react';
import cartService from '../services/cartService'; // Import cái service mình vừa tạo

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setCartItems([]);
        return;
      }

      try {
        const data = await cartService.getCart();
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
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          setCartItems([]);
          return;
        }
        console.error("Không thể lấy giỏ hàng từ server:", error);
      } finally {
        setLoading(false); // Tắt loading dù thành công hay thất bại
      }
    };
    fetchCart();

    const onAuthChange = () => fetchCart();
    window.addEventListener("auth-change", onAuthChange);
    return () => window.removeEventListener("auth-change", onAuthChange);
  }, []);

  // 2. Thêm vào giỏ (Cập nhật cả UI và Backend)
  const addToCart = async (car) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
        return;
      }
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
      const token = localStorage.getItem("authToken");
      if (!token) return;
      await cartService.removeCartItem(id);
      setCartItems(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    }
  };

  // 4. Cập nhật số lượng
  const updateQuantity = async (id, amount) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
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

  const removePurchasedItems = (ids = []) => {
    const purchasedIds = new Set((Array.isArray(ids) ? ids : [ids]).filter(Boolean));
    if (purchasedIds.size === 0) return;

    setCartItems(prev => prev.filter(item => !purchasedIds.has(item._id)));
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, removePurchasedItems, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
