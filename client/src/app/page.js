"use client";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { getAllProperties, getCurrentUser, saveProperty } from "./api";

const COLLECTIONS = [
  { label: "Walk-to-Campus", sub: "Under 10 mins away", img: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&q=80" },
  { label: "Budget Friendly", sub: "Smart savings", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80" },
  { label: "Verified Luxury", sub: "Premium experiences", img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80" },
  { label: "Social Hubs", sub: "Vibrant communities", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80" },
];

const TESTIMONIALS = [
  { quote: "Found my perfect room in less than 24 hours. The verification process gave me peace of mind before I even arrived in the city.", name: "Jordan Davies", role: "Computer Science, Stanford", initials: "JD", color: "bg-blue-600" },
  { quote: "The 'Walk-to-Campus' filter was a lifesaver. PG Connect actually visits these places, which is clear from the quality of photos.", name: "Sarah Lin", role: "Architecture, MIT", initials: "SL", color: "bg-slate-600" },
  { quote: "I love the social hub listings. I moved into a community of like-minded students and felt at home from day one.", name: "Marcus King", role: "Economics, Oxford", initials: "MK", color: "bg-green-600" },
];

const STEPS = [
  { n: 1, title: "Search with Intent", desc: "Filter by distance, price, and lifestyle. Find exactly where you belong." },
  { n: 2, title: "Virtual or In-Person Visit", desc: "Book a tour through our platform. No hidden surprises, just verified truth." },
  { n: 3, title: "Seamless Move-In", desc: "Handle all paperwork and first month's payment securely through PG Connect." },
];

const UNIVERSITIES = ["Stanford", "Cambridge", "MIT", "Oxford"];

export default function Home() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("Price Range");
  const [gender, setGender] = useState("Gender");
  const [wishlist, setWishlist] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Top 4 featured properties by rating
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const featuredProperties = properties
    .slice()
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  // Apply homepage search filters to featured properties (live-bind)
  const displayedFeatured = featuredProperties.filter((p) => {
    if (location && !String(p.location || "").toLowerCase().includes(location.toLowerCase())) return false;
    if (price === "Under ₹10k" && Number(p.price) >= 10000) return false;
    if (price === "₹10k–₹20k" && (Number(p.price) < 10000 || Number(p.price) > 20000)) return false;
    if (price === "Above ₹20k" && Number(p.price) <= 20000) return false;
    if (gender !== "Gender" && gender !== "Any" && p.gender && p.gender !== gender && p.gender !== "Co-ed") return false;
    return true;
  });

  // If filters remove all, fall back to top featured
  const featuredToShow = displayedFeatured.length > 0 ? displayedFeatured : featuredProperties;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAllProperties();
        const raw = Array.isArray(response)
          ? response
          : Array.isArray(response?.properties)
          ? response.properties
          : [];

        const list = raw.map((p) => ({
          id: p._id || p.id,
          name: p.name || "Untitled Property",
          location: (p.location && (p.location.address || p.location.city)) || "",
          dist: (p.location && (p.location.landmark || p.location.city)) || "",
          rating: p.rating ?? 0,
          price: Number(p.startingPrice ?? p.rooms?.[0]?.price ?? p.price ?? 0),
          badge: p.isVerified || p.status === "verified" ? "VERIFIED" : p.badge || null,
          badgeColor: p.isVerified || p.status === "verified" ? "bg-green-500" : p.badgeColor || "bg-amber-500",
          img: (p.images && p.images[0]) || p.img || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
          gender: p.gender || "Any",
        }));

        if (mounted) setProperties(list);
      } catch (err) {
        if (mounted) {
          setError("Unable to load properties right now.");
          setProperties([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);
      
  const toggleWishlist = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await saveProperty(id);
      if (res && res.success && res.saved) {
        setWishlist(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

        // decide redirect based on logged-in user's role
        try {
          const user = await getCurrentUser();
          const role = user?.role || user?.data?.role || "";
          if (String(role).toLowerCase() === "student") {
            router.push("/propertys");
            return;
          }
          if (String(role).toLowerCase() === "owner" || String(role).toLowerCase() === "landlord") {
            router.push("/ownersDashboard");
            return;
          }
        } catch (innerErr) {
          console.error('Unable to determine user role for redirect', innerErr);
        }
      } else {
        console.warn('Save API responded but did not confirm save', res);
      }
    } catch (err) {
      console.error('Error saving property:', err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        // Not authenticated/authorized — send user to sign in
        router.push('/signin');
        return;
      }
    }
  };

  const goSearch = () => router.push(`/propertys?location=${encodeURIComponent(location || "Koramangala")}&price=${encodeURIComponent(price)}&gender=${encodeURIComponent(gender)}`);

  return (
    <>
      <Head>
        <title>PG Connect — Find Your Curated Sanctuary</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html { scroll-behavior: smooth; }
          body { font-family: 'Plus Jakarta Sans', sans-serif; background: #fff; color: #0f1117; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
          .font-display { font-family: 'Fraunces', serif; }
          select { appearance: none; background: transparent; cursor: pointer; }
          .no-scroll::-webkit-scrollbar { display: none; }
          .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }

          /* Hero animations */
          .hero-fade { opacity: 0; transform: translateY(28px); transition: opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1); }
          .hero-fade.in { opacity: 1; transform: translateY(0); }
          .delay-1 { transition-delay: .1s; }
          .delay-2 { transition-delay: .22s; }
          .delay-3 { transition-delay: .36s; }
          .delay-4 { transition-delay: .5s; }

          /* Card hover */
          .pg-card { transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s; }
          .pg-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,.13); }
          .pg-card .card-img { transition: transform .5s cubic-bezier(.22,1,.36,1); }
          .pg-card:hover .card-img { transform: scale(1.07); }


          /* Step number */
          .step-num { width: 32px; height: 32px; border-radius: 50%; background: #2563eb; color: #fff; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

          /* Search bar input */
          .search-field { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
          .search-field label { font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #94a3b8; }
          .search-field input, .search-field select { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600; color: #0f1117; border: none; outline: none; background: transparent; width: 100%; }
          .search-field input::placeholder { color: #94a3b8; font-weight: 500; }

          /* University trust logos */
          .uni-logo { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #64748b; }

          /* Smooth section reveal via intersection observer */
          .reveal { opacity: 0; transform: translateY(32px); transition: opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1); }
          .reveal.visible { opacity: 1; transform: translateY(0); }
        `}</style>
      </Head>

      <div className="min-h-screen bg-white text-black/90">

        {/* ── NAVBAR ── */}
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            <button onClick={() => router.push("/")} className="font-display text-blue-600 text-lg font-bold tracking-tight cursor-pointer shrink-0">PG Connect</button>

            <div className="hidden md:flex items-center gap-0.5">
              {[["Explore", true], ["List Property", false], ["Student Guides", false], ["Help", false]].map(([l, active]) => (
                <button key={l}
                  onClick={() => l === "List Property" ? router.push("/propertys") : null}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer
                    ${active ? "text-blue-600 border-b-2 border-blue-600 rounded-none pb-[10px]" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
                  {l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => router.push("/signin")}
                className="bg-blue-600 hover:bg-blue-700 active:scale-[.98] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer hidden sm:block">
                Sign In
              </button>
              <button className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => setMenuOpen(!menuOpen)}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 flex flex-col gap-3">
              {["Explore", "List Property", "Student Guides", "Help"].map(l => (
                <button key={l} className="text-sm font-medium text-slate-600 text-left">{l}</button>
              ))}
              <button onClick={() => router.push("/signin")} className="bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl mt-1">Sign In</button>
            </div>
          )}
        </nav>

        {/* ── HERO ── */}
        <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-slate-50">
          {/* Background image right side */}
          <div className="absolute inset-0 flex">
            <div className="w-full md:w-1/2" />
            <div className="hidden md:block w-1/2 relative">
              <img
                src="https://images.unsplash.com/photo-1554995207-c18c203602cb?w=900&q=85"
                alt="Modern student room"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/40 to-transparent" />
            </div>
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 w-full text-black/90">
            <div className="max-w-xl">
              <div className={`hero-fade${heroVisible ? " in" : ""}`}>
                <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  2,400+ Verified Listings
                </span>
              </div>

              <h1 className={`font-display text-[3.2rem] sm:text-[4rem] lg:text-[4.8rem] leading-[1.05] font-bold tracking-tight mb-6 hero-fade${heroVisible ? " in" : ""} delay-1`}>
                Find your{" "}
                <span className="text-blue-600 italic">curated</span>
                <br />
                <span className="text-blue-600 italic">sanctuary</span> for
                <br />
                university life.
              </h1>

              <p className={`text-slate-500 text-base sm:text-lg leading-relaxed max-w-md mb-10 hero-fade${heroVisible ? " in" : ""} delay-2`}>
                Beyond just a room. Discover premium student living spaces hand-picked for comfort, community, and academic success.
              </p>

              {/* Search bar */}
              <div className={`hero-fade${heroVisible ? " in" : ""} delay-3 w-full`}>
                {/* Tablet & Desktop search (md and up) */}
                <div className="hidden md:flex bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-1 items-center gap-0.5 w-full lg:max-w-2xl">
                  <div className="search-field flex-1 px-3 sm:px-4 py-2.5 border-r border-slate-100 min-w-0">
                    {/* <label>Near University</label> */}
                    <input type="text" placeholder="Near University..." value={location} onChange={e => setLocation(e.target.value)} onKeyDown={e => e.key === "Enter" && goSearch()} />
                  </div>
                  <div className="search-field flex-1 px-3 sm:px-4 py-2.5 border-r border-slate-100 min-w-0">
                    {/* <label>Price Range</label> */}
                    <select value={price} onChange={e => setPrice(e.target.value)}>
                      <option>Price Range</option>
                      <option>Under ₹10k</option>
                      <option>₹10k–₹20k</option>
                      <option>Above ₹20k</option>
                    </select>
                  </div>
                  <div className="search-field flex-1 px-3 sm:px-4 py-2.5 min-w-0">
                    {/* <label>Gender</label> */}
                    <select value={gender} onChange={e => setGender(e.target.value)}>
                      <option>Gender</option>
                      <option>Boys</option>
                      <option>Girls</option>
                      <option>Co-ed</option>
                    </select>
                  </div>
                  <button onClick={goSearch} className="bg-blue-600 hover:bg-blue-700 active:scale-[.97] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shrink-0 m-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>

                {/* Small tablet search (sm to md) - Stack layout */}
                <div className="hidden sm:flex md:hidden flex-col gap-2.5">
                  <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="px-3.5 py-2.5 border-b border-slate-100">
                      <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Near University</label>
                      <input type="text" placeholder="Search by university..." value={location} onChange={e => setLocation(e.target.value)}
                        className="w-full text-xs sm:text-sm font-semibold text-slate-900 outline-none bg-transparent placeholder-slate-400" />
                    </div>
                    <div className="flex gap-0">
                      <div className="flex-1 px-3.5 py-2.5 border-r border-slate-100">
                        <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Price</label>
                        <select value={price} onChange={e => setPrice(e.target.value)} className="w-full text-xs sm:text-sm font-semibold text-slate-900 outline-none bg-transparent">
                          <option>Price Range</option><option>Under ₹10k</option><option>₹10k–₹20k</option><option>Above ₹20k</option>
                        </select>
                      </div>
                      <div className="flex-1 px-3.5 py-2.5">
                        <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Gender</label>
                        <select value={gender} onChange={e => setGender(e.target.value)} className="w-full text-xs sm:text-sm font-semibold text-slate-900 outline-none bg-transparent">
                          <option>Gender</option><option>Boys</option><option>Girls</option><option>Co-ed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <button onClick={goSearch} className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[.97] text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    Search
                  </button>
                </div>

                {/* Mobile search (below sm) - Full stack */}
                <div className="sm:hidden flex flex-col gap-2">
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Near University</label>
                      <input type="text" placeholder="Search by city or university..." value={location} onChange={e => setLocation(e.target.value)}
                        className="w-full text-sm font-semibold text-slate-900 outline-none bg-transparent placeholder-slate-400" />
                    </div>
                    <div className="flex">
                      <div className="flex-1 px-4 py-3 border-r border-slate-100">
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Price</label>
                        <select value={price} onChange={e => setPrice(e.target.value)} className="w-full text-sm font-semibold text-slate-900 outline-none bg-transparent">
                          <option>Price Range</option><option>Under ₹10k</option><option>₹10k–₹20k</option><option>Above ₹20k</option>
                        </select>
                      </div>
                      <div className="flex-1 px-4 py-3">
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Gender</label>
                        <select value={gender} onChange={e => setGender(e.target.value)} className="w-full text-sm font-semibold text-slate-900 outline-none bg-transparent">
                          <option>Gender</option><option>Boys</option><option>Girls</option><option>Co-ed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <button onClick={goSearch} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    Search Properties
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CURATED COLLECTIONS ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 ">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">Curated Collections</h2>
              <p className="text-sm text-slate-500 mt-1">Tailored living spaces for every student need.</p>
            </div>
            <button onClick={goSearch} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1">
              View All Collections
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {COLLECTIONS.map((c, i) => (
              <div key={c.label} className="relative overflow-hidden rounded-2xl cursor-pointer aspect-square w-full flex items-center justify-center group" onClick={goSearch}>
                <img src={c.img} alt={c.label} loading="lazy" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/0 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
                  <p className="text-white font-bold text-sm sm:text-base leading-tight">{c.label}</p>
                  <p className="text-white/70 text-xs mt-0.5">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TOP RATED PROPERTIES ── */}
        <section className="bg-slate-50 py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Top Rated Properties
              </span>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
                Discover the Best of Campus Living
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {featuredToShow.map(p => (
                <div key={p.id} className="pg-card bg-white rounded-2xl overflow-hidden border border-slate-200 cursor-pointer" onClick={() => router.push(`/property/${p.id}`)}>
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img src={p.img} alt={p.name} loading="lazy" className="card-img w-full h-full object-cover" />
                    <span className={`absolute top-3 left-3 ${p.badgeColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-full`}>{p.badge}</span>
                    <button onClick={e => toggleWishlist(e, p.id)} className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={wishlist.includes(p.id) ? "#ef4444" : "none"} stroke={wishlist.includes(p.id) ? "#ef4444" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <p className="font-bold text-sm text-slate-900 leading-snug">{p.name}</p>
                      <span className="flex items-center gap-0.5 text-xs font-bold text-slate-800 shrink-0">
                        <span className="text-blue-500">★</span>{p.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                      <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {p.dist}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-lg font-bold text-slate-900">${p.price}</span>
                        <span className="text-xs text-slate-400"> /month</span>
                      </div>
                      <button onClick={e => { e.stopPropagation(); router.push(`/property/${p.id}`); }}
                        className="border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRUST SECTION ── */}
        <section className="py-14 sm:py-20 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* University logos */}
            <div className="text-center mb-12">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Trusted by students from</p>
              <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
                {UNIVERSITIES.map(u => (
                  <div key={u} className="uni-logo">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                    {u}
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>{t.initials}</div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{t.name}</p>
                      <p className="text-[11px] text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THREE STEPS ── */}
        <section className="py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              {/* Left text */}
              <div className="flex-1 w-full">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-10">
                  Three steps to your new university life.
                </h2>
                <div className="space-y-7">
                  {STEPS.map(s => (
                    <div key={s.n} className="flex items-start gap-4">
                      <div className="step-num shrink-0 mt-0.5">{s.n}</div>
                      <div>
                        <p className="font-bold text-slate-900 text-base mb-1">{s.title}</p>
                        <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right image */}
              <div className="flex-1 w-full relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" alt="Student moving in" className="w-full h-72 sm:h-96 object-cover block" />
                </div>
                {/* Floating verified badge */}
                <div className="absolute bottom-6 left-6 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-slate-100">
                  <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Verified Status</p>
                    <p className="text-[10px] text-slate-400">Background check complete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="mx-4 sm:mx-6 lg:mx-8 mb-14 sm:mb-20 rounded-3xl bg-blue-600 overflow-hidden relative">
          {/* Decorative blobs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-500 rounded-full opacity-50" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-700 rounded-full opacity-40" />
          <div className="relative z-10 text-center px-6 py-16 sm:py-20">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              List your property and reach<br />
              <span className="italic">50k+ students.</span>
            </h2>
            <p className="text-blue-200 text-sm sm:text-base max-w-lg mx-auto mb-9 leading-relaxed">
              Join our curated network of property owners providing high-quality student housing across the globe.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => router.push("/list-property")}
                className="bg-white hover:bg-slate-50 active:scale-[.98] text-blue-700 font-bold text-sm px-7 py-3.5 rounded-2xl transition-all cursor-pointer">
                Get Started Now
              </button>
              <button className="border border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-7 py-3.5 rounded-2xl transition-all cursor-pointer">
                Speak to an Expert
              </button>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-display font-bold text-slate-900 text-base">PG Connect</p>
              <p className="text-xs text-slate-400 mt-0.5">© 2024 PG Connect. The Curated Sanctuary</p>
            </div>
            <div className="flex flex-wrap gap-5 items-center">
              {["About Us", "Privacy", "Terms", "Support", "Careers"].map(l => (
                <a key={l} href="#" className="text-xs text-slate-500 hover:text-blue-600 transition-colors">{l}</a>
              ))}
              <div className="flex items-center gap-2 ml-2">
                <button className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors cursor-pointer">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </button>
                <button className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors cursor-pointer">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}