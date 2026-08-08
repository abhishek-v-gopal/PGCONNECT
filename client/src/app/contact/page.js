import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = { title: "Contact Us — PG Connect" };

const CHANNELS = [
  {
    label: "Email",
    value: "support@pgconnect.com",
    href: "mailto:support@pgconnect.com",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v16H4z" opacity="0" /><path d="M22 6l-10 7L2 6" /><rect x="2" y="4" width="20" height="16" rx="2" />
      </svg>
    ),
  },
  {
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    label: "Office",
    value: "Kochi, Kerala, India",
    href: null,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-bg)", color: "var(--pg-text)" }}>
      <Navbar />
      <main id="main-content" className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--pg-text)" }}>Contact Us</h1>
        <p className="mt-2 text-sm max-w-lg" style={{ color: "var(--pg-text-secondary)" }}>
          Have a question about a listing, a booking, or your account? Reach out through any of the channels below and we'll get back to you as soon as we can.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CHANNELS.map((c) => {
            const content = (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6 shadow-sm h-full hover:shadow-md transition-shadow" style={{ borderColor: "var(--pg-border-soft)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--pg-chip-bg)", color: "var(--pg-primary)" }}>
                  {c.icon}
                </div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--pg-text-tertiary)" }}>{c.label}</p>
                <p className="mt-1 text-sm font-semibold" style={{ color: "var(--pg-text)" }}>{c.value}</p>
              </div>
            );
            return c.href ? (
              <a key={c.label} href={c.href}>{content}</a>
            ) : (
              <div key={c.label}>{content}</div>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border p-6 sm:p-8" style={{ borderColor: "var(--pg-border-soft)", background: "var(--pg-surface)" }}>
          <h2 className="text-lg font-bold mb-2" style={{ color: "var(--pg-text)" }}>Prefer to browse first?</h2>
          <p className="text-sm mb-4" style={{ color: "var(--pg-text-secondary)" }}>Check our Help Center for quick answers to common questions about listings, bookings, and the referral program.</p>
          <a href="/help" className="inline-block text-sm font-semibold px-5 py-2.5 rounded-xl text-white" style={{ background: "var(--pg-primary)" }}>
            Visit Help Center
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
