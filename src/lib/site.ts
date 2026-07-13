// Central site config - edit contact details and text here.
export const site = {
  name: "Puretech Enterprises",
  slogan: "Quality, Smart & Reliable Solutions",
  phone: "+260 962190263",
  whatsapp: "260962190263", // digits only, no +
  email: "puretechenterprises@gmail.com",
  location: "Kapiri Mposhi, Zambia",
  whatsappMessage:
    "Hello Puretech Enterprises. I am interested in your services and would like assistance.",
};

export const whatsappLink = (msg = site.whatsappMessage) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg)}`;

export const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/services", label: "Services" },
  { to: "/business-registration", label: "Business Registration" },
  { to: "/tax-compliance", label: "Tax & Compliance" },
  { to: "/printing-branding", label: "Printing & Branding" },
  { to: "/ict-services", label: "ICT Services" },
  { to: "/contact", label: "Contact Us" },
] as const;

export type ServiceCategory = {
  slug: string;
  title: string;
  short: string;
  icon: string; // lucide name
  items: string[];
};

export const services: ServiceCategory[] = [
  {
    slug: "business-registration",
    title: "Business Registration & Compliance",
    short: "PACRA, company setup and ongoing compliance support.",
    icon: "Building2",
    items: [
      "Company Registration",
      "Business Name Registration",
      "PACRA Services",
      "Company Amendments and Updates",
      "Business Compliance Support",
    ],
  },
  {
    slug: "tax-zra",
    title: "Tax & ZRA Services",
    short: "TPIN, returns and consultancy handled end-to-end.",
    icon: "Receipt",
    items: [
      "ZRA Registration",
      "TPIN Registration Support",
      "Tax Returns",
      "Turnover Tax Returns",
      "VAT Returns",
      "PAYE Returns",
      "Withholding Tax Support",
      "Provisional Tax Support",
      "Tax Consultancy",
      "Smart Invoice Support",
    ],
  },
  {
    slug: "napsa-nhima",
    title: "NAPSA & NHIMA Services",
    short: "Employer registration, returns and compliance.",
    icon: "ShieldCheck",
    items: [
      "NAPSA Registration",
      "NAPSA Returns",
      "NHIMA Registration",
      "NHIMA Returns",
      "Employer Compliance Support",
    ],
  },
  {
    slug: "tender-professional",
    title: "Tender & Professional Registration",
    short: "ZPPA, NCC, ZDA, EIZ and tender document preparation.",
    icon: "FileCheck2",
    items: [
      "ZPPA Registration",
      "Tender Support",
      "Tender Document Preparation",
      "NCC Registration Support",
      "ZDA Services",
      "EIZ Registration Support",
    ],
  },
  {
    slug: "financial-consultancy",
    title: "Financial Consultancy",
    short: "Business plans, projections and growth strategy.",
    icon: "LineChart",
    items: [
      "Business Plans",
      "Financial Projections",
      "Cash Flow Forecasts",
      "Budget Preparation",
      "Profitability Analysis",
      "Financial Business Assessments",
      "Cost Control Consultancy",
      "Business Growth Strategies",
      "Asset Registers",
      "Accounting Support",
    ],
  },
  {
    slug: "printing-branding",
    title: "Printing & Branding",
    short: "From business cards to vehicle and shop branding.",
    icon: "Printer",
    items: [
      "Business Cards",
      "Flyers",
      "Posters",
      "Banners",
      "T-Shirt Branding",
      "Cap Branding",
      "Apron Branding",
      "Corporate Branding",
      "Shop Branding",
      "Booth Branding",
      "Vehicle Branding",
      "Marketing Materials",
    ],
  },
  {
    slug: "stationery-supplies",
    title: "Stationery Supplies",
    short: "Office and corporate stationery, delivered.",
    icon: "Package",
    items: [
      "Office Stationery",
      "Printing Supplies",
      "Business Forms",
      "Corporate Stationery",
      "General Office Supplies",
    ],
  },
  {
    slug: "ict-services",
    title: "ICT Services",
    short: "Repairs, support and business technology solutions.",
    icon: "Laptop",
    items: [
      "Computer Repairs",
      "Laptop Repairs",
      "Software Installation",
      "ICT Support",
      "Computer Maintenance",
      "Business Technology Support",
      "Basic Network Support",
    ],
  },
];
