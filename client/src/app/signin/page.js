"use client";
import Head from "next/head";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { userLogin } from "../api";
import Navbar from "../components/Navbar";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get("next") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    setLoading(true);
    try {
      const response = await userLogin({ email, password });
      setLoading(false);
      if (nextPath) { router.push(nextPath); return; }
      const role = response?.user?.role;
      if (role === "student") { router.push("/referrerDashboard"); }
      else if (role === "owner") { router.push("/ownersDashboard"); }
      else if (role === "admin") { router.push("/admin"); }
      else { router.push("/"); }
    } catch (err) {
      setLoading(false);
      setError(`Login failed: ${err?.message || 'Please try again.'}`);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In — PG Connect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'Plus Jakarta Sans', sans-serif; background: #EFF6FF; }`}</style>
      </Head>

      <div className="min-h-screen flex flex-col" style={{ background: "#EFF6FF" }}>

        <Navbar />

        {/* Main */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg border p-7 sm:p-9" style={{ borderColor: "#bfdbfe" }}>

              {/* Heading */}
              <div className="text-center mb-7">
                <motion.div
                  initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#1D4ED8" }}>
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </motion.div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "#1E3A5F" }}>Welcome Back</h1>
                <p className="mt-2 text-sm" style={{ color: "#1E3A5F80" }}>Sign in to your PG Connect account</p>
              </div>

              {/* Google */}
              <button
                onClick={() => setError("Google sign-in coming soon")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 transition-all font-semibold text-sm py-3 rounded-xl mb-5 cursor-pointer disabled:opacity-60 border"
                style={{ background: "#EFF6FF", borderColor: "#bfdbfe", color: "#1E3A5F" }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background: "#e0f2fe" }} />
                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#1E3A5F60" }}>Or with email</span>
                <div className="flex-1 h-px" style={{ background: "#e0f2fe" }} />
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-4 py-2.5 rounded-xl overflow-hidden"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1E3A5F80" }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 text-sm placeholder-slate-400 outline-none transition-all"
                    style={{ background: "#EFF6FF", borderColor: "#bfdbfe", color: "#1E3A5F" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#1D4ED8"; e.currentTarget.style.background = "white"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.background = "#EFF6FF"; }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#1E3A5F80" }}>Password</label>
                    <a href="#" className="text-xs font-semibold transition-colors" style={{ color: "#F97316" }}>Forgot Password?</a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border rounded-xl px-4 py-3 text-sm placeholder-slate-400 outline-none transition-all pr-11"
                      style={{ background: "#EFF6FF", borderColor: "#bfdbfe", color: "#1E3A5F" }}
                      onFocus={e => { e.currentTarget.style.borderColor = "#1D4ED8"; e.currentTarget.style.background = "white"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.background = "#EFF6FF"; }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer" style={{ color: "#1E3A5F60" }}>
                      {showPassword ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  type="submit"
                  disabled={loading}
                  className="w-full transition-colors text-white font-bold text-sm py-3.5 rounded-xl mt-1 cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  style={{ background: "#1D4ED8" }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.background = "#1e40af")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#1D4ED8")}
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Signing in…
                    </>
                  ) : "Sign In"}
                </motion.button>
              </form>

              <p className="text-center text-sm mt-5" style={{ color: "#1E3A5F80" }}>
                Don&apos;t have an account?{" "}
                <a href={nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : "/register"} className="font-semibold transition-colors" style={{ color: "#1D4ED8" }}>Sign Up</a>
              </p>
            </div>

            <p className="flex items-center justify-center gap-1.5 text-xs mt-5" style={{ color: "#1E3A5F60" }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Secured by PG Connect Authentication
            </p>
          </motion.div>
        </main>

        <footer className="border-t" style={{ background: "white", borderColor: "#e0f2fe" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs" style={{ color: "#1E3A5F60" }}>&copy; {new Date().getFullYear()} PG Connect. All rights reserved.</p>
            <div className="flex gap-5">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Cookie Policy", href: "/cookie-policy" },
              ].map((l) => (
                <Link key={l.label} href={l.href} className="text-xs transition-colors" style={{ color: "#1E3A5F60" }}>{l.label}</Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
