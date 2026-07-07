import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, X, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import styles from "./Reviews.module.css";

const flashcards = [
  { id: 1, hanzi: "饺子", pinyin: "jiǎozi", polish: "pierożki", example: "我喜欢 eat 饺子。", exampleTranslation: "Lubię jeść pierożki.", hsk: 2, dueIn: "teraz" },
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
      <div className={styles.endContainer}>
        <div className={styles.endContent}>
          <span className={styles.endIcon}>完</span>
          <h2 className={styles.endTitle}>Sesja zakończona!</h2>
          <p className={styles.endDesc}>Przerobiłeś {flashcards.length} fiszek.</p>
          <div className={styles.endResults}>
            <div className={styles.resultBlock}>
              <p className={styles.endValue} style={{ color: "var(--accent)" }}>{results.know}</p>
              <p className={styles.endLabel}>Znam</p>
            </div>
            <div className={styles.resultDivider} />
            <div className={styles.resultBlock}>
              <p className={styles.endValue} style={{ color: "var(--primary)" }}>{results.dontknow}</p>
              <p className={styles.endLabel}>Do nauki</p>
            </div>
          </div>
          <button onClick={onBack} className={styles.endButton}>
            Wróć do profilu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <p className={styles.counterText}>
          FISZKA {currentIndex + 1} Z {flashcards.length}
        </p>
        <div className={styles.progressWrapper}>
          <div className="flex gap-1.5">
            {flashcards.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: i === currentIndex ? "28px" : "10px", backgroundColor: i < currentIndex ? "var(--accent)" : i === currentIndex ? "var(--primary)" : "var(--muted)" }}
              />
            ))}
          </div>
          <div className={styles.remainingBadge}>
            <span className={styles.remainingText}>
              {remaining} pozostało
            </span>
          </div>
        </div>
      </div>
      
      <div className={styles.mainGrid}>
        <div className={styles.flexCol}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: swipeResult === "know" ? 3 : swipeResult === "dontknow" ? -3 : 0, x: swipeResult === "know" ? 40 : swipeResult === "dontknow" ? -40 : 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: swipeResult ? 0.32 : 0.22, ease: "easeOut" }}
            >
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.metaWrapper}>
                    <div className={styles.hskBadge}>
                      <span className={styles.hskText}>HSK {card.hsk}</span>
                    </div>
                    <span className={styles.dueText}>· {card.dueIn}</span>
                  </div>
                  <button className={styles.audioButton}>
                    <Volume2 size={15} color="var(--primary)" strokeWidth={1.5} />
                  </button>
                </div>
                <div className={styles.canvasWrapper}>
                  <MiZiGeGrid hanzi={card.hanzi} size={220} />
                </div>
                <AnimatePresence>
                  {cardState === "revealed" ? (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className={styles.revealedContent}>
                        <p className={styles.pinyinText}>{card.pinyin}</p>
                        <p className={styles.polishText}>{card.polish}</p>
                        <div className={styles.exampleDivider}>
                          <p className={styles.exampleHanzi}>{card.example}</p>
                          <p className={styles.exampleTranslation}>{card.exampleTranslation}</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className={styles.hiddenDots}>· · ·</p>
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
                className={styles.revealButton}
              >
                Odkryj kartę
              </button>
            ) : (
              <div className={styles.actionsRow}>
                <button onClick={() => handleAnswer("dontknow")} className={styles.dontKnowButton}>
                  <X size={24} color="var(--primary)" strokeWidth={2} />
                  <span className={styles.dontKnowText}>Nie znam</span>
                </button>
                <button onClick={() => handleAnswer("know")} className={styles.knowButton}>
                  <Check size={24} color="var(--accent)" strokeWidth={2} />
                  <span className={styles.knowText}>Znam</span>
                </button>
              </div>
            )}

            <div className={styles.navRow}>
              <button
                onClick={() => { if (currentIndex > 0) { setCurrentIndex((i) => i-1); setCardState("hidden"); } }}
                disabled={currentIndex === 0}
                className={styles.navButton}
                style={{ opacity: currentIndex === 0 ? 0.3 : 0.7 }}
              >
                <ChevronLeft size={14} strokeWidth={2} /> Poprzednia
              </button>
              <button
                onClick={() => { if (currentIndex < flashcards.length-1) { setCurrentIndex((i) => i+1); setCardState("hidden"); } }}
                disabled={currentIndex === flashcards.length-1}
                className={styles.navButton}
                style={{ opacity: currentIndex === flashcards.length-1 ? 0.3 : 0.7 }}
              >
                Następna <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.flexCol}>
          <div className={styles.sidebarCard}>
            <p className={styles.sidebarTitle}>KOLEJKA FISZEK</p>
            <div className={styles.queueList}>
              {flashcards.map((fc, i) => (
                <div
                  key={fc.id}
                  className={styles.queueItem}
                  style={{
                    backgroundColor: i === currentIndex ? "rgba(200,62,52,0.05)" : "transparent",
                    border: i === currentIndex ? "1px solid rgba(200,62,52,0.15)" : "1px solid transparent",
                    opacity: i < currentIndex ? 0.4 : 1,
                  }}
                >
                  <div
                    className={styles.queueIndex}
                    style={{
                      backgroundColor: i < currentIndex ? "var(--accent)" : i === currentIndex ? "var(--primary)" : "var(--muted)",
                      border: i < currentIndex ? "none" : i === currentIndex ? "none" : "1px solid var(--border)",
                    }}
                  >
                    {i < currentIndex ? (
                      <span style={{ fontSize: "10px", color: "white" }}>✓</span>
                    ) : (
                      <span className={styles.queueIndexText} style={{ color: i === currentIndex ? "white" : "var(--muted-foreground)" }}>
                        {i+1}
                      </span>
                    )}
                  </div>
                  <span className={styles.queueHanzi} style={{ color: i === currentIndex ? "var(--primary)" : "var(--foreground)" }}>
                    {fc.hanzi}
                  </span>
                  <span className={styles.queuePinyin}>{fc.pinyin}</span>
                  <span className={styles.queueDue}>{fc.dueIn}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <p className={styles.sidebarTitle}>WYNIKI SESJI</p>
            <div className={styles.resultsRow}>
              <div className={styles.resultBlock}>
                <p className={styles.resultValue} style={{ color: "var(--accent)" }}>{results.know}</p>
                <p className={styles.resultLabel}>Znam</p>
              </div>
              <div className={styles.resultDivider} />
              <div className={styles.resultBlock}>
                <p className={styles.resultValue} style={{ color: "var(--primary)" }}>{results.dontknow}</p>
                <p className={styles.resultLabel}>Do nauki</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}