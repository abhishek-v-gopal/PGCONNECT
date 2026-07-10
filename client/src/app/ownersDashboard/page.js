"use client";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getOwnerInquiries, updateInquiryStatus, getOwnerProperties } from "../api";

const tenants = [
  {
    id: 1,
    initials: "AK",
    color: "bg-blue-200 text-blue-700",
    name: "Aditya Kapoor",
    email: "aditya.k@university.edu",
    property: "Skyline Heights",
    room: "Room 402B (Shared)",
    status: "PAID",
    rent: "₹14,500",
    rentNote: "Due on 5th Oct",
    rentNoteColor: "text-slate-400",
  },
  {
    id: 2,
    initials: "MS",
    color: "bg-purple-200 text-purple-700",
    name: "Meera Sharma",
    email: "meera.s@iit.ac.in",
    property: "Green Park Villa",
    room: "Room 101 (Single)",
    status: "OVERDUE",
    rent: "₹22,000",
    rentNote: "3 days late",
    rentNoteColor: "text-red-500",
  },
  {
    id: 3,
    initials: "RS",
    color: "bg-amber-200 text-amber-700",
    name: "Rahul Singh",
    email: "rahul.singh@design.in",
    property: "Skyline Heights",
    room: "Room 205A (Shared)",
    status: "PROCESSING",
    rent: "₹12,800",
    rentNote: "Pending verification",
    rentNoteColor: "text-slate-400",
  },
];

const statusStyles = {
  PAID: "bg-green-50 text-green-700 border border-green-200",
  OVERDUE: "bg-red-50 text-red-600 border border-red-200",
  PROCESSING: "bg-[#dbeafe] text-[#1D4ED8] border border-blue-200",
};

const navItems = [
  {
    label: "Dashboard", active: true,
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
  },
  {
    label: "My Bookings", active: false,
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  },
  {
    label: "Payments", active: false,
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
  },
  {
    label: "Saved", active: false,
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  },
  {
    label: "Settings", active: false,
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  },
];

export default function OwnerDashboard() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [inquirySearch, setInquirySearch] = useState("");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [inquiryLoading, setInquiryLoading] = useState(true);
  const [inquiryError, setInquiryError] = useState("");
  const [seenInquiryIds, setSeenInquiryIds] = useState([]);
  const [updatingInquiryId, setUpdatingInquiryId] = useState(null);
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.property.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    let mounted = true;

    console.log("OwnerDashboard mounted. User data:", user);
    setUser(user);

    const loadInquiries = async () => {
      try {
        setInquiryLoading(true);
        setInquiryError("");
        const response = await getOwnerInquiries();
        const list = Array.isArray(response?.inquiries) ? response.inquiries : [];
        if (mounted) setInquiries(list);
      } catch (error) {
        if (mounted) {
          setInquiryError("Unable to load owner inquiries.");
          setInquiries([]);
        }
      } finally {
        if (mounted) setInquiryLoading(false);
      }
    };

    const loadProperties = async () => {
      try {
        const data = await getOwnerProperties();
        if (mounted && data.success) setProperties(data.properties || []);
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        if (mounted) setPropertiesLoading(false);
      }
    };

    loadProperties();

    loadInquiries();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {

    const stored = typeof window !== "undefined" ? localStorage.getItem("owner_seen_inquiry_ids") : null;
    const userData = typeof window !== "undefined" ? localStorage.getItem("user_data") : null;

    try {
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log("parsedUser:", parsedUser);

        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }

    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setSeenInquiryIds(parsed);
      }
    } catch {
      // ignore invalid localStorage data
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("owner_seen_inquiry_ids", JSON.stringify(seenInquiryIds));
  }, [seenInquiryIds]);

  const filteredInquiries = useMemo(() => {
    const q = inquirySearch.toLowerCase();
    return inquiries.filter((item) => {
      if (!q) return true;
      const name = String(item?.name || "").toLowerCase();
      const propertyName = String(item?.property?.name || "").toLowerCase();
      const phone = String(item?.phone || "").toLowerCase();
      return name.includes(q) || propertyName.includes(q) || phone.includes(q);
    });
  }, [inquiries, inquirySearch]);

  const isSeen = (item) => item?.status === "seen" || seenInquiryIds.includes(item?._id);

  const unseenCount = inquiries.reduce((count, item) => (isSeen(item) ? count : count + 1), 0);

  const markInquirySeen = (id) => {
    if (!id) return;
    setSeenInquiryIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const markAllInquiriesSeen = () => {
    const allIds = inquiries.map((item) => item?._id).filter(Boolean);
    setSeenInquiryIds((prev) => Array.from(new Set([...prev, ...allIds])));
  };

  const handleUpdateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      setUpdatingInquiryId(inquiryId);
      await updateInquiryStatus(inquiryId, newStatus);

      // Update local state
      setInquiries((prev) =>
        prev.map((item) =>
          item._id === inquiryId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error("Error updating inquiry status:", error);
      alert(`Failed to update status: ${error?.response?.data?.message || error.message}`);
    } finally {
      setUpdatingInquiryId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  
    // ✅ Place these BEFORE the return statement, INSIDE the component function
    const totalBeds = properties.reduce((s, p) => s + (p.totalBeds ?? 0), 0);
    const occupiedBeds = properties.reduce((s, p) => s + ((p.totalBeds ?? 0) - (p.availableBeds ?? 0)), 0);
    const availableBeds = properties.reduce((s, p) => s + (p.availableBeds ?? 0), 0);
    const occupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <>
      <Head>
        <title>Owner Dashboard — PG Connect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
        <style>{`
          body { font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
          .font-serif-display { font-family: 'DM Serif Display', serif; }
          .sidebar-scroll::-webkit-scrollbar { display: none; }
          .sidebar-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes slide-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }
          .slide-in { animation: slide-in 0.25s ease; }
        `}</style>
      </Head>

      <div className="min-h-screen flex flex-col" style={{ background: "#EFF6FF", color: "#1E3A5F" }}>

        {/* ── TOP NAV ── */}
        <header className="sticky top-0 z-50 bg-white border-b border-blue-100 shadow-sm h-14 flex items-center px-4 sm:px-6 gap-4">
          {/* Mobile hamburger */}
          <button className="lg:hidden p-1.5 rounded-lg transition-colors" style={{ color: "#1E3A5F60" }} onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Logo — shown only on mobile since desktop sidebar has it */}
          <div className="lg:hidden">
            <p className="font-bold text-base leading-tight" style={{ color: "#1D4ED8" }}>PG Connect</p>
          </div>

          {/* Center nav — desktop */}
          <div className="hidden lg:flex items-center gap-1 ml-4">
            <span className="text-lg font-bold mr-6" style={{ color: "#1E3A5F" }}>Owner Dashboard</span>
            {["Properties", "Analytics"].map((l) => (
              <button key={l} className="text-sm font-medium text-slate-500 hover:text-[#1D4ED8] px-3 py-1.5 rounded-lg hover:bg-[#EFF6FF] transition-all cursor-pointer" >{l}</button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-slate-500 hover:bg-[#EFF6FF] rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1E3A5F]">Notifications</span>
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">4 new</span>
                  </div>
                  {[
                    { text: "Aditya Kapoor paid ₹14,500", time: "2m ago", dot: "bg-green-500" },
                    { text: "Meera Sharma rent is overdue", time: "1h ago", dot: "bg-red-500" },
                    { text: "New booking request received", time: "3h ago", dot: "bg-blue-500" },
                    { text: "Skyline Heights — inspection due", time: "1d ago", dot: "bg-amber-500" },
                  ].map((n, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-[#EFF6FF] flex items-start gap-3 cursor-pointer transition-colors border-b border-slate-50" >
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.dot}`} />
                      <div>
                        <p className="text-xs text-slate-700 font-medium">{n.text}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-[#1E3A5F] leading-tight">{user?.FirstName || "Owner"}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{user?.role || "Owner"}</p>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: "#1D4ED8" }}>
                RK
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1">

          {/* ── SIDEBAR ── */}
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setSidebarOpen(false)} />
          )}

          <aside className={`
            fixed inset-y-0 left-0 z-50
            h-screen w-56 bg-white border-r border-blue-100
            flex flex-col overflow-hidden
            transition-transform duration-300
            ${sidebarOpen ? "translate-x-0 slide-in" : "-translate-x-full lg:translate-x-0"}
            lg:!sticky lg:top-14 lg:h-[calc(100vh-56px)] lg:self-start lg:z-30
          `}>
            {/* Logo inside sidebar (desktop) */}
            <div className="hidden lg:block px-5 pt-6 pb-4">
              <button onClick={() => router.push("/")} className="cursor-pointer">
                <p className="font-bold text-base leading-tight" style={{ color: "#1D4ED8" }}>PG Connect</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">Student Portal</p>
              </button>
            </div>

            {/* Mobile close */}
            <div className="lg:hidden flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
              <div>
                <p className="font-serif-display text-[#1D4ED8] text-base font-bold">PG Connect</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Student Portal</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { setActiveNav(item.label); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left"
                  style={activeNav === item.label ? { background: "#dbeafe", color: "#1D4ED8" } : { color: "#1E3A5F80" }}
                >
                  <span style={activeNav === item.label ? { color: "#1D4ED8" } : { color: "#1E3A5F60" }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Upgrade CTA */}
            <div className="p-4">
              <button className="w-full flex items-center justify-center gap-2 active:scale-[0.98] text-white text-sm font-semibold py-2.5 rounded-xl transition-all cursor-pointer" style={{ background: "#F97316" }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Upgrade to Pro
              </button>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 min-w-0">

            {/* Welcome row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: "#1E3A5F" }}>Welcome back, Rajesh.</h1>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Your properties are currently at{" "}
<strong className="text-slate-700">
  {propertiesLoading ? "..." : `${occupancyPct}% occupancy`}
</strong>. You have{" "}
<strong className="text-slate-700">{inquiries.length} inquiries</strong>{" "}
awaiting review.
                </p>
              </div>
              <div className="flex grid grid-cols-1 min-[425px]:grid-cols-2 gap-2.5 shrink-0">
                <button className="flex items-center gap-2 border border-slate-200 bg-white hover:border-blue-300 hover:bg-[#dbeafe] text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap">
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
                  </svg>
                  Update Availability
                </button>
                <button className="flex items-center gap-2 active:scale-[0.98] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap" style={{ background: "#1D4ED8" }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add New PG
                </button>
              </div>
            </div>

            {/* ── STAT CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

              {/* Total Beds */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-shadow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl" />
                <div className="flex items-start justify-between mb-4 pl-2">
                  <div className="w-10 h-10 bg-[#dbeafe] rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#1D4ED8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 14h20" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-[#EFF6FF] border border-slate-200 px-2 py-0.5 rounded-full" >
                    {properties.length} PGs
                  </span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-2">Total Bed Capacity</p>
                <p className="text-4xl font-bold text-[#1E3A5F] mt-1 pl-2"> {propertiesLoading ? "—" : totalBeds} </p>
                <p className="text-xs text-slate-400 mt-2 pl-2"> Across {properties.length} {properties.length === 1 ? "location" : "locations"} </p>
              </div>

              {/* Occupied Beds */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-shadow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500 rounded-l-2xl" />
                <div className="flex items-start justify-between mb-4 pl-2">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    {propertiesLoading ? "—" : `${occupancyPct}%`}
                  </span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-2">Occupied Beds</p>
                <p className="text-4xl font-bold text-[#1E3A5F] mt-1 pl-2">
                  {propertiesLoading ? "—" : occupiedBeds}
                </p>
                <div className="flex items-center gap-1.5 mt-2 pl-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  <p className="text-xs text-green-600 font-medium">
                    {propertiesLoading ? "Loading..." : occupancyPct >= 80 ? "Healthy high demand" : "Room to grow"}
                  </p>
                </div>
              </div>

              {/* Available Beds */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-shadow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-400 rounded-l-2xl" />
                <div className="flex items-start justify-between mb-4 pl-2">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                    </svg>
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-2">Available Beds</p>
                <p className="text-4xl font-bold text-[#1E3A5F] mt-1 pl-2">
                  {propertiesLoading ? "—" : availableBeds}
                </p>
                <div className="flex items-center mt-2 pl-2 gap-1 flex-wrap">
                  {properties.slice(0, 3).map((p, i) => (
                    <div
                      key={p.id}
                      title={p.name}
                      className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold ${["bg-blue-400", "bg-purple-400", "bg-amber-400"][i % 3]}`}
                    >
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                  ))}
                  {properties.length > 3 && (
                    <span className="text-xs text-slate-400 ml-1 font-medium">+{properties.length - 3}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── PROPERTY PERFORMANCE ── */}
            <div className="bg-white border border-slate-200 rounded-2xl mb-6 overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-[#1E3A5F]">Your Properties</h2>
                <p className="text-xs text-slate-400 mt-0.5">How many people have viewed and liked each listing.</p>
              </div>
              {propertiesLoading ? (
                <div className="px-5 sm:px-6 py-6 text-sm text-slate-400">Loading properties...</div>
              ) : properties.length === 0 ? (
                <div className="px-5 sm:px-6 py-6 text-sm text-slate-400">You haven't listed a property yet.</div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {properties.map((p) => (
                    <div key={p.id} className="px-5 sm:px-6 py-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#EFF6FF] shrink-0">
                        {p.property_images?.[0]?.image_url && (
                          <img src={p.property_images[0].image_url} alt={p.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#1E3A5F] truncate">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.city}</p>
                      </div>
                      <div className="flex items-center gap-5 shrink-0">
                        <div className="flex items-center gap-1.5" title="Views">
                          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          <span className="text-sm font-bold text-[#1E3A5F]">{p.views ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Likes">
                          <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                          <span className="text-sm font-bold text-[#1E3A5F]">{p.saves_count ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── TENANT MANAGEMENT ── */}
            <div className="bg-white border border-slate-200 rounded-2xl mb-6 overflow-hidden">
              <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-[#1E3A5F]">Owner Inquiries</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Separate section for all inquiry requests</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search inquiries..."
                      value={inquirySearch}
                      onChange={(e) => setInquirySearch(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-[#EFF6FF] border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all w-full" 
                    />
                  </div>
                </div>

                <div className="relative max-w-sm">
                </div>
              </div>

              {inquiryLoading && (
                <div className="px-5 sm:px-6 py-5 text-sm text-slate-500">Loading inquiries...</div>
              )}

              {!inquiryLoading && inquiryError && (
                <div className="px-5 sm:px-6 py-5 text-sm text-red-500">{inquiryError}</div>
              )}

              {!inquiryLoading && !inquiryError && filteredInquiries.length === 0 && (
                <div className="px-5 sm:px-6 py-5 text-sm text-slate-500">No inquiries found.</div>
              )}

              {!inquiryLoading && !inquiryError && filteredInquiries.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {[
                          "Name",
                          "Property",
                          "Phone",
                          "Move-in",
                          "Message",
                          "Status",
                          "Created",
                        ].map((h) => (
                          <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 px-6 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredInquiries.map((item) => (
                        <tr key={item._id} className={`hover:bg-[#EFF6FF]/70 transition-colors ${isSeen(item) ? "" : "bg-amber-50/30"}`}>
                          <td className="px-6 py-4 text-sm font-semibold text-[#1E3A5F]">{item?.name || "-"}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">{item?.property?.name || "-"}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">{item?.phone || "-"}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">{formatDate(item?.moveIn)}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{item?.message || "-"}</td>
                          <td className="px-6 py-4">
                            <select
                              value={item?.status || "new"}
                              disabled={updatingInquiryId === item._id}
                              onChange={(e) => {
                                markInquirySeen(item._id);
                                handleUpdateInquiryStatus(item._id, e.target.value);
                              }}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 ${item?.status === "closed" ? "bg-[#EFF6FF] text-slate-600 border-slate-200 focus:ring-slate-100" : item?.status === "contacted" ? "bg-green-50 text-green-700 border-green-200 focus:ring-green-100" : item?.status === "seen" ? "bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-100" : "bg-[#dbeafe] text-blue-700 border-blue-200 focus:ring-blue-100"}`}>
                              <option value="new">new</option>
                              <option value="contacted">contacted</option>
                              <option value="closed">closed</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{formatDate(item?.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── TENANT MANAGEMENT ── */}
            <div className="bg-white border border-slate-200 rounded-2xl mb-6 overflow-hidden">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-[#1E3A5F]">Tenant Management</h2>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search tenants..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-[#EFF6FF] border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all w-full sm:w-48" 
                  />
                </div>
              </div>

              {/* Table — desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Tenant Detail", "Property & Bed", "Status", "Monthly Rent", "Actions"].map((h) => (
                        <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 px-6 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((t) => (
                      <tr key={t.id} className="hover:bg-[#EFF6FF]/70 transition-colors group" >
                        {/* Tenant */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-xs font-bold shrink-0`}>{t.initials}</div>
                            <div>
                              <p className="text-sm font-semibold text-[#1E3A5F]">{t.name}</p>
                              <p className="text-xs text-slate-400">{t.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Property */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-800">{t.property}</p>
                          <p className="text-xs text-slate-400">{t.room}</p>
                        </td>
                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusStyles[t.status]}`}>{t.status}</span>
                        </td>
                        {/* Rent */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-[#1E3A5F]">{t.rent}</p>
                          <p className={`text-xs font-medium ${t.rentNoteColor}`}>{t.rentNote}</p>
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4">
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-[#EFF6FF] rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="5" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="19" r="1" fill="currentColor" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards — mobile */}
              <div className="sm:hidden divide-y divide-slate-100">
                {filtered.map((t) => (
                  <div key={t.id} className="px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-xs font-bold shrink-0`}>{t.initials}</div>
                        <div>
                          <p className="text-sm font-semibold text-[#1E3A5F]">{t.name}</p>
                          <p className="text-xs text-slate-400">{t.email}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusStyles[t.status]}`}>{t.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-700">{t.property}</p>
                        <p className="text-slate-400">{t.room}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1E3A5F]">{t.rent}</p>
                        <p className={`font-medium ${t.rentNoteColor}`}>{t.rentNote}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-slate-100">
                <p className="text-xs text-slate-400">Showing 1–{filtered.length} of 109 tenants</p>
                <div className="flex gap-3">
                  <button className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">Previous</button>
                  <button className="text-sm font-semibold text-[#1D4ED8] hover:text-blue-700 transition-colors cursor-pointer">Next</button>
                </div>
              </div>
            </div>

            {/* ── PROPERTY INSIGHTS ── */}
            <div>
              <h2 className="text-lg font-bold text-[#1E3A5F] mb-4">Property Insights</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Occupancy Optimization */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-sm transition-shadow">
                  <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">Occupancy Optimization</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-5">
                    Your Skyline Heights property has had 100% occupancy for 6 months. Consider a 5% rental adjustment for the next intake cycle.
                  </p>
                  {/* Big metric */}
                  <div className="bg-[#EFF6FF] border border-slate-200 rounded-xl p-4 flex flex-col items-center mb-4" >
                    <p className="text-5xl font-bold text-[#1D4ED8]">96%</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Annual Average</p>
                  </div>
                  <button className="text-sm font-semibold text-[#1D4ED8] hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer">
                    View Full Report
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>

                {/* Smart Pricing */}
                <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: "#1D4ED8" }}>
                  {/* Decorative blobs */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-500 rounded-full opacity-50" />
                  <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full opacity-20" style={{ background: "white" }} />

                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-blue-200 text-lg">✦</span>
                      <span className="text-blue-200 text-sm">✦</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Smart Pricing is Active</h3>
                    <p className="text-blue-200 text-sm leading-relaxed mb-6">
                      Adjusting room prices based on university exam season demand.
                    </p>
                    {/* Demand bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Demand Surge</p>
                        <span className="text-xs font-bold text-white bg-blue-500 px-2 py-0.5 rounded-full">+15%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1D4ED8" }}>
                        <div className="h-full bg-white rounded-full w-[85%] transition-all duration-1000" />
                      </div>
                    </div>
                    <button className="mt-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      View Pricing Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div className="h-8" />

            {/* Footer */}
            <footer className="border-t border-slate-200 pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-serif-display text-sm font-bold text-[#1E3A5F]">PG Connect</p>
                  <p className="text-xs text-slate-400 mt-0.5">© 2024 PG Connect. Curated Student Living.</p>
                </div>
                <div className="flex flex-wrap gap-5">
                  {[
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Terms of Service", href: "/terms" },
                    { label: "Help Center", href: "/help" },
                    { label: "Contact Us", href: "/contact" },
                  ].map((l) => (
                    <Link key={l.label} href={l.href} className="text-xs text-slate-500 hover:text-[#1D4ED8] transition-colors">{l.label}</Link>
                  ))}
                </div>
              </div>
            </footer>
          </main>
        </div>

        {/* Floating chat button */}
        <button className="fixed bottom-5 right-5 z-40 w-12 h-12 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer" style={{ background: "#1D4ED8" }}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
    </>
  );
}