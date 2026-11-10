import React, { useMemo } from "react";
import { Trophy, Target, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { nodeById } from "../../data/path";
import { goalOptions, goalProgress } from "../../lib/activity";
import { evaluateAchievements, rankIndex, weeklyProgress } from "../../lib/achievements";
import PageBanner from "../../components/ui/PageBanner";
import styles from "./Goals.module.css";

const WEEKLY_COLORS = { minutes: "#4F7942", words: "#C83E34", lessons: "#2B6CB0", tones: "#3C8D93", writes: "#8A4F9E", reads: "#A07820" };
const RING = 2 * Math.PI * 44;

export default function GoalsScreen() {
  const { t } = useTranslation();
  const { state, setTarget } = useAppState();
  const level = nodeById(state.activeNodeId)?.level ?? 0;
  const options = goalOptions(level);
  const achievements = useMemo(
    () => evaluateAchievements(state) || [],
    [state]
  );

  const unlocked = achievements.filter((a) => a.unlocked).length;
  const rank = rankIndex(unlocked);
  const weekly = weeklyProgress(state) || [];
  const goal = goalProgress(state) || {
    percent: 0,
    learned: 0,
    needed: 0,
    weeks: null,
    target: 1
  };

  return (
    <div className={styles.container}>
      <PageBanner
        color="#D4A843"
        hanzi="志"
        kicker={t(`goals.rank.${rank}`)}
        title={t("goals.title")}
        subtitle={t("goals.subtitle")}
      >
        <div className={styles.bannerChip}>
          <Trophy size={20} strokeWidth={1.8} />
          <div>
            <p className={styles.bannerValue}>{unlocked}/{achievements.length}</p>
            <p className={styles.bannerLabel}>{t("goals.unlocked")}</p>
          </div>
        </div>
      </PageBanner>

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <Target size={18} strokeWidth={1.8} color="var(--primary)" />
            <h3 className={styles.cardTitle}>{t("goals.examGoal")}</h3>
          </div>
          <p className={styles.hint}>{t("goals.examHint", { level: Math.max(level, 0) })}</p>
          <div className={styles.options}>
            {options.map((o) => (
              <button
                key={o}
                type="button"
                className={`${styles.option} ${goal.target === o ? styles.optionActive : ""}`}
                onClick={() => setTarget(o)}
              >
                HSK {o}
              </button>
            ))}
          </div>
          <div className={styles.goalRow}>
            <div className={styles.ring}>
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" className={styles.ringTrack} />
                <circle cx="50" cy="50" r="44" className={styles.ringFill} strokeDasharray={`${(goal.percent / 100) * RING} ${RING}`} transform="rotate(-90 50 50)" />
              </svg>
              <span>{goal.percent}%</span>
            </div>
            <div>
              <p className={styles.goalWords}>{t("goals.words", { learned: goal.learned, needed: goal.needed })}</p>
              <p className={styles.hint}>
                {goal.weeks === null ? t("goals.etaUnknown") : goal.weeks === 0 ? t("goals.etaDone") : t("goals.eta", { weeks: goal.weeks })}
              </p>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h3 className={styles.cardTitle}>{t("goals.weeklyTitle")}</h3>
          </div>
          <div className={styles.weekly}>
            {weekly.map((w) => {
              const pct = Math.min(100, Math.round((w.value / w.target) * 100));
              const done = w.value >= w.target;
              return (
                <div key={w.id} className={styles.weeklyRow}>
                  <div className={styles.weeklyTop}>
                    <span className={styles.weeklyLabel}>{t(`goals.weekly.${w.id}`)}</span>
                    <span className={styles.weeklyValue} style={{ color: done ? "var(--accent)" : "var(--muted-foreground)" }}>
                      {Math.min(w.value, 9999)}/{w.target}
                    </span>
                  </div>
                  <div className={styles.track}>
                    <div className={styles.fill} style={{ width: `${pct}%`, background: WEEKLY_COLORS[w.id] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h3 className={styles.cardTitle}>{t("goals.achievements")}</h3>
          <span className={styles.hint}>{t("goals.unlockedOf", { count: unlocked, total: achievements.length })}</span>
        </div>
        <div className={styles.badges}>
          {achievements.map((a) => (
            <div key={a.id} className={`${styles.badge} ${a.unlocked ? "" : styles.badgeLocked}`} style={{ "--tone": a.color }}>
              <span className={styles.badgeSeal}>{a.unlocked ? a.hanzi : <Lock size={20} strokeWidth={1.8} />}</span>
              <p className={styles.badgeTitle}>{t(`achievements.${a.id}.title`)}</p>
              <p className={styles.badgeDesc}>{t(`achievements.${a.id}.desc`)}</p>
              {!a.unlocked && (
                <div className={styles.badgeProgress}>
                  <div className={styles.track}><div className={styles.fill} style={{ width: `${a.percent}%`, background: a.color }} /></div>
                  <span>{Math.min(a.value, a.goal)}/{a.goal}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}