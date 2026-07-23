import LegalLayout from "./LegalLayout";

export default function TermsOfSale() {
  return (
    <LegalLayout title="Conditions générales de vente" updated="24 juin 2026">
      <p>
        Les présentes conditions générales de vente («&nbsp;CGV&nbsp;») régissent toute commande passée
        auprès de <strong>Délices Mikaté Royal</strong> via le site
        <a href="https://mikateroyal.com" target="_blank" rel="noreferrer"> mikateroyal.com</a>.
        Toute commande implique l&apos;acceptation sans réserve des présentes CGV.
      </p>

      <h2>1. Produits</h2>
      <p>
        Nous proposons des mikatés (beignets africains) et des boissons artisanales (bissap, gingembre)
        préparés de manière artisanale. Les photos et descriptions sont fournies à titre indicatif&nbsp;;
        de légères variations peuvent survenir (couleur, taille) sans altérer la qualité ou la quantité.
      </p>

      <h2>2. Prix</h2>
      <p>
        Les prix sont indiqués en dollars canadiens (CAD), taxes en sus lorsque applicables. Ils peuvent
        être modifiés à tout moment, mais la commande vous est facturée au prix affiché au moment de la
        validation.
      </p>

      <h2>3. Commandes</h2>
      <ul>
        <li>Les commandes se passent en ligne via le formulaire prévu à cet effet.</li>
        <li>Une confirmation vous est envoyée par courriel après réception.</li>
        <li>Pour les événements (mariage, baptême, corporatif...), une soumission personnalisée est établie avant confirmation.</li>
        <li>Nous nous réservons le droit de refuser toute commande manifestement abusive ou frauduleuse.</li>
      </ul>

      <h2>4. Paiement</h2>
      <p>Les modes de paiement acceptés sont&nbsp;:</p>
      <ul>
        <li><strong>Virement Interac</strong> (recommandé) — instructions transmises par courriel;</li>
        <li><strong>PayPal</strong>;</li>
        <li><strong>Comptant à la livraison</strong>;</li>
        <li>Autres modes sur entente.</li>
      </ul>
      <div className="callout">
        <p>
          <strong>Aucune donnée bancaire n&apos;est collectée ni stockée par Délices Mikaté Royal.</strong>
          Les paiements sont traités par des services sécurisés externes.
        </p>
      </div>

      <h2>5. Livraison</h2>
      <p>
        Les modalités et zones de livraison sont détaillées dans notre
        <a href="/politique-livraison"> Politique de livraison</a>.
      </p>

      <h2>6. Droit de rétractation et remboursement</h2>
      <p>
        En raison du caractère périssable de nos produits alimentaires, le droit de rétractation ne
        s&apos;applique pas. Toutefois, en cas de problème, notre
        <a href="/politique-remboursement"> Politique de remboursement et de retour</a> précise les cas
        pris en charge.
      </p>

      <h2>7. Allergènes et sécurité alimentaire</h2>
      <p>
        Nos produits peuvent contenir ou avoir été en contact avec du blé (gluten), du lait, des œufs et
        des fruits à coque. Merci de nous signaler toute allergie ou intolérance dans le champ
        «&nbsp;Message&nbsp;» du formulaire de commande.
      </p>

      <h2>8. Responsabilité</h2>
      <p>
        Notre responsabilité est limitée au prix des produits commandés. Nous ne pourrons être tenus
        responsables des dommages indirects (perte de temps, préjudice moral, etc.).
      </p>

      <h2>9. Droit applicable et litiges</h2>
      <p>
        Les présentes CGV sont régies par les lois de la province de Québec et les lois fédérales du
        Canada applicables. Tout litige sera soumis aux tribunaux compétents du district judiciaire de
        Richelieu (Sorel-Tracy).
      </p>

      <h2>10. Contact</h2>
      <p>
        Toute question relative aux présentes CGV peut être adressée à
        <a href="mailto:contact@mikateroyal.com"> contact@mikateroyal.com</a>.
      </p>
    </LegalLayout>
  );
}
