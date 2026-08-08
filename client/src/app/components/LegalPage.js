import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LegalPage({ title, updated, sections }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-bg)", color: "var(--pg-text)" }}>
      <Navbar />
      <main id="main-content" className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--pg-text)" }}>{title}</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--pg-text-secondary)" }}>Last updated: {updated}</p>

        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-bold mb-2" style={{ color: "var(--pg-text)" }}>{s.heading}</h2>
              <div className="text-sm leading-relaxed space-y-2" style={{ color: "var(--pg-text-secondary)" }}>
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
