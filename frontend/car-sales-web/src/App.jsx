import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import CarDetail from "./pages/CarDetail"
import Cars from "./pages/Cars"
import { CartProvider } from "./context/CartContext"; // Import nó vào
function App() {
  return (
    <CartProvider> {/* Bọc ở đây */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/product/:id" element={<CarDetail />} />

        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
