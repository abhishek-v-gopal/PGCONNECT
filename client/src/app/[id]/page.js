"use client";
import Head from "next/head";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
// import { properties } from "../../data/properties";
const properties = [
  {
    id: 1,
    slug: "the-nordic-house",
    name: "The Nordic House",
    tagline: "Calm Scandinavian living in the heart of South Delhi.",
    location: "Hauz Khas, New Delhi",
    price: 18500,
    rating: 4.9,
    badge: "4 BEDS LEFT",
    badgeColor: "bg-green-500",
    bedsLeft: 4,
    available: true,
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&q=80",
    ],
    amenities: ["High-Speed Wi-Fi", "Laundry Service", "Daily Meals", "24/7 Security", "Air Conditioning", "Housekeeping"],
    rooms: [
      { type: "Double Sharing", desc: "Twin beds, private wardrobe, city view.", price: 18500, status: "2 BEDS LEFT", available: true },
      { type: "Triple Sharing", desc: "Bunk beds, shared bathroom, desk space.", price: 14000, status: "2 BEDS LEFT", available: true },
      { type: "Single Private", desc: "Queen bed, en-suite bathroom, workspace.", price: 26000, status: "SOLD OUT", available: false },
    ],
    manager: { name: "Ananya Sharma", role: "Property Manager" },
    mapLabel: "4th Floor, Hauz Khas Village",
  },
  {
    id: 2,
    slug: "skyloft-co-living",
    name: "Skyloft Co-Living",
    tagline: "Industrial-chic co-living for Bangalore's creative class.",
    location: "Koramangala, Bangalore",
    price: 15000,
    rating: 4.8,
    badge: "2 BEDS LEFT",
    badgeColor: "bg-green-500",
    bedsLeft: 2,
    available: true,
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80",
    ],
    amenities: ["High-Speed Wi-Fi", "Daily Meals", "24/7 Security", "On-site Gym", "EV Charging", "Housekeeping"],
    rooms: [
      { type: "Double Sharing", desc: "Twin beds, attached balcony, private wardrobe.", price: 15000, status: "1 BED LEFT", available: true },
      { type: "Single Private", desc: "King bed, en-suite bathroom, work desk.", price: 22000, status: "1 BED LEFT", available: true },
      { type: "Triple Sharing", desc: "Bunk beds, shared bathroom, locker.", price: 10000, status: "SOLD OUT", available: false },
    ],
    manager: { name: "Rahul Menon", role: "Property Manager" },
    mapLabel: "5th Block, Koramangala",
  },
  {
    id: 3,
    slug: "the-sage-sanctuary",
    name: "The Sage Sanctuary",
    tagline: "A green, focused retreat for students near Pune University.",
    location: "Pune University Road, Pune",
    price: 12800,
    rating: 4.7,
    badge: "LAST BED!",
    badgeColor: "bg-orange-500",
    bedsLeft: 1,
    available: true,
    images: [
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
    ],
    amenities: ["High-Speed Wi-Fi", "Daily Meals", "Laundry Service", "24/7 Security", "Air Conditioning", "Housekeeping"],
    rooms: [
      { type: "Double Sharing", desc: "Twin beds, study nook, garden view.", price: 12800, status: "LAST BED!", available: true },
      { type: "Triple Sharing", desc: "Three beds, shared bath, common desk.", price: 9500, status: "SOLD OUT", available: false },
      { type: "Single Private", desc: "Double bed, private bath, balcony.", price: 19000, status: "SOLD OUT", available: false },
    ],
    manager: { name: "Priya Joshi", role: "Property Manager" },
    mapLabel: "Near Pune University Gate",
  },
  {
    id: 4,
    slug: "vertex-residences",
    name: "Vertex Residences",
    tagline: "Premium tech-forward living in Salt Lake's tech corridor.",
    location: "Salt Lake City, Kolkata",
    price: 21000,
    rating: 4.9,
    badge: "6 BEDS LEFT",
    badgeColor: "bg-green-500",
    bedsLeft: 6,
    available: true,
    images: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
    ],
    amenities: ["High-Speed Wi-Fi", "Laundry Service", "Daily Meals", "24/7 Security", "Air Conditioning", "On-site Gym", "EV Charging", "Housekeeping"],
    rooms: [
      { type: "Double Sharing", desc: "Twin beds, attached balcony, private wardrobe.", price: 21000, status: "3 BEDS LEFT", available: true },
      { type: "Triple Sharing", desc: "Bunk beds, shared bathroom, desk space.", price: 16000, status: "2 BEDS LEFT", available: true },
      { type: "Single Private", desc: "Queen bed, en-suite bathroom, workspace.", price: 32000, status: "1 BED LEFT", available: true },
    ],
    manager: { name: "Rajesh Kumar", role: "Property Manager" },
    mapLabel: "Sector V, Salt Lake City",
  },
];

const amenityIcons = {
  "High-Speed Wi-Fi": (
    <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  ),
  "Laundry Service": (
    <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" /><circle cx="12" cy="13" r="5" /><circle cx="7" cy="6" r="1" fill="currentColor" />
    </svg>
  ),
  "Daily Meals": (
    <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  "24/7 Security": (
    <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  "Air Conditioning": (
    <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
    </svg>
  ),
  "Housekeeping": (
    <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  "On-site Gym": (
    <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v16M18 4v16M2 8h4M18 8h4M2 16h4M18 16h4M6 12h12" />
    </svg>
  ),
  "EV Charging": (
    <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="15" height="13" rx="2" /><path d="M17 8h5M17 12h5M13 21l-4-8H7l4 8" />
    </svg>
  ),
};

export default function PropertyDetail() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", moveIn: "" });
  const [menuOpen, setMenuOpen] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const propertyId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const property = properties.find((p) => String(p.id) === String(propertyId)) || null;

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Property not found.</p>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => setInquirySent(false), 3000);
  };

  return (
    <>
      <Head>
        <title>{property.name} — PG Connect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={property.tagline} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap"
          rel="stylesheet"
        />
        <style>{`
          body { font-family: 'DM Sans', sans-serif; }
          .font-serif-display { font-family: 'DM Serif Display', serif; }
          .card-img { transition: transform 0.4s ease; }
          .img-thumb:hover .card-img { transform: scale(1.06); }
        `}</style>
      </Head>

      <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">

        {/* ── NAVBAR ── */}
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-14 sm:h-16 flex items-center justify-between gap-4">
            <button onClick={() => router.push("/")} className="font-serif-display text-blue-600 text-lg sm:text-xl shrink-0 cursor-pointer">
              PG Connect
            </button>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => router.push("/")} className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-0.5 cursor-pointer">Properties</button>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Locations</a>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">About</a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="text-sm font-semibold text-blue-600 hover:opacity-75 transition-opacity">Sign In</button>
              <button className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="md:hidden border-t border-slate-100 bg-white px-5 py-4 flex flex-col gap-4">
              <button onClick={() => router.push("/")} className="text-sm font-semibold text-blue-600 text-left">Properties</button>
              <a href="#" className="text-sm font-medium text-slate-500">Locations</a>
              <a href="#" className="text-sm font-medium text-slate-500">About</a>
            </div>
          )}
        </nav>

        {/* ── BREADCRUMB ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-4 sm:pt-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button onClick={() => router.push("/")} className="hover:text-blue-600 transition-colors cursor-pointer">Home</button>
            <span>/</span>
            <span className="text-slate-600 font-medium truncate">{property.name}</span>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-5 sm:py-7">

          {/* ── HEADER ── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Available Now
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {property.location}
                </span>
              </div>
              <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-tight">
                {property.name}
              </h1>
              <p className="mt-2 text-slate-500 text-sm sm:text-base max-w-xl leading-relaxed">{property.tagline}</p>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
              <div className="text-blue-600 font-bold text-3xl sm:text-4xl tracking-tight">
                ₹{property.price.toLocaleString("en-IN")}
                <span className="text-base font-medium text-slate-500">/mo</span>
              </div>
              <span className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {property.bedsLeft} {property.bedsLeft === 1 ? "bed" : "beds"} left
              </span>
            </div>
          </div>

          {/* ── PHOTO GRID ── */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 rounded-2xl overflow-hidden mb-8 sm:mb-10" style={{ height: "320px" }}>
            {/* Main image */}
            <div className="row-span-2 relative overflow-hidden bg-slate-200 cursor-pointer" style={{ gridRow: "span 2" }}>
              <img
                src={property.images[activeImage]}
                alt={property.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Top-right */}
            <div className="relative overflow-hidden bg-slate-200 cursor-pointer">
              <img src={property.images[1]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            {/* Bottom-right split */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="relative overflow-hidden bg-slate-200 cursor-pointer">
                <img src={property.images[2]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="relative overflow-hidden bg-slate-200 cursor-pointer">
                <img src={property.images[3]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center hover:bg-black/55 transition-colors">
                  <span className="text-white text-sm font-semibold">+12 photos</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── TWO COLUMN LAYOUT ── */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

            {/* ── LEFT ── */}
            <div className="flex-1 min-w-0 space-y-10">

              {/* Amenities */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-600 rounded-full inline-block"></span>
                  Premier Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {property.amenities.map((a) => (
                    <div key={a} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-start gap-3 hover:border-blue-200 hover:shadow-sm transition-all">
                      {amenityIcons[a] ?? (
                        <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>
                      )}
                      <span className="text-xs sm:text-sm font-medium text-slate-700 leading-tight">{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Configurations */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-600 rounded-full inline-block"></span>
                  Room Configurations
                </h2>
                <div className="space-y-3">
                  {property.rooms.map((r) => (
                    <div key={r.type}
                      className={`bg-white border rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all
                        ${r.available ? "border-slate-200 hover:border-blue-200 hover:shadow-sm" : "border-slate-100 opacity-60"}`}
                    >
                      <div className="flex-1">
                        <p className={`font-semibold text-sm sm:text-base ${!r.available ? "text-slate-400" : "text-slate-900"}`}>{r.type}</p>
                        <p className={`text-xs sm:text-sm mt-0.5 ${!r.available ? "text-slate-300" : "text-slate-500"}`}>{r.desc}</p>
                      </div>
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                        <span className={`text-base sm:text-lg font-bold ${!r.available ? "text-slate-400" : "text-slate-900"}`}>
                          ₹{r.price.toLocaleString("en-IN")}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${r.available ? "text-blue-600" : "text-red-500"}`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Neighborhood */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-600 rounded-full inline-block"></span>
                  The Neighborhood
                </h2>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="relative w-full h-56 sm:h-72 bg-slate-100 flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `linear-gradient(rgba(37,99,235,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.3) 1px, transparent 1px)`,
                      backgroundSize: "40px 40px",
                    }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-100/0 to-slate-100/60" />
                    <div className="relative bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-slate-200">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{property.name}</p>
                        <p className="text-xs text-slate-500">{property.mapLabel}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other properties */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-600 rounded-full inline-block"></span>
                  Other Properties You May Like
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {properties.filter((p) => p.id !== property.id).slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => router.push(`/property/${p.id}`)}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{p.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{p.location}</p>
                        <p className="text-sm font-bold text-slate-900 mt-2">₹{p.price.toLocaleString("en-IN")}<span className="text-xs font-normal text-slate-400"> /bed</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0">
              <div className="lg:sticky lg:top-24 space-y-4">

                {/* Inquiry Form */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">Send Inquiry</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Full Name</label>
                      <input type="text" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Phone Number</label>
                      <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Preferred Move-In</label>
                      <input type="date" value={form.moveIn} onChange={(e) => setForm({ ...form, moveIn: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                    </div>
                    <button type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-semibold text-sm py-3 rounded-xl cursor-pointer">
                      {inquirySent ? "✓ Inquiry Sent!" : "Send Inquiry"}
                    </button>
                    <p className="text-center text-[11px] text-slate-400 uppercase tracking-wider">Average response time: 30 minutes</p>
                  </form>
                </div>

                {/* Manager Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{property.manager.name}</p>
                      <p className="text-xs text-slate-500">{property.manager.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 text-sm font-semibold py-2.5 rounded-xl transition-all cursor-pointer">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.87h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.5a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 18z" />
                      </svg>
                      Call
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-all cursor-pointer">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                      </svg>
                      WhatsApp
                    </button>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
                    <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    PG Connect Verified Property &amp; Managed Service
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>

        {/* ── MOBILE STICKY BOTTOM BAR ── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-3 shadow-lg">
          <div className="flex-1">
            <p className="text-xs text-slate-500">Starting from</p>
            <p className="text-lg font-bold text-blue-600">
              ₹{property.price.toLocaleString("en-IN")}<span className="text-xs font-normal text-slate-500">/mo</span>
            </p>
          </div>
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer">
            Send Inquiry
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all cursor-pointer shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
          </button>
        </div>
        <div className="lg:hidden h-20" />

        {/* ── FOOTER ── */}
        <footer className="bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-5 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-serif-display text-base text-slate-900">PG Connect</p>
              <p className="text-xs text-slate-400 mt-0.5">© 2024 PG Connect. Curated Student Living.</p>
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {["Privacy Policy", "Terms of Service", "Help Center", "Contact Us"].map((link) => (
                <a key={link} href="#" className="text-xs sm:text-sm text-slate-500 hover:text-blue-600 transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}