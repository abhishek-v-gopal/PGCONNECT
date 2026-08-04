"use client";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAllProperties, getCurrentUser, saveProperty } from "./api";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Reveal, { Stagger, StaggerItem } from "./components/Reveal";
import AnimatedCounter from "./components/AnimatedCounter";

const COLLECTIONS = [
  { label: "Walk-to-Campus", sub: "Under 10 mins away", img: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&q=80" },
  { label: "Budget Friendly", sub: "Smart savings", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80" },
  { label: "Verified Luxury", sub: "Premium experiences", img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80" },
  { label: "Social Hubs", sub: "Vibrant communities", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80" },
];

const TESTIMONIALS = [
  { quote: "Found my perfect room in less than 24 hours. The verification process gave me peace of mind before I even arrived in the city.", name: "Jordan Davies", role: "Computer Science, Stanford", initials: "JD", color: "bg-[var(--pg-primary)]" },
  { quote: "The 'Walk-to-Campus' filter was a lifesaver. PG Connect actually visits these places, which is clear from the quality of photos.", name: "Sarah Lin", role: "Architecture, MIT", initials: "SL", color: "bg-slate-500" },
  { quote: "I love the social hub listings. I moved into a community of like-minded students and felt at home from day one.", name: "Marcus King", role: "Economics, Oxford", initials: "MK", color: "bg-slate-700" },
];

const STEPS = [
  { n: 1, title: "Search with Intent", desc: "Filter by distance, price, and lifestyle. Find exactly where you belong." },
  { n: 2, title: "Virtual or In-Person Visit", desc: "Book a tour through our platform. No hidden surprises, just verified truth." },
  { n: 3, title: "Seamless Move-In", desc: "Handle all paperwork and first month's payment securely through PG Connect." },
];

const STATS = [
  { value: "2,400+", label: "Verified Listings" },
  { value: "50k+", label: "Happy Students" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "Kerala", label: "Campus Coverage" },
];

export default function Home() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("Price Range");
  const [gender, setGender] = useState("Gender");
  const [wishlist, setWishlist] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const featuredProperties = properties
    .slice()
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  const displayedFeatured = featuredProperties.filter((p) => {
    if (location && !String(p.location || "").toLowerCase().includes(location.toLowerCase())) return false;
    if (price === "Under ₹10k" && Number(p.price) >= 10000) return false;
    if (price === "₹10k–₹20k" && (Number(p.price) < 10000 || Number(p.price) > 20000)) return false;
    if (price === "Above ₹20k" && Number(p.price) <= 20000) return false;
    if (gender !== "Gender" && gender !== "Any" && p.gender && p.gender !== gender && p.gender !== "Co-ed") return false;
    return true;
  });

  const featuredToShow = displayedFeatured.length > 0 ? displayedFeatured : featuredProperties;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const response = await getAllProperties();
        const raw = Array.isArray(response) ? response : Array.isArray(response?.properties) ? response.properties : [];
        const list = raw.map((p) => ({
          id: p.id,
          name: p.name || "Untitled Property",
          location: p.address || p.city || "",
          dist: p.landmark || p.city || "",
          rating: p.rating ?? 0,
          price: Number(p.starting_price ?? p.property_rooms?.[0]?.price ?? 0),
          badge: p.is_verified || p.status === "verified" ? "VERIFIED" : null,
          img: p.property_images?.[0]?.image_url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
          gender: p.gender || "Any",
        }));
        if (mounted) setProperties(list);
      } catch {
        if (mounted) setProperties([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const toggleWishlist = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await saveProperty(id);
      if (res?.success && res?.saved) {
        setWishlist(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
        try {
          const user = await getCurrentUser();
          const role = user?.role || user?.data?.role || "";
          if (String(role).toLowerCase() === "student") { router.push("/propertys"); return; }
          if (["owner", "landlord"].includes(String(role).toLowerCase())) { router.push("/ownersDashboard"); return; }
        } catch {}
      }
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) router.push('/signin');
    }
  };

  const goSearch = () => router.push(`/propertys?location=${encodeURIComponent(location || "Kerala")}&price=${encodeURIComponent(price)}&gender=${encodeURIComponent(gender)}`);

  return (
    <>
      <Head>
        <title>PG Connect — Find Your Perfect PG in Kerala</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html { scroll-behavior: smooth; }
          body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--pg-bg); color: var(--pg-text); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
          .font-display { font-family: 'Fraunces', serif; }
          select { appearance: none; background: transparent; cursor: pointer; }
          .no-scroll::-webkit-scrollbar { display: none; }
          .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          .pg-card-hover { transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s; }
          .pg-card-hover:hover { transform: translateY(-8px); box-shadow: 0 24px 55px rgba(29,78,216,.16); }
          .pg-card-hover .card-img { transition: transform .6s cubic-bezier(.22,1,.36,1); }
          .pg-card-hover:hover .card-img { transform: scale(1.08); }
          .search-field { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
          .search-field label { font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #94a3b8; }
          .search-field input, .search-field select { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600; color: var(--pg-text); border: none; outline: none; background: transparent; width: 100%; }
          .search-field input::placeholder { color: #94a3b8; font-weight: 500; }
        `}</style>
      </Head>

      <div className="min-h-screen" style={{ background: "var(--pg-bg)", color: "var(--pg-text)" }}>

        <Navbar />

        {/* ── HERO ── */}
        <section id="main-content" className="relative min-h-[88vh] flex items-center overflow-hidden" style={{ background: "var(--pg-bg)" }}>
          {/* Right side image */}
          <div className="absolute inset-0 flex">
            <div className="w-full md:w-1/2" />
            <div className="hidden md:block w-1/2 relative">
              <img
                src="https://images.unsplash.com/photo-1554995207-c18c203602cb?w=900&q=85"
                alt="Modern student room"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, var(--pg-bg), var(--pg-bg) 40%, transparent)" }} />
            </div>
          </div>
          {/* Animated decorative blobs */}
          <div className="pg-blob absolute top-20 right-[48%] w-64 h-64 rounded-full opacity-20 blur-2xl pointer-events-none" style={{ background: "var(--pg-primary)" }} />
          <div className="pg-blob-alt absolute bottom-0 left-[8%] w-52 h-52 rounded-full opacity-10 blur-2xl pointer-events-none" style={{ background: "var(--pg-accent)" }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 w-full" style={{ color: "var(--pg-text)" }}>
            <div className="max-w-xl">
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 border text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6"
                style={{ background: "var(--pg-chip-bg)", borderColor: "var(--pg-border)", color: "var(--pg-primary)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--pg-primary)" }} />
                2,400+ Verified Listings in Kerala
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-[3.2rem] sm:text-[4rem] lg:text-[4.8rem] leading-[1.05] font-bold tracking-tight mb-6"
                style={{ color: "var(--pg-text)" }}>
                Find your{" "}
                <span style={{ color: "var(--pg-primary)" }} className="italic">perfect PG</span>
                <br />
                near your{" "}
                <span style={{ color: "var(--pg-accent)" }} className="italic">campus.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="text-base sm:text-lg leading-relaxed max-w-md mb-10" style={{ color: "var(--pg-text-secondary)" }}>
                Kerala's trusted PG marketplace for students. Verified listings, transparent pricing, and a referral program that rewards your network.
              </motion.p>

              {/* Search bar — desktop */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
                className="w-full">
                <div className="hidden md:flex bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-blue-100 overflow-hidden p-1 items-center gap-0.5 w-full lg:max-w-2xl">
                  <div className="search-field flex-1 px-3 sm:px-4 py-2.5 border-r border-blue-50 min-w-0">
                    <input type="text" placeholder="Near University..." value={location} onChange={e => setLocation(e.target.value)} onKeyDown={e => e.key === "Enter" && goSearch()} />
                  </div>
                  <div className="search-field flex-1 px-3 sm:px-4 py-2.5 border-r border-blue-50 min-w-0">
                    <select value={price} onChange={e => setPrice(e.target.value)}>
                      <option>Price Range</option>
                      <option>Under ₹10k</option>
                      <option>₹10k–₹20k</option>
                      <option>Above ₹20k</option>
                    </select>
                  </div>
                  <div className="search-field flex-1 px-3 sm:px-4 py-2.5 min-w-0">
                    <select value={gender} onChange={e => setGender(e.target.value)}>
                      <option>Gender</option>
                      <option>Boys</option>
                      <option>Girls</option>
                      <option>Co-ed</option>
                    </select>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={goSearch}
                    className="text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 m-0.5"
                    style={{ background: "var(--pg-primary)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--pg-primary-dark)"}
                    onMouseLeave={e => e.currentTarget.style.background = "var(--pg-primary)"}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <span className="hidden sm:inline">Search</span>
                  </motion.button>
                </div>

                {/* Mobile search */}
                <div className="md:hidden flex flex-col gap-2">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-blue-50">
                      <input type="text" placeholder="Search by city or university..." value={location} onChange={e => setLocation(e.target.value)}
                        className="w-full text-sm font-semibold outline-none bg-transparent placeholder-slate-400" style={{ color: "var(--pg-text)" }} />
                    </div>
                    <div className="flex">
                      <div className="flex-1 px-4 py-3 border-r border-blue-50">
                        <select value={price} onChange={e => setPrice(e.target.value)} className="w-full text-sm font-semibold outline-none bg-transparent" style={{ color: "var(--pg-text)" }}>
                          <option>Price Range</option><option>Under ₹10k</option><option>₹10k–₹20k</option><option>Above ₹20k</option>
                        </select>
                      </div>
                      <div className="flex-1 px-4 py-3">
                        <select value={gender} onChange={e => setGender(e.target.value)} className="w-full text-sm font-semibold outline-none bg-transparent" style={{ color: "var(--pg-text)" }}>
                          <option>Gender</option><option>Boys</option><option>Girls</option><option>Co-ed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={goSearch} className="w-full text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
                    style={{ background: "var(--pg-primary)" }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    Search Properties
                  </motion.button>
                </div>
              </motion.div>

              {/* Popular searches */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.46 }}
                className="mt-5 flex flex-wrap gap-2">
                <span className="text-xs font-semibold" style={{ color: "var(--pg-text-secondary)" }}>Popular:</span>
                {["Thrissur", "Kozhikode", "Kochi", "Trivandrum"].map(city => (
                  <motion.button key={city} whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.96 }} onClick={() => { setLocation(city); goSearch(); }}
                    className="text-xs font-semibold px-3 py-1 rounded-full border border-blue-200 hover:border-[var(--pg-primary)] hover:text-[var(--pg-primary)] transition-colors cursor-pointer"
                    style={{ background: "var(--pg-surface)", color: "var(--pg-text)" }}>
                    {city}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="pg-gradient-animated py-8" style={{ background: "linear-gradient(120deg, var(--pg-primary), var(--pg-primary-dark), var(--pg-primary))" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center text-white" staggerChildren={0.1}>
              {STATS.map(s => (
                <StaggerItem key={s.label}>
                  <p className="text-2xl sm:text-3xl font-bold">
                    <AnimatedCounter value={s.value} />
                  </p>
                  <p className="text-sm text-blue-200 mt-0.5">{s.label}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── CURATED COLLECTIONS ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <Reveal className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--pg-text)" }}>Curated Collections</h2>
              <p className="text-sm mt-1" style={{ color: "var(--pg-text-secondary)" }}>Tailored living spaces for every student need.</p>
            </div>
            <button onClick={goSearch} className="text-sm font-semibold hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap flex items-center gap-1" style={{ color: "var(--pg-primary)" }}>
              View All
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </Reveal>

          <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" staggerChildren={0.08}>
            {COLLECTIONS.map((c) => (
              <StaggerItem key={c.label}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="relative overflow-hidden rounded-2xl cursor-pointer aspect-square flex items-center justify-center group shadow-sm hover:shadow-xl"
                  onClick={goSearch}>
                  <img src={c.img} alt={c.label} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
                    <p className="text-white font-bold text-sm sm:text-base leading-tight">{c.label}</p>
                    <p className="text-white/70 text-xs mt-0.5">{c.sub}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* ── TOP RATED PROPERTIES ── */}
        <section className="py-14 sm:py-20" style={{ background: "var(--pg-surface)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Reveal className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 border text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4"
                style={{ background: "var(--pg-chip-bg)", borderColor: "var(--pg-border)", color: "var(--pg-primary)" }}>
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Top Rated Properties
              </span>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: "var(--pg-text)" }}>
                Discover the Best PGs in Kerala
              </h2>
            </Reveal>

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {[1,2,3,4].map(i => <div key={i} className="pg-skeleton h-72 rounded-2xl" />)}
              </div>
            )}

            {!loading && (
              <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5" staggerChildren={0.08}>
                {featuredToShow.map(p => (
                  <StaggerItem key={p.id}>
                    <div className="pg-card-hover bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border cursor-pointer h-full"
                      style={{ borderColor: "var(--pg-border-soft)" }}
                      onClick={() => router.push(`/property/${p.id}`)}>
                      <div className="relative overflow-hidden aspect-[4/3]">
                        <img src={p.img} alt={p.name} loading="lazy" className="card-img w-full h-full object-cover" />
                        {p.badge && (
                          <span className="absolute top-3 left-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                            style={{ background: "#06B6D4" }}>
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                            {p.badge}
                          </span>
                        )}
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={e => toggleWishlist(e, p.id)} className="absolute top-3 right-3 w-7 h-7 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md cursor-pointer">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"
                            fill={wishlist.includes(p.id) ? "#ef4444" : "none"}
                            stroke={wishlist.includes(p.id) ? "#ef4444" : "#94a3b8"}
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </motion.button>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <p className="font-bold text-sm leading-snug" style={{ color: "var(--pg-text)" }}>{p.name}</p>
                          <span className="flex items-center gap-0.5 text-xs font-bold shrink-0" style={{ color: "var(--pg-text)" }}>
                            <span style={{ color: "var(--pg-accent)" }}>★</span>{p.rating}
                          </span>
                        </div>
                        <p className="text-xs mb-3 flex items-center gap-1" style={{ color: "var(--pg-text-secondary)" }}>
                          <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {p.dist}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="text-lg font-bold" style={{ color: "var(--pg-text)" }}>₹{p.price.toLocaleString('en-IN')}</span>
                            <span className="text-xs" style={{ color: "var(--pg-text-secondary)" }}> /month</span>
                          </div>
                          <button onClick={e => { e.stopPropagation(); router.push(`/property/${p.id}`); }}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer border"
                            style={{ borderColor: "var(--pg-border)", color: "var(--pg-primary)" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--pg-primary)"; e.currentTarget.style.background = "var(--pg-chip-bg)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--pg-border)"; e.currentTarget.style.background = "transparent"; }}>
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            )}

            <Reveal className="text-center mt-10" delay={0.1}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={goSearch} className="text-white font-bold px-8 py-3.5 rounded-2xl cursor-pointer shadow-md hover:shadow-lg"
                style={{ background: "var(--pg-primary)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--pg-primary-dark)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--pg-primary)"}>
                View All Properties
              </motion.button>
            </Reveal>
          </div>
        </section>

        {/* ── TRUST SECTION ── */}
        <section className="py-14 sm:py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Reveal className="text-center mb-12">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-6" style={{ color: "var(--pg-text-tertiary)" }}>Trusted by students from</p>
              <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
                {["Calicut University", "CUSAT", "Kerala University", "NIT Calicut"].map(u => (
                  <div key={u} className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--pg-text-secondary)" }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                    {u}
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Testimonials */}
            <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-5" staggerChildren={0.1}>
              {TESTIMONIALS.map((t, i) => (
                <StaggerItem key={i}>
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border h-full shadow-sm hover:shadow-lg" style={{ borderColor: "var(--pg-border-soft)" }}>
                    <div className="flex gap-1 mb-4">
                      {[1,2,3,4,5].map(s => <span key={s} style={{ color: "var(--pg-accent)" }}>★</span>)}
                    </div>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--pg-text)" }}>"{t.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>{t.initials}</div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: "var(--pg-text)" }}>{t.name}</p>
                        <p className="text-[11px]" style={{ color: "var(--pg-text-secondary)" }}>{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── THREE STEPS ── */}
        <section className="py-14 sm:py-20 overflow-hidden" style={{ background: "var(--pg-surface)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <Reveal direction="right" className="flex-1 w-full">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-10" style={{ color: "var(--pg-text)" }}>
                  Three steps to your new university life.
                </h2>
                <Stagger className="space-y-7" staggerChildren={0.12}>
                  {STEPS.map(s => (
                    <StaggerItem key={s.n}>
                      <div className="flex items-start gap-4">
                        <motion.div whileHover={{ scale: 1.1, rotate: 6 }} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5"
                          style={{ background: "var(--pg-primary)" }}>
                          {s.n}
                        </motion.div>
                        <div>
                          <p className="font-bold text-base mb-1" style={{ color: "var(--pg-text)" }}>{s.title}</p>
                          <p className="text-sm leading-relaxed" style={{ color: "var(--pg-text-secondary)" }}>{s.desc}</p>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </Reveal>

              <Reveal direction="left" delay={0.15} className="flex-1 w-full relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" alt="Student moving in" className="w-full h-72 sm:h-96 object-cover block" />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="absolute bottom-6 left-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-blue-100">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--pg-primary)" }}>
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "var(--pg-text)" }}>Verified Status</p>
                    <p className="text-[10px]" style={{ color: "var(--pg-text-secondary)" }}>Background check complete</p>
                  </div>
                </motion.div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── REFERRAL BANNER ── */}
        <Reveal as="section" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="rounded-3xl overflow-hidden relative p-8 sm:p-12 text-white"
            style={{ background: "var(--pg-primary)" }}>
            <div className="pg-blob absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20 pointer-events-none" style={{ background: "#ffffff" }} />
            <div className="pg-blob-alt absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-10 pointer-events-none" style={{ background: "#ffffff" }} />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ background: "rgba(249,115,22,0.3)", color: "#fed7aa" }}>
                  Earn While You Help
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-2">
                  Refer a PG owner,<br />earn 2% commission every month.
                </h2>
                <p className="text-blue-100 text-sm">Share your unique link. Get paid when tenants pay rent.</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} onClick={() => router.push("/register")}
                className="shrink-0 font-bold text-sm px-7 py-3.5 rounded-2xl cursor-pointer whitespace-nowrap shadow-lg"
                style={{ background: "var(--pg-accent)", color: "white" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--pg-accent-dark)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--pg-accent)"}>
                Start Earning Now
              </motion.button>
            </div>
          </div>
        </Reveal>

        {/* ── CTA BANNER ── */}
        <Reveal as="section" className="mx-4 sm:mx-6 lg:mx-8 mb-14 sm:mb-20 rounded-3xl overflow-hidden relative"
          >
          <div style={{ background: "var(--pg-cta-bg)" }} className="relative overflow-hidden rounded-3xl">
            <div className="pg-blob absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 pointer-events-none" style={{ background: "white" }} />
            <div className="pg-blob-alt absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ background: "white" }} />
            <div className="relative z-10 text-center px-6 py-16 sm:py-20">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                List your property and reach<br />
                <span className="italic">50k+ students.</span>
              </h2>
              <p className="text-sm sm:text-base max-w-lg mx-auto mb-9 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                Join our curated network of property owners providing high-quality student housing across Kerala.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} onClick={() => router.push("/listProperty")}
                  className="font-bold text-sm px-7 py-3.5 rounded-2xl cursor-pointer shadow-lg"
                  style={{ background: "var(--pg-accent)", color: "white" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--pg-accent-dark)"}
                  onMouseLeave={e => e.currentTarget.style.background = "var(--pg-accent)"}>
                  Get Started Now
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="border font-semibold text-sm px-7 py-3.5 rounded-2xl cursor-pointer text-white"
                  style={{ borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)" }}>
                  Speak to an Expert
                </motion.button>
              </div>
            </div>
          </div>
        </Reveal>

        <Footer />
      </div>
    </>
  );
}
