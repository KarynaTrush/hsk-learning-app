import { useState } from "react";
import { RotateCcw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import styles from "./Mistakes.module.css";

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
    <div className={styles.container}>
      <div className={styles.mainGrid}>
        <div className={styles.flexCol}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <div className={styles.iconBox}>
                <AlertCircle size={18} color="var(--primary)" strokeWidth={1.5} />
              </div>
              <div>
                <p className={styles.totalCount}>{totalErrors}</p>
                <p className={styles.totalLabel}>błędów łącznie</p>
              </div>
            </div>
            <p className={styles.summaryDesc}>
              {filtered.length} słów wymaga powtórzenia w ostatnich 7 dniach.
            </p>
          </div>

          <div className={styles.categoriesCard}>
            <p className={styles.categoriesTitle}>KATEGORIE</p>
            <div className={styles.categoriesList}>
              {categories.map((cat) => {
                const count = cat === "Wszystkie"
                  ? errorWords.filter((w) => !dismissedIds.includes(w.id)).length
                  : errorWords.filter((w) => !dismissedIds.includes(w.id) && w.category === cat).length;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={styles.categoryButton}
                    style={{
                      backgroundColor: isActive ? "rgba(200,62,52,0.07)" : "transparent",
                      border: isActive ? "1px solid rgba(200,62,52,0.2)" : "1px solid transparent",
                    }}
                  >
                    <span 
                      className={styles.categoryLabel}
                      style={{
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? "var(--foreground)" : "var(--muted-foreground)"
                      }}
                    >
                      {cat}
                    </span>
                    {count > 0 && (
                      <div
                        className={styles.badgeCount}
                        style={{ backgroundColor: isActive ? "rgba(200,62,52,0.1)" : "var(--muted)" }}
                      >
                        <span 
                          className={styles.badgeCountText}
                          style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)" }}
                        >
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
            <button onClick={() => onPractice(filtered)} className={styles.practiceButton}>
              <RotateCcw size={16} strokeWidth={2} />
              <span>Przećwicz ({filtered.length} słów)</span>
            </button>
          )}
        </div>

        <div>
          <div className={styles.tableHeader}>
            {["Znak", "Wymowa / Znaczenie", "Kategoria", "Błędy", ""].map((h) => (
              <span key={h} className={styles.tableHeaderCell}>{h}</span>
            ))}
          </div>

          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyStateIcon}>✓</span>
                <p className={styles.emptyStateText}>Brak błędów w tej kategorii!</p>
              </div>
            ) : (
              <div className={styles.wordsList}>
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
                      <div className={styles.wordRow}>
                        <div className={styles.hanziBox}>
                          <span 
                            className={styles.hanziText}
                            style={{ fontSize: word.hanzi.length === 1 ? "30px" : "22px" }}
                          >
                            {word.hanzi}
                          </span>
                        </div>
                        <div>
                          <p className={styles.pinyinText}>{word.pinyin}</p>
                          <p className={styles.polishText}>{word.polish}</p>
                          <p className={styles.timeText}>Ostatni błąd: {word.lastError}</p>
                        </div>
                        <div>
                          <div className={styles.categoryBadge}>
                            <span className={styles.categoryBadgeText}>{word.category}</span>
                          </div>
                        </div>
                        <div className={styles.errorBadgeBox}>
                          <div
                            className={styles.errorBadge}
                            style={{ backgroundColor: badge.bg, border: `1px solid ${badge.border}` }}
                          >
                            <span className={styles.errorBadgeText} style={{ color: badge.text }}>×{word.errorCount}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDismiss(word.id)}
                          className={styles.dismissButton}
                          title="Oznacz jako opanowane"
                        >
                          <span className={styles.dismissIconText}>✓</span>
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