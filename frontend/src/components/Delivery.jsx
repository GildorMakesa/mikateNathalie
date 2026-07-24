import { motion } from "framer-motion";
import { MapPin, Truck, Ruler, ShoppingBag, PartyPopper, Building2, Route } from "lucide-react";

const LOCAL_ITEMS = [
  { icon: MapPin, label: "Zone principale", value: "Sorel-Tracy", hint: "et secteurs proches" },
  { icon: Ruler, label: "Rayon habituel", value: "5 km", hint: "selon les disponibilités" },
  { icon: ShoppingBag, label: "Commande minimum", value: "30,00 $", hint: "pour bénéficier de la livraison" },
];

const EVENT_ITEMS = [
  { icon: Route, label: "Rive-Sud, Rive-Nord, Montréal", hint: "et autres régions sur demande" },
  { icon: PartyPopper, label: "Événements & grandes commandes", hint: "mariages, baptêmes, occasions spéciales" },
  { icon: Building2, label: "Entreprises & groupes", hint: "soumission personnalisée" },
];

export default function Delivery() {
  return (
    <section id="livraison" className="py-20 md:py-28 bg-brand-ruby text-brand-sand">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-ochre font-semibold inline-flex items-center gap-2">
            <Truck size={14} /> Livraison
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight text-balance">
            Deux options pour <em className="not-italic text-brand-ochre">chaque occasion</em>
          </h2>
          <p className="mt-5 text-brand-sand/85 leading-relaxed">
            Une livraison de proximité pour vos plaisirs du quotidien et une prestation étendue pour vos
            plus grands moments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Livraison locale régulière */}
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-white/15 bg-white/5 p-7 md:p-9"
            data-testid="delivery-local"
          >
            <p className="text-[10px] uppercase tracking-[0.22em] text-brand-ochre font-semibold">
              Livraison locale régulière
            </p>
            <h3 className="mt-3 font-display text-2xl md:text-3xl leading-tight">
              Sorel-Tracy et secteurs proches
            </h3>
            <p className="mt-4 text-sm text-brand-sand/80 leading-relaxed">
              Rayon habituel de <strong className="text-brand-ochre">5&nbsp;km</strong>, pour toute
              commande d&apos;un montant minimum de{" "}
              <strong className="text-brand-ochre">30,00&nbsp;$</strong>. Les modalités et les frais de
              livraison sont confirmés avec le client avant la préparation de la commande.
            </p>
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {LOCAL_ITEMS.map((h) => {
                const Icon = h.icon;
                return (
                  <li key={h.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 flex flex-col gap-1.5">
                    <Icon size={16} className="text-brand-ochre" />
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-sand/60">{h.label}</p>
                    <p className="font-display text-xl leading-none">{h.value}</p>
                    <p className="text-[11px] text-brand-sand/70 leading-relaxed">{h.hint}</p>
                  </li>
                );
              })}
            </ul>
          </motion.article>

          {/* Grandes commandes & événements */}
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl border border-brand-ochre/40 bg-brand-ochre/[0.08] p-7 md:p-9"
            data-testid="delivery-event"
          >
            <p className="text-[10px] uppercase tracking-[0.22em] text-brand-ochre font-semibold">
              Grandes commandes & événements
            </p>
            <h3 className="mt-3 font-display text-2xl md:text-3xl leading-tight">
              Livraison étendue sur demande
            </h3>
            <p className="mt-4 text-sm text-brand-sand/85 leading-relaxed">
              Pour les commandes importantes, événements, entreprises, groupes ou occasions spéciales,
              nous livrons également en <strong className="text-brand-ochre">Rive-Sud</strong>,{" "}
              <strong className="text-brand-ochre">Rive-Nord</strong>,{" "}
              <strong className="text-brand-ochre">Montréal</strong> et autres régions.
            </p>
            <ul className="mt-6 space-y-2.5">
              {EVENT_ITEMS.map((h) => {
                const Icon = h.icon;
                return (
                  <li key={h.label} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <Icon size={16} className="mt-0.5 shrink-0 text-brand-ochre" />
                    <div>
                      <p className="text-sm font-medium text-brand-sand">{h.label}</p>
                      <p className="text-[11px] text-brand-sand/70">{h.hint}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 text-xs text-brand-sand/70 leading-relaxed">
              Les frais sont calculés selon la <strong>distance</strong>, le <strong>volume</strong> de
              la commande et les <strong>besoins spécifiques</strong>. Une soumission personnalisée vous
              est transmise avant confirmation.
            </p>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
