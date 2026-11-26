import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Square, Volume2, Info, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import PageBanner from "../../components/ui/PageBanner";
import { DICT } from "../../data/dictionary";
import { learnerLevel } from "../../lib/progress";
import { speakZh } from "../../lib/tts";
import { detectPitch, contourFromPoints, scoreContour, toSemitones } from "../../lib/pitch";
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
const H = 200;
const PAD = 30;
const MAX_MS = 3500;

function getTonePath(tone, w, h) {
  const bottom = h - PAD;
  const top = PAD;
  const mid = h / 2;
  const x0 = PAD;
  const x1 = w - PAD;
  switch (tone) {
    case 1: return `M ${x0} ${top + 15} L ${x1} ${top + 15}`;
    case 2: return `M ${x0} ${mid + 20} C ${x0 + (x1 - x0) * 0.3} ${mid + 10}, ${x0 + (x1 - x0) * 0.7} ${top + 20}, ${x1} ${top + 10}`;
    case 3: return `M ${x0} ${mid - 10} C ${x0 + (x1 - x0) * 0.25} ${mid + 35}, ${x0 + (x1 - x0) * 0.55} ${bottom - 10}, ${x0 + (x1 - x0) * 0.75} ${bottom - 10} S ${x1 - PAD} ${mid - 5}, ${x1} ${mid - 25}`;
    case 4: return `M ${x0} ${top + 12} C ${x0 + (x1 - x0) * 0.3} ${top + 25}, ${x0 + (x1 - x0) * 0.7} ${bottom - 30}, ${x1} ${bottom - 10}`;
    default: return "";
  }
}

function userPath(semitones) {
  if (!semitones || semitones.length < 2) return "";
  const mid = H / 2;
  const scale = 13;
  return semitones
    .map((s, i) => {
      const x = PAD + (i / (semitones.length - 1)) * (W - PAD * 2);
      const y = Math.max(PAD - 10, Math.min(H - PAD + 10, mid - s * scale));
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
    const contour = contourFromPoints(s.points);
    if (!contour) {
      setError("noVoice");
      setPhase("idle");
      return;
    }
    const target = toneRef.current;
    const scored = scoreContour(contour, target);
    setResult({ ...scored, contour, target });
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
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
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
    const s = { stream, ctx, points: [], raf: 0, startedAt: performance.now() };
    session.current = s;
    let last = 0;

    const loop = (now) => {
      if (session.current !== s) return;
      if (now - last >= 25) {
        last = now;
        analyser.getFloatTimeDomainData(buffer);
        const r = detectPitch(buffer, ctx.sampleRate);
        if (r && r.clarity >= 0.85) {
          s.points.push({ freq: r.freq, clarity: r.clarity });
          if (s.points.length > 1 && s.points.length % 3 === 0) setLive(toSemitones(s.points.map((p) => p.freq)));
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
  const shown = recording ? live : result?.contour;
  const score = result?.score;
  const good = score !== undefined && score >= 80;
  const bestOther = result && result.best.tone !== result.target ? result.best.tone : null;

  return (
    <div className={styles.container}>
      <PageBanner color="#3C8D93" hanzi="声" kicker={t("toneLab.kicker")} title={t("nav.tones")} subtitle={t("toneLab.subtitle")} />

      <div className={styles.grid}>
        <div className={styles.col}>
          <div className={styles.card}>
            <p className={styles.kicker}>{t("toneLab.target")}</p>
            <div className={styles.syllableRow}>
              <span className={styles.syllable} style={{ color: tone.color }}>{targetSyllable}</span>
              <button type="button" className={styles.audioBtn} onClick={() => speakZh(targetHanzi, 0.8)} aria-label={t("toneLab.hear")}>
                <Volume2 size={20} strokeWidth={1.7} />
              </button>
            </div>
            <div className={styles.pill} style={{ backgroundColor: `${tone.color}14`, border: `1px solid ${tone.color}40`, color: tone.color }}>
              {t(`toneLab.tone.${tone.number}.name`)} · {t(`toneLab.tone.${tone.number}.desc`)}
            </div>
            <p className={styles.example}>{t("toneLab.example")}: <em>{t(`toneLab.tone.${tone.number}.example`)}</em></p>
          </div>

          <div className={styles.toneGrid}>
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
                    boxShadow: active ? `0 4px 0 ${item.color}55` : "0 4px 0 var(--border)",
                  }}
                >
                  <span className={styles.toneMark} style={{ color: active ? item.color : "var(--foreground)" }}>{item.mark}</span>
                  <span className={styles.toneName} style={{ color: active ? item.color : "var(--muted-foreground)" }}>
                    {t(`toneLab.tone.${item.number}.name`)}
                  </span>
                  <span className={styles.toneDesc}>{t(`toneLab.tone.${item.number}.desc`)}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.card}>
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

          <div className={styles.micWrap}>
            <button
              type="button"
              className={`${styles.micBtn} ${recording ? styles.micRecording : ""}`}
              onClick={recording ? stop : start}
            >
              {recording ? <Square size={30} fill="currentColor" /> : <Mic size={36} strokeWidth={1.6} />}
            </button>
            <span className={styles.micStatus}>{recording ? t("toneLab.recording") : t("toneLab.press")}</span>
            {error && <p className={styles.errorText}>{t(`toneLab.errors.${error}`)}</p>}
          </div>
        </div>

        <div className={styles.col}>
          <div className={styles.card}>
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
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={f} x1={PAD} y1={H * f} x2={W - PAD} y2={H * f} stroke="var(--border)" strokeWidth={0.6} opacity={0.7} />
              ))}
              <text x={8} y={36} fontSize={9} fill="var(--muted-foreground)">{t("toneLab.high")}</text>
              <text x={8} y={H - 18} fontSize={9} fill="var(--muted-foreground)">{t("toneLab.low")}</text>
              {TONES.map((item) => (
                <path
                  key={item.number}
                  d={getTonePath(item.number, W, H)}
                  stroke={item.color}
                  fill="none"
                  strokeLinecap="round"
                  strokeWidth={activeTone === item.number ? 3 : 1.2}
                  strokeDasharray={activeTone === item.number ? "none" : "6 4"}
                  opacity={activeTone === item.number ? 0.7 : 0.2}
                />
              ))}
              {shown && shown.length > 1 && (
                <path d={userPath(shown)} stroke="var(--foreground)" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={recording ? 0.55 : 0.9} />
              )}
            </svg>
            <div className={styles.legend}>
              <span><i style={{ background: tone.color }} />{t("toneLab.legendTarget", { tone: t(`toneLab.tone.${tone.number}.name`) })}</span>
              <span><i style={{ background: "var(--muted-foreground)", opacity: 0.5 }} />{t("toneLab.legendOthers")}</span>
              <span><i style={{ background: "var(--foreground)" }} />{t("toneLab.legendYou")}</span>
            </div>
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

          <div className={styles.card}>
            <p className={styles.kicker}>{t("toneLab.accuracy")}</p>
            <div className={styles.accList}>
              {TONES.map((item) => {
                const avg = average(state.toneScores?.[item.number]);
                return (
                  <div key={item.number} className={styles.accRow}>
                    <span className={styles.accMark} style={{ color: item.color }}>{item.mark}</span>
                    <div className={styles.accTrack}>
                      <div className={styles.accFill} style={{ width: `${avg || 0}%`, backgroundColor: item.color }} />
                    </div>
                    <span className={styles.accValue} style={{ color: avg !== null && avg >= 80 ? "var(--accent)" : "var(--primary)" }}>
                      {avg === null ? "—" : `${avg}%`}
                    </span>
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