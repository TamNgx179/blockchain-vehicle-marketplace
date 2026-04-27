import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, CheckSquare, Clock3, Star, X } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import arrowIcon from "../../assets/icon/arrow.png";
import metalIcon from "../../assets/icon/metal.png";
import carAboutIcon from "../../assets/icon/car_about_us.png";
import customersIcon from "../../assets/icon/customers.png";
import vietnamIcon from "../../assets/icon/vietnam.png";
import carSaleIcon from "../../assets/icon/car-sale.png";
import maintenanceIcon from "../../assets/icon/maintenance.png";
import insuranceIcon from "../../assets/icon/insurance.png";
import "./About.css";

const stats = [
  { icon: metalIcon, value: "15+", label: "Years Experience" },
  { icon: carAboutIcon, value: "1,000", label: "Cars Sold" },
  { icon: customersIcon, value: "1,500", label: "Customers" },
  { icon: vietnamIcon, value: "20", label: "Provinces" },
];

const journeyItems = [
  {
    year: "2009",
    title: "SaigonSpeed begins",
    text: "We started with a simple promise: make car buying clearer, friendlier, and easier to trust.",
    image: "/images/bmw/bmw-m4/hero/m4-hero.webp",
  },
  {
    year: "2012",
    title: "First 100 cars sold",
    text: "Our early customers helped shape a buying experience built around transparent vehicle information.",
    image: "/images/toyota/toyota-camry/hero/camry-hero.webp",
  },
  {
    year: "2018",
    title: "Digital showroom launch",
    text: "We moved the showroom online so customers could compare cars, review details, and shop with confidence.",
    image: "/images/mercedes/mercedes-e350/hero/e350-hero.webp",
  },
  {
    year: "2021",
    title: "Secure order workflow",
    text: "Checkout, deposit tracking, and order status became part of one connected customer journey.",
    image: "/images/porsche/porsche-911-carrera/hero/carrera-hero.webp",
  },
  {
    year: "2024",
    title: "Blockchain-backed confidence",
    text: "We added blockchain order tracking so payment progress and showroom confirmation are easier to verify.",
    image: "/images/vinfast/vinfast-vf8/hero/vf8-hero.webp",
  },
];

const services = [
  {
    icon: carSaleIcon,
    title: "New Car Sales",
    text: "Explore our wide range of brand-new vehicles from top manufacturers.",
    detailText: "Complete details about our new car sales service.",
    image: "/images/bmw/bmw-m4/hero/m4-hero.webp",
    overview:
      "Discover your dream car with our extensive collection of brand-new vehicles from world-renowned manufacturers. Our experienced sales team is dedicated to helping you find the perfect vehicle that matches your lifestyle and budget.",
    offers: [
      "Wide selection of latest models from top brands",
      "Competitive financing options with flexible payment plans",
      "Expert consultation to match your needs and preferences",
      "Test drives available for all vehicles",
      "Trade-in evaluation and assistance",
      "Extended warranty packages available",
    ],
    benefits: [
      "Factory-fresh vehicles with latest safety features",
      "Full manufacturer warranty coverage",
      "Latest technology and fuel efficiency",
      "Personalized customer service experience",
      "Transparent pricing with no hidden fees",
    ],
    cta: "View cars and reviews",
    path: "/cars",
  },
  {
    icon: maintenanceIcon,
    title: "Maintenance & Repairs",
    text: "Professional servicing, repairs, and genuine spare parts for your vehicle.",
    detailText: "Keep your vehicle running smoothly with trusted service support.",
    image: "/images/gas-station.png",
    overview:
      "Our maintenance team helps protect your vehicle performance with scheduled care, diagnostics, repairs, and genuine parts. We focus on clear recommendations so you always understand what your car needs before work begins.",
    offers: [
      "Routine inspections and maintenance scheduling",
      "Engine, brake, battery, and tire service support",
      "Genuine parts guidance for compatible replacements",
      "Clear repair estimates before confirmation",
      "Service reminders for safer daily driving",
      "Support for warranty-related service questions",
    ],
    benefits: [
      "Reliable performance after every service visit",
      "Reduced risk of unexpected repair costs",
      "Transparent service notes and recommendations",
      "Convenient contact flow with our support team",
      "Better resale confidence through proper care",
    ],
    cta: "Contact service team",
    path: "/contact",
  },
  {
    icon: insuranceIcon,
    title: "Car Insurance",
    text: "Protect your car with comprehensive insurance plans that cover accidents, theft, and unexpected damages.",
    detailText: "Find practical protection options for your new vehicle.",
    image: "/images/honda/honda-cr-v/hero/crv-hero.webp",
    overview:
      "We help customers understand insurance options that fit their car, budget, and driving habits. From basic protection to broader coverage, our team can connect you with the right next step before you finalize ownership.",
    offers: [
      "Coverage consultation based on vehicle value",
      "Guidance for accident, theft, and damage protection",
      "Support comparing deductible and premium options",
      "Assistance preparing required vehicle information",
      "Renewal reminder and policy review support",
      "Claim guidance when unexpected events happen",
    ],
    benefits: [
      "More confidence after taking delivery",
      "Protection against costly unexpected incidents",
      "Simple explanation of coverage choices",
      "Flexible options for different ownership needs",
      "A smoother handoff from purchase to protection",
    ],
    cta: "Contact us for more information",
    path: "/contact",
  },
];

function About() {
  const aboutRef = useRef(null);
  const timelineRef = useRef(null);
  const [timelineVisible, setTimelineVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const element = timelineRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimelineVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.22 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedService) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedService(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedService]);

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Navbar />
      <main className="about-page">
        <section className="about-hero">
          <div className="about-hero-bg" />
          <div className="about-hero-content">
            <h1>Destination for affordable and reliable car</h1>
            <span>
              We are proud to be your destination for affordable and reliable cars.
              Our mission is simple: to make car ownership accessible to everyone
              by offering high-quality vehicles at prices that fit your budget.
              Reliability, trust, and transparency are the core values that guide
              everything we do.
            </span>
            <button type="button" onClick={scrollToAbout}>
              Learn more about us
              <img src={arrowIcon} alt="" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="about-intro" ref={aboutRef}>
          <div className="about-section-heading">
            <h2>About SaigonSpeed</h2>
            <span>
              We are dedicated to transforming the automotive industry in Vietnam through
              innovation, transparency, and unwavering commitment to customer satisfaction.
              Our mission is to make quality vehicles accessible to everyone.
            </span>
          </div>

          <div className="about-stats-grid">
            {stats.map((item) => (
              <article className="about-stat" key={item.label}>
                <img src={item.icon} alt="" aria-hidden="true" />
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section
          className={`about-journey ${timelineVisible ? "is-active" : ""}`}
          ref={timelineRef}
        >
          <div className="about-section-heading">
            <p>Our journey</p>
            <h2>From showroom trust to digital confidence</h2>
            <span>
              Every milestone has moved us closer to a simpler and more transparent
              car ownership experience.
            </span>
          </div>

          <div className="about-timeline">
            {journeyItems.map((item) => (
              <article className="about-timeline-item" key={item.title}>
                <div className="about-timeline-dot" />
                <div className="about-timeline-card">
                  <div>
                    <small>{item.year}</small>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                  <img src={item.image} alt={item.title} loading="lazy" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about-services">
          <div className="about-services-bg" />
          <div className="about-section-heading light">
            <h2>Our Services</h2>
            <span>
              We provide complete automotive solutions from sales to maintenance,
              ensuring quality, reliability, and customer satisfaction in every service.
            </span>
          </div>

          <div className="about-services-grid">
            {services.map((service) => (
              <article className="about-service-card" key={service.title}>
                <img src={service.icon} alt="" aria-hidden="true" />
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <button type="button" onClick={() => setSelectedService(service)}>
                  See more
                </button>
              </article>
            ))}
          </div>
        </section>

        {selectedService && (
          <div
            className="about-service-modal"
            role="presentation"
            onClick={() => setSelectedService(null)}
          >
            <article
              className="about-service-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="about-service-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="about-service-close"
                aria-label="Close service details"
                onClick={() => setSelectedService(null)}
              >
                <X size={24} />
              </button>

              <header className="about-service-dialog-header">
                <img src={selectedService.icon} alt="" aria-hidden="true" />
                <h2 id="about-service-title">{selectedService.title}</h2>
              </header>

              <div className="about-service-dialog-body">
                <p className="about-service-lead">{selectedService.detailText}</p>
                <img
                  className="about-service-detail-image"
                  src={selectedService.image}
                  alt={selectedService.title}
                />

                <section className="about-service-overview">
                  <div className="about-service-modal-title">
                    <Clock3 size={32} />
                    <h3>Overview</h3>
                  </div>
                  <p>{selectedService.overview}</p>
                </section>

                <section className="about-service-offers">
                  <div className="about-service-modal-title">
                    <CheckSquare size={32} />
                    <h3>What We Offer</h3>
                  </div>
                  <div className="about-service-offer-grid">
                    {selectedService.offers.map((offer) => (
                      <div className="about-service-offer" key={offer}>
                        <Check size={28} />
                        <span>{offer}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="about-service-benefits">
                  <div className="about-service-modal-title">
                    <Star size={38} fill="currentColor" />
                    <h3>Benefits</h3>
                  </div>
                  <div className="about-service-benefit-grid">
                    {selectedService.benefits.map((benefit) => (
                      <div className="about-service-benefit" key={benefit}>
                        <Star size={22} fill="currentColor" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <Link
                  className="about-service-modal-cta"
                  to={selectedService.path}
                  onClick={() => setSelectedService(null)}
                >
                  {selectedService.cta}
                  <ArrowRight size={22} />
                </Link>
              </div>
            </article>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default About;
