import React, { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { PATH_NODES, firstNodeOfLevel } from "../../data/path";
import { DICT } from "../../data/dictionary";
import { vocabByHanzi, wordMeaning } from "../../data/vocab";
import { speakZh, ttsSupported } from "../../lib/tts";
import {
  MAX_QUESTIONS,
  buildQuestion,
  estimate,
  initialPosterior,
  nextLevel,
  shouldStop,
  updatePosterior,
} from "../../lib/placement";
import PageBanner from "../../components/ui/PageBanner";
import styles from "./PlacementTest.module.css";

function buildPool() {
  return [...DICT.values()].map((e) => {
    const v = vocabByHanzi(e.hanzi);
    if (!v) return e;
    return {
      hanzi: e.hanzi,
      pinyin: e.pinyin,
      hsk: e.hsk,
      meaning: { ru: wordMeaning(v, "ru"), pl: wordMeaning(v, "pl"), en: wordMeaning(v, "en") || e.meaning?.en },
    };
  });
}

export default function PlacementTestScreen({ onComplete, mode = "first" }) {
  const retake = mode === "retake";
  const { t, i18n } = useTranslation();
  const { state, recordPlacementAnswer, completePlacementLevel, savePlacementResult, applyPlacementRetake } = useAppState();
  const lang = i18n.resolvedLanguage || "ru";
  const ttsOk = ttsSupported();

  const pool = useMemo(buildPool, []);
  const [phase, setPhase] = useState("intro");
  const [post, setPost] = useState(initialPosterior);
  const [asked, setAsked] = useState(0);
  const [question, setQuestion] = useState(null);
  const [picked, setPicked] = useState(null);
  const [result, setResult] = useState(null);
  const used = useRef(new Set());
  const startedAt = useRef(0);
  const locked = useRef(false);

  function makeQuestion(posterior, count) {
    let level = nextLevel(posterior, count);
    for (let attempt = 0; attempt < 6; attempt++) {
      const q = buildQuestion({ level, pool, used: used.current, lang, ttsOk });
      if (q) {
        used.current.add(q.hanzi);
        return q;
      }
      level = Math.min(6, Math.max(1, level + (attempt % 2 === 0 ? 1 : -2)));
    }
    return null;
  }

  function start() {
    used.current = new Set();
    const q = makeQuestion(post, 0);
    setQuestion(q);
    startedAt.current = Date.now();
    setPhase("question");
  }

  useEffect(() => {
    if (phase === "question" && question?.type === "listen") speakZh(question.hanzi, 0.8);
  }, [phase, question]);

  function answer(index) {
    if (locked.current || !question) return;
    locked.current = true;
    setPicked(index);
    const kind = index === -1 ? "dk" : index === question.correctIndex ? "correct" : "wrong";
    const nextPost = updatePosterior(post, kind, question.level);
    recordPlacementAnswer({ hanzi: question.hanzi, correct: kind === "correct", ms: Date.now() - startedAt.current, type: question.type, level: question.level, retake });
    const count = asked + 1;

    setTimeout(() => {
      setPost(nextPost);
      setAsked(count);
      setPicked(null);
      if (shouldStop(nextPost, count)) {
        const est = estimate(nextPost);
        setResult({ level: est.level, confidence: est.confidence, asked: count, post: nextPost });
        setPhase("result");
      } else {
        setQuestion(makeQuestion(nextPost, count));
        startedAt.current = Date.now();
      }
      locked.current = false;
    }, 280);
  }

  function finish() {
    const info = completePlacementLevel({ level: result.level, confidence: result.confidence, asked: result.asked });
    onComplete(info);
  }

  function applyRetake() {
    applyPlacementRetake({ level: result.level, confidence: result.confidence, asked: result.asked });
    onComplete({});
  }

  function keepRetake() {
    savePlacementResult({ level: result.level, confidence: result.confidence, asked: result.asked });
    onComplete({});
  }

  const banner = (
    <PageBanner color="#4A6FA5" hanzi="测" kicker={`HSK ${state.hskStandard || "2.0"}`} title={retake ? t("pt.retake.title") : t("pt.title")} subtitle={phase === "intro" ? (retake ? t("pt.retake.subtitle") : t("pt.subtitle")) : undefined} />
  );

  if (phase === "intro") {
    return (
      <div className={styles.container}>
        {banner}
        <div className={styles.card}>
          <p className={styles.text}>{t("pt.introText")}</p>
          <ul className={styles.tips}>
            {[1, 2, 3, 4].map((n) => (
              <li key={n}>{t(`pt.tip${n}`)}</li>
            ))}
          </ul>
          <button type="button" className={styles.primary} onClick={start}>
            {t("pt.start")}
            <ArrowRight size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    );
  }

  if (phase === "result" && result) {
    const level = result.level;
    const wanted = level === 0 ? 0 : Math.min(6, level + 1);
    const maxLevel = PATH_NODES.length ? Math.max(...PATH_NODES.map((n) => n.level)) : 1;
    const startLevel = Math.min(wanted, maxLevel);
    const targetNode = firstNodeOfLevel(startLevel);
    const indexOfNode = (id) => PATH_NODES.findIndex((n) => n.id === id);
    const ahead = indexOfNode(targetNode) > indexOfNode(state.activeNodeId);
    return (
      <div className={styles.container}>
        {banner}
        <div className={styles.card}>
          <p className={styles.kicker}>{t("pt.resultKicker")}</p>
          <div className={styles.resultHead}>
            <span className={styles.levelSeal}>{level}</span>
            <div>
              <h3 className={styles.resultTitle}>{level === 0 ? t("pt.levelZero") : t("pt.level", { level })}</h3>
              <p className={styles.muted}>{t("pt.confidence", { percent: Math.round(result.confidence * 100) })}</p>
            </div>
          </div>
          <p className={styles.text}>{wanted === 0 ? t("pt.startBasics") : t("pt.startAt", { level: wanted })}</p>
          <div className={styles.bars}>
            {result.post.map((p, i) => (
              <div key={i} className={styles.barCol}>
                <span className={styles.barValue}>{Math.round(p * 100)}%</span>
                <div className={styles.barTrack}>
                  <span className={`${styles.bar} ${i === level ? styles.barActive : ""}`} style={{ height: `${Math.max(4, Math.round(p * 100))}%` }} />
                </div>
                <span className={styles.barLabel}>{i}</span>
              </div>
            ))}
          </div>
          <p className={styles.note}>{t("pt.how")}</p>
          {!retake && (
            <button type="button" className={styles.primary} onClick={finish}>
              {t("pt.begin")}
              <ArrowRight size={18} strokeWidth={2.2} />
            </button>
          )}
          {retake && ahead && (
            <>
              <p className={styles.text}>{t("pt.retake.ahead", { level: startLevel })}</p>
              <button type="button" className={styles.primary} onClick={applyRetake}>
                {t("pt.retake.apply", { level: startLevel })}
              </button>
              <button type="button" className={styles.dontKnow} onClick={keepRetake}>{t("pt.retake.keep")}</button>
            </>
          )}
          {retake && !ahead && (
            <>
              <p className={styles.text}>{t("pt.retake.same")}</p>
              <button type="button" className={styles.primary} onClick={keepRetake}>{t("pt.retake.done")}</button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className={styles.container}>
        {banner}
        <div className={styles.card}>
          <p className={styles.text}>{t("pt.noQuestions")}</p>
          <button type="button" className={styles.primary} onClick={() => onComplete({})}>{t("pt.begin")}</button>
        </div>
      </div>
    );
  }

  const bigOptions = question.type === "hanzi";
  return (
    <div className={styles.container}>
      {banner}
      <div className={styles.card}>
        <div className={styles.topRow}>
          <span className={styles.counter}>{t("pt.counter", { n: asked + 1 })}</span>
          <div className={styles.progress}>
            <span style={{ width: `${Math.min(100, Math.round((asked / (MAX_QUESTIONS - 2)) * 100))}%` }} />
          </div>
        </div>

        <p className={styles.kicker}>{t(`pt.q.${question.type}`)}</p>
        {question.type === "hanzi" ? (
          <p className={styles.meaningPrompt}>{question.meaning}</p>
        ) : question.type === "listen" ? (
          <button type="button" className={styles.listenBtn} onClick={() => speakZh(question.hanzi, 0.8)}>
            <Volume2 size={32} strokeWidth={1.8} />
            {t("pt.listen")}
          </button>
        ) : (
          <div className={styles.hanziRow}>
            <span className={styles.hanzi}>{question.hanzi}</span>
            {ttsOk && (
              <button type="button" className={styles.audio} onClick={() => speakZh(question.hanzi, 0.8)} aria-label="audio">
                <Volume2 size={18} strokeWidth={1.8} />
              </button>
            )}
          </div>
        )}

        <div className={styles.options}>
          {question.options.map((option, i) => (
            <button
              key={`${question.id}-${i}`}
              type="button"
              className={`${styles.option} ${bigOptions ? styles.optionBig : ""} ${picked === i ? styles.optionPicked : ""}`}
              disabled={picked !== null}
              onClick={() => answer(i)}
            >
              {option}
            </button>
          ))}
        </div>
        <button type="button" className={styles.dontKnow} disabled={picked !== null} onClick={() => answer(-1)}>
          {t("pt.dontKnow")}
        </button>
      </div>
    </div>
  );
}