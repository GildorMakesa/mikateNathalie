import LegalLayout from "./LegalLayout";

export default function RefundPolicy() {
  return (
    <LegalLayout title="Politique de remboursement et de retour" updated="24 juin 2026">
      <p>
        Chez <strong>Délices Mikaté Royal</strong>, la satisfaction de notre clientèle est essentielle.
        En raison du caractère <strong>périssable et artisanal</strong> de nos produits alimentaires, les
        remboursements et retours obéissent à des règles particulières décrites ci-dessous.
      </p>

      <h2>1. Produits non remboursables</h2>
      <p>Sauf exception ci-dessous, les produits suivants ne peuvent être ni retournés ni remboursés&nbsp;:</p>
      <ul>
        <li>Les mikatés et boissons livrés et acceptés à la réception;</li>
        <li>Les commandes personnalisées ou événementielles annulées à moins de 48&nbsp;heures de la date de livraison.</li>
      </ul>

      <h2>2. Cas admissibles à un remboursement ou à un remplacement</h2>
      <p>Nous nous engageons à remplacer ou rembourser (partiellement ou intégralement) un produit dans les cas suivants&nbsp;:</p>
      <ul>
        <li><strong>Erreur de commande de notre part</strong> (mauvais produit, mauvaise quantité);</li>
        <li><strong>Produit visiblement défectueux</strong> à la livraison (produit brûlé, cru, contaminé, etc.);</li>
        <li><strong>Non-livraison</strong> due à une erreur ou un manquement de notre part;</li>
        <li><strong>Retard important</strong> non communiqué (plus de 90 minutes après l&apos;heure prévue).</li>
      </ul>

      <h2>3. Comment faire une réclamation</h2>
      <p>Pour être recevable, votre demande doit être transmise&nbsp;:</p>
      <ul>
        <li>Dans un délai maximal de <strong>24&nbsp;heures</strong> suivant la livraison;</li>
        <li>Par courriel à <a href="mailto:contact@mikateroyal.com">contact@mikateroyal.com</a>;</li>
        <li>Accompagnée d&apos;une <strong>photo du produit</strong> concerné et de votre numéro de commande.</li>
      </ul>

      <h2>4. Traitement de la réclamation</h2>
      <p>
        Nous répondons à toute réclamation dans un délai de <strong>3 jours ouvrables</strong>. Selon le
        cas et après vérification, nous vous proposerons&nbsp;:
      </p>
      <ul>
        <li>Un <strong>remplacement</strong> à la prochaine commande;</li>
        <li>Un <strong>crédit</strong> équivalent au montant concerné;</li>
        <li>Ou un <strong>remboursement</strong> par le même moyen de paiement que la commande initiale.</li>
      </ul>

      <h2>5. Annulations</h2>
      <ul>
        <li><strong>Commande régulière</strong>&nbsp;: annulable sans frais jusqu&apos;à 12&nbsp;heures avant l&apos;heure de livraison prévue.</li>
        <li><strong>Événement</strong>&nbsp;: annulable sans frais jusqu&apos;à 72&nbsp;heures avant. En deçà, un forfait de préparation pourra être facturé.</li>
      </ul>

      <h2>6. Contact</h2>
      <p>
        Pour toute demande de remboursement ou de retour, contactez-nous à
        <a href="mailto:contact@mikateroyal.com"> contact@mikateroyal.com</a>. Vous pouvez également nous
        joindre via l&apos;assistante virtuelle Nancy sur le site.
      </p>
    </LegalLayout>
  );
}
