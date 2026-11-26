import React, { useEffect, useMemo, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import { Volume2, RotateCcw, PenLine, BookOpen, ChevronRight, Turtle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { DICT } from "../../data/dictionary";
import { HSK_LEVELS, nodeById, nodeTitle } from "../../data/path";
import { learnerLevel } from "../../lib/progress";
import { vocabByHanzi, wordMeaning } from "../../data/vocab";
import { STORIES } from "../../data/stories";
import { shortMeaning } from "../../lib/placement";
import { speakZh, ttsSupported } from "../../lib/tts";
import PageBanner from "../../components/ui/PageBanner";
import styles from "./CharacterDetail.module.css";

const UNLOCK_ALL = import.meta.env.VITE_UNLOCK_ALL === "true";
const isCjk = (c) => /[\u4e00-\u9fff]/.test(c);

function Grid({ children, size = 220 }) {
  return (
    <div className={styles.grid} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.gridLines} aria-hidden="true">
        <rect x="0.5" y="0.5" width="99" height="99" className={styles.gridFrame} />
        <line x1="50" y1="0" x2="50" y2="100" className={styles.gridLine} />
        <line x1="0" y1="50" x2="100" y2="50" className={styles.gridLine} />
        <line x1="0" y1="0" x2="100" y2="100" className={styles.gridLine} />
        <line x1="100" y1="0" x2="0" y2="100" className={styles.gridLine} />
      </svg>
      {children}
    </div>
  );
}

function StrokeAnimation({ char, theme, t }) {
  const boxRef = useRef(null);
  const writerRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;
    box.innerHTML = "";
    setFailed(false);
    const colors = theme === "dark" ? { stroke: "#F2EDE4", outline: "#5A544A" } : { stroke: "#1A1A1A", outline: "#D9D2C5" };
    const writer = HanziWriter.create(box, char, {
      width: 220,
      height: 220,
      padding: 12,
      showOutline: true,
      strokeColor: colors.stroke,
      outlineColor: colors.outline,
      radicalColor: "#4F7942",
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 300,
      onLoadCharDataError: () => setFailed(true),
    });
    writerRef.current = writer;
    writer.animateCharacter();
    return () => {
      writerRef.current = null;
      box.innerHTML = "";
    };
  }, [char, theme]);

  return (
    <div className={styles.strokeBox}>
      <Grid>
        <div ref={boxRef} className={styles.writer} />
      </Grid>
      {failed ? (
        <p className={styles.muted}>{t("char.noStrokes")}</p>
      ) : (
        <button type="button" className={styles.secondary} onClick={() => writerRef.current?.animateCharacter()}>
          <RotateCcw size={15} strokeWidth={2.2} />
          {t("char.replay")}
        </button>
      )}
    </div>
  );
}

function Highlighted({ text, word }) {
  const parts = text.split(word);
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {part}
      {i < parts.length - 1 && <mark className={styles.mark}>{word}</mark>}
    </React.Fragment>
  ));
}

export default function CharacterDetailScreen({ hanzi, onPractice, onOpenTarget, onOpenWord, onStartLesson }) {
  const { t, i18n } = useTranslation();
  const { state } = useAppState();
  const lang = i18n.resolvedLanguage || "ru";
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => setCharIndex(0), [hanzi]);

  const entry = useMemo(() => {
    const word = vocabByHanzi(hanzi);
    if (word) return { pinyin: word.pinyin, hsk: word.hsk, meaning: wordMeaning(word, lang), nodeId: word.nodeId };
    const d = DICT.get(hanzi);
    if (d) return { pinyin: d.pinyin, hsk: d.hsk, meaning: d.meaning?.[lang] || d.meaning?.en || "", nodeId: null };
    return null;
  }, [hanzi, lang]);

  const chars = useMemo(() => [...hanzi].filter(isCjk), [hanzi]);
  const currentLevel = learnerLevel(state);

  const examples = useMemo(() => {
    const out = [];
    for (const story of STORIES) {
      if (!UNLOCK_ALL && story.hsk > currentLevel) continue;
      for (const s of story.sentences) {
        if (s.zh.includes(hanzi)) out.push({ story, zh: s.zh });
        if (out.length >= 4) return out;
      }
    }
    return out;
  }, [hanzi, currentLevel]);

  const related = useMemo(
    () =>
      [...DICT.values()]
        .filter((e) => e.hanzi !== hanzi && chars.some((c) => e.hanzi.includes(c)))
        .sort((a, b) => a.hsk - b.hsk || a.hanzi.length - b.hanzi.length)
        .slice(0, 8),
    [hanzi, chars]
  );

  if (!entry) {
    return (
      <div className={styles.container}>
        <PageBanner color="#C83E34" hanzi={hanzi[0] || "字"} kicker={t("char.kicker")} title={hanzi} />
        <div className={styles.card}>
          <p className={styles.muted}>{t("char.noData")}</p>
        </div>
      </div>
    );
  }

  const levelInfo = HSK_LEVELS[String(entry.hsk)];
  const color = levelInfo?.color || "#C83E34";
  const node = entry.nodeId ? nodeById(entry.nodeId) : null;
  const mistake = state.mistakes?.find((m) => m.hanzi === hanzi);
  const writeMistakes = chars.reduce((sum, c) => sum + (state.writingStats?.[c]?.mistakes || 0), 0);
  const inReviews = Boolean(state.words?.[hanzi]);
  const activeChar = chars[Math.min(charIndex, chars.length - 1)];

  return (
    <div className={styles.container}>
      <PageBanner color={color} hanzi={hanzi[0]} kicker={`${t("char.kicker")} · HSK ${entry.hsk}`} title={hanzi} subtitle={entry.pinyin} />

      <section className={`${styles.card} ${styles.hero}`}>
        <Grid size={200}>
          <span className={styles.bigHanzi} style={{ fontSize: hanzi.length === 1 ? 110 : hanzi.length === 2 ? 76 : 54 }}>{hanzi}</span>
        </Grid>
        <div className={styles.heroInfo}>
          <p className={styles.label}>{t("char.meaning")}</p>
          <p className={styles.meaning}>{shortMeaning(entry.meaning) || entry.meaning}</p>
          <p className={styles.pinyin}>{entry.pinyin}</p>
          <div className={styles.heroActions}>
            {ttsSupported() && (
              <>
                <button type="button" className={styles.primary} onClick={() => speakZh(hanzi, 1)}>
                  <Volume2 size={16} strokeWidth={2} />
                  {t("char.listen")}
                </button>
                <button type="button" className={styles.secondary} onClick={() => speakZh(hanzi, 0.5)}>
                  <Turtle size={16} strokeWidth={2} />
                  {t("char.listenSlow")}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <div className={styles.columns}>
        <div className={styles.col}>
          <section className={styles.card}>
            <p className={styles.label}>{t("char.strokesTitle")}</p>
            {chars.length > 1 && (
              <div className={styles.tabs}>
                {chars.map((c, i) => (
                  <button key={`${c}${i}`} type="button" className={`${styles.tab} ${i === charIndex ? styles.tabActive : ""}`} onClick={() => setCharIndex(i)}>
                    {c}
                  </button>
                ))}
              </div>
            )}
            {activeChar && <StrokeAnimation char={activeChar} theme={state.theme} t={t} />}
            {activeChar && (
              <button type="button" className={styles.secondary} onClick={() => onOpenTarget({ type: "writing", target: { char: activeChar } })}>
                <PenLine size={16} strokeWidth={2} />
                {t("char.practiceWrite")}
              </button>
            )}
          </section>

          <section className={styles.card}>
            <p className={styles.label}>{t("char.examplesTitle")}</p>
            {examples.length === 0 && <p className={styles.muted}>{t("char.noExamples")}</p>}
            {examples.map((ex, i) => (
              <div key={i} className={styles.example}>
                <p className={styles.exampleZh}>
                  <Highlighted text={ex.zh} word={hanzi} />
                </p>
                <button type="button" className={styles.link} onClick={() => onOpenTarget({ type: "read", target: { storyId: ex.story.id } })}>
                  <BookOpen size={14} strokeWidth={2} />
                  {t("char.openStory")}
                </button>
              </div>
            ))}
          </section>
        </div>

        <div className={styles.col}>
          <section className={styles.card}>
            <p className={styles.label}>{t("char.progressTitle")}</p>
            <ul className={styles.facts}>
              <li className={inReviews ? styles.good : ""}>{inReviews ? t("char.inReviews") : t("char.notInReviews")}</li>
              <li className={mistake ? styles.bad : styles.good}>{mistake ? t("char.mistakes", { count: mistake.count }) : t("char.noMistakes")}</li>
              {writeMistakes > 0 && <li className={styles.bad}>{t("char.writeMistakes", { count: writeMistakes })}</li>}
            </ul>
            <button type="button" className={styles.primary} onClick={() => onPractice([hanzi])}>
              {t("char.practiceBtn")}
            </button>
          </section>

          <section className={styles.card}>
            <p className={styles.label}>{t("char.lessonTitle")}</p>
            {node ? (
              <button type="button" className={styles.lessonRow} onClick={() => onStartLesson(node.id)}>
                <span className={styles.lessonSeal}>{node.hanzi?.[0] || "字"}</span>
                <span className={styles.lessonName}>{nodeTitle(node, lang)}</span>
                <ChevronRight size={16} strokeWidth={2.2} />
              </button>
            ) : (
              <p className={styles.muted}>{t("char.noLesson")}</p>
            )}
          </section>

          {related.length > 0 && (
            <section className={styles.card}>
              <p className={styles.label}>{t("char.relatedTitle")}</p>
              <div className={styles.related}>
                {related.map((e) => (
                  <button key={e.hanzi} type="button" className={styles.relatedItem} onClick={() => onOpenWord(e.hanzi)}>
                    <span className={styles.relatedZh}>{e.hanzi}</span>
                    <span className={styles.relatedText}>
                      <span className={styles.relatedPy}>{e.pinyin}</span>
                      <span className={styles.relatedMeaning}>{shortMeaning(e.meaning?.[lang] || e.meaning?.en)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}