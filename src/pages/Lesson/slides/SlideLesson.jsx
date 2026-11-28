import { isPass } from "../../../lib/writingScore";
import React, { useCallback, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../../state/AppState";
import { stopSpeech } from "../../../lib/tts";
import { SummaryStep } from "../StepViews";
import { Slide } from "./Slides";
import styles from "./Slides.module.css";

const COLORS = { fact: "#D4A843", words: "#C83E34", game: "#3C8D93", theory: "#4F7942", quiz: "#2B6CB0", text: "#A07820", recall: "#8A4F9E", write: "#D97706" };
const SKILLS = { game: "recognition", quiz: "knowledge", text: "reading", recall: "recall", write: "writing" };

export default function SlideLesson({ node, onExit }) {
  const { t, i18n } = useTranslation();
  const { recordAnswer, recordExercise, recordWriting, touchWord, completeLesson } = useAppState();
  const lang = i18n.resolvedLanguage || "ru";

  const slides = useMemo(() => node.slides, [node]);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [results, setResults] = useState([]);

  const slide = slides[index];
  const finished = index >= slides.length;
  const color = slide ? COLORS[slide.kind] || "var(--primary)" : "var(--primary)";
  const payload = slide ? slide.payloads[lang] || slide.payloads.ru : null;

  const onReady = useCallback(() => setReady(true), []);

  function onAnswer({ correct, ms, q }) {
    const skill = SKILLS[slide.kind] || "knowledge";
    const meta = { type: `slide-${slide.kind}`, skill, lessonId: node.lessonId, policy: "slides-v1" };
    if (q?.wordRef) recordAnswer(q.wordRef, correct, ms, meta);
    else recordExercise({ ref: q?.ref || `slide:${node.slug}:${index}`, correct, ms, ...meta });
    setResults((r) => [...r, { correct, type: slide.kind, skill }]);
  }

  function onWrite(info) {
    if (info.kind === "word") {
      touchWord(info.hanzi, info.correct);
      return;
    }
    recordWriting({ char: info.char, mistakes: info.mistakes, stars: info.stars, ms: info.ms });
    setResults((r) => [...r, { correct: isPass(info.stars), type: "write", skill: "writing" }]);
  }

  function next() {
    stopSpeech();
    setReady(false);
    setIndex((i) => i + 1);
  }

  function exit() {
    stopSpeech();
    onExit();
  }

  function finish() {
    completeLesson(node.id);
    onExit();
  }

  const progress = slides.length ? Math.round((index / slides.length) * 100) : 100;

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <button type="button" className={styles.close} onClick={exit} aria-label={t("flow.close")}>
          <X size={20} strokeWidth={1.8} />
        </button>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${finished ? 100 : progress}%`, background: color }} />
        </div>
        <span className={styles.counter}>{Math.min(index + 1, slides.length)} / {slides.length}</span>
      </div>

      <div className={styles.stage}>
        {finished ? (
          <SummaryStep results={results} t={t} onFinish={finish} />
        ) : (
          <div className={styles.card} style={{ "--tone": color }}>
            <p className={styles.kicker} style={{ color }}>{t(`slides.kind.${slide.kind}`)}</p>
            <Slide key={`${node.id}-${index}`} slide={slide} payload={payload} onReady={onReady} onAnswer={onAnswer} onWrite={onWrite} />
            <button type="button" className={`${styles.primary} ${styles.nextBtn}`} style={{ background: ready ? color : undefined }} disabled={!ready} onClick={next}>
              {index + 1 >= slides.length ? t("slides.finishLesson") : t("slides.continue")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}