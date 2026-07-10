"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { getCurrentUser, logout } from "../api";

const DASHBOARD_PATH = {
  student: "/propertys",
  owner: "/ownersDashboard",
  admin: "/admin",
};

const NAV_LINKS = [
  { label: "Explore", href: "/propertys" },
  { label: "List Property", href: "/listProperty" },
];

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) { setUser(null); setCheckingAuth(false); }
        return;
      }
      try {
        const res = await getCurrentUser();
        if (mounted) setUser(res?.user || null);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    };

    loadUser();

    const { data: subscription } = supabase.auth.onAuthStateChange(() => loadUser());
    return () => { mounted = false; subscription?.subscription?.unsubscribe(); };
  }, []);

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U"
    : "";

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
  };

  const goToDashboard = () => {
    setUserMenuOpen(false);
    router.push(DASHBOARD_PATH[user?.role] || "/profile");
  };

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? "bg-white/90 shadow-md border-b border-blue-100/80" : "bg-white/70 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <motion.button
          onClick={() => router.push("/")}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="font-bold text-[#1D4ED8] text-lg tracking-tight cursor-pointer shrink-0"
        >
          PG Connect
        </motion.button>

        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((l) => (
            <button
              key={l.label}
              onClick={() => router.push(l.href)}
              className="group relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer text-[#1E3A5F]/60 hover:text-[#1D4ED8]"
            >
              {l.label}
              <span className="pointer-events-none absolute left-3 right-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-[#1D4ED8] transition-transform duration-300 group-hover:scale-x-100" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!checkingAuth && !user && (
            <>
              <button onClick={() => router.push("/signin")} className="text-sm font-semibold text-[#1D4ED8] hover:opacity-80 hidden sm:block cursor-pointer">
                Sign In
              </button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push("/listProperty")}
                className="bg-[#F97316] hover:bg-[#ea6c0a] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer hidden sm:block shadow-sm hover:shadow-md"
              >
                List Your PG
              </motion.button>
            </>
          )}

          {!checkingAuth && user && (
            <div className="relative hidden sm:block">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUserMenuOpen((v) => !v)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer shrink-0 shadow-sm"
                style={{ background: "linear-gradient(135deg, #1D4ED8, #1e40af)" }}
              >
                {initials}
              </motion.button>
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-blue-100 py-1.5 z-50 origin-top-right"
                    >
                      <p className="px-3.5 py-2 text-xs text-[#1E3A5F80] truncate border-b border-blue-50">
                        {user.first_name} {user.last_name}
                      </p>
                      <button onClick={goToDashboard} className="w-full text-left px-3.5 py-2 text-sm text-[#1E3A5F] hover:bg-blue-50 cursor-pointer transition-colors">
                        Dashboard
                      </button>
                      <button onClick={handleSignOut} className="w-full text-left px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors">
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          <button className="md:hidden p-1.5 text-[#1E3A5F]/60 hover:bg-blue-50 rounded-lg cursor-pointer" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <motion.svg animate={{ rotate: menuOpen ? 90 : 0 }} transition={{ duration: 0.2 }} className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </motion.svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-blue-100 bg-white overflow-hidden"
          >
            <div className="px-5 py-4 flex flex-col gap-3">
              {NAV_LINKS.map((l) => (
                <button key={l.label} onClick={() => { router.push(l.href); setMenuOpen(false); }} className="text-sm font-medium text-[#1E3A5F]/70 text-left cursor-pointer">
                  {l.label}
                </button>
              ))}
              {!checkingAuth && user ? (
                <>
                  <button onClick={() => { goToDashboard(); setMenuOpen(false); }} className="text-sm font-semibold text-[#1D4ED8] text-left cursor-pointer">Dashboard</button>
                  <button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="text-sm font-semibold text-red-600 text-left cursor-pointer">Sign Out</button>
                </>
              ) : (
                <>
                  <button onClick={() => { router.push("/signin"); setMenuOpen(false); }} className="text-sm font-semibold text-[#1D4ED8] text-left cursor-pointer">Sign In</button>
                  <button
                    onClick={() => { router.push("/listProperty"); setMenuOpen(false); }}
                    className="bg-[#F97316] text-white text-sm font-bold py-2.5 rounded-xl mt-1 cursor-pointer"
                  >
                    List Your PG
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
