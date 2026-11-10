import React, { useMemo, useState } from "react";
import { ArrowLeft, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { GRAMMAR } from "../../data/grammar";
import { DICT } from "../../data/dictionary";
import { vocabByHanzi } from "../../data/vocab";
import PageBanner from "../../components/ui/PageBanner";
import { ChoiceStep, OrderStep } from "../Lesson/StepViews";
import { buildGrammarExercises } from "../../lib/grammarExercises";
import { speakZh, ttsSupported } from "../../lib/tts";
import styles from "./Grammar.module.css";

export default function GrammarTopic({ topic, onBack }) {
  const { t, i18n } = useTranslation();
  const { recordGrammar, state } = useAppState();
  const lang = i18n.resolvedLanguage || "ru";
  const pick = (o) => o?.[lang] || o?.ru || "";

  const [exercises, setExercises] = useState(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const lookup = useMemo(() => (w) => vocabByHanzi(w) || DICT.get(w), []);
  const theory = pick(topic.theory) || pick(topic.body);
  const mistake = pick(topic.mistake);
  const stats = state.grammarStats?.[topic.id];

  function start() {
    setScore({ correct: 0, total: 0 });
    setIndex(0);
    setExercises(buildGrammarExercises(topic, GRAMMAR, { lookup, lang }));
  }

  function answered({ correct, ms }) {
    const ex = exercises[index];
    recordGrammar({ topicId: topic.id, correct, ms, type: ex.type });
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  }

  const step = exercises && exercises[index];
  const finished = exercises && index >= exercises.length;

  return (
    <div className={styles.container}>
      <PageBanner color="#4F7942" hanzi="法" kicker={`HSK ${topic.level}`} title={pick(topic.title)} subtitle={topic.pattern}>
        <button type="button" className={styles.bannerBtn} onClick={onBack}>
          <ArrowLeft size={16} strokeWidth={2} />
          {t("grammarPage.backToList")}
        </button>
      </PageBanner>

      <div className={styles.topicGrid}>
        <div className={styles.topicMain}>
          <section className={styles.card}>
            <p className={styles.kicker}>{t("grammarPage.theory")}</p>
            <div className={styles.theory}>
              {theory.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            {topic.pattern && (
              <div className={styles.patternRow}>
                <span className={styles.patternLabel}>{t("grammar.pattern")}</span>
                <span className={styles.pattern}>{topic.pattern}</span>
              </div>
            )}
          </section>

          {mistake && (
            <section className={`${styles.card} ${styles.mistakeCard}`}>
              <p className={styles.kicker}>{t("grammarPage.mistake")}</p>
              <p className={styles.theory}>{mistake}</p>
            </section>
          )}

          <section className={styles.card}>
            <p className={styles.kicker}>{t("grammarPage.examples")}</p>
            <div className={styles.examples}>
              {topic.examples.map((e, j) => (
                <div key={j} className={styles.example}>
                  <div>
                    <p className={styles.exampleZh}>{e.zh}</p>
                    <p className={styles.examplePy}>{e.py}</p>
                  </div>
                  <p className={styles.exampleTr}>{e[lang] || e.ru}</p>
                  {ttsSupported() && (
                    <button type="button" className={styles.audio} onClick={() => speakZh(e.zh)} aria-label="audio">
                      <Volume2 size={16} strokeWidth={1.8} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.practice}>
          <p className={styles.kicker}>{t("grammarPage.practice")}</p>
          {!exercises && (
            <>
              <p className={styles.practiceText}>{t("grammarPage.practiceText")}</p>
              {stats && <p className={styles.practiceStats}>{t("grammarPage.stats", { correct: stats.correct, total: stats.answers })}</p>}
              <button type="button" className={styles.startBtn} onClick={start}>{t("grammarPage.start")}</button>
            </>
          )}
          {exercises && !finished && step && (
            <div className={styles.exerciseBox}>
              <p className={styles.exerciseCounter}>{t("flow.stepOf", { current: index + 1, total: exercises.length })}</p>
              {step.type === "order" ? (
                <OrderStep key={step.id} step={step} t={t} onAnswered={answered} onNext={() => setIndex((i) => i + 1)} />
              ) : (
                <ChoiceStep key={step.id} step={step} lang={lang} t={t} onAnswered={answered} onNext={() => setIndex((i) => i + 1)} />
              )}
            </div>
          )}
          {finished && (
            <div className={styles.result}>
              <p className={styles.resultTitle}>{t("grammarPage.done")}</p>
              <p className={styles.practiceText}>{t("flow.summaryScore", { correct: score.correct, total: score.total })}</p>
              <button type="button" className={styles.startBtn} onClick={start}>{t("grammarPage.again")}</button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}