import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import CarDetail from "./pages/CarDetail"
import Cars from "./pages/Cars"
import Checkout from './pages/Checkout/Checkout';
import { CartProvider } from "./context/CartContext"; // Import nó vào
import Notification from './components/Notification/Notification'
import { useRef } from "react";
function App() {
  const notifyRef = useRef();
  return (
    <CartProvider> {/* Bọc ở đây */}
      <Notification ref={notifyRef} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/product/:id" element={<CarDetail />} />
          <Route path="/checkout" element={<Checkout notifyRef={notifyRef} />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
