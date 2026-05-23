"use client";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getAllProperties } from "../api";

const AMENITY_ICONS = {
  wifi: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>,
  meals: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  ac: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/></svg>,
  gym: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4v16M18 4v16M2 8h4M18 8h4M2 16h4M18 16h4M6 12h12"/></svg>,
  laundry: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="12" cy="13" r="5"/><circle cx="7" cy="6" r="1" fill="currentColor"/></svg>,
  security: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

const SORT_OPTIONS = ["Price: Low to High", "Price: High to Low", "Rating", "Distance", "Newest"];

const AMENITY_ICON_MAP = {
  wifi: "wifi",
  internet: "wifi",
  ac: "ac",
  airconditioning: "ac",
  airconditioner: "ac",
  gym: "gym",
  laundry: "laundry",
  security: "security",
  meals: "meals",
  food: "meals",
};

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getAmenityIconKey = (amenity) => {
  const normalized = String(amenity || "").toLowerCase().replace(/[^a-z]/g, "");
  if (AMENITY_ICON_MAP[normalized]) return AMENITY_ICON_MAP[normalized];
  if (normalized.includes("wifi") || normalized.includes("internet")) return "wifi";
  if (normalized.includes("ac") || normalized.includes("aircondition")) return "ac";
  if (normalized.includes("gym")) return "gym";
  if (normalized.includes("laundry")) return "laundry";
  if (normalized.includes("security")) return "security";
  if (normalized.includes("meal") || normalized.includes("food")) return "meals";
  return null;
};

const mapProperty = (property) => {
  const room = property?.rooms?.[0] || {};
  const availableBeds = Number(property?.availableBeds ?? room?.availableBeds ?? 0);

  return {
    id: property?._id,
    name: property?.name || "Untitled Property",
    location: property?.location?.address || property?.location?.mapLabel || property?.location?.city || "Unknown location",
    distance: property?.location?.city && property?.location?.landmark
      ? `${property.location.city} • ${property.location.landmark}`
      : property?.location?.city || property?.location?.landmark || "",
    rating: property?.rating ?? null,
    isNew: false,
    price: Number(property?.startingPrice ?? room?.price ?? 0),
    badge: property?.isVerified || property?.status === "verified" ? "VERIFIED" : null,
    badgeStyle: "bg-green-500 text-white",
    tag: availableBeds > 0 ? `${availableBeds} Beds Left` : "Full",
    tagStyle: availableBeds > 0 ? "bg-amber-400 text-white" : "bg-slate-500 text-white",
    amenities: Array.isArray(property?.amenities) ? property.amenities : [],
    amenityIcons: Array.isArray(property?.amenities) ? property.amenities.map(getAmenityIconKey) : [],
    roomType: room?.type || (Array.isArray(property?.rooms) && property.rooms.length > 1 ? "Multiple" : "Single"),
    gender: property?.gender || "Any",
    wishlist: false,
    image: property?.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=80",
  };
};

// ── COMPONENT ────────────────────────────────────────────────────────────────
export default function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL query params
  const qLocation = searchParams.get("location") || "Koramangala";
  const qPrice = searchParams.get("price") || "Any Price";
  const qGender = searchParams.get("gender") || "Any Gender";

  // Filter state
  const [budgetMin, setBudgetMin] = useState(5000);
  const [budgetMax, setBudgetMax] = useState(25000);
  const [roomTypes, setRoomTypes] = useState(["Double"]);
  const [amenities, setAmenities] = useState(["AC"]);
  const [gender, setGender] = useState("Any");
  const [moveIn, setMoveIn] = useState("");
  const [sort, setSort] = useState("Price: Low to High");
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState([2]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const AMENITY_CHIPS = ["WiFi", "AC", "Gym", "Meals", "Laundry", "Security"];
  const ROOM_TYPES = ["Single", "Double", "Triple"];

  const toggleRoomType = (t) => setRoomTypes((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);
  const toggleAmenity = (a) => setAmenities((p) => p.includes(a) ? p.filter((x) => x !== a) : [...p, a]);
  const toggleWishlist = (e, id) => { e.stopPropagation(); setWishlist((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]); };

  useEffect(() => {
    let isMounted = true;

    const loadProperties = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAllProperties();
        console.log(response);
        
        const list = Array.isArray(response?.properties) ? response.properties.map(mapProperty) : [];

        if (isMounted) {
          setProperties(list);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError("Unable to load properties right now.");
          setProperties([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  // Apply filters
  const filtered = properties
    .filter((p) => {
      if (p.price < budgetMin || p.price > budgetMax) return false;
      if (roomTypes.length > 0 && !roomTypes.includes(p.roomType)) return false;
      if (gender !== "Any" && p.gender !== "Co-ed" && p.gender !== gender) return false;
      const searchValue = search.toLowerCase();
      if (searchValue && !p.name.toLowerCase().includes(searchValue) && !p.location.toLowerCase().includes(searchValue)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      if (sort === "Rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const FilterSidebar = () => (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900">Filters</h2>
        <p className="text-xs text-slate-400 mt-0.5">Refine your sanctuary</p>
      </div>

      {/* Budget Range */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          <span className="text-sm font-bold text-blue-600">Budget Range</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>₹{budgetMin.toLocaleString("en-IN")}</span>
          <span>₹{budgetMax.toLocaleString("en-IN")}+</span>
        </div>
        <input type="range" min={5000} max={25000} step={500} value={budgetMin}
          onChange={(e) => setBudgetMin(Number(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer" />
        <input type="range" min={5000} max={25000} step={500} value={budgetMax}
          onChange={(e) => setBudgetMax(Number(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer mt-1" />
      </div>

      <div className="h-px bg-slate-100" />

      {/* Room Type */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 14h20"/></svg>
          <span className="text-sm font-bold text-blue-600">Room Type</span>
        </div>
        <div className="space-y-2.5">
          {ROOM_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => toggleRoomType(t)}
                className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 cursor-pointer
                  ${roomTypes.includes(t) ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white group-hover:border-blue-400"}`}
              >
                {roomTypes.includes(t) && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2 6 5 9 10 3"/>
                  </svg>
                )}
              </div>
              <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Amenities */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span className="text-sm font-semibold text-slate-700">Amenities</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {AMENITY_CHIPS.map((a) => (
            <button key={a} onClick={() => toggleAmenity(a)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer
                ${amenities.includes(a) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* House Rules */}
      <button className="flex items-center gap-2 w-full text-left">
        <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        <span className="text-sm font-semibold text-slate-700">House Rules</span>
        <svg className="w-4 h-4 text-slate-400 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <div className="h-px bg-slate-100" />

      {/* Gender Preference */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span className="text-sm font-semibold text-slate-700">Gender Preference</span>
        </div>
        <div className="flex gap-2">
          {["Any", "Boys", "Girls", "Co-ed"].map((g) => (
            <button key={g} onClick={() => setGender(g)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer
                ${gender === g ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Move-in Date */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span className="text-sm font-semibold text-slate-700">Move-in Date</span>
        </div>
        <input type="date" value={moveIn} onChange={(e) => setMoveIn(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
      </div>

      {/* Apply */}
      <button className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm py-3 rounded-xl transition-all cursor-pointer">
        Apply Filters
      </button>
    </div>
  );

  return (
    <>
      <Head>
        <title>Search PGs in {qLocation} — PG Connect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
        <style>{`
          body { font-family: 'DM Sans', sans-serif; }
          .font-serif-display { font-family: 'DM Serif Display', serif; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .card-img { transition: transform 0.4s ease; }
          .pg-card:hover .card-img { transform: scale(1.05); }
          select { appearance: none; }
        `}</style>
      </Head>

      <div className="min-h-screen bg-white text-slate-900 flex flex-col">

        {/* ── NAVBAR ── */}
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-5 h-14 flex items-center gap-3 sm:gap-5">
            {/* Logo */}
            <button onClick={() => router.push("/")} className="font-serif-display text-blue-600 text-base sm:text-lg shrink-0 cursor-pointer whitespace-nowrap">
              PG Connect
            </button>

            {/* Center nav links — desktop */}
            <div className="hidden md:flex items-center gap-1 ml-2">
              {["Discover", "Saved", "Messages"].map((l) => (
                <button key={l}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all cursor-pointer
                    ${l === "Discover" ? "text-blue-600 border-b-2 border-blue-600 rounded-none pb-[3.5px]" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}>
                  {l}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Search bar */}
            <div className="flex-1 max-w-xs relative hidden sm:block">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" placeholder="PG Connect search..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"/>
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer shrink-0">
                RK
              </div>
              {/* Mobile hamburger */}
              <button className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => setMenuOpen(!menuOpen)}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="sm:hidden px-4 pb-3 flex items-center gap-2">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" placeholder="Search PGs..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 transition-all" />
            </div>
            <button onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-1.5 border border-slate-200 bg-white text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl cursor-pointer whitespace-nowrap">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filters
            </button>
          </div>
        </nav>

        {/* ── BODY ── */}
        <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-5 py-6 gap-7">

          {/* ── DESKTOP SIDEBAR ── */}
          <aside className="hidden md:block w-52 lg:w-56 shrink-0">
            <div className="sticky top-20">
              <FilterSidebar />
            </div>
          </aside>

          {/* ── MOBILE FILTER DRAWER ── */}
          {filtersOpen && (
            <>
              <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setFiltersOpen(false)} />
              <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white overflow-y-auto p-5 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-base font-bold text-slate-900">Filters</span>
                  <button onClick={() => setFiltersOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <FilterSidebar />
              </div>
            </>
          )}

          {/* ── RESULTS ── */}
          <div className="flex-1 min-w-0">

            {/* Results header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Found {filtered.length} PGs in {qLocation || "Koramangala"}
                </h1>
                <p className="text-sm text-slate-500 mt-1">Curated living spaces for the modern student.</p>
              </div>
              {/* Sort */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Sort By</span>
                <div className="relative">
                  <select value={sort} onChange={(e) => setSort(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 cursor-pointer">
                    {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* ── PROPERTY GRID ── */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {[1, 2].map((item) => (
                  <div key={item} className="h-[430px] rounded-2xl border border-slate-200 bg-slate-50 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {filtered.map((p) => (
                <div key={p.id} className="pg-card bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/property/${p.id}`)}>

                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img src={p.image} alt={p.name} loading="lazy" className="card-img w-full h-full object-cover" />

                    {/* Badge top-left */}
                    {p.badge && (
                      <span className={`absolute top-3 left-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${p.badgeStyle}`}>
                        {p.badge === "VERIFIED" && (
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                          </svg>
                        )}
                        {p.badge}
                      </span>
                    )}

                    {/* Tag bottom-left */}
                    {p.tag && (
                      <span className={`absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${p.tagStyle}`}>
                        {p.tag}
                      </span>
                    )}

                    {/* Wishlist */}
                    <button
                      onClick={(e) => toggleWishlist(e, p.id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24"
                        fill={wishlist.includes(p.id) ? "#ef4444" : "none"}
                        stroke={wishlist.includes(p.id) ? "#ef4444" : "#94a3b8"}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    {/* Name + rating */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{p.name}</h3>
                      {p.isNew ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-blue-500 whitespace-nowrap shrink-0">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                          (New)
                        </span>
                      ) : p.rating ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-800 whitespace-nowrap shrink-0">
                          <span className="text-blue-500">★</span> {p.rating}
                        </span>
                      ) : null}
                    </div>

                    {/* Location */}
                    <p className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {p.location}{p.distance ? ` • ${p.distance}` : ""}
                    </p>

                    {/* Amenity pills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {p.amenities.map((a, i) => (
                        <span key={a} className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                          {p.amenityIcons[i] && AMENITY_ICONS[p.amenityIcons[i]]}
                          {a}
                        </span>
                      ))}
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xl font-bold text-slate-900">{formatCurrency(p.price)}</span>
                        <span className="text-xs text-slate-400 font-normal"> /month</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/property/${p.id}`); }}
                        className="border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <svg className="w-12 h-12 text-slate-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <p className="text-lg font-bold text-slate-400">No PGs match your filters</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your budget or room type.</p>
                <button onClick={() => { setRoomTypes([]); setBudgetMin(5000); setBudgetMax(25000); setGender("Any"); }}
                  className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                  Clear all filters
                </button>
              </div>
            )}

            {/* ── LOAD MORE ── */}
            {!loading && !error && filtered.length > 0 && (
              <div className="flex flex-col items-center mt-10 gap-6">
                <button className="flex items-center gap-2 border border-slate-200 bg-white hover:border-blue-300 hover:text-blue-600 text-slate-700 text-sm font-semibold px-8 py-3 rounded-full transition-all cursor-pointer shadow-sm hover:shadow">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                  Load More Spaces
                </button>

                {/* Pagination */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, "...", 12].map((p, i) => (
                    <button key={i}
                      onClick={() => typeof p === "number" && setPage(p)}
                      className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-all cursor-pointer
                        ${p === page ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:bg-slate-100"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="h-12" />
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-serif-display text-sm font-bold text-slate-900">PG Connect</p>
              <p className="text-xs text-slate-400 mt-0.5">© 2024 PG Connect. Curated Student Living.</p>
            </div>
            <div className="flex flex-wrap gap-5">
              {["Privacy Policy", "Terms of Service", "Help Center", "Contact Us"].map((l) => (
                <a key={l} href="#" className="text-xs text-slate-500 hover:text-blue-600 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}