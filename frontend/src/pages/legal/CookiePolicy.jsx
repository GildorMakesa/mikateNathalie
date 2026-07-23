import LegalLayout from "./LegalLayout";

export default function CookiePolicy() {
  return (
    <LegalLayout title="Politique sur les cookies" updated="24 juin 2026">
      <p>
        Notre site utilise des cookies et technologies similaires pour assurer son bon fonctionnement,
        améliorer votre expérience et, avec votre consentement, mesurer son audience.
      </p>

      <h2>1. Qu&apos;est-ce qu&apos;un cookie&nbsp;?</h2>
      <p>
        Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, tablette, téléphone)
        lorsque vous visitez un site web. Il permet notamment de mémoriser vos préférences ou de mesurer
        la fréquentation du site.
      </p>

      <h2>2. Cookies utilisés</h2>
      <h3>Cookies strictement nécessaires (toujours actifs)</h3>
      <ul>
        <li><strong>Fonctionnement du site</strong>&nbsp;: sécurité, navigation, panier.</li>
        <li><strong>Préférences de consentement</strong>&nbsp;: mémorise vos choix (Accepter / Refuser).</li>
      </ul>
      <p>Ces cookies sont indispensables et ne peuvent être désactivés.</p>

      <h3>Cookies de mesure d&apos;audience (facultatifs)</h3>
      <ul>
        <li><strong>PostHog</strong>&nbsp;: nous aide à comprendre comment les visiteurs utilisent le site pour l&apos;améliorer.</li>
      </ul>
      <p>Ces cookies ne sont déposés qu&apos;<strong>après votre consentement explicite</strong>.</p>

      <h2>3. Gestion de votre consentement</h2>
      <p>
        Lors de votre première visite, une bannière vous permet de <strong>Accepter</strong>,
        <strong> Refuser</strong> ou <strong>Personnaliser</strong> vos préférences. Vous pouvez modifier
        votre choix à tout moment en cliquant sur le lien «&nbsp;<strong>Préférences cookies</strong>&nbsp;»
        présent dans le pied de page.
      </p>

      <h2>4. Durée de conservation</h2>
      <ul>
        <li>Cookies de préférence de consentement&nbsp;: 12&nbsp;mois;</li>
        <li>Cookies de mesure d&apos;audience&nbsp;: 13&nbsp;mois maximum.</li>
      </ul>

      <h2>5. Paramétrage via votre navigateur</h2>
      <p>
        Vous pouvez également gérer les cookies directement dans les paramètres de votre navigateur
        (Chrome, Safari, Firefox, Edge). Notez que la désactivation de certains cookies peut affecter le
        fonctionnement du site.
      </p>

      <h2>6. Contact</h2>
      <p>
        Pour toute question relative aux cookies, écrivez-nous à
        <a href="mailto:contact@mikateroyal.com"> contact@mikateroyal.com</a>.
      </p>
    </LegalLayout>
  );
}
