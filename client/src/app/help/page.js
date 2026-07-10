"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const FAQ_GROUPS = [
  {
    group: "For Students",
    items: [
      { q: "How do I search for a PG?", a: "Use the search bar on the homepage or go to Explore to filter by budget, gender preference, room type, and city. You can sort results by price or rating." },
      { q: "How do I contact an owner about a listing?", a: "Open any property's detail page and use the \"Send Inquiry\" form. The owner receives your message directly and can follow up with you." },
      { q: "Can I save listings to look at later?", a: "Yes — click the heart icon on any property card to add it to your saved list." },
      { q: "How does the referral program work?", a: "Every student gets a unique referral code. Share it with a PG owner — when they list a property and start receiving rent payments through PG Connect, you earn a commission. See our How It Works page for the full breakdown." },
    ],
  },
  {
    group: "For Owners",
    items: [
      { q: "How do I list my property?", a: "Create an owner account, then go to List Your PG and fill in your property details, rooms, amenities, and photos." },
      { q: "How long does verification take?", a: "Our team typically reviews new listings within 48 hours. You'll see the status update on your listing dashboard once it's verified." },
      { q: "What does PG Connect charge?", a: "A platform fee is deducted from each rent payment collected through PG Connect — see the Pricing & Commission section on our How It Works page for the exact breakdown." },
      { q: "How do I manage inquiries and bookings?", a: "Once verified, your Owner Dashboard shows incoming inquiries, room availability, and payment history in one place." },
    ],
  },
  {
    group: "Payments & Account",
    items: [
      { q: "How are rent payments processed?", a: "Payments are handled securely through Razorpay. PG Connect never stores your full card or bank details." },
      { q: "How do I update my profile?", a: "Sign in and open your profile page from the account menu to update your name, phone number, or preferences." },
      { q: "How do I delete my account?", a: "Contact us via the Contact page and we'll help you close your account and remove your data." },
    ],
  },
];

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-blue-50 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer"
      >
        <span className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>{q}</span>
        <motion.svg animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#1D4ED8" }}>
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm leading-relaxed" style={{ color: "#1E3A5F80" }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#EFF6FF", color: "#1E3A5F" }}>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "#1E3A5F" }}>Help Center</h1>
        <p className="mt-2 text-sm max-w-lg" style={{ color: "#1E3A5F80" }}>
          Answers to common questions. Can't find what you're looking for? <a href="/contact" className="font-semibold" style={{ color: "#1D4ED8" }}>Contact us</a>.
        </p>

        <div className="mt-10 space-y-8">
          {FAQ_GROUPS.map((group) => (
            <div key={group.group} className="bg-white rounded-2xl border p-6 sm:p-8 shadow-sm" style={{ borderColor: "#e0f2fe" }}>
              <h2 className="text-lg font-bold mb-2" style={{ color: "#1D4ED8" }}>{group.group}</h2>
              <div>
                {group.items.map((item) => (
                  <AccordionItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
