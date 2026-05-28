"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInquiry } from "../../api";

export default function InquiryForm({ propertyId }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    moveIn: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback("");

    if (!form.name || !form.phone || !form.moveIn || !form.message) {
      setFeedback("Please fill all fields before sending inquiry.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        propertyId,
        name: form.name.trim(),
        phone: form.phone.trim(),
        moveIn: form.moveIn,
        message: form.message.trim(),
      };

      const response = await createInquiry(payload);
      if (response?.success || response?._id || response?.message) {
        setFeedback("Inquiry sent successfully.");
        setForm({ name: "", phone: "", moveIn: "", message: "" });
      } else {
        setFeedback("Unable to send inquiry right now.");
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        router.push("/signin");
        return;
      }
      setFeedback("Failed to send inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Send Inquiry</h2>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Full name"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
        />
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="Phone number"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
        />
        <input
          type="date"
          value={form.moveIn}
          onChange={(e) => onChange("moveIn", e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
        />
        <textarea
          value={form.message}
          onChange={(e) => onChange("message", e.target.value)}
          placeholder="Write your message"
          rows={4}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
        />

        {feedback && (
          <p className="text-xs text-slate-600">{feedback}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Sending..." : "Send Inquiry"}
        </button>
      </form>
    </div>
  );
}
