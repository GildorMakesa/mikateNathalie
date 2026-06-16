import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, formatCAD } from "@/lib/api";
import { TID } from "@/constants/testIds";

export default function Products({ onOrder }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products").then((r) => setProducts(r.data)).catch((e) => console.error(e));
  }, []);

  return (
    <section id="produits" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-ruby font-semibold">Notre catalogue</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl text-brand-ink tracking-tight text-balance">
              Une carte qui célèbre <em className="text-brand-ruby not-italic">l&apos;Afrique de l&apos;Ouest</em>
            </h2>
          </div>
          <p className="max-w-md text-brand-muted">
            Chaque recette est préparée à la main, avec des ingrédients frais et locaux. Choisissez vos favoris et nous nous occupons du reste.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <motion.article
              key={p.id}
              data-testid={TID.productCard}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative rounded-3xl border border-brand-line bg-white p-4 hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(29,25,20,0.18)] transition-all duration-300"
            >
              <div className="overflow-hidden arch-top bg-brand-ochre/10 h-64">
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="h-full w-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="mt-5 px-1">
                <p className="text-[11px] uppercase tracking-[0.2em] text-brand-muted">{p.category}</p>
                <div className="mt-1 flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-2xl text-brand-ink">{p.name}</h3>
                  <span className="font-semibold text-brand-ruby">{formatCAD(p.price_cad)}</span>
                </div>
                <p className="mt-2 text-sm text-brand-muted leading-relaxed">{p.description}</p>
                <button
                  data-testid={TID.productOrderBtn}
                  onClick={() => onOrder?.(p)}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-ink text-white text-sm px-5 py-2.5 hover:bg-brand-ruby transition-colors"
                >
                  Commander
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
