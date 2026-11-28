import React, { useEffect, useMemo, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import { Play, RotateCcw, PenLine, Eye, ChevronRight, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { HSK_LEVELS } from "../../data/path";
import { frontierLevel } from "../../lib/progress";
import { VOCAB, vocabByNode, wordMeaning } from "../../data/vocab";
import { DICT } from "../../data/dictionary";
import { isCjk } from "../../lib/segment";
import { starsFor, isPass, MAX_STARS } from "../../lib/writingScore";
import styles from "./Writing.module.css";

const MIN_SIZE = 240;
const MAX_SIZE = 360;

function pickSize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w < 1000) return Math.max(MIN_SIZE, Math.min(MAX_SIZE, w - 56));
  return Math.max(MIN_SIZE, Math.min(MAX_SIZE, h - 350));
}
const MODES = ["watch", "trace", "free"];

function charsOf(words) {
  const seen = new Set();
  for (const w of words) for (const c of w.hanzi) if (isCjk(c)) seen.add(c);
  return [...seen];
}

function writingMark(stat) {
  if (!stat) return "";
  if (isPass(stat.bestStars || 0)) return "done";
  if (stat.mistakes > 0) return "warn";
  return "";
}

function themeColors(theme) {
  return theme === "dark"
    ? { stroke: "#F2EDE4", outline: "#5A544A", radical: "#7FB36B" }
    : { stroke: "#1A1A1A", outline: "#D9D2C5", radical: "#4F7942" };
}

function StrokeThumb({ strokes, upTo, done }) {
  return (
    <svg viewBox="0 0 1024 1024" className={`${styles.thumb} ${done ? styles.thumbDone : ""}`}>
      <g transform="scale(1, -1) translate(0, -900)">
        {strokes.slice(0, upTo + 1).map((d, i) => (
          <path key={i} d={d} fill={i === upTo ? "#C83E34" : "currentColor"} opacity={i === upTo ? 1 : 0.35} />
        ))}
      </g>
    </svg>
  );
}

export default function WritingScreen({ initialChar }) {
  const { t, i18n } = useTranslation();
  const { state, recordWriting } = useAppState();
  const lang = i18n.resolvedLanguage || "ru";

  const activeLevel = frontierLevel(state.completedNodeIds) ?? 1;
  const [source, setSource] = useState("lesson");
  const [char, setChar] = useState(initialChar || "");
  const [custom, setCustom] = useState(initialChar || "");
  const [pinned, setPinned] = useState(initialChar || "");
  const [mode, setMode] = useState("trace");
  const [attempt, setAttempt] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [charData, setCharData] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [size, setSize] = useState(pickSize);
  const boxRef = useRef(null);
  const writerRef = useRef(null);
  const startedAt = useRef(Date.now());

  const levelsWithLessons = Object.entries(HSK_LEVELS).filter(([, v]) => v.groups.length > 0).map(([k]) => k);

  const chars = useMemo(() => {
    if (source === "lesson") {
      const own = charsOf(vocabByNode(state.activeNodeId));
      return own.length ? own : charsOf(VOCAB.filter((w) => w.hsk === 1)).slice(0, 12);
    }
    if (source === "learned") {
      return charsOf(Object.keys(state.words || {}).map((h) => ({ hanzi: h }))).slice(0, 80);
    }
    if (source === "mistakes") {
      const fromWriting = Object.entries(state.writingStats || {}).filter(([, v]) => v.mistakes > 0).map(([c]) => ({ hanzi: c }));
      const fromWords = (state.mistakes || []).map((m) => ({ hanzi: m.hanzi }));
      return charsOf([...fromWriting, ...fromWords]);
    }
    const level = Number(source.replace("level-", ""));
    const nodes = Object.values(HSK_LEVELS[String(level)]?.groups || []).flatMap((g) => g.nodes);
    return charsOf(nodes.flatMap((n) => vocabByNode(n.id)));
  }, [source, state.activeNodeId, state.words, state.mistakes, state.writingStats]);

  useEffect(() => {
    let timer = 0;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setSize(pickSize()), 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (!chars.length) return;
    if (!char) {
      setChar(chars[0]);
      return;
    }
    if (!chars.includes(char) && char !== pinned) setChar(chars[0]);
  }, [chars]);

  useEffect(() => {
    if (!char) return undefined;
    let cancelled = false;
    setCharData(null);
    setLoadError(false);
    HanziWriter.loadCharacterData(char)
      .then((data) => {
        if (!cancelled) setCharData(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [char]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !char || loadError) return undefined;
    box.innerHTML = "";
    setMistakes(0);
    setProgress(0);
    setResult(null);
    startedAt.current = Date.now();
    const colors = themeColors(state.theme);
    const writer = HanziWriter.create(box, char, {
      width: size,
      height: size,
      padding: 14,
      showCharacter: mode === "watch",
      showOutline: mode !== "free",
      strokeColor: colors.stroke,
      outlineColor: colors.outline,
      radicalColor: colors.radical,
      highlightColor: "#C83E34",
      drawingColor: "#C83E34",
      drawingWidth: 16,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 280,
      showHintAfterMisses: mode === "free" ? 3 : 2,
      highlightOnComplete: true,
      leniency: 1.3,
    });
    writerRef.current = writer;

    if (mode === "watch") {
      writer.loopCharacterAnimation();
    } else {
      writer.quiz({
        onCorrectStroke: (d) => setProgress(d.strokeNum + 1),
        onMistake: (d) => setMistakes(d.totalMistakes),
        onComplete: async (summary) => {
          const total = summary.totalMistakes;
          let strokes = 1;
          try {
            strokes = (await writer.getCharacterData()).strokes.length || 1;
          } catch {
            strokes = 1;
          }
          const stars = starsFor(total, strokes);
          setResult({ mistakes: total, stars });
          recordWriting({ char, mistakes: total, stars, ms: Date.now() - startedAt.current });
        },
      });
    }

    return () => {
      try {
        writer.cancelQuiz();
      } catch {
        box.innerHTML = "";
      }
      box.innerHTML = "";
    };
  }, [char, mode, attempt, state.theme, loadError, size]);

  function nextChar() {
    const i = chars.indexOf(char);
    setChar(chars[(i + 1) % chars.length] || char);
  }

  function submitCustom(e) {
    e.preventDefault();
    const c = [...custom].find(isCjk);
    if (c) {
      setChar(c);
      setCustom(c);
      setPinned(c);
    }
  }

  const related = useMemo(() => {
    if (!char) return [];
    const own = VOCAB.filter((w) => w.hanzi.includes(char));
    const extra = own.length >= 4 ? [] : [...DICT.values()].filter((w) => w.hanzi.includes(char) && !own.some((o) => o.hanzi === w.hanzi));
    return [...own, ...extra].slice(0, 4);
  }, [char]);
  const total = charData?.strokes?.length || 0;

  const sourceTabs = [
    { id: "lesson", label: t("writing.fromLesson") },
    { id: "learned", label: t("writing.learned") },
    { id: "mistakes", label: t("writing.fromMistakes") },
    ...levelsWithLessons.map((k) => ({ id: `level-${k}`, label: k === "0" ? t("path.level0") : `HSK ${k}` })),
  ];

  const footer = loadError ? (
    <p className={styles.error}>{t("writing.unsupported")}</p>
  ) : result ? (
    <>
      <div className={styles.starRow}>
        {Array.from({ length: MAX_STARS }, (_, i) => i + 1).map((n) => (
          <Star key={n} size={20} fill={n <= result.stars ? "#D4A843" : "none"} color={n <= result.stars ? "#D4A843" : "var(--border)"} strokeWidth={1.8} />
        ))}
      </div>
      <span className={styles.resultTitle}>{t(`writing.result.${result.stars}`)}</span>
      <span className={styles.status}>{t("writing.mistakesTotal", { count: result.mistakes })}</span>
    </>
  ) : mode === "watch" ? (
    <p className={styles.status}>{t("writing.watchHint")}</p>
  ) : (
    <p className={styles.status}>
      {t("writing.progress", { done: progress, total })} · {t("writing.mistakes", { count: mistakes })}
    </p>
  );

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <div className={styles.tabs}>
          {sourceTabs.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.tab} ${source === s.id ? styles.tabActive : ""}`}
              onClick={() => {
                setSource(s.id);
                setPinned("");
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <form className={styles.customForm} onSubmit={submitCustom}>
          <input
            className={styles.customInput}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder={t("writing.customPlaceholder")}
            maxLength={4}
          />
          <button type="submit" className={styles.customBtn}>{t("writing.go")}</button>
        </form>
      </div>

      <div className={styles.main}>
        <aside className={styles.charPanel}>
          <div className={styles.charScroll}>
            {chars.length === 0 && <p className={styles.emptyList}>{t("writing.emptyList")}</p>}
            {chars.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.charChip} ${c === char ? styles.charChipActive : ""} ${writingMark(state.writingStats?.[c]) === "done" ? styles.charChipDone : ""} ${writingMark(state.writingStats?.[c]) === "warn" ? styles.charChipWarn : ""}`}
                onClick={() => {
                  setChar(c);
                  setPinned("");
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </aside>

        <section className={styles.stageCard}>
          <div className={styles.modeRow}>
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                className={`${styles.modeBtn} ${mode === m ? styles.modeActive : ""}`}
                onClick={() => setMode(m)}
              >
                {m === "watch" ? <Eye size={15} /> : m === "trace" ? <PenLine size={15} /> : <Star size={15} />}
                {t(`writing.mode.${m}`)}
              </button>
            ))}
          </div>

          <div className={styles.stage} style={{ width: size, height: size }}>
            <svg className={styles.gridLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <rect x="0.5" y="0.5" width="99" height="99" className={styles.gridFrame} />
              <line x1="50" y1="0" x2="50" y2="100" className={styles.gridLine} />
              <line x1="0" y1="50" x2="100" y2="50" className={styles.gridLine} />
              <line x1="0" y1="0" x2="100" y2="100" className={styles.gridLine} />
              <line x1="100" y1="0" x2="0" y2="100" className={styles.gridLine} />
            </svg>
            <div ref={boxRef} className={styles.writer} />
          </div>

          <div className={styles.footer}>{footer}</div>

          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={() => setAttempt((a) => a + 1)}>
              <RotateCcw size={16} /> {t("writing.restart")}
            </button>
            {mode === "watch" ? (
              <button type="button" className={styles.primary} onClick={() => setMode("trace")}>
                <Play size={16} fill="currentColor" /> {t("writing.tryYourself")}
              </button>
            ) : (
              <button type="button" className={styles.primary} onClick={nextChar}>
                {t("writing.nextChar")} <ChevronRight size={16} />
              </button>
            )}
          </div>
        </section>

        <div className={styles.side}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.bigChar}>{char}</span>
              <div>
                <p className={styles.kicker}>{t("writing.strokesCount", { count: total })}</p>
                {related.length > 0 && <p className={styles.relatedHint}>{t("writing.inWords")}</p>}
              </div>
            </div>
            {related.slice(0, 3).map((w) => (
              <div key={w.hanzi} className={styles.related}>
                <span className={styles.relatedZh}>{w.hanzi}</span>
                <div className={styles.relatedText}>
                  <p className={styles.relatedPy}>{w.pinyin}</p>
                  <p className={styles.relatedMeaning}>{wordMeaning(w, lang)}</p>
                </div>
              </div>
            ))}
          </section>

          <section className={styles.card}>
            <p className={styles.kicker}>{t("writing.strokeOrder")}</p>
            {charData ? (
              <div className={styles.thumbs}>
                {charData.strokes.map((_, i) => (
                  <div key={i} className={styles.thumbWrap}>
                    <StrokeThumb strokes={charData.strokes} upTo={i} done={i < progress} />
                    <span className={styles.thumbNum}>{i + 1}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.status}>{loadError ? t("writing.unsupported") : t("writing.loading")}</p>
            )}
          </section>

          <details className={styles.rulesBox}>
            <summary className={styles.rulesSummary}>{t("writing.rulesTitle")}</summary>
            <ul className={styles.rules}>
              {[1, 2, 3, 4].map((n) => (
                <li key={n}>{t(`writing.rule${n}`)}</li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}
