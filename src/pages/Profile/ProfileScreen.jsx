import React, { useMemo, useState } from "react";
import { ChevronRight, AlertCircle, RefreshCw, TrendingUp, Target, FileText, Flame, BookOpen } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { dueCards } from "../../lib/srs";
import { DATE_LOCALES } from "../../i18n";
import { hskData, profileMock } from "../../data/profileMock";
import styles from "./Profile.module.css";

export default function ProfileScreen({ onMenuSelect }) {
  const { t, i18n } = useTranslation();
  const { state } = useAppState();
  const [activeHsk, setActiveHsk] = useState(state.hskLevel || 1);

  const locale = DATE_LOCALES[i18n.resolvedLanguage] || "ru-RU";

  // Всё, что про пользователя, берётся из state.user (позже это будут данные из базы).
  const name = state.user?.name || "";
  const wordsCount = Object.keys(state.words || {}).length;
  const lessonsCount = state.completedNodeIds?.length || 0;
  const mistakesCount = state.mistakes?.length || 0;
  const dueCount = dueCards(state.words).length;
  const streak = state.streak?.count || 0;
  const since = state.startedAt
    ? new Date(state.startedAt).toLocaleDateString(locale, { month: "long", year: "numeric" })
    : null;

  const { exam, accuracy, studyHoursThisWeek, grammarCount, goalsCount, wordsHistory } = profileMock;
  const accuracyData = [{ name: "accuracy", value: accuracy, fill: "#4F7942" }];

  const dynamics = useMemo(
    () =>
      wordsHistory.map((v, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (wordsHistory.length - 1 - i));
        return { m: d.toLocaleDateString(locale, { month: "short" }), v };
      }),
    [locale, wordsHistory]
  );

  const actions = [
    { key: "errors", icon: <AlertCircle size={20} color="var(--primary)" strokeWidth={1.5} />, iconBg: "rgba(200,62,52,0.08)", label: t("profile.errors"), sublabel: t("profile.errorsSub"), badge: mistakesCount, badgeColor: "var(--primary)", badgeBg: "rgba(200,62,52,0.1)" },
    { key: "srs", icon: <RefreshCw size={20} color="#D4A843" strokeWidth={1.5} />, iconBg: "rgba(212,168,67,0.1)", label: t("profile.reviews"), sublabel: t("profile.reviewsSub"), badge: dueCount, badgeColor: "#A07820", badgeBg: "rgba(212,168,67,0.1)" },
    { key: "grammar", icon: <FileText size={20} color="var(--accent)" strokeWidth={1.5} />, iconBg: "rgba(79,121,66,0.1)", label: t("profile.grammar"), sublabel: t("profile.grammarSub"), badge: grammarCount, badgeColor: "var(--accent)", badgeBg: "rgba(79,121,66,0.1)" },
    { key: "goals", icon: <Target size={20} color="#6B8CAE" strokeWidth={1.5} />, iconBg: "rgba(107,140,174,0.1)", label: t("profile.goals"), sublabel: t("profile.goalsSub"), badge: goalsCount, badgeColor: "#4A6A8A", badgeBg: "rgba(107,140,174,0.1)" },
  ];

  return (
    <div className={styles.container}>
      {/* 1. Шапка + прогноз экзамена */}
      <div className={styles.topGrid}>
        <div className={styles.profileCard}>
          <div className={styles.avatarBox}>
            <span className={styles.avatarText}>安</span>
          </div>
          <div>
            <div className={styles.nameRow}>
              <h2 className={styles.profileName}>{name}</h2>
              <span className={styles.levelPill}>HSK {state.hskLevel} → HSK {state.targetHsk}</span>
            </div>
            {since && <p className={styles.profileMetaText}>{t("profile.since", { date: since })}</p>}
            <div className={styles.chipsRow}>
              <div className={styles.chipStreak}>
                <Flame size={14} strokeWidth={1.8} />
                <span>{t("profile.streakDays", { count: streak })}</span>
              </div>
              <div className={styles.chipWords}>
                <BookOpen size={14} strokeWidth={1.8} />
                <span>{t("profile.wordsLearned", { count: wordsCount })}</span>
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <button className={styles.editButton}>{t("profile.edit")}</button>
          </div>
        </div>

        <div className={styles.examForecastCard}>
          <div className={styles.examMeta}>
            <TrendingUp size={16} color="var(--primary)" strokeWidth={1.8} />
            <span className={styles.examMetaText}>{t("profile.examDate")}</span>
          </div>
          <div>
            <p className={styles.examLevel}>HSK {state.targetHsk}</p>
            <p className={styles.examDate}>{exam.date}</p>
          </div>
          <div className="mt-4">
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>{t("profile.readiness")}</span>
              <span className={styles.progressValue}>{exam.readiness}%</span>
            </div>
            <div className={styles.progressBarTrack}>
              <div className={styles.progressBarFill} style={{ width: `${exam.readiness}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Быстрые действия */}
      <div className={styles.actionsRow}>
        {actions.map((a) => (
          <button key={a.key} onClick={() => onMenuSelect(a.key)} className={styles.actionTile}>
            <div className={styles.menuIconBox} style={{ backgroundColor: a.iconBg }}>{a.icon}</div>
            <div className="flex-1 min-w-0">
              <p className={styles.menuLabel}>{a.label}</p>
              <p className={styles.menuSublabel}>{a.sublabel}</p>
            </div>
            <div className={styles.menuBadgeBox}>
              <div className={styles.menuBadge} style={{ backgroundColor: a.badgeBg, border: `1px solid ${a.badgeColor}30` }}>
                <span className={styles.menuBadgeText} style={{ color: a.badgeColor }}>{a.badge}</span>
              </div>
              <ChevronRight size={16} color="var(--muted-foreground)" strokeWidth={1.5} />
            </div>
          </button>
        ))}
      </div>

      {/* 3. Статистика */}
      <div className={styles.statsRow}>
        <div className={styles.numericStatCard}>
          <p className={styles.statMetaTitle}>{t("profile.words")}</p>
          <p className={styles.miniStatNumber}>{wordsCount}</p>
        </div>
        <div className={styles.numericStatCard}>
          <p className={styles.statMetaTitle}>{t("profile.lessons")}</p>
          <p className={styles.miniStatNumber}>{lessonsCount}</p>
        </div>
        <div className={styles.numericStatCard}>
          <p className={styles.statMetaTitle}>{t("profile.accuracy")}</p>
          <div className={styles.statValueRow}>
            <div>
              <p className={styles.bigStatNumber} style={{ color: "var(--accent)" }}>{accuracy}%</p>
              <p className={styles.statSubLabel}>{t("profile.average")}</p>
            </div>
            <div style={{ width: 64, height: 64 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius={22} outerRadius={31} startAngle={90} endAngle={90 - (accuracy / 100) * 360} data={accuracyData}>
                  <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "var(--muted)" }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className={styles.numericStatCard}>
          <p className={styles.statMetaTitle}>{t("profile.studyTime")}</p>
          <p className={styles.bigStatNumber} style={{ color: "#D4A843" }}>{studyHoursThisWeek}h</p>
          <p className={styles.statSubLabel}>{t("profile.thisWeek")}</p>
        </div>
      </div>

      {/* 4. Полосы по категориям + динамика */}
      <div className={styles.bottomGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeaderColumn}>
            <p className={styles.chartTitle}>{t("profile.progressByCategory")}</p>
            <div className={styles.hskTabsWrapper}>
              {[1, 2, 3, 4, 5, 6, "7-9"].map((level) => (
                <button
                  key={level}
                  onClick={() => setActiveHsk(level)}
                  className={`${styles.hskTabButton} ${activeHsk === level ? styles.hskTabActive : ""}`}
                >
                  HSK {level}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.scrollContainer}>
            {hskData[activeHsk].map((item) => (
              <div key={item.key} className={styles.categoryRow}>
                <span className={styles.categoryLabel}>{t(`categories.${item.key}`)}</span>
                <div className={styles.categoryBarTrack}>
                  <div className={styles.categoryBarFill} style={{ width: `${item.pct}%`, backgroundColor: item.color, transition: "width 0.3s ease" }} />
                </div>
                <span className={styles.categoryPercent}>{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartCard}>
          <p className={styles.chartTitleStrong}>{t("profile.dynamics")}</p>
          <p className={styles.chartSub}>{t("profile.dynamicsSub")}</p>
          <div className={styles.lineChartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dynamics} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,110,100,0.18)" />
                <XAxis dataKey="m" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="v" stroke="#C83E34" strokeWidth={2.5} dot={{ r: 4, fill: "#C83E34" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}