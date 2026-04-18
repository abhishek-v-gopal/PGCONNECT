"use client";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

const AMENITIES = ["Wi-Fi", "AC", "Laundry", "Kitchen", "Security", "Gym"];

export default function ListProperty() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    propertyName: "",
    location: "",
    pricePerBed: "",
    totalBeds: "",
    amenities: [],
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  const toggleAmenity = (a) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  };

  const handleFiles = (files) => {
    const valid = Array.from(files).filter((f) => f.size <= 5 * 1024 * 1024);
    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
    setForm((prev) => ({ ...prev, images: [...prev.images, ...valid] }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.propertyName || !form.location || !form.pricePerBed || !form.totalBeds) return;
    setSubmitting(true);
    setTimeout(() => {
      // Save listing to localStorage with verified: false
      const listing = {
        ...form,
        images: imagePreviews,
        verified: false,
        submittedAt: new Date().toISOString(),
      };
      localStorage.setItem("pg_listing", JSON.stringify(listing));
      setSubmitting(false);
      setSubmitted(true);
      // Redirect to pending page after a moment
      setTimeout(() => router.push("/listingPending"), 1500);
    }, 1200);
  };

  return (
    <>
      <Head>
        <title>List Your Property — PG Connect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'DM Sans', sans-serif; } .font-serif-display { font-family: 'DM Serif Display', serif; }`}</style>
      </Head>

      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">

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
              <button onClick={() => router.push("/signin")} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer">Sign In</button>
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
              <a href="#" className="text-sm font-medium text-slate-500">About</a>
            </div>
          )}
        </nav>

        {/* Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-10 sm:pt-14 pb-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">List Your Property</h1>
          <p className="mt-3 text-slate-500 text-sm sm:text-base max-w-lg leading-relaxed">
            Join the PG Connect ecosystem. Provide your property details to start attracting quality student residents.
          </p>
        </div>

        {/* Form card */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 w-full flex-1 flex items-start justify-center">
          <div className="max-w-2xl">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">

              {/* Property Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Property Name</label>
                <input
                  type="text"
                  placeholder="e.g. Skyline Student Residences"
                  value={form.propertyName}
                  onChange={(e) => setForm({ ...form, propertyName: e.target.value })}
                  required
                  className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Location</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Street name, City, Landmark"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    required
                    className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Price + Beds */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Price Per Bed</label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.pricePerBed}
                      onChange={(e) => setForm({ ...form, pricePerBed: e.target.value })}
                      required
                      min="0"
                      className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Total Beds Available</label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 14h20" />
                    </svg>
                    <input
                      type="number"
                      placeholder="Total count"
                      value={form.totalBeds}
                      onChange={(e) => setForm({ ...form, totalBeds: e.target.value })}
                      required
                      min="1"
                      className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Key Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AMENITIES.map((a) => {
                    const checked = form.amenities.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium text-left transition-all cursor-pointer
                          ${checked ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-all
                          ${checked ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
                          {checked && (
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="2 6 5 9 10 3" />
                            </svg>
                          )}
                        </div>
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Property Images */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Property Images</label>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/30"
                >
                  <svg className="w-10 h-10 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                  <p className="text-sm font-semibold text-slate-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-400">High-res JPG or PNG (Max 5MB per image)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </div>

                {/* Previews */}
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreviews((p) => p.filter((_, j) => j !== i));
                            setForm((prev) => ({ ...prev, images: prev.images.filter((_, j) => j !== i) }));
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors"
                        >
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {/* Empty placeholders */}
                    {imagePreviews.length < 2 && Array.from({ length: 2 - imagePreviews.length }).map((_, i) => (
                      <div key={`ph-${i}`} className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200" />
                    ))}
                  </div>
                )}
                {imagePreviews.length === 0 && (
                  <div className="flex gap-3 mt-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200" />
                    <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200" />
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || submitted}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-bold text-sm py-3.5 rounded-xl cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Submitting…
                  </>
                ) : submitted ? "✓ Submitted!" : "Submit Property Listing"}
              </button>
            </form>

            {/* Verify CTA */}
            <div className="mt-5 bg-green-50 border border-green-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-green-800">Verify Your Listing</p>
                <p className="text-xs text-green-700 mt-1 leading-relaxed max-w-sm">
                  Properties with verified badges receive 4× more inquiries. Our team will visit your location within 48 hours of submission.
                </p>
              </div>
              <button className="shrink-0 flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer whitespace-nowrap">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Fast-Track
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-10">
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