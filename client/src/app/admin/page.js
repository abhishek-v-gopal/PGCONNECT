"use client";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminStats,
  getVerificationQueue,
  verifyProperty,
  getAdminUsers,
  toggleUser,
  getAdminReviews,
  moderateReview,
  getAdminProperties,
} from "../api";

const NAV_ITEMS = [
  { label: "Dashboard", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { label: "Properties", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { label: "Users", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label: "Verification", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { label: "Reviews", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { label: "Settings", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

function StatusBadge({ status }) {
  const styles = {
    pending: { background: "#fff7ed", color: "#F97316", border: "1px solid #fed7aa" },
    in_review: { background: "#dbeafe", color: "#1D4ED8", border: "1px solid #bfdbfe" },
    verified: { background: "#cffafe", color: "#0e7490", border: "1px solid #a5f3fc" },
    rejected: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
  };
  const labels = { pending: "NEW", in_review: "IN REVIEW", verified: "APPROVED", rejected: "REJECTED" };
  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={styles[status] || styles.pending}>
      {labels[status] || status?.toUpperCase()}
    </span>
  );
}

export default function AdminPanel() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [queue, setQueue] = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueTotal, setQueueTotal] = useState(0);
  const [actioningId, setActioningId] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersTotal, setUsersTotal] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [moderatingId, setModeratingId] = useState(null);

  const [allProperties, setAllProperties] = useState([]);
  const [allPropertiesLoading, setAllPropertiesLoading] = useState(false);
  const [allPropertiesTotal, setAllPropertiesTotal] = useState(0);
  const [propertiesSort, setPropertiesSort] = useState("views");

  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setStatsLoading(true);
      const s = await getAdminStats();
      if (s.success) setStats(s.stats);
    } catch (e) { console.error("Stats error:", e); }
    finally { setStatsLoading(false); }

    try {
      setQueueLoading(true);
      const q = await getVerificationQueue("pending");
      if (q.success) { setQueue(q.properties); setQueueTotal(q.total); }
    } catch (e) { console.error("Queue error:", e); }
    finally { setQueueLoading(false); }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const u = await getAdminUsers();
      if (u.success) { setUsers(u.users); setUsersTotal(u.total); }
    } catch (e) { console.error("Users error:", e); }
    finally { setUsersLoading(false); }
  };

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const r = await getAdminReviews("pending");
      if (r.success) { setReviews(r.reviews); setReviewsTotal(r.total); }
    } catch (e) { console.error("Reviews error:", e); }
    finally { setReviewsLoading(false); }
  };

  const loadAllProperties = async (sort = propertiesSort) => {
    try {
      setAllPropertiesLoading(true);
      const p = await getAdminProperties(sort);
      if (p.success) { setAllProperties(p.properties); setAllPropertiesTotal(p.total); }
    } catch (e) { console.error("Properties error:", e); }
    finally { setAllPropertiesLoading(false); }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeNav === "Users") loadUsers();
    if (activeNav === "Reviews") loadReviews();
    if (activeNav === "Properties") loadAllProperties();
  }, [activeNav]);

  const handlePropertiesSortChange = (sort) => {
    setPropertiesSort(sort);
    loadAllProperties(sort);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleVerify = async (propertyId, action) => {
    try {
      setActioningId(propertyId);
      await verifyProperty(propertyId, action);
      setQueue((prev) => prev.filter((p) => p.id !== propertyId));
      setQueueTotal((t) => t - 1);
    } catch (e) {
      alert(`Failed: ${e.message}`);
    } finally {
      setActioningId(null);
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      const res = await toggleUser(userId);
      if (res.success) {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_active: !u.is_active } : u));
      }
    } catch (e) { alert(`Failed: ${e.message}`); }
  };

  const handleModerateReview = async (reviewId, action) => {
    try {
      setModeratingId(reviewId);
      await moderateReview(reviewId, action);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setReviewsTotal((t) => t - 1);
    } catch (e) {
      alert(`Failed: ${e.message}`);
    } finally {
      setModeratingId(null);
    }
  };

  const formatCurrency = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

  return (
    <>
      <Head>
        <title>Admin Panel — PG Connect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
        <style>{`
          body { font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
          .font-serif-display { font-family: 'DM Serif Display', serif; }
          .sidebar-scroll::-webkit-scrollbar { display: none; }
          .sidebar-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes slide-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }
          .slide-in { animation: slide-in 0.2s ease; }
        `}</style>
      </Head>

      <div className="min-h-screen flex flex-col" style={{ background: "#EFF6FF", color: "#1E3A5F" }}>

        {/* TOP HEADER */}
        <header className="sticky top-0 z-50 bg-white border-b border-blue-100 shadow-sm h-14 flex items-center px-4 sm:px-5 gap-3">
          <button className="lg:hidden p-1.5 rounded-lg" style={{ color: "#1E3A5F60" }} onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="lg:hidden">
            <p className="font-bold text-sm" style={{ color: "#1D4ED8" }}>PG Connect Admin</p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-lg cursor-pointer" style={{ color: "#1E3A5F60" }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {queueTotal > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"/>}
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold leading-tight" style={{ color: "#1D4ED8" }}>PG Connect Admin</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 cursor-pointer" style={{ background: "#1D4ED8" }}>AD</div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {sidebarOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setSidebarOpen(false)} />}

          {/* SIDEBAR */}
          <aside className={`
            fixed lg:sticky top-0 lg:top-14 z-50 lg:z-auto
            h-screen lg:h-[calc(100vh-56px)]
            w-56 bg-white border-r border-blue-100
            flex flex-col sidebar-scroll overflow-y-auto
            transition-transform duration-250
            ${sidebarOpen ? "translate-x-0 slide-in" : "-translate-x-full lg:translate-x-0"}
          `}>
            <div className="hidden lg:block px-5 pt-5 pb-4 border-b border-blue-50">
              <p className="font-bold text-sm" style={{ color: "#1D4ED8" }}>PG Connect</p>
              <p className="text-[9px] uppercase tracking-widest font-semibold mt-0.5" style={{ color: "#1E3A5F60" }}>Admin Portal</p>
            </div>
            <div className="lg:hidden flex items-center justify-between px-5 pt-5 pb-4 border-b border-blue-50">
              <p className="font-bold text-sm" style={{ color: "#1D4ED8" }}>PG Connect Admin</p>
              <button onClick={() => setSidebarOpen(false)} className="p-1 cursor-pointer" style={{ color: "#1E3A5F60" }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <button key={item.label}
                  onClick={() => { setActiveNav(item.label); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left"
                  style={activeNav === item.label ? { background: "#dbeafe", color: "#1D4ED8" } : { color: "#1E3A5F80" }}>
                  <span style={activeNav === item.label ? { color: "#1D4ED8" } : { color: "#1E3A5F60" }}>{item.icon}</span>
                  {item.label}
                  {item.label === "Verification" && queueTotal > 0 && (
                    <span className="ml-auto text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{queueTotal}</span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* MAIN */}
          <main className="flex-1 overflow-y-auto min-w-0">
            <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1200px]">

              {/* Page title */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "#1E3A5F" }}>Platform Overview</h1>
                  <p className="text-sm mt-1" style={{ color: "#1E3A5F80" }}>Real-time metrics for PG Connect.</p>
                </div>
                <button onClick={handleRefresh}
                  className="flex items-center gap-2 active:scale-[0.98] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0" style={{ background: "#1D4ED8" }}>
                  <svg className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
                  </svg>
                  {refreshing ? "Refreshing…" : "Refresh"}
                </button>
              </div>

              {/* STAT CARDS */}
              {activeNav === "Dashboard" && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7">
                    {[
                      { label: "Platform Revenue", value: formatCurrency(stats?.totalRevenue), badge: null, icon: "₹", color: "blue" },
                      { label: "Total Active Users", value: statsLoading ? "—" : stats?.totalUsers ?? 0, badge: `${stats?.studentCount ?? 0}S / ${stats?.ownerCount ?? 0}O`, icon: "👤", color: "green" },
                      { label: "Pending Verifications", value: statsLoading ? "—" : stats?.pendingVerifications ?? 0, badge: "Urgent", icon: "⚠", color: "red" },
                      { label: "Active Listings", value: statsLoading ? "—" : stats?.activeListings ?? 0, badge: null, icon: "🏠", color: "slate" },
                    ].map((card, i) => (
                      <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 hover:shadow-sm transition-shadow border" style={{ borderColor: "#e0f2fe" }}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: "#EFF6FF" }}>{card.icon}</div>
                          {card.badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={card.color === 'red' ? { background: "#F97316", color: "white" } : { background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}>{card.badge}</span>}
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#1E3A5F80" }}>{card.label}</p>
                        <p className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: "#1E3A5F" }}>
                          {statsLoading ? "—" : card.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Verification Queue */}
                  <div className="bg-white rounded-2xl overflow-hidden mb-6 border" style={{ borderColor: "#e0f2fe" }}>
                    <div className="px-5 sm:px-6 py-4 border-b border-blue-50">
                      <h2 className="text-base font-bold" style={{ color: "#1E3A5F" }}>Property Verification Queue</h2>
                      <p className="text-xs mt-0.5" style={{ color: "#1E3A5F80" }}>Review newly submitted properties.</p>
                    </div>

                    {queueLoading ? (
                      <div className="px-6 py-8 text-sm text-slate-400">Loading queue...</div>
                    ) : queue.length === 0 ? (
                      <div className="px-6 py-8 text-sm text-slate-400 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        All caught up! No pending verifications.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-100">
                              {["Property", "Owner", "City", "Submitted", "Status", "Action"].map((h) => (
                                <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 px-5 py-3">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {queue.map((p) => (
                              <tr key={p.id} className="hover:bg-[#EFF6FF]/60 transition-colors">
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    {p.property_images?.[0]?.image_url && (
                                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#EFF6FF] shrink-0">
                                        <img src={p.property_images[0].image_url} alt={p.name} className="w-full h-full object-cover"/>
                                      </div>
                                    )}
                                    <span className="text-sm font-semibold text-[#1E3A5F]">{p.name}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-sm text-slate-600">
                                  {p.owner?.first_name} {p.owner?.last_name}
                                </td>
                                <td className="px-5 py-3.5 text-sm text-slate-500">{p.city}</td>
                                <td className="px-5 py-3.5 text-sm text-slate-500">
                                  {new Date(p.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                </td>
                                <td className="px-5 py-3.5"><StatusBadge status={p.status}/></td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleVerify(p.id, "approve")}
                                      disabled={actioningId === p.id}
                                      className="text-xs font-bold cursor-pointer disabled:opacity-50" style={{ color: "#1D4ED8" }}>
                                      Approve
                                    </button>
                                    <span className="text-slate-200">|</span>
                                    <button
                                      onClick={() => handleVerify(p.id, "review")}
                                      disabled={actioningId === p.id}
                                      className="text-xs font-medium cursor-pointer disabled:opacity-50" style={{ color: "#F97316" }}>
                                      Review
                                    </button>
                                    <span className="text-slate-200">|</span>
                                    <button
                                      onClick={() => handleVerify(p.id, "reject")}
                                      disabled={actioningId === p.id}
                                      className="text-xs font-medium text-slate-400 hover:text-red-500 cursor-pointer disabled:opacity-50">
                                      Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {queueTotal > queue.length && (
                      <div className="px-5 py-3.5 border-t border-slate-100">
                        <p className="text-xs text-slate-400">Showing {queue.length} of {queueTotal} pending</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* USERS TAB */}
              {activeNav === "Users" && (
                <div className="bg-white rounded-2xl overflow-hidden border" style={{ borderColor: "#e0f2fe" }}>
                  <div className="px-5 sm:px-6 py-4 border-b border-blue-50">
                    <h2 className="text-base font-bold" style={{ color: "#1E3A5F" }}>All Users ({usersTotal})</h2>
                  </div>
                  {usersLoading ? (
                    <div className="px-6 py-8 text-sm text-slate-400">Loading users...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100">
                            {["Name", "Role", "University / Phone", "Status", "Joined", "Action"].map((h) => (
                              <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 px-5 py-3">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {users.map((u) => (
                            <tr key={u.id} className="hover:bg-[#EFF6FF]/60 transition-colors">
                              <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: "#1E3A5F" }}>{u.first_name} {u.last_name}</td>
                              <td className="px-5 py-3.5">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                                  style={u.role === 'admin' ? { background: "#f3e8ff", color: "#7c3aed", borderColor: "#e9d5ff" } : u.role === 'owner' ? { background: "#fff7ed", color: "#c2410c", borderColor: "#fed7aa" } : { background: "#dbeafe", color: "#1D4ED8", borderColor: "#bfdbfe" }}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-sm text-slate-500">{u.university || u.phone || "—"}</td>
                              <td className="px-5 py-3.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                  {u.is_active ? "ACTIVE" : "DISABLED"}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-sm text-slate-500">
                                {new Date(u.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              </td>
                              <td className="px-5 py-3.5">
                                <button onClick={() => handleToggleUser(u.id)}
                                  className={`text-xs font-bold cursor-pointer ${u.is_active ? 'text-red-500 hover:text-red-600' : 'text-green-600 hover:text-green-700'}`}>
                                  {u.is_active ? "Disable" : "Activate"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeNav === "Reviews" && (
                <div className="bg-white rounded-2xl overflow-hidden border" style={{ borderColor: "#e0f2fe" }}>
                  <div className="px-5 sm:px-6 py-4 border-b border-blue-50">
                    <h2 className="text-base font-bold" style={{ color: "#1E3A5F" }}>Pending Reviews ({reviewsTotal})</h2>
                    <p className="text-xs mt-0.5" style={{ color: "#1E3A5F80" }}>Approve or reject tenant reviews before they go live.</p>
                  </div>
                  {reviewsLoading ? (
                    <div className="px-6 py-8 text-sm text-slate-400">Loading reviews...</div>
                  ) : reviews.length === 0 ? (
                    <div className="px-6 py-8 text-sm text-slate-400 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      No pending reviews.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {reviews.map((r) => (
                        <div key={r.id} className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>{r.property?.name}</span>
                              <span className="text-xs text-slate-400">— {r.property?.city}</span>
                              {r.is_verified_stay && (
                                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">Verified Stay</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mb-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <span key={s} style={{ color: s <= r.rating ? "#F97316" : "#e2e8f0" }}>★</span>
                              ))}
                              <span className="text-xs text-slate-400 ml-1">by {r.tenant?.first_name} {r.tenant?.last_name}</span>
                            </div>
                            {r.comment && <p className="text-sm text-slate-600">{r.comment}</p>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleModerateReview(r.id, "approve")}
                              disabled={moderatingId === r.id}
                              className="text-xs font-bold cursor-pointer disabled:opacity-50" style={{ color: "#1D4ED8" }}>
                              Approve
                            </button>
                            <span className="text-slate-200">|</span>
                            <button
                              onClick={() => handleModerateReview(r.id, "reject")}
                              disabled={moderatingId === r.id}
                              className="text-xs font-medium text-slate-400 hover:text-red-500 cursor-pointer disabled:opacity-50">
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PROPERTIES TAB */}
              {activeNav === "Properties" && (
                <div className="bg-white rounded-2xl overflow-hidden border" style={{ borderColor: "#e0f2fe" }}>
                  <div className="px-5 sm:px-6 py-4 border-b border-blue-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold" style={{ color: "#1E3A5F" }}>All Properties ({allPropertiesTotal})</h2>
                      <p className="text-xs mt-0.5" style={{ color: "#1E3A5F80" }}>How many people have viewed and liked each listing.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Sort by</span>
                      <select
                        value={propertiesSort}
                        onChange={(e) => handlePropertiesSortChange(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 cursor-pointer"
                      >
                        <option value="views">Most Viewed</option>
                        <option value="saves">Most Liked</option>
                        <option value="inquiries">Most Inquiries</option>
                        <option value="newest">Newest</option>
                      </select>
                    </div>
                  </div>
                  {allPropertiesLoading ? (
                    <div className="px-6 py-8 text-sm text-slate-400">Loading properties...</div>
                  ) : allProperties.length === 0 ? (
                    <div className="px-6 py-8 text-sm text-slate-400">No properties yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100">
                            {["Property", "Owner", "City", "Status", "Views", "Likes", "Inquiries"].map((h) => (
                              <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 px-5 py-3">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {allProperties.map((p) => (
                            <tr key={p.id} className="hover:bg-[#EFF6FF]/60 transition-colors">
                              <td className="px-5 py-3.5 text-sm font-semibold text-[#1E3A5F]">{p.name}</td>
                              <td className="px-5 py-3.5 text-sm text-slate-600">{p.owner?.first_name} {p.owner?.last_name}</td>
                              <td className="px-5 py-3.5 text-sm text-slate-500">{p.city}</td>
                              <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                              <td className="px-5 py-3.5">
                                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E3A5F]">
                                  <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                  {p.views ?? 0}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E3A5F]">
                                  <svg className="w-3.5 h-3.5 text-red-400" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                                  {p.saves_count ?? 0}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-sm text-slate-500">{p.inquiries_count ?? 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="border-t pt-5 mt-8 flex items-center justify-between" style={{ borderColor: "#e0f2fe" }}>
                <p className="text-sm font-bold" style={{ color: "#1D4ED8" }}>PG Connect</p>
                <p className="text-xs" style={{ color: "#1E3A5F60" }}>&copy; {new Date().getFullYear()} PG Connect.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
