"use client";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMyBookings, createPaymentOrder, verifyPayment, getPaymentHistory } from "../api";

const statusStyles = {
  paid: "bg-green-50 text-green-700 border border-green-200",
  created: "bg-[#dbeafe] text-[#1D4ED8] border border-blue-200",
  failed: "bg-red-50 text-red-600 border border-red-200",
  refunded: "bg-[#EFF6FF] text-[#1E3A5F60] border border-[#bfdbfe]",
};

export default function PaymentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pay");

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setBookingsLoading(true);
        const res = await getMyBookings();
        if (res.success) setBookings((res.bookings ?? []).filter((b) => ["confirmed", "active"].includes(b.status)));
      } catch (e) { console.error(e); }
      finally { setBookingsLoading(false); }
    };
    loadBookings();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      const load = async () => {
        try {
          setHistoryLoading(true);
          const res = await getPaymentHistory();
          if (res.success) setHistory(res.payments ?? []);
        } catch (e) { console.error(e); }
        finally { setHistoryLoading(false); }
      };
      load();
    }
  }, [activeTab]);

  const initiatePayment = async (booking) => {
    try {
      setPayingId(booking.id);
      const orderRes = await createPaymentOrder(booking.id);
      if (!orderRes.success) throw new Error(orderRes.message);

      // Load Razorpay script dynamically
      await new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve();
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const options = {
        key: orderRes.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(orderRes.amount * 100),
        currency: "INR",
        name: "PG Connect",
        description: `Monthly Rent — ${booking.properties?.name ?? ""}`,
        order_id: orderRes.order_id,
        handler: async (response) => {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_id: orderRes.payment_id,
            });
            if (verifyRes.success) {
              alert("Payment successful! Your rent has been paid.");
              router.refresh();
            }
          } catch (e) {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: { name: "", email: "", contact: "" },
        theme: { color: "#2563eb" },
        modal: { ondismiss: () => setPayingId(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      alert(e.message);
      setPayingId(null);
    }
  };

  const formatCurrency = (n) => `₹${Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const formatDate = (v) => v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <>
      <Head>
        <title>Payments — PG Connect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'DM Sans', sans-serif; }`}</style>
      </Head>

      <div className="min-h-screen bg-[#EFF6FF]">
        {/* Navbar */}
        <header className="sticky top-0 z-50 bg-white border-b border-[#bfdbfe] h-14 flex items-center px-4 sm:px-6 gap-4">
          <button onClick={() => router.push("/")} className="text-[#1D4ED8] font-bold text-base cursor-pointer">PG Connect</button>
          <div className="flex-1" />
          <button onClick={() => router.back()} className="text-sm text-[#1E3A5F60] hover:text-[#1E3A5F] cursor-pointer">← Back</button>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A5F] mb-2">Payments</h1>
          <p className="text-sm text-[#1E3A5F60] mb-8">Pay your monthly rent and view payment history.</p>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#EFF6FF] rounded-xl p-1 mb-8 w-fit">
            {[{ id: "pay", label: "Pay Rent" }, { id: "history", label: "Payment History" }].map((tab) => (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer
                  ${activeTab === tab.id ? "bg-white text-[#1E3A5F] shadow-sm" : "text-[#1E3A5F60] hover:text-[#1E3A5F]"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* PAY RENT */}
          {activeTab === "pay" && (
            <div className="space-y-4">
              {bookingsLoading ? (
                <div className="bg-white rounded-2xl border border-[#bfdbfe] p-8 text-center text-sm text-slate-400">Loading your bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#bfdbfe] p-12 text-center">
                  <p className="text-3xl mb-3">🏠</p>
                  <p className="text-sm font-semibold text-[#1E3A5F]">No active bookings</p>
                  <p className="text-xs text-slate-400 mt-1">You don't have any confirmed bookings at the moment.</p>
                  <button onClick={() => router.push("/propertys")}
                    className="mt-4 text-sm font-semibold text-[#1D4ED8] hover:text-[#1D4ED8] cursor-pointer">
                    Browse Properties →
                  </button>
                </div>
              ) : bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl border border-[#bfdbfe] p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {booking.properties?.property_images?.[0]?.image_url && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#EFF6FF] shrink-0">
                          <img src={booking.properties.property_images[0].image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-[#1E3A5F]">{booking.properties?.name ?? "Property"}</p>
                        <p className="text-sm text-[#1E3A5F60]">{booking.properties?.city} · {booking.room_type} room</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${booking.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                            {booking.payment_status?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-[#1E3A5F]">{formatCurrency(booking.monthly_rent)}</p>
                      <p className="text-xs text-slate-400">/month</p>
                      <button
                        onClick={() => initiatePayment(booking)}
                        disabled={payingId === booking.id}
                        className="mt-3 bg-[#1D4ED8] hover:bg-[#1D4ED8] active:scale-[.98] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed block w-full text-center">
                        {payingId === booking.id ? "Opening..." : "Pay Now"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PAYMENT HISTORY */}
          {activeTab === "history" && (
            <div className="bg-white rounded-2xl border border-[#bfdbfe] overflow-hidden">
              {historyLoading ? (
                <div className="p-8 text-center text-sm text-slate-400">Loading payment history...</div>
              ) : history.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-3xl mb-3">📋</p>
                  <p className="text-sm font-semibold text-[#1E3A5F]">No payments yet</p>
                  <p className="text-xs text-slate-400 mt-1">Your payment history will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {["Property", "Month", "Amount", "Platform Fee", "Status", "Date"].map((h) => (
                          <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 px-6 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {history.map((p) => (
                        <tr key={p.id} className="hover:bg-[#EFF6FF]/60 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-[#1E3A5F]">{p.properties?.name ?? "—"}</td>
                          <td className="px-6 py-4 text-sm text-[#1E3A5F80]">
                            {p.month ? new Date(p.month).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-[#1E3A5F]">{formatCurrency(p.amount)}</td>
                          <td className="px-6 py-4 text-sm text-[#1E3A5F60]">{formatCurrency(p.platform_fee)}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyles[p.status] || statusStyles.created}`}>
                              {p.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#1E3A5F60]">{formatDate(p.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
