import { MessageCircle } from "lucide-react";
import { SOCIALS } from "@/lib/api";
import { TID } from "@/constants/testIds";

export default function WhatsAppFloat() {
  return (
    <a
      data-testid={TID.whatsappFloat}
      href={SOCIALS.whatsapp}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Discuter sur WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-pulse-ring" />
      <span className="relative inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white px-5 py-3.5 shadow-[0_18px_40px_-12px_rgba(37,211,102,0.5)] hover:bg-[#1DA851] transition-colors animate-float-y">
        <MessageCircle size={20} />
        <span className="hidden sm:inline text-sm font-medium">WhatsApp</span>
      </span>
    </a>
  );
}
