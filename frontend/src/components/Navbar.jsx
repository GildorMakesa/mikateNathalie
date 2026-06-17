import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { TID } from "@/constants/testIds";

const links = [
  { id: "accueil", label: "Accueil", tid: TID.navHome },
  { id: "produits", label: "Menu", tid: TID.navProducts },
  { id: "livraison", label: "Livraison", tid: "nav-delivery" },
  { id: "histoire", label: "Notre histoire", tid: "nav-story" },
  { id: "temoignages", label: "Témoignages", tid: TID.navTestimonials },
  { id: "evenements", label: "Événements", tid: "nav-events" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="fixed top-0 left-0 z-40 w-full">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16 pt-4">
        <nav
          className={`grid grid-cols-[1fr_auto_1fr] items-center rounded-full border px-5 py-3 transition-all duration-300 ${
            scrolled
              ? "border-brand-line bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(29,25,20,0.06)]"
              : "border-white/20 bg-white/10 backdrop-blur-md shadow-none"
          }`}
        >
          {/* GAUCHE : Logo / titre */}
          <Link
            to="/"
            className="flex items-center gap-2 justify-self-start"
            data-testid="brand-logo"
          >
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
                scrolled ? "bg-brand-ruby" : "bg-white"
              }`}
            />

            <span
              className={`font-display text-xl font-semibold tracking-tight transition-colors duration-300 ${
                scrolled ? "text-brand-ink" : "text-white"
              }`}
            >
              Délices{" "}
              <span className={scrolled ? "text-brand-ruby" : "text-white"}>
                Mikaté
              </span>{" "}
              Royal
            </span>
          </Link>

          {/* CENTRE : Navigation desktop */}
          <div className="hidden md:flex items-center justify-center gap-7">
            {links.map((l) => (
              <button
                key={l.id}
                data-testid={l.tid}
                onClick={() => go(l.id)}
                className={`text-sm transition-colors duration-300 ${
                  scrolled
                    ? "text-brand-ink/80 hover:text-brand-ruby"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* DROITE : CTA desktop */}
          <div className="hidden md:flex justify-self-end">
            <button
              onClick={() => go("commander")}
              className={`rounded-full border text-sm px-5 py-2 transition-all duration-300 ${
                scrolled
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                  : "bg-white/10 text-white border-white/30 backdrop-blur-md hover:bg-white/15"
              }`}
              data-testid="nav-order-cta"
            >
              Commander
            </button>
          </div>

          {/* MOBILE : bouton menu */}
          <button
            className={`md:hidden col-start-3 justify-self-end inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-300 ${
              scrolled
                ? "border-brand-line text-brand-ink"
                : "border-white/40 text-white"
            }`}
            onClick={() => setOpen((v) => !v)}
            aria-label="menu"
            data-testid="nav-mobile-toggle"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        {/* MENU MOBILE */}
        {open && (
          <div
            className={`md:hidden mt-2 rounded-2xl border p-4 shadow-md backdrop-blur-xl ${
              scrolled
                ? "border-brand-line bg-white"
                : "border-white/20 bg-white/90"
            }`}
          >
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

              <button
                onClick={() => go("commander")}
                className="mt-3 rounded-full bg-blue-600 text-white text-sm px-5 py-2 hover:bg-blue-700 transition-colors"
              >
                Commander
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}