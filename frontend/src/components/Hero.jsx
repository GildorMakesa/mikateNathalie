import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { TID } from "@/constants/testIds";

const HERO_PASTRY =
  "https://images.unsplash.com/photo-1664993085274-80c6ba725ccc?fm=jpg&q=85&w=1400&auto=format&fit=crop";
const HERO_BISSAP =
  "https://images.unsplash.com/photo-1601390395693-364c0e22031a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHxoaWJpc2N1cyUyMHRlYSUyMHJlZCUyMGRyaW5rfGVufDB8fHx8MTc4MTU3Mzc1OXww&ixlib=rb-4.1.0&q=85";
const HERO_TROPICAL =
  "https://images.unsplash.com/photo-1583577612013-4fecf7bf8f13?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwyfHx0cm9waWNhbCUyMGZydWl0JTIwanVpY2V8ZW58MHx8fHwxNzgxNTczNzU5fDA&ixlib=rb-4.1.0&q=85";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function Hero() {
  return (
    <section id="accueil" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 grain" aria-hidden />
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-ruby">
              <Sparkles size={12} /> Maison artisanale
            </span>
            <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[0.95] tracking-tight text-brand-ink text-balance">
              Délices <span className="italic text-brand-ruby">Mikaté</span>
              <br /> <span className="text-brand-ochre">Royal</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-brand-muted leading-relaxed">
              Des saveurs qui rassemblent, une culture qui se partage.
              Pâtisseries dorées, bissap rubis et boissons tropicales —
              préparés chaque jour avec amour.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                data-testid={TID.ctaOrderHero}
                onClick={() => scrollTo("commander")}
                className="group inline-flex items-center gap-2 rounded-full bg-brand-ruby px-7 py-3.5 text-white text-sm font-medium hover:bg-brand-ink transition-colors"
              >
                Passer commande
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                data-testid={TID.ctaCatalogHero}
                onClick={() => scrollTo("produits")}
                className="inline-flex items-center gap-2 rounded-full border border-brand-ink/15 bg-white px-7 py-3.5 text-brand-ink text-sm font-medium hover:border-brand-ink transition-colors"
              >
                Voir le catalogue
              </button>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-brand-muted">
              <div>
                <p className="font-display text-3xl text-brand-ink">12+</p>
                <p>Recettes</p>
              </div>
              <div className="h-8 w-px bg-brand-line" />
              <div>
                <p className="font-display text-3xl text-brand-ink">100%</p>
                <p>Artisanal</p>
              </div>
              <div className="h-8 w-px bg-brand-line" />
              <div>
                <p className="font-display text-3xl text-brand-ink">★ 4.9</p>
                <p>Clients fidèles</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Bento Hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-6"
          >
            <div className="grid grid-cols-6 grid-rows-6 gap-3 h-[520px] md:h-[600px]">
              <div className="col-span-4 row-span-4 relative overflow-hidden rounded-3xl bg-brand-ochre/10">
                <img src={HERO_PASTRY} alt="Mikatés dorés" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute bottom-3 left-3 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs text-brand-ink">
                  Mikatés dorés
                </div>
              </div>
              <div className="col-span-2 row-span-3 relative overflow-hidden rounded-3xl bg-brand-ruby/10">
                <img src={HERO_BISSAP} alt="Bissap rubis" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute bottom-3 left-3 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs text-brand-ruby">
                  Bissap rubis
                </div>
              </div>
              <div className="col-span-2 row-span-3 relative overflow-hidden rounded-3xl bg-brand-terra/10">
                <img src={HERO_TROPICAL} alt="Boisson tropicale" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute bottom-3 left-3 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs text-brand-terra">
                  Tropical
                </div>
              </div>
              <div className="col-span-4 row-span-2 rounded-3xl border border-brand-line bg-white p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Livraison du jour</p>
                  <p className="font-display text-2xl text-brand-ink mt-1">Montréal & rive-sud</p>
                </div>
                <span className="inline-block h-12 w-12 rounded-full bg-brand-ruby/10 flex items-center justify-center text-brand-ruby font-display text-lg">
                  J+0
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
