import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { TID } from "@/constants/testIds";

const links = [
  { id: "accueil", label: "Accueil", tid: TID.navHome },
  { id: "produits", label: "Catalogue", tid: TID.navProducts },
  { id: "galerie", label: "Galerie", tid: TID.navGallery },
  { id: "temoignages", label: "Témoignages", tid: TID.navTestimonials },
  { id: "commander", label: "Commander", tid: TID.navOrder },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const go = (id) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16 pt-4">
        <nav className="flex items-center justify-between rounded-full border border-brand-line bg-white/70 backdrop-blur-xl px-5 py-3 shadow-[0_8px_30px_rgba(29,25,20,0.04)]">
          <Link to="/" className="flex items-center gap-2" data-testid="brand-logo">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-ruby" />
            <span className="font-display text-xl font-semibold tracking-tight text-brand-ink">
              Délices <span className="text-brand-ruby">Mikaté</span> Royal
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <button
                key={l.id}
                data-testid={l.tid}
                onClick={() => go(l.id)}
                className="text-sm text-brand-ink/80 hover:text-brand-ruby transition-colors"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => go("commander")}
              className="rounded-full bg-brand-ink text-white text-sm px-5 py-2 hover:bg-brand-ruby transition-colors"
              data-testid="nav-order-cta"
            >
              Commander
            </button>
          </div>
          <button
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-line"
            onClick={() => setOpen((v) => !v)}
            aria-label="menu"
            data-testid="nav-mobile-toggle"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        {open && (
          <div className="md:hidden mt-2 rounded-2xl border border-brand-line bg-white p-4 shadow-md">
            <div className="flex flex-col">
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  data-testid={`m-${l.tid}`}
                  className="text-left py-2 text-brand-ink hover:text-brand-ruby"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
