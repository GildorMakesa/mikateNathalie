import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

function Avatar({ name, src }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-11 w-11 rounded-full object-cover border border-brand-line"
        loading="lazy"
      />
    );
  }
  return (
    <div
      className="h-11 w-11 rounded-full border border-brand-line bg-brand-ruby/10 text-brand-ruby flex items-center justify-center font-display font-semibold"
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

const empty = { name: "", role: "", quote: "", rating: 5 };

export default function Testimonials() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const load = () => {
    api.get("/testimonials").then((r) => setItems(r.data)).catch((e) => console.error(e));
  };
  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.quote.trim().length < 5) {
      toast.error("Indiquez votre nom et un message d'au moins 5 caractères.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/testimonials", {
        name: form.name.trim(),
        role: form.role.trim() || null,
        quote: form.quote.trim(),
        rating: Number(form.rating) || 5,
      });
      toast.success("Merci pour votre témoignage !");
      setForm(empty);
      setOpen(false);
      load();
    } catch (err) {
      console.error(err);
      toast.error("Impossible d'envoyer le témoignage. Réessayez plus tard.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="temoignages" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-ruby font-semibold">Témoignages</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl text-brand-ink tracking-tight">
              Ce que disent <em className="not-italic text-brand-ruby">nos clients</em>
            </h2>
          </div>
          <button
            data-testid="open-testimonial-form"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-brand-ink text-white text-sm px-5 py-3 hover:bg-brand-ruby transition-colors self-start"
          >
            {open ? "Fermer le formulaire" : "Laisser un témoignage"}
          </button>
        </div>

        {open && (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={onSubmit}
            data-testid="testimonial-form"
            className="mb-12 rounded-3xl border border-brand-line bg-white p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <label className="block">
              <span className="text-sm font-medium text-brand-ink">Votre nom *</span>
              <input
                required
                data-testid="testimonial-name"
                name="name"
                value={form.name}
                onChange={onChange}
                className="t-input mt-1.5"
                placeholder="Aminata D."
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-brand-ink">Votre rôle (optionnel)</span>
              <input
                data-testid="testimonial-role"
                name="role"
                value={form.role}
                onChange={onChange}
                className="t-input mt-1.5"
                placeholder="Cliente fidèle, organisateur..."
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-brand-ink">Votre témoignage *</span>
              <textarea
                required
                data-testid="testimonial-quote"
                name="quote"
                value={form.quote}
                onChange={onChange}
                rows={3}
                className="t-input mt-1.5 resize-none"
                placeholder="Partagez votre expérience..."
              />
            </label>
            <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <label className="block">
                <span className="text-sm font-medium text-brand-ink block mb-2">Note</span>
                <div className="flex items-center gap-1" data-testid="testimonial-rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, rating: n })}
                      className="p-1"
                      aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                      data-testid={`rating-${n}`}
                    >
                      <Star
                        size={22}
                        className={n <= form.rating ? "text-brand-ochre" : "text-brand-line"}
                        fill={n <= form.rating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
              </label>
              <button
                type="submit"
                disabled={submitting}
                data-testid="testimonial-submit"
                className="inline-flex items-center gap-2 rounded-full bg-brand-ruby text-white px-7 py-3 text-sm font-medium hover:bg-brand-ink transition-colors disabled:opacity-60"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Envoi…" : "Envoyer mon témoignage"}
              </button>
            </div>
          </motion.form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <motion.figure
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 6) * 0.06 }}
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
                <Avatar name={t.name} src={t.avatar_url} />
                <div>
                  <p className="text-sm font-semibold text-brand-ink">{t.name}</p>
                  <p className="text-xs text-brand-muted">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>

      <style>{`
        .t-input {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid #E8E2D9;
          border-radius: 14px;
          padding: 0.75rem 1rem;
          font-size: 0.925rem;
          color: #1D1914;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .t-input:focus { border-color: #9A1F38; box-shadow: 0 0 0 4px rgba(154,31,56,0.10); }
        .t-input::placeholder { color: #A89E8E; }
      `}</style>
    </section>
  );
}
