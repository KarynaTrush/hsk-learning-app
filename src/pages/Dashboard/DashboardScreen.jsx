import React, { useEffect, useMemo, useState } from "react";
import { Flame, Check, SlidersHorizontal, Volume2, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DATE_LOCALES } from "../../i18n";
import { useAppState } from "../../state/AppState";
import { dueCards } from "../../lib/srs";
import { dateKey } from "../../lib/dates";
import { buildRecommendations } from "../../lib/recommender";
import { heatmap, minutesOn, sumMinutes, todayActivity } from "../../lib/activity";
import { speakZh, ttsSupported } from "../../lib/tts";
import { PATH_NODES, nodeById, nodeTitle } from "../../data/path";
import { vocabByNode } from "../../data/vocab";
import { GRAMMAR } from "../../data/grammar";
import { STORIES } from "../../data/stories";
import { phraseOfDay } from "../../data/phrases";
import PageBanner from "../../components/ui/PageBanner";
import PlanModal from "./PlanModal";
import styles from "./Dashboard.module.css";

const RING = 2 * Math.PI * 44;
const UNLOCK_ALL = import.meta.env.VITE_UNLOCK_ALL === "true";
const COLORS = { lesson: "#C83E34", review: "#D4A843", mistakes: "#C83E34", tones: "#3C8D93", writing: "#8A4F9E", grammar: "#4F7942", read: "#A07820" };
const ICONS = { review: "复", mistakes: "错", tones: "声", grammar: "法", read: "书" };

export default function DashboardScreen({ onOpenRecommendation, onStartLesson, onStartReview, onOpenTones, onOpenWriting }) {
  const { t, i18n } = useTranslation();
  const { state, setPlan, logRecommendations } = useAppState();
  const lang = i18n.resolvedLanguage || "ru";
  const [planOpen, setPlanOpen] = useState(false);

  const today = new Date().toLocaleDateString(DATE_LOCALES[lang] || "ru-RU", { weekday: "long", day: "numeric", month: "long" });
  const name = state.user?.name;
  const greeting = name ? t("home.greeting", { name, date: today }) : t("home.greetingNoName", { date: today });

  const node = nodeById(state.activeNodeId) || PATH_NODES[0];
  const nodeWords = node ? vocabByNode(node.id) : [];
  const dueCount = dueCards(state.words).length;
  const level = Math.max(1, node?.level ?? 1);
  const pick = (o) => o?.[lang] || o?.ru || "";

  const recs = useMemo(
    () =>
      buildRecommendations({
        skills: state.skills,
        toneScores: state.toneScores,
        writingStats: state.writingStats,
        grammarStats: state.grammarStats,
        readStories: state.readStories,
        dueCount,
        mistakesCount: (state.mistakes || []).length,
        completedCount: (state.completedNodeIds || []).length,
        nextNode: node,
        grammar: GRAMMAR,
        stories: STORIES,
        level,
        firstChar: nodeWords[0]?.hanzi?.[0] || null,
        unlockAll: UNLOCK_ALL,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.skills, state.toneScores, state.writingStats, state.grammarStats, state.readStories, state.mistakes, state.completedNodeIds, state.activeNodeId, dueCount]
  );

  useEffect(() => {
    if (!recs.length) return;
    const key = `xinna_rec_shown_${dateKey()}_${recs.slice(0, 4).map((r) => r.type + r.reason).join("-")}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    logRecommendations(recs.slice(0, 4), "shown");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recs]);

  function describe(rec) {
    const minutes = node ? Math.max(5, Math.round(nodeWords.length * 0.8 + (node.sentences?.length || 0) * 1.2 + (node.notes?.length || 0))) : 5;
    const toneName = rec.params.tone ? t(`toneLab.tone.${rec.params.tone}.name`) : "";
    const vars = {
      ...rec.params,
      lesson: node ? nodeTitle(node, lang) : "",
      skill: rec.params.skill ? t(`flow.skill.${rec.params.skill}`, { defaultValue: rec.params.skill }) : "",
      tone: toneName,
    };
    let title = t(`recommend.title.${rec.type}`, vars);
    let icon = ICONS[rec.type] || "字";
    const pills = [];
    if (rec.type === "lesson" && node) {
      title = nodeTitle(node, lang);
      icon = node.hanzi?.[0] || icon;
      pills.push(`HSK ${node.level}`, t("home.pill.words", { count: nodeWords.length }), t("home.pill.minutes", { count: minutes }));
    }
    if (rec.type === "review") pills.push(t("home.pill.cards", { count: rec.params.count }));
    if (rec.type === "mistakes") pills.push(t("home.pill.words", { count: rec.params.count }));
    if (rec.type === "writing") {
      icon = rec.params.char || icon;
      pills.push(t("home.pill.strokes"));
    }
    if (rec.type === "grammar") {
      const g = GRAMMAR.find((x) => x.id === rec.target.topicId);
      if (g) {
        title = pick(g.title);
        pills.push(`HSK ${g.level}`);
      }
    }
    if (rec.type === "read") {
      const s = STORIES.find((x) => x.id === rec.target.storyId);
      if (s) {
        title = s.titleKey ? t(s.titleKey) : pick(s.title);
        icon = s.titleZh[0];
        pills.push(`HSK ${s.hsk >= 4 ? "4+" : s.hsk}`, t("reading.min", { count: s.minutes }));
      }
    }
    return { title, icon, pills, color: COLORS[rec.type], reason: t(`recommend.reason.${rec.reason}`, vars), cta: t(`home.cta.${rec.type}`) };
  }

  const hero = recs[0] ? { rec: recs[0], ...describe(recs[0]) } : null;
  const others = recs.slice(1, 4).map((rec) => ({ rec, ...describe(rec) }));

  const plan = state.plan || {};
  const log = state.activityLog;
  const reviewsToday = todayActivity(log, "reviews");
  const reviewTarget = Math.min(plan.reviews || 0, reviewsToday + dueCount);
  const minutesToday = minutesOn(state.studyLog, dateKey());
  const tasks = [
    { id: "words", target: plan.newWords, value: todayActivity(log, "words"), label: t("home.task.words", { count: plan.newWords }), color: "var(--primary)", action: onStartLesson },
    plan.reviews > 0 && reviewTarget === 0
      ? { id: "reviews", target: 1, value: 1, label: t("home.task.nothing"), color: "#D4A843", action: onStartReview }
      : { id: "reviews", target: reviewTarget, value: reviewsToday, label: t("home.task.reviews", { count: plan.reviews }), color: "#D4A843", action: onStartReview },
    { id: "minutes", target: plan.minutes, value: minutesToday, label: t("home.task.minutes", { count: plan.minutes }), color: "var(--accent)", action: onStartLesson },
    { id: "tones", target: plan.tones, value: todayActivity(log, "tones"), label: t("home.task.tones", { count: plan.tones }), color: "#3C8D93", action: onOpenTones },
    { id: "writes", target: plan.writes, value: todayActivity(log, "writes"), label: t("home.task.writes", { count: plan.writes }), color: "#8A4F9E", action: onOpenWriting },
  ].filter((x) => x.target > 0);
  const doneCount = tasks.filter((x) => x.value >= x.target).length;

  const phrase = phraseOfDay();
  const cells = useMemo(() => heatmap(state.studyLog, state.activityLog, 5), [state.studyLog, state.activityLog]);
  const weekMinutes = sumMinutes(state.studyLog, 7);

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
            <circle cx="50" cy="50" r="44" className={styles.dayRingFill} strokeDasharray={`${tasks.length ? (doneCount / tasks.length) * RING : 0} ${RING}`} transform="rotate(-90 50 50)" />
          </svg>
          <span>{doneCount}/{tasks.length}</span>
        </div>
      </PageBanner>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          {hero && (
            <section className={styles.hero} style={{ "--tone": hero.color }}>
              <div className={styles.heroSeal}>
                <span>{hero.icon}</span>
              </div>
              <div className={styles.heroBody}>
                <p className={styles.heroKicker}>{t("home.heroKicker")}</p>
                <h3 className={styles.heroTitle}>{hero.title}</h3>
                <p className={styles.heroReason}>{hero.reason}</p>
                {hero.pills.length > 0 && (
                  <div className={styles.pills}>
                    {hero.pills.map((p) => (
                      <span key={p} className={styles.pill}>{p}</span>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" className={styles.heroCta} onClick={() => onOpenRecommendation(hero.rec)}>
                {hero.cta}
                <ArrowRight size={18} strokeWidth={2.2} />
              </button>
            </section>
          )}

          {others.length > 0 && (
            <>
              <p className={styles.sectionLabel}>{t("home.moreRecs")}</p>
              <div className={styles.recGrid}>
                {others.map((o) => (
                  <button key={o.rec.type} type="button" className={styles.recCard} style={{ "--tone": o.color }} onClick={() => onOpenRecommendation(o.rec)}>
                    <span className={styles.recSeal}>{o.icon}</span>
                    <span className={styles.recText}>
                      <span className={styles.recTitle}>{o.title}</span>
                      <span className={styles.recReason}>{o.reason}</span>
                    </span>
                    <ArrowRight size={16} strokeWidth={2.2} className={styles.recArrow} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className={styles.sideColumn}>
          <section className={styles.phraseCard}>
            <span className={styles.phraseWatermark}>言</span>
            <p className={styles.phraseLabel}>{t("home.phraseKicker")}</p>
            <div className={styles.phraseRow}>
              <h3 className={`${styles.phraseZh} ${phrase.zh.length > 6 ? styles.phraseZhLong : ""}`}>{phrase.zh}</h3>
              {ttsSupported() && (
                <button type="button" className={styles.phraseSpeak} onClick={() => speakZh(phrase.zh, 0.8)} aria-label="audio">
                  <Volume2 size={18} strokeWidth={1.8} />
                </button>
              )}
            </div>
            <p className={styles.phrasePy}>{phrase.py}</p>
            <p className={styles.phraseLiteral}>“{pick(phrase.literal)}”</p>
            <p className={styles.phraseMeaning}>{pick(phrase.meaning)}</p>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <p className={styles.sectionLabel}>{t("home.tasks.title")}</p>
              <button type="button" className={styles.planBtn} onClick={() => setPlanOpen(true)}>
                <SlidersHorizontal size={14} strokeWidth={2} />
                {t("home.tasks.plan")}
              </button>
            </div>
            <div className={styles.taskList}>
              {tasks.map((task) => {
                const done = task.value >= task.target;
                const pct = Math.min(100, Math.round((task.value / task.target) * 100));
                return (
                  <button key={task.id} type="button" className={`${styles.task} ${done ? styles.taskDone : ""}`} onClick={() => task.action && task.action()}>
                    <span className={styles.check} style={{ borderColor: task.color, background: done ? task.color : "transparent" }}>
                      {done && <Check size={12} color="#fff" strokeWidth={3.5} />}
                    </span>
                    <span className={styles.taskMain}>
                      <span className={styles.taskLabel}>{task.label}</span>
                      <span className={styles.taskTrack}><span style={{ width: `${pct}%`, background: task.color }} /></span>
                    </span>
                    <span className={styles.taskValue}>{Math.min(task.value, task.target)}/{task.target}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <p className={styles.sectionLabel}>{t("home.activity.title")}</p>
              <span className={styles.activityMeta}>{t("home.activity.week", { count: weekMinutes })}</span>
            </div>
            <div className={styles.heat}>
              {cells.map((col, w) => (
                <div key={w} className={styles.heatCol}>
                  {col.map((c) => (
                    <span key={c.key} title={`${c.key}: ${t("home.activity.minutes", { count: c.minutes })}`} className={`${styles.cell} ${c.future ? styles.cellFuture : styles[`lvl${c.level}`]}`} />
                  ))}
                </div>
              ))}
            </div>
            <div className={styles.heatLegend}>
              <span>{t("home.activity.less")}</span>
              {[0, 1, 2, 3, 4].map((l) => (
                <span key={l} className={`${styles.cell} ${styles[`lvl${l}`]}`} />
              ))}
              <span>{t("home.activity.more")}</span>
            </div>
          </section>
        </div>
      </div>

      {planOpen && (
        <PlanModal
          plan={plan}
          t={t}
          onClose={() => setPlanOpen(false)}
          onSave={(p) => {
            setPlan(p);
            setPlanOpen(false);
          }}
        />
      )}
    </div>
  );
}