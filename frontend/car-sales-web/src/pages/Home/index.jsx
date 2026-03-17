import { useState } from "react";
import SlideShow from "./SlideShow/SlideShow";
import Filter from "./Filter/Filter";
import CarList from "../../components/CarList/CarList";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import cars from "../../data/cars";
function Home() {
  const [type, setType] = useState("EV"); // Mặc định chọn EV

  // Logic lọc xe: Nếu car.type trùng với state type thì giữ lại
  const filteredCars = cars.filter(car => car.type === type);

  return (
    <>
      <Navbar />
      <SlideShow />
      <Filter type={type} setType={setType} />
      <CarList cars={filteredCars} />
      <Footer />
    </>
  );
}

export default Home;