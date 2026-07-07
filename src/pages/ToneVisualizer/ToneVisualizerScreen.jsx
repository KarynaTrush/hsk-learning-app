import { useState, useRef, useEffect } from "react";
import { Mic, Volume2, Info } from "lucide-react";
import styles from "./ToneVisualizer.module.css";

const tones = [
  { mark: "ā", number: 1, label: "I ton", desc: "płaski wysoki", color: "#6B8CAE", example: "māma (mama)" },
  { mark: "á", number: 2, label: "II ton", desc: "wznoszący", color: "#4F7942", example: "máfan (kłopot)" },
  { mark: "ǎ", number: 3, label: "III ton", desc: "opadająco-wznoszący", color: "#D4A843", example: "mǎ (koń)" },
  { mark: "à", number: 4, label: "IV ton", desc: "opadający", color: "#C83E34", example: "mà (besztać)" },
];
function getTonePath(tone, w, h) {
  const pad = 30;
  const bottom = h - pad;
  const top = pad;
  const mid = h / 2;
  const x0 = pad;
  const x1 = w - pad;
  switch (tone) {
    case 1: return `M ${x0} ${top + 15} L ${x1} ${top + 15}`;
    case 2: return `M ${x0} ${mid + 20} C ${x0 + (x1 - x0) * 0.3} ${mid + 10}, ${x0 + (x1 - x0) * 0.7} ${top + 20}, ${x1} ${top + 10}`;
    case 3: return `M ${x0} ${mid - 10} C ${x0 + (x1-x0)*0.25} ${mid + 35}, ${x0 + (x1-x0)*0.55} ${bottom - 10}, ${x0 + (x1-x0)*0.75} ${bottom - 10} S ${x1-pad} ${mid - 5}, ${x1} ${mid - 25}`;
    case 4: return `M ${x0} ${top + 12} C ${x0 + (x1-x0)*0.3} ${top + 25}, ${x0 + (x1-x0)*0.7} ${bottom - 30}, ${x1} ${bottom - 10}`;
    default: return "";
  }
}
function getUserPath(w, h) {
  const pad = 30;
  const top = pad;
  const x0 = pad;
  const x1 = w - pad;
  return `M ${x0} ${top + 22} C ${x0+60} ${top+10}, ${x0+130} ${top+26}, ${x0+200} ${top+14} S ${x1-50} ${top+18}, ${x1} ${top+16}`;
}

export default function ToneVisualizerScreen() {
  const [activeTone, setActiveTone] = useState(1);
  const [recording, setRecording] = useState(false);
  const [hasDone, setHasDone] = useState(false);
  const [score, setScore] = useState(null);
  const timerRef = useRef(null);

  function handleMicPress() {
    if (recording) return;
    setRecording(true);
    setHasDone(false);
    setScore(null);
    timerRef.current = setTimeout(() => {
      setRecording(false);
      setHasDone(true);
      setScore(78 + Math.floor(Math.random() * 18));
    }, 2200);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const syllables = ["mā", "má", "mǎ", "mà"];
  const currentSyllable = syllables[activeTone - 1];
  const activeToneData = tones[activeTone - 1];

  const canvasW = 560;
  const canvasH = 200;

  return (
    <div className={styles.container}>
      <div className={styles.gridMain}>
        <div className={styles.flexCol}>
          <div className={styles.targetCard}>
            <p className={styles.labelSubtitle}>DOCELOWA SYLABA</p>
            <div className="flex items-center gap-4 mb-4">
              <span className={styles.hanziBig} style={{ color: activeToneData.color }}>
                {currentSyllable}
              </span>
              <button className={styles.audioButton}>
                <Volume2 size={20} color="var(--primary)" strokeWidth={1.5} />
              </button>
            </div>
            
            <div 
              className={styles.toneDescription}
              style={{ backgroundColor: `${activeToneData.color}12`, border: `1px solid ${activeToneData.color}30` }}
            >
              <p className={styles.toneDescriptionText} style={{ color: activeToneData.color }}>
                {activeToneData.label} — {activeToneData.desc}
              </p>
            </div>
            <p className={styles.exampleText}>
              Przykład: <em>{activeToneData.example}</em>
            </p>
          </div>
          <div className={styles.tonesGrid}>
            {tones.map((t) => (
              <button
                key={t.number}
                onClick={() => { setActiveTone(t.number); setHasDone(false); setScore(null); }}
                className={styles.toneSelectButton}
                style={{
                  backgroundColor: activeTone === t.number ? `${t.color}10` : "var(--card)",
                  borderColor: activeTone === t.number ? t.color : "var(--border)",
                  boxShadow: activeTone === t.number ? `0 2px 12px ${t.color}20` : "none",
                }}
              >
                <span 
                  className={styles.btnHanzi}
                  style={{ 
                    fontWeight: activeTone === t.number ? 700 : 400,
                    color: activeTone === t.number ? t.color : "var(--foreground)"
                  }}
                >
                  {t.mark}
                </span>
                <span 
                  className={styles.btnLabel}
                  style={{ 
                    color: activeTone === t.number ? t.color : "var(--muted-foreground)",
                    fontWeight: activeTone === t.number ? 600 : 400 
                  }}
                >
                  {t.label}
                </span>
                <span className={styles.btnDesc}>{t.desc}</span>
              </button>
            ))}
          </div>
          <div className={styles.micWrapper}>
            <button
              onMouseDown={handleMicPress}
              onTouchStart={handleMicPress}
              className="flex flex-col items-center gap-2"
              style={{ cursor: recording ? "not-allowed" : "pointer" }}
            >
              <div
                className={styles.micButton}
                style={{
                  backgroundColor: recording ? "rgba(200,62,52,0.12)" : "var(--primary)",
                  border: recording ? "2.5px solid var(--primary)" : "3px solid transparent",
                  boxShadow: recording
                    ? "0 0 0 10px rgba(200,62,52,0.10), 0 4px 24px rgba(200,62,52,0.18)"
                    : "0 6px 28px rgba(200,62,52,0.38)",
                  transform: recording ? "scale(0.94)" : "scale(1)",
                }}
              >
                <Mic size={36} color={recording ? "var(--primary)" : "white"} strokeWidth={1.5} />
              </div>
              <span
                className={styles.micStatusText}
                style={{
                  color: recording ? "var(--primary)" : "var(--muted-foreground)",
                  fontWeight: recording ? 500 : 400,
                }}
              >
                {recording ? "Nagrywam..." : "Naciśnij i mów"}
              </span>
            </button>
          </div>
        </div>
        <div className={styles.flexCol}>
          <div className={styles.visualizerCard}>
            <div className={styles.visualizerHeader}>
              <div>
                <p className={styles.visTitle}>Wizualizacja tonu głosowego</p>
                <p className={styles.visSub}>Twój głos (czarna linia) vs. wzorzec (kolorowe linie)</p>
              </div>
              <div className="flex items-center gap-2">
                {hasDone && score !== null && (
                  <div
                    className={styles.scoreBadge}
                    style={{
                      backgroundColor: score >= 80 ? "rgba(79,121,66,0.1)" : "rgba(200,62,52,0.08)",
                      border: `1px solid ${score >= 80 ? "rgba(79,121,66,0.3)" : "rgba(200,62,52,0.25)"}`,
                    }}
                  >
                    <span 
                      className={styles.scoreText}
                      style={{ color: score >= 80 ? "var(--accent)" : "var(--primary)" }}
                    >
                      {score}% zgodności
                    </span>
                  </div>
                )}
                {recording && (
                  <div className={styles.recordingBadge}>
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                    <span className={styles.recordingText}>NAGRYWAM</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              <svg
                width="100%"
                viewBox={`0 0 ${canvasW} ${canvasH}`}
                preserveAspectRatio="xMidYMid meet"
                className={styles.svgCanvas}
              >
                {[0.25, 0.5, 0.75].map((frac) => (
                  <line
                    key={frac}
                    x1={30}
                    y1={canvasH * frac}
                    x2={canvasW - 30}
                    y2={canvasH * frac}
                    stroke="var(--border)"
                    strokeWidth={0.5}
                    opacity={0.6}
                  />
                ))}
                <text x={8} y={36} fontSize={9} fill="var(--muted-foreground)" fontFamily="Inter, sans-serif">Wysoko</text>
                <text x={8} y={canvasH - 18} fontSize={9} fill="var(--muted-foreground)" fontFamily="Inter, sans-serif">Nisko</text>
                {tones.map((t) => (
                  <path
                    key={t.number}
                    d={getTonePath(t.number, canvasW, canvasH)}
                    stroke={t.color}
                    strokeWidth={activeTone === t.number ? 2.5 : 1.2}
                    strokeDasharray={activeTone === t.number ? "none" : "6 4"}
                    fill="none"
                    opacity={activeTone === t.number ? 0.55 : 0.2}
                    strokeLinecap="round"
                  />
                ))}
                <path
                  d={getTonePath(activeTone, canvasW, canvasH)}
                  stroke={activeToneData.color}
                  strokeWidth={3}
                  fill="none"
                  opacity={0.7}
                  strokeLinecap="round"
                />
                {(recording || hasDone) && (
                  <path
                    d={getUserPath(canvasW, canvasH)}
                    stroke="var(--foreground)"
                    strokeWidth={hasDone ? 3 : 2}
                    fill="none"
                    opacity={hasDone ? 0.85 : 0.45}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {recording && (
                  <circle cx={canvasW - 20} cy={22} r={6} fill="var(--primary)" opacity={0.9}>
                    <animate attributeName="opacity" values="0.9;0.2;0.9" dur="0.7s" repeatCount="indefinite" />
                  </circle>
                )}
                {tones.map((t) => {
                  const endY = [canvasH * 0.15, canvasH * 0.13, canvasH * 0.38, canvasH * 0.85][t.number - 1];
                  return (
                    <text
                      key={t.number}
                      x={canvasW - 26}
                      y={endY}
                      fontSize={9}
                      fill={t.color}
                      fontFamily="Inter, sans-serif"
                      fontWeight={activeTone === t.number ? 700 : 400}
                      opacity={activeTone === t.number ? 0.9 : 0.45}
                    >
                      {t.mark}
                    </text>
                  );
                })}
              </svg>
              <div className={styles.legendWrapper}>
                <div className={styles.legendItem}>
                  <div className="w-8 h-0.5 rounded opacity-70" style={{ backgroundColor: activeToneData.color }} />
                  <span className={styles.legendLabel}>Wzorzec ({activeToneData.label})</span>
                </div>
                <div className={styles.legendItem}>
                  <div className="w-8 h-0.5 rounded opacity-40 bg-[var(--muted-foreground)]" />
                  <span className={styles.legendLabel}>Inne tony (odniesienie)</span>
                </div>
                <div className={styles.legendItem}>
                  <div className="w-8 h-0.5 rounded opacity-70 bg-[var(--foreground)]" />
                  <span className={styles.legendLabel}>Twój głos</span>
                </div>
              </div>
            </div>
          </div>
          {hasDone && score !== null && (
            <div
              className={styles.feedbackCard}
              style={{
                backgroundColor: score >= 80 ? "rgba(79,121,66,0.06)" : "rgba(200,62,52,0.05)",
                borderColor: score >= 80 ? "rgba(79,121,66,0.25)" : "rgba(200,62,52,0.22)",
              }}
            >
              <div className={styles.feedbackContent}>
                <div
                  className={styles.feedbackIconBox}
                  style={{ backgroundColor: score >= 80 ? "rgba(79,121,66,0.1)" : "rgba(200,62,52,0.08)" }}
                >
                  <Info size={18} color={score >= 80 ? "var(--accent)" : "var(--primary)"} strokeWidth={1.5} />
                </div>
                <div>
                  <p 
                    className={styles.feedbackTitle}
                    style={{ color: score >= 80 ? "var(--accent)" : "var(--primary)" }}
                  >
                    {score >= 80 ? "Doskonale! Ton rozpoznany poprawnie." : "Prawie! Małe korekty potrzebne."}
                  </p>
                  <p className={styles.feedbackDesc}>
                    {score >= 80
                      ? `Twój głos zgodny ze wzorcem ${activeToneData.label} w ${score}%. Linia głosowa przebiega poprawnie.`
                      : `Spróbuj ${activeTone === 1 ? "utrzymać ton na stałym, wysokim poziomie przez całą sylabę" : activeTone === 2 ? "zacząć niżej i wyraźniej wznosić ton" : activeTone === 3 ? "wyraźniej opaść, a potem wznieść głos" : "zacząć wyżej i zdecydowanie opaść"}.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className={styles.accuracyCard}>
            <p className={styles.accuracyTitle}>TWOJA CELNOŚĆ TONÓW</p>
            <div className="flex flex-col gap-3">
              {tones.map((t, i) => {
                const accuracies = [85, 72, 61, 90];
                const acc = accuracies[i];
                return (
                  <div key={t.number} className={styles.accuracyRow}>
                    <span className={styles.accuracyMark} style={{ color: t.color }}>
                      {t.mark}
                    </span>
                    <div className={styles.progressBarContainer}>
                      <div
                        className={styles.progressBar}
                        style={{ width: `${acc}%`, backgroundColor: t.color }}
                      />
                    </div>
                    <span
                      className={styles.accuracyPercent}
                      style={{ color: acc >= 80 ? "var(--accent)" : "var(--primary)" }}
                    >
                      {acc}%
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