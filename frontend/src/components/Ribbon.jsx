import Marquee from "react-fast-marquee";

const items = [
  "Saveurs Authentiques",
  "Pâtisserie de Luxe",
  "Bissap Royal",
  "Street-food Vibrant",
  "Fait Maison Chaque Jour",
  "Livraison Express",
];

export default function Ribbon() {
  return (
    <div className="border-y border-brand-line bg-white py-5">
      <Marquee gradient={false} speed={36} pauseOnHover>
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-12 px-12">
            <span className="font-display italic text-2xl md:text-3xl text-brand-ink/90">{t}</span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-ruby" />
          </div>
        ))}
      </Marquee>
    </div>
  );
}
