import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, X, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const flashcards = [
  { id: 1, hanzi: "饺子", pinyin: "jiǎozi", polish: "pierożki", example: "我喜欢吃饺子。", exampleTranslation: "Lubię jeść pierożki.", hsk: 2, dueIn: "teraz" },
  { id: 2, hanzi: "星期三", pinyin: "xīngqīsān", polish: "środa", example: "今天是星期三。", exampleTranslation: "Dzisiaj jest środa.", hsk: 1, dueIn: "teraz" },
  { id: 3, hanzi: "商店", pinyin: "shāngdiàn", polish: "sklep", example: "那个商店很大。", exampleTranslation: "Ten sklep jest bardzo duży.", hsk: 2, dueIn: "za 10 min" },
  { id: 4, hanzi: "便宜", pinyin: "piányí", polish: "tani", example: "这件衣服很便宜。", exampleTranslation: "To ubranie jest bardzo tanie.", hsk: 2, dueIn: "za 10 min" },
  { id: 5, hanzi: "漂亮", pinyin: "piàoliang", polish: "piękny/ładny", example: "she很漂亮。", exampleTranslation: "Ona jest bardzo piękna.", hsk: 2, dueIn: "jutro" },
];
function MiZiGeGrid({ hanzi, size = 220 }) {
  const s = size; const half = s / 2; const pad = 12;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: "block" }}>
      <rect x={pad} y={pad} width={s - pad*2} height={s - pad*2} rx={4} fill="none" stroke="#C83E34" strokeWidth={1.5} strokeDasharray="5 3" opacity={0.7} />
      <line x1={pad} y1={half} x2={s-pad} y2={half} stroke="#C83E34" strokeWidth={0.8} strokeDasharray="4 4" opacity={0.35} />
      <line x1={half} y1={pad} x2={half} y2={s-pad} stroke="#C83E34" strokeWidth={0.8} strokeDasharray="4 4" opacity={0.35} />
      <line x1={pad} y1={pad} x2={s-pad} y2={s-pad} stroke="#C83E34" strokeWidth={0.6} strokeDasharray="3 5" opacity={0.2} />
      <line x1={s-pad} y1={pad} x2={pad} y2={s-pad} stroke="#C83E34" strokeWidth={0.6} strokeDasharray="3 5" opacity={0.2} />
      {[[pad,pad],[s-pad,pad],[pad,s-pad],[s-pad,s-pad]].map(([cx,cy],i) => <circle key={i} cx={cx} cy={cy} r={2.5} fill="#C83E34" opacity={0.4} />)}
      {[[half,pad],[half,s-pad],[pad,half],[s-pad,half]].map(([cx,cy],i) => <circle key={i} cx={cx} cy={cy} r={1.5} fill="#C83E34" opacity={0.25} />)}
      <text x={half} y={half+2} textAnchor="middle" dominantBaseline="central"
        fontSize={hanzi.length === 1 ? s * 0.52 : s * 0.36}
        fontFamily="'Noto Serif SC', serif" fontWeight={700} fill="#1A1A1A" opacity={0.9}
      >{hanzi}</text>
    </svg>
  );
}
export default function PowtorkiScreen({ onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardState, setCardState] = useState("hidden");
  const [swipeResult, setSwipeResult] = useState(null);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState({ know: 0, dontknow: 0 });

  const card = flashcards[currentIndex];
  const remaining = flashcards.length - currentIndex;

  function handleAnswer(result) {
    setSwipeResult(result);
    setResults((r) => ({ ...r, [result]: r[result] + 1 }));
    setTimeout(() => {
      setSwipeResult(null);
      if (currentIndex < flashcards.length - 1) { 
        setCurrentIndex((i) => i + 1); 
        setCardState("hidden"); 
      } else {
        setDone(true);
      }
    }, 380);
  }

  if (done) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-md">
          <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "80px", opacity: 0.1, display: "block", lineHeight: 1, marginBottom: "20px" }}>完</span>
          <h2 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "32px", fontWeight: 700, color: "var(--foreground)", marginBottom: "10px" }}>Sesja zakończona!</h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "var(--muted-foreground)", marginBottom: "40px" }}>Przerobiłeś {flashcards.length} fiszek.</p>
          <div className="flex gap-8 justify-center mb-10">
            <div className="text-center">
              <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "48px", fontWeight: 700, color: "var(--accent)" }}>{results.know}</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--muted-foreground)" }}>Znam</p>
            </div>
            <div className="w-px" style={{ backgroundColor: "var(--border)", alignSelf: "stretch" }} />
            <div className="text-center">
              <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "48px", fontWeight: 700, color: "var(--primary)" }}>{results.dontknow}</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--muted-foreground)" }}>Do nauki</p>
            </div>
          </div>
          <button onClick={onBack} className="px-8 py-4 rounded-xl transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)", fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 600, boxShadow: "0 3px 16px rgba(200,62,52,0.28)" }}>
            Wróć do profilu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8" style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div className="flex items-center justify-between mb-7">
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em" }}>
          FISZKA {currentIndex + 1} Z {flashcards.length}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            {flashcards.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: i === currentIndex ? "28px" : "10px", backgroundColor: i < currentIndex ? "var(--accent)" : i === currentIndex ? "var(--primary)" : "var(--muted)" }}
              />
            ))}
          </div>
          <div className="px-3 py-1.5 rounded-full border border-border bg-secondary">
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>
              {remaining} pozostało
            </span>
          </div>
        </div>
      </div>
      <div className="grid gap-8" style={{ gridTemplateColumns: "1fr 320px" }}>
        <div className="flex flex-col gap-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: swipeResult === "know" ? 3 : swipeResult === "dontknow" ? -3 : 0, x: swipeResult === "know" ? 40 : swipeResult === "dontknow" ? -40 : 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: swipeResult ? 0.32 : 0.22, ease: "easeOut" }}
            >
              <div
                className="rounded-2xl border border-border bg-card overflow-hidden"
                style={{ boxShadow: "0 6px 40px rgba(26,26,26,0.12)" }}
              >
                <div
                  className="flex items-center justify-between px-6 pt-5 pb-0"
                  style={{ borderBottom: "none" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 600 }}>HSK {card.hsk}</span>
                    </div>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)" }}>· {card.dueIn}</span>
                  </div>
                  <button className="w-9 h-9 rounded-full flex items-center justify-center border border-border bg-secondary transition-all hover:scale-105 active:scale-90">
                    <Volume2 size={15} color="var(--primary)" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="flex justify-center py-8">
                  <MiZiGeGrid hanzi={card.hanzi} size={220} />
                </div>
                <AnimatePresence>
                  {cardState === "revealed" ? (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="mx-6 mb-6 rounded-xl px-5 py-5" style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "26px", fontWeight: 600, color: "var(--primary)", letterSpacing: "0.04em" }}>{word.pinyin}</p>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: 500, color: "var(--foreground)", textAlign: "center", marginBottom: "16px" }}>{word.polish}</p>
                        <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                          <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "16px", color: "var(--foreground)", textAlign: "center", marginBottom: "4px" }}>{card.example}</p>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--muted-foreground)", textAlign: "center" }}>{card.exampleTranslation}</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 pb-6">
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--muted-foreground)", textAlign: "center", opacity: 0.5 }}>· · ·</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>
          <div>
            {cardState === "hidden" ? (
              <button
                onClick={() => setCardState("revealed")}
                className="w-full py-4 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: "var(--foreground)", color: "var(--background)", fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 600, boxShadow: "0 2px 16px rgba(26,26,26,0.18)" }}
              >
                Odkryj kartę
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => handleAnswer("dontknow")}
                  className="flex-1 py-5 rounded-xl flex flex-col items-center gap-1.5 border transition-all hover:scale-[1.01] active:scale-[0.97]"
                  style={{ backgroundColor: "rgba(200,62,52,0.05)", borderColor: "rgba(200,62,52,0.2)" }}
                >
                  <X size={24} color="var(--primary)" strokeWidth={2} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "var(--primary)" }}>Nie znam</span>
                </button>
                <button
                  onClick={() => handleAnswer("know")}
                  className="flex-1 py-5 rounded-xl flex flex-col items-center gap-1.5 border transition-all hover:scale-[1.01] active:scale-[0.97]"
                  style={{ backgroundColor: "rgba(79,121,66,0.06)", borderColor: "rgba(79,121,66,0.25)" }}
                >
                  <Check size={24} color="var(--accent)" strokeWidth={2} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "var(--accent)" }}>Znam</span>
                </button>
              </div>
            )}

            <div className="flex justify-between mt-3 px-1">
              <button
                onClick={() => { if (currentIndex > 0) { setCurrentIndex((i) => i-1); setCardState("hidden"); } }}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 transition-all"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)", opacity: currentIndex === 0 ? 0.3 : 0.7 }}
              >
                <ChevronLeft size={14} strokeWidth={2} /> Poprzednia
              </button>
              <button
                onClick={() => { if (currentIndex < flashcards.length-1) { setCurrentIndex((i) => i+1); setCardState("hidden"); } }}
                disabled={currentIndex === flashcards.length-1}
                className="flex items-center gap-1.5 transition-all"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)", opacity: currentIndex === flashcards.length-1 ? 0.3 : 0.7 }}
              >
                Następna <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div
            className="rounded-2xl border border-border bg-card p-5"
            style={{ boxShadow: "0 1px 12px rgba(26,26,26,0.04)" }}
          >
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em", marginBottom: "14px" }}>
              KOLEJKA FISZEK
            </p>
            <div className="flex flex-col gap-2">
              {flashcards.map((fc, i) => (
                <div
                  key={fc.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{
                    backgroundColor: i === currentIndex ? "rgba(200,62,52,0.05)" : "transparent",
                    border: i === currentIndex ? "1px solid rgba(200,62,52,0.15)" : "1px solid transparent",
                    opacity: i < currentIndex ? 0.4 : 1,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-none"
                    style={{
                      backgroundColor: i < currentIndex ? "var(--accent)" : i === currentIndex ? "var(--primary)" : "var(--muted)",
                      border: i < currentIndex ? "none" : i === currentIndex ? "none" : "1px solid var(--border)",
                    }}
                  >
                    {i < currentIndex
                      ? <span style={{ fontSize: "10px", color: "white" }}>✓</span>
                      : <span style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: i === currentIndex ? "white" : "var(--muted-foreground)", fontWeight: 600 }}>{i+1}</span>
                    }
                  </div>
                  <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "18px", fontWeight: 700, color: i === currentIndex ? "var(--primary)" : "var(--foreground)" }}>{fc.hanzi}</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)" }}>{fc.pinyin}</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)", marginLeft: "auto" }}>{fc.dueIn}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl border border-border bg-card p-5"
            style={{ boxShadow: "0 1px 12px rgba(26,26,26,0.04)" }}
          >
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em", marginBottom: "14px" }}>
              WYNIKI SESJI
            </p>
            <div className="flex gap-6">
              <div className="text-center">
                <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "32px", fontWeight: 700, color: "var(--accent)" }}>{results.know}</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)" }}>Znam</p>
              </div>
              <div className="w-px" style={{ backgroundColor: "var(--border)", alignSelf: "stretch" }} />
              <div className="text-center">
                <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "32px", fontWeight: 700, color: "var(--primary)" }}>{results.dontknow}</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)" }}>Do nauki</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}