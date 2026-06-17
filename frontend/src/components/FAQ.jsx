import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Comment payer ma commande ?",
    a: "Les paiements sont acceptés par virement Interac. Les instructions de paiement (adresse, question de sécurité, réponse) sont envoyées avec votre soumission par courriel — dès réception du paiement, votre commande est confirmée et préparée.",
  },
  {
    q: "Quels sont les délais de livraison ?",
    a: "La plupart des commandes régulières sont livrées le jour même ou le lendemain. Pour les événements (50+ personnes), prévoyez 3 à 7 jours selon la quantité.",
  },
  {
    q: "Puis-je commander pour un événement ?",
    a: "Bien sûr ! Utilisez la section « Événements et réceptions » pour une soumission personnalisée (mariages, baptêmes, anniversaires, événements corporatifs, etc.).",
  },
  {
    q: "Y a-t-il des frais de livraison ?",
    a: "Oui, les frais varient selon votre adresse (Sorel-Tracy, Montréal, Rive-Nord, Rive-Sud). Ils sont précisés lors de la confirmation de votre commande.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6 md:px-12 lg:px-16">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-ruby font-semibold">FAQ Paiement &amp; livraison</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl text-brand-ink tracking-tight">
            Questions <em className="not-italic text-brand-ochre">fréquentes</em>
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-2xl border border-brand-line bg-white overflow-hidden" data-testid={`faq-${i}`}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left gap-4"
                  data-testid={`faq-q-${i}`}
                >
                  <span className="font-display text-lg text-brand-ink">{f.q}</span>
                  <ChevronDown size={18} className={`text-brand-ruby shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-brand-muted leading-relaxed">{f.a}</p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
