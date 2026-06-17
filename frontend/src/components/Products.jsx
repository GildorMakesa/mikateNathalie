import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { api } from "@/lib/api";
import { TID } from "@/constants/testIds";

const formatCAD = (n) => new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(n);

export default function Products({ onOrder }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products").then((r) => setProducts(r.data)).catch((e) => console.error(e));
  }, []);

  const groups = useMemo(() => {
    const beignets = products.filter((p) => p.category === "Beignets");
    const boissons = products.filter((p) => p.category === "Boissons");
    const combos = products.filter((p) => p.category === "Combos");
    return { beignets, boissons, combos };
  }, [products]);

  return (
    <>
      {/* Combo Vedette */}
      {groups.combos.length > 0 && (
        <section id="combos" className="py-20 md:py-24 bg-brand-ink text-brand-sand">
          <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
            <div className="max-w-2xl mb-10">
              <p className="text-xs uppercase tracking-[0.25em] text-brand-ochre font-semibold inline-flex items-center gap-2">
                <Crown size={14} /> Combo Vedette
              </p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight text-balance">
                Nos duos signature
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.combos.map((p, i) => (
                <ComboCard key={p.id} product={p} delay={i * 0.06} onOrder={onOrder} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Catalogue Beignets + Boissons */}
      <section id="produits" className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-brand-ruby font-semibold">Notre catalogue</p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl text-brand-ink tracking-tight text-balance">
                Découvrez le <em className="text-brand-ruby not-italic">goût unique</em> du mikaté
              </h2>
            </div>
            <p className="max-w-md text-brand-muted">
              Des recettes inspirées de nos racines, préparées avec passion pour chaque occasion.
            </p>
          </div>

          <h3 className="font-display text-2xl text-brand-ink mb-6">🍩 Mikatés</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.beignets.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={i * 0.05} onOrder={onOrder} />
            ))}
          </div>

          <h3 className="font-display text-2xl text-brand-ink mt-16 mb-6">🥤 Boissons</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.boissons.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={i * 0.05} onOrder={onOrder} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ProductCard({ product: p, delay = 0, onOrder }) {
  return (
    <motion.article
      data-testid={TID.productCard}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="group relative rounded-3xl border border-brand-line bg-white p-4 hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(29,25,20,0.18)] transition-all duration-300 flex flex-col"
    >
      <div className="overflow-hidden arch-top bg-brand-ochre/10 h-60">
        <img src={p.image_url} alt={p.name} className="h-full w-full object-cover group-hover:scale-[1.04] transition-transform duration-700" loading="lazy" />
      </div>
      <div className="mt-5 px-1 flex-1 flex flex-col">
        <p className="text-[11px] uppercase tracking-[0.2em] text-brand-muted">{p.category}{p.unit_note ? ` · ${p.unit_note}` : ""}</p>
        <h3 className="mt-1 font-display text-2xl text-brand-ink">{p.name}</h3>
        <p className="mt-2 text-sm text-brand-muted leading-relaxed">{p.description}</p>

        <div className="mt-4 space-y-1.5">
          {p.options.map((opt) => (
            <div key={opt.label} className="flex items-baseline justify-between gap-2 text-sm">
              <span className="text-brand-ink">{opt.label}</span>
              <span className="font-semibold text-brand-ruby">{formatCAD(opt.price_cad)}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {p.options.map((opt) => (
            <button
              key={opt.label}
              data-testid={TID.productOrderBtn}
              onClick={() => onOrder?.({ product: p, option: opt })}
              className="text-xs rounded-full bg-brand-ink text-white px-3.5 py-2 hover:bg-brand-ruby transition-colors"
            >
              + {opt.label}
            </button>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function ComboCard({ product: p, delay = 0, onOrder }) {
  const opt = p.options[0];
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay }}
      className="relative rounded-3xl bg-gradient-to-br from-brand-ruby/10 via-transparent to-brand-ochre/10 border border-brand-ochre/20 p-6 md:p-7"
      data-testid="combo-card"
    >
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-ochre text-brand-ink text-[11px] uppercase tracking-[0.18em] px-3 py-1">
        <Crown size={11} /> Vedette
      </span>
      <div className="mt-5 grid grid-cols-5 gap-5 items-center">
        <div className="col-span-2">
          <div className="aspect-square overflow-hidden rounded-2xl bg-brand-sand/10">
            <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
        <div className="col-span-3">
          <h3 className="font-display text-2xl md:text-3xl">{p.name}</h3>
          <p className="mt-2 text-sm text-brand-sand/80">{opt.label}</p>
          <p className="mt-3 text-3xl md:text-4xl font-display text-brand-ochre">{formatCAD(opt.price_cad)}</p>
          <button
            onClick={() => onOrder?.({ product: p, option: opt })}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-ochre text-brand-ink text-sm px-5 py-2.5 hover:bg-white transition-colors font-medium"
            data-testid={`combo-order-${p.id}`}
          >
            Commander
          </button>
        </div>
      </div>
    </motion.article>
  );
}
