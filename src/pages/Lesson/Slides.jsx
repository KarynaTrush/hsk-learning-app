import React, { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { speakZh, ttsSupported } from "../../lib/tts";
import { buildRecallQuestions, matchesShort, normalizeQuestion, shuffle } from "../../lib/slideLogic";
import styles from "./Slides.module.css";

export function Speak({ text, small = false }) {
  if (!text || !ttsSupported()) return null;
  return (
    <button
      type="button"
      className={`${styles.speak} ${small ? styles.speakSmall : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        speakZh(text, 0.85);
      }}
      aria-label="audio"
    >
      <Volume2 size={small ? 15 : 20} strokeWidth={1.8} />
    </button>
  );
}

function Feedback({ ok, explain, t }) {
  return (
    <div className={`${styles.feedback} ${ok ? styles.ok : styles.bad}`}>
      <strong>{ok ? t("slides.correct") : t("slides.wrong")}</strong>
      {explain && <p>{explain}</p>}
    </div>
  );
}

export function MiniQuiz({ questions, onAnswer, onDone, autoSpeak = false }) {
  const { t } = useTranslation();
  const texts = useMemo(() => ({ true: t("slides.true"), false: t("slides.false") }), [t]);
  const list = useMemo(() => questions.map((q) => normalizeQuestion(q, texts)), [questions, texts]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState(null);
  const startedAt = useRef(Date.now());
  const q = list[i];

  useEffect(() => {
    if (!list.length) onDone?.();
  }, []);

  useEffect(() => {
    startedAt.current = Date.now();
    setPicked(null);
    setTyped("");
    setResult(null);
    if (autoSpeak && q?.say) speakZh(q.say, 0.8);
  }, [i]);

  if (!q) return null;
  const answered = result !== null;

  function report(correct) {
    setResult(correct);
    onAnswer?.({ correct, ms: Date.now() - startedAt.current, q });
  }

  function choose(idx) {
    if (answered) return;
    setPicked(idx);
    report(idx === q.correct);
  }

  function submitShort(e) {
    e.preventDefault();
    if (answered || !typed.trim()) return;
    report(matchesShort(typed, q.accept));
  }

  function next() {
    if (i + 1 >= list.length) onDone?.();
    else setI(i + 1);
  }

  return (
    <div className={styles.quiz}>
      <p className={styles.counterSmall}>{i + 1} / {list.length}</p>
      <div className={styles.prompt}>
        {q.emoji && <span className={styles.bigEmoji}>{q.emoji}</span>}
        {q.big && <span className={styles.bigHanzi}>{q.big}</span>}
        {q.q && <p className={styles.question}>{q.q}</p>}
        {q.say && <Speak text={q.say} />}
      </div>

      {q.type === "short" ? (
        <form onSubmit={submitShort} className={styles.shortForm}>
          <input className={styles.input} value={typed} disabled={answered} onChange={(e) => setTyped(e.target.value)} placeholder={t("slides.typeAnswer")} autoFocus />
          {!answered && <button type="submit" className={styles.primary}>{t("slides.check")}</button>}
        </form>
      ) : (
        <div className={`${styles.options} ${q.options.length <= 2 ? styles.optionsTwo : ""}`}>
          {q.options.map((option, idx) => {
            const isRight = answered && idx === q.correct;
            const isWrong = answered && idx === picked && idx !== q.correct;
            return (
              <button
                key={idx}
                type="button"
                disabled={answered}
                className={`${styles.option} ${q.optionsBig ? styles.optionBig : ""} ${isRight ? styles.optionRight : ""} ${isWrong ? styles.optionWrong : ""}`}
                onClick={() => choose(idx)}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {answered && <Feedback ok={result} explain={q.type === "short" && !result ? `${t("slides.answerIs")} ${q.accept?.[0] || ""}. ${q.explain || ""}` : q.explain} t={t} />}
      {answered && (
        <button type="button" className={styles.primary} onClick={next}>
          {i + 1 >= list.length ? t("slides.finishBlock") : t("slides.next")}
        </button>
      )}
    </div>
  );
}

export function OrderBuilder({ items, onAnswer, onDone }) {
  const { t } = useTranslation();
  const [i, setI] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [checked, setChecked] = useState(false);
  const startedAt = useRef(Date.now());
  const item = items[i];

  useEffect(() => {
    startedAt.current = Date.now();
    setPlaced([]);
    setChecked(false);
  }, [i]);

  if (!item) return null;
  const tiles = item.tiles.map((text, idx) => ({ id: idx, text }));
  const free = tiles.filter((x) => !placed.includes(x.id));
  const attempt = placed.map((id) => tiles[id].text);
  const correct = attempt.join("|") === item.answer.join("|");

  function check() {
    if (placed.length !== tiles.length || checked) return;
    setChecked(true);
    onAnswer?.({ correct, ms: Date.now() - startedAt.current, q: item });
  }

  function next() {
    if (i + 1 >= items.length) onDone?.();
    else setI(i + 1);
  }

  return (
    <div className={styles.quiz}>
      <p className={styles.counterSmall}>{i + 1} / {items.length}</p>
      <div className={styles.prompt}>
        {item.target && <span className={styles.bigHanzi}>{item.target}</span>}
        {item.hint && <p className={styles.question}>{item.hint}</p>}
        {item.say && <Speak text={item.say} />}
      </div>
      <div className={`${styles.answerLine} ${checked ? (correct ? styles.lineOk : styles.lineBad) : ""}`}>
        {placed.length === 0 && <span className={styles.placeholder}>{t("slides.tapTiles")}</span>}
        {placed.map((id) => (
          <button key={id} type="button" disabled={checked} className={styles.tile} onClick={() => setPlaced((p) => p.filter((x) => x !== id))}>
            {tiles[id].text}
          </button>
        ))}
      </div>
      <div className={styles.tilePool}>
        {free.map((x) => (
          <button key={x.id} type="button" disabled={checked} className={styles.tile} onClick={() => setPlaced((p) => [...p, x.id])}>
            {x.text}
          </button>
        ))}
      </div>
      {checked && <Feedback ok={correct} explain={correct ? item.explain : `${t("slides.answerIs")} ${item.answer.join(" ")}`} t={t} />}
      {!checked ? (
        <button type="button" className={styles.primary} disabled={placed.length !== tiles.length} onClick={check}>{t("slides.check")}</button>
      ) : (
        <button type="button" className={styles.primary} onClick={next}>{i + 1 >= items.length ? t("slides.finishBlock") : t("slides.next")}</button>
      )}
    </div>
  );
}

function FactSlide({ payload, onReady }) {
  useEffect(() => onReady(), []);
  return (
    <div className={styles.factBox}>
      <span className={styles.factEmoji}>{payload.emoji}</span>
      <h3 className={styles.title}>{payload.title}</h3>
      <p className={styles.bodyText}>{payload.text}</p>
    </div>
  );
}

function WordsSlide({ payload, onReady }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(0);
  useEffect(() => onReady(), []);
  const item = payload.items[open];
  return (
    <div className={styles.wordsBox}>
      {payload.title && <h3 className={styles.title}>{payload.title}</h3>}
      <p className={styles.hint}>{t("slides.tapWord")}</p>
      <div className={styles.wordGrid}>
        {payload.items.map((w, idx) => (
          <button
            key={`${w.hanzi}${idx}`}
            type="button"
            className={`${styles.wordCard} ${idx === open ? styles.wordActive : ""}`}
            onClick={() => {
              setOpen(idx);
              speakZh(w.hanzi, 0.8);
            }}
          >
            {w.emoji && <span className={styles.wordEmoji}>{w.emoji}</span>}
            <span className={styles.wordHanzi}>{w.hanzi}</span>
            <span className={styles.wordPinyin}>{w.pinyin}</span>
            <span className={styles.wordMeaning}>{w.m}</span>
          </button>
        ))}
      </div>
      {item?.ex && (
        <div className={styles.exampleBox}>
          <div>
            <p className={styles.exZh}>{item.ex.zh}</p>
            <p className={styles.exPy}>{item.ex.py}</p>
            <p className={styles.exM}>{item.ex.m}</p>
          </div>
          <Speak text={item.ex.zh} />
        </div>
      )}
    </div>
  );
}

function Chart({ block }) {
  return (
    <div className={styles.chart} style={{ gridTemplateColumns: `repeat(${block.cols || 6}, minmax(0, 1fr))` }}>
      {block.cells.map((c, idx) => (
        <button key={idx} type="button" className={styles.cell} onClick={() => c[1] && speakZh(c[1], 0.8)}>
          <span className={styles.cellLabel}>{c[0]}</span>
          {c[2] && <span className={styles.cellSub}>{c[2]}</span>}
        </button>
      ))}
    </div>
  );
}

function TheorySlide({ payload, onReady }) {
  useEffect(() => onReady(), []);
  return (
    <div className={styles.theory}>
      {payload.title && <h3 className={styles.title}>{payload.title}</h3>}
      {payload.blocks.map((b, idx) => {
        if (b.t === "p") return <p key={idx} className={styles.bodyText}>{b.text}</p>;
        if (b.t === "tip") return <div key={idx} className={styles.tip}>{b.text}</div>;
        if (b.t === "ex")
          return (
            <div key={idx} className={styles.exampleBox}>
              <div>
                <p className={styles.exZh}>{b.zh}</p>
                {b.py && <p className={styles.exPy}>{b.py}</p>}
                {b.m && <p className={styles.exM}>{b.m}</p>}
              </div>
              <Speak text={b.say || b.zh} />
            </div>
          );
        if (b.t === "chart") return <Chart key={idx} block={b} />;
        if (b.t === "table")
          return (
            <div key={idx} className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>{b.head.map((h, i) => <th key={i}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {b.rows.map((r, i) => (
                    <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        return null;
      })}
    </div>
  );
}

function MatchGame({ payload, onAnswer, onReady }) {
  const { t } = useTranslation();
  const pairs = payload.pairs;
  const left = useMemo(() => shuffle(pairs.map((p, id) => ({ id, text: p[0] }))), [pairs]);
  const right = useMemo(() => shuffle(pairs.map((p, id) => ({ id, text: p[1] }))), [pairs]);
  const [selL, setSelL] = useState(null);
  const [selR, setSelR] = useState(null);
  const [done, setDone] = useState([]);
  const [bad, setBad] = useState(false);

  function attempt(l, r) {
    const ok = l === r;
    onAnswer?.({ correct: ok, ms: 0, q: { ref: `match:${pairs[l][0]}` } });
    if (ok) {
      const next = [...done, l];
      setDone(next);
      setSelL(null);
      setSelR(null);
      if (next.length === pairs.length) onReady();
    } else {
      setBad(true);
      setTimeout(() => {
        setBad(false);
        setSelL(null);
        setSelR(null);
      }, 450);
    }
  }

  const pickLeft = (id, text) => {
    if (done.includes(id) || bad) return;
    speakZh(text, 0.8);
    setSelL(id);
    if (selR !== null) attempt(id, selR);
  };
  const pickRight = (id) => {
    if (done.includes(id) || bad) return;
    setSelR(id);
    if (selL !== null) attempt(selL, id);
  };

  return (
    <div className={styles.matchBox}>
      <p className={styles.hint}>{t("slides.matchHint")}</p>
      <div className={styles.matchCols}>
        <div className={styles.matchCol}>
          {left.map((x) => (
            <button key={x.id} type="button" disabled={done.includes(x.id)} className={`${styles.matchItem} ${selL === x.id ? styles.matchSel : ""} ${done.includes(x.id) ? styles.matchDone : ""} ${bad && selL === x.id ? styles.matchBad : ""}`} onClick={() => pickLeft(x.id, x.text)}>
              {x.text}
            </button>
          ))}
        </div>
        <div className={styles.matchCol}>
          {right.map((x) => (
            <button key={x.id} type="button" disabled={done.includes(x.id)} className={`${styles.matchItem} ${selR === x.id ? styles.matchSel : ""} ${done.includes(x.id) ? styles.matchDone : ""} ${bad && selR === x.id ? styles.matchBad : ""}`} onClick={() => pickRight(x.id)}>
              {x.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GameSlide({ payload, onAnswer, onReady }) {
  const { t } = useTranslation();
  const prompts = { listen: t("slides.whatHeard"), emoji: t("slides.whichWordFits") };
  const quizItems = useMemo(
    () =>
      (payload.items || []).map((x) => ({
        ...x,
        q: x.q || prompts[payload.type],
        big: payload.type === "listen" ? undefined : x.big,
        optionsBig: x.optionsBig ?? payload.big,
      })),
    [payload]
  );
  return (
    <div className={styles.gameBox}>
      {payload.title && <h3 className={styles.title}>{payload.title}</h3>}
      {payload.type === "match" && <MatchGame payload={payload} onAnswer={onAnswer} onReady={onReady} />}
      {(payload.type === "listen" || payload.type === "emoji") && <MiniQuiz questions={quizItems} onAnswer={onAnswer} onDone={onReady} autoSpeak={payload.type === "listen"} />}
      {payload.type === "build" && <OrderBuilder items={payload.items.map((x) => ({ ...x, tiles: shuffle(x.answer) }))} onAnswer={onAnswer} onDone={onReady} />}
    </div>
  );
}

function QuizSlide({ payload, onAnswer, onReady }) {
  return (
    <div className={styles.gameBox}>
      {payload.title && <h3 className={styles.title}>{payload.title}</h3>}
      <MiniQuiz questions={payload.qs} onAnswer={onAnswer} onDone={onReady} />
    </div>
  );
}

function TextSlide({ payload, onAnswer, onReady }) {
  const { t } = useTranslation();
  const [showPy, setShowPy] = useState(false);
  const [showTr, setShowTr] = useState(false);
  const [reading, setReading] = useState(true);
  return (
    <div className={styles.gameBox}>
      {payload.title && <h3 className={styles.title}>{payload.title}</h3>}
      {reading ? (
        <>
          <div className={styles.textCard}>
            {payload.lines.map((l, idx) => (
              <div key={idx} className={styles.textLine}>
                <Speak text={l.zh} small />
                <div>
                  {showPy && <p className={styles.exPy}>{l.py}</p>}
                  <p className={styles.textZh}>{l.zh}</p>
                  {showTr && <p className={styles.exM}>{l.m}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.toggles}>
            <button type="button" className={`${styles.toggle} ${showPy ? styles.toggleOn : ""}`} onClick={() => setShowPy((v) => !v)}>
              {showPy ? <Eye size={14} /> : <EyeOff size={14} />} {t("slides.pinyin")}
            </button>
            <button type="button" className={`${styles.toggle} ${showTr ? styles.toggleOn : ""}`} onClick={() => setShowTr((v) => !v)}>
              {showTr ? <Eye size={14} /> : <EyeOff size={14} />} {t("slides.translation")}
            </button>
          </div>
          <button type="button" className={styles.primary} onClick={() => setReading(false)}>{t("slides.toQuestions")}</button>
        </>
      ) : (
        <MiniQuiz questions={payload.qs} onAnswer={onAnswer} onDone={onReady} />
      )}
    </div>
  );
}

function RecallSlide({ payload, onAnswer, onReady }) {
  const { t } = useTranslation();
  const generated = useMemo(
    () => buildRecallQuestions(payload, { whatMeans: t("slides.whatMeans"), whichWord: t("slides.whichWord"), isTranslation: t("slides.isTranslation") }),
    [payload, t]
  );
  const phases = useMemo(
    () => [
      generated.words.length && { id: "words", title: t("slides.recallWords") },
      generated.truth.length && { id: "truth", title: t("slides.recallTruth") },
      generated.builds.length && { id: "build", title: t("slides.recallBuild") },
    ].filter(Boolean),
    [generated, t]
  );
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!phases.length) onReady();
  }, []);

  const current = phases[phase];
  if (!current) return null;
  const advance = () => (phase + 1 >= phases.length ? onReady() : setPhase(phase + 1));

  return (
    <div className={styles.gameBox}>
      <h3 className={styles.title}>{current.title}</h3>
      {current.id === "words" && <MiniQuiz key="w" questions={generated.words} onAnswer={onAnswer} onDone={advance} />}
      {current.id === "truth" && <MiniQuiz key="t" questions={generated.truth} onAnswer={onAnswer} onDone={advance} autoSpeak />}
      {current.id === "build" && <OrderBuilder key="b" items={generated.builds} onAnswer={onAnswer} onDone={advance} />}
    </div>
  );
}

export function Slide({ slide, payload, onReady, onAnswer }) {
  const props = { payload, onReady, onAnswer };
  switch (slide.kind) {
    case "fact":
      return <FactSlide {...props} />;
    case "words":
      return <WordsSlide {...props} />;
    case "game":
      return <GameSlide {...props} />;
    case "theory":
      return <TheorySlide {...props} />;
    case "quiz":
      return <QuizSlide {...props} />;
    case "text":
      return <TextSlide {...props} />;
    case "recall":
      return <RecallSlide {...props} />;
    default:
      return null;
  }
}
