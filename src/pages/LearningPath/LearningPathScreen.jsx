import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
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

const ROW_H = 200;
const TOP_PAD = 58;

function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

function layoutPoints(count, width) {
  const cols = Math.max(2, Math.min(6, Math.floor(width / 190)));
  const colW = width / cols;
  const points = Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / cols);
    const c = i % cols;
    const col = row % 2 === 0 ? c : cols - 1 - c;
    return { x: (col + 0.5) * colW, y: TOP_PAD + row * ROW_H + (i % 2 === 0 ? 0 : 26), row };
  });
  const rows = Math.ceil(count / cols);
  return { points, cols, colW, height: TOP_PAD + (rows - 1) * ROW_H + ROW_H };
}

function pathUpTo(points, upTo, colW) {
  if (points.length < 2 || upTo < 1) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i <= Math.min(upTo, points.length - 1); i++) {
    const a = points[i - 1];
    const b = points[i];
    if (a.row === b.row) {
      const mid = (a.x + b.x) / 2;
      d += ` C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`;
    } else {
      const dir = a.row % 2 === 0 ? 1 : -1;
      const bulge = Math.min(colW * 0.45, 70);
      const edge = dir === 1 ? Math.max(a.x, b.x) + bulge : Math.min(a.x, b.x) - bulge;
      d += ` C ${edge} ${a.y}, ${edge} ${b.y}, ${b.x} ${b.y}`;
    }
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

function Trail({ nodes, lastDone, statusOf, colorOf, percentOf, lang, t, onNodeSelect }) {
  const [ref, width] = useWidth();
  const layout = width > 0 ? layoutPoints(nodes.length, width) : null;

  return (
    <div className={styles.trail} ref={ref} style={{ height: layout ? layout.height : ROW_H }}>
      {layout && (
        <>
          <svg className={styles.trailSvg} width={width} height={layout.height} viewBox={`0 0 ${width} ${layout.height}`} aria-hidden="true">
            <path d={pathUpTo(layout.points, nodes.length - 1, layout.colW)} className={styles.trailBase} />
            <path d={pathUpTo(layout.points, lastDone + 1, layout.colW)} className={styles.trailDone} />
          </svg>
          {nodes.map((node, i) => {
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
                style={{ left: layout.points[i].x, top: layout.points[i].y, width: Math.max(110, layout.colW - 10) }}
              />
            );
          })}
        </>
      )}
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

  const order = useMemo(() => new Map(PATH_NODES.map((n, i) => [n.id, i])), []);
  const activeIndex = order.get(state.activeNodeId) ?? 0;

  function statusOf(node) {
    if (completed.has(node.id)) return "completed";
    if (node.id === state.activeNodeId) return "active";
    if (!UNLOCK_ALL && order.get(node.id) > activeIndex) return "locked";
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
              <Trail
                nodes={group.nodes}
                lastDone={lastDone}
                statusOf={statusOf}
                colorOf={colorOf}
                percentOf={percentOf}
                completed={completed}
                lang={lang}
                t={t}
                onNodeSelect={onNodeSelect}
              />
            </section>
          );
        })
      )}
    </div>
  );
}