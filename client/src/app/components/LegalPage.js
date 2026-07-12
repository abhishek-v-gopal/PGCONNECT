import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LegalPage({ title, updated, sections }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#EFF6FF", color: "#1E3A5F" }}>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "#1E3A5F" }}>{title}</h1>
        <p className="mt-2 text-sm" style={{ color: "#1E3A5F80" }}>Last updated: {updated}</p>

        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-bold mb-2" style={{ color: "#1E3A5F" }}>{s.heading}</h2>
              <div className="text-sm leading-relaxed space-y-2" style={{ color: "#1E3A5F99" }}>
                {s.body.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
