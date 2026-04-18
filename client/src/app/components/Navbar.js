"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
      const router = useRouter();
      const [menuOpen, setMenuOpen] = useState(false);


    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-14 sm:h-16 flex items-center justify-between gap-4">

            {/* Logo */}
            <a href="#" className="font-serif-display text-blue-600 text-lg sm:text-xl shrink-0">
              PG Connect
            </a>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-0.5">
                Properties
              </a>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                Locations
              </a>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                About
              </a>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={() => router.push("/signin")} className="text-sm font-semibold text-blue-600 hover:opacity-75 transition-opacity">
                Sign In
              </button>
              {/* Hamburger */}
              <button
                className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-slate-100 bg-white px-5 py-4 flex flex-col gap-4">
              <a href="#" className="text-sm font-semibold text-blue-600">Properties</a>
              <a href="#" className="text-sm font-medium text-slate-500">Locations</a>
              <a href="#" className="text-sm font-medium text-slate-500">About</a>
            </div>
          )}
        </nav>

    )
}