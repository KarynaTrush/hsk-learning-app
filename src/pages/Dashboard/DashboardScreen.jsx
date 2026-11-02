import React from "react";
import { ChevronRight, BookOpen, Flame, AlertCircle, RefreshCw, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DATE_LOCALES } from "../../i18n";
import { useAppState } from "../../state/AppState";
import { dueCards } from "../../lib/srs";
import { nextLesson } from "../../lib/nextLesson";
import { PATH_NODES, nodeById, nodeTitle } from "../../data/path";
import { vocabByNode, vocabByHanzi, wordMeaning } from "../../data/vocab";
import PageBanner from "../../components/ui/PageBanner";
import styles from "./Dashboard.module.css";

const RING = 2 * Math.PI * 44;

function WordCard({ hanzi, pinyin, translation, variant }) {
  const isLong = hanzi.length > 2;
  const k = variant === "error" ? "err" : "preview";
  return (
    <div className={styles[`${k}WordCard`] || styles.errCard}>
      <div className={`${styles[`${k}IconBox`]} ${isLong ? styles[`${k}IconBoxLong`] : ""}`}>
        <span className={`${styles[`${k}Hanzi`]} ${isLong ? styles[`${k}HanziLong`] : ""}`}>{hanzi}</span>
      </div>
      <div className={styles[`${k}ContentBox`]}>
        <h4 className={`${styles[`${k}Pinyin`]} ${isLong ? styles[`${k}PinyinLong`] : ""}`}>{pinyin}</h4>
        {translation && <p className={styles[`${k}Translation`]}>{translation}</p>}
      </div>
    </div>
  );
}

export default function DashboardScreen({ onStartLesson, onStartReview, onOpenTones }) {
  const { t, i18n } = useTranslation();
  const { state } = useAppState();
  const lang = i18n.resolvedLanguage || "ru";
  const dateLocale = DATE_LOCALES[lang] || "ru-RU";
  const today = new Date().toLocaleDateString(dateLocale, { weekday: "long", day: "numeric", month: "long" });

  const node = nodeById(state.activeNodeId) || PATH_NODES[0];
  const words = node ? vocabByNode(node.id) : [];
  const learned = words.filter((w) => state.words?.[w.hanzi]).length;
  const pct = words.length ? Math.round((learned / words.length) * 100) : 0;
  const dueCount = dueCards(state.words).length;
  const rec = nextLesson({ completedCount: state.completedNodeIds?.length || 0, dueCount, skills: state.skills });
  const lessonName = node ? nodeTitle(node, lang) : "";
  const minutes = node ? Math.max(5, Math.round(words.length * 0.8 + (node.sentences?.length || 0) * 1.2 + (node.notes?.length || 0))) : 5;

  const name = state.user?.name;
  const greeting = name ? t("home.greeting", { name, date: today }) : t("home.greetingNoName", { date: today });

  const daily = state.daily || {};
  const todos = [
    { id: "lesson", label: t("dashboard.todoLesson"), time: t("dashboard.todoLessonTime"), done: Boolean(daily.lesson), color: "var(--primary)", action: onStartLesson },
    { id: "srs", label: t("dashboard.todoSrs"), time: t("home.cardsCount", { count: dueCount }), done: Boolean(daily.srs), color: "#D4A843", action: onStartReview },
    { id: "tones", label: t("dashboard.todoTones"), time: t("dashboard.todoTonesTime"), done: Boolean(daily.tones), color: "var(--accent)", action: onOpenTones },
  ];
  const doneCount = todos.filter((x) => x.done).length;

  const errorItems = [...(state.mistakes || [])]
    .sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0))
    .map((m) => vocabByHanzi(m.hanzi))
    .filter(Boolean);

  const reasonVars = {
    lesson: lessonName,
    count: rec.count,
    skill: rec.skill ? t(`flow.skill.${rec.skill}`, { defaultValue: rec.skill }) : "",
    percent: rec.percent,
  };

  return (
    <div className={styles.container}>
      <PageBanner color="#C83E34" hanzi="主" kicker={greeting} title={t("dashboard.title")} subtitle={t("home.subtitle")}>
        <div className={styles.bannerChip}>
          <Flame size={20} strokeWidth={1.8} />
          <div>
            <p className={styles.bannerChipValue}>{state.streak?.count || 0}</p>
            <p className={styles.bannerChipLabel}>{t("dashboard.streak")}</p>
          </div>
        </div>
        <div className={styles.dayRing}>
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" className={styles.dayRingTrack} />
            <circle
              cx="50"
              cy="50"
              r="44"
              className={styles.dayRingFill}
              strokeDasharray={`${(doneCount / 3) * RING} ${RING}`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <span>{doneCount}/3</span>
        </div>
      </PageBanner>

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
                  {dueCount > 0 && <span className={styles.lectureTagUrgent}>{t("home.tagDue", { count: dueCount })}</span>}
                  {node && <span className={styles.lectureTagMatch}>{t("home.tagLevel", { level: node.level })}</span>}
                </div>

                <div className={styles.lessonMainInfo}>
                  <div className={styles.lessonHanziIcon}>
                    <span className={styles.lessonHanziText}>{node?.hanzi?.[0] || "字"}</span>
                  </div>
                  <div className="flex-1">
                    <p className={styles.lessonMetaText}>{t("home.lessonInfo", { words: words.length, minutes })}</p>
                    <h3 className={styles.lessonTitle}>{lessonName}</h3>
                  </div>
                </div>

                <div className={styles.reasonCallout}>
                  <p className={styles.reasonMeta}>{t("dashboard.srsAnalysis")}</p>
                  <p className={styles.reasonText}>{t(`home.reason.${rec.reason}`, reasonVars)}</p>
                </div>

                {words.length > 0 && (
                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <span className={styles.progressLabel}>{t("dashboard.progressLabel")}</span>
                      <span className={styles.progressCount}>{t("home.progressWords", { done: learned, words: words.length })}</span>
                    </div>
                    <div className={styles.progressBarContainer}>
                      <div className={styles.progressBar} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}

                {words.length > 0 && (
                  <div className={styles.previewWordsGrid}>
                    {words.slice(0, 4).map((w) => (
                      <WordCard key={w.hanzi} variant="preview" hanzi={w.hanzi} pinyin={w.pinyin} translation={wordMeaning(w, lang)} />
                    ))}
                    {words.length > 4 && (
                      <div className={styles.moreWordsRow}>
                        <span className={styles.moreWordsText}>{t("home.moreWords", { count: words.length - 4 })}</span>
                      </div>
                    )}
                  </div>
                )}

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
            <p className={styles.quoteTranslation}>{t("dashboard.quoteTranslation")}</p>
          </div>

          <div className={styles.todoCard}>
            <p className={styles.todoTitle}>{t("dashboard.todoTitle")}</p>
            <div className={styles.todoList}>
              {todos.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.todoItem} ${item.done ? styles.todoItemDone : ""}`}
                  onClick={() => item.action && item.action()}
                >
                  <div
                    className={styles.todoCheckbox}
                    style={{ border: `1.5px solid ${item.color}`, backgroundColor: item.done ? item.color : "transparent" }}
                  >
                    {item.done && <Check size={12} color="white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1">
                    <p className={styles.todoLabel}>{item.label}</p>
                  </div>
                  <span className={styles.todoTime}>{item.time}</span>
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
                <span className={styles.errorsBadgeText}>{errorItems.length}</span>
              </div>
            </div>

            <div className={styles.errorsScrollContainer}>
              {errorItems.length === 0 && <p className={styles.emptyText}>{t("home.noErrors")}</p>}
              {errorItems.slice(0, 12).map((w) => (
                <WordCard key={w.hanzi} variant="error" hanzi={w.hanzi} pinyin={w.pinyin} translation={wordMeaning(w, lang)} />
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