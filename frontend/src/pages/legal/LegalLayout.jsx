import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function LegalLayout({ title, updated, children }) {
  return (
    <div className="min-h-screen bg-brand-sand text-brand-ink" data-testid="legal-page">
      <Navbar />

      {/* Header band */}
      <header className="pt-32 pb-14 md:pt-40 md:pb-20 border-b border-brand-line bg-white">
        <div className="mx-auto max-w-4xl px-6 md:px-12">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-brand-muted hover:text-brand-ruby transition-colors"
            data-testid="legal-back-home"
          >
            <ChevronLeft size={14} />
            Retour à l&apos;accueil
          </Link>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-brand-ruby font-semibold">
            Mentions légales
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.05]">
            {title}
          </h1>
          {updated && (
            <p className="mt-4 text-sm text-brand-muted">
              Dernière mise à jour&nbsp;: <span className="font-medium text-brand-ink">{updated}</span>
            </p>
          )}
        </div>
      </header>

      {/* Body */}
      <main className="py-16 md:py-24">
        <article className="mx-auto max-w-3xl px-6 md:px-12 legal-prose">
          {children}
        </article>
      </main>

      <Footer />

      <style>{`
        .legal-prose { color: #1D1914; }
        .legal-prose h2 { font-family: var(--font-display, "Playfair Display", serif); font-size: 1.75rem; line-height: 1.2; margin-top: 2.5rem; margin-bottom: 1rem; letter-spacing: -0.01em; }
        .legal-prose h3 { font-weight: 600; font-size: 1.1rem; margin-top: 1.75rem; margin-bottom: 0.5rem; color: #1D1914; }
        .legal-prose p { line-height: 1.75; margin: 0.85rem 0; color: #3D362B; }
        .legal-prose ul { list-style: disc; padding-left: 1.3rem; margin: 0.85rem 0; }
        .legal-prose ul li { line-height: 1.65; margin: 0.35rem 0; color: #3D362B; }
        .legal-prose a { color: #9A1F38; text-decoration: underline; text-underline-offset: 3px; }
        .legal-prose a:hover { color: #1D1914; }
        .legal-prose strong { color: #1D1914; font-weight: 600; }
        .legal-prose .callout { border-left: 3px solid #D19627; background: #FFFBF3; padding: 1rem 1.25rem; border-radius: 0 12px 12px 0; margin: 1.5rem 0; }
      `}</style>
    </div>
  );
}
