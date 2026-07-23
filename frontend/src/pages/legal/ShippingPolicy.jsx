import LegalLayout from "./LegalLayout";

export default function ShippingPolicy() {
  return (
    <LegalLayout title="Politique de livraison" updated="24 juin 2026">
      <p>
        Nous livrons vos mikatés fraîchement préparés dans la région métropolitaine et ses environs. La
        présente politique précise nos zones, délais et modalités de livraison.
      </p>

      <h2>1. Zones desservies</h2>
      <ul>
        <li><strong>Sorel-Tracy</strong> et environs;</li>
        <li><strong>Montréal</strong> (île);</li>
        <li><strong>Rive-Nord</strong> (Laval, Terrebonne, Repentigny et environs);</li>
        <li><strong>Rive-Sud</strong> (Longueuil, Brossard, Boucherville et environs).</li>
      </ul>
      <p>
        Vous êtes en dehors de ces zones&nbsp;? Écrivez-nous à
        <a href="mailto:contact@mikateroyal.com"> contact@mikateroyal.com</a> — nous étudierons votre
        demande au cas par cas.
      </p>

      <h2>2. Délais</h2>
      <ul>
        <li><strong>Commande régulière</strong>&nbsp;: généralement livrée sous 24 à 48&nbsp;heures.</li>
        <li><strong>Événement</strong>&nbsp;: nous recommandons de réserver au moins <strong>7&nbsp;jours à l&apos;avance</strong>.</li>
        <li>Les horaires exacts sont convenus par courriel après confirmation de commande.</li>
      </ul>

      <h2>3. Frais de livraison</h2>
      <p>
        Les frais varient selon la distance et la taille de la commande. Ils sont indiqués dans la
        soumission ou la confirmation de commande. Un <strong>seuil de livraison gratuite</strong>
        peut s&apos;appliquer selon la zone (consultez-nous).
      </p>

      <h2>4. Réception</h2>
      <ul>
        <li>La personne réceptionnaire doit être présente à l&apos;adresse indiquée à l&apos;heure convenue.</li>
        <li>Merci de vérifier la commande <strong>en présence du livreur</strong> — toute réclamation doit être signalée immédiatement.</li>
        <li>Une absence non signalée peut entraîner des frais supplémentaires pour une nouvelle livraison.</li>
      </ul>

      <h2>5. Retards et imprévus</h2>
      <p>
        Nous faisons tout notre possible pour respecter les horaires. En cas de retard indépendant de
        notre volonté (météo, circulation, force majeure), nous vous en informons dans les plus brefs
        délais.
      </p>

      <h2>6. Contact</h2>
      <p>
        Une question sur votre livraison&nbsp;? Écrivez-nous à
        <a href="mailto:contact@mikateroyal.com"> contact@mikateroyal.com</a> ou discutez avec notre
        assistante Nancy directement sur le site.
      </p>
    </LegalLayout>
  );
}
