import { useState } from "react";
import { RotateCcw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const errorWords = [
  { id: 1, hanzi: "饺子", pinyin: "jiǎozi", polish: "pierożki", category: "Jedzenie", errorCount: 5, lastError: "2 godz. temu", mastered: false },
  { id: 2, hanzi: "米饭", pinyin: "mǐfàn", polish: "gotowany ryż", category: "Jedzenie", errorCount: 3, lastError: "wczoraj", mastered: false },
  { id: 3, hanzi: "星期", pinyin: "xīngqī", polish: "tydzień", category: "Czas", errorCount: 4, lastError: "2 dni temu", mastered: false },
  { id: 4, hanzi: "下午", pinyin: "xiàwǔ", polish: "popołudnie", category: "Czas", errorCount: 2, lastError: "3 dni temu", mastered: false },
  { id: 5, hanzi: "商店", pinyin: "shāngdiàn", polish: "sklep", category: "Zakupy", errorCount: 6, lastError: "1 godz. temu", mastered: false },
  { id: 6, hanzi: "便宜", pinyin: "piányí", polish: "tani", category: "Zakupy", errorCount: 3, lastError: "wczoraj", mastered: false },
  { id: 7, hanzi: "医院", pinyin: "yīyuàn", polish: "szpital", category: "Miejsca", errorCount: 2, lastError: "4 dni temu", mastered: false },
];

const categories = ["Wszystkie", "Jedzenie", "Czas", "Zakupy", "Miejsca"];

export default function MojeBledyScreen({ onBack, onPractice }) {
  const [activeCategory, setActiveCategory] = useState("Wszystkie");
  const [dismissedIds, setDismissedIds] = useState([]);

  const filtered = errorWords.filter(
    (w) => !dismissedIds.includes(w.id) && (activeCategory === "Wszystkie" || w.category === activeCategory)
  );

  const totalErrors = filtered.reduce((s, w) => s + w.errorCount, 0);

  function handleDismiss(id) { 
    setDismissedIds((prev) => [...prev, id]); 
  }

  function badgeColor(count) {
    if (count >= 5) return { bg: "rgba(200,62,52,0.08)", border: "rgba(200,62,52,0.3)", text: "var(--primary)" };
    if (count >= 3) return { bg: "rgba(212,168,67,0.1)", border: "rgba(212,168,67,0.35)", text: "#A07820" };
    return { bg: "rgba(79,121,66,0.08)", border: "rgba(79,121,66,0.3)", text: "var(--accent)" };
  }

  return (
    <div className="p-8" style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div className="grid gap-8" style={{ gridTemplateColumns: "260px 1fr" }}>
        <div className="flex flex-col gap-4">
          <div
            className="rounded-2xl p-5"
            style={{
              background: "rgba(200,62,52,0.04)",
              border: "1.5px solid rgba(200,62,52,0.18)",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(200,62,52,0.1)" }}>
                <AlertCircle size={18} color="var(--primary)" strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "28px", fontWeight: 700, color: "var(--primary)", lineHeight: 1 }}>{totalErrors}</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)" }}>błędów łącznie</p>
              </div>
            </div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)", lineHeight: 1.5 }}>
              {filtered.length} słów wymaga powtórzenia w ostatnich 7 dniach.
            </p>
          </div>
          <div
            className="rounded-2xl border border-border bg-card p-4"
            style={{ boxShadow: "0 1px 12px rgba(26,26,26,0.04)" }}
          >
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)", letterSpacing: "0.07em", marginBottom: "12px" }}>
              KATEGORIE
            </p>
            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => {
                const count = cat === "Wszystkie"
                  ? errorWords.filter((w) => !dismissedIds.includes(w.id)).length
                  : errorWords.filter((w) => !dismissedIds.includes(w.id) && w.category === cat).length;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all"
                    style={{
                      backgroundColor: isActive ? "rgba(200,62,52,0.07)" : "transparent",
                      border: isActive ? "1px solid rgba(200,62,52,0.2)" : "1px solid transparent",
                    }}
                  >
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: isActive ? 600 : 400, color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}>
                      {cat}
                    </span>
                    {count > 0 && (
                      <div
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: isActive ? "rgba(200,62,52,0.1)" : "var(--muted)" }}
                      >
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: isActive ? "var(--primary)" : "var(--muted-foreground)", fontWeight: 600 }}>
                          {count}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {filtered.length > 0 && (
            <button
              onClick={() => onPractice(filtered)}
              className="w-full py-4 rounded-xl flex items-center justify-center gap-2.5 transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                boxShadow: "0 3px 16px rgba(200,62,52,0.28)",
              }}
            >
              <RotateCcw size={16} strokeWidth={2} />
              <span>Przećwicz ({filtered.length} słów)</span>
            </button>
          )}
        </div>
        <div>
          <div
            className="grid gap-4 px-4 py-2.5 mb-3 rounded-xl"
            style={{ gridTemplateColumns: "56px 1fr 1fr auto auto", backgroundColor: "var(--muted)", border: "1px solid var(--border)" }}
          >
            {["Znak", "Wymowa / Znaczenie", "Kategoria", "Błędy", ""].map((h) => (
              <span key={h} style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)", letterSpacing: "0.06em" }}>{h}</span>
            ))}
          </div>

          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "60px", opacity: 0.12 }}>✓</span>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "var(--muted-foreground)" }}>Brak błędów w tej kategorii!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filtered.map((word, i) => {
                  const badge = badgeColor(word.errorCount);
                  return (
                    <motion.div
                      key={word.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                    >
                      <div
                        className="grid items-center gap-4 px-4 py-4 rounded-2xl border bg-card"
                        style={{ gridTemplateColumns: "56px 1fr 1fr auto auto", borderColor: "var(--border)", boxShadow: "0 1px 8px rgba(26,26,26,0.04)" }}
                      >
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}
                        >
                          <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: word.hanzi.length === 1 ? "30px" : "22px", fontWeight: 700, color: "var(--foreground)" }}>
                            {word.hanzi}
                          </span>
                        </div>
                        <div>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 500, color: "var(--foreground)", marginBottom: "2px" }}>
                            {word.pinyin}
                          </p>
                          <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "14px", color: "var(--muted-foreground)" }}>
                            {word.polish}
                          </p>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)", marginTop: "2px", opacity: 0.7 }}>
                            Ostatni błąd: {word.lastError}
                          </p>
                        </div>
                        <div>
                          <div
                            className="inline-block px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}
                          >
                            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)" }}>{word.category}</span>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <div
                            className="px-3 py-1.5 rounded-full flex items-center gap-1.5"
                            style={{ backgroundColor: badge.bg, border: `1px solid ${badge.border}` }}
                          >
                            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: badge.text }}>×{word.errorCount}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDismiss(word.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center border border-border transition-all hover:border-accent/40 hover:bg-accent/5 active:scale-90"
                          style={{ backgroundColor: "var(--secondary)" }}
                          title="Oznacz jako opanowane"
                        >
                          <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "14px", color: "var(--muted-foreground)" }}>✓</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}