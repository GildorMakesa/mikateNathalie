import { motion } from "framer-motion";
import { MapPin, Truck } from "lucide-react";

const ZONES = ["Sorel-Tracy", "Montréal", "Rive-Nord", "Rive-Sud"];

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
              <Truck size={14} /> Livraison disponible
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight text-balance">
              Nous desservons votre <em className="not-italic text-brand-ochre">région</em>
            </h2>
            <p className="mt-5 text-brand-sand/80 max-w-md">
              Les frais de livraison sont confirmés lors de la soumission, selon votre adresse et la quantité commandée.
            </p>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-6 grid grid-cols-2 gap-3"
            data-testid="delivery-zones"
          >
            {ZONES.map((z) => (
              <li key={z} className="rounded-2xl border border-white/15 bg-white/5 px-5 py-4 flex items-center gap-3">
                <MapPin size={18} className="text-brand-ochre" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-sand/60">Zone</p>
                  <p className="font-display text-xl">{z}</p>
                </div>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
