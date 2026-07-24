import { motion } from "framer-motion";

const MIKATE_IMG = "/products/mikate-sucre-impalpable.png";
const BISSAP_IMG =
  "https://images.unsplash.com/photo-1601390395693-364c0e22031a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHxoaWJpc2N1cyUyMHRlYSUyMHJlZCUyMGRyaW5rfGVufDB8fHx8MTc4MTU3Mzc1OXww&ixlib=rb-4.1.0&q=85";
const GINGER_IMG = "/products/jus-gingembre-luxe.jpg";

export default function Story() {
  return (
    <section id="histoire" className="py-24 md:py-32" data-testid="story-section">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="max-w-2xl mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-ruby font-semibold">Notre histoire</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl text-brand-ink tracking-tight text-balance">
            Plus qu&apos;une gourmandise, <em className="not-italic text-brand-ochre">un héritage</em>
          </h2>
        </div>

        {/* Article 1 - Mikate */}
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
          data-testid="story-mikate"
        >
          <div className="lg:col-span-5 order-1 lg:order-1">
            <div className="relative overflow-hidden rounded-[2rem] arch-top bg-brand-ochre/10 h-[420px] md:h-[520px]">
              <img
                src={MIKATE_IMG}
                alt="Mikaté traditionnel saupoudré de sucre"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
          <div className="lg:col-span-7 order-2 lg:order-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-brand-ruby font-semibold">Le Mikate</p>
            <h3 className="mt-3 font-display text-3xl sm:text-4xl text-brand-ink leading-tight">
              Une tradition qui <em className="not-italic text-brand-ruby">rassemble</em>
            </h3>
            <div className="mt-6 space-y-5 text-brand-muted leading-relaxed text-base md:text-[17px]">
              <p>
                Connu sous différents noms selon les pays et les cultures —{" "}
                <span className="text-brand-ink">mikate, puff-puff, botokoin</span> ou{" "}
                <span className="text-brand-ink">mandazi</span> — ce délicieux beignet africain est
                apprécié dans de nombreuses régions d&apos;Afrique centrale et de l&apos;Ouest,
                notamment en République démocratique du Congo, au Cameroun, au Bénin et au Nigéria.
              </p>
              <p className="border-l-2 border-brand-ochre/50 pl-4">
                Chez <span className="text-brand-ink font-medium">Délices Mikaté Royal</span>, nous
                préparons chaque commande avec soin afin d&apos;offrir des produits frais, savoureux
                et fidèles aux traditions africaines. Nos mikatés sont reconnus pour leurs portions
                généreuses, leur texture moelleuse et leur goût authentique.
              </p>
              <p>
                Bien plus qu&apos;une simple gourmandise, le mikate est un symbole de partage, de
                convivialité et de traditions familiales. Présent lors des célébrations, des
                réunions entre proches ou des moments du quotidien, il rassemble les générations
                autour d&apos;une saveur authentique et réconfortante.
              </p>
              <p>
                Doré à l&apos;extérieur, moelleux à l&apos;intérieur et apprécié de tous, le mikate
                se savoure à toute heure de la journée. Chaque bouchée évoque la chaleur du foyer,
                la richesse des traditions et le bonheur d&apos;être réunis.
              </p>
              <p className="font-display italic text-xl text-brand-ink">
                Le mikate, c&apos;est le goût de la maison, la saveur du partage et la joie
                d&apos;être ensemble.
                <span className="block text-brand-ochre mt-2 not-italic text-base font-sans tracking-wide">
                  Bon appétit ! ✨
                </span>
              </p>
            </div>
          </div>
        </motion.article>

        {/* Divider */}
        <div className="my-20 md:my-24 flex items-center gap-4">
          <span className="h-px flex-1 bg-brand-line" />
          <span className="font-display italic text-brand-ruby/60 text-2xl">~</span>
          <span className="h-px flex-1 bg-brand-line" />
        </div>

        {/* Article 2 - Bissap */}
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
          data-testid="story-bissap"
        >
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-[2rem] arch-top bg-brand-ruby/10 h-[420px] md:h-[520px]">
              <img
                src={BISSAP_IMG}
                alt="Verre de bissap rubis"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
          <div className="lg:col-span-7 order-2 lg:order-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-brand-ruby font-semibold">Le Bissap</p>
            <h3 className="mt-3 font-display text-3xl sm:text-4xl text-brand-ink leading-tight">
              Une boisson naturelle aux <em className="not-italic text-brand-ruby">multiples bienfaits</em>
            </h3>

            <div className="mt-6 space-y-5 text-brand-muted leading-relaxed text-base md:text-[17px]">
              <p>
                Le bissap est une boisson traditionnelle africaine préparée à partir des fleurs
                séchées d&apos;hibiscus. Reconnaissable à sa belle couleur rouge rubis et à son goût
                légèrement acidulé, il est apprécié depuis des générations dans plusieurs pays
                d&apos;Afrique. Rafraîchissant, naturel et savoureux, le bissap est bien plus
                qu&apos;une simple boisson : il est également reconnu pour ses nombreuses propriétés
                bénéfiques.
              </p>

              <h4 className="font-display text-xl text-brand-ink pt-2">
                Pourquoi le bissap est-il si apprécié ?
              </h4>
              <ul className="space-y-3">
                {BENEFITS.map((b, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-brand-ochre mt-0.5 shrink-0" aria-hidden>✔</span>
                    <span>
                      <span className="text-brand-ink font-medium">{b.title}</span> : {b.text}
                    </span>
                  </li>
                ))}
              </ul>

              <h4 className="font-display text-xl text-brand-ink pt-2">Une boisson qui rassemble</h4>
              <p>
                Servi lors des fêtes, des repas en famille ou des moments de détente entre amis, le
                bissap est un symbole de partage et d&apos;hospitalité dans de nombreuses cultures
                africaines. Son goût unique et sa fraîcheur naturelle en font une boisson appréciée
                par toutes les générations.
              </p>

              <p className="font-display italic text-xl text-brand-ink">
                Le bissap, c&apos;est la fraîcheur de la nature, le plaisir du partage et le goût
                authentique de l&apos;Afrique.
                <span className="block text-brand-ruby mt-2 not-italic text-base font-sans tracking-wide">
                  🌺 ✨ 🥤
                </span>
              </p>

              <p className="text-xs text-brand-muted/80 border-l-2 border-brand-ruby/40 pl-4 italic mt-6">
                À consommer dans le cadre d&apos;une alimentation équilibrée. Les personnes
                enceintes ou ayant des conditions médicales particulières devraient demander
                l&apos;avis d&apos;un professionnel de santé avant une consommation régulière.
              </p>
            </div>
          </div>
        </motion.article>

        {/* Divider */}
        <div className="my-20 md:my-24 flex items-center gap-4">
          <span className="h-px flex-1 bg-brand-line" />
          <span className="font-display italic text-brand-ochre/60 text-2xl">~</span>
          <span className="h-px flex-1 bg-brand-line" />
        </div>

        {/* Article 3 - Gingembre */}
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
          data-testid="story-gingembre"
        >
          <div className="lg:col-span-5 order-1 lg:order-1">
            <div className="relative overflow-hidden rounded-[2rem] arch-top bg-brand-ochre/10 h-[420px] md:h-[520px]">
              <img
                src={GINGER_IMG}
                alt="Verre luxueux de jus de gingembre"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
          <div className="lg:col-span-7 order-2 lg:order-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-brand-ochre font-semibold">Le Gingembre</p>
            <h3 className="mt-3 font-display text-3xl sm:text-4xl text-brand-ink leading-tight">
              Une racine aux <em className="not-italic text-brand-ochre">mille vertus</em>
            </h3>

            <div className="mt-6 space-y-5 text-brand-muted leading-relaxed text-base md:text-[17px]">
              <p>
                Le gingembre est une plante reconnue depuis des siècles pour ses qualités gustatives
                et ses nombreux bienfaits. Utilisé dans les cuisines et les traditions de nombreuses
                cultures à travers le monde, il est particulièrement apprécié en Afrique pour la
                préparation de boissons rafraîchissantes et revigorantes. Avec sa saveur unique, à
                la fois épicée et parfumée, le gingembre apporte une touche de caractère à chaque
                dégustation.
              </p>

              <h4 className="font-display text-xl text-brand-ink pt-2">
                Pourquoi le gingembre est-il si apprécié ?
              </h4>
              <ul className="space-y-3">
                {GINGER_BENEFITS.map((b, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-brand-ochre mt-0.5 shrink-0" aria-hidden>✔</span>
                    <span>
                      <span className="text-brand-ink font-medium">{b.title}</span> : {b.text}
                    </span>
                  </li>
                ))}
              </ul>

              <h4 className="font-display text-xl text-brand-ink pt-2">Une boisson qui rassemble</h4>
              <p>
                Présent lors des célébrations, des rencontres familiales et des moments de partage,
                le gingembre est bien plus qu&apos;une simple boisson. Il symbolise la convivialité,
                la générosité et le plaisir d&apos;être réunis autour de saveurs authentiques.
              </p>

              <p className="font-display italic text-xl text-brand-ink">
                Le gingembre, c&apos;est l&apos;énergie de la nature, la richesse des traditions et
                le bonheur du partage.
                <span className="block text-brand-ochre mt-2 not-italic text-base font-sans tracking-wide">
                  ✨ 🫚 🥤
                </span>
              </p>

              <p className="text-brand-ink/80 italic">
                À déguster seul, entre amis ou en famille pour un moment de fraîcheur et de
                vitalité ! ❤️
              </p>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}

const BENEFITS = [
  {
    title: "Riche en vitamines et antioxydants",
    text:
      "il contient notamment de la vitamine C, qui contribue au bon fonctionnement du système immunitaire.",
  },
  {
    title: "Contribue au bien-être cardiovasculaire",
    text:
      "plusieurs études suggèrent que l'hibiscus peut aider à maintenir une pression artérielle normale lorsqu'il est consommé dans le cadre d'une alimentation équilibrée.",
  },
  {
    title: "Favorise une bonne digestion",
    text:
      "il est traditionnellement consommé pour soutenir le confort digestif et le transit intestinal.",
  },
  {
    title: "Propriétés anti-inflammatoires naturelles",
    text:
      "l'hibiscus est reconnu pour ses composés antioxydants qui participent à la protection de l'organisme.",
  },
  {
    title: "Source de fraîcheur et d'énergie",
    text:
      "sa saveur désaltérante en fait une boisson idéale pour accompagner les journées actives.",
  },
  {
    title: "Beauté de la peau et des cheveux",
    text:
      "grâce à sa richesse en antioxydants, l'hibiscus est souvent utilisé dans les soins naturels pour la peau et les cheveux.",
  },
];

const GINGER_BENEFITS = [
  {
    title: "Source naturelle d'antioxydants",
    text:
      "le gingembre contient des composés qui contribuent à protéger l'organisme contre le stress oxydatif.",
  },
  {
    title: "Favorise la digestion",
    text:
      "il est traditionnellement utilisé pour soutenir le confort digestif et réduire les sensations d'inconfort après les repas.",
  },
  {
    title: "Aide à combattre la fatigue",
    text:
      "sa saveur tonique et stimulante en fait une boisson appréciée pour retrouver de l'énergie au quotidien.",
  },
  {
    title: "Contribue au bien-être général",
    text:
      "le gingembre est reconnu pour ses propriétés naturelles qui participent au maintien d'une bonne santé.",
  },
  {
    title: "Soutient le système immunitaire",
    text:
      "grâce à ses composés naturels, il est souvent consommé durant les périodes de changement de saison.",
  },
  {
    title: "Procure une sensation de chaleur et de réconfort",
    text:
      "servi chaud ou froid, il apporte une agréable sensation de bien-être.",
  },
];
