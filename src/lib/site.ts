// Central site config - edit contact details and text here.
export const site = {
  name: "Puretech Enterprises",
  slogan: "Quality, Smart & Reliable Solutions",
  phone: "+260 962190263",
  whatsapp: "260962190263", // digits only, no +
  email: "puretechenterprises@gmail.com",
  location: "Kapiri Mposhi, Zambia",
  whatsappMessage:
    "Hello Puretech Enterprises. I visited your website and I am interested in your services. Please assist me.",
};

export const whatsappLink = (msg = site.whatsappMessage) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg)}`;

// Build a service-specific WhatsApp enquiry link.
export const whatsappServiceLink = (service: string) =>
  whatsappLink(
    `Hello Puretech Enterprises. I am interested in ${service}. Please assist me.`,
  );

export const telLink = `tel:${site.phone.replace(/\s+/g, "")}`;

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

// Quick enquiry chips shown on the homepage.
export const quickEnquiries: { label: string; icon: string }[] = [
  { label: "Company Registration", icon: "Building2" },
  { label: "ZRA & Tax Services", icon: "Receipt" },
  { label: "NAPSA & NHIMA", icon: "ShieldCheck" },
  { label: "Tender Support", icon: "FileCheck2" },
  { label: "Business Plans", icon: "LineChart" },
  { label: "Financial Consultancy", icon: "Wallet" },
  { label: "Printing & Branding", icon: "Printer" },
  { label: "ICT Services", icon: "Laptop" },
];

export const faqs: { q: string; a: string }[] = [
  {
    q: "Can Puretech help me register a company?",
    a: "Yes. We provide company and business registration support and guide clients through the required registration process.",
  },
  {
    q: "Do you assist with ZRA tax returns?",
    a: "Yes. We provide tax compliance support including selected ZRA returns and tax consultancy services.",
  },
  {
    q: "Can you prepare a business plan?",
    a: "Yes. We prepare professional business plans, financial projections, cash flow forecasts and profitability analysis based on the client's business requirements.",
  },
  {
    q: "Do you provide tender support?",
    a: "Yes. We assist with tender document preparation, ZPPA support and business compliance requirements.",
  },
  {
    q: "Do you offer printing and branding?",
    a: "Yes. We provide printing, corporate branding and promotional branding solutions.",
  },
  {
    q: "Where is Puretech Enterprises located?",
    a: "Puretech Enterprises is based in Kapiri Mposhi, Zambia and can assist clients from different locations depending on the service required.",
  },
];
