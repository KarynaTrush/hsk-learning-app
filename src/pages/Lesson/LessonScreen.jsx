import { useState } from "react";
import { Volume2, ChevronRight, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import styles from "./Lesson.module.css"; 

const vocabulary = [
  { hanzi: "米饭", pinyin: "mǐfàn", polish: "gotowany ryż", example: "我喜欢吃米饭。", exampleTranslation: "Lubię jeść ryż." },
  { hanzi: "面条", pinyin: "miàntiáo", polish: "makaron", example: "面条很好吃。", exampleTranslation: "Makaron jest bardzo smaczny." },
  { hanzi: "饺子", pinyin: "jiǎozi", polish: "pierożki", example: "微们一起吃饺子吧。", exampleTranslation: "Zjedzmy razem pierożki." },
];

const matchItems = [
  { hanzi: "米饭", polish: "gotowany ryż" },
  { hanzi: "面条", polish: "makaron" },
  { hanzi: "饺子", polish: "pierożki" },
  { hanzi: "水", polish: "woda" },
];

export default function LessonScreen({ onComplete }) {
  const [vocabIndex, setVocabIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const word = vocabulary[vocabIndex];

  function handleSpeak() { 
    setIsPlaying(true); 
    setTimeout(() => setIsPlaying(false), 800); 
  }
  
  function handleCheck() { 
    if (!selected) return; 
    setAnswered(true); 
  }
  
  function handleNext() {
    if (vocabIndex < vocabulary.length - 1) { 
      setVocabIndex((v) => v + 1); 
      setAnswered(false); 
      setSelected(null); 
    } else {
      onComplete();
    }
  }

  return (
    <div className={styles.container}>

      <div className={styles.headerRow}>
        <div>
          <p className={styles.counterText}>
            SŁOWO {vocabIndex + 1} Z {vocabulary.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {vocabulary.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === vocabIndex ? "28px" : "12px",
                  backgroundColor: i < vocabIndex ? "var(--accent)" : i === vocabIndex ? "var(--primary)" : "var(--muted)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>

        <div className={styles.flexCol}>
          <AnimatePresence mode="wait">
            <motion.div
              key={vocabIndex}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.wordCard}>
                <div className={styles.wordHeader}>
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <span className={styles.hanziText}>{word.hanzi}</span>
                      <span className={styles.pinyinText}>{word.pinyin}</span>
                      <span className={styles.polishText}>{word.polish}</span>
                    </div>
                    <button
                      onClick={handleSpeak}
                      className={styles.audioButton}
                      style={{
                        borderColor: isPlaying ? "var(--primary)" : "var(--border)",
                        backgroundColor: isPlaying ? "rgba(200,62,52,0.08)" : "var(--card)",
                      }}
                    >
                      <Volume2 size={20} color={isPlaying ? "var(--primary)" : "var(--muted-foreground)"} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <div className={styles.exampleBlock}>
                  <p className={styles.exampleMeta}>ZDANIE PRZYKŁADOWE</p>
                  <p className={styles.exampleHanzi}>{word.example}</p>
                  <p className={styles.exampleTranslation}>{word.exampleTranslation}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3">
            <button
              onClick={() => { if (vocabIndex > 0) { setVocabIndex((v) => v - 1); setAnswered(false); setSelected(null); } }}
              disabled={vocabIndex === 0}
              className={`flex-1 py-3 rounded-xl border border-border bg-card text-sm transition-all hover:border-foreground/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${styles.navButtonPrev}`}
            >
              ← Poprzednie
            </button>
            <button
              onClick={handleNext}
              disabled={!answered && vocabIndex < vocabulary.length - 1}
              className={`flex-1 py-3 rounded-xl border text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${styles.navButtonNext}`}
              style={{
                backgroundColor: answered ? "var(--accent)" : "transparent",
                borderColor: answered ? "var(--accent)" : "var(--border)",
                color: answered ? "var(--accent-foreground)" : "var(--muted-foreground)",
                fontWeight: answered ? 600 : 400,
              }}
            >
              {vocabIndex < vocabulary.length - 1 ? "Następne →" : "Zakończ lekcję →"}
            </button>
          </div>
        </div>
        <div className={styles.flexCol}>
          <div className={styles.matchCard}>
            <p className={styles.matchTitle}>Dopasuj znaczenie</p>
            <p className={styles.matchSubtitle}>
              Wybierz polskie tłumaczenie dla znaku{" "}
              <span className={styles.targetHanziInline}>{word.hanzi}</span>
            </p>

            <div className={styles.answersGrid}>
              {matchItems.map((item) => {
                const isSelected = selected === item.polish;
                const isCorrect  = answered && item.polish === word.polish;
                const isWrong    = answered && isSelected && item.polish !== word.polish;
                return (
                  <button
                    key={item.polish}
                    onClick={() => !answered && setSelected(item.polish)}
                    className={styles.answerButton}
                    style={{
                      backgroundColor: isCorrect ? "rgba(79,121,66,0.07)" : isWrong ? "rgba(200,62,52,0.05)" : isSelected ? "rgba(200,62,52,0.04)" : "var(--secondary)",
                      borderColor: isCorrect ? "var(--accent)" : isWrong ? "var(--primary)" : isSelected ? "var(--primary)" : "var(--border)",
                      boxShadow: isSelected && !answered ? "0 0 0 2px rgba(200,62,52,0.15)" : isCorrect ? "0 0 0 2px rgba(79,121,66,0.2)" : "none",
                    }}
                  >
                    <span
                      className={styles.answerHanzi}
                      style={{
                        color: isCorrect ? "var(--accent)" : isWrong ? "var(--primary)" : "var(--foreground)",
                      }}
                    >
                      {item.hanzi}
                    </span>
                    <span className={styles.answerPolish}>{item.polish}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={styles.feedbackAlert}
                  style={{
                    backgroundColor: selected === word.polish ? "rgba(79,121,66,0.08)" : "rgba(200,62,52,0.06)",
                    border: `1.5px solid ${selected === word.polish ? "var(--accent)" : "var(--primary)"}`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-none"
                    style={{ backgroundColor: selected === word.polish ? "var(--accent)" : "var(--primary)" }}
                  >
                    {selected === word.polish
                      ? <Check size={16} color="white" strokeWidth={2.5} />
                      : <X size={16} color="white" strokeWidth={2.5} />
                    }
                  </div>
                  <p 
                    className={styles.feedbackText} 
                    style={{ color: selected === word.polish ? "var(--accent)" : "var(--primary)" }}
                  >
                    {selected === word.polish ? "Świetnie! Dobra odpowiedź." : `Błąd. Poprawna odpowiedź: „${word.polish}"`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {!answered ? (
              <button
                onClick={handleCheck}
                disabled={!selected}
                className={`hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed ${styles.checkButton}`}
                style={{
                  backgroundColor: selected ? "var(--primary)" : "var(--muted)",
                  color: selected ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "15px",
                  fontWeight: 600,
                  boxShadow: selected ? "0 3px 16px rgba(200,62,52,0.25)" : "none",
                  opacity: selected ? 1 : 0.6,
                }}
              >
                Sprawdź odpowiedź
              </button>
            ) : (
              <button onClick={handleNext} className={styles.actionButton}>
                <span>{vocabIndex < vocabulary.length - 1 ? "Następne słowo" : "Zakończ lekcję"}</span>
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            )}
          </div>

          <div className={styles.vocabularyListCard}>
            <p className={styles.vocabListTitle}>SŁOWA W TEJ LEKCJI</p>
            <div className="flex flex-col gap-2">
              {vocabulary.map((v, i) => (
                <div
                  key={v.hanzi}
                  className={styles.vocabRow}
                  style={{
                    backgroundColor: i === vocabIndex ? "rgba(200,62,52,0.05)" : "transparent",
                    border: i === vocabIndex ? "1px solid rgba(200,62,52,0.15)" : "1px solid transparent",
                  }}
                >
                  <span 
                    className={styles.vocabRowHanzi}
                    style={{ color: i < vocabIndex ? "var(--accent)" : i === vocabIndex ? "var(--primary)" : "var(--muted-foreground)" }}
                  >
                    {v.hanzi}
                  </span>
                  <div>
                    <span className={styles.vocabRowPinyin}>{v.pinyin}</span>
                    <span className={styles.vocabRowPolish}>{v.polish}</span>
                  </div>
                  {i < vocabIndex && <span className="ml-auto text-[12px] color-[var(--accent)]">✓</span>}
                  {i === vocabIndex && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}