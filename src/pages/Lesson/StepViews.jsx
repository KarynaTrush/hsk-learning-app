import { useEffect, useRef, useState } from "react";
import { Volume2, Check, X, Eye, EyeOff } from "lucide-react";
import { speakZh, ttsSupported } from "../../lib/tts";
import { wordMeaning } from "../../data/vocab";
import styles from "./LessonFlow.module.css";

const PROMPT_KEY = {
  "choose-meaning": "chooseMeaning",
  "choose-hanzi": "chooseHanzi",
  listen: "listen",
  "pinyin-pick": "pinyinPick",
  translate: "translate",
  fill: "fill",
  order: "order",
  quiz: "quiz",
  "audio-quiz": "quiz",
};

function AudioButton({ text, large = false }) {
  if (!ttsSupported()) return null;
  return (
    <button type="button" className={large ? styles.audioLarge : styles.audioSmall} onClick={() => speakZh(text)}>
      <Volume2 size={large ? 30 : 18} strokeWidth={1.7} />
    </button>
  );
}

export function NoteStep({ step, lang, t, onNext }) {
  const { note } = step;
  const pick = (o) => o?.[lang] || o?.ru || "";
  return (
    <div className={styles.card}>
      <p className={styles.kicker}>{note.kind === "grammar" ? t("flow.grammar") : t("flow.intro")}</p>
      <h2 className={styles.noteTitle}>{pick(note.title)}</h2>
      <div className={styles.noteBody}>
        {pick(note.body)
          .split("\n")
          .map((line, i) => (
            <p key={i}>{line}</p>
          ))}
      </div>
      {note.examples?.length > 0 && (
        <div className={styles.exampleList}>
          {note.examples.map((e, i) => (
            <div key={i} className={styles.exampleItem}>
              <div>
                <p className={styles.exampleZh}>{e.zh}</p>
                <p className={styles.examplePy}>{e.py}</p>
              </div>
              <p className={styles.exampleTr}>{e[lang] || e.ru}</p>
              <AudioButton text={e.zh} />
            </div>
          ))}
        </div>
      )}
      <button type="button" className={styles.primaryBtn} onClick={onNext}>
        {t("flow.continue")}
      </button>
    </div>
  );
}

export function WordStep({ step, lang, t, onNext }) {
  const { word } = step;
  const exampleTranslation = t(`examples.${word.hanzi}`, { defaultValue: "" });
  return (
    <div className={styles.card}>
      <p className={styles.kicker}>{t("flow.newWord")}</p>
      <div className={styles.wordHero}>
        <span className={styles.wordHanzi}>{word.hanzi}</span>
        <AudioButton text={word.hanzi} large />
      </div>
      <p className={styles.wordPinyin}>{word.pinyin}</p>
      <p className={styles.wordMeaning}>{wordMeaning(word, lang)}</p>
      {word.example && (
        <div className={styles.wordExample}>
          <p className={styles.kickerSmall}>{t("flow.example")}</p>
          <p className={styles.exampleZh}>{word.example}</p>
          {exampleTranslation && <p className={styles.exampleTr}>{exampleTranslation}</p>}
        </div>
      )}
      <button type="button" className={styles.primaryBtn} onClick={onNext}>
        {t("flow.next")}
      </button>
    </div>
  );
}

function PromptView({ step, t }) {
  const [showPinyin, setShowPinyin] = useState(false);
  const { prompt } = step;

  useEffect(() => {
    if (prompt.mode === "audio" && prompt.speak) speakZh(prompt.speak);
  }, [step.id]);

  if (prompt.mode === "hanzi") {
    return (
      <div className={styles.promptBox}>
        <span className={styles.promptHanzi}>{prompt.text}</span>
        {prompt.hint && <p className={styles.promptHint}>{prompt.hint}</p>}
      </div>
    );
  }
  if (prompt.mode === "text") {
    return (
      <div className={styles.promptBox}>
        <p className={styles.promptText}>{prompt.text}</p>
      </div>
    );
  }
  if (prompt.mode === "audio") {
    return (
      <div className={styles.promptBox}>
        <AudioButton text={prompt.speak} large />
        {!ttsSupported() && <p className={styles.promptHint}>{t("flow.noSpeech")}</p>}
        {prompt.text && <p className={styles.promptText}>{prompt.text}</p>}
      </div>
    );
  }
  if (prompt.mode === "sentence") {
    return (
      <div className={styles.promptBox}>
        <p className={styles.promptSentence}>{prompt.zh}</p>
        <button type="button" className={styles.linkBtn} onClick={() => setShowPinyin((v) => !v)}>
          {showPinyin ? <EyeOff size={14} /> : <Eye size={14} />} {t("flow.pinyin")}
        </button>
        {showPinyin && <p className={styles.promptHint}>{prompt.py}</p>}
        <AudioButton text={prompt.zh} />
      </div>
    );
  }
  if (prompt.mode === "blank") {
    return (
      <div className={styles.promptBox}>
        <p className={styles.promptSentence}>
          {prompt.tokens.map((tok, i) => (i === prompt.blankIndex ? "＿＿" : tok)).join(" ")}
        </p>
        {prompt.hint && <p className={styles.promptHint}>{prompt.hint}</p>}
      </div>
    );
  }
  return null;
}

export function ChoiceStep({ step, lang, t, onAnswered, onNext }) {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const startedAt = useRef(Date.now());

  const correctOption = step.options.find((o) => o.id === step.correctId);
  const isCorrect = selected === step.correctId;
  const promptKey = PROMPT_KEY[step.type] || "quiz";

  function check() {
    if (selected === null || checked) return;
    setChecked(true);
    onAnswered({ correct: isCorrect, ms: Date.now() - startedAt.current });
  }

  return (
    <div className={styles.card}>
      <p className={styles.kicker}>{step.retry ? t("flow.retryNote") : t(`flow.prompt.${promptKey}`)}</p>
      <PromptView step={step} t={t} />
      <div className={styles.options}>
        {step.options.map((o) => {
          const state = !checked
            ? selected === o.id
              ? styles.optionSelected
              : ""
            : o.id === step.correctId
              ? styles.optionCorrect
              : selected === o.id
                ? styles.optionWrong
                : styles.optionDim;
          return (
            <button
              key={o.id}
              type="button"
              disabled={checked}
              className={`${styles.option} ${o.big ? styles.optionBig : ""} ${state}`}
              onClick={() => setSelected(o.id)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {checked && (
        <div className={`${styles.feedback} ${isCorrect ? styles.feedbackOk : styles.feedbackBad}`}>
          <span className={styles.feedbackIcon}>{isCorrect ? <Check size={16} /> : <X size={16} />}</span>
          <div>
            <p className={styles.feedbackTitle}>
              {isCorrect ? t("flow.correct") : t("flow.wrong", { answer: correctOption?.label })}
            </p>
            {step.explanation && <p className={styles.feedbackText}>{step.explanation}</p>}
          </div>
        </div>
      )}
      {!checked ? (
        <button type="button" className={styles.primaryBtn} disabled={selected === null} onClick={check}>
          {t("flow.check")}
        </button>
      ) : (
        <button type="button" className={styles.primaryBtn} onClick={onNext}>
          {t("flow.next")}
        </button>
      )}
    </div>
  );
}

export function OrderStep({ step, t, onAnswered, onNext }) {
  const [placed, setPlaced] = useState([]);
  const [checked, setChecked] = useState(false);
  const [dragId, setDragId] = useState(null);
  const startedAt = useRef(Date.now());

  const byId = Object.fromEntries(step.tiles.map((tile) => [tile.id, tile]));
  const free = step.tiles.filter((tile) => !placed.includes(tile.id));
  const attempt = placed.map((id) => byId[id].text);
  const isCorrect = attempt.join("|") === step.answer.join("|");

  function check() {
    if (placed.length !== step.tiles.length || checked) return;
    setChecked(true);
    onAnswered({ correct: isCorrect, ms: Date.now() - startedAt.current });
  }

  function dropAt(beforeId) {
    if (!dragId || checked) return;
    setPlaced((list) => {
      const without = list.filter((x) => x !== dragId);
      if (!beforeId) return [...without, dragId];
      const at = without.indexOf(beforeId);
      return [...without.slice(0, at), dragId, ...without.slice(at)];
    });
    setDragId(null);
  }

  function dropToPool() {
    if (!dragId || checked) return;
    setPlaced((list) => list.filter((x) => x !== dragId));
    setDragId(null);
  }

  return (
    <div className={styles.card}>
      <p className={styles.kicker}>{step.retry ? t("flow.retryNote") : t("flow.prompt.order")}</p>
      <div className={styles.promptBox}>
        <p className={styles.promptText}>{step.prompt.hint}</p>
      </div>
      <div
        className={`${styles.answerLine} ${checked ? (isCorrect ? styles.answerOk : styles.answerBad) : ""}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => dropAt(null)}
      >
        {placed.length === 0 && <span className={styles.answerPlaceholder}>{t("flow.tapTiles")}</span>}
        {placed.map((id) => (
          <button
            key={id}
            type="button"
            disabled={checked}
            draggable={!checked}
            className={styles.tile}
            onDragStart={() => setDragId(id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.stopPropagation();
              dropAt(id);
            }}
            onClick={() => setPlaced((p) => p.filter((x) => x !== id))}
          >
            {byId[id].text}
          </button>
        ))}
      </div>
      <div className={styles.tilePool} onDragOver={(e) => e.preventDefault()} onDrop={dropToPool}>
        {free.map((tile) => (
          <button
            key={tile.id}
            type="button"
            disabled={checked}
            draggable={!checked}
            className={styles.tile}
            onDragStart={() => setDragId(tile.id)}
            onClick={() => setPlaced((p) => [...p, tile.id])}
          >
            {tile.text}
          </button>
        ))}
      </div>
      {checked && (
        <div className={`${styles.feedback} ${isCorrect ? styles.feedbackOk : styles.feedbackBad}`}>
          <span className={styles.feedbackIcon}>{isCorrect ? <Check size={16} /> : <X size={16} />}</span>
          <div>
            <p className={styles.feedbackTitle}>
              {isCorrect ? t("flow.correct") : t("flow.wrong", { answer: step.answer.join(" ") })}
            </p>
          </div>
        </div>
      )}
      {!checked ? (
        <button type="button" className={styles.primaryBtn} disabled={placed.length !== step.tiles.length} onClick={check}>
          {t("flow.check")}
        </button>
      ) : (
        <button type="button" className={styles.primaryBtn} onClick={onNext}>
          {t("flow.next")}
        </button>
      )}
    </div>
  );
}

export function SummaryStep({ results, t, onFinish }) {
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const bySkill = {};
  for (const r of results) {
    bySkill[r.skill] = bySkill[r.skill] || { answers: 0, correct: 0 };
    bySkill[r.skill].answers += 1;
    if (r.correct) bySkill[r.skill].correct += 1;
  }
  const pct = total ? Math.round((correct / total) * 100) : 100;

  return (
    <div className={styles.card}>
      <div className={styles.summaryBadge}>
        <span>完</span>
      </div>
      <h2 className={styles.noteTitle} style={{ textAlign: "center" }}>{t("flow.summaryTitle")}</h2>
      <p className={styles.summaryScore}>{t("flow.summaryScore", { correct, total })}</p>
      <div className={styles.summaryBar}>
        <div className={styles.summaryFill} style={{ width: `${pct}%` }} />
      </div>
      {Object.keys(bySkill).length > 0 && (
        <>
          <p className={styles.kickerSmall} style={{ marginTop: 20 }}>{t("flow.skillsTitle")}</p>
          <div className={styles.skillList}>
            {Object.entries(bySkill).map(([skill, v]) => (
              <div key={skill} className={styles.skillRow}>
                <span>{t(`flow.skill.${skill}`, { defaultValue: skill })}</span>
                <span className={styles.skillValue}>{v.correct}/{v.answers}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <button type="button" className={styles.primaryBtn} onClick={onFinish}>
        {t("flow.finish")}
      </button>
    </div>
  );
}