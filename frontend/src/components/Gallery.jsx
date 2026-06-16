import { motion } from "framer-motion";
import { TID } from "@/constants/testIds";

const IMAGES = [
  "https://images.unsplash.com/photo-1665833613236-7c1d087463b1?fm=jpg&q=85&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1664993090321-b2caff794431?fm=jpg&q=85&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1667592157294-815a7f162679?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHw0fHxoaWJpc2N1cyUyMHRlYSUyMHJlZCUyMGRyaW5rfGVufDB8fHx8MTc4MTU3Mzc1OXww&ixlib=rb-4.1.0&q=85",
  "https://images.unsplash.com/photo-1596548739291-05eab13b7c25?fm=jpg&q=85&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1682263167429-0dbcf2c1e127?fm=jpg&q=85&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1714596668628-79579eadba07?fm=jpg&q=85&w=1200&auto=format&fit=crop",
];

const spans = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
];

export default function Gallery() {
  return (
    <section id="galerie" className="py-24 md:py-32 bg-white border-y border-brand-line">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-ruby font-semibold">Galerie</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl text-brand-ink tracking-tight">
              Le festin <em className="not-italic text-brand-ochre">en images</em>
            </h2>
          </div>
          <p className="max-w-md text-brand-muted">
            Plongez dans l&apos;univers visuel des Délices Mikaté Royal — couleurs, textures et hospitalité.
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[140px] md:auto-rows-[180px]">
          {IMAGES.map((src, i) => (
            <motion.div
              key={i}
              data-testid={TID.galleryItem}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className={`relative overflow-hidden rounded-2xl ${spans[i % spans.length]} group`}
            >
              <img
                src={src}
                alt={`Galerie ${i + 1}`}
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
