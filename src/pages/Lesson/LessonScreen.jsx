import { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { VOCAB, vocabByHanzi, vocabByNode, wordMeaning } from "../../data/vocab";
import { PATH_NODES, nodeById } from "../../data/path";
import { planLesson, cloneForRetry } from "../../lib/exercises";
import { ttsSupported, stopSpeech } from "../../lib/tts";
import { NoteStep, WordStep, ChoiceStep, OrderStep, SummaryStep } from "./StepViews";
import styles from "./LessonFlow.module.css";

export default function LessonScreen({ onComplete }) {
  const { t, i18n } = useTranslation();
  const { state, recordAnswer, recordExercise, completeLesson } = useAppState();
  const lang = i18n.resolvedLanguage || "ru";

  const [initial] = useState(() => {
    const practiceWords = state.practiceHanzis?.length
      ? state.practiceHanzis.map((h) => (typeof h === "string" ? h : h.hanzi)).map(vocabByHanzi).filter(Boolean)
      : null;
    const practice = Boolean(practiceWords);
    const node = nodeById(state.activeNodeId);
    const meaningOf = (w) => wordMeaning(w, lang);
    const steps = planLesson({
      words: practiceWords || vocabByNode(state.activeNodeId),
      notes: practice ? [] : node?.notes || [],
      sentences: practice ? [] : node?.sentences || [],
      quiz: practice ? [] : node?.quiz || [],
      skills: state.skills,
      pool: VOCAB.filter((w) => meaningOf(w)),
      sentencePool: PATH_NODES.flatMap((n) => n.sentences || []),
      lang,
      meaningOf,
      canSpeak: ttsSupported(),
      intro: !practice,
    });
    return { steps, practice, nodeId: state.activeNodeId, lessonId: node?.lessonId ?? null };
  });

  const [steps, setSteps] = useState(initial.steps);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);

  const step = steps[index];
  const finished = index >= steps.length;
  const progress = steps.length ? Math.min(100, Math.round((index / steps.length) * 100)) : 100;

  function close() {
    stopSpeech();
    onComplete();
  }

  function next() {
    stopSpeech();
    setIndex((i) => i + 1);
  }

  function handleAnswered({ correct, ms }) {
    const meta = { type: step.type, skill: step.skill, lessonId: initial.lessonId, policy: step.policy };
    if (step.wordRef) recordAnswer(step.wordRef, correct, ms, meta);
    else recordExercise({ ref: step.ref, correct, ms, ...meta });
    setResults((r) => [...r, { correct, type: step.type, skill: step.skill }]);
    if (!correct && !step.retry) setSteps((list) => [...list, cloneForRetry(step)]);
  }

  function finish() {
    if (!initial.practice) completeLesson(initial.nodeId);
    onComplete();
  }

  if (steps.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <p className={styles.noteBody}>{t("lesson.empty")}</p>
          <button type="button" className={styles.primaryBtn} onClick={close}>
            {t("flow.close")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <button type="button" className={styles.close} onClick={close} aria-label={t("flow.close")}>
          <X size={20} strokeWidth={1.8} />
        </button>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${finished ? 100 : progress}%` }} />
        </div>
        <span className={styles.counter}>
          {t("flow.stepOf", { current: Math.min(index + 1, steps.length), total: steps.length })}
        </span>
      </div>

      <div className={styles.stage}>
        {finished && <SummaryStep results={results} t={t} onFinish={finish} />}
        {!finished && step.kind === "note" && <NoteStep key={step.id} step={step} lang={lang} t={t} onNext={next} />}
        {!finished && step.kind === "word" && <WordStep key={step.id} step={step} lang={lang} t={t} onNext={next} />}
        {!finished && step.kind === "exercise" && step.type === "order" && (
          <OrderStep key={step.id} step={step} t={t} onAnswered={handleAnswered} onNext={next} />
        )}
        {!finished && step.kind === "exercise" && step.type !== "order" && (
          <ChoiceStep key={step.id} step={step} lang={lang} t={t} onAnswered={handleAnswered} onNext={next} />
        )}
      </div>
    </div>
  );
}
