import { useState } from "react";
import { ShoppingBag, PartyPopper } from "lucide-react";
import OrderForm from "@/components/OrderForm";

export default function OrderPage() {
  const [mode, setMode] = useState("regular");

  return (
    <main className="min-h-screen bg-[#faf8f5] pt-28">
      {/* HEADER */}
      <section className="px-6 pb-10 md:px-12">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-ruby">
            Mikaté Royal
          </p>

          <h1 className="mt-4 font-display text-4xl text-brand-ink sm:text-5xl lg:text-6xl">
            Passez votre commande
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-brand-muted md:text-base">
            Commande régulière ou événement spécial, choisissez le parcours
            qui correspond à votre besoin.
          </p>

          {/* TABS */}
          <div className="mx-auto mt-9 grid max-w-xl grid-cols-2 rounded-2xl border border-brand-line bg-white p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setMode("regular")}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                mode === "regular"
                  ? "bg-brand-ink text-white shadow-sm"
                  : "text-brand-muted hover:bg-brand-sand hover:text-brand-ink"
              }`}
            >
              <ShoppingBag size={17} />
              Commande régulière
            </button>

            <button
              type="button"
              onClick={() => setMode("event")}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                mode === "event"
                  ? "bg-brand-ochre text-brand-ink shadow-sm"
                  : "text-brand-muted hover:bg-brand-sand hover:text-brand-ink"
              }`}
            >
              <PartyPopper size={17} />
              Événement & groupe
            </button>
          </div>
        </div>
      </section>

      <OrderForm
        mode={mode}
        onSwitchMode={() =>
          setMode((current) =>
            current === "regular" ? "event" : "regular"
          )
        }
      />
    </main>
  );
}