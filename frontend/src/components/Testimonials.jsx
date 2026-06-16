import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { api } from "@/lib/api";

export default function Testimonials() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/testimonials").then((r) => setItems(r.data)).catch((e) => console.error(e));
  }, []);

  return (
    <section id="temoignages" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="max-w-2xl mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-ruby font-semibold">Témoignages</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl text-brand-ink tracking-tight">
            Ce que disent <em className="not-italic text-brand-ruby">nos clients</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <motion.figure
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative rounded-3xl border border-brand-line bg-white p-7"
              data-testid={`testimonial-${t.id}`}
            >
              <Quote className="absolute -top-3 left-6 text-brand-ruby bg-brand-sand rounded-full p-1" size={28} />
              <div className="flex items-center gap-1 text-brand-ochre">
                {Array.from({ length: t.rating }).map((_, k) => (
                  <Star key={k} size={14} fill="currentColor" stroke="none" />
                ))}
              </div>
              <blockquote className="mt-4 font-display italic text-xl leading-snug text-brand-ink">
                « {t.quote} »
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <img
                  src={t.avatar_url}
                  alt={t.name}
                  className="h-11 w-11 rounded-full object-cover border border-brand-line"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-semibold text-brand-ink">{t.name}</p>
                  <p className="text-xs text-brand-muted">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
