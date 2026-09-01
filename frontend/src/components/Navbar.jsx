import {
  Menu,
  X,
  Home,
  UtensilsCrossed,
  Truck,
  BookOpenText,
  MessageCircleHeart,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TID } from "@/constants/testIds";
import LogoMikate from '../assets/logo_removed_2.png';
import LogoMikateWhite from '../assets/logo_removed_3.png'; // logo blanc transparent

const links = [
  {
    id: "accueil",
    label: "Accueil",
    tid: TID.navHome,
  },
  {
    id: "menu",
    label: "Menu",
    tid: TID.navProducts,
    path: "/commander",
  },
  {
    id: "livraison",
    label: "Livraison",
    tid: "nav-delivery",
  },
  {
    id: "histoire",
    label: "Notre histoire",
    tid: "nav-story",
  },
  {
    id: "temoignages",
    label: "Témoignages",
    tid: TID.navTestimonials,
  },
  {
    id: "evenements",
    label: "Événements",
    tid: "nav-events",
  },
];

const mobileIcons = {
  accueil: Home,
  menu: UtensilsCrossed,
  produits: UtensilsCrossed,
  livraison: Truck,
  histoire: BookOpenText,
  temoignages: MessageCircleHeart,
  evenements: CalendarDays,
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolledRaw, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Force "scrolled" appearance on non-home pages (light backgrounds)
  const isHome = location.pathname === "/";
  const scrolled = isHome ? scrolledRaw : true;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const go = (id) => {
    setOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
      return;
    }
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
              {links.map((l) =>
                l.path ? (
                  <Link
                    key={l.id}
                    to={l.path}
                    data-testid={l.tid}
                    className={`text-sm font-medium transition-colors duration-500 ${scrolled
                      ? "text-brand-ink/80 hover:text-brand-ruby"
                      : "text-white/90 hover:text-white"
                      }`}
                  >
                    {l.label}
                  </Link>
                ) : (
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
                )
              )}
            </div>
          </nav>

          {/* DROITE : Bouton CTA (S'adapte dynamiquement aux styles) */}
          <div className={`transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${scrolled ? "pr-2" : "pr-0"
            }`}>
            <Link
              to="/commander"
              className={`rounded-full font-semibold transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${scrolled
                ? "bg-[#0E6FD3] border border-[#0E6FD3] px-5 py-2 text-sm text-white shadow-md hover:bg-[#826824] hover:scale-105 active:scale-95"
                : "bg-white/10 border border-white/30 px-6 py-3 text-sm text-white backdrop-blur-md hover:bg-white/15"
                }`}
              data-testid="nav-order-cta"
            >
              Commander
            </Link>
          </div>
        </div>

        {/* ========================================= */}
        {/* VERSION MOBILE — PREMIUM FULL SCREEN      */}
        {/* ========================================= */}

        {/* OVERLAY PLEIN ÉCRAN */}
        {open && (
          <div
            className="
      fixed
      inset-0
      z-40
      bg-[#15120e]
      md:hidden
    "
          >
            {/* Décor subtil */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-brand-ochre/[0.06] blur-3xl" />
              <div className="absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-brand-ruby/[0.08] blur-3xl" />
            </div>

            {/* CONTENU MENU */}
            <div
              className="
        relative
        flex
        min-h-[100dvh]
        flex-col
        px-6
        pb-[max(2rem,env(safe-area-inset-bottom))]
        pt-32
      "
            >
              {/* Petit label */}
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-brand-ochre/80">
                  Navigation
                </p>
              </div>

              {/* LIENS */}
              <div className="mx-auto mt-8 flex w-full max-w-sm flex-1 flex-col justify-center">
                <div className="flex flex-col">
                  {links.map((l) => {
                    const Icon = mobileIcons[l.id] || ArrowRight;

                    return l.path ? (
                      <Link
                        key={l.id}
                        to={l.path}
                        data-testid={l.tid}
                        onClick={() => setOpen(false)}
                        className="
                  group
                  flex
                  min-h-[58px]
                  items-center
                  justify-center
                  gap-3
                  border-b
                  border-white/[0.07]
                  px-4
                  text-center
                  text-[17px]
                  font-medium
                  text-white/90
                  transition-all
                  duration-300
                  hover:text-brand-ochre
                  active:bg-white/[0.04]
                "
                      >
                        <Icon
                          size={18}
                          strokeWidth={1.7}
                          className="text-brand-ochre/75 transition-transform duration-300 group-hover:scale-110"
                        />

                        <span>{l.label}</span>
                      </Link>
                    ) : (
                      <button
                        key={l.id}
                        type="button"
                        data-testid={l.tid}
                        onClick={() => go(l.id)}
                        className="
                  group
                  flex
                  min-h-[58px]
                  w-full
                  items-center
                  justify-center
                  gap-3
                  border-b
                  border-white/[0.07]
                  px-4
                  text-center
                  text-[17px]
                  font-medium
                  text-white/90
                  transition-all
                  duration-300
                  hover:text-brand-ochre
                  active:bg-white/[0.04]
                "
                      >
                        <Icon
                          size={18}
                          strokeWidth={1.7}
                          className="text-brand-ochre/75 transition-transform duration-300 group-hover:scale-110"
                        />

                        <span>{l.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* CTA */}
                <Link
                  to="/commander"
                  onClick={() => setOpen(false)}
                  className="
            group
            mt-9
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-full
            bg-brand-ochre
            px-6
            py-4
            text-sm
            font-bold
            text-brand-ink
            shadow-[0_18px_50px_rgba(0,0,0,0.25)]
            transition-all
            duration-300
            hover:bg-white
            active:scale-[0.98]
          "
                >
                  Commander maintenant

                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>

              {/* FOOTER DU MENU */}
              <div className="mt-8 text-center">
                <p className="text-xs text-white/35">
                  Délices Mikaté Royale
                </p>

                <p className="mt-1 text-[11px] text-white/25">
                  Le goût royal de nos traditions
                </p>
              </div>
            </div>
          </div>
        )}


        {/* ========================================= */}
        {/* CAPSULE MOBILE                            */}
        {/* ========================================= */}
        <nav
          className={`
    relative
    z-50
    mx-auto
    flex
    w-full
    items-center
    justify-between
    rounded-full
    border
    px-5
    py-3
    transition-all
    duration-500
    ease-[cubic-bezier(0.19,1,0.22,1)]
    md:hidden

    ${open
              ? `
          border-white/10
          bg-[#1b1712]/95
          shadow-[0_12px_40px_rgba(0,0,0,0.3)]
          backdrop-blur-xl
        `
              : scrolled
                ? `
            border-brand-line
            bg-white/90
            shadow-[0_8px_30px_rgba(29,25,20,0.06)]
            backdrop-blur-xl
          `
                : `
            border-white/20
            bg-white/10
            shadow-none
            backdrop-blur-md
          `
            }
  `}
        >
          {/* Logo */}
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="relative z-10 flex shrink-0 items-center no-underline"
            data-testid="brand-logo"
          >
            <div
              className={`
        h-12
        w-12
        overflow-hidden
        rounded-full
        border
        shadow-lg
        transition-all
        duration-300

        ${open
                  ? "border-brand-ochre/25 bg-black"
                  : "border-white/20"
                }
      `}
            >
              <img
                src={LogoMikate}
                alt="Delice Mikate Logo"
                className="h-full w-full object-cover scale-105"
              />
            </div>
          </Link>

          {/* Nom de marque centré */}
          <div
            className="
      pointer-events-none
      absolute
      left-1/2
      top-1/2
      w-full
      max-w-[60%]
      -translate-x-1/2
      -translate-y-1/2
      truncate
      text-center
    "
          >
            <span className="flex items-center justify-center gap-x-1.5 text-base font-semibold tracking-wide">
              <span
                className={
                  open || scrolled
                    ? "text-[#d4aa12]"
                    : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                }
              >
                Mikaté
              </span>

              <span
                className={
                  open || scrolled
                    ? "text-[#d4aa12]"
                    : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                }
              >
                Royale
              </span>
            </span>
          </div>

          {/* Toggle */}
          <button
            type="button"
            className={`
      relative
      z-10
      inline-flex
      h-10
      w-10
      items-center
      justify-center
      rounded-full
      border
      transition-all
      duration-300
      active:scale-95

      ${open
                ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                : scrolled
                  ? "border-brand-line text-brand-ink hover:bg-brand-sand"
                  : "border-white/40 text-white hover:bg-white/10"
              }
    `}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            data-testid="nav-mobile-toggle"
          >
            {open ? (
              <X size={20} strokeWidth={1.8} />
            ) : (
              <Menu size={19} strokeWidth={1.8} />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}