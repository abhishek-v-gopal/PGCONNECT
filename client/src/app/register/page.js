"use client";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { userRegister } from "../api";

const STEPS = ["Account", "Personal", "Preferences"];

const universities = [
  "IIT Delhi", "IIT Bombay", "IIT Bangalore", "IIT Madras",
  "Delhi University", "Mumbai University", "Anna University",
  "VIT Vellore", "BITS Pilani", "NIT Trichy", "Jadavpur University",
  "Other",
];

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    // Step 0 — Account
    role: "student",
    email: "",
    password: "",
    confirmPassword: "",
    // Step 1 — Personal
    firstName: "",
    lastName: "",
    phone: "",
    // Step 2 — Preferences (student)
    university: "",
    moveInDate: "",
    budget: "",
    gender: "",
    // Step 2 — Preferences (owner)
    propertyCity: "",
    propertiesCount: "",
    agreeTerms: false,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── Validation per step ─────────────────────────────
  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = "Enter a valid email.";
      if (form.password.length < 6) e.password = "At least 6 characters.";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match.";
    }
    if (step === 1) {
      if (!form.firstName.trim()) e.firstName = "First name required.";
      if (!form.lastName.trim()) e.lastName = "Last name required.";
      if (!form.phone.trim()) e.phone = "Phone number required.";
      if (form.role === "student" && !form.university) e.university = "Select your university.";
      if (form.role === "student" && !form.agreeTerms) e.agreeTerms = "You must accept the terms.";
    }
    if (step === 2) {
      if (form.role === "owner" && !form.agreeTerms) e.agreeTerms = "You must accept the terms.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // dynamic last step: students finish on step 1, owners on step 2
  const lastStep = form.role === "student" ? 1 : 2;

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => { setErrors({}); setStep(s => s - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        FirstName: form.firstName,
        LastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      if (form.role === "student") {
        payload.university = form.university;
      }
      if (form.role === "owner") {
        payload.city = form.propertyCity;
      }

      await userRegister(payload);
      setSubmitted(true);
      setTimeout(() => router.push("/signin"), 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setErrors(prev => ({ ...prev, submit: err?.response?.data?.message || err.message || 'Registration failed' }));
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Excellent"][strength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-blue-500", "bg-green-500"][strength];

  if (submitted) {
    return (
      <>
        <Head>
          <title>Welcome to PG Connect!</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
          <style>{`body { font-family: 'DM Sans', sans-serif; } .font-serif-display { font-family: 'DM Serif Display', serif; }`}</style>
        </Head>
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">You're all set!</h1>
            <p className="text-sm text-slate-500">Your account has been created. Redirecting to sign in…</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Create Account — PG Connect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'DM Sans', sans-serif; } .font-serif-display { font-family: 'DM Serif Display', serif; }`}</style>
      </Head>

      <div className="min-h-screen bg-slate-100 flex flex-col">

        {/* ── NAV ── */}
        <nav className="bg-slate-100 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-14 flex items-center justify-between">
            <button onClick={() => router.push("/")} className="font-serif-display text-slate-900 text-base sm:text-lg cursor-pointer">
              PG Connect
            </button>
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <button onClick={() => router.push("/signin")} className="font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">Sign in</button>
            </p>
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">

            {/* ── CARD ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

              {/* Google button (step 0 only) */}
              {step === 0 && (
                <>
                  <div className="px-7 sm:px-9 pt-7 pb-5">
                    <button className="w-full flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 active:scale-[.98] transition-all text-slate-800 font-semibold text-sm py-3 rounded-xl cursor-pointer">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 px-7 sm:px-9">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Or with email</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit}>
                <div className={`px-7 sm:px-9 ${step === 0 ? "pt-5" : "pt-7"} pb-7`}>

                  {/* ── STEP 0: Account ── */}
                  {step === 0 && (
                    <div className="space-y-4">
                      {/* Heading */}
                      <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Create your account</h2>
                        <p className="text-sm text-slate-500 mt-2">Join 24,000+ students and owners on PG Connect</p>
                      </div>

                      {/* Role selector */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">I am a</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: "student", label: "Student", desc: "Looking for a PG" },
                            { value: "owner", label: "Property Owner", desc: "Listing properties" },
                          ].map(r => (
                            <button
                              key={r.value}
                              type="button"
                              onClick={() => set("role", r.value)}
                              className={`text-left border-2 rounded-xl p-4 transition-all ${
                                form.role === r.value
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <p className={`text-sm font-bold ${form.role === r.value ? "text-blue-700" : "text-slate-900"}`}>
                                {r.label}
                              </p>
                              <p className={`text-xs mt-1 ${form.role === r.value ? "text-blue-600" : "text-slate-500"}`}>
                                {r.desc}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Email Address</label>
                        <input
                          type="email"
                          placeholder="name@university.edu"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                        />
                        {errors.email && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>{errors.email}</p>}
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => set("password", e.target.value)}
                            className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all pr-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          >
                            {showPassword ? (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {form.password && (
                          <div className="mt-2.5 flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-slate-200"}`} />
                            ))}
                          </div>
                        )}
                        {errors.password && <p className="text-xs text-red-600 mt-1.5">{errors.password}</p>}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Confirm Password</label>
                        <div className="relative">
                          <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="••••••••"
                            value={form.confirmPassword}
                            onChange={(e) => set("confirmPassword", e.target.value)}
                            className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all pr-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          >
                            {showConfirm ? (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-red-600 mt-1.5">{errors.confirmPassword}</p>}
                      </div>
                    </div>
                  )}

                  {/* ── STEP 1: Personal ── */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Tell us about yourself</h2>
                        <p className="text-sm text-slate-500 mt-2">This helps us personalise your experience</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">First Name</label>
                          <input
                            type="text"
                            placeholder="Aditya"
                            value={form.firstName}
                            onChange={(e) => set("firstName", e.target.value)}
                            className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                          />
                          {errors.firstName && <p className="text-xs text-red-600 mt-1.5">{errors.firstName}</p>}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Last Name</label>
                          <input
                            type="text"
                            placeholder="Kapoor"
                            value={form.lastName}
                            onChange={(e) => set("lastName", e.target.value)}
                            className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                          />
                          {errors.lastName && <p className="text-xs text-red-600 mt-1.5">{errors.lastName}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="98765 43210"
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                        />
                        {errors.phone && <p className="text-xs text-red-600 mt-1.5">{errors.phone}</p>}
                      </div>
                    {form.role === "student" && (

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">University / College</label>
                        <input
                          type="text"
                          placeholder="University of Example"
                          value={form.university}
                          onChange={(e) => set("university", e.target.value)}
                          className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                        />
                        {errors.university && <p className="text-xs text-red-600 mt-1.5">{errors.university}</p>}
                      </div>
                    )}

                    {form.role === "student" && (
                      <label className="flex items-start gap-3 cursor-pointer mt-4">
                        <div
                          onClick={() => set("agreeTerms", !form.agreeTerms)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                            form.agreeTerms ? "bg-blue-600 border-blue-600" : "border-slate-300 hover:border-blue-400"
                          }`}
                        >
                          {form.agreeTerms && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="2 6 5 9 10 3" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 leading-relaxed">
                          I agree to PG Connect's{" "}
                          <a href="#" className="text-blue-600 font-semibold hover:underline">Terms of Service</a> and{" "}
                          <a href="#" className="text-blue-600 font-semibold hover:underline">Privacy Policy</a>.
                          I confirm I am 18 years or older.
                        </span>
                      </label>
                    )}

                    </div>
                  )}

                  {/* ── STEP 2: Preferences ── */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                          {form.role === "student" ? "Your preferences" : "Your properties"}
                        </h2>
                        <p className="text-sm text-slate-500 mt-2">Almost there — just a couple more details</p>
                      </div>

                      {form.role === "student" ? (
                        <>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">University / College</label>
                            <div className="relative">
                              <select
                                value={form.university}
                                onChange={(e) => set("university", e.target.value)}
                                className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all appearance-none"
                              >
                                <option value="">Enter your university</option>
                                {universities.map(u => <option key={u}>{u}</option>)}
                              </select>
                              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </div>
                            {errors.university && <p className="text-xs text-red-600 mt-1.5">{errors.university}</p>}
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Preferred Move-in Date</label>
                            <input
                              type="date"
                              value={form.moveInDate}
                              onChange={(e) => set("moveInDate", e.target.value)}
                              className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Budget (₹)</label>
                              <div className="relative">
                                <select value={form.budget} onChange={(e) => set("budget", e.target.value)} className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none transition-all appearance-none">
                                  <option value="">Any budget</option>
                                  <option>Under ₹8,000</option>
                                  <option>₹8,000 – ₹15,000</option>
                                  <option>₹15,000 – ₹25,000</option>
                                  <option>Above ₹25,000</option>
                                </select>
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Room Type</label>
                              <div className="relative">
                                <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none transition-all appearance-none">
                                  <option value="">Any</option>
                                  <option>Boys</option>
                                  <option>Girls</option>
                                  <option>Co-ed</option>
                                </select>
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">City</label>
                            <input
                              type="text"
                              placeholder="e.g. Bangalore, Delhi"
                              value={form.propertyCity}
                              onChange={(e) => set("propertyCity", e.target.value)}
                              className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Number of Properties</label>
                            <div className="relative">
                              <select value={form.propertiesCount} onChange={(e) => set("propertiesCount", e.target.value)} className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none transition-all appearance-none">
                                <option value="">Select</option>
                                <option>1</option>
                                <option>2–5</option>
                                <option>6–10</option>
                                <option>10+</option>
                              </select>
                              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Terms checkbox */}
                      <label className="flex items-start gap-3 cursor-pointer mt-6">
                        <div
                          onClick={() => set("agreeTerms", !form.agreeTerms)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                            form.agreeTerms ? "bg-blue-600 border-blue-600" : "border-slate-300 hover:border-blue-400"
                          }`}
                        >
                          {form.agreeTerms && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="2 6 5 9 10 3" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 leading-relaxed">
                          I agree to PG Connect's{" "}
                          <a href="#" className="text-blue-600 font-semibold hover:underline">Terms of Service</a> and{" "}
                          <a href="#" className="text-blue-600 font-semibold hover:underline">Privacy Policy</a>.
                          I confirm I am 18 years or older.
                        </span>
                      </label>
                      {errors.agreeTerms && <p className="text-xs text-red-600">{errors.agreeTerms}</p>}
                    </div>
                  )}

                  {/* ── NAVIGATION BUTTONS ── */}
                  <div className="flex gap-3 mt-7">
                    {step > 0 && (
                      <button
                        type="button"
                        onClick={back}
                        className="px-6 py-3 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Back
                      </button>
                    )}
                    {step < lastStep ? (
                      <button
                        type="button"
                        onClick={next}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-bold text-sm py-3.5 rounded-xl cursor-pointer"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-bold text-sm py-3.5 rounded-xl cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Creating account…
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <p className="text-center text-xs text-slate-400 mt-5 flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Secured by PG Connect Authentication
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-serif-display text-sm font-bold text-slate-900">PG Connect</p>
              <p className="text-xs text-slate-400 mt-0.5">© 2024 PG Connect. All rights reserved.</p>
            </div>
            <div className="flex gap-5">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
                <a key={l} href="#" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}