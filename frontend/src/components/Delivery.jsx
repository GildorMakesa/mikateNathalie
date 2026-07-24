import { motion } from "framer-motion";
import { MapPin, Truck, Ruler, ShoppingBag } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: MapPin,
    label: "Zone desservie",
    value: "Sorel-Tracy",
    hint: "Livraison locale uniquement",
  },
  {
    icon: Ruler,
    label: "Rayon",
    value: "5 km",
    hint: "Selon les disponibilités",
  },
  {
    icon: ShoppingBag,
    label: "Commande minimum",
    value: "30,00 $",
    hint: "Pour bénéficier de la livraison",
  },
];

export default function Delivery() {
  return (
    <section id="livraison" className="py-20 md:py-28 bg-brand-ruby text-brand-sand">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-6"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-brand-ochre font-semibold inline-flex items-center gap-2">
              <Truck size={14} /> Livraison locale
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight text-balance">
              Livraison locale à <em className="not-italic text-brand-ochre">Sorel-Tracy</em>
            </h2>
            <p className="mt-5 text-brand-sand/85 max-w-md leading-relaxed">
              Délices Mikaté Royal offre un service de livraison locale à Sorel-Tracy dans un rayon de
              5&nbsp;km selon les disponibilités.
            </p>
            <p className="mt-3 text-brand-sand/85 max-w-md leading-relaxed">
              La livraison est disponible pour les commandes d&apos;un montant minimum de{" "}
              <strong className="text-brand-ochre">30,00&nbsp;$</strong>. Les modalités et les frais de
              livraison sont confirmés avec le client avant la préparation de la commande.
            </p>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-3"
            data-testid="delivery-zones"
          >
            {HIGHLIGHTS.map((h) => {
              const Icon = h.icon;
              return (
                <li
                  key={h.label}
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-5 flex flex-col gap-2"
                >
                  <Icon size={18} className="text-brand-ochre" />
                  <p className="text-[10px] uppercase tracking-[0.22em] text-brand-sand/60">{h.label}</p>
                  <p className="font-display text-2xl leading-none">{h.value}</p>
                  <p className="text-xs text-brand-sand/70 leading-relaxed">{h.hint}</p>
                </li>
              );
            })}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
