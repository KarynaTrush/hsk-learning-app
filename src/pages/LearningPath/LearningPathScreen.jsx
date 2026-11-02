import React, { useMemo, useState } from "react";
import { Lock, Check, Flame, BookOpen, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { HSK_LEVELS, PATH_NODES, nodeById, nodeTitle, blockTitle } from "../../data/path";
import { vocabByNode } from "../../data/vocab";
import styles from "./LearningPath.module.css";

const UNLOCK_ALL = import.meta.env.VITE_UNLOCK_ALL === "true";

const COMPLETED = "#4F7942";
const ACTIVE = "#C83E34";
const LOCKED = "#9A948A";
const RING = 2 * Math.PI * 44;

function solid(color) {
  if (color === "var(--accent)") return COMPLETED;
  if (color === "var(--primary)") return ACTIVE;
  return color;
}

function trailPoints(count) {
  return Array.from({ length: count }, (_, i) => ({
    x: ((i + 0.5) / count) * 1000,
    y: i % 2 === 0 ? 70 : 130,
  }));
}

function curve(points, upTo) {
  if (points.length < 2 || upTo < 1) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i <= Math.min(upTo, points.length - 1); i++) {
    const a = points[i - 1];
    const b = points[i];
    const mid = (a.x + b.x) / 2;
    d += ` C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`;
  }
  return d;
}

function Seal({ node, status, color, pct, title, sublabel, startLabel, onSelect, style }) {
  const locked = status === "locked";
  return (
    <div className={styles.nodePos} style={style}>
      <button
        type="button"
        disabled={locked}
        onClick={onSelect}
        className={`${styles.seal} ${styles[`seal_${status}`]}`}
        style={{ "--tone": color }}
      >
        {status === "active" && <span className={styles.startBubble}>{startLabel}</span>}
        <svg className={styles.ring} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" className={styles.ringTrack} />
          <circle
            cx="50"
            cy="50"
            r="44"
            className={styles.ringFill}
            strokeDasharray={`${(pct / 100) * RING} ${RING}`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <span className={styles.sealInner}>
          {locked ? <Lock size={22} strokeWidth={1.8} /> : <span className={styles.sealHanzi}>{node.hanzi[0]}</span>}
        </span>
        {status === "completed" && (
          <span className={styles.doneBadge}>
            <Check size={14} strokeWidth={3} />
          </span>
        )}
      </button>
      <p className={`${styles.nodeTitle} ${locked ? styles.nodeTitleLocked : ""}`}>{title}</p>
      <p className={`${styles.nodeSub} ${status === "completed" ? styles.nodeSubDone : ""}`}>{sublabel}</p>
    </div>
  );
}

function Banner({ levelKey, level, done, total, title, progressText }) {
  const color = solid(level.color);
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className={styles.banner} style={{ "--level": color }}>
      <svg className={styles.bannerArt} viewBox="0 0 600 160" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
        <polygon points="0,160 120,60 210,130 320,40 450,140 520,90 600,150 600,160" className={styles.mountainBack} />
        <polygon points="0,160 90,100 180,150 290,85 400,160" className={styles.mountainFront} />
        <rect x="430" y="28" width="90" height="22" rx="11" className={styles.cloud} />
        <rect x="470" y="14" width="70" height="22" rx="11" className={styles.cloud} />
        <rect x="90" y="40" width="70" height="18" rx="9" className={styles.cloud} />
      </svg>
      <span className={styles.bannerHanzi}>{levelKey === "0" ? "启" : ["", "一", "二", "三", "四", "五", "六"][Number(levelKey)]}</span>
      <div className={styles.bannerText}>
        <p className={styles.bannerLevel}>HSK {levelKey}</p>
        <h2 className={styles.bannerTitle}>{title}</h2>
        <p className={styles.bannerProgress}>{progressText}</p>
      </div>
      <div className={styles.bannerRing}>
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" className={styles.bannerRingTrack} />
          <circle
            cx="50"
            cy="50"
            r="44"
            className={styles.bannerRingFill}
            strokeDasharray={`${(pct / 100) * RING} ${RING}`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <span>{pct}%</span>
      </div>
    </div>
  );
}

export default function LearningPathScreen({ onNodeSelect }) {
  const { t, i18n } = useTranslation();
  const { state } = useAppState();
  const lang = i18n.resolvedLanguage || "ru";

  const [activeTab, setActiveTab] = useState(() => String(nodeById(state.activeNodeId)?.level ?? state.hskLevel ?? 1));
  const completed = useMemo(() => new Set(state.completedNodeIds || []), [state.completedNodeIds]);
  const level = HSK_LEVELS[activeTab];

  const totals = useMemo(() => {
    const byLevel = {};
    for (const n of PATH_NODES) {
      byLevel[n.level] = byLevel[n.level] || { done: 0, total: 0 };
      byLevel[n.level].total += 1;
      if (completed.has(n.id)) byLevel[n.level].done += 1;
    }
    return byLevel;
  }, [completed]);

  function statusOf(node) {
    if (completed.has(node.id)) return "completed";
    if (node.id === state.activeNodeId) return "active";
    if (!UNLOCK_ALL && node.id > state.activeNodeId) return "locked";
    return "available";
  }

  function percentOf(node) {
    if (completed.has(node.id)) return 100;
    const words = vocabByNode(node.id);
    if (!words.length) return 0;
    const learned = words.filter((w) => state.words?.[w.hanzi]).length;
    return Math.round((learned / words.length) * 100);
  }

  function colorOf(status) {
    if (status === "completed") return COMPLETED;
    if (status === "active") return ACTIVE;
    if (status === "locked") return LOCKED;
    return solid(level.color);
  }

  const levelTotals = totals[activeTab] || { done: 0, total: 0 };
  const allDone = Object.values(totals).reduce((a, v) => a + v.done, 0);
  const allTotal = PATH_NODES.length;
  const wordsCount = Object.keys(state.words || {}).length;

  return (
    <div className={styles.container}>
      <div className={styles.topStrip}>
        <div className={styles.chip}>
          <GraduationCap size={18} strokeWidth={1.8} />
          <div>
            <p className={styles.chipValue}>{allDone}/{allTotal}</p>
            <p className={styles.chipLabel}>{t("path.statLessons")}</p>
          </div>
        </div>
        <div className={styles.chip}>
          <BookOpen size={18} strokeWidth={1.8} />
          <div>
            <p className={styles.chipValue}>{wordsCount}</p>
            <p className={styles.chipLabel}>{t("path.statWords")}</p>
          </div>
        </div>
        <div className={styles.chip}>
          <Flame size={18} strokeWidth={1.8} />
          <div>
            <p className={styles.chipValue}>{state.streak?.count || 0}</p>
            <p className={styles.chipLabel}>{t("path.statStreak")}</p>
          </div>
        </div>
        <div className={styles.legend}>
          <span><i style={{ background: COMPLETED }} />{t("path.completed")}</span>
          <span><i style={{ background: ACTIVE }} />{t("path.active")}</span>
          <span><i style={{ background: LOCKED }} />{t("path.locked")}</span>
        </div>
      </div>

      <div className={styles.tabs}>
        {Object.keys(HSK_LEVELS).map((key) => {
          const lt = totals[key];
          return (
            <button
              key={key}
              type="button"
              className={`${styles.tab} ${activeTab === key ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <span>{key === "0" ? t("path.level0") : `HSK ${key}`}</span>
              <small>{lt ? `${lt.done}/${lt.total}` : "—"}</small>
            </button>
          );
        })}
      </div>

      <Banner
        levelKey={activeTab}
        level={level}
        done={levelTotals.done}
        total={levelTotals.total}
        title={t(`path.levelNames.${activeTab}`)}
        progressText={t("path.progress", { done: levelTotals.done, total: levelTotals.total })}
      />

      {level.groups.length === 0 ? (
        <p className={styles.comingSoon}>{t("path.comingSoon")}</p>
      ) : (
        level.groups.map((group, gi) => {
          const points = trailPoints(group.nodes.length);
          const lastDone = group.nodes.reduce((acc, n, i) => (completed.has(n.id) ? i : acc), -1);
          return (
            <section key={group.position} className={styles.block}>
              <header className={styles.blockHeader}>
                <span className={styles.blockNumber} style={{ background: solid(level.color) }}>{gi + 1}</span>
                <div>
                  <h3 className={styles.blockTitle}>{blockTitle(group, lang)}</h3>
                  <p className={styles.blockMeta}>{t("path.lessonsCount", { count: group.nodes.length })}</p>
                </div>
              </header>
              <div className={styles.trail}>
                <svg className={styles.trailSvg} viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
                  <path d={curve(points, points.length - 1)} className={styles.trailBase} vectorEffect="non-scaling-stroke" />
                  <path d={curve(points, lastDone + 1)} className={styles.trailDone} vectorEffect="non-scaling-stroke" />
                </svg>
                {group.nodes.map((node, i) => {
                  const status = statusOf(node);
                  return (
                    <Seal
                      key={node.id}
                      node={node}
                      status={status}
                      color={colorOf(status)}
                      pct={percentOf(node)}
                      title={nodeTitle(node, lang)}
                      sublabel={status === "completed" ? t("path.completed") : t("path.words", { count: node.wordCount })}
                      startLabel={t("path.start")}
                      onSelect={() => onNodeSelect(node.id)}
                      style={{ "--x": `${(points[i].x / 1000) * 100}%`, "--y": `${(points[i].y / 200) * 100}%` }}
                    />
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
