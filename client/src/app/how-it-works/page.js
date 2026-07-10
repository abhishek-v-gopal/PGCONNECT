"use client";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";

const STUDENT_STEPS = [
  { n: 1, title: "Search with intent", desc: "Filter by budget, gender preference, room type, and city to find PGs that actually match what you need." },
  { n: 2, title: "Inquire or save", desc: "Message an owner directly from a listing, or save it to your wishlist to compare later." },
  { n: 3, title: "Move in with confidence", desc: "Every listing is verified by our team before it goes live, so you know what to expect before you visit." },
];

const OWNER_STEPS = [
  { n: 1, title: "List your property", desc: "Add your property details, rooms, amenities, and photos — takes about ten minutes." },
  { n: 2, title: "Get verified", desc: "Our team reviews new listings within 48 hours. Once approved, your property goes live to thousands of students." },
  { n: 3, title: "Manage bookings & payouts", desc: "Track inquiries, manage room availability, and collect rent through the platform from your Owner Dashboard." },
];

export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#EFF6FF", color: "#1E3A5F" }}>
      <Navbar />

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <Reveal>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ color: "#1E3A5F" }}>How PG Connect Works</h1>
            <p className="mt-4 text-base sm:text-lg max-w-xl mx-auto" style={{ color: "#1E3A5F80" }}>
              A transparent marketplace for verified PG accommodation in Kerala — for students, owners, and everyone in between.
            </p>
          </Reveal>
        </section>

        {/* For Students */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
          <Reveal>
            <h2 className="text-2xl font-bold mb-8" style={{ color: "#1E3A5F" }}>For Students</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {STUDENT_STEPS.map((s) => (
              <Reveal key={s.n} delay={s.n * 0.08} className="bg-white rounded-2xl border p-6 shadow-sm" >
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold mb-4" style={{ background: "#1D4ED8" }}>{s.n}</div>
                <p className="font-bold mb-1" style={{ color: "#1E3A5F" }}>{s.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#1E3A5F80" }}>{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* For Owners */}
        <section id="owners" className="scroll-mt-20 max-w-5xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
          <Reveal>
            <h2 className="text-2xl font-bold mb-8" style={{ color: "#1E3A5F" }}>For Owners</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {OWNER_STEPS.map((s) => (
              <Reveal key={s.n} delay={s.n * 0.08} className="bg-white rounded-2xl border p-6 shadow-sm">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold mb-4" style={{ background: "#F97316" }}>{s.n}</div>
                <p className="font-bold mb-1" style={{ color: "#1E3A5F" }}>{s.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#1E3A5F80" }}>{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Verification */}
        <section id="verification" className="scroll-mt-20 py-14 sm:py-20" style={{ background: "white" }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <Reveal>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1E3A5F" }}>Verification Process</h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "#1E3A5F99" }}>
                <p>Every property submitted to PG Connect goes through admin review before it appears in search results. This keeps the marketplace trustworthy for students who are often choosing a place to live sight-unseen.</p>
                <p>Here's what happens after you submit a listing:</p>
              </div>
              <ol className="mt-5 space-y-3">
                {[
                  "Submission received — your listing enters our review queue immediately.",
                  "Team review — we check that details, pricing, and photos are complete and consistent (typically within 48 hours).",
                  "Verified & published — approved listings get a Verified badge and go live to students searching your area.",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "#1E3A5F" }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5" style={{ background: "#1D4ED8" }}>{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* Pricing & Commission */}
        <section id="pricing" className="scroll-mt-20 py-14 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <Reveal>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1E3A5F" }}>Pricing & Commission</h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "#1E3A5F99" }}>
                PG Connect charges a 5% platform fee on each rent payment collected through the platform. There's no separate listing fee — you only pay when you actually get paid.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "#e0f2fe" }}>
                  <p className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>95%</p>
                  <p className="text-xs mt-1" style={{ color: "#1E3A5F80" }}>Paid to you as the owner</p>
                </div>
                <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "#e0f2fe" }}>
                  <p className="text-2xl font-bold" style={{ color: "#F97316" }}>2%</p>
                  <p className="text-xs mt-1" style={{ color: "#1E3A5F80" }}>To the referring student, if the listing was referred</p>
                </div>
                <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "#e0f2fe" }}>
                  <p className="text-2xl font-bold" style={{ color: "#1D4ED8" }}>3%</p>
                  <p className="text-xs mt-1" style={{ color: "#1E3A5F80" }}>Platform fee to PG Connect</p>
                </div>
              </div>
              <p className="text-xs mt-4" style={{ color: "#1E3A5F60" }}>Listings that weren't referred by a student keep the full 2% as part of the platform fee instead.</p>
            </Reveal>
          </div>
        </section>

        {/* Referral Program */}
        <section id="referral" className="scroll-mt-20 py-14 sm:py-20" style={{ background: "white" }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <Reveal>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1E3A5F" }}>Referral Program</h2>
              <div className="space-y-3 text-sm leading-relaxed" style={{ color: "#1E3A5F99" }}>
                <p>Every student account comes with a unique 8-character referral code. Share it with a PG owner you know — when they list their property using your code and start receiving rent payments through PG Connect, you earn commission automatically.</p>
                <p>You can choose between two commission types when you sign up:</p>
              </div>
              <ul className="mt-4 space-y-2 text-sm" style={{ color: "#1E3A5F" }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#1D4ED8" }}>●</span>
                  <span><strong>Recurring</strong> — earn 2% every month for as long as the tenant keeps paying rent through the platform.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#1D4ED8" }}>●</span>
                  <span><strong>One-time</strong> — earn a larger share on the first booking only, then it's done.</span>
                </li>
              </ul>
              <p className="text-sm mt-4" style={{ color: "#1E3A5F99" }}>Commission is credited to your account balance. Once you cross the ₹100 minimum, you can request a payout.</p>
              <button
                onClick={() => router.push("/register?role=student")}
                className="mt-6 inline-block text-sm font-bold px-6 py-3 rounded-xl text-white cursor-pointer"
                style={{ background: "#F97316" }}
              >
                Start Earning
              </button>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
