import React, { useMemo, useState } from "react";
import { ChevronRight, AlertCircle, RefreshCw, Target, FileText, Flame, BookOpen } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { dueCards } from "../../lib/srs";
import { dateKey } from "../../lib/dates";
import { DATE_LOCALES } from "../../i18n";
import { PATH_NODES, nodeTitle } from "../../data/path";
import { vocabByNode } from "../../data/vocab";
import { GRAMMAR } from "../../data/grammar";
import { profileMock } from "../../data/profileMock";
import PageBanner from "../../components/ui/PageBanner";
import styles from "./Profile.module.css";

function weekSeconds(log) {
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    total += log?.[dateKey(d)] || 0;
  }
  return total;
}

function monthlySeries(log, current, locale) {
  const keys = Object.keys(log || {}).sort();
  const out = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const endKey = dateKey(end);
    let value = 0;
    for (const k of keys) {
      if (k <= endKey) value = log[k];
      else break;
    }
    if (i === 0) value = current;
    out.push({ m: end.toLocaleDateString(locale, { month: "short" }), v: value });
  }
  return out;
}

function barColor(pct) {
  if (pct >= 70) return "var(--accent)";
  if (pct >= 40) return "#D4A843";
  return "var(--primary)";
}

export default function ProfileScreen({ onMenuSelect }) {
  const { t, i18n } = useTranslation();
  const { state } = useAppState();
  const [activeHsk, setActiveHsk] = useState(Math.min(Math.max(state.hskLevel || 1, 1), 6));

  const lang = i18n.resolvedLanguage || "ru";
  const locale = DATE_LOCALES[lang] || "ru-RU";

  const user = state.user || {};
  const fullName = [user.name, user.surname].filter(Boolean).join(" ") || t("account.guest");
  const wordsCount = Object.keys(state.words || {}).length;
  const lessonsCount = state.completedNodeIds?.length || 0;
  const mistakesCount = state.mistakes?.length || 0;
  const dueCount = dueCards(state.words).length;
  const streak = state.streak?.count || 0;
  const since = state.startedAt
    ? new Date(state.startedAt).toLocaleDateString(locale, { month: "long", year: "numeric" })
    : null;

  const answers = state.stats?.answers || 0;
  const accuracy = answers ? Math.round((state.stats.correct / answers) * 100) : null;
  const seconds = weekSeconds(state.studyLog);
  const studyTime = seconds < 3600 ? t("profile.min", { count: Math.round(seconds / 60) }) : `${(seconds / 3600).toFixed(1)}h`;
  const accuracyData = [{ name: "accuracy", value: accuracy || 0, fill: "#4F7942" }];

  const dynamics = useMemo(() => monthlySeries(state.wordsLog, wordsCount, locale), [state.wordsLog, wordsCount, locale]);

  const categoryRows = useMemo(
    () =>
      PATH_NODES.filter((n) => n.level === activeHsk).map((n) => {
        const lessonWords = vocabByNode(n.id);
        const learned = lessonWords.filter((w) => state.words?.[w.hanzi]).length;
        const pct = lessonWords.length ? Math.round((learned / lessonWords.length) * 100) : 0;
        return { id: n.id, label: nodeTitle(n, lang), pct };
      }),
    [activeHsk, state.words, lang]
  );

  const actions = [
    { key: "errors", icon: <AlertCircle size={20} color="var(--primary)" strokeWidth={1.5} />, iconBg: "rgba(200,62,52,0.08)", label: t("profile.errors"), sublabel: t("profile.errorsSub"), badge: mistakesCount, badgeColor: "var(--primary)", badgeBg: "rgba(200,62,52,0.1)" },
    { key: "srs", icon: <RefreshCw size={20} color="#D4A843" strokeWidth={1.5} />, iconBg: "rgba(212,168,67,0.1)", label: t("profile.reviews"), sublabel: t("profile.reviewsSub"), badge: dueCount, badgeColor: "#A07820", badgeBg: "rgba(212,168,67,0.1)" },
    { key: "grammar", icon: <FileText size={20} color="var(--accent)" strokeWidth={1.5} />, iconBg: "rgba(79,121,66,0.1)", label: t("profile.grammar"), sublabel: t("profile.grammarSub"), badge: GRAMMAR.length, badgeColor: "var(--accent)", badgeBg: "rgba(79,121,66,0.1)" },
    { key: "goals", icon: <Target size={20} color="#6B8CAE" strokeWidth={1.5} />, iconBg: "rgba(107,140,174,0.1)", label: t("profile.goals"), sublabel: t("profile.goalsSub"), badge: profileMock.goalsCount, badgeColor: "#4A6A8A", badgeBg: "rgba(107,140,174,0.1)" },
  ];

  const avatar = user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <span>{user.name ? user.name[0].toUpperCase() : "安"}</span>;

  return (
    <div className={styles.container}>
      <PageBanner
        color="#4A6FA5"
        leading={avatar}
        kicker={`HSK ${state.hskLevel} → HSK ${state.targetHsk}`}
        title={fullName}
        subtitle={since ? t("profile.since", { date: since }) : undefined}
      >
        <span className={styles.bannerChip}>
          <Flame size={15} strokeWidth={2} />
          {t("profile.streakDays", { count: streak })}
        </span>
        <span className={styles.bannerChip}>
          <BookOpen size={15} strokeWidth={2} />
          {t("profile.wordsLearned", { count: wordsCount })}
        </span>
      </PageBanner>

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
              <p className={styles.bigStatNumber} style={{ color: "var(--accent)" }}>{accuracy === null ? "—" : `${accuracy}%`}</p>
              <p className={styles.statSubLabel}>{t("profile.average")}</p>
            </div>
            <div style={{ width: 64, height: 64 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius={22} outerRadius={31} startAngle={90} endAngle={90 - ((accuracy || 0) / 100) * 360} data={accuracyData}>
                  <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "var(--muted)" }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className={styles.numericStatCard}>
          <p className={styles.statMetaTitle}>{t("profile.studyTime")}</p>
          <p className={styles.bigStatNumber} style={{ color: "#D4A843" }}>{studyTime}</p>
          <p className={styles.statSubLabel}>{t("profile.thisWeek")}</p>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeaderColumn}>
            <p className={styles.chartTitle}>{t("profile.progressByCategory")}</p>
            <div className={styles.hskTabsWrapper}>
              {[1, 2, 3, 4, 5, 6].map((level) => (
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
            {categoryRows.length === 0 && <p className={styles.statSubLabel}>{t("path.comingSoon")}</p>}
            {categoryRows.map((item) => (
              <div key={item.id} className={styles.categoryRow}>
                <span className={styles.categoryLabel}>{item.label}</span>
                <div className={styles.categoryBarTrack}>
                  <div className={styles.categoryBarFill} style={{ width: `${item.pct}%`, backgroundColor: barColor(item.pct), transition: "width 0.3s ease" }} />
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
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
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