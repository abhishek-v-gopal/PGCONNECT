"use client";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);

    // Simulate auth — check localStorage for submitted listing
    setTimeout(() => {
      setLoading(false);
      const listing = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("pg_listing") || "null")
        : null;

      if (!listing) {
        // No listing submitted → go to listing page
        router.push("/listProperty");
      } else if (listing && !listing.verified) {
        // Listing submitted but not verified → go to pending page
        router.push("/listingPending");
      } else {
        // Verified → go home
        router.push("/ownersDashboard");
      }
    }, 1000);
  };

  const handleGoogle = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const listing = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("pg_listing") || "null")
        : null;
      if (!listing) {
        router.push("/list-property");
      } else if (!listing.verified) {
        router.push("/listing-pending");
      } else {
        router.push("/");
      }
    }, 800);
  };

  return (
    <>
      <Head>
        <title>Sign In — PG Connect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'DM Sans', sans-serif; } .font-serif-display { font-family: 'DM Serif Display', serif; }`}</style>
      </Head>

      <div className="min-h-screen bg-slate-100 flex flex-col">

        {/* Nav */}
        <nav className="bg-slate-100 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-14 flex items-center justify-between">
            <button onClick={() => router.push("/")} className="font-serif-display text-slate-900 text-base sm:text-lg cursor-pointer">
              PG Connect
            </button>
            <div className="hidden sm:flex items-center gap-8">
              {["Properties", "Life", "Contact"].map((l) => (
                <a key={l} href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">{l}</a>
              ))}
            </div>
            <button onClick={() => router.push("/")} className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </nav>

        {/* Main */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-7 sm:p-9">

              {/* Heading */}
              <div className="text-center mb-7">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
                <p className="mt-2 text-sm text-slate-500">Sign in to your PG Connect sanctuary</p>
              </div>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all text-slate-800 font-semibold text-sm py-3 rounded-xl mb-5 cursor-pointer disabled:opacity-60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Or with email</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-4 py-2.5 rounded-xl">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Password</label>
                    <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">Forgot Password?</a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-bold text-sm py-3.5 rounded-xl mt-1 cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
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
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-5">
                Don&apos;t have an account?{" "}
                <a href="#" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Sign Up</a>
              </p>
            </div>

            {/* Security note */}
            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-5">
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