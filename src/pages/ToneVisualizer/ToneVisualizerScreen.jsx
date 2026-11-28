import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Square, Volume2, Info, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { DICT } from "../../data/dictionary";
import { learnerLevel } from "../../lib/progress";
import { speakZh } from "../../lib/tts";
import { detectPitch, contourFromFrames, scoreContour, chartTemplate, alignToTemplate } from "../../lib/pitch";
import styles from "./ToneVisualizer.module.css";

const TONES = [
  { number: 1, mark: "ā", syllable: "mā", hanzi: "妈", color: "#6B8CAE" },
  { number: 2, mark: "á", syllable: "má", hanzi: "麻", color: "#4F7942" },
  { number: 3, mark: "ǎ", syllable: "mǎ", hanzi: "马", color: "#D4A843" },
  { number: 4, mark: "à", syllable: "mà", hanzi: "骂", color: "#C83E34" },
];

const TONE_CHARS = {
  1: "āēīōūǖ",
  2: "áéíóúǘ",
  3: "ǎěǐǒǔǚ",
  4: "àèìòùǜ",
};
const WORDS_PER_PAGE = 8;

function toneOfSyllable(pinyin) {
  if (!pinyin || /[\s/'’]/.test(pinyin)) return 0;
  for (const [tone, chars] of Object.entries(TONE_CHARS)) {
    if ([...pinyin].some((c) => chars.includes(c))) return Number(tone);
  }
  return 0;
}

function isSingleHanzi(hanzi) {
  return [...hanzi].length === 1 && /\p{Script=Han}/u.test(hanzi);
}

const W = 560;
const H = 230;
const PAD_X = 34;
const PAD_Y = 28;
const MAX_MS = 4500;
const SILENCE_MS = 700;

function levelY(level) {
  return PAD_Y + ((5.6 - level) / 5.2) * (H - PAD_Y * 2);
}

function linePath(levels) {
  if (!levels || levels.length < 2) return "";
  return levels
    .map((level, i) => {
      const x = PAD_X + (i / (levels.length - 1)) * (W - PAD_X * 2);
      const y = Math.max(PAD_Y - 14, Math.min(H - PAD_Y + 14, levelY(level)));
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function average(list) {
  return list && list.length ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : null;
}

export default function ToneVisualizerScreen({ initialTone }) {
  const { t, i18n } = useTranslation();
  const { state, recordTone, recordExercise } = useAppState();
  const lang = i18n.resolvedLanguage || "ru";
  const [activeTone, setActiveTone] = useState(initialTone || 1);
  const [pickedWord, setPickedWord] = useState(null);
  const [wordPage, setWordPage] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [live, setLive] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const toneRef = useRef(initialTone || 1);
  const session = useRef(null);

  const tone = TONES[activeTone - 1];
  const level = learnerLevel(state);

  const wordsByTone = useMemo(() => {
    const groups = { 1: [], 2: [], 3: [], 4: [] };
    for (const entry of DICT.values()) {
      if (!entry.hsk || entry.hsk > level || !isSingleHanzi(entry.hanzi)) continue;
      const n = toneOfSyllable(entry.pinyin);
      if (n) groups[n].push(entry);
    }
    for (const list of Object.values(groups)) list.sort((a, b) => a.hsk - b.hsk || a.pinyin.localeCompare(b.pinyin));
    return groups;
  }, [level]);

  const toneWords = wordsByTone[activeTone] || [];
  const pageCount = Math.max(1, Math.ceil(toneWords.length / WORDS_PER_PAGE));
  const shownWords = toneWords.slice((wordPage % pageCount) * WORDS_PER_PAGE, (wordPage % pageCount) * WORDS_PER_PAGE + WORDS_PER_PAGE);
  const targetSyllable = pickedWord ? pickedWord.pinyin : tone.syllable;
  const targetHanzi = pickedWord ? pickedWord.hanzi : tone.hanzi;

  useEffect(() => {
    toneRef.current = activeTone;
  }, [activeTone]);

  useEffect(() => () => release(), []);

  function release() {
    const s = session.current;
    if (!s) return null;
    cancelAnimationFrame(s.raf);
    s.stream.getTracks().forEach((track) => track.stop());
    s.ctx.close().catch(() => {});
    session.current = null;
    return s;
  }

  function finish(s) {
    const extracted = contourFromFrames(s.frames);
    if (!extracted) {
      setError("noVoice");
      setPhase("idle");
      return;
    }
    const target = toneRef.current;
    const scored = scoreContour(extracted.contour, target);
    setResult({ ...scored, contour: extracted.contour, target });
    setLive([]);
    setPhase("done");
    recordTone(target, scored.score);
    recordExercise({ ref: `tone:${target}`, correct: scored.score >= 70, ms: Math.round(performance.now() - s.startedAt), type: "tone-record", skill: "tones" });
  }

  function stop() {
    const s = release();
    if (s) finish(s);
  }

  async function start() {
    setError("");
    setResult(null);
    setLive([]);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("micUnsupported");
      return;
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true },
      });
    } catch {
      setError("micDenied");
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buffer = new Float32Array(analyser.fftSize);
    const s = { stream, ctx, frames: [], raf: 0, startedAt: performance.now(), peak: 0, voiced: 0, lastVoiced: 0 };
    session.current = s;
    let last = 0;

    const loop = (now) => {
      if (session.current !== s) return;
      if (now - last >= 25) {
        last = now;
        analyser.getFloatTimeDomainData(buffer);
        const r = detectPitch(buffer, ctx.sampleRate);
        if (r) {
          s.peak = Math.max(s.peak, r.rms);
          s.frames.push({ t: now - s.startedAt, freq: r.freq, clarity: r.clarity, rms: r.rms });
          if (r.clarity >= 0.75 && r.rms >= Math.max(0.004, s.peak * 0.2)) {
            s.voiced += 1;
            s.lastVoiced = now;
          }
          if (s.frames.length % 4 === 0) {
            const partial = contourFromFrames(s.frames);
            if (partial) setLive(alignToTemplate(partial.contour, toneRef.current));
          }
        }
        if (s.voiced >= 8 && now - s.lastVoiced > SILENCE_MS) {
          stop();
          return;
        }
      }
      if (now - s.startedAt > MAX_MS) {
        stop();
        return;
      }
      s.raf = requestAnimationFrame(loop);
    };
    setPhase("recording");
    s.raf = requestAnimationFrame(loop);
  }

  function pickTone(n) {
    if (phase === "recording") release();
    setPhase("idle");
    setActiveTone(n);
    setPickedWord(null);
    setWordPage(0);
    setResult(null);
    setLive([]);
    setError("");
  }

  const recording = phase === "recording";
  const shown = recording ? live : result ? alignToTemplate(result.contour, result.target) : null;
  const score = result?.score;
  const good = score !== undefined && score >= 80;
  const bestOther = result && result.best.tone !== result.target && result.best.score >= 50 ? result.best.tone : null;

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <div className={styles.col}>
          <div className={styles.toneRow}>
            {TONES.map((item) => {
              const active = activeTone === item.number;
              return (
                <button
                  key={item.number}
                  type="button"
                  className={styles.toneBtn}
                  onClick={() => pickTone(item.number)}
                  style={{
                    borderColor: active ? item.color : "var(--border)",
                    backgroundColor: active ? `${item.color}12` : "var(--card)",
                    boxShadow: active ? `0 3px 0 ${item.color}55` : "0 3px 0 var(--border)",
                  }}
                >
                  <span className={styles.toneMark} style={{ color: active ? item.color : "var(--foreground)" }}>{item.mark}</span>
                  <span className={styles.toneName} style={{ color: active ? item.color : "var(--muted-foreground)" }}>
                    {t(`toneLab.tone.${item.number}.name`)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className={`${styles.card} ${styles.targetCard}`}>
            <div className={styles.targetHead}>
              <p className={styles.kicker}>{t("toneLab.target")}</p>
              <div className={styles.pill} style={{ backgroundColor: `${tone.color}14`, border: `1px solid ${tone.color}40`, color: tone.color }}>
                {t(`toneLab.tone.${tone.number}.desc`)}
              </div>
            </div>
            <div className={styles.targetBody}>
              <div className={styles.targetInfo}>
                <div className={styles.syllableRow}>
                  <span className={styles.syllable} style={{ color: tone.color }}>{targetSyllable}</span>
                  <button type="button" className={styles.audioBtn} onClick={() => speakZh(targetHanzi, 0.8)} aria-label={t("toneLab.hear")}>
                    <Volume2 size={20} strokeWidth={1.7} />
                  </button>
                </div>
                <p className={styles.example}>{t("toneLab.example")}: <em>{t(`toneLab.tone.${tone.number}.example`)}</em></p>
              </div>
              <div className={styles.micWrap}>
                <button
                  type="button"
                  className={`${styles.micBtn} ${recording ? styles.micRecording : ""}`}
                  onClick={recording ? stop : start}
                  aria-label={recording ? t("toneLab.recording") : t("toneLab.press")}
                >
                  {recording ? <Square size={26} fill="currentColor" /> : <Mic size={32} strokeWidth={1.6} />}
                </button>
                <span className={styles.micStatus}>{recording ? t("toneLab.recording") : t("toneLab.press")}</span>
              </div>
            </div>
            {error ? <p className={styles.errorText}>{t(`toneLab.errors.${error}`)}</p> : <p className={styles.autoHint}>{t("toneLab.autoHint")}</p>}
          </div>

          <div className={`${styles.card} ${styles.wordsCard}`}>
            <div className={styles.wordsHeader}>
              <div>
                <p className={styles.kicker}>{t("toneLab.wordsTitle")}</p>
                <p className={styles.wordsSub}>{t("toneLab.wordsSub", { level })}</p>
              </div>
              {pageCount > 1 && (
                <button type="button" className={styles.wordsMore} onClick={() => setWordPage((p) => p + 1)} aria-label={t("toneLab.wordsMore")}>
                  <RefreshCw size={16} strokeWidth={1.8} />
                </button>
              )}
            </div>
            {shownWords.length === 0 && <p className={styles.example}>{t("toneLab.wordsEmpty")}</p>}
            <div className={styles.wordGrid}>
              {shownWords.map((w) => {
                const active = pickedWord?.hanzi === w.hanzi;
                return (
                  <button
                    key={w.hanzi}
                    type="button"
                    className={styles.wordBtn}
                    onClick={() => {
                      if (phase === "recording") release();
                      setPhase("idle");
                      setPickedWord(w);
                      setResult(null);
                      setLive([]);
                      setError("");
                      speakZh(w.hanzi, 0.8);
                    }}
                    style={{ borderColor: active ? tone.color : "var(--border)", backgroundColor: active ? `${tone.color}12` : "var(--card)" }}
                  >
                    <span className={styles.wordHanzi} style={{ color: tone.color }}>{w.hanzi}</span>
                    <span className={styles.wordPinyin}>{w.pinyin}</span>
                    <span className={styles.wordMeaning}>{w.meaning?.[lang] || w.meaning?.en || ""}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.col}>
          <div className={`${styles.card} ${styles.vizCard}`}>
            <div className={styles.vizHeader}>
              <div>
                <p className={styles.vizTitle}>{t("toneLab.vizTitle")}</p>
                <p className={styles.vizSub}>{t("toneLab.vizSub")}</p>
              </div>
              {score !== undefined && !recording && (
                <span className={styles.score} style={{ color: good ? "var(--accent)" : "var(--primary)" }}>
                  {t("toneLab.score", { score })}
                </span>
              )}
              {recording && <span className={styles.rec}><i />{t("toneLab.live")}</span>}
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} preserveAspectRatio="xMidYMid meet">
              {[1, 2, 3, 4, 5].map((l) => (
                <line key={l} x1={PAD_X} y1={levelY(l)} x2={W - PAD_X} y2={levelY(l)} stroke="var(--border)" strokeWidth={0.6} opacity={0.7} />
              ))}
              <text x={8} y={levelY(5) + 3} fontSize={9} fill="var(--muted-foreground)">{t("toneLab.high")}</text>
              <text x={8} y={levelY(1) + 3} fontSize={9} fill="var(--muted-foreground)">{t("toneLab.low")}</text>
              {TONES.map((item) => (
                <path
                  key={item.number}
                  d={linePath(chartTemplate(item.number, 40))}
                  stroke={item.color}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={activeTone === item.number ? 4 : 1.2}
                  strokeDasharray={activeTone === item.number ? "none" : "6 4"}
                  opacity={activeTone === item.number ? 0.45 : 0.2}
                />
              ))}
              {shown && shown.length > 1 && (
                <path d={linePath(shown)} stroke="var(--foreground)" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={recording ? 0.6 : 0.95} />
              )}
            </svg>
            <div className={styles.legend}>
              <span><i style={{ background: tone.color }} />{t("toneLab.legendTarget", { tone: t(`toneLab.tone.${tone.number}.name`) })}</span>
              <span><i style={{ background: "var(--muted-foreground)", opacity: 0.5 }} />{t("toneLab.legendOthers")}</span>
              <span><i style={{ background: "var(--foreground)" }} />{t("toneLab.legendYou")}</span>
            </div>
            <p className={styles.shapeHint}>{t("toneLab.shapeHint")}</p>
          </div>

          {result && !recording && (
            <div className={`${styles.feedback} ${good ? styles.feedbackOk : styles.feedbackBad}`}>
              <span className={styles.feedbackIcon}><Info size={18} strokeWidth={1.8} /></span>
              <div>
                <p className={styles.feedbackTitle}>{good ? t("toneLab.good") : t("toneLab.almost")}</p>
                <p className={styles.feedbackText}>
                  {good
                    ? t("toneLab.goodDesc", { tone: t(`toneLab.tone.${result.target}.name`), score })
                    : `${bestOther ? `${t("toneLab.soundsLike", { tone: t(`toneLab.tone.${bestOther}.name`) })} ` : ""}${t(`toneLab.hint.${result.target}`)}`}
                </p>
              </div>
            </div>
          )}

          <div className={`${styles.card} ${styles.accCard}`}>
            <p className={styles.kicker}>{t("toneLab.accuracy")}</p>
            <div className={styles.accGrid}>
              {TONES.map((item) => {
                const avg = average(state.toneScores?.[item.number]);
                return (
                  <div key={item.number} className={styles.accTile}>
                    <div className={styles.accTop}>
                      <span className={styles.accMark} style={{ color: item.color }}>{item.mark}</span>
                      <span className={styles.accValue} style={{ color: avg !== null && avg >= 80 ? "var(--accent)" : "var(--primary)" }}>
                        {avg === null ? "—" : `${avg}%`}
                      </span>
                    </div>
                    <div className={styles.accTrack}>
                      <div className={styles.accFill} style={{ width: `${avg || 0}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
