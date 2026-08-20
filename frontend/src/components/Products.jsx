import { useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { TID } from "@/constants/testIds";

const formatCAD = (n) => new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(n);

export default function Products({ onOrder }) {
  const [products, setProducts] = useState([]);
  const desktopComboRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const scrollCombos = (direction) => {
    if (!desktopComboRef.current) return;

    const amount = desktopComboRef.current.clientWidth * 0.75;

    desktopComboRef.current.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    api.get("/products").then((r) => setProducts(r.data)).catch((e) => console.error(e));
  }, []);

  const groups = useMemo(() => {
    const beignets = products.filter((p) => p.category === "Beignets");
    const boissons = products.filter((p) => p.category === "Boissons");
    const combos = products.filter((p) => p.category === "Combos");
    return { beignets, boissons, combos };
  }, [products]);

  const catalogueProducts = useMemo(() => {
    if (activeCategory === "beignets") {
      return groups.beignets;
    }

    if (activeCategory === "boissons") {
      return groups.boissons;
    }

    return [...groups.beignets, ...groups.boissons];
  }, [activeCategory, groups]);

  return (
    <>
      {/* Combo Vedette */}
      {groups.combos.length > 0 && (
        <section
          id="combos"
          className="relative overflow-hidden bg-brand-ink text-brand-sand"
        >
          {/* ========================= */}
          {/* DESKTOP */}
          {/* ========================= */}
          <div className="hidden md:block py-24 lg:py-28">
            <div className="mx-auto max-w-7xl px-12 lg:px-16">

              {/* Heading */}
              <div className="mx-auto mb-14 max-w-2xl text-center">
                <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand-ochre">
                  <Crown size={14} />
                  Combo Vedette
                </p>

                <h2 className="mt-4 font-display text-5xl tracking-tight lg:text-6xl">
                  Nos combos signature
                </h2>

                <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-brand-sand/65 lg:text-base">
                  Nos associations les plus appréciées, pensées pour découvrir
                  l'essentiel de Mikaté Royal.
                </p>
              </div>

              {/* Carousel wrapper */}
              <div className="relative">

                {/* Flèche gauche */}
                <button
                  type="button"
                  onClick={() => scrollCombos("prev")}
                  aria-label="Voir les combos précédents"
                  className="absolute -left-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-brand-ochre/30 bg-brand-ink/90 text-brand-ochre shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-brand-ochre hover:bg-brand-ochre hover:text-brand-ink lg:-left-8"
                >
                  <ChevronLeft size={22} />
                </button>

                {/* Produits */}
                <div
                  ref={desktopComboRef}
                  className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 py-2"
                >
                  {groups.combos.map((p, i) => (
                    <div
                      key={p.id}
                      className="w-[calc(50%-12px)] min-w-[calc(50%-12px)] snap-start"
                    >
                      <DesktopComboCard
                        product={p}
                        delay={i * 0.06}
                        onOrder={onOrder}
                      />
                    </div>
                  ))}
                </div>

                {/* Flèche droite */}
                <button
                  type="button"
                  onClick={() => scrollCombos("next")}
                  aria-label="Voir les combos suivants"
                  className="absolute -right-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-brand-ochre/30 bg-brand-ink/90 text-brand-ochre shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-brand-ochre hover:bg-brand-ochre hover:text-brand-ink lg:-right-8"
                >
                  <ChevronRight size={22} />
                </button>

              </div>
            </div>
          </div>

          {/* ========================= */}
          {/* MOBILE */}
          {/* ========================= */}
          <div className="py-16 md:hidden">

            {/* Heading mobile */}
            <div className="px-5 text-center">
              <p className="inline-flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-ochre">
                <Crown size={13} />
                Combo Vedette
              </p>

              <h2 className="mt-3 font-display text-4xl leading-tight">
                Nos combos signature
              </h2>

              <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-brand-sand/65">
                Découvrez nos associations incontournables.
              </p>
            </div>

            {/* Carousel mobile natif */}
            <div
              className="
          scrollbar-hide
          mt-9 flex
          snap-x snap-mandatory
          gap-4
          overflow-x-auto
          overscroll-x-contain
          px-5
          pb-3
          [-webkit-overflow-scrolling:touch]
        "
            >
              {groups.combos.map((p, i) => (
                <MobileComboCard
                  key={p.id}
                  product={p}
                  delay={i * 0.04}
                  onOrder={onOrder}
                />
              ))}
            </div>

            {/* Indication swipe */}
            <div className="mt-5 flex items-center justify-center gap-2">
              {groups.combos.map((p) => (
                <span
                  key={`dot-${p.id}`}
                  className="h-1.5 w-1.5 rounded-full bg-brand-sand/30"
                />
              ))}
            </div>

            <p className="mt-3 text-center text-[11px] uppercase tracking-[0.16em] text-brand-sand/40">
              Glissez pour découvrir
            </p>
          </div>
        </section>
      )}

      {/* Catalogue Beignets + Boissons */}
      <section
        id="produits"
        className="overflow-hidden bg-[#faf8f5] py-20 md:py-28 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">

          {/* =========================
                     HEADER
            ========================== */}
          <div className="px-6 text-center md:px-12 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-3xl"
            >
              <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand-ruby">
                <Crown size={14} />
                Notre catalogue
              </p>

              <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-brand-ink sm:text-5xl lg:text-6xl">
                Découvrez le{" "}
                <em className="not-italic text-brand-ruby">
                  goût unique
                </em>{" "}
                du mikaté
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-brand-muted sm:text-base">
                Des recettes inspirées de nos racines, préparées avec passion
                pour chaque occasion.
              </p>
            </motion.div>

            {/* =========================
          TABS
      ========================== */}
            <div className="mt-9 flex justify-center">
              <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-brand-line bg-white p-1.5 shadow-sm">
                <CategoryTab
                  active={activeCategory === "all"}
                  onClick={() => setActiveCategory("all")}
                >
                  Tous{" "}
                  <span className="opacity-60">
                    ({groups.beignets.length + groups.boissons.length})
                  </span>
                </CategoryTab>

                <CategoryTab
                  active={activeCategory === "beignets"}
                  onClick={() => setActiveCategory("beignets")}
                >
                  Mikatés{" "}
                  <span className="opacity-60">
                    ({groups.beignets.length})
                  </span>
                </CategoryTab>

                <CategoryTab
                  active={activeCategory === "boissons"}
                  onClick={() => setActiveCategory("boissons")}
                >
                  Boissons{" "}
                  <span className="opacity-60">
                    ({groups.boissons.length})
                  </span>
                </CategoryTab>
              </div>
            </div>
          </div>


          {/* =====================================================
        DESKTOP
        Grille classique à partir de md
    ====================================================== */}
          <div className="mt-14 hidden px-6 md:block md:px-12 lg:px-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={`desktop-${activeCategory}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 gap-6 lg:grid-cols-3"
              >
                {catalogueProducts.map((product, index) => (
                  <CatalogueCard
                    key={product.id}
                    product={product}
                    delay={index * 0.05}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>


          {/* =====================================================
        MOBILE
        Carousel horizontal natif + swipe
    ====================================================== */}
          <div className="mt-10 md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`mobile-${activeCategory}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="
            flex
            snap-x
            snap-mandatory
            gap-4
            overflow-x-auto
            scroll-smooth
            px-6
            pb-4
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
              >
                {catalogueProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="w-[82%] shrink-0 snap-center first:snap-start"
                  >
                    <CatalogueCard
                      product={product}
                      delay={index * 0.04}
                      mobile
                    />
                  </div>
                ))}

                {/* espace final pour que la dernière carte respire */}
                <div className="w-2 shrink-0" aria-hidden="true" />
              </motion.div>
            </AnimatePresence>

            {/* Indication swipe */}
            {catalogueProducts.length > 1 && (
              <p className="mt-3 text-center text-[11px] uppercase tracking-[0.18em] text-brand-muted/70">
                Glissez pour découvrir
              </p>
            )}
          </div>


          {/* =========================
        CTA GLOBAL
    ========================== */}
          <div className="mt-12 flex justify-center px-6 md:mt-16">
            <button
              onClick={() =>
                document
                  .getElementById("commander")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="
          group
          inline-flex
          items-center
          justify-center
          gap-2
          rounded-full
          bg-brand-ink
          px-7
          py-3.5
          text-sm
          font-semibold
          text-white
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:bg-brand-ruby
          hover:shadow-lg
        "
            >
              Voir le menu & commander

              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>

        </div>
      </section>
    </>
  );
}

function CategoryTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative
        whitespace-nowrap
        rounded-full
        px-4
        py-2.5
        text-xs
        font-medium
        transition-all
        duration-300
        sm:px-5
        sm:text-sm
        ${active
          ? "bg-brand-ink text-white shadow-sm"
          : "text-brand-muted hover:bg-brand-sand hover:text-brand-ink"
        }
      `}
    >
      {children}
    </button>
  );
}
function CatalogueCard({ product: p, delay = 0, mobile = false }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay }}
      className="
        group
        h-full
        overflow-hidden
        rounded-[1.75rem]
        border
        border-brand-line
        bg-white
        p-3
        transition-all
        duration-500
        md:p-4
        md:hover:-translate-y-1
        md:hover:shadow-[0_24px_60px_-24px_rgba(29,25,20,0.22)]
      "
    >
      {/* IMAGE */}
      <div
        className={`
          arch-top
          overflow-hidden
          bg-brand-ochre/10
          ${mobile
            ? "h-[280px]"
            : "h-[300px] lg:h-[340px]"
          }
        `}
      >
        <img
          src={p.image_url}
          alt={p.name}
          loading="lazy"
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            md:group-hover:scale-[1.04]
          "
        />
      </div>

      {/* INFORMATIONS */}
      <div className="px-2 pb-4 pt-5 md:px-3 md:pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-ruby">
          {p.category === "Beignets" ? "Mikatés" : p.category}
          {p.unit_note ? ` · ${p.unit_note}` : ""}
        </p>

        <h3
          className={`
            mt-2
            font-display
            leading-tight
            text-brand-ink
            ${mobile ? "text-2xl" : "text-2xl lg:text-3xl"}
          `}
        >
          {p.name}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-brand-muted">
          {p.description}
        </p>
      </div>
    </motion.article>
  );
}

function DesktopComboCard({ product: p, delay = 0, onOrder }) {
  const opt = p.options[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay }}
      data-testid="combo-card"
      className="
        group
        relative
        flex
        min-h-[340px]
        overflow-hidden
        rounded-[2rem]
        border
        border-brand-ochre/20
        bg-gradient-to-br
        from-brand-ruby/10
        via-white/[0.02]
        to-brand-ochre/10
        p-7
        transition-all
        duration-500
        hover:-translate-y-1
        hover:border-brand-ochre/50
        hover:shadow-[0_25px_70px_-25px_rgba(222,172,34,0.25)]
      "
    >
      <div className="flex w-full flex-col">

        {/* Badge */}
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-ochre px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-ink">
          <Crown size={11} />
          Vedette
        </span>

        <div className="mt-6 grid flex-1 grid-cols-[180px_1fr] items-center gap-7">

          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-brand-sand/10">
            <img
              src={p.image_url}
              alt={p.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          </div>

          {/* Contenu */}
          <div className="flex h-full flex-col justify-center">
            <h3 className="font-display text-3xl leading-tight">
              {p.name}
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-brand-sand/70">
              {opt.label}
            </p>

            <div className="mt-auto pt-6">
              <p className="font-display text-4xl text-brand-ochre">
                {formatCAD(opt.price_cad)}
              </p>

              <button
                onClick={() =>
                  onOrder?.({
                    product: p,
                    option: opt,
                  })
                }
                data-testid={`combo-order-${p.id}`}
                className="
                  mt-5
                  inline-flex
                  items-center
                  justify-center
                  rounded-full
                  bg-brand-ochre
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-brand-ink
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-white
                "
              >
                Commander
              </button>
            </div>
          </div>

        </div>
      </div>
    </motion.article>
  );
}

function MobileComboCard({ product: p, delay = 0, onOrder }) {
  const opt = p.options[0];

  return (
    <motion.article
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay }}
      data-testid="combo-card-mobile"
      className="
        relative
        min-w-[84%]
        snap-center
        overflow-hidden
        rounded-[1.75rem]
        border
        border-brand-ochre/20
        bg-gradient-to-b
        from-white/[0.06]
        to-brand-ochre/[0.06]
        p-5
      "
    >
      {/* Badge */}
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-ochre px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink">
        <Crown size={10} />
        Vedette
      </span>

      {/* Image */}
      <div className="mx-auto mt-5 aspect-[4/3] w-full overflow-hidden rounded-[1.4rem] bg-brand-sand/10">
        <img
          src={p.image_url}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Texte */}
      <div className="mt-6 text-center">
        <h3 className="font-display text-3xl leading-tight">
          {p.name}
        </h3>

        <p className="mx-auto mt-3 max-w-[260px] text-sm leading-relaxed text-brand-sand/70">
          {opt.label}
        </p>

        {/* Prix */}
        <p className="mt-5 font-display text-4xl text-brand-ochre">
          {formatCAD(opt.price_cad)}
        </p>

        {/* Commander */}
        <button
          onClick={() =>
            onOrder?.({
              product: p,
              option: opt,
            })
          }
          data-testid={`combo-order-mobile-${p.id}`}
          className="
            mt-5
            w-full
            rounded-full
            bg-brand-ochre
            px-5
            py-3.5
            text-sm
            font-bold
            text-brand-ink
            transition-transform
            active:scale-[0.98]
          "
        >
          Commander
        </button>
      </div>
    </motion.article>
  );
}
