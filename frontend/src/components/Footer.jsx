import { Link, useLocation, useNavigate } from "react-router-dom";
import { Facebook, Mail, MessageCircle, MapPin, Globe } from "lucide-react";
import { SOCIALS } from "@/lib/api";
import { TID } from "@/constants/testIds";

const LEGAL_LINKS = [
  { to: "/politique-confidentialite", label: "Politique de confidentialité" },
  { to: "/conditions-generales-vente", label: "Conditions générales de vente" },
  { to: "/politique-remboursement", label: "Politique de remboursement et de retour" },
  { to: "/politique-livraison", label: "Politique de livraison" },
  { to: "/politique-cookies", label: "Politique sur les cookies" },
  { to: "/conditions-utilisation", label: "Conditions d'utilisation" },
];

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollTo = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="bg-brand-ink text-brand-sand">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-ochre">Envie de douceur ?</p>
            <h3 className="mt-4 font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
              Commandez vos<br /> <em className="not-italic text-brand-ochre">Mikatés</em> aujourd&apos;hui.
            </h3>
            <button
              onClick={() => scrollTo("commander")}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-ruby text-white px-7 py-3.5 text-sm font-medium hover:bg-white hover:text-brand-ink transition-colors"
              data-testid="footer-cta-order"
            >
              Passer commande
            </button>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="text-brand-ochre font-display text-xl mb-4">Contact</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Mail size={14} className="mt-0.5 text-brand-ochre" />
                  <a href={SOCIALS.email} className="hover:text-white" data-testid="footer-email">contact@mikateroyal.com</a>
                </li>
                <li className="flex items-start gap-2">
                  <Globe size={14} className="mt-0.5 text-brand-ochre" />
                  <a href="https://mikateroyal.com" target="_blank" rel="noreferrer" className="hover:text-white" data-testid="footer-site">mikateroyal.com</a>
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle size={14} className="mt-0.5 text-brand-ochre" />
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("mr:open-nancy"))}
                    className="hover:text-white text-left"
                    data-testid="footer-nancy"
                  >
                    Discuter avec Nancy
                  </button>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 text-brand-ochre" />
                  <span>Livraison locale à Sorel-Tracy (rayon 5&nbsp;km)</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-brand-ochre font-display text-xl mb-4">Suivez-nous</p>
              <ul className="space-y-3">
                <li>
                  <a
                    href={SOCIALS.facebook}
                    target="_blank"
                    rel="noreferrer"
                    data-testid={TID.socialFacebook}
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <Facebook size={14} /> Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legal links block */}
        <div className="mt-16 pt-10 border-t border-white/10">
          <p className="text-brand-ochre font-display text-xl mb-5">Informations légales</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
            {LEGAL_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-brand-sand/80 hover:text-white transition-colors"
                  data-testid={`footer-link-${l.to.slice(1)}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("mr:open-cookie-prefs"))}
                className="text-brand-sand/80 hover:text-white transition-colors text-left"
                data-testid="footer-cookie-prefs"
              >
                Préférences cookies
              </button>
            </li>
          </ul>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-brand-sand/60">
          <p data-testid="footer-copyright">© 2026 Délices Mikaté Royal. Tous droits réservés.</p>
          <p className="font-display italic text-brand-sand/70">Des saveurs qui rassemblent, une culture qui se partage.</p>
        </div>
      </div>
    </footer>
  );
}
