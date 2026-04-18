"use client";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ── DATA ─────────────────────────────────────────────────────────────────────
const GROWTH_DATA = [
  { label: "01 Oct", signups: 30, bookings: 55 },
  { label: "05 Oct", signups: 45, bookings: 75 },
  { label: "10 Oct", signups: 60, bookings: 100 },
  { label: "13 Oct", signups: 40, bookings: 70 },
  { label: "16 Oct", signups: 55, bookings: 90 },
  { label: "20 Oct", signups: 80, bookings: 130 },
  { label: "23 Oct", signups: 90, bookings: 145 },
  { label: "25 Oct", signups: 75, bookings: 120 },
  { label: "27 Oct", signups: 65, bookings: 110 },
  { label: "30 Oct", signups: 20, bookings: 40 },
];

const VERIFICATION_QUEUE = [
  { id: 1, name: "Skyline Residency", owner: "Michael Chen", submitted: "Oct 24, 2023", status: "NEW", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=80&q=60" },
  { id: 2, name: "The Urban Loft", owner: "Sarah Jenkins", submitted: "Oct 23, 2023", status: "IN REVIEW", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&q=60" },
  { id: 3, name: "Heritage Commons", owner: "David Miller", submitted: "Oct 22, 2023", status: "NEW", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=80&q=60" },
];

const ALERTS = [
  { priority: "HIGH PRIORITY", time: "2M AGO", title: "Content Reporting Spike", desc: "Property ID #8291 has received 15+ reports in the last hour regarding fraudulent listings.", action: "TAKE ACTION", priorityColor: "text-red-600", bg: "bg-white border-l-4 border-red-500" },
  { priority: "SYSTEM", time: "1H AGO", title: "Server Load Warning", desc: "API response times in the North Region are exceeding 400ms. Investigating node scaling.", action: null, priorityColor: "text-slate-500", bg: "bg-white" },
  { priority: "SECURITY", time: "4H AGO", title: "Failed Login Threshold", desc: "Multiple failed login attempts detected on Admin Account 'region_manager_01'.", action: null, priorityColor: "text-slate-500", bg: "bg-white" },
];

const NAV_ITEMS = [
  { label: "Dashboard", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { label: "Properties", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { label: "Users", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label: "Verification", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { label: "Analytics", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { label: "Settings", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

// ── BAR CHART ─────────────────────────────────────────────────────────────────
function BarChart({ data }) {
  const maxVal = Math.max(...data.map((d) => d.bookings));
  return (
    <div className="flex items-end gap-1.5 sm:gap-2 h-40 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: "140px" }}>
            {/* Bookings bar (behind, light blue) */}
            <div className="relative w-full rounded-t-md overflow-hidden" style={{ height: `${(d.bookings / maxVal) * 100}%` }}>
              <div className="absolute inset-0 bg-blue-200 rounded-t-md" />
              {/* Signups bar (front, solid blue) */}
              <div className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded-t-md transition-all" style={{ height: `${(d.signups / d.bookings) * 100}%` }} />
            </div>
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium whitespace-nowrap hidden sm:block">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── STATUS BADGE ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    "NEW": "bg-green-50 text-green-700 border border-green-200",
    "IN REVIEW": "bg-blue-50 text-blue-600 border border-blue-200",
    "APPROVED": "bg-slate-50 text-slate-500 border border-slate-200",
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${styles[status] || styles["NEW"]}`}>
      {status}
    </span>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [queue, setQueue] = useState(VERIFICATION_QUEUE);
  const [refreshing, setRefreshing] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [tick, setTick] = useState(0);

  // Animate health bars on mount
  useEffect(() => { const t = setTimeout(() => setTick(1), 100); return () => clearTimeout(t); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleReview = (id, action) => {
    setQueue((prev) => prev.map((p) => p.id === id ? { ...p, status: action === "approve" ? "APPROVED" : "IN REVIEW" } : p));
  };

  const visibleAlerts = ALERTS.filter((_, i) => !dismissedAlerts.includes(i));

  return (
    <>
      <Head>
        <title>Admin Panel — PG Connect</title>
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
          .slide-in { animation: slide-in 0.2s ease; }
          @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }
          .shimmer { animation: shimmer 1s ease-in-out infinite; }
        `}</style>
      </Head>

      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">

        {/* ── TOP HEADER ── */}
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 h-14 flex items-center px-4 sm:px-5 gap-3">
          {/* Mobile hamburger */}
          <button className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Logo — mobile only */}
          <div className="lg:hidden">
            <p className="font-bold text-blue-600 text-sm leading-tight">Editorial Admin</p>
            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">PG Management</p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md relative hidden sm:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search platform data..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
          </div>

          <div className="flex-1" />

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"/>
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Admin Alerts</span>
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">3 urgent</span>
                  </div>
                  {ALERTS.map((a, i) => (
                    <div key={i} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                      <p className="text-xs font-bold text-slate-700">{a.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{a.priority} · {a.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Support */}
            <button className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span className="hidden md:inline text-xs uppercase tracking-wider font-bold">Support</span>
            </button>

            {/* Admin label */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-blue-600 leading-tight">Editorial Living Admin</p>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0 cursor-pointer">SA</div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">

          {/* ── MOBILE SIDEBAR OVERLAY ── */}
          {sidebarOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setSidebarOpen(false)} />}

          {/* ── SIDEBAR ── */}
          <aside className={`
            fixed lg:sticky top-0 lg:top-14 z-50 lg:z-auto
            h-screen lg:h-[calc(100vh-56px)]
            w-56 bg-white border-r border-slate-200
            flex flex-col sidebar-scroll overflow-y-auto
            transition-transform duration-250
            ${sidebarOpen ? "translate-x-0 slide-in" : "-translate-x-full lg:translate-x-0"}
          `}>
            {/* Logo block — desktop */}
            <div className="hidden lg:block px-5 pt-5 pb-4 border-b border-slate-100">
              <p className="font-bold text-blue-600 text-sm leading-tight">Editorial Admin</p>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">PG Management Portal</p>
            </div>

            {/* Mobile close */}
            <div className="lg:hidden flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
              <div>
                <p className="font-bold text-blue-600 text-sm">Editorial Admin</p>
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">PG Management Portal</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <button key={item.label}
                  onClick={() => { setActiveNav(item.label); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left relative
                    ${activeNav === item.label
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  {activeNav === item.label && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r-full" />
                  )}
                  <span className={activeNav === item.label ? "text-blue-600" : "text-slate-400"}>{item.icon}</span>
                  {item.label}
                  {item.label === "Verification" && (
                    <span className="ml-auto text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">142</span>
                  )}
                </button>
              ))}
            </nav>

            {/* Add Property + Profile */}
            <div className="p-3 space-y-3 border-t border-slate-100">
              <button onClick={() => router.push("/list-property")}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold py-2.5 rounded-xl transition-all cursor-pointer">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Property
              </button>
              <div className="flex items-center gap-3 px-1 cursor-pointer group">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white text-xs font-bold shrink-0">SA</div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">Admin Profile</p>
                  <p className="text-[10px] text-slate-400">Super Administrator</p>
                </div>
              </div>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <main className="flex-1 overflow-y-auto min-w-0">
            <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1200px]">

              {/* ── PAGE TITLE ── */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Platform Overview</h1>
                  <p className="text-sm text-slate-500 mt-1">Real-time performance and operational metrics for PG Connect.</p>
                </div>
                <div className="flex gap-2.5 shrink-0">
                  <button className="flex items-center gap-2 border border-slate-200 bg-white hover:border-slate-300 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer">
                    <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Export Report
                  </button>
                  <button onClick={handleRefresh}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer">
                    <svg className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
                    </svg>
                    {refreshing ? "Refreshing…" : "Refresh Data"}
                  </button>
                </div>
              </div>

              {/* ── STAT CARDS ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7">
                {/* Total Revenue */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">+12.5%</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">$428,940</p>
                </div>

                {/* Total Active Users */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"/>Active
                    </span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Active Users</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">24,512</p>
                  <p className="text-[10px] text-slate-400 mt-1">18k Students / 6.5k Owners</p>
                </div>

                {/* Pending Verifications */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Urgent</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pending Verifications</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">142</p>
                </div>

                {/* Active Listings */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">+84 New</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Active Listings</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">8,924</p>
                </div>
              </div>

              {/* ── CHART + ALERTS ROW ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

                {/* Chart */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Platform Growth</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Daily signups and bookings over the last 30 days</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-600 inline-block"/># Signups</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-200 inline-block"/># Bookings</span>
                    </div>
                  </div>
                  <BarChart data={GROWTH_DATA} />
                  {/* X-axis labels mobile */}
                  <div className="flex justify-between mt-2 sm:hidden">
                    {["01 Oct", "10 Oct", "20 Oct", "30 Oct"].map((l) => (
                      <span key={l} className="text-[9px] text-slate-400">{l}</span>
                    ))}
                  </div>
                </div>

                {/* Alerts */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <h2 className="text-sm font-bold text-slate-900">Critical Alerts</h2>
                    {visibleAlerts.length > 0 && <span className="ml-auto text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{visibleAlerts.length}</span>}
                  </div>
                  <div className="divide-y divide-slate-50 overflow-y-auto max-h-72 lg:max-h-none">
                    {visibleAlerts.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                        <svg className="w-8 h-8 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        <p className="text-xs font-medium">All clear!</p>
                      </div>
                    )}
                    {ALERTS.map((a, i) => !dismissedAlerts.includes(i) && (
                      <div key={i} className={`p-4 ${i === 0 ? "border-l-4 border-red-500" : ""}`}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${a.priorityColor}`}>{a.priority}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{a.time}</span>
                            <button onClick={() => setDismissedAlerts((p) => [...p, i])} className="text-slate-300 hover:text-slate-500 cursor-pointer">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-slate-800 mb-1">{a.title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{a.desc}</p>
                        {a.action && (
                          <button className="mt-2 text-[10px] font-bold text-red-600 hover:text-red-700 uppercase tracking-wider cursor-pointer transition-colors">
                            {a.action} →
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── VERIFICATION QUEUE + SYSTEM HEALTH ROW ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

                {/* Verification Queue */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">Property Verification Queue</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Review newly submitted properties for platform standards.</p>
                  </div>

                  {/* Table — desktop */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {["Property Name", "Owner", "Submitted", "Status", "Action"].map((h) => (
                            <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 px-5 sm:px-6 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {queue.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                            <td className="px-5 sm:px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                                  <img src={p.image} alt={p.name} className="w-full h-full object-cover"/>
                                </div>
                                <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                              </div>
                            </td>
                            <td className="px-5 sm:px-6 py-3.5 text-sm text-slate-600">{p.owner}</td>
                            <td className="px-5 sm:px-6 py-3.5 text-sm text-slate-500">{p.submitted}</td>
                            <td className="px-5 sm:px-6 py-3.5"><StatusBadge status={p.status}/></td>
                            <td className="px-5 sm:px-6 py-3.5">
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleReview(p.id, "approve")} className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors">Review</button>
                                <span className="text-slate-200">|</span>
                                <button onClick={() => handleReview(p.id, "reject")} className="text-xs font-medium text-slate-400 hover:text-red-500 cursor-pointer transition-colors">Reject</button>
                              </div>
                              {/* Always visible on non-hover */}
                              <button onClick={() => handleReview(p.id, "review")} className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors group-hover:hidden">Review</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards — mobile */}
                  <div className="sm:hidden divide-y divide-slate-100">
                    {queue.map((p) => (
                      <div key={p.id} className="px-4 py-3.5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover"/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.owner} · {p.submitted}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <StatusBadge status={p.status}/>
                          <button onClick={() => handleReview(p.id, "review")} className="text-xs font-bold text-blue-600 cursor-pointer">Review</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100">
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer flex items-center gap-1">
                      View All Pending Verifications (142)
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Right column — System Health + Moderators */}
                <div className="space-y-4">

                  {/* System Health */}
                  <div className="bg-blue-600 rounded-2xl p-5 text-white relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500 rounded-full opacity-40"/>
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-700 rounded-full opacity-40"/>
                    <div className="relative z-10">
                      <h3 className="text-sm font-bold mb-4">System Health</h3>
                      <div className="space-y-3.5">
                        {[
                          { label: "API STATUS", value: "99.98%", pct: 99.98, color: "bg-green-400" },
                          { label: "DATABASE LATENCY", value: "12MS", pct: 88, color: "bg-green-400" },
                          { label: "STORAGE CAPACITY", value: "64%", pct: 64, color: "bg-amber-400" },
                        ].map((m) => (
                          <div key={m.label}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">{m.label}</span>
                              <span className="text-xs font-bold text-white">{m.value}</span>
                            </div>
                            <div className="h-1.5 bg-blue-700/60 rounded-full overflow-hidden">
                              <div className={`h-full ${m.color} rounded-full transition-all duration-1000`} style={{ width: tick ? `${m.pct}%` : "0%" }}/>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-blue-200 mt-4 leading-relaxed">
                        Last backup completed at 04:00 AM UTC today. All systems operational.
                      </p>
                    </div>
                  </div>

                  {/* Moderators Online */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Moderators Online</p>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {["bg-blue-400", "bg-purple-400", "bg-pink-400", "bg-amber-400"].map((c, i) => (
                          <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>
                            {["AR", "SK", "PM", "DJ"][i]}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-slate-500 ml-1">+12 online</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block"/>
                      <span className="text-xs text-slate-500">Live support active</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Quick Actions</p>
                    <div className="space-y-2">
                      {[
                        { label: "View All Users", icon: "users" },
                        { label: "Pending Reports", icon: "flag" },
                        { label: "Platform Logs", icon: "list" },
                      ].map((a) => (
                        <button key={a.label} className="w-full flex items-center gap-2.5 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all cursor-pointer text-left">
                          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {a.icon === "users" && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
                            {a.icon === "flag" && <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>}
                            {a.icon === "list" && <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>}
                          </svg>
                          {a.label}
                          <svg className="w-3 h-3 ml-auto text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">PG Connect</p>
                  <p className="text-xs text-slate-400 mt-0.5">© 2024 PG Connect. Curated Student Living.</p>
                </div>
                <div className="flex flex-wrap gap-5">
                  {["Privacy Policy", "Terms of Service", "Help Center", "Contact Us"].map((l) => (
                    <a key={l} href="#" className="text-xs text-slate-500 hover:text-blue-600 transition-colors">{l}</a>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}