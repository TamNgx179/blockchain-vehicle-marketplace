import { useState } from "react";
import SlideShow from "./SlideShow/SlideShow";
import Filter from "./Filter/Filter";
import CarList from "../../components/CarList/CarList";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import cars from "../../data/cars";
function Home() {
  // Default category
  const [type, setType] = useState("EV");

  // Filter cars by selected category
  const filteredCars = cars.filter(car => car.type === type);

  return (
    <>
      <Navbar />
      <SlideShow />
      <Filter type={type} setType={setType} />
      {/* Key forces pagination state reset when the filter changes */}
      <CarList key={type} cars={filteredCars} />
      <Footer />
    </>
  );
}

export default Home;
