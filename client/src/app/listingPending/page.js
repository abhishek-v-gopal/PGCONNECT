"use client";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ListingPending() {
  const router = useRouter();
  const [listing, setListing] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("pg_listing") || "null");
    setListing(data);
  }, []);

  const submittedAt = listing?.submittedAt
    ? new Date(listing.submittedAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : null;

  // DEV helper — simulate verification
  const simulateVerify = () => {
    const data = JSON.parse(localStorage.getItem("pg_listing") || "{}");
    data.verified = true;
    localStorage.setItem("pg_listing", JSON.stringify(data));
    router.push("/");
  };

  const clearAndRelist = () => {
    localStorage.removeItem("pg_listing");
    router.push("/listProperty");
  };

  return (
    <>
      <Head>
        <title>Listing Pending Review — PG Connect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
        <style>{`
          body { font-family: 'DM Sans', sans-serif; }
          .font-serif-display { font-family: 'DM Serif Display', serif; }
          @keyframes pulse-ring {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(234,179,8,0.4); }
            70% { transform: scale(1); box-shadow: 0 0 0 16px rgba(234,179,8,0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(234,179,8,0); }
          }
          .pulse-ring { animation: pulse-ring 2.5s infinite; }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          .float { animation: float 3s ease-in-out infinite; }
        `}</style>
      </Head>

      <div className="min-h-screen bg-slate-50 flex flex-col">

        {/* Nav */}
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-14 sm:h-16 flex items-center justify-between gap-4">
            <button onClick={() => router.push("/")} className="font-serif-display text-blue-600 text-lg sm:text-xl shrink-0 cursor-pointer">PG Connect</button>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => router.push("/")} className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">Properties</button>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Locations</a>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">About</a>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => router.push("/signin")} className="text-sm font-semibold text-blue-600 hover:opacity-75 transition-opacity cursor-pointer">Sign In</button>
              <button className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setMenuOpen(!menuOpen)}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="md:hidden border-t border-slate-100 bg-white px-5 py-4 flex flex-col gap-4">
              <button onClick={() => router.push("/")} className="text-sm font-medium text-slate-500 text-left">Properties</button>
              <a href="#" className="text-sm font-medium text-slate-500">Locations</a>
            </div>
          )}
        </nav>

        {/* Main */}
        <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
          <div className="w-full max-w-lg">

            {/* Animated status icon */}
            <div className="flex justify-center mb-8">
              <div className="pulse-ring w-20 h-20 rounded-full bg-amber-400 flex items-center justify-center float">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>

            {/* Status card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

              {/* Amber top bar */}
              <div className="bg-amber-400 h-1.5 w-full" />

              <div className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    Pending Verification
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Your listing is under review</h1>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    Our team is reviewing your property. We'll verify and publish it within <strong className="text-slate-700">48 hours</strong>.
                  </p>
                </div>

                {/* Listing summary */}
                {listing && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Your Submission</p>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{listing.propertyName}</p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                          </svg>
                          {listing.location}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-blue-600 text-sm">₹{Number(listing.pricePerBed).toLocaleString("en-IN")}/bed</p>
                        <p className="text-xs text-slate-400 mt-0.5">{listing.totalBeds} beds</p>
                      </div>
                    </div>
                    {listing.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {listing.amenities.map((a) => (
                          <span key={a} className="bg-blue-50 text-blue-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">{a}</span>
                        ))}
                      </div>
                    )}
                    {submittedAt && (
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-200">Submitted on {submittedAt}</p>
                    )}
                  </div>
                )}

                {/* Progress steps */}
                <div className="space-y-3 mb-6">
                  {[
                    { label: "Listing submitted", done: true },
                    { label: "Under team review (24–48 hrs)", done: false, active: true },
                    { label: "Verification visit scheduled", done: false },
                    { label: "Published & live on PG Connect", done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
                        ${step.done ? "bg-green-500 text-white" : step.active ? "bg-amber-400 text-white" : "bg-slate-200 text-slate-400"}`}>
                        {step.done ? (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : step.active ? (
                          <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        ) : i + 1}
                      </div>
                      <span className={`text-sm ${step.done ? "text-green-700 font-medium" : step.active ? "text-amber-700 font-semibold" : "text-slate-400"}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* What's next */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">What happens next?</p>
                  <ul className="space-y-1.5">
                    {[
                      "You'll receive an email confirmation shortly.",
                      "Our team will visit your property within 48 hours.",
                      "Once verified, your listing goes live immediately.",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-xs text-blue-800">
                        <svg className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push("/")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Browse Properties
                  </button>
                  <button
                    onClick={clearAndRelist}
                    className="flex-1 border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Edit Submission
                  </button>
                </div>

                {/* Dev helper */}
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <p className="text-[10px] text-slate-300 uppercase tracking-widest text-center mb-2">Dev Tools</p>
                  <button
                    onClick={simulateVerify}
                    className="w-full border border-dashed border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-300 text-xs font-medium py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Simulate Verification ✓ (dev only)
                  </button>
                </div>

              </div>
            </div>

            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              PG Connect Verified Property Management
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-serif-display text-base font-bold text-slate-900">PG Connect</p>
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