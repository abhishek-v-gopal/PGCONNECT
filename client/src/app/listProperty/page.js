"use client";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createProperty } from "../api";

const AMENITIES = ["Wi-Fi", "AC", "Laundry", "Kitchen", "Security", "Gym"];
const ROOM_TYPES = ["Default", "Single", "Double", "Triple", "More than 3"];

export default function ListProperty() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    name: "",
    tagline: "",
    address: "",
    city: "",
    landmark: "",
    amenities: [],
    gender: "Boys",
    managerName: "",
    managerPhone: "",
  });

  const [rooms, setRooms] = useState([
    {
      type: "Default",
      price: "",
      totalBeds: "",
      availableBeds: "",
      description: "",
    },
  ]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const updateRoom = (index, field, value) => {
    setRooms((prev) => prev.map((room, roomIndex) => (
      roomIndex === index ? { ...room, [field]: value } : room
    )));
  };

  const addRoom = () => {
    setRooms((prev) => ([
      ...prev,
      {
        type: "Default",
        price: "",
        totalBeds: "",
        availableBeds: "",
        description: "",
      },
    ]));
  };

  const removeRoom = (index) => {
    setRooms((prev) => prev.filter((_, roomIndex) => roomIndex !== index));
  };

  const buildPropertyPayload = () => ({
    name: form.name.trim(),
    tagline: form.tagline.trim(),
    location: {
      address: form.address.trim(),
      city: form.city.trim(),
      landmark: form.landmark.trim(),
    },
    amenities: form.amenities,
    rooms: rooms.map((room) => ({
      type: room.type.trim(),
      price: Number(room.price),
      totalBeds: Number(room.totalBeds),
      availableBeds: Number(room.availableBeds || room.totalBeds),
      description: room.description.trim(),
    })),
    gender: form.gender,
    manager: {
      name: form.managerName.trim(),
      phone: form.managerPhone.trim(),
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasInvalidRoom = rooms.some((room) => !room.price || !room.totalBeds);

    if (!form.name || !form.address || !form.city || !form.managerName || rooms.length === 0 || hasInvalidRoom) {
      setSubmitError("Please fill in the required fields.");
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    try {
      const payload = buildPropertyPayload();
      const response = await createProperty(payload);

      const listing = {
        propertyName: form.name,
        location: `${form.address}, ${form.city}${form.landmark ? ` (${form.landmark})` : ""}`,
        pricePerBed: form.roomPrice,
        totalBeds: rooms[0]?.totalBeds || "",
        amenities: form.amenities,
        images: [],
        verified: false,
        submittedAt: new Date().toISOString(),
        apiResponse: response,
      };

      localStorage.setItem("pg_listing", JSON.stringify(listing));
      setSubmitted(true);
      setTimeout(() => router.push("/listingPending"), 1500);
    } catch (error) {
      console.error("Error creating property:", {
        status: error?.status,
        data: error?.data,
        message: error?.message,
      });
      setSubmitError(error?.message || "Failed to create property.");
    } finally {
      setSubmitting(false);
    }
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-10 sm:pt-14 pb-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">List Your Property</h1>
          <p className="mt-3 text-slate-500 text-sm sm:text-base max-w-lg leading-relaxed">
            Create a new property listing that matches the API payload for <span className="font-semibold text-slate-700">/api/properties</span>.
          </p>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 w-full flex-1 flex items-start justify-center">
          <div className="max-w-3xl w-full">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-4 py-2.5 rounded-xl">
                  {submitError}
                </div>
              )}

              <section className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Property Name</label>
                  <input
                    type="text"
                    placeholder="Nirmal Jyothi"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                    className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Tagline</label>
                  <input
                    type="text"
                    placeholder="Modern co-living in Koramangala"
                    value={form.tagline}
                    onChange={(e) => updateField("tagline", e.target.value)}
                    className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Address</label>
                    <input
                      type="text"
                      placeholder="5th Block"
                      value={form.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      required
                      className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">City</label>
                    <input
                      type="text"
                      placeholder="Chanaganassery"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      required
                      className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Landmark</label>
                  <input
                    type="text"
                    placeholder="Near Forum Mall"
                    value={form.landmark}
                    onChange={(e) => updateField("landmark", e.target.value)}
                    className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Gender</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {["Boys", "Girls", "Co-ed"].map((option) => {
                      const active = form.gender === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => updateField("gender", option)}
                          className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all text-left ${active ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Amenities</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {AMENITIES.map((amenity) => {
                      const checked = form.amenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium text-left transition-all cursor-pointer ${checked ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-all ${checked ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
                            {checked && (
                              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="2 6 5 9 10 3" />
                              </svg>
                            )}
                          </div>
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Room Details</label>
                  <div className="space-y-4">
                    {rooms.map((room, index) => (
                      <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Room {index + 1}</p>
                            <p className="text-xs text-slate-500">Add pricing and capacity for this room type.</p>
                          </div>
                          {rooms.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRoom(index)}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Room Type</label>
                            <select
                              value={room.type}
                              onChange={(e) => updateRoom(index, "type", e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none transition-all"
                            >
                              {ROOM_TYPES.map((type) => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Price</label>
                            <input
                              type="number"
                              placeholder="15000"
                              value={room.price}
                              onChange={(e) => updateRoom(index, "price", e.target.value)}
                              min="0"
                              required
                              className="w-full bg-white border border-slate-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Total Beds</label>
                            <input
                              type="number"
                              placeholder="10"
                              value={room.totalBeds}
                              onChange={(e) => updateRoom(index, "totalBeds", e.target.value)}
                              min="1"
                              required
                              className="w-full bg-white border border-slate-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Available Beds</label>
                            <input
                              type="number"
                              placeholder="4"
                              value={room.availableBeds}
                              onChange={(e) => updateRoom(index, "availableBeds", e.target.value)}
                              min="0"
                              className="w-full bg-white border border-slate-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Description</label>
                          <textarea
                            rows={3}
                            placeholder={index === 0 ? "Twin beds" : "Add room details"}
                            value={room.description}
                            onChange={(e) => updateRoom(index, "description", e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addRoom}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                    Add room
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Manager Name</label>
                    <input
                      type="text"
                      placeholder="Rajesh Kumar"
                      value={form.managerName}
                      onChange={(e) => updateField("managerName", e.target.value)}
                      required
                      className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Manager Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={form.managerPhone}
                      onChange={(e) => updateField("managerPhone", e.target.value)}
                      className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Ready to create this property?</p>
                  <p className="text-xs text-slate-500 mt-0.5">This will post a new record to the properties API and keep the pending flow working.</p>
                </div>
                <button
                  type="submit"
                  disabled={submitting || submitted}
                  className="shrink-0 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-bold text-sm px-5 py-3 rounded-xl cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Creating…
                    </>
                  ) : submitted ? "✓ Submitted" : "Create Property"}
                </button>
              </div>
            </form>
          </div>
        </main>

        <footer className="bg-white border-t border-slate-200 mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-serif-display text-base font-bold text-slate-900">PG Connect</p>
              <p className="text-xs text-slate-400 mt-0.5">© 2024 PG Connect. Curated Student Living.</p>
            </div>
            <div className="flex flex-wrap gap-5">
              {["Privacy Policy", "Terms of Service", "Help Center", "Contact Us"].map((label) => (
                <a key={label} href="#" className="text-xs text-slate-500 hover:text-blue-600 transition-colors">{label}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}