import React, { useEffect, useMemo, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import { Volume2, Eye, EyeOff, RotateCcw, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { speakZh, ttsSupported } from "../../../lib/tts";
import { isCjk } from "../../../lib/segment";
import { useAppState } from "../../../state/AppState";
import { buildRecallQuestions, matchesShort, normalizeQuestion, shuffle } from "../../../lib/slideLogic";
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

  const normalizedItems = useMemo(() => {
    return (items || []).filter(Boolean).map((item) => {
      const answerTokens = item.answer || item.tiles || [];
      return {
        ...item,
        answer: answerTokens,
        tiles: item.tiles || shuffle([...answerTokens]),
      };
    });
  }, [items]);

  const item = normalizedItems[i];

  useEffect(() => {
    startedAt.current = Date.now();
    setPlaced([]);
    setChecked(false);
  }, [i]);

  if (!item || !Array.isArray(item.tiles)) return null;

  const tiles = item.tiles
    .filter(Boolean)
    .map((text, idx) => ({ id: idx, text }));
    
  const free = tiles.filter((x) => !placed.includes(x.id));
  const attempt = placed.map((id) => tiles[id]?.text).filter(Boolean);
  const correct = attempt.join("|") === (item.answer || []).join("|");

  function check() {
    if (placed.length !== tiles.length || checked) return;
    setChecked(true);
    onAnswer?.({ correct, ms: Date.now() - startedAt.current, q: item });
  }

  function next() {
    if (i + 1 >= normalizedItems.length) onDone?.();
    else setI(i + 1);
  }

  return (
    <div className={styles.quiz}>
      <p className={styles.counterSmall}>{i + 1} / {normalizedItems.length}</p>
      <div className={styles.prompt}>
        {item.target && <span className={styles.bigHanzi}>{item.target}</span>}
        {item.hint && <p className={styles.question}>{item.hint}</p>}
        {item.say && <Speak text={item.say} />}
      </div>
      <div className={`${styles.answerLine} ${checked ? (correct ? styles.lineOk : styles.lineBad) : ""}`}>
        {placed.length === 0 && <span className={styles.placeholder}>{t("slides.tapTiles", "Нажимайте на слова, чтобы собрать фразу")}</span>}
        {placed.map((id) => {
          const tile = tiles.find(t => t.id === id);
          if (!tile) return null;
          return (
            <button key={id} type="button" disabled={checked} className={styles.tile} onClick={() => setPlaced((p) => p.filter((x) => x !== id))}>
              {tile.text}
            </button>
          );
        })}
      </div>
      <div className={styles.tilePool}>
        {free.map((x) => (
          <button key={x.id} type="button" disabled={checked} className={styles.tile} onClick={() => setPlaced((p) => [...p, x.id])}>
            {x.text}
          </button>
        ))}
      </div>
      {checked && <Feedback ok={correct} explain={correct ? item.explain : `${t("slides.answerIs")} ${(item.answer || []).join(" ")}`} t={t} />}
      {!checked ? (
        <button type="button" className={styles.primary} disabled={placed.length !== tiles.length} onClick={check}>{t("slides.check", "Проверить")}</button>
      ) : (
        <button type="button" className={styles.primary} onClick={next}>{i + 1 >= normalizedItems.length ? t("slides.finishBlock", "Завершить") : t("slides.next", "Далее")}</button>
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

const WRITE_SIZE = 260;

function writeColors(theme) {
  return theme === "dark"
    ? { stroke: "#F2EDE4", outline: "#5A544A", radical: "#7FB36B" }
    : { stroke: "#1A1A1A", outline: "#D9D2C5", radical: "#4F7942" };
}

function WriteSlide({ payload, onReady, onWrite }) {
  const { t } = useTranslation();
  const { state } = useAppState();
  const items = useMemo(() => payload.items || [], [payload]);
  const [active, setActive] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [progress, setProgress] = useState(0);
  const [charResult, setCharResult] = useState(null);
  const [doneWords, setDoneWords] = useState({});
  const [failed, setFailed] = useState(false);
  const boxRef = useRef(null);
  const wordOk = useRef({});
  const startedAt = useRef(Date.now());

  const item = items[active];
  const chars = useMemo(() => [...(item?.hanzi || "")].filter(isCjk), [item]);
  const char = chars[charIdx];
  const allDone = items.length > 0 && items.every((_, i) => doneWords[i]);

  useEffect(() => {
    if (allDone || failed || !items.length) onReady();
  }, [allDone, failed, items.length]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !char) return undefined;
    let cancelled = false;
    box.innerHTML = "";
    setMistakes(0);
    setProgress(0);
    setCharResult(null);
    setFailed(false);
    startedAt.current = Date.now();
    const colors = writeColors(state.theme);
    const writer = HanziWriter.create(box, char, {
      width: WRITE_SIZE,
      height: WRITE_SIZE,
      padding: 12,
      showCharacter: false,
      showOutline: true,
      strokeColor: colors.stroke,
      outlineColor: colors.outline,
      radicalColor: colors.radical,
      highlightColor: "#C83E34",
      drawingColor: "#C83E34",
      drawingWidth: 16,
      showHintAfterMisses: 2,
      highlightOnComplete: true,
      leniency: 1.1,
      onLoadCharDataError: () => {
        if (!cancelled) setFailed(true);
      },
    });
    writer.quiz({
      onCorrectStroke: (d) => {
        if (!cancelled) setProgress(d.strokeNum + 1);
      },
      onMistake: (d) => {
        if (!cancelled) setMistakes(d.totalMistakes);
      },
      onComplete: async (summary) => {
        const total = summary.totalMistakes;
        let strokes = 1;
        try {
          strokes = (await writer.getCharacterData()).strokes.length || 1;
        } catch {
          strokes = 1;
        }
        if (cancelled) return;
        const stars = total === 0 ? 3 : total <= Math.max(2, Math.round(strokes * 0.3)) ? 2 : 1;
        setCharResult({ stars, mistakes: total });
        onWrite?.({ kind: "char", char, mistakes: total, stars, ms: Date.now() - startedAt.current });
        wordOk.current[active] = (wordOk.current[active] ?? true) && stars >= 2;
        if (charIdx + 1 >= chars.length) {
          onWrite?.({ kind: "word", hanzi: item.hanzi, correct: wordOk.current[active] });
          setDoneWords((d) => ({ ...d, [active]: true }));
        }
      },
    });
    return () => {
      cancelled = true;
      try {
        writer.cancelQuiz();
      } catch {
        box.innerHTML = "";
      }
      box.innerHTML = "";
    };
  }, [active, charIdx, attempt, state.theme]);

  function pickWord(index) {
    wordOk.current[index] = undefined;
    setActive(index);
    setCharIdx(0);
    setAttempt((a) => a + 1);
  }

  function nextStep() {
    if (charIdx + 1 < chars.length) {
      setCharIdx((i) => i + 1);
      return;
    }
    const next = items.findIndex((_, i) => i !== active && !doneWords[i]);
    if (next >= 0) pickWord(next);
  }

  const hasNext = charIdx + 1 < chars.length || items.some((_, i) => i !== active && !doneWords[i]);

  return (
    <div className={styles.wordsBox}>
      {payload.title && <h3 className={styles.title}>{payload.title}</h3>}
      <p className={styles.hint}>{t("slides.writeHint")}</p>
      <div className={styles.wordGrid}>
        {items.map((w, idx) => (
          <button
            key={idx}
            type="button"
            className={`${styles.wordCard} ${idx === active ? styles.wordActive : ""}`}
            onClick={() => pickWord(idx)}
          >
            <span className={styles.wordHanzi}>{w.hanzi}</span>
            <span className={styles.wordPinyin}>{w.pinyin}</span>
            <span className={styles.wordMeaning}>{doneWords[idx] ? "✓ " : ""}{w.m}</span>
          </button>
        ))}
      </div>
      {item && (
        <p className={styles.writeCaption}>
          {item.hanzi} ({item.pinyin}) — {item.m}
          {chars.length > 1 && ` · ${charIdx + 1}/${chars.length}`}
        </p>
      )}
      {failed ? (
        <p className={styles.writeStatus}>{t("slides.writeUnavailable")}</p>
      ) : (
        <>
          <div className={styles.writeStage}>
            <svg className={styles.writeGrid} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <line x1="50" y1="0" x2="50" y2="100" className={styles.writeGridLine} />
              <line x1="0" y1="50" x2="100" y2="50" className={styles.writeGridLine} />
              <line x1="0" y1="0" x2="100" y2="100" className={styles.writeGridLine} />
              <line x1="100" y1="0" x2="0" y2="100" className={styles.writeGridLine} />
            </svg>
            <div ref={boxRef} className={styles.writeBox} />
          </div>
          {charResult ? (
            <p className={styles.writeStatus}>
              {t(`writing.result.${charResult.stars}`)} · {t("writing.mistakesTotal", { count: charResult.mistakes })}
            </p>
          ) : (
            <p className={styles.writeStatus}>
              {t("slides.writeProgress", { done: progress })} · {t("writing.mistakes", { count: mistakes })}
            </p>
          )}
        </>
      )}
      <div className={styles.writeActions}>
        {!failed && !charResult && (
          <button type="button" className={styles.writeSecondary} onClick={() => setAttempt((a) => a + 1)}>
            <RotateCcw size={15} /> {t("writing.restart")}
          </button>
        )}
        {charResult && hasNext && (
          <button type="button" className={styles.writePrimary} onClick={nextStep}>
            <Check size={15} /> {charIdx + 1 < chars.length ? t("slides.writeNextChar") : t("slides.writeNextWord")}
          </button>
        )}
        {!allDone && !failed && (
          <button type="button" className={styles.writeSecondary} onClick={onReady}>
            {t("slides.writeSkip")}
          </button>
        )}
      </div>
    </div>
  );
}

function BugHuntGame({ payload, onAnswer, onReady }) {
  const questions = useMemo(
    () => (payload.cases || []).map((c) => ({
      q: `${c.buggyText}\n\n💡 ${c.context}`,
      options: c.options,
      correct: c.correct,
      explain: c.explain
    })),
    [payload]
  );
  return <MiniQuiz questions={questions} onAnswer={onAnswer} onDone={onReady} />;
}

function ChatSimGame({ payload, onAnswer, onReady }) {
  const questions = useMemo(
    () => (payload.messages || []).filter(m => m.options).map((m) => ({
      q: `💬 [${m.speaker}]: ${m.text}\n(${m.translation})`,
      options: m.options,
      correct: m.correct,
      explain: m.explain
    })),
    [payload]
  );
  useEffect(() => {
    if (!questions.length) onReady();
  }, [questions.length]);
  if (!questions.length) {
    return (
      <div className={styles.factBox}>
        <h3 className={styles.title}>{payload.title || "WeChat Чаты"}</h3>
      </div>
    );
  }
  return <MiniQuiz questions={questions} onAnswer={onAnswer} onDone={onReady} />;
}

function ToneVizGame({ payload, onReady }) {
  useEffect(() => onReady(), []);
  return (
    <div className={styles.factBox}>
      <span className={styles.factEmoji}>🎤</span>
      <h3 className={styles.title}>{payload.title || "Тренажёр тонов"}</h3>
      <p className={styles.bodyText}>Используйте вкладку «Тоны» в боковом меню для записи голоса.</p>
    </div>
  );
}
const ALL_KANGXI_RADICALS = [
  "一", "丨", "丶", "丿", "乙", "亅", "二", "亠", "人", "亻", "儿", "入", "八", "冂", "冖", "冫", "几", "凵", "刀", "刂",
  "力", "勹", "匕", "匚", "匸", "十", "卜", "卩", "厂", "厶", "又", "口", "囗", "土", "士", "夂", "夊", "夕", "大", "女",
  "子", "宀", "寸", "小", "尢", "尸", "屮", "山", "巛", "工", "己", "巾", "干", "幺", "广", "廴", "廾", "弋", "弓", "彐",
  "彡", "彳", "心", "忄", "戈", "戶", "手", "扌", "支", "攴", "攵", "文", "斗", "斤", "方", "无", "日", "曰", "月", "木",
  "欠", "止", "歹", "殳", "毋", "比", "毛", "氏", "气", "水", "氵", "火", "灬", "爪", "父", "爻", "爿", "片", "牙", "牛",
  "犬", "犭", "玄", "玉", "王", "瓜", "瓦", "甘", "生", "用", "田", "疋", "疒", "癶", "白", "皮", "皿", "目", "矛", "矢",
  "石", "示", "礻", "禸", "禾", "穴", "立", "竹", "米", "糸", "纟", "缶", "网", "羊", "羽", "老", "而", "耒", "耳", "聿",
  "肉", "臣", "自", "至", "臼", "舌", "舛", "舟", "艮", "色", "艸", "艹", "虍", "虫", "血", "行", "衣", "衤", "襾", "见",
  "角", "言", "讠", "谷", "豆", "豕", "豸", "贝", "赤", "走", "足", "身", "车", "辛", "辰", "辵", "辶", "邑", "阝", "酉",
  "釆", "里", "金", "钅", "长", "门", "阜", "隶", "隹", "雨", "青", "非", "面", "革", "韦", "韭", "音", "页", "风", "飞",
  "食", "饣", "首", "香", "马", "骨", "高", "髟", "鬥", "鬯", "鬲", "鬼", "鱼", "鸟", "卤", "鹿", "麦", "麻", "黄", "黍",
  "黑", "黹", "黾", "鼎", "鼓", "鼠", "鼻", "齐", "齿", "龙", "龟", "龠"
];

function RadicalPuzzleGame({ payload, onAnswer, onReady }) {
  const { t } = useTranslation();
  const [placed, setPlaced] = useState([]);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const startedAt = useRef(Date.now());

  const correctParts = payload.correctRadicals || [];

  const allParts = useMemo(() => {
    const correctSet = new Set(correctParts);
    const availableDecoys = ALL_KANGXI_RADICALS.filter((r) => !correctSet.has(r));
    const decoys = shuffle(availableDecoys).slice(0, 4);
    const combined = shuffle([...correctParts, ...decoys]);
    return combined.map((text, id) => ({ id, text }));
  }, [payload]);

  const free = allParts.filter((item) => !placed.includes(item.id));
  const attempt = placed.map((id) => allParts[id]?.text).filter(Boolean);
  const isMatch = attempt.join("") === correctParts.join("");

  function check() {
    if (checked || placed.length === 0) return;
    setChecked(true);
    const ok = isMatch;
    setCorrect(ok);
    onAnswer?.({ correct: ok, ms: Date.now() - startedAt.current, q: { ref: `puzzle:${payload.hanzi}` } });
    onReady();
  }

  return (
    <div className={styles.quiz}>
      <div className={styles.prompt}>
        <span className={styles.bigHanzi}>🧩</span>
        <p className={styles.question}>
          Соберите знак <strong>{payload.hanzi}</strong> из частей:
        </p>
      </div>

      <div className={`${styles.answerLine} ${checked ? (correct ? styles.lineOk : styles.lineBad) : ""}`}>
        {placed.length === 0 && <span className={styles.placeholder}>Нажимайте на ключи в нужном порядке</span>}
        {placed.map((id) => (
          <button
            key={id}
            type="button"
            disabled={checked}
            className={styles.tile}
            onClick={() => setPlaced((p) => p.filter((x) => x !== id))}
          >
            {allParts[id]?.text}
          </button>
        ))}
      </div>

      <div className={styles.tilePool}>
        {free.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={checked}
            className={styles.tile}
            onClick={() => setPlaced((p) => [...p, item.id])}
          >
            {item.text}
          </button>
        ))}
      </div>

      {checked && (
        <Feedback
          ok={correct}
          explain={correct ? "Отлично! Знак собран верно." : `Правильный порядок: ${correctParts.join(" + ")}`}
          t={t}
        />
      )}

      {!checked && (
        <button type="button" className={styles.primary} disabled={placed.length === 0} onClick={check}>
          {t("slides.check", "Проверить")}
        </button>
      )}
    </div>
  );
}

function RadicalBuildGame({ payload, onAnswer, onReady }) {
  const { t } = useTranslation();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const startedAt = useRef(Date.now());

  const items = payload.items || [];
  const item = items[currentIdx];

  useEffect(() => {
    startedAt.current = Date.now();
    setPlaced([]);
    setChecked(false);
    setCorrect(false);
  }, [currentIdx]);

  if (!item) {
    useEffect(() => onReady(), []);
    return null;
  }

  const targetHanzi = item.target || item.targetHanzi || item[0] || "汉";
  const correctParts = item.answer || item.correctOrder || item[2] || [];
  const pool = useMemo(() => {
    const correctSet = new Set(correctParts);
    const availableDecoys = ALL_KANGXI_RADICALS.filter((r) => !correctSet.has(r));
    const decoys = shuffle(availableDecoys).slice(0, 4);
    const combined = shuffle([...correctParts, ...decoys]);
    return combined.map((text, id) => ({ id, text }));
  }, [item]);

  const free = pool.filter((x) => !placed.includes(x.id));
  const attempt = placed.map((id) => pool.find((x) => x.id === id)?.text).filter(Boolean);
  const isMatch = attempt.join("") === correctParts.join("");

  function check() {
    if (checked || placed.length === 0) return;
    setChecked(true);
    const ok = isMatch;
    setCorrect(ok);
    onAnswer?.({ correct: ok, ms: Date.now() - startedAt.current, q: { ref: `build:${targetHanzi}` } });
    if (currentIdx + 1 >= items.length) onReady();
  }

  function nextItem() {
    if (currentIdx + 1 >= items.length) {
      onReady();
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  return (
    <div className={styles.quiz}>
      <p className={styles.counterSmall}>{currentIdx + 1} / {items.length}</p>
      <div className={styles.prompt}>
        <span className={styles.bigHanzi}>{targetHanzi}</span>
        <p className={styles.question}>Соберите знак из блоков:</p>
      </div>

      <div className={`${styles.answerLine} ${checked ? (correct ? styles.lineOk : styles.lineBad) : ""}`}>
        {placed.length === 0 && <span className={styles.placeholder}>Выберите части в нужном порядке</span>}
        {placed.map((id) => {
          const tile = pool.find((x) => x.id === id);
          if (!tile) return null;
          return (
            <button key={id} type="button" disabled={checked} className={styles.tile} onClick={() => setPlaced((p) => p.filter((x) => x !== id))}>
              {tile.text}
            </button>
          );
        })}
      </div>

      <div className={styles.tilePool}>
        {free.map((x) => (
          <button key={x.id} type="button" disabled={checked} className={styles.tile} onClick={() => setPlaced((p) => [...p, x.id])}>
            {x.text}
          </button>
        ))}
      </div>

      {checked && (
        <Feedback
          ok={correct}
          explain={correct ? "Верно! Отличная работа." : `Правильный порядок: ${correctParts.join(" + ")}`}
          t={t}
        />
      )}

      {!checked ? (
        <button type="button" className={styles.primary} disabled={placed.length === 0} onClick={check}>
          {t("slides.check", "Проверить")}
        </button>
      ) : (
        currentIdx + 1 < items.length && (
          <button type="button" className={styles.primary} onClick={nextItem}>
            {t("slides.next", "Далее")}
          </button>
        )
      )}
    </div>
  );
}

function GameSlide({ payload, onAnswer, onReady }) {
  const { t } = useTranslation();
  const prompts = { listen: t("slides.whatHeard"), emoji: t("slides.whichWordFits") };
  
 const buildItems = useMemo(
    () => (payload.type === "build" ? (payload.items || []).map((x) => ({ ...x, tiles: shuffle(x.answer || []) })) : []),
    [payload]
  );

  const quizItems = useMemo(
    () =>
      (payload.items || []).map((x) => ({
        ...x,
        q: x.q || prompts[payload.type],
        big: payload.type === "listen" ? undefined : x.big,
        optionsBig: x.optionsBig ?? payload.big,
      })),
    [payload, prompts]
  );

  return (
    <div className={styles.gameBox}>
      {payload.title && <h3 className={styles.title}>{payload.title}</h3>}
      {payload.type === "match" && <MatchGame payload={payload} onAnswer={onAnswer} onReady={onReady} />}
      {(payload.type === "listen" || payload.type === "emoji") && <MiniQuiz questions={quizItems} onAnswer={onAnswer} onDone={onReady} autoSpeak={payload.type === "listen"} />}
      {payload.type === "build" && <OrderBuilder items={buildItems} onAnswer={onAnswer} onDone={onReady} />}
      {payload.type === "chatsim" && <ChatSimGame payload={payload} onAnswer={onAnswer} onReady={onReady} />}
      {payload.type === "bughunt" && <BugHuntGame payload={payload} onAnswer={onAnswer} onReady={onReady} />}
      {payload.type === "tone_visualizer" && <ToneVizGame payload={payload} onReady={onReady} />}
      {payload.type === "radical_puzzle" && <RadicalPuzzleGame payload={payload} onAnswer={onAnswer} onReady={onReady} />}
      {payload.type === "radical_build" && <RadicalBuildGame payload={payload} onAnswer={onAnswer} onReady={onReady} />}
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

export function Slide({ slide, payload, onReady, onAnswer, onWrite }) {
  const props = { payload, onReady, onAnswer, onWrite };
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
    case "write":
      return <WriteSlide {...props} />;
    default:
      return null;
  }
}