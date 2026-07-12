"use client";
import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getReferralCode,
  getReferralStats,
  getReferralCommissions,
  updateCommissionType,
  requestPayout,
} from "../api";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  paid: "bg-green-50 text-green-700 border border-green-200",
  cancelled: "bg-red-50 text-red-600 border border-red-200",
};

const propStatusStyles = {
  verified: "bg-green-50 text-green-700 border border-green-200",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  in_review: "bg-blue-50 text-blue-600 border border-blue-200",
  rejected: "bg-red-50 text-red-600 border border-red-200",
};

export default function ReferrerDashboard() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [referralCode, setReferralCode] = useState("");
  const [referralUrl, setReferralUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const [stats, setStats] = useState(null);
  const [referredProps, setReferredProps] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const [commissions, setCommissions] = useState([]);
  const [commissionsLoading, setCommissionsLoading] = useState(false);

  const [payoutLoading, setPayoutLoading] = useState(false);
  const [commTypeLoading, setCommTypeLoading] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const [codeRes, statsRes] = await Promise.all([getReferralCode(), getReferralStats()]);
      if (codeRes.success) {
        setReferralCode(codeRes.referral_code);
        setReferralUrl(codeRes.referral_url);
      }
      if (statsRes.success) {
        setStats(statsRes.stats);
        setReferredProps(statsRes.referred_properties ?? []);
      }
    } catch (e) {
      console.error("Failed to load referral data:", e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadCommissions = useCallback(async () => {
    try {
      setCommissionsLoading(true);
      const res = await getReferralCommissions();
      if (res.success) setCommissions(res.commissions ?? []);
    } catch (e) { console.error(e); }
    finally { setCommissionsLoading(false); }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (activeNav === "Commissions") loadCommissions();
  }, [activeNav, loadCommissions]);

  const copyCode = () => {
    navigator.clipboard.writeText(referralUrl || referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestPayout = async () => {
    try {
      setPayoutLoading(true);
      const res = await requestPayout();
      alert(res.message);
      await loadStats();
    } catch (e) { alert(e.message); }
    finally { setPayoutLoading(false); }
  };

  const handleCommissionTypeChange = async (type) => {
    try {
      setCommTypeLoading(true);
      await updateCommissionType(type);
      setStats((s) => s ? { ...s, commission_type: type } : s);
    } catch (e) { alert(e.message); }
    finally { setCommTypeLoading(false); }
  };

  const formatCurrency = (n) => `₹${Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const formatDate = (v) => v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const navItems = [
    { label: "Overview", icon: "📊" },
    { label: "Referred PGs", icon: "🏠" },
    { label: "Commissions", icon: "💰" },
    { label: "Referral Link", icon: "🔗" },
  ];

  return (
    <>
      <Head>
        <title>Referrer Dashboard — PG Connect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'DM Sans', sans-serif; overflow-x: hidden; } .font-serif-display { font-family: 'DM Serif Display', serif; }`}</style>
      </Head>

      <div className="min-h-screen bg-slate-50 flex flex-col">

        {/* TOP NAV */}
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 h-14 flex items-center px-4 sm:px-6 gap-4">
          <button className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <button onClick={() => router.push("/")} className="font-serif-display text-blue-600 text-base font-bold leading-tight lg:block hidden cursor-pointer">PG Connect</button>
          <div className="lg:hidden">
            <p className="font-serif-display text-blue-600 text-base font-bold">PG Connect</p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-tight">Referrer Portal</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Student</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">ST</div>
          </div>
        </header>

        <div className="flex flex-1">
          {sidebarOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setSidebarOpen(false)} />}

          {/* SIDEBAR */}
          <aside className={`
            fixed inset-y-0 left-0 z-50 h-screen w-56 bg-white border-r border-slate-200
            flex flex-col overflow-hidden transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            lg:!sticky lg:top-14 lg:h-[calc(100vh-56px)] lg:self-start lg:z-30
          `}>
            <div className="hidden lg:block px-5 pt-6 pb-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Referrer Dashboard</p>
            </div>
            <div className="lg:hidden flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
              <p className="font-bold text-blue-600 text-sm">Referrer Dashboard</p>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-slate-400">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => (
                <button key={item.label}
                  onClick={() => { setActiveNav(item.label); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left
                    ${activeNav === item.label ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-100">
              <button onClick={() => router.push("/")} className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
                ← Back to Home
              </button>
            </div>
          </aside>

          {/* MAIN */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 min-w-0">

            {/* OVERVIEW */}
            {activeNav === "Overview" && (
              <>
                <div className="mb-7">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Referrer Overview</h1>
                  <p className="text-sm text-slate-500 mt-1">Track your referred PGs and commission earnings.</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "PGs Referred", value: statsLoading ? "—" : stats?.total_referred ?? 0, color: "blue", icon: "🏠" },
                    { label: "Active Bookings", value: statsLoading ? "—" : stats?.active_bookings ?? 0, color: "green", icon: "✅" },
                    { label: "Total Earned", value: statsLoading ? "—" : formatCurrency(stats?.total_commission_earned), color: "amber", icon: "💰" },
                    { label: "Pending Balance", value: statsLoading ? "—" : formatCurrency(stats?.pending_balance), color: "purple", icon: "⏳" },
                  ].map((card) => (
                    <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-shadow">
                      <div className="text-2xl mb-3">{card.icon}</div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{card.label}</p>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Commission type selector */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                  <h2 className="text-base font-bold text-slate-900 mb-1">Commission Type</h2>
                  <p className="text-sm text-slate-500 mb-5">Choose how you want to earn from your referred PGs.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { type: "recurring", label: "Recurring Commission", desc: "Earn 2% of every booking payment from your referred PGs — monthly, ongoing income." },
                      { type: "one-time", label: "One-Time Payment", desc: "Earn a single flat payment after the first successful booking from each referred PG." },
                    ].map((opt) => (
                      <button key={opt.type}
                        onClick={() => handleCommissionTypeChange(opt.type)}
                        disabled={commTypeLoading || stats?.commission_type === opt.type}
                        className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer disabled:cursor-not-allowed
                          ${stats?.commission_type === opt.type
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                          }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${stats?.commission_type === opt.type ? "border-blue-500 bg-blue-500" : "border-slate-300"}`}>
                            {stats?.commission_type === opt.type && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <p className="text-sm font-bold text-slate-900">{opt.label}</p>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed ml-6">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payout section */}
                <div className="bg-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-500 rounded-full opacity-40" />
                  <div className="relative z-10">
                    <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-2">Available Balance</p>
                    <p className="text-4xl font-bold mb-4">{statsLoading ? "—" : formatCurrency(stats?.pending_balance)}</p>
                    <button
                      onClick={handleRequestPayout}
                      disabled={payoutLoading || (stats?.pending_balance ?? 0) < 100}
                      className="flex items-center gap-2 bg-white text-blue-700 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                      {payoutLoading ? "Processing..." : "Request Payout"}
                    </button>
                    <p className="text-blue-200 text-xs mt-3">Minimum payout is ₹100. Processed within 2-3 business days.</p>
                  </div>
                </div>
              </>
            )}

            {/* REFERRED PGS */}
            {activeNav === "Referred PGs" && (
              <>
                <div className="mb-7">
                  <h1 className="text-2xl font-bold text-slate-900">Referred PGs</h1>
                  <p className="text-sm text-slate-500 mt-1">{referredProps.length} total PGs referred by you.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  {statsLoading ? (
                    <div className="px-6 py-8 text-sm text-slate-400">Loading...</div>
                  ) : referredProps.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <p className="text-3xl mb-3">🏠</p>
                      <p className="text-sm font-semibold text-slate-700">No PGs referred yet</p>
                      <p className="text-xs text-slate-400 mt-1">Share your referral link with PG owners to get started.</p>
                      <button onClick={() => setActiveNav("Referral Link")}
                        className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                        Get Your Referral Link →
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100">
                            {["PG Name", "City", "Status", "Verified"].map((h) => (
                              <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 px-6 py-3">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {referredProps.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-6 py-4 text-sm font-semibold text-slate-900">{p.name}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">{p.city || "—"}</td>
                              <td className="px-6 py-4">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${propStatusStyles[p.status] || propStatusStyles.pending}`}>
                                  {p.status?.replace("_", " ").toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {p.is_verified
                                  ? <span className="text-green-600 font-bold text-sm">✓</span>
                                  : <span className="text-slate-300 text-sm">—</span>
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* COMMISSIONS */}
            {activeNav === "Commissions" && (
              <>
                <div className="mb-7">
                  <h1 className="text-2xl font-bold text-slate-900">Commission History</h1>
                  <p className="text-sm text-slate-500 mt-1">All commission transactions from your referred PGs.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  {commissionsLoading ? (
                    <div className="px-6 py-8 text-sm text-slate-400">Loading commissions...</div>
                  ) : commissions.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <p className="text-3xl mb-3">💰</p>
                      <p className="text-sm font-semibold text-slate-700">No commissions yet</p>
                      <p className="text-xs text-slate-400 mt-1">Commissions are credited when rent is paid through the platform.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100">
                            {["Property", "Month", "Amount", "Type", "Status", "Date"].map((h) => (
                              <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 px-6 py-3">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {commissions.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-6 py-4 text-sm font-semibold text-slate-900">{c.properties?.name ?? "—"}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {c.month ? new Date(c.month).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatCurrency(c.amount)}</td>
                              <td className="px-6 py-4">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {c.type}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyles[c.status] || statusStyles.pending}`}>
                                  {c.status?.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">{formatDate(c.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* REFERRAL LINK */}
            {activeNav === "Referral Link" && (
              <>
                <div className="mb-7">
                  <h1 className="text-2xl font-bold text-slate-900">Your Referral Link</h1>
                  <p className="text-sm text-slate-500 mt-1">Share this link with PG owners. When they list their property using your link, you earn commission.</p>
                </div>

                {/* Code display */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Your Referral Code</p>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                      <p className="text-2xl font-bold text-blue-600 tracking-[0.3em] font-mono">{referralCode || "Loading..."}</p>
                    </div>
                    <button onClick={copyCode} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-3 rounded-xl transition-all cursor-pointer shrink-0">
                      {copied ? "Copied!" : "Copy Code"}
                    </button>
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Shareable Link</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 overflow-hidden">
                      <p className="text-sm text-slate-600 truncate font-mono">{referralUrl || "Loading..."}</p>
                    </div>
                    <button onClick={copyCode} className="border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 font-semibold text-sm px-4 py-3 rounded-xl transition-all cursor-pointer shrink-0">
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>

                {/* How it works */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-slate-900 mb-5">How the Referral Works</h3>
                  <div className="space-y-5">
                    {[
                      { n: 1, title: "Share your link", desc: "Send your unique referral link or code to a PG owner in your area." },
                      { n: 2, title: "Owner lists their PG", desc: "The owner clicks your link and lists their property on PG Connect. Your code is automatically linked." },
                      { n: 3, title: "Tenant books and pays", desc: "A student books the PG and pays rent through the platform." },
                      { n: 4, title: "You earn 2%", desc: "PG Connect credits 2% of every rent payment to your balance — monthly and recurring." },
                    ].map((step) => (
                      <div key={step.n} className="flex items-start gap-4">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{step.n}</div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{step.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="h-8" />
          </main>
        </div>
      </div>
    </>
  );
}
