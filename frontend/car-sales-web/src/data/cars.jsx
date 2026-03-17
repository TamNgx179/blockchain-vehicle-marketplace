const cars = [
  {
    id: "BMW-X4",
    name: "BMW X4",
    brand: "BMW",
    type: "SUV",
    display: "/images/bmw/bmw-x4/X4-display.webp",
    priceUSD: 56000,
    hero: "/images/bmw/bmw-x4/X4-trans.webp",
    gallery: [
      "/images/bmw/bmw-x4/X4-img1.jpg",
      "/images/bmw/bmw-x4/X4-img2.jpg",
      "/images/bmw/bmw-x4/X4-img3.avif",
      "/images/bmw/bmw-x4/X4-img4.jpg"
    ],
    specs: {
      Model: "BMW X4",
      Engine: "3.0 L TwinPower Turbo inline-6 mild hybrid",
      Power: "360 HP",
      Torque: "500 Nm",
      Gear: "8-speed automatic",
      "Top Speed": "268 km/h",
      "Length x Width x Height": "4,754 x 1,938 x 1,621 mm",
      Weight: "1,998 kg",
      "Fuel Consumption": "8 L/100 km"
    },
    safety: [
      "ABS + EBD + Brake Assist",
      "Multiple airbags",
      "Lane Keeping Assist / Lane Departure Warning"
    ],
    convenience: [
      "Power / electric seats with memory function",
      "Multi-zone automatic climate control",
      "Infotainment touchscreen + digital instrument cluster"
    ]
  },

  {
    id: "BMW-X5",
    name: "BMW X5",
    brand: "BMW",
    type: "SUV",
    display: "/images/bmw/bmw-x5/X5-display.webp",
    priceUSD: 68000,
    hero: "/images/bmw/bmw-x5/X5-trans.webp",
    gallery: [
      "/images/bmw/bmw-x5/X5-img1.avif",
      "/images/bmw/bmw-x5/X5-img2.avif",
      "/images/bmw/bmw-x5/X5-img3.avif",
      "/images/bmw/bmw-x5/X5-img4.avif"
    ],
    specs: {
      Model: "BMW X5",
      Engine: "3.0 L TwinPower Turbo inline-6 + 48-Volt mild-hybrid",
      Power: "381 HP",
      Torque: "540 Nm",
      Gear: "8-speed automatic",
      "Top Speed": "250 km/h",
      "Length x Width x Height": "4,935 x 2,004 x 1,765 mm",
      Weight: "2,240 kg",
      "Fuel Consumption": "9.9-8.5 L/100 km"
    },
    safety: [
      "ABS + EBD + Brake Assist",
      "Multiple airbags",
      "Lane Keeping Assist / Lane Departure Warning"
    ],
    convenience: [
      "Power / electric seats with memory function",
      "Multi-zone automatic climate control",
      "Infotainment touchscreen + digital instrument cluster"
    ]
  },

  {
    id: "BMW-X6",
    name: "BMW X6",
    brand: "BMW",
    type: "SUV",
    display: "/images/bmw/bmw-x6/X6-display.webp",
    priceUSD: 77000,
    hero: "/images/bmw/bmw-x6/X6-trans.webp",
    gallery: [
      "/images/bmw/bmw-x6/X6-img1.avif",
      "/images/bmw/bmw-x6/X6-img2.avif",
      "/images/bmw/bmw-x6/X6-img3.avif",
      "/images/bmw/bmw-x6/X6-img4.avif"
    ],
    specs: {
      Model: "BMW X6",
      Engine: "3.0 L TwinPower Turbo inline-6 with 48V mild hybrid",
      Power: "381 HP",
      Torque: "540 Nm",
      Gear: "8-speed automatic",
      "Top Speed": "250 km/h",
      "Length x Width x Height": "4,935 x 2,015 x 1,695 mm",
      Weight: "2,070 kg",
      "Fuel Consumption": "8.8 L/100 km"
    },
    safety: [
      "ABS + EBD + Brake Assist",
      "Multiple airbags",
      "Lane Keeping Assist / Lane Departure Warning"
    ],
    convenience: [
      "Power / electric seats with memory function",
      "Multi-zone automatic climate control",
      "Infotainment touchscreen + digital instrument cluster"
    ]
  },

  {
    id: "BMW-i5-Sedan",
    name: "BMW i5",
    brand: "BMW",
    type: "Sedan",
    display: "/images/bmw/bmw-i5/i5-display.webp",
    priceUSD: 68000,
    hero: "/images/bmw/bmw-i5/i5-trans.webp",
    gallery: [
      "/images/bmw/bmw-i5/i5-img1.png",
      "/images/bmw/bmw-i5/i5-img2.png",
      "/images/bmw/bmw-i5/i5-img3.png",
      "/images/bmw/bmw-i5/i5-img4.png"
    ],
    specs: {
      Model: "BMW i5",
      Engine: "Fully electric",
      Power: "340 HP",
      Torque: "400 Nm",
      Gear: "1-speed automatic",
      "Top Speed": "190-193 km/h",
      "Battery Capacity": "81.2 kWh",
      "Length x Width x Height": "5,060 x 1,900 x 1,515 mm",
      Weight: "2,205 kg",
      "Fuel Consumption": "8.8 L/100 km"
    },
    safety: [
      "Automated Emergency Braking with Pedestrian Detection",
      "Blind-Spot Monitoring",
      "Lane Keeping Assist / Lane Departure Warning"
    ],
    convenience: [
      "BMW Curved Display",
      "BMW iDrive (version ~8.5) interface, over-the-air updates",
      "Wireless smartphone charging pad"
    ]
  },
  {
    id: "Honda-Accord",
    name: "Honda Accord",
    brand: "Honda",
    type: "Sedan",
    display: "/images/honda/accord/accord-display.webp",
    priceUSD: 29000,
    hero: "/images/honda/accord/accord-trans.webp",
    gallery: [
      "/images/honda/accord/accord-img1.avif",
      "/images/honda/accord/accord-img2.avif",
      "/images/honda/accord/accord-img3.avif",
      "/images/honda/accord/accord-img4.png"
    ],
    specs: {
      Model: "Honda Accord",
      Engine: "1.5-L turbocharged VTEC® 4-cylinder",
      Power: "192 HP",
      Torque: "260 Nm",
      Gear: "CVT automatic",
      "Top Speed": "232 km/h",
      "Length x Width x Height": "4,972 x 1,863 x 1,450 mm",
      Weight: "1,469 kg",
      "Fuel Consumption": "7.35 L/100 km"
    },
    safety: [
      "Collision Mitigation Braking System",
      "Forward Collision Warning",
      "Lane Departure Warning"
    ],
    convenience: [
      "Dual-zone automatic climate control",
      "Rear A/C vents",
      "Keyless entry, remote engine start"
    ]
  },
  {
    id: "Honda-Civic",
    name: "Honda Civic",
    brand: "Honda",
    type: "Sedan",
    display: "/images/honda/civic/civic-display.webp",
    priceUSD: 27000,
    hero: "/images/honda/civic/civic-trans.webp",
    gallery: [
      "/images/honda/civic/civic-img1.jpg",
      "/images/honda/civic/civic-img2.jpg",
      "/images/honda/civic/civic-img3.jpg",
      "/images/honda/civic/civic-img4.jpg"
    ],
    specs: {
      Model: "Honda Civic",
      Engine: "2.0-L naturally aspirated inline-4",
      Power: "158 HP",
      Torque: "187 Nm",
      Gear: "CVT automatic",
      "Top Speed": "210 km/h",
      "Length x Width x Height": "4,547 x 1,800 x 1,415 mm",
      Weight: "1,350 kg",
      "Fuel Consumption": "6.9 L/100 km"
    },
    safety: [
      "Advanced Compatibility Engineering",
      "Multiple airbags",
      "Lane Departure Warning"
    ],
    convenience: [
      "Dual-zone automatic climate control",
      "Push button start and Smart Entry with Walk Away Auto Lock",
      "Power-adjustable driver's seat with lumbar support"
    ]
  },
  {
    id: "Honda-HR-V",
    name: "Honda HR-V",
    brand: "Honda",
    type: "SUV",
    display: "/images/honda/HR-V/HRV-display.webp",
    priceUSD: 26000,
    hero: "/images/honda/HR-V/HRV-trans.webp",
    gallery: [
      "/images/honda/HR-V/HRV-img1.avif",
      "/images/honda/HR-V/HRV-img2.avif",
      "/images/honda/HR-V/HRV-img3.avif",
      "/images/honda/HR-V/HRV-img4.avif"
    ],
    specs: {
      Model: "Honda HR-V",
      Engine: "1.5 L i-VTEC",
      Power: "180 HP",
      Torque: "187 Nm",
      Gear: "CVT automatic",
      "Top Speed": "185 km/h",
      "Length x Width x Height": "4,400 x 1,800 x 1,580 mm",
      Weight: "1,433 kg",
      "Fuel Consumption": "6.7 L/100 km"
    },
    safety: [
      "Collision Mitigation Braking System",
      "Forward Collision Warning",
      "Lane Departure Warning"
    ],
    convenience: [
      "Touchscreen display",
      "Apple CarPlay & Android Auto",
      "Digital or semi-digital driver display"
    ]
  },
  {
    id: "Honda-CR-V",
    name: "Honda CR-V",
    brand: "Honda",
    type: "SUV",
    display: "/images/honda/CR-V/CRV-display.webp",
    priceUSD: 32000,
    hero: "/images/honda/CR-V/CRV-trans.webp",
    gallery: [
      "/images/honda/CR-V/CRV-img1.avif",
      "/images/honda/CR-V/CRV-img2.avif",
      "/images/honda/CR-V/CRV-img3.avif",
      "/images/honda/CR-V/CRV-img4.avif"
    ],
    specs: {
      Model: "Honda CR-V",
      Engine: "1.5 L turbocharged I4",
      Power: "190 HP",
      Torque: "243 Nm",
      Gear: "CVT automatic",
      "Top Speed": "185 km/h",
      "Length x Width x Height": "4,694 x 1,866 x 1,682 mm",
      Weight: "1,767 kg",
      "Fuel Consumption": "7.8 L/100 km"
    },
    safety: [
      "Collision Mitigation Braking System",
      "Forward Collision Warning",
      "Lane Departure Warning"
    ],
    convenience: [
      "Dual-zone automatic climate control",
      "Push button start and Smart Entry with Walk Away Auto Lock",
      "Power-adjustable driver's seat with memory function"
    ]
  },
  {
    id: "Mercedes-GLS450",
    name: "Mercedes GLS450",
    brand: "Mercedes",
    type: "SUV",
    display: "/images/mercedes/GLS450/GLS450-display.webp",
    priceUSD: 91000,
    hero: "/images/mercedes/GLS450/GLS450-trans.png",
    gallery: [
      "/images/mercedes/GLS450/GLS450-img1.avif",
      "/images/mercedes/GLS450/GLS450-img2.avif",
      "/images/mercedes/GLS450/GLS450-img3.avif",
      "/images/mercedes/GLS450/GLS450-img4.avif"
    ],
    specs: {
      Model: "Mercedes GLS450",
      Engine: "3.0L Inline-6 turbocharged with EQ Boost",
      Power: "375 HP",
      Torque: "500 Nm",
      Gear: "9-TRONIC automatic",
      "Top Speed": "250 km/h",
      "Length x Width x Height": "5,207 x 1,956 x 1,823 mm",
      Weight: "2,480 kg",
      "Fuel Consumption": "10 L/100 km"
    },
    safety: [
      "Active Brake Assist",
      "Blind Spot Assist with exit warning",
      "Attention Assist"
    ],
    convenience: [
      "MBUX infotainment with dual 12.3-inch displays",
      "Intelligent voice assistant",
      "Infotainment touchscreen + digital instrument cluster"
    ]
  },
  {
    id: "Mercedes-GLS600",
    name: "Mercedes Maybach GLS600",
    brand: "Mercedes",
    type: "SUV",
    display: "/images/mercedes/GLS600/GLS600-display.webp",
    priceUSD: 180000,
    hero: "/images/mercedes/GLS600/GLS600-trans.webp",
    gallery: [
      "/images/mercedes/GLS600/GLS600-img1.avif",
      "/images/mercedes/GLS600/GLS600-img2.avif",
      "/images/mercedes/GLS600/GLS600-img3.avif",
      "/images/mercedes/GLS600/GLS600-img4.avif"
    ],
    specs: {
      Model: "Mercedes Maybach GLS600",
      Engine: "4.0L V8 Biturbo with EQ Boost",
      Power: "557 HP",
      Torque: "730 Nm",
      Gear: "9-TRONIC automatic",
      "Top Speed": "250 km/h",
      "Length x Width x Height": "5,205 x 2,030 x 1,838 mm",
      Weight: "2,900 kg",
      "Fuel Consumption": "12 L/100 km"
    },
    safety: [
      "Active Distance Assist DISTRONIC",
      "Active Steering Assist & Lane Keeping Assist",
      "Active Brake Assist with cross-traffic function"
    ],
    convenience: [
      "MBUX infotainment with dual 12.3-inch displays",
      "MBUX High-End Rear Entertainment with dual 11.6-inch touchscreens & MBUX tablet",
      "Burmester High-End 3D Surround Sound System"
    ]
  },
  {
    id: "Mercedes-S680",
    name: "Mercedes Maybach S680",
    brand: "Mercedes",
    type: "Sedan",
    display: "/images/mercedes/MaybachS680/S680-display.webp",
    priceUSD: 241000,
    hero: "/images/mercedes/MaybachS680/S680-trans.webp",
    gallery: [
      "/images/mercedes/MaybachS680/S680-img1.avif",
      "/images/mercedes/MaybachS680/S680-img2.avif",
      "/images/mercedes/MaybachS680/S680-img3.avif",
      "/images/mercedes/MaybachS680/S680-img4.avif"
    ],
    specs: {
      Model: "Mercedes Maybach S680",
      Engine: "6.0L V12 Biturbo",
      Power: "612 HP",
      Torque: "900 Nm",
      Gear: "9-TRONIC automatic",
      "Top Speed": "250 km/h",
      "Length x Width x Height": "5,469 x 1,921 x 1,510 mm",
      Weight: "2,350 kg",
      "Fuel Consumption": "13 L/100 km"
    },
    safety: [
      "Active Distance Assist DISTRONIC",
      "Active Steering Assist & Lane Keeping Assist",
      "Active Lane Change Assist"
    ],
    convenience: [
      "MBUX infotainment system with multiple displays",
      "MBUX High-End Rear Entertainment System with dual 11.6-inch touchscreens + MBUX tablet in armrest",
      "Burmester High-End 4D Surround Sound System"
    ]
  },
  {
    id: "Mercedes-E350",
    name: "Mercedes E350",
    brand: "Mercedes",
    type: "Sedan",
    display: "/images/mercedes/E350/E350-display.webp",
    priceUSD: 64000,
    hero: "/images/mercedes/E350/E350-trans.webp",
    gallery: [
      "/images/mercedes/E350/E350-img1.avif",
      "/images/mercedes/E350/E350-img2.avif",
      "/images/mercedes/E350/E350-img3.avif",
      "/images/mercedes/E350/E350-img4.avif"
    ],
    specs: {
      Model: "Mercedes E350",
      Engine: "2.0L Inline-4 turbocharged with mild hybrid",
      Power: "255 HP",
      Torque: "370 Nm",
      Gear: "9-TRONIC automatic",
      "Top Speed": "250 km/h",
      "Length x Width x Height": "4,935 x 1,880 x 1,460 mm",
      Weight: "1,850 kg",
      "Fuel Consumption": "7.5 L/100 km"
    },
    safety: [
      "Active Brake Assist",
      "Attention Assist",
      "Blind Spot Assist with exit warning function"
    ],
    convenience: [
      "MBUX infotainment system with dual widescreen displays",
      "Touch control steering wheel + voice control",
      "Apple CarPlay & Android Auto"
    ]
  },
  {
    id: "Mercedes-AMGS63",
    name: "Mercedes AMG S63",
    brand: "Mercedes",
    type: "Sedan",
    display: "/images/mercedes/AMGS63/AMGS63-display.webp",
    priceUSD: 187000,
    hero: "/images/mercedes/AMGS63/AMGS63-trans.webp",
    gallery: [
      "/images/mercedes/AMGS63/AMGS63-img1.avif",
      "/images/mercedes/AMGS63/AMGS63-img2.avif",
      "/images/mercedes/AMGS63/AMGS63-img3.avif",
      "/images/mercedes/AMGS63/AMGS63-img4.avif"
    ],
    specs: {
      Model: "Mercedes AMG S63",
      Engine: "4.0L V8 Biturbo with AMG-specific hybrid system",
      Power: "204 HP",
      Torque: "1,430 Nm",
      Gear: "9-speed multi-clutch automatic",
      "Top Speed": "250 km/h",
      "Length x Width x Height": "5,328 x 1,954 x 1,503 mm",
      Weight: "2,595 kg",
      "Fuel Consumption": "4.4 L/100 km"
    },
    safety: [
      "Active Distance Assist DISTRONIC",
      "Active Steering Assist & Active Lane Keeping Assist",
      "Active Brake Assist with cross-traffic function"
    ],
    convenience: [
      "MBUX infotainment with AMG-specific performance displays",
      "MBUX High-End Rear Entertainment System with dual touchscreens",
      "Burmester 4D Surround Sound System"
    ]
  },
  {
    id: "Mercedes-EQE350",
    name: "Mercedes EQE350",
    brand: "Mercedes",
    type: "EV",
    display: "/images/mercedes/EQE350/EQE350-display.webp",
    priceUSD: 78000,
    hero: "/images/mercedes/EQE350/EQE350-trans.webp",
    gallery: [
      "/images/mercedes/EQE350/EQE350-img1.avif",
      "/images/mercedes/EQE350/EQE350-img2.jpg",
      "/images/mercedes/EQE350/EQE350-img3.jpg",
      "/images/mercedes/EQE350/EQE350-img4.jpg"
    ],
    specs: {
      Model: "Mercedes EQE350",
      Engine: "Electric motor",
      Power: "288 HP",
      Torque: "765 Nm",
      Gear: "single-speed automatic",
      "Top Speed": "250 km/h",
      "Battery capacity": "96.8 kWh",
      "Length x Width x Height": "4,946 x 1,961 x 1,512 mm",
      Weight: "2,500 kg",
      "Fuel Consumption": "18 kWh/100 km"
    },
    safety: [
      "Active Distance Assist DISTRONIC",
      "Active Steering Assist & Active Lane Keeping Assist",
      "Active Brake Assist with cross-traffic function"
    ],
    convenience: [
      "MBUX infotainment system with 12.8-inch OLED central touchscreen",
      "Optional MBUX Hyperscreen",
      "Augmented Reality Navigation & Head-Up Display"
    ]
  },
  {
    id: "Mercedes-EQS",
    name: "Mercedes EQS",
    brand: "Mercedes",
    type: "EV",
    display: "/images/mercedes/EQS/EQS-display.webp",
    priceUSD: 108000,
    hero: "/images/mercedes/EQS/EQS-trans.webp",
    gallery: [
      "/images/mercedes/EQS/EQS-img1.jpg",
      "/images/mercedes/EQS/EQS-img2.jpg",
      "/images/mercedes/EQS/EQS-img3.jpg",
      "/images/mercedes/EQS/EQS-img4.jpg"
    ],
    specs: {
      Model: "Mercedes EQS",
      Engine: "Electric motor",
      Power: "402 HP",
      Torque: "855 Nm",
      Gear: "single-speed automatic",
      "Top Speed": "250 km/h",
      "Battery capacity": "107.8 kWh",
      "Length x Width x Height": "5,216 x 1,926 x 1,512 mm",
      Weight: "2,480 kg",
      "Fuel Consumption": "20.4 kWh/100 km"
    },
    safety: [
      "Active Distance Assist DISTRONIC",
      "Active Steering Assist & Active Lane Keeping Assist",
      "Active Brake Assist with cross-traffic function"
    ],
    convenience: [
      "MBUX Hyperscreen",
      "Standard MBUX infotainment with voice assistant",
      "Augmented reality head-up display"
    ]
  },
  {
    id: "Porsche-718-Cayman",
    name: "Porsche 718 Cayman",
    brand: "Porsche",
    type: "Coupe",
    display: "/images/porsche/cayman/cayman-display.webp",
    priceUSD: 70000,
    hero: "/images/porsche/cayman/cayman-trans.webp",
    gallery: [
      "/images/porsche/cayman/cayman-img1.jpg",
      "/images/porsche/cayman/cayman-img2.jpg",
      "/images/porsche/cayman/cayman-img3.jpg",
      "/images/porsche/cayman/cayman-img4.jpg"
    ],
    specs: {
      Model: "718 Cayman",
      Engine: "2.0 L turbocharged flat-4",
      Power: "300 HP",
      Torque: "380 Nm",
      Gear: "7-speed PDK",
      "Top Speed": "275 km/h",
      "Length x Width x Height": "4,379 x 1,801 x 1,295 mm",
      Weight: "1,365 kg",
      "Fuel Consumption": "8.1 L/100 km"
    },
    safety: [
      "ABS + EBD + Brake Assist",
      "Multiple airbags",
      "Stability and Traction Control (PSM)"
    ],
    convenience: [
      "Power sport seats with memory",
      "Dual-zone automatic climate control",
      "Porsche Communication Management (PCM) touchscreen"
    ]
  },
  {
    id: "Porsche-718-Boxster",
    name: "Porsche 718 Boxster",
    brand: "Porsche",
    type: "Convertible",
    display: "/images/porsche/boxster/boxster-display.webp",
    priceUSD: 72000,
    hero: "/images/porsche/boxster/boxster-trans.webp",
    gallery: [
      "/images/porsche/boxster/boxster-img1.jpg",
      "/images/porsche/boxster/boxster-img2.jpg",
      "/images/porsche/boxster/boxster-img3.jpg",
      "/images/porsche/boxster/boxster-img4.jpg"
    ],
    specs: {
      Model: "718 Boxster",
      Engine: "2.0 L turbocharged flat-4",
      Power: "300 HP",
      Torque: "380 Nm",
      Gear: "7-speed PDK",
      "Top Speed": "275 km/h",
      "Length x Width x Height": "4,379 x 1,801 x 1,281 mm",
      Weight: "1,375 kg",
      "Fuel Consumption": "8.4 L/100 km"
    },
    safety: [
      "ABS + EBD + Brake Assist",
      "Multiple airbags",
      "Stability and Traction Control (PSM)"
    ],
    convenience: [
      "Electric soft top operation",
      "Dual-zone automatic climate control",
      "PCM with Apple CarPlay"
    ]
  },
  {
    id: "Porsche-911-Carrera",
    name: "Porsche 911 Carrera",
    brand: "Porsche",
    type: "Coupe",
    display: "/images/porsche/carrera/carrera-display.webp",
    priceUSD: 116000,
    hero: "/images/porsche/carrera/carrera-trans.webp",
    gallery: [
      "/images/porsche/carrera/carrera-img1.avif",
      "/images/porsche/carrera/carrera-img2.avif",
      "/images/porsche/carrera/carrera-img3.avif",
      "/images/porsche/carrera/carrera-img4.avif"
    ],
    specs: {
      Model: "911 Carrera",
      Engine: "3.0 L twin-turbo flat-6",
      Power: "390 HP",
      Torque: "450 Nm",
      Gear: "8-speed PDK",
      "Top Speed": "293 km/h",
      "Length x Width x Height": "4,519 x 1,852 x 1,298 mm",
      Weight: "1,580 kg",
      "Fuel Consumption": "10.0 L/100 km"
    },
    safety: [
      "ABS + EBD + Brake Assist",
      "Lane Departure Warning",
      "ParkAssist with rear camera"
    ],
    convenience: [
      "Heated power seats with memory",
      "Three-zone automatic climate control",
      "PCM with online navigation"
    ]
  },
  {
    id: "Porsche-911-Turbo",
    name: "Porsche 911 Turbo",
    brand: "Porsche",
    type: "Coupe",
    display: "/images/porsche/turbo/turbo-display.webp",
    priceUSD: 230000,
    hero: "/images/porsche/turbo/turbo-trans.webp",
    gallery: [
      "/images/porsche/turbo/turbo-img1.avif",
      "/images/porsche/turbo/turbo-img2.avif",
      "/images/porsche/turbo/turbo-img3.avif",
      "/images/porsche/turbo/turbo-img4.avif"
    ],
    specs: {
      Model: "911 Turbo ",
      Engine: "3.8 L twin-turbo flat-6",
      Power: "640 HP",
      Torque: "800 Nm",
      Gear: "8-speed PDK",
      "Top Speed": "330 km/h",
      "Length x Width x Height": "4,535 x 2,024 x 1,303 mm",
      Weight: "1,640 kg",
      "Fuel Consumption": "11.1 L/100 km"
    },
    safety: [
      "Porsche Ceramic Composite Brakes (PCCB)",
      "Adaptive cruise control with stop & go",
      "Lane Keep Assist"
    ],
    convenience: [
      "Adaptive sport seats (18-way)",
      "Burmester premium audio (optional)",
      "Front axle lift system"
    ]
  },
  {
    id: "Porsche-911-GT3",
    name: "Porsche 911 GT3",
    brand: "Porsche",
    type: "Coupe",
    display: "/images/porsche/gt3/gt3-display.webp",
    priceUSD: 180000,
    hero: "/images/porsche/gt3/gt3-trans.webp",
    gallery: [
      "/images/porsche/gt3/gt3-img1.avif",
      "/images/porsche/gt3/gt3-img2.avif",
      "/images/porsche/gt3/gt3-img3.avif",
      "/images/porsche/gt3/gt3-img4.avif"
    ],
    specs: {
      Model: "911 GT3",
      Engine: "4.0 L naturally aspirated flat-6",
      Power: "510 HP",
      Torque: "470 Nm",
      Gear: "7-speed PDK",
      "Top Speed": "318 km/h",
      "Length x Width x Height": "4,573 x 1,852 x 1,279 mm",
      Weight: "1,435 kg",
      "Fuel Consumption": "13.0 L/100 km"
    },
    safety: [
      "Porsche Stability Management (track mode)",
      "PCCB (optional)",
      "Roll-over protection system (club sport package)"
    ],
    convenience: [
      "Lightweight bucket seats",
      "Drive mode selector (Normal/Sport/Track)",
      "PCM with track telemetry (optional)"
    ]
  },
  {
    id: "Porsche-Panamera",
    name: "Porsche Panamera",
    brand: "Porsche",
    type: "Sedan",
    display: "/images/porsche/panamera/panamera-display.webp",
    priceUSD: 100000,
    hero: "/images/porsche/panamera/panamera-trans.webp",
    gallery: [
      "/images/porsche/panamera/panamera-img1.avif",
      "/images/porsche/panamera/panamera-img2.avif",
      "/images/porsche/panamera/panamera-img3.avif",
      "/images/porsche/panamera/panamera-img4.avif"
    ],
    specs: {
      Model: "Panamera",
      Engine: "2.9 L twin-turbo V6",
      Power: "350 HP",
      Torque: "500 Nm",
      Gear: "8-speed PDK",
      "Top Speed": "270 km/h",
      "Length x Width x Height": "5,049 x 1,937 x 1,423 mm",
      Weight: "1,870 kg",
      "Fuel Consumption": "9.4 L/100 km"
    },
    safety: [
      "Multiple airbags",
      "Lane Keeping Assist",
      "Night Vision Assist (optional)"
    ],
    convenience: [
      "Four-zone automatic climate control",
      "Rear executive seating package (optional)",
      "PCM with dual 12-inch displays"
    ]
  },
  {
    id: "Porsche-Macan",
    name: "Porsche Macan",
    brand: "Porsche",
    type: "SUV",
    display: "/images/porsche/macan/macan-display.webp",
    priceUSD: 62000,
    hero: "/images/porsche/macan/macan-trans.webp",
    gallery: [
      "/images/porsche/macan/macan-img1.avif",
      "/images/porsche/macan/macan-img2.jpg",
      "/images/porsche/macan/macan-img3.jpg",
      "/images/porsche/macan/macan-img4.jpg"
    ],
    specs: {
      Model: "Macan",
      Engine: "2.0 L turbocharged inline-4",
      Power: "265 HP",
      Torque: "400 Nm",
      Gear: "7-speed PDK",
      "Top Speed": "232 km/h",
      "Length x Width x Height": "4,726 x 1,922 x 1,606 mm",
      Weight: "1,865 kg",
      "Fuel Consumption": "10.5 L/100 km"
    },
    safety: [
      "ABS + EBD + Brake Assist",
      "Lane Departure Warning",
      "Front & rear ParkAssist"
    ],
    convenience: [
      "10.9-inch PCM touchscreen",
      "Power tailgate",
      "Tri-zone climate control"
    ]
  },
  {
    id: "Porsche-Macan-Electric",
    name: "Porsche Macan Electric",
    brand: "Porsche",
    type: "EV",
    display: "/images/porsche/macan/macan-display.webp",
    priceUSD: 80000,
    hero: "/images/porsche/macan/macan-trans.webp",
    gallery: [
      "/images/porsche/macan/macan-img1.avif",
      "/images/porsche/macan/macan-img2.jpg",
      "/images/porsche/macan/macan-img3.jpg",
      "/images/porsche/macan/macan-img4.jpg"
    ],
    specs: {
      Model: "Macan Electric",
      Engine: "Dual-motor all-wheel drive (BEV)",
      Power: "402 HP",
      Torque: "650 Nm",
      Gear: "1-speed automatic",
      "Top Speed": "220 km/h",
      "Battery Capacity": "95 kWh",
      "Length x Width x Height": "4,784 x 1,938 x 1,622 mm",
      Weight: "2,300 kg",
      "Fuel Consumption": "20.5 kWh/100 km"
    },
    safety: [
      "Active lane keep & lane change assist",
      "360° camera",
      "Automatic emergency braking"
    ],
    convenience: [
      "Fast DC charging capability",
      "Heated/ventilated front seats",
      "Wireless Apple CarPlay & Android Auto"
    ]
  },
  {
    id: "Porsche-Cayenne",
    name: "Porsche Cayenne",
    brand: "Porsche",
    type: "SUV",
    display: "/images/porsche/cayenne/cayenne-display.webp",
    priceUSD: 80000,
    hero: "/images/porsche/cayenne/cayenne-trans.webp",
    gallery: [
      "/images/porsche/cayenne/cayenne-img1.avif",
      "/images/porsche/cayenne/cayenne-img2.avif",
      "/images/porsche/cayenne/cayenne-img3.avif",
      "/images/porsche/cayenne/cayenne-img4.avif"
    ],
    specs: {
      Model: "Cayenne",
      Engine: "3.0 L turbocharged V6",
      Power: "348 HP",
      Torque: "500 Nm",
      Gear: "8-speed Tiptronic S",
      "Top Speed": "248 km/h",
      "Length x Width x Height": "4,918 x 1,983 x 1,696 mm",
      Weight: "2,090 kg",
      "Fuel Consumption": "10.8 L/100 km"
    },
    safety: [
      "Multiple airbags",
      "Porsche InnoDrive with ACC (optional)",
      "Night Vision Assist (optional)"
    ],
    convenience: [
      "Air suspension (optional)",
      "Panoramic roof system",
      "PCM touchscreen with voice control"
    ]
  },
  {
    id: "Porsche-Taycan-4S",
    name: "Porsche Taycan 4S",
    brand: "Porsche",
    type: "EV",
    display: "/images/porsche/taycan/taycan-display.webp",
    priceUSD: 110000,
    hero: "/images/porsche/taycan/taycan-trans.webp",
    gallery: [
      "/images/porsche/taycan/taycan-img1.avif",
      "/images/porsche/taycan/taycan-img2.avif",
      "/images/porsche/taycan/taycan-img3.avif",
      "/images/porsche/taycan/taycan-img4.avif"
    ],
    specs: {
      Model: "Taycan 4S",
      Engine: "Dual-motor all-wheel drive (BEV)",
      Power: "530 HP",
      Torque: "650 Nm",
      Gear: "2-speed rear axle transmission",
      "Top Speed": "250 km/h",
      "Battery Capacity": "93.4 kWh",
      "Length x Width x Height": "4,963 x 1,966 x 1,378 mm",
      Weight: "2,220 kg",
      "Fuel Consumption": "20.0 kWh/100 km"
    },
    safety: [
      "Autonomous emergency braking with pedestrian detection",
      "Lane Keep Assist",
      "Traffic Sign Recognition"
    ],
    convenience: [
      "800-volt fast charging",
      "Heated/ventilated seats (front)",
      "Heads-up display (optional)"
    ]
  }

]

export default cars