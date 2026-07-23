import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X, Check, Settings2 } from "lucide-react";

const STORAGE_KEY = "mr_cookie_consent_v1";

const defaultPrefs = { necessary: true, analytics: false };

function readConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeConsent(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, ts: Date.now() }));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("mr:consent-updated", { detail: prefs }));
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState(defaultPrefs);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      setVisible(true);
    } else {
      setPrefs({ necessary: true, analytics: !!existing.analytics });
    }

    const openHandler = () => {
      const cur = readConsent();
      setPrefs({ necessary: true, analytics: !!cur?.analytics });
      setShowPrefs(true);
      setVisible(true);
    };
    window.addEventListener("mr:open-cookie-prefs", openHandler);
    return () => window.removeEventListener("mr:open-cookie-prefs", openHandler);
  }, []);

  const acceptAll = () => {
    writeConsent({ necessary: true, analytics: true });
    setVisible(false);
    setShowPrefs(false);
  };
  const refuseAll = () => {
    writeConsent({ necessary: true, analytics: false });
    setVisible(false);
    setShowPrefs(false);
  };
  const saveCustom = () => {
    writeConsent({ necessary: true, analytics: !!prefs.analytics });
    setVisible(false);
    setShowPrefs(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none"
      data-testid="cookie-consent"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-brand-line bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 md:p-6">
          <div className="mt-0.5 shrink-0 h-9 w-9 rounded-full bg-brand-ochre/15 text-brand-ochre flex items-center justify-center">
            <Cookie size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-ruby font-semibold">
              Vos préférences cookies
            </p>
            <h3 className="mt-1 font-display text-xl md:text-2xl text-brand-ink leading-tight">
              Un instant, gourmand·e — on respecte votre vie privée.
            </h3>
            <p className="mt-2 text-sm text-brand-muted leading-relaxed">
              Nous utilisons des cookies strictement nécessaires au fonctionnement du site. Avec votre
              accord, nous mesurons aussi son audience pour l&apos;améliorer. Consultez notre{" "}
              <Link to="/politique-cookies" className="underline text-brand-ruby hover:text-brand-ink">
                Politique sur les cookies
              </Link>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={refuseAll}
            className="shrink-0 h-8 w-8 rounded-full border border-brand-line text-brand-muted hover:text-brand-ink hover:border-brand-ink flex items-center justify-center"
            aria-label="Fermer"
            data-testid="cookie-close-btn"
          >
            <X size={14} />
          </button>
        </div>

        {/* Details */}
        {showPrefs && (
          <div className="px-5 md:px-6 pb-2 space-y-3">
            <div className="rounded-xl border border-brand-line bg-brand-sand/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-brand-ink">Cookies strictement nécessaires</p>
                  <p className="text-xs text-brand-muted mt-1">
                    Indispensables au fonctionnement du site (sécurité, navigation, mémorisation de vos choix).
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.18em] text-brand-ochre font-semibold shrink-0">
                  Toujours actif
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-brand-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-brand-ink">Mesure d&apos;audience (PostHog)</p>
                  <p className="text-xs text-brand-muted mt-1">
                    Nous aide à comprendre l&apos;utilisation du site pour l&apos;améliorer. Aucune donnée n&apos;est vendue.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0" data-testid="cookie-toggle-analytics">
                  <input
                    type="checkbox"
                    checked={prefs.analytics}
                    onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-brand-line rounded-full peer-checked:bg-brand-ruby transition-colors" />
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-brand-line bg-brand-sand/40 px-5 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          {!showPrefs ? (
            <>
              <button
                type="button"
                onClick={() => setShowPrefs(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-brand-line bg-white text-brand-ink px-5 py-2.5 text-sm hover:border-brand-ink transition-colors sm:order-1"
                data-testid="cookie-customize-btn"
              >
                <Settings2 size={14} />
                Personnaliser
              </button>
              <button
                type="button"
                onClick={refuseAll}
                className="inline-flex items-center justify-center rounded-full border border-brand-line bg-white text-brand-ink px-5 py-2.5 text-sm hover:border-brand-ink transition-colors sm:order-2"
                data-testid="cookie-refuse-btn"
              >
                Refuser
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-ruby text-white px-5 py-2.5 text-sm font-medium hover:bg-brand-ink transition-colors sm:order-3 sm:ml-auto"
                data-testid="cookie-accept-btn"
              >
                <Check size={14} />
                Accepter
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={refuseAll}
                className="inline-flex items-center justify-center rounded-full border border-brand-line bg-white text-brand-ink px-5 py-2.5 text-sm hover:border-brand-ink transition-colors"
                data-testid="cookie-refuse-btn"
              >
                Tout refuser
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="inline-flex items-center justify-center rounded-full border border-brand-line bg-white text-brand-ink px-5 py-2.5 text-sm hover:border-brand-ink transition-colors"
                data-testid="cookie-accept-all-btn"
              >
                Tout accepter
              </button>
              <button
                type="button"
                onClick={saveCustom}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-ruby text-white px-5 py-2.5 text-sm font-medium hover:bg-brand-ink transition-colors sm:ml-auto"
                data-testid="cookie-save-btn"
              >
                <Check size={14} />
                Enregistrer mes préférences
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
