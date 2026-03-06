import type {
  Engine,
  ExteriorOption,
  InteriorOption,
  Model,
  Package,
  Transmission,
  Trim,
  Wheel,
} from "@/lib/configurator/types";

export const models: Model[] = [
  {
    id: "sedan-x",
    name: "Sedan X",
    basePrice: 35000,
    description: "Premium sedan with elegant design",
    image: "/models/sedan-x.jpg",
  },
  {
    id: "suv-elite",
    name: "SUV Elite",
    basePrice: 48000,
    description: "Spacious SUV with advanced features",
    image: "/models/suv-elite.jpg",
  },
  {
    id: "coupe-sport",
    name: "Coupe Sport",
    basePrice: 45000,
    description: "High-performance sports coupe",
    image: "/models/coupe-sport.jpg",
  },
];

export const engines: Engine[] = [
  {
    id: "petrol-2.0",
    name: "2.0L Petrol",
    type: "petrol",
    horsePower: 200,
    torque: 220,
    priceModifier: 0,
    compatibleModels: ["sedan-x", "suv-elite", "coupe-sport"],
  },
  {
    id: "petrol-3.0",
    name: "3.0L Petrol Turbo",
    type: "petrol",
    horsePower: 320,
    torque: 360,
    priceModifier: 8000,
    compatibleModels: ["sedan-x", "suv-elite", "coupe-sport"],
  },
  {
    id: "diesel-2.2",
    name: "2.2L Diesel",
    type: "diesel",
    horsePower: 180,
    torque: 400,
    priceModifier: 5000,
    compatibleModels: ["sedan-x", "suv-elite"],
  },
  {
    id: "electric",
    name: "Electric (300kW)",
    type: "electric",
    horsePower: 400,
    torque: 500,
    priceModifier: 15000,
    compatibleModels: ["sedan-x", "suv-elite", "coupe-sport"],
  },
];

export const transmissions: Transmission[] = [
  {
    id: "manual",
    name: "Manual (6-Speed)",
    type: "manual",
    priceModifier: 0,
    compatibleEngines: ["petrol-2.0", "diesel-2.2"],
  },
  {
    id: "auto-8",
    name: "Automatic (8-Speed)",
    type: "automatic",
    priceModifier: 2000,
    compatibleEngines: ["petrol-2.0", "petrol-3.0", "diesel-2.2"],
  },
  {
    id: "auto-10",
    name: "Automatic (10-Speed)",
    type: "automatic",
    priceModifier: 3500,
    compatibleEngines: ["petrol-3.0", "diesel-2.2"],
  },
  {
    id: "direct-drive",
    name: "Direct Drive (Single Speed)",
    type: "cvt",
    priceModifier: 1000,
    compatibleEngines: ["electric"],
  },
];

export const trims: Trim[] = [
  {
    id: "base",
    name: "Base",
    description: "Essential features and great value",
    priceModifier: 0,
    features: ["Manual climate control", "16-inch wheels", "Basic infotainment"],
    compatibleEngines: ["petrol-2.0", "diesel-2.2"],
  },
  {
    id: "sport",
    name: "Sport",
    description: "Enhanced performance and styling",
    priceModifier: 5000,
    features: [
      "Dual climate control",
      "18-inch alloy wheels",
      "Sport suspension",
      "Panoramic sunroof",
      "Advanced infotainment",
    ],
    compatibleEngines: ["petrol-2.0", "petrol-3.0", "diesel-2.2", "electric"],
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "Premium comfort and technology",
    priceModifier: 12000,
    features: [
      "Tri-zone climate control",
      "Premium leather seats",
      "20-inch wheels",
      "Panoramic sunroof",
      "Premium audio system",
      "Advanced driver assistance",
      "Adaptive suspension",
    ],
    compatibleEngines: ["petrol-3.0", "electric"],
  },
];

export const exteriorOptions: ExteriorOption[] = [
  {
    id: "paint-pearl-white",
    name: "Pearl White",
    type: "paint",
    priceModifier: 0,
    color: "#FFFFFF",
    description: "Elegant pearl white finish",
    disabledTrims: [],
  },
  {
    id: "paint-midnight-black",
    name: "Midnight Black",
    type: "paint",
    priceModifier: 1000,
    color: "#1a1a1a",
    description: "Deep midnight black metallic",
    disabledTrims: [],
  },
  {
    id: "paint-silver-metallic",
    name: "Silver Metallic",
    type: "paint",
    priceModifier: 1500,
    color: "#C0C0C0",
    description: "Premium silver metallic",
    disabledTrims: [],
  },
  {
    id: "paint-racing-red",
    name: "Racing Red",
    type: "paint",
    priceModifier: 2000,
    color: "#DC143C",
    description: "Vibrant racing red",
    disabledTrims: ["base"],
  },
  {
    id: "roof-panoramic",
    name: "Panoramic Sunroof",
    type: "roof",
    priceModifier: 3000,
    description: "Full panoramic glass roof",
    disabledTrims: [],
  },
  {
    id: "roof-carbon-fiber",
    name: "Carbon Fiber Roof",
    type: "roof",
    priceModifier: 5000,
    description: "Lightweight carbon fiber roof",
    disabledTrims: ["base", "sport"],
  },
];

export const interiorOptions: InteriorOption[] = [
  {
    id: "interior-black-leather",
    name: "Black Leather",
    type: "upholstery",
    priceModifier: 2000,
    color: "#2a2a2a",
    description: "Premium black leather seats",
    disabledTrims: [],
  },
  {
    id: "interior-tan-leather",
    name: "Tan Leather",
    type: "upholstery",
    priceModifier: 2500,
    color: "#D2B48C",
    description: "Luxurious tan leather seats",
    disabledTrims: ["base"],
  },
  {
    id: "interior-red-sport",
    name: "Red Sport Leather",
    type: "upholstery",
    priceModifier: 3000,
    color: "#8B0000",
    description: "Performance-oriented red leather",
    disabledTrims: ["base"],
  },
  {
    id: "interior-carbon-trim",
    name: "Carbon Fiber Trim",
    type: "trim_material",
    priceModifier: 1500,
    description: "Carbon fiber interior accents",
    disabledTrims: [],
  },
  {
    id: "interior-wood-trim",
    name: "Walnut Wood Trim",
    type: "trim_material",
    priceModifier: 1000,
    description: "Premium walnut wood accents",
    disabledTrims: ["sport"],
  },
];

export const wheels: Wheel[] = [
  {
    id: "wheels-18",
    name: "18-inch Alloy",
    size: '18"',
    priceModifier: 0,
    description: "Standard alloy wheels",
    image: "/wheels/18-inch.jpg",
  },
  {
    id: "wheels-19",
    name: "19-inch Performance",
    size: '19"',
    priceModifier: 1500,
    description: "Performance alloy wheels",
    image: "/wheels/19-inch.jpg",
  },
  {
    id: "wheels-20",
    name: "20-inch Premium",
    size: '20"',
    priceModifier: 3000,
    description: "Premium forged wheels",
    image: "/wheels/20-inch.jpg",
  },
  {
    id: "wheels-21",
    name: "21-inch Ultra Sport",
    size: '21"',
    priceModifier: 4500,
    description: "Ultra-lightweight sport wheels",
    image: "/wheels/21-inch.jpg",
  },
];

export const packages: Package[] = [
  {
    id: "pkg-technology",
    name: "Technology Package",
    description: "Advanced connectivity and automation",
    features: [
      "5G Connectivity",
      "Voice control system",
      "Gesture recognition",
      "Over-the-air updates",
    ],
    priceModifier: 4000,
    disabledTrims: [],
  },
  {
    id: "pkg-safety",
    name: "Safety Plus Package",
    description: "Comprehensive safety systems",
    features: [
      "Blind spot monitoring",
      "Lane departure warning",
      "Automatic emergency braking",
      "Rear cross-traffic alert",
    ],
    priceModifier: 3000,
    disabledTrims: [],
  },
  {
    id: "pkg-winter",
    name: "Winter Package",
    description: "Enhanced winter performance",
    features: [
      "Heated seats",
      "Heated steering wheel",
      "Snow mode",
      "Michelin winter tires",
    ],
    priceModifier: 2500,
    disabledTrims: [],
  },
  {
    id: "pkg-comfort",
    name: "Comfort Plus",
    description: "Premium comfort features",
    features: [
      "Massaging seats",
      "Air-conditioned seats",
      "Premium sound system",
      "Ambient lighting",
    ],
    priceModifier: 5000,
    disabledTrims: ["base"],
  },
  {
    id: "pkg-towing",
    name: "Towing Package",
    description: "Enhanced towing capability",
    features: [
      "Integrated trailer control",
      "Heavy-duty suspension",
      "Trailer backup guide",
    ],
    priceModifier: 1800,
    disabledTrims: [],
  },
];

export function getModelById(id: string): Model | undefined {
  return models.find((model) => model.id === id);
}

export function getEngineById(id: string): Engine | undefined {
  return engines.find((engine) => engine.id === id);
}

export function getTransmissionById(id: string): Transmission | undefined {
  return transmissions.find((transmission) => transmission.id === id);
}

export function getTrimById(id: string): Trim | undefined {
  return trims.find((trim) => trim.id === id);
}

export function getExteriorOptionById(id: string): ExteriorOption | undefined {
  return exteriorOptions.find((option) => option.id === id);
}

export function getInteriorOptionById(id: string): InteriorOption | undefined {
  return interiorOptions.find((option) => option.id === id);
}

export function getWheelById(id: string): Wheel | undefined {
  return wheels.find((wheel) => wheel.id === id);
}

export function getPackageById(id: string): Package | undefined {
  return packages.find((pkg) => pkg.id === id);
}