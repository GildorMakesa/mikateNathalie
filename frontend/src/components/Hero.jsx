import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, Truck, Sparkles } from "lucide-react";
import { TID } from "@/constants/testIds";

const HERO_PASTRY =
  "https://images.unsplash.com/photo-1664993085274-80c6ba725ccc?fm=jpg&q=85&w=1600&auto=format&fit=crop";

const HERO_BISSAP =
  "https://images.unsplash.com/photo-1601390395693-364c0e22031a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHxoaWJpc2N1cyUyMHRlYSUyMHJlZCUyMGRyaW5rfGVufDB8fHx8MTc4MTU3Mzc1OXww&ixlib=rb-4.1.0&q=85";

const HERO_TROPICAL = "/products/jus-gingembre-luxe.png";

const slides = [
  {
    image: HERO_PASTRY,
    label: "Mikatés dorés",
    title: "Des mikatés chauds, dorés et moelleux",
    description:
      "Préparés avec soin pour retrouver le goût authentique des beignets africains faits maison.",
  },
  {
    image: HERO_BISSAP,
    label: "Bissap rubis",
    title: "Boissons artisanales fraîches",
    description:
      "Bissap, gingembre et saveurs tropicales pour accompagner parfaitement vos mikatés.",
  },
  {
    image: HERO_TROPICAL,
    label: "Jus de gingembre",
    title: "Une pause sucrée, fraîche et généreuse",
    description:
      "Des portions généreuses, des recettes authentiques et une livraison dans plusieurs secteurs.",
  },
];

const heroChips = [
  { icon: Star, text: "Fait maison" },
  { icon: Sparkles, text: "Produits frais" },
  { icon: Truck, text: "Livraison disponible" },
];

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  const currentSlide = slides[activeSlide];

  return (
    <section
      id="accueil"
      className="relative min-h-screen w-full overflow-hidden bg-brand-ink"
    >
      {/* Carousel background */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSlide.image}
          src={currentSlide.image}
          alt={currentSlide.label}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      {/* Overlay pour lisibilité */}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Effets glow */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-brand-ruby/40 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-96 w-96 rounded-full bg-brand-ochre/30 blur-3xl" />
      </div>

      {/* Contenu */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 pt-28 pb-16 md:px-12 lg:px-16">
        <div className="grid w-full grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-20">
          {/* Texte gauche */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6"
          >

            <h1 className="mt-7 font-display text-center text-5xl font-semibold leading-[0.9] tracking-tight text-white sm:text-6xl lg:text-7xl" style={{ fontFamily: '"Cherry Bomb One", system-ui', fontWeight: 400 }}>
              Délices{" "}
              <span className="italic text-brand-ochre"> Mikaté</span>
              <br />
              <span className="text-white/90 text-center">Royal</span>
            </h1>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45 }}
                className="lg:col-span-5 lg:col-start-1" // Réduit la colonne à 5 et force le début à gauche
              >
                <p className="mt-12 max-w-lg text-center text-xl font-medium leading-relaxed text-white">
                  {currentSlide.title}
                </p>

                <p className="mt-3 max-w-lg text-center text-base leading-relaxed text-white/75 md:text-lg">
                  {currentSlide.description}
                </p>
              </motion.div>
            </AnimatePresence>


            {/* CTA */}
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <button
                data-testid={TID.ctaOrderHero}
                onClick={() => scrollTo("commander")}
                className="group inline-flex items-center gap-2 rounded-full bg-brand-ruby px-7 py-3.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(0,0,0,0.25)] transition-all hover:-translate-y-0.5 hover:bg-brand-ochre hover:text-brand-ink"
              >
                Commander maintenant
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <button
                data-testid={TID.ctaCatalogHero}
                onClick={() => scrollTo("produits")}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
              >
                Voir le menu
              </button>
            </div>

            <p className="mt-10 flex max-w-xl items-center justify-center gap-2 mx-auto text-sm text-white/70">
              <Truck size={16} className="text-brand-ochre" />
              Livraison à Sorel-Tracy, Montréal, Rive-Nord et Rive-Sud
            </p>
          </motion.div>

          {/* Image centrale / carte produit */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-6"
          >
            <div className="relative mx-auto flex max-w-xl items-center justify-center">
              {/* cercle décoratif */}
              <div className="absolute h-[420px] w-[420px] rounded-full border border-white/15 bg-white/10 backdrop-blur-sm md:h-[520px] md:w-[520px]" />
              <div className="absolute h-[300px] w-[300px] rounded-full bg-brand-ochre/20 blur-3xl md:h-[420px] md:w-[420px]" />

              {/* image principale */}
              <div className="relative h-[500px] w-full overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-md md:h-[560px]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`card-${currentSlide.image}`}
                    src={currentSlide.image}
                    alt={currentSlide.label}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.75 }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

                <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                  {currentSlide.label}
                </div>

                <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/15 bg-white/15 p-5 text-white backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                    Spécialité maison
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold leading-tight">
                    Mikatés frais du jour
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">
                    Dorés, moelleux et préparés avec passion.
                  </p>
                </div>
              </div>

              {/* mini thumbnails */}
              <div className="absolute -right-24 top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:flex">
                {slides.map((slide, index) => (
                  <button
                    key={slide.label}
                    onClick={() => setActiveSlide(index)}
                    className={`h-20 w-20 overflow-hidden rounded-2xl border transition-all duration-300 ${activeSlide === index
                      ? "scale-105 border-brand-ochre shadow-lg"
                      : "border-white/25 opacity-75 hover:opacity-100"
                      }`}
                    aria-label={`Voir ${slide.label}`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.label}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* indicateurs mobile / desktop */}
            <div className="mt-6 flex justify-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.label}
                  onClick={() => setActiveSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${activeSlide === index
                    ? "w-8 bg-brand-ochre"
                    : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                  aria-label={`Aller à ${slide.label}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}