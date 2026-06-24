import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { TID } from "@/constants/testIds";
import LogoMikate from '../assets/Logo_mikate.jpg';

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
          className={`mx-auto flex w-full items-center rounded-full border transition-all duration-500 ${scrolled
              ? "max-w-4xl px-6 py-2 border-brand-line bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(29,25,20,0.06)] md:justify-center md:gap-10"
              : "max-w-7xl px-5 py-4 border-white/20 bg-white/10 backdrop-blur-md shadow-none justify-between"
            } ${scrolled && "justify-between md:justify-center" /* Force le justify-between sur mobile même au scroll */}`}
        >
          {/* GAUCHE : Logo / titre */}
          <Link
            to="/"
            className="no-underline flex flex-col items-center relative group shrink-0 z-10"
          >
            <div className="relative">
              {/* 
        CORRECTION TAILLE MOBILE : 
        On garde h-14 w-14 fixe sur mobile (qu'on scroll ou pas), 
        et on laisse la variation de taille uniquement sur desktop (md:...)
      */}
              <div
                className={`overflow-hidden rounded-full border border-white/10 shadow-lg transition-all duration-500 transform group-hover:scale-105 ${scrolled ? 'h-14 w-14 md:h-14 md:w-14' : 'h-14 w-14 md:h-20 md:w-20'
                  }`}
              >
                <img
                  src={LogoMikate}
                  alt="Delice Mikate Logo"
                  className="h-full w-full object-cover scale-105"
                />
              </div>
            </div>
          </Link>

          {/* MOBILE UNIQUEMENT : Titre au centre */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none md:hidden text-center">
            <span
              className={`font-semibold tracking-wide text-lg transition-colors duration-300`}
              style={{ fontFamily: '"", system-ui' }} 
            >
              <span className={`${scrolled ? 'text-brand-ink' : 'text-white'}`}>Mikaté </span>
              <span className={`${scrolled ? 'text-black' : 'text-white bg-clip-text text-transparent'}`}>
                Royale
              </span>
            </span>
          </div>

          {/* CENTRE : Navigation desktop */}
          <div className="hidden md:flex items-center justify-center gap-7 shrink-0">
            {links.map((l) => (
              <button
                key={l.id}
                data-testid={l.tid}
                onClick={() => go(l.id)}
                className={`text-sm font-medium transition-colors duration-300 ${scrolled
                    ? "text-brand-ink/80 hover:text-brand-ruby"
                    : "text-white/90 hover:text-white"
                  }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* DROITE : CTA desktop */}
          <div className="hidden md:flex shrink-0">
            <button
              onClick={() => go("commander")}
              className={`rounded-full border text-sm px-5 py-2 transition-all duration-500 ${scrolled
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-md"
                  : "bg-white/10 text-white border-white/30 backdrop-blur-md hover:bg-white/15"
                }`}
              data-testid="nav-order-cta"
            >
              Commander
            </button>
          </div>

          {/* MOBILE : bouton menu */}
          {/* z-10 pour s'assurer qu'il passe au-dessus du titre absolu si la barre est très petite */}
          <button
            className={`md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-300 z-10 ${scrolled
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
            className={`md:hidden mt-2 rounded-2xl border p-4 shadow-md backdrop-blur-xl ${scrolled
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