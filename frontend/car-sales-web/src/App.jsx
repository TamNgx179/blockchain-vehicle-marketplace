import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import CarDetail from "./pages/CarDetail"
import Cars from "./pages/Cars"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/product/:id" element={<CarDetail />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
