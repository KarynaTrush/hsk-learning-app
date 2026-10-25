import { useState } from "react";
import { Volume2, ChevronRight, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import styles from "./Lesson.module.css"; 

const vocabulary = [
  { hanzi: "米饭", pinyin: "mǐfàn", example: "我喜欢吃米饭。" },
  { hanzi: "面条", pinyin: "miàntiáo", example: "面条很好吃。" },
  { hanzi: "饺子", pinyin: "jiǎozi", example: "微们一起吃饺子吧。" },
];

const matchItems = [
  { hanzi: "米饭" },
  { hanzi: "面条" },
  { hanzi: "饺子" },
  { hanzi: "水" },
];

export default function LessonScreen({ onComplete }) {
  const { t } = useTranslation();
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
            {t("lesson.wordOf", { current: vocabIndex + 1, total: vocabulary.length })}
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
                      <span className={styles.polishText}>{t(`meanings.${word.hanzi}`)}</span>
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
                  <p className={styles.exampleMeta}>{t("lesson.example")}</p>
                  <p className={styles.exampleHanzi}>{word.example}</p>
                  <p className={styles.exampleTranslation}>{t(`examples.${word.hanzi}`)}</p>
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
              {t("lesson.prev")}
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
              {vocabIndex < vocabulary.length - 1 ? t("lesson.next") : t("lesson.finish")}
            </button>
          </div>
        </div>
        <div className={styles.flexCol}>
          <div className={styles.matchCard}>
            <p className={styles.matchTitle}>{t("lesson.matchTitle")}</p>
            <p className={styles.matchSubtitle}>
              {t("lesson.matchSubtitle")}{" "}
              <span className={styles.targetHanziInline}>{word.hanzi}</span>
            </p>

            <div className={styles.answersGrid}>
              {matchItems.map((item) => {
                const isSelected = selected === item.hanzi;
                const isCorrect  = answered && item.hanzi === word.hanzi;
                const isWrong    = answered && isSelected && item.hanzi !== word.hanzi;
                return (
                  <button
                    key={item.hanzi}
                    onClick={() => !answered && setSelected(item.hanzi)}
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
                    <span className={styles.answerPolish}>{t(`meanings.${item.hanzi}`)}</span>
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
                    backgroundColor: selected === word.hanzi ? "rgba(79,121,66,0.08)" : "rgba(200,62,52,0.06)",
                    border: `1.5px solid ${selected === word.hanzi ? "var(--accent)" : "var(--primary)"}`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-none"
                    style={{ backgroundColor: selected === word.hanzi ? "var(--accent)" : "var(--primary)" }}
                  >
                    {selected === word.hanzi
                      ? <Check size={16} color="white" strokeWidth={2.5} />
                      : <X size={16} color="white" strokeWidth={2.5} />
                    }
                  </div>
                  <p 
                    className={styles.feedbackText} 
                    style={{ color: selected === word.hanzi ? "var(--accent)" : "var(--primary)" }}
                  >
                    {selected === word.hanzi ? t("lesson.correct") : t("lesson.wrong", { answer: t(`meanings.${word.hanzi}`) })}
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
                {t("lesson.check")}
              </button>
            ) : (
              <button onClick={handleNext} className={styles.actionButton}>
                <span>{vocabIndex < vocabulary.length - 1 ? t("lesson.nextWord") : t("lesson.finishLesson")}</span>
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            )}
          </div>

          <div className={styles.vocabularyListCard}>
            <p className={styles.vocabListTitle}>{t("lesson.wordsInLesson")}</p>
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
                    <span className={styles.vocabRowPolish}>{t(`meanings.${v.hanzi}`)}</span>
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