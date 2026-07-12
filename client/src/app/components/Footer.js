import Link from "next/link";

const QUICK_LINKS = [
  { label: "Browse PGs", href: "/propertys" },
  { label: "List Your Property", href: "/listProperty" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Referral Program", href: "/how-it-works#referral" },
];

const OWNER_LINKS = [
  { label: "Owner Dashboard", href: "/ownersDashboard" },
  { label: "List a Property", href: "/listProperty" },
  { label: "Pricing & Commission", href: "/how-it-works#pricing" },
  { label: "Verification Process", href: "/how-it-works#verification" },
];

const SUPPORT_LINKS = [
  { label: "Help Center", href: "/help" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: "#1E3A5F" }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <p className="text-xl font-bold text-white mb-2">PG Connect</p>
            <p className="text-sm text-white/50 leading-relaxed">
              Kerala's premier student PG marketplace. Find verified, affordable living spaces near your campus.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Quick Links</p>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">For Owners</p>
            <ul className="space-y-2.5">
              {OWNER_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Support</p>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-white/40">&copy; {year} PG Connect. All rights reserved. Curated Student Living.</p>
          <p className="text-xs text-white/30">Made with ♥ for Kerala students</p>
        </div>
      </div>
    </footer>
  );
}
