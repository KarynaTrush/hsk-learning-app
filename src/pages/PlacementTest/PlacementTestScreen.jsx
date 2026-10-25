import { useState } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./PlacementTest.module.css";

const questions = [
  {
    hanzi: "吃", pinyin: "chī", questionKey: "placement.qChar",
    options: [
      { pinyin: "chī", meaningKey: "吃" },
      { pinyin: "hē", meaningKey: "喝" },
      { pinyin: "zuò", meaningKey: "坐" },
      { pinyin: "zǒu", meaningKey: "走" },
    ],
    correct: 0,
  },
  {
    hanzi: "美", pinyin: "měi", questionKey: "placement.qChar",
    options: [
      { pinyin: "hǎo", meaningKey: "好" },
      { pinyin: "měi", meaningKey: "美" },
      { pinyin: "dà", meaningKey: "大" },
      { pinyin: "xiǎo", meaningKey: "小" },
    ],
    correct: 1,
  },
  {
    hanzi: "朋友", pinyin: "péngyou", questionKey: "placement.qWord",
    options: [
      { pinyin: "jiārén", meaningKey: "家人" },
      { pinyin: "lǎoshī", meaningKey: "老师" },
      { pinyin: "péngyou", meaningKey: "朋友" },
      { pinyin: "tóngxué", meaningKey: "同学" },
    ],
    correct: 2,
  },
];

export default function PlacementTestScreen({ onComplete }) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const q = questions[current];
  const progress = (current / questions.length) * 100;

  function handleConfirm() {
    if (selected === null) return;
    setConfirmed(true);
    setTimeout(() => {
      if (current < questions.length - 1) { 
        setCurrent((c) => c + 1); 
        setSelected(null); 
        setConfirmed(false); 
      } else {
        onComplete();
      }
    }, 700);
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.bgCharacter}>
          <span>{q.hanzi[0]}</span>
        </div>

        <div className={styles.leftHeader}>
          <div className="flex items-center gap-3 mb-12">
            <div className={styles.logoBox}>
              <span className={styles.logoHanzi}>漢</span>
            </div>
            <div>
              <p className={styles.logoTitle}>漢語學習</p>
              <p className={styles.logoSubtitle}>{t("placement.title")}</p>
            </div>
          </div>

          <h2 className={styles.mainHeading}>
            {t("placement.heading")}<br />
            <span className={styles.headingAccent}>{t("placement.headingAccent")}</span>
          </h2>
          <p className={styles.description}>
            {t("placement.description")}
          </p>
        </div>

        <div className={styles.progressSection}>
          <p className={styles.progressLabel}>{t("placement.progress")}</p>
          <div className={styles.progressBarTrack}>
            <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
          </div>
          <p className={styles.progressText}>
            {t("placement.questionOf", { current: current + 1, total: questions.length })}
          </p>
        </div>
      </div>
      <div className={styles.rightContent}>
        <div className={styles.formWrapper}>
          <div className={styles.mobileProgressSection}>
            <div className={styles.mobileProgressHeader}>
              <span className={styles.mobileProgressText}>
                {t("placement.questionOf", { current: current + 1, total: questions.length })}
              </span>
            </div>
            <div className={styles.mobileTrack}>
              <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
            </div>
          </div>

          <p className={styles.questionMeta}>{t(q.questionKey)}</p>
          
          <div className={styles.promptCard}>
            <span className={styles.hanziText}>{q.hanzi}</span>
            <span className={styles.pinyinText}>{q.pinyin}</span>
          </div>

          <div className={styles.optionsGrid}>
            {q.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect  = confirmed && i === q.correct;
              const isWrong    = confirmed && isSelected && i !== q.correct;

              return (
                <button
                  key={i}
                  onClick={() => !confirmed && setSelected(i)}
                  className={styles.optionButton}
                  style={{
                    backgroundColor: isCorrect ? "rgba(79,121,66,0.07)" : isWrong ? "rgba(200,62,52,0.05)" : isSelected ? "rgba(200,62,52,0.04)" : "var(--card)",
                    borderColor: isCorrect ? "var(--accent)" : isWrong ? "var(--primary)" : isSelected ? "var(--primary)" : "var(--border)",
                    boxShadow: isSelected && !confirmed ? "0 0 0 2px rgba(200,62,52,0.15)" : "none",
                  }}
                >
                  <div
                    className={styles.radioIndicator}
                    style={{
                      borderColor: isCorrect ? "var(--accent)" : isSelected ? "var(--primary)" : "var(--border)",
                      backgroundColor: isCorrect ? "var(--accent)" : isSelected && !confirmed ? "var(--primary)" : "transparent",
                    }}
                  >
                    {isCorrect ? (
                      <Check size={14} color="white" strokeWidth={2.5} />
                    ) : (
                      <span 
                        className={styles.radioLabel}
                        style={{ color: isSelected && !confirmed ? "white" : "var(--muted-foreground)" }}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                    )}
                  </div>
                  <div>
                    <span 
                      className={styles.optPinyin}
                      style={{ 
                        color: isSelected || isCorrect ? "var(--foreground)" : "var(--muted-foreground)", 
                        fontWeight: isSelected ? 500 : 400 
                      }}
                    >
                      {opt.pinyin}
                    </span>
                    <span className={styles.optPolish}>{t(`meanings.${opt.meaningKey}`)}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <button
            onClick={handleConfirm}
            disabled={selected === null}
            className={`disabled:cursor-not-allowed ${styles.submitButton}`}
            style={{
              backgroundColor: selected !== null ? "var(--primary)" : "var(--muted)",
              color: selected !== null ? "var(--primary-foreground)" : "var(--muted-foreground)",
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              boxShadow: selected !== null ? "0 3px 16px rgba(200,62,52,0.25)" : "none",
              opacity: selected !== null ? 1 : 0.6,
            }}
          >
            {t("placement.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}