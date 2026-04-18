"use client";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import { properties } from "../data/properties";
import Navbar from "./components/Navbar";

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

const filters = [
  {
    label: "WiFi",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <circle cx="12" cy="20" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Food Included",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    label: "AC Rooms",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="10" rx="2" />
        <path d="M7 17l-2 4M17 17l2 4M12 13v8" />
      </svg>
    ),
  },
  {
    label: "Laundry",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <circle cx="12" cy="13" r="5" />
        <circle cx="7" cy="6" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Filters",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="11" y1="18" x2="13" y2="18" />
      </svg>
    ),
  },
];

export default function Home() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("Any Price");
  const [gender, setGender] = useState("Any Gender");
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleWishlist = (e, id) => {
    e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const goToProperty = (id) => {
    router.push(`/${id}`);
  };

  return (
    <>
      <Head>
        <title>PG Connect — Curated Spaces for Modern Living</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Experience high-end editorial student housing." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap"
          rel="stylesheet"
        />
        <style>{`
          body { font-family: 'DM Sans', sans-serif; }
          .font-serif-display { font-family: 'DM Serif Display', serif; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          select { appearance: none; background: transparent; }
          .card-img { transition: transform 0.4s ease; }
          .property-card:hover .card-img { transform: scale(1.06); }
        `}</style>
      </Head>

      <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">

        {/* ── NAVBAR ── */}
        <Navbar />

        {/* ── HERO ── */}
        <section className="bg-white text-center px-4 pt-10 pb-8 sm:pt-16 sm:pb-10">
          <h1 className="text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-slate-900">
            Curated spaces for <span className="text-blue-600">Modern Living.</span>
          </h1>
          <p className="mt-4 text-slate-500 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
            Experience high-end editorial student housing. No clutter, just quality living spaces designed for your success.
          </p>

          {/* Search — desktop */}
          <div className="hidden sm:flex mt-8 mx-auto max-w-2xl lg:max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden p-1 items-stretch">
            <div className="flex-1 flex flex-col px-5 py-3 border-r border-slate-100 min-w-0">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Location</label>
              <input type="text" placeholder="Where to?" value={location} onChange={(e) => setLocation(e.target.value)}
                className="text-sm font-medium text-slate-900 outline-none bg-transparent placeholder-slate-400 w-full" />
            </div>
            <div className="flex-1 flex flex-col px-5 py-3 border-r border-slate-100 min-w-0">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Price Range</label>
              <select value={price} onChange={(e) => setPrice(e.target.value)} className="text-sm font-medium text-slate-900 outline-none w-full cursor-pointer">
                <option>Any Price</option>
                <option>Under ₹10,000</option>
                <option>₹10,000 – ₹15,000</option>
                <option>₹15,000 – ₹20,000</option>
                <option>Above ₹20,000</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col px-5 py-3 min-w-0">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="text-sm font-medium text-slate-900 outline-none w-full cursor-pointer">
                <option>Any Gender</option>
                <option>Boys</option>
                <option>Girls</option>
                <option>Co-ed</option>
              </select>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white rounded-xl px-6 py-3 text-sm font-semibold flex items-center gap-2 shrink-0 m-1 cursor-pointer">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
            </button>
          </div>

          {/* Search — mobile */}
          <div className="sm:hidden mt-6 bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Location</label>
              <input type="text" placeholder="Where to?" value={location} onChange={(e) => setLocation(e.target.value)}
                className="text-sm font-medium text-slate-900 outline-none bg-transparent placeholder-slate-400 w-full" />
            </div>
            <div className="flex">
              <div className="flex-1 px-4 py-3 border-r border-slate-100">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Price</label>
                <select value={price} onChange={(e) => setPrice(e.target.value)} className="text-sm font-medium text-slate-900 outline-none w-full cursor-pointer">
                  <option>Any Price</option><option>Under ₹10,000</option><option>₹10k–₹15k</option><option>₹15k–₹20k</option><option>Above ₹20k</option>
                </select>
              </div>
              <div className="flex-1 px-4 py-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="text-sm font-medium text-slate-900 outline-none w-full cursor-pointer">
                  <option>Any Gender</option><option>Boys</option><option>Girls</option><option>Co-ed</option>
                </select>
              </div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
            </button>
          </div>
        </section>

        {/* ── FILTER CHIPS ── */}
        <div className="no-scrollbar flex gap-2 sm:gap-3 overflow-x-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-5 sm:justify-center">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(activeFilter === f.label ? null : f.label)}
              className={`flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-full border text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer
                ${activeFilter === f.label ? "border-blue-600 text-blue-600 bg-blue-50" : "border-slate-200 text-slate-700 bg-white hover:border-blue-400 hover:text-blue-500"}`}
            >
              {f.icon}{f.label}
            </button>
          ))}
        </div>

        {/* ── PROPERTY CARDS ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {properties.map((p) => (
              <div
                key={p.id}
                onClick={() => goToProperty(p.id)}
                className="property-card bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                {/* Image */}
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img src={p.images[0]} alt={p.name} loading="lazy" className="card-img w-full h-full object-cover" />
                  <span className={`absolute top-3 left-3 ${p.badgeColor} text-white text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-md`}>
                    {p.badge}
                  </span>
                  <button
                    onClick={(e) => toggleWishlist(e, p.id)}
                    aria-label="Wishlist"
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24"
                      fill={wishlist.includes(p.id) ? "#ef4444" : "none"}
                      stroke={wishlist.includes(p.id) ? "#ef4444" : "#94a3b8"}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>

                {/* Card body */}
                <div className="p-3.5 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">{p.name}</span>
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-slate-800 shrink-0">
                      <span className="text-blue-600">★</span>{p.rating}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{p.location}</p>
                  <p className="mt-3 text-[15px] font-bold text-slate-900">
                    ₹{p.price.toLocaleString("en-IN")}<span className="text-xs font-normal text-slate-500"> / bed</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── EXPERIENCE SECTION ── */}
        <section className="bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-14 sm:py-20 lg:py-24">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              <div className="flex-1 w-full order-2 lg:order-1">
                <p className="text-[11px] font-bold uppercase tracking-[2px] text-blue-600 mb-4">The Experience</p>
                <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-[2.8rem] text-slate-900 leading-tight mb-5">
                  Beyond just four walls and a bed.
                </h2>
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
                  We curate spaces that inspire growth. Our PGs are selected based on strict editorial standards for design, safety, and community vibe.
                </p>
                <div className="flex flex-col gap-4">
                  {[
                    { label: "Verified Safety Standards", icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
                    { label: "Curated Student Community", icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-slate-900">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full order-1 lg:order-2">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" alt="Students collaborating"
                    className="w-full h-56 sm:h-72 lg:h-[420px] object-cover block" />
                </div>
              </div>
            </div>
          </div>
        </section>

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