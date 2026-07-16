// Central site config - edit contact details and text here.
export const site = {
  name: "Puretech Enterprises",
  slogan: "Quality, Smart & Reliable Solutions",
  phone: "+260 962190263",
  whatsapp: "260962190263", // digits only, no +
  email: "puretechenterprises35@gmail.com",
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

export type PackageTier = {
  name: "Basic" | "Standard" | "Premium";
  price: string;
  tagline: string;
  items: string[];
};

export const servicePackages: Record<string, PackageTier[]> = {
  "business-registration": [
    { name: "Basic", price: "From ZMW 500", tagline: "ZMW 500 – 900", items: ["Business Name Registration", "PACRA Consultation", "Registration Guidance"] },
    { name: "Standard", price: "From ZMW 1,200", tagline: "ZMW 1,200 – 2,500", items: ["Company Registration", "Business Name Registration", "PACRA Documentation", "Registration Support"] },
    { name: "Premium", price: "From ZMW 3,000", tagline: "ZMW 3,000 – 6,500", items: ["Company Registration", "Company Amendments", "Compliance Support", "Annual Returns Guidance", "Ongoing Compliance Assistance"] },
  ],
  "tax-zra": [
    { name: "Basic", price: "From ZMW 350", tagline: "ZMW 350 – 700", items: ["TPIN Registration", "ZRA Registration"] },
    { name: "Standard", price: "From ZMW 900", tagline: "ZMW 900 – 2,000", items: ["VAT Registration", "PAYE", "Turnover Tax", "Smart Invoice Support"] },
    { name: "Premium", price: "From ZMW 2,500", tagline: "ZMW 2,500 – 8,000", items: ["Monthly Tax Management", "Tax Returns", "VAT Returns", "PAYE Returns", "Consultancy", "Compliance Support"] },
  ],
  "napsa-nhima": [
    { name: "Basic", price: "From ZMW 400", tagline: "ZMW 400 – 700", items: ["Employer Registration"] },
    { name: "Standard", price: "From ZMW 800", tagline: "ZMW 800 – 1,800", items: ["Registration", "Monthly Returns"] },
    { name: "Premium", price: "From ZMW 2,000", tagline: "ZMW 2,000 – 5,000", items: ["Registration", "Returns", "Employer Compliance", "Ongoing Support"] },
  ],
  "tender-professional": [
    { name: "Basic", price: "From ZMW 800", tagline: "ZMW 800 – 1,500", items: ["One Professional Registration (ZPPA, NCC, ZDA or EIZ)"] },
    { name: "Standard", price: "From ZMW 2,000", tagline: "ZMW 2,000 – 4,000", items: ["Two Registrations", "Tender Advice"] },
    { name: "Premium", price: "From ZMW 5,000", tagline: "ZMW 5,000 – 15,000", items: ["Multiple Registrations", "Tender Documentation", "Consultancy"] },
  ],
  "financial-consultancy": [
    { name: "Basic", price: "From ZMW 1,500", tagline: "ZMW 1,500 – 3,500", items: ["Business Plans", "Budget Preparation"] },
    { name: "Standard", price: "From ZMW 4,000", tagline: "ZMW 4,000 – 8,000", items: ["Business Plans", "Financial Projections", "Cash Flow Forecasts"] },
    { name: "Premium", price: "From ZMW 10,000", tagline: "ZMW 10,000 – 25,000", items: ["Complete Financial Consultancy", "Growth Strategy", "Profitability Analysis", "Accounting Support", "Asset Registers"] },
  ],
  "printing-branding": [
    { name: "Basic", price: "From ZMW 300", tagline: "ZMW 300 – 1,000", items: ["Business Cards", "Flyers", "Posters"] },
    { name: "Standard", price: "From ZMW 1,500", tagline: "ZMW 1,500 – 5,000", items: ["Banners", "Corporate Branding", "Marketing Materials"] },
    { name: "Premium", price: "From ZMW 6,000", tagline: "ZMW 6,000 – 30,000+", items: ["Vehicle Branding", "Shop Branding", "Booth Branding", "Full Corporate Identity"] },
  ],
  "stationery-supplies": [
    { name: "Basic", price: "From ZMW 500", tagline: "ZMW 500 – 1,000", items: ["Office Starter Pack"] },
    { name: "Standard", price: "From ZMW 1,500", tagline: "ZMW 1,500 – 4,000", items: ["Department Office Supplies"] },
    { name: "Premium", price: "From ZMW 5,000", tagline: "ZMW 5,000 – 50,000+", items: ["Corporate Supply Contracts", "Bulk Orders", "Scheduled Deliveries"] },
  ],
  "ict-services": [
    { name: "Basic", price: "From ZMW 300", tagline: "ZMW 300 – 800", items: ["Software Installation", "Virus Removal", "Basic ICT Support"] },
    { name: "Standard", price: "From ZMW 900", tagline: "ZMW 900 – 2,500", items: ["Computer Repairs", "Laptop Repairs", "Network Setup", "Preventive Maintenance"] },
    { name: "Premium", price: "From ZMW 3,500", tagline: "ZMW 3,500 – 15,000+", items: ["Managed ICT Services", "Business Technology Support", "Preventive Maintenance Contracts", "Business Network Support"] },
  ],
};

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

export type FaqCategory =
  | "Business Registration"
  | "Tax Services"
  | "ICT Services"
  | "Branding"
  | "Consultancy"
  | "Payments"
  | "Turnaround Times";

export const faqs: { category: FaqCategory; q: string; a: string }[] = [
  { category: "Business Registration", q: "Can Puretech help me register a company?", a: "Yes. We provide company and business registration support and guide clients through the required PACRA registration process from name search to certificate issuance." },
  { category: "Business Registration", q: "Do you handle amendments to existing companies?", a: "Yes. We support company amendments including director changes, shareholding updates and annual returns." },
  { category: "Tax Services", q: "Do you assist with ZRA tax returns?", a: "Yes. We provide tax compliance support including TPIN registration, VAT, PAYE, turnover and provisional tax returns, plus general tax consultancy." },
  { category: "Tax Services", q: "Can you help with Smart Invoice?", a: "Yes. We support Smart Invoice registration, setup and staff training." },
  { category: "ICT Services", q: "What ICT services do you offer?", a: "Computer and laptop repairs, software installation, virus removal, network setup, preventive maintenance and managed ICT support contracts." },
  { category: "ICT Services", q: "Do you provide ongoing IT support?", a: "Yes. Our Premium ICT package includes ongoing managed support and preventive maintenance for businesses." },
  { category: "Branding", q: "Do you offer printing and branding?", a: "Yes. We produce business cards, flyers, banners, corporate branding, shop branding and full vehicle branding." },
  { category: "Branding", q: "Can you design a full corporate identity?", a: "Yes. Our Premium branding package covers full corporate identity including logo, stationery and marketing collateral." },
  { category: "Consultancy", q: "Can you prepare a business plan?", a: "Yes. We prepare professional business plans, financial projections, cash flow forecasts and profitability analysis tailored to your business." },
  { category: "Consultancy", q: "Do you provide tender support?", a: "Yes. We assist with ZPPA, NCC, ZDA and EIZ registrations, plus tender document preparation and consultancy." },
  { category: "Payments", q: "What payment methods do you accept?", a: "We accept mobile money (Airtel Money, MTN Mobile Money), bank transfer and cash. Payment details are shared with your quotation." },
  { category: "Payments", q: "Do you require a deposit?", a: "Most engagements require a deposit before work begins. The exact terms are stated on your quotation." },
  { category: "Turnaround Times", q: "How long do services take?", a: "Turnaround depends on the service. Simple registrations can be completed in a few working days; larger consultancy and branding projects have timelines confirmed at quotation stage." },
  { category: "Turnaround Times", q: "Do you offer express service?", a: "Where possible we prioritise urgent work — please mention your deadline when requesting a quote." },
  { category: "Business Registration", q: "Where is Puretech Enterprises located?", a: "Puretech Enterprises is based in Kapiri Mposhi, Zambia and supports clients from different locations depending on the service required." },
];
