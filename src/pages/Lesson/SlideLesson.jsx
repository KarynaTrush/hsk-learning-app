import { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { stopSpeech } from "../../lib/tts";
import { Slide } from "./Slides";
import flowStyles from "./LessonFlow.module.css";
import styles from "./Slides.module.css";

export default function SlideLesson({ node, onComplete }) {
  const { t, i18n } = useTranslation();
  const { recordAnswer, recordExercise, completeLesson } = useAppState();
  const lang = i18n.resolvedLanguage || "ru";

  const slides = node?.slides || [];
  const [index, setIndex] = useState(0);
  const [readyKey, setReadyKey] = useState(null);

  const slide = slides[index];
  if (!slide) return null;

  const slideKey = `${node.id}-${slide.id || index}`;
  const ready = readyKey === slideKey;
  const isLast = index + 1 >= slides.length;
  const progress = slides.length ? Math.min(100, Math.round(((index + (ready ? 1 : 0)) / slides.length) * 100)) : 100;

  function close() {
    stopSpeech();
    onComplete();
  }

  function handleAnswer({ correct, ms, q }) {
    const meta = {
      type: q?.type || slide?.kind || "slide",
      skill: q?.skill || slide?.kind || "slide",
      lessonId: node?.lessonId ?? null,
      policy: "slides-v1",
    };
    if (q?.wordRef) {
      recordAnswer(q.wordRef, correct, ms, meta);
    } else {
      recordExercise({ ref: q?.ref || `${node?.slug}:${index + 1}`, correct, ms, ...meta });
    }
  }

  function next() {
    stopSpeech();
    if (isLast) {
      completeLesson(node.id);
      onComplete();
    } else {
      setIndex((i) => i + 1);
    }
  }

  const localizedPayload = (lang !== "ru" && slide[`payload_${lang}`]) || slide.payload;

  return (
    <div className={flowStyles.page}>
      <div className={flowStyles.top}>
        <button type="button" className={flowStyles.close} onClick={close} aria-label={t("flow.close")}>
          <X size={20} strokeWidth={1.8} />
        </button>
        <div className={flowStyles.progressTrack}>
          <div className={flowStyles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <span className={flowStyles.counter}>
          {t("flow.stepOf", { current: index + 1, total: slides.length })}
        </span>
      </div>

      <div className={flowStyles.stage}>
        <div className={styles.card}>
          <span className={styles.kindBadge}>{t(`slides.kind.${slide.kind}`)}</span>
          <Slide
            key={slideKey}
            slide={slide}
            payload={localizedPayload}
            onReady={() => setReadyKey(slideKey)}
            onAnswer={handleAnswer}
          />
          {ready && (
            <button type="button" className={`${styles.primary} ${styles.continueBtn}`} onClick={next}>
              {isLast ? t("slides.finishLesson") : t("slides.continue")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}