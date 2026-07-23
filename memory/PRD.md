# Délices Mikaté Royal — PRD

## Problem Statement
Responsive full-stack web app to sell African puff-puff (mikatés) and drinks (bissap, ginger).
Preview: managed via Emergent. Production: https://mikateroyal.com
User's preferred language: **French (fr-FR)**. Always respond in French.

## Core Features (implemented)
- Product catalog with tiered pricing (5/10/20) and combos.
- Regular order form + Event quote (soumission) form.
- Admin dashboard (`/admin`, password `mikate2025`) — order management, Interac payment generation.
- AI Assistant "Nancy" (Claude via Emergent LLM Key).
- Email confirmation & submissions (Resend — placeholder key in preview).
- Story, Testimonials, Gallery, FAQ, Delivery zones.
- Product images generated via Gemini Nano Banana.
- Favicon (from `assets/Logo_mikate.jpg`) + PWA icons (192/512, apple-touch).
- **Loi 25 / Canada compliance** (see below).

## Compliance — Law 25 (Quebec) & Canada (implemented Feb 24, 2026)
### Legal pages under `/pages/legal/`
- `/politique-confidentialite` — Privacy policy (Loi 25 + PIPEDA rights, retention, security, third parties)
- `/conditions-generales-vente` — Terms of sale
- `/politique-remboursement` — Refund & return (perishable food specifics)
- `/politique-livraison` — Delivery policy (zones, delays, fees)
- `/politique-cookies` — Cookie policy (necessary vs analytics)
- `/conditions-utilisation` — Terms of use

Shared `LegalLayout.jsx` provides consistent styled prose with the brand aesthetic.

### Cookie consent banner (`components/CookieConsent.jsx`)
- Accepter / Refuser / Personnaliser (with a toggle for analytics)
- Persists choice in `localStorage` key `mr_cookie_consent_v1`
- Re-openable from Footer link "Préférences cookies" (dispatches `mr:open-cookie-prefs`)

### Order form
- Mandatory consent checkbox with clickable links to Privacy + Terms.

### Footer
- Grid of legal links + Cookie preferences button.
- Copyright: `© 2026 Délices Mikaté Royal. Tous droits réservés.`

## Architecture
- Frontend: React (CRA + Craco), Tailwind, Shadcn/UI, framer-motion. Routes: `/`, `/admin`, `/politique-*`, `/conditions-*`.
- Backend: FastAPI, MongoDB, Resend, emergentintegrations (Claude, Gemini).

## Git
Remote: `https://github.com/GildorMakesa/mikateNathalie.git` (branch `Prototype`).
Recent commits synced via cherry-pick: `0e48bd9`, `27d1414`, `97484d4`.

## Pending / Future
- P1: FR/EN i18n (rolled back previously due to build failure — must NOT break `yarn build`).
- P2: Get real Resend API key for production (currently placeholder `re_placeholder_replace_me`).
- P3 (optional): Gate PostHog init on analytics consent (currently loads unconditionally in `index.html`).
