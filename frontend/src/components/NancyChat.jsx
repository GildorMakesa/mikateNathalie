import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const STORAGE_KEY = "mr_nancy_session";
const HISTORY_KEY = "mr_nancy_history";

const getSessionId = () => {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
};

const INITIAL_GREETING = {
  role: "assistant",
  content:
    "Bonjour ! Je suis Nancy, votre assistante chez Délices Mikaté Royal ✨ Je peux vous renseigner sur nos mikatés, nos boissons (bissap, jus de gingembre…), nos zones de livraison et le processus de soumission. Comment puis-je vous aider aujourd'hui ?",
};

export default function NancyChat() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "null");
      return saved && saved.length ? saved : [INITIAL_GREETING];
    } catch {
      return [INITIAL_GREETING];
    }
  });
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Persist history
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 350);
      setUnread(false);
    }
  }, [open]);

  // Listen to global open events from other components
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("mr:open-nancy", handler);
    return () => window.removeEventListener("mr:open-nancy", handler);
  }, []);

  const send = async (textArg) => {
    const text = (textArg ?? input).trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/chat", {
        session_id: getSessionId(),
        message: text,
        history: updated.slice(0, -1).map(({ role, content }) => ({ role, content })),
      });
      const reply = (data?.reply || "").trim();
      const assistantMsg = {
        role: "assistant",
        content:
          reply ||
          "Désolée, je n'ai pas pu formuler une réponse. Vous pouvez nous écrire à contact@mikateroyal.com.",
      };
      setMessages((curr) => [...curr, assistantMsg]);
      if (!open) setUnread(true);
    } catch (err) {
      console.error(err);
      const fallback = {
        role: "assistant",
        content:
          "Désolée, une erreur est survenue. Vous pouvez nous écrire directement à contact@mikateroyal.com.",
      };
      setMessages((curr) => [...curr, fallback]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const reset = () => {
    setMessages([INITIAL_GREETING]);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        data-testid="nancy-toggle"
        aria-label="Discuter avec Nancy"
        className="fixed bottom-6 right-6 z-40 group"
      >
        <span className="absolute inset-0 rounded-full bg-brand-ruby/60 animate-pulse-ring" aria-hidden />
        <span className="relative inline-flex items-center gap-2 rounded-full bg-brand-ruby text-white px-5 py-3.5 shadow-[0_18px_40px_-12px_rgba(154,31,56,0.55)] hover:bg-brand-ink transition-colors">
          <Sparkles size={18} />
          <span className="text-sm font-medium hidden sm:inline">Nancy</span>
          {unread && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-brand-ochre ring-2 ring-white" />
          )}
        </span>
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] max-h-[80vh] bg-white border border-brand-line rounded-3xl shadow-[0_24px_60px_-20px_rgba(29,25,20,0.35)] overflow-hidden flex flex-col"
            data-testid="nancy-panel"
          >
            <header className="bg-brand-ink text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-brand-ruby/90 flex items-center justify-center font-display text-lg">
                  N
                </div>
                <div>
                  <p className="font-display text-lg leading-tight">Nancy</p>
                  <p className="text-[11px] text-white/70">Assistante · Délices Mikaté Royal</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={reset}
                  className="text-[11px] uppercase tracking-[0.15em] text-white/60 hover:text-white px-2 py-1"
                  data-testid="nancy-reset"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-white/10"
                  aria-label="Fermer"
                  data-testid="nancy-close"
                >
                  <X size={16} />
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 bg-brand-sand space-y-3" data-testid="nancy-messages">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-brand-ruby text-white rounded-br-sm"
                        : "bg-white border border-brand-line text-brand-ink rounded-bl-sm"
                    }`}
                  >
                    {m.content.split("\n").map((line, k) => (
                      <p key={k} className={k > 0 ? "mt-1" : ""}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-brand-line rounded-2xl rounded-bl-sm px-4 py-3 inline-flex items-center gap-2 text-brand-muted text-sm">
                    <Loader2 size={14} className="animate-spin" /> Nancy réfléchit…
                  </div>
                </div>
              )}
            </div>

            {/* Quick suggestions */}
            {messages.length <= 1 && !loading && (
              <div className="px-4 pb-2 flex flex-wrap gap-2 bg-brand-sand border-t border-brand-line">
                {[
                  "Quels produits offrez-vous ?",
                  "Comment fonctionne la livraison ?",
                  "Comment commander ?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-xs rounded-full border border-brand-line bg-white px-3 py-1.5 hover:border-brand-ruby hover:text-brand-ruby transition-colors"
                    data-testid={`nancy-suggestion-${q.slice(0, 6)}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-brand-line bg-white p-3 flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Écrivez à Nancy…"
                rows={1}
                disabled={loading}
                data-testid="nancy-input"
                className="flex-1 resize-none bg-brand-sand border border-brand-line rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-brand-ruby max-h-32"
                style={{ minHeight: "42px" }}
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                data-testid="nancy-send"
                className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-brand-ruby text-white hover:bg-brand-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                aria-label="Envoyer"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-brand-muted/70 text-center pb-2 bg-white">
              Pour des questions médicales, consultez un professionnel de santé.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
