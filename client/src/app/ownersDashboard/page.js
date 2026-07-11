"use client";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getOwnerInquiries,
  updateInquiryStatus,
  getOwnerProperties,
  getOwnerBookings,
  getOwnerPayouts,
  getCurrentUser,
  updateProfile,
  updatePassword,
  logout,
} from "../api";

const BOOKING_STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  confirmed: "bg-[#dbeafe] text-[#1D4ED8] border border-blue-200",
  active: "bg-green-50 text-green-700 border border-green-200",
  completed: "bg-slate-100 text-slate-600 border border-slate-200",
  cancelled: "bg-red-50 text-red-600 border border-red-200",
};

const PAYMENT_STATUS_STYLES = {
  unpaid: "bg-red-50 text-red-600 border border-red-200",
  paid: "bg-green-50 text-green-700 border border-green-200",
  overdue: "bg-red-50 text-red-600 border border-red-200",
  processing: "bg-amber-50 text-amber-700 border border-amber-200",
};

const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
  },
  {
    label: "Bookings",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  },
  {
    label: "Payments",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
  },
  {
    label: "Settings",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  },
];

const formatCurrency = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

export default function OwnerDashboard() {
  const router = useRouter();
  const [inquirySearch, setInquirySearch] = useState("");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  const [inquiries, setInquiries] = useState([]);
  const [inquiryLoading, setInquiryLoading] = useState(true);
  const [inquiryError, setInquiryError] = useState("");
  const [seenInquiryIds, setSeenInquiryIds] = useState([]);
  const [updatingInquiryId, setUpdatingInquiryId] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");

  const [payouts, setPayouts] = useState([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutsError, setPayoutsError] = useState("");
  const [payoutsTotal, setPayoutsTotal] = useState(0);

  const [settingsForm, setSettingsForm] = useState({ first_name: "", last_name: "", phone: "" });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [passwordForm, setPasswordForm] = useState({ new_password: "", confirm_password: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        setUserLoading(true);
        const res = await getCurrentUser();
        if (mounted && res.success) {
          setUser(res.user);
          setSettingsForm({
            first_name: res.user.first_name || "",
            last_name: res.user.last_name || "",
            phone: res.user.phone || "",
          });
        }
      } catch (err) {
        console.error("Failed to load current user:", err);
      } finally {
        if (mounted) setUserLoading(false);
      }
    };

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

    loadUser();
    loadProperties();
    loadInquiries();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("owner_seen_inquiry_ids") : null;
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) setSeenInquiryIds(parsed);
    } catch {
      // ignore invalid localStorage data
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("owner_seen_inquiry_ids", JSON.stringify(seenInquiryIds));
  }, [seenInquiryIds]);

  const loadBookings = async () => {
    try {
      setBookingsLoading(true);
      setBookingsError("");
      const res = await getOwnerBookings();
      if (res.success) setBookings(res.bookings || []);
    } catch (err) {
      setBookingsError("Unable to load bookings.");
    } finally {
      setBookingsLoading(false);
    }
  };

  const loadPayouts = async () => {
    try {
      setPayoutsLoading(true);
      setPayoutsError("");
      const res = await getOwnerPayouts();
      if (res.success) { setPayouts(res.payouts || []); setPayoutsTotal(res.total || 0); }
    } catch (err) {
      setPayoutsError("Unable to load payments.");
    } finally {
      setPayoutsLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav === "Bookings" && bookings.length === 0 && !bookingsLoading) loadBookings();
    if (activeNav === "Payments" && payouts.length === 0 && !payoutsLoading) loadPayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNav]);

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

  const filteredBookings = useMemo(() => {
    const q = bookingSearch.toLowerCase();
    return bookings.filter((b) => {
      if (!q) return true;
      const tenantName = `${b?.tenant?.first_name || ""} ${b?.tenant?.last_name || ""}`.toLowerCase();
      const propertyName = String(b?.properties?.name || "").toLowerCase();
      return tenantName.includes(q) || propertyName.includes(q);
    });
  }, [bookings, bookingSearch]);

  const isSeen = (item) => item?.status === "seen" || seenInquiryIds.includes(item?._id);

  const markInquirySeen = (id) => {
    if (!id) return;
    setSeenInquiryIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleUpdateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      setUpdatingInquiryId(inquiryId);
      await updateInquiryStatus(inquiryId, newStatus);
      setInquiries((prev) =>
        prev.map((item) => (item._id === inquiryId ? { ...item, status: newStatus } : item))
      );
    } catch (error) {
      alert(`Failed to update status: ${error?.message || "Unknown error"}`);
    } finally {
      setUpdatingInquiryId(null);
    }
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMessage("");
    try {
      const res = await updateProfile(settingsForm);
      if (res.success) setSettingsMessage("Profile updated.");
    } catch (err) {
      setSettingsMessage(`Failed: ${err.message}`);
    } finally {
      setSettingsSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    if (!passwordForm.new_password || passwordForm.new_password.length < 6) {
      setPasswordMessage("Password must be at least 6 characters.");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage("Passwords don't match.");
      return;
    }
    setPasswordSaving(true);
    try {
      await updatePassword({ new_password: passwordForm.new_password });
      setPasswordMessage("Password updated.");
      setPasswordForm({ new_password: "", confirm_password: "" });
    } catch (err) {
      setPasswordMessage(`Failed: ${err.message}`);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const totalBeds = properties.reduce((s, p) => s + (p.total_beds ?? 0), 0);
  const availableBeds = properties.reduce((s, p) => s + (p.available_beds ?? 0), 0);
  const occupiedBeds = Math.max(0, totalBeds - availableBeds);
  const occupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "O"
    : "";

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
          <button className="lg:hidden p-1.5 rounded-lg transition-colors" style={{ color: "#1E3A5F60" }} onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="lg:hidden">
            <p className="font-bold text-base leading-tight" style={{ color: "#1D4ED8" }}>PG Connect</p>
          </div>

          <div className="hidden lg:flex items-center gap-1 ml-4">
            <span className="text-lg font-bold mr-6" style={{ color: "#1E3A5F" }}>Owner Dashboard</span>
          </div>

          <div className="flex-1" />

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-[#1E3A5F] leading-tight">
                  {userLoading ? "..." : user ? `${user.first_name} ${user.last_name}` : "Owner"}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{user?.role || "Owner"}</p>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: "#1D4ED8" }}>
                {initials || "O"}
              </div>
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-blue-100 py-1.5 z-50">
                  <p className="px-3.5 py-2 text-xs text-[#1E3A5F80] truncate border-b border-blue-50">{user?.email}</p>
                  <button
                    onClick={() => { setActiveNav("Settings"); setUserMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-sm text-[#1E3A5F] hover:bg-blue-50 cursor-pointer"
                  >
                    Account Settings
                  </button>
                  <button onClick={handleLogout} className="w-full text-left px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer">
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="flex flex-1">

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
            <div className="hidden lg:block px-5 pt-6 pb-4">
              <button onClick={() => router.push("/")} className="cursor-pointer">
                <p className="font-bold text-base leading-tight" style={{ color: "#1D4ED8" }}>PG Connect</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">Owner Portal</p>
              </button>
            </div>

            <div className="lg:hidden flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
              <div>
                <p className="font-serif-display text-[#1D4ED8] text-base font-bold">PG Connect</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Owner Portal</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
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

            <div className="p-4">
              <button
                onClick={() => router.push("/listProperty")}
                className="w-full flex items-center justify-center gap-2 active:scale-[0.98] text-white text-sm font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
                style={{ background: "#F97316" }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                List New PG
              </button>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 min-w-0">

            {activeNav === "Dashboard" && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: "#1E3A5F" }}>
                      Welcome back{user ? `, ${user.first_name}` : ""}.
                    </h1>
                    <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                      Your properties are currently at{" "}
                      <strong className="text-slate-700">{propertiesLoading ? "..." : `${occupancyPct}% occupancy`}</strong>. You have{" "}
                      <strong className="text-slate-700">{inquiries.length} inquiries</strong> awaiting review.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/listProperty")}
                    className="flex items-center gap-2 active:scale-[0.98] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
                    style={{ background: "#1D4ED8" }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add New PG
                  </button>
                </div>

                {/* STAT CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl" />
                    <div className="flex items-start justify-between mb-4 pl-2">
                      <div className="w-10 h-10 bg-[#dbeafe] rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#1D4ED8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 14h20" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-[#EFF6FF] border border-slate-200 px-2 py-0.5 rounded-full">{properties.length} PGs</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-2">Total Bed Capacity</p>
                    <p className="text-4xl font-bold text-[#1E3A5F] mt-1 pl-2">{propertiesLoading ? "—" : totalBeds}</p>
                    <p className="text-xs text-slate-400 mt-2 pl-2">Across {properties.length} {properties.length === 1 ? "location" : "locations"}</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500 rounded-l-2xl" />
                    <div className="flex items-start justify-between mb-4 pl-2">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">{propertiesLoading ? "—" : `${occupancyPct}%`}</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-2">Occupied Beds</p>
                    <p className="text-4xl font-bold text-[#1E3A5F] mt-1 pl-2">{propertiesLoading ? "—" : occupiedBeds}</p>
                    <div className="flex items-center gap-1.5 mt-2 pl-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                      <p className="text-xs text-green-600 font-medium">
                        {propertiesLoading ? "Loading..." : occupancyPct >= 80 ? "Healthy high demand" : "Room to grow"}
                      </p>
                    </div>
                  </div>

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
                    <p className="text-4xl font-bold text-[#1E3A5F] mt-1 pl-2">{propertiesLoading ? "—" : availableBeds}</p>
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

                {/* PROPERTY PERFORMANCE */}
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

                {/* OWNER INQUIRIES */}
                <div className="bg-white border border-slate-200 rounded-2xl mb-6 overflow-hidden">
                  <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-bold text-[#1E3A5F]">Owner Inquiries</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Messages from students interested in your properties.</p>
                      </div>
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search inquiries..."
                          value={inquirySearch}
                          onChange={(e) => setInquirySearch(e.target.value)}
                          className="pl-9 pr-4 py-2 bg-[#EFF6FF] border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all w-full sm:w-56"
                        />
                      </div>
                    </div>
                  </div>

                  {inquiryLoading && <div className="px-5 sm:px-6 py-5 text-sm text-slate-500">Loading inquiries...</div>}
                  {!inquiryLoading && inquiryError && <div className="px-5 sm:px-6 py-5 text-sm text-red-500">{inquiryError}</div>}
                  {!inquiryLoading && !inquiryError && filteredInquiries.length === 0 && (
                    <div className="px-5 sm:px-6 py-5 text-sm text-slate-500">No inquiries found.</div>
                  )}
                  {!inquiryLoading && !inquiryError && filteredInquiries.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100">
                            {["Name", "Property", "Phone", "Move-in", "Message", "Status", "Created"].map((h) => (
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
              </>
            )}

            {/* BOOKINGS TAB */}
            {activeNav === "Bookings" && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-[#1E3A5F]">Bookings ({bookings.length})</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Tenants currently booked across your properties.</p>
                  </div>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search tenants..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-[#EFF6FF] border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all w-full sm:w-48"
                    />
                  </div>
                </div>

                {bookingsLoading && <div className="px-5 sm:px-6 py-6 text-sm text-slate-400">Loading bookings...</div>}
                {!bookingsLoading && bookingsError && <div className="px-5 sm:px-6 py-6 text-sm text-red-500">{bookingsError}</div>}
                {!bookingsLoading && !bookingsError && filteredBookings.length === 0 && (
                  <div className="px-5 sm:px-6 py-6 text-sm text-slate-400">No bookings yet.</div>
                )}
                {!bookingsLoading && !bookingsError && filteredBookings.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {["Tenant", "Property & Room", "Move-in", "Monthly Rent", "Status", "Payment"].map((h) => (
                            <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 px-6 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-[#EFF6FF]/70 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-[#1E3A5F]">{b.tenant?.first_name} {b.tenant?.last_name}</p>
                              <p className="text-xs text-slate-400">{b.tenant?.phone || "-"}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-slate-800">{b.properties?.name}</p>
                              <p className="text-xs text-slate-400">{b.room_type}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700">{formatDate(b.move_in_date)}</td>
                            <td className="px-6 py-4 text-sm font-bold text-[#1E3A5F]">{formatCurrency(b.monthly_rent)}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${BOOKING_STATUS_STYLES[b.status] || "bg-slate-100 text-slate-600"}`}>{b.status}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${PAYMENT_STATUS_STYLES[b.payment_status] || "bg-slate-100 text-slate-600"}`}>{b.payment_status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeNav === "Payments" && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Received</p>
                    <p className="text-3xl font-bold text-[#1E3A5F] mt-1">{payoutsLoading ? "—" : formatCurrency(payoutsTotal)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#dbeafe" }}>
                    <svg className="w-6 h-6" style={{ color: "#1D4ED8" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-[#1E3A5F]">Payment History</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Rent payments received through PG Connect, after platform fee.</p>
                  </div>
                  {payoutsLoading && <div className="px-5 sm:px-6 py-6 text-sm text-slate-400">Loading payments...</div>}
                  {!payoutsLoading && payoutsError && <div className="px-5 sm:px-6 py-6 text-sm text-red-500">{payoutsError}</div>}
                  {!payoutsLoading && !payoutsError && payouts.length === 0 && (
                    <div className="px-5 sm:px-6 py-6 text-sm text-slate-400">No payments received yet.</div>
                  )}
                  {!payoutsLoading && !payoutsError && payouts.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100">
                            {["Tenant", "Property", "Rent", "Platform Fee", "You Receive", "Date"].map((h) => (
                              <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 px-6 py-3">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {payouts.map((p) => (
                            <tr key={p.id} className="hover:bg-[#EFF6FF]/70 transition-colors">
                              <td className="px-6 py-4 text-sm font-semibold text-[#1E3A5F]">
                                {p.bookings?.tenant?.first_name} {p.bookings?.tenant?.last_name}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-700">{p.properties?.name}</td>
                              <td className="px-6 py-4 text-sm text-slate-700">{formatCurrency(p.amount)}</td>
                              <td className="px-6 py-4 text-sm text-slate-400">-{formatCurrency(p.platform_fee)}</td>
                              <td className="px-6 py-4 text-sm font-bold text-green-700">{formatCurrency(p.owner_payout)}</td>
                              <td className="px-6 py-4 text-sm text-slate-500">{formatDate(p.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeNav === "Settings" && (
              <div className="space-y-6 max-w-xl">
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-[#1E3A5F]">Account</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                  </div>
                  <form onSubmit={handleSettingsSave} className="px-5 sm:px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-slate-400">First Name</label>
                        <input
                          type="text"
                          value={settingsForm.first_name}
                          onChange={(e) => setSettingsForm((f) => ({ ...f, first_name: e.target.value }))}
                          className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                          style={{ borderColor: "#bfdbfe" }}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-slate-400">Last Name</label>
                        <input
                          type="text"
                          value={settingsForm.last_name}
                          onChange={(e) => setSettingsForm((f) => ({ ...f, last_name: e.target.value }))}
                          className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                          style={{ borderColor: "#bfdbfe" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-slate-400">Phone</label>
                      <input
                        type="tel"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm((f) => ({ ...f, phone: e.target.value }))}
                        className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                        style={{ borderColor: "#bfdbfe" }}
                      />
                    </div>
                    {settingsMessage && <p className="text-xs" style={{ color: settingsMessage.startsWith("Failed") ? "#dc2626" : "#15803d" }}>{settingsMessage}</p>}
                    <button
                      type="submit"
                      disabled={settingsSaving}
                      className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white cursor-pointer disabled:opacity-60"
                      style={{ background: "#1D4ED8" }}
                    >
                      {settingsSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-[#1E3A5F]">Change Password</h2>
                  </div>
                  <form onSubmit={handlePasswordSave} className="px-5 sm:px-6 py-5 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-slate-400">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm((f) => ({ ...f, new_password: e.target.value }))}
                        className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                        style={{ borderColor: "#bfdbfe" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-slate-400">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm((f) => ({ ...f, confirm_password: e.target.value }))}
                        className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                        style={{ borderColor: "#bfdbfe" }}
                      />
                    </div>
                    {passwordMessage && <p className="text-xs" style={{ color: passwordMessage.startsWith("Failed") || passwordMessage.includes("match") || passwordMessage.includes("must be") ? "#dc2626" : "#15803d" }}>{passwordMessage}</p>}
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white cursor-pointer disabled:opacity-60"
                      style={{ background: "#1D4ED8" }}
                    >
                      {passwordSaving ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Spacer */}
            <div className="h-8" />

            {/* Footer */}
            <footer className="border-t border-slate-200 pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-serif-display text-sm font-bold text-[#1E3A5F]">PG Connect</p>
                  <p className="text-xs text-slate-400 mt-0.5">© {new Date().getFullYear()} PG Connect. Curated Student Living.</p>
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
      </div>
    </>
  );
}
