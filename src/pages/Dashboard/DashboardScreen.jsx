import React, { useState } from "react";
import { ChevronRight, BookOpen, Flame, AlertCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DATE_LOCALES } from "../../i18n";
import styles from "./Dashboard.module.css";

const previewWords = [
  { hanzi: "吃货", pinyin: "chīhuò" },
  { hanzi: "美食", pinyin: "měishí" },
  { hanzi: "火锅", pinyin: "huǒguō" },
  { hanzi: "零食", pinyin: "língshí" },
  { hanzi: "外卖", pinyin: "wàimài" },
  { hanzi: "夜宵", pinyin: "yèxiāo" },
  { hanzi: "爆米花", pinyin: "bàomǐhuā" },
  { hanzi: "垃圾食品", pinyin: "lājī shípǐn" },
  { hanzi: "招牌菜", pinyin: "zhāopáicài" },
  { hanzi: "重口味", pinyin: "zhòngkǒuwèi" },
  { hanzi: "开胃菜", pinyin: "kāiwèicài" },
  { hanzi: "甜點", pinyin: "tiándiǎn" },
];

const errorWords = [
  { hanzi: "矛盾", pinyin: "máodùn" },
  { hanzi: "马虎", pinyin: "mǎhu" },
  { hanzi: "吃醋", pinyin: "chīcù" },
  { hanzi: "凡尔赛", pinyin: "fán'ěrsài" },
  { hanzi: "摸鱼", pinyin: "mōyú" },
  { hanzi: "顺其自然", pinyin: "shùnqí zìrán" },
  { hanzi: "不可思议", pinyin: "bùkě sīyì" },
  { hanzi: "八卦", pinyin: "bāguà" },
  { hanzi: "内卷", pinyin: "nèijuǎn" },
  { hanzi: "躺平", pinyin: "tǎngpíng" },
  { hanzi: "洗脑", pinyin: "xǐnǎo" },
  { hanzi: "吐槽", pinyin: "tùcáo" },
];

// Кастомная карточка для слов посередине лекции (иероглифы строго по центру)
function DashboardPreviewCard({ hanzi, pinyin, translation }) {
  const isLong = hanzi.length > 2;
  return (
    <div className={styles.previewWordCard}>
      <div className={`${styles.previewIconBox} ${isLong ? styles.previewIconBoxLong : ""}`}>
        <span className={`${styles.previewHanzi} ${isLong ? styles.previewHanziLong : ""}`}>{hanzi}</span>
      </div>
      <div className={styles.previewContentBox}>
        <h4 className={`${styles.previewPinyin} ${isLong ? styles.previewPinyinLong : ""}`}>{pinyin}</h4>
        {translation && <p className={styles.previewTranslation}>{translation}</p>}
      </div>
    </div>
  );
}

// Кастомная карточка для ошибок в сайдбаре
function DashboardErrorCard({ hanzi, pinyin, translation }) {
  const isLong = hanzi.length > 2;
  return (
    <div className={styles.errCard}>
      <div className={`${styles.errIconBox} ${isLong ? styles.errIconBoxLong : ""}`}>
        <span className={`${styles.errHanzi} ${isLong ? styles.errHanziLong : ""}`}>{hanzi}</span>
      </div>
      <div className={styles.errContentBox}>
        <h4 className={`${styles.errPinyin} ${isLong ? styles.errPinyinLong : ""}`}>{pinyin}</h4>
        {translation && <p className={styles.errTranslation}>{translation}</p>}
      </div>
    </div>
  );
}

export default function DashboardScreen({ onStartLesson, onStartReview }) {
  const { t, i18n } = useTranslation();
  const dateLocale = DATE_LOCALES[i18n.resolvedLanguage] || DATE_LOCALES[i18n.language] || "pl-PL";
  const today = new Date().toLocaleDateString(dateLocale, { weekday: "long", day: "numeric", month: "long" });

  const [todos, setTodos] = useState([
    { id: 1, labelKey: "dashboard.todoLesson", timeKey: "dashboard.todoLessonTime", done: false, color: "var(--primary)" },
    { id: 2, labelKey: "dashboard.todoSrs", timeKey: "dashboard.todoSrsTime", done: false, color: "#D4A843" },
    { id: 3, labelKey: "dashboard.todoTones", timeKey: "dashboard.todoTonesTime", done: false, color: "var(--accent)" },
  ]);

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <p className={styles.welcomeText}>
            {t("dashboard.goodDay", { date: today })}
          </p>
          <h2 className={styles.title}>{t("dashboard.title")}</h2>
        </div>
        <div className={styles.streakBadge}>
          <Flame size={20} color="#D4A843" strokeWidth={1.8} />
          <div>
            <p className={styles.streakNumber}>5</p>
            <p className={styles.streakLabel}>{t("dashboard.streak")}</p>
          </div>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        
        <div className={styles.mainColumn}>
          <div className={styles.lessonSectionWrapper}>
            <div className="flex items-center justify-between mb-3">
              <span className={styles.recommendationLabel}>{t("dashboard.dedicatedLesson")}</span>
              <div className={styles.aiLiveBadge}>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                <span className={styles.aiLiveText}>{t("dashboard.aiLive")}</span>
              </div>
            </div>

            <div className={styles.lessonCard}>
              <div className={styles.lessonCardLine} />
              <div className={styles.lessonCardContent}>
                
                <div className={styles.lectureTagsRow}>
                  <span className={styles.lectureTagUrgent}>{t("dashboard.needsReview")}</span>
                  <span className={styles.lectureTagMatch}>{t("dashboard.match")}</span>
                </div>

                <div className={styles.lessonMainInfo}>
                  <div className={styles.lessonHanziIcon}>
                    <span className={styles.lessonHanziText}>食</span>
                  </div>
                  <div className="flex-1">
                    <p className={styles.lessonMetaText}>{t("dashboard.vocabMeta")}</p>
                    <h3 className={styles.lessonTitle}>{t("dashboard.lessonTitle")}</h3>
                    <p className={styles.lessonDuration}>{t("dashboard.lessonDuration")}</p>
                  </div>
                </div>

                <div className={styles.reasonCallout}>
                  <p className={styles.reasonMeta}>{t("dashboard.srsAnalysis")}</p>
                  <p className={styles.reasonText}>
                    {t("dashboard.reasonBefore")} <span className="text-[var(--accent)] font-semibold">{t("dashboard.reasonHighlight1")}</span>{t("dashboard.reasonMid")} <span className="text-[var(--primary)] font-semibold">{t("dashboard.reasonHighlight2")}</span>{t("dashboard.reasonAfter")}
                  </p>
                </div>

                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>{t("dashboard.progressLabel")}</span>
                    <span className={styles.progressCount}>{t("dashboard.progressCount")}</span>
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div className={styles.progressBar} style={{ width: "58%" }} />
                  </div>
                </div>

                {/* Ограничиваем сетку только 4 словами на главном экране */}
                <div className={styles.previewWordsGrid}>
                  {previewWords.slice(0, 4).map((word) => (
                    <DashboardPreviewCard
                      key={word.hanzi}
                      hanzi={word.hanzi}
                      pinyin={word.pinyin}
                      translation={t(`meanings.${word.hanzi}`)}
                    />
                  ))}
                  <div className={styles.moreWordsRow}>
                    <span className={styles.moreWordsText}>{t("dashboard.moreWords")}</span>
                  </div>
                </div>

                <button onClick={onStartLesson} className={styles.startButton}>
                  <BookOpen size={18} strokeWidth={1.8} />
                  <span>{t("dashboard.startLearning")}</span>
                  <ChevronRight size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.quoteCard}>
            <p className={styles.quoteTitle}>{t("dashboard.quoteTitle")}</p>
            <p className={styles.quoteHanzi}>学如逆水行舟，不进则退。</p>
            <p className={styles.quoteTranslation}>
              {t("dashboard.quoteTranslation")}
            </p>
          </div>

          <div className={styles.todoCard}>
            <p className={styles.todoTitle}>{t("dashboard.todoTitle")}</p>
            <div className={styles.todoList}>
              {todos.map((item) => (
                <div 
                  key={item.id} 
                  className={`${styles.todoItem} ${item.done ? styles.todoItemDone : ""}`}
                  onClick={() => toggleTodo(item.id)}
                >
                  <div
                    className={styles.todoCheckbox}
                    style={{ 
                      border: `1.5px solid ${item.color}`, 
                      backgroundColor: item.done ? item.color : "transparent" 
                    }}
                  >
                    {item.done && <span className={styles.todoCheckboxMark}>✓</span>}
                  </div>
                  <div className="flex-1">
                    <p className={styles.todoLabel}>{t(item.labelKey)}</p>
                  </div>
                  <span className={styles.todoTime}>{t(item.timeKey)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.errorsCard}>
            <div className={styles.errorsHeader}>
              <div className="flex items-center gap-2">
                <AlertCircle size={16} color="var(--primary)" strokeWidth={1.8} />
                <p className={styles.errorsTitle}>{t("dashboard.errorsTitle")}</p>
              </div>
              <div className={styles.errorsBadge}>
                <span className={styles.errorsBadgeText}>23</span>
              </div>
            </div>
            
            <div className={styles.errorsScrollContainer}>
              {errorWords.map((word) => (
                <DashboardErrorCard
                  key={word.hanzi}
                  hanzi={word.hanzi}
                  pinyin={word.pinyin}
                  translation={t(`meanings.${word.hanzi}`)}
                />
              ))}
            </div>

            <button onClick={onStartReview} className={styles.reviewAllButton}>
              <RefreshCw size={13} strokeWidth={2} />
              <span>{t("dashboard.reviewWords")}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}