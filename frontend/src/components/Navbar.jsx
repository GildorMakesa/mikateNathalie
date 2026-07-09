import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { TID } from "@/constants/testIds";
import LogoMikate from '../assets/logo_removed_2.png';
import LogoMikateWhite from '../assets/logo_removed_3.png'; // logo blanc transparent

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
      {/* 
        Le conteneur extérieur réduit doucement son padding du haut 
        lors du scroll pour coller proprement le menu.
      */}
      <div className={`mx-auto max-w-7xl px-5 md:px-10 lg:px-14 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${scrolled ? "pt-2" : "pt-5"
        }`}>

        {/* ========================================= */}
        {/* STRUCTURE UNIQUE DESKTOP (UNIFIÉE ET FLUIDE) */}
        {/* ========================================= */}
        <div
          className={`hidden md:grid grid-cols-[auto_1fr_auto] items-center mx-auto transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] rounded-full border ${scrolled
            ? "max-w-4xl px-4 py-2 border-brand-line bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(29,25,20,0.06)]"
            : "max-w-7xl px-2 py-0 border-transparent bg-transparent backdrop-blur-0 shadow-none"
            }`}
        >
          {/* GAUCHE : Logo (Rétrécit au scroll et glisse doucement dans la capsule) */}
          <Link
            to="/"
            className={`no-underline flex items-center relative group shrink-0 z-10 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${scrolled ? "pl-2" : "pl-0"
              }`}
            data-testid="brand-logo"
          >
            <div
              className={`overflow-hidden rounded-full border shadow-xl transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105 ${scrolled
                  ? "h-12 w-12 border-white/30 bg-black"
                  : "h-20 w-20 border-white/20 bg-transparent"
                }`}
            >
              <img
                src={scrolled ? LogoMikate : LogoMikateWhite}
                alt="Delice Mikate Logo"
                className="h-full w-full object-contain"
              />
            </div>
          </Link>

          {/* CENTRE : Le menu de navigation */}
          {/* 
            Au top de la page, il garde son effet de "bulle" isolée. 
            Au scroll, la bulle s'efface (sans border ni fond) car le parent prend le relais.
          */}
          <nav className={`justify-self-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${scrolled
            ? "border-transparent bg-transparent px-0 py-0 shadow-none"
            : "border border-white/20 bg-white/10 backdrop-blur-xl px-8 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            }`}>
            <div className="flex items-center justify-center gap-7">
              {links.map((l) => (
                <button
                  key={l.id}
                  data-testid={l.tid}
                  onClick={() => go(l.id)}
                  className={`text-sm font-medium transition-colors duration-500 ${scrolled
                    ? "text-brand-ink/80 hover:text-brand-ruby"
                    : "text-white/90 hover:text-white"
                    }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </nav>

          {/* DROITE : Bouton CTA (S'adapte dynamiquement aux styles) */}
          <div className={`transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${scrolled ? "pr-2" : "pr-0"
            }`}>
            <button
              onClick={() => go("commander")}
              className={`rounded-full font-semibold transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${scrolled
                ? "bg-[#0E6FD3] border border-[#0E6FD3] px-5 py-2 text-sm text-white shadow-md hover:bg-[#826824] hover:scale-105 active:scale-95"
                : "bg-white/10 border border-white/30 px-6 py-3 text-sm text-white backdrop-blur-md hover:bg-white/15"
                }`}
              data-testid="nav-order-cta"
            >
              Commander
            </button>
          </div>
        </div>

        {/* ========================================= */}
        {/* VERSION MOBILE (OPTIMISÉE)                */}
        {/* ========================================= */}
        <nav
          className={`md:hidden mx-auto flex w-full items-center justify-between rounded-full border px-5 py-3 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${scrolled
            ? "border-brand-line bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(29,25,20,0.06)]"
            : "border-white/20 bg-white/10 backdrop-blur-md shadow-none"
            }`}
        >
          {/* Logo mobile */}
          <Link to="/" className="no-underline flex items-center relative group shrink-0 z-10" data-testid="brand-logo">
            <div className="h-12 w-12 overflow-hidden rounded-full border border-white/20 shadow-lg">
              <img src={LogoMikate} alt="Delice Mikate Logo" className="h-full w-full object-cover scale-105" />
            </div>
          </Link>

          {/* Titre mobile : Parfaitement centré au pixel près (horizontal + vertical) */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-[60%] truncate">
            <span className="text-base font-medium tracking-wide flex justify-center items-center gap-x-1.5">
              {/* "Mikaté" en Jaune (Ocre/Doré pour rester premium et lisible) */}
              <span className={scrolled ? "text-[#d4aa12]" : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"}>
                Mikaté
              </span>

              {/* "Royale" en Rouge */}
              <span className={scrolled ? "text-[#d4aa12]" : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"}>
                Royale
              </span>
            </span>
          </div>

          {/* Bouton menu mobile */}
          <button
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-300 z-10 ${scrolled ? "border-brand-line text-brand-ink" : "border-white/40 text-white"
              }`}
            onClick={() => setOpen((v) => !v)}
            aria-label="menu"
            data-testid="nav-mobile-toggle"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        {/* MENU MOBILE DÉROULANT */}
        {open && (
          <div className={`md:hidden mt-2 rounded-2xl border p-4 shadow-md backdrop-blur-xl transition-all duration-300 ${scrolled ? "border-brand-line bg-white" : "border-white/20 bg-white/90"
            }`}>
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  data-testid={`m-${l.tid}`}
                  className="text-left py-2.5 text-sm font-medium text-brand-ink/90 hover:text-brand-ruby transition-colors border-b border-brand-line/10 last:border-none"
                >
                  {l.label}
                </button>
              ))}

              {/* Bouton Commander : Mis à jour avec ton magnifique Doré #9B7D2B */}
              <button
                onClick={() => go("commander")}
                className="mt-4 rounded-full bg-[#0E6FD3] text-white text-sm font-semibold px-5 py-3 text-center shadow-sm hover:bg-[#0B5BB8] active:scale-98 transition-all"
              >
                Commander maintenant
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}