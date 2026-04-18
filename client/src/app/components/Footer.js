export default function footer() {
    return (
        <footer className="bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-5 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-serif-display text-base text-slate-900">PG Connect</p>
              <p className="text-xs text-slate-400 mt-0.5"> &copy; {new Date().getFullYear()} PG Connect. Curated Student Living.</p>
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {["Privacy Policy", "Terms of Service", "Help Center", "Contact Us"].map((link) => (
                <a key={link} href="#" className="text-xs sm:text-sm text-slate-500 hover:text-blue-600 transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </footer>
    )
}