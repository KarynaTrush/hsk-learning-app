import { useState, useRef, useEffect } from "react";
import { Mic, Volume2, Info } from "lucide-react";

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
    <div className="p-8" style={{ maxWidth: "1100px", margin: "0 auto" }}>

      {/* Split layout: left controls + right canvas */}
      <div className="grid gap-8" style={{ gridTemplateColumns: "380px 1fr" }}>

        {/* ── LEFT: Target syllable + tone selector + mic ── */}
        <div className="flex flex-col gap-5">

          {/* Target syllable card */}
          <div
            className="rounded-2xl border border-border bg-card p-7 flex flex-col items-center text-center"
            style={{ boxShadow: "0 2px 24px rgba(26,26,26,0.07)" }}
          >
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)", letterSpacing: "0.08em", marginBottom: "16px" }}>
              DOCELOWA SYLABA
            </p>

            {/* Large syllable display */}
            <div className="flex items-center gap-4 mb-4">
              <span
                style={{
                  fontFamily: "'Noto Serif SC', serif",
                  fontSize: "88px",
                  fontWeight: 700,
                  color: activeToneData.color,
                  lineHeight: 1,
                }}
              >
                {currentSyllable}
              </span>
              <button
                className="w-12 h-12 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--secondary)" }}
              >
                <Volume2 size={20} color="var(--primary)" strokeWidth={1.5} />
              </button>
            </div>

            {/* Tone info */}
            <div
              className="px-4 py-2 rounded-xl mb-2"
              style={{ backgroundColor: `${activeToneData.color}12`, border: `1px solid ${activeToneData.color}30` }}
            >
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: activeToneData.color }}>
                {activeToneData.label} — {activeToneData.desc}
              </p>
            </div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)" }}>
              Przykład: <em>{activeToneData.example}</em>
            </p>
          </div>

          {/* Tone selector */}
          <div className="grid grid-cols-2 gap-3">
            {tones.map((t) => (
              <button
                key={t.number}
                onClick={() => { setActiveTone(t.number); setHasDone(false); setScore(null); }}
                className="py-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: activeTone === t.number ? `${t.color}10` : "var(--card)",
                  borderColor: activeTone === t.number ? t.color : "var(--border)",
                  boxShadow: activeTone === t.number ? `0 2px 12px ${t.color}20` : "none",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Noto Serif SC', serif",
                    fontSize: "28px",
                    fontWeight: activeTone === t.number ? 700 : 400,
                    color: activeTone === t.number ? t.color : "var(--foreground)",
                    lineHeight: 1,
                  }}
                >
                  {t.mark}
                </span>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
                    color: activeTone === t.number ? t.color : "var(--muted-foreground)",
                    fontWeight: activeTone === t.number ? 600 : 400,
                  }}
                >
                  {t.label}
                </span>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "9px",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {t.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Mic button */}
          <div className="flex flex-col items-center gap-3 py-4">
            <button
              onMouseDown={handleMicPress}
              onTouchStart={handleMicPress}
              className="flex flex-col items-center gap-2"
              style={{ cursor: recording ? "not-allowed" : "pointer" }}
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200"
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
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: recording ? "var(--primary)" : "var(--muted-foreground)",
                  fontWeight: recording ? 500 : 400,
                }}
              >
                {recording ? "Nagrywam..." : "Naciśnij i mów"}
              </span>
            </button>
          </div>
        </div>

        {/* ── RIGHT: Pitch canvas + analysis ── */}
        <div className="flex flex-col gap-5">

          {/* Canvas card */}
          <div
            className="rounded-2xl border border-border bg-card overflow-hidden"
            style={{ boxShadow: "0 2px 24px rgba(26,26,26,0.07)" }}
          >
            {/* Canvas header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--secondary)" }}
            >
              <div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>
                  Wizualizacja tonu głosowego
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)" }}>
                  Twój głos (czarna linia) vs. wzorzec (kolorowe linie)
                </p>
              </div>
              <div className="flex items-center gap-2">
                {hasDone && score !== null && (
                  <div
                    className="px-4 py-1.5 rounded-full"
                    style={{
                      backgroundColor: score >= 80 ? "rgba(79,121,66,0.1)" : "rgba(200,62,52,0.08)",
                      border: `1px solid ${score >= 80 ? "rgba(79,121,66,0.3)" : "rgba(200,62,52,0.25)"}`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: score >= 80 ? "var(--accent)" : "var(--primary)",
                      }}
                    >
                      {score}% zgodności
                    </span>
                  </div>
                )}
                {recording && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary)", animation: "pulse 0.8s infinite" }} />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--primary)", fontWeight: 500 }}>NAGRYWAM</span>
                  </div>
                )}
              </div>
            </div>

            {/* SVG canvas */}
            <div className="p-6">
              <svg
                width="100%"
                viewBox={`0 0 ${canvasW} ${canvasH}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ display: "block", maxHeight: "220px" }}
              >
                {/* Grid lines */}
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

                {/* Y-axis labels */}
                <text x={8} y={36} fontSize={9} fill="var(--muted-foreground)" fontFamily="Inter, sans-serif">Wysoko</text>
                <text x={8} y={canvasH - 18} fontSize={9} fill="var(--muted-foreground)" fontFamily="Inter, sans-serif">Nisko</text>

                {/* Reference curves — all 4 tones */}
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

                {/* Active tone — prominent */}
                <path
                  d={getTonePath(activeTone, canvasW, canvasH)}
                  stroke={activeToneData.color}
                  strokeWidth={3}
                  fill="none"
                  opacity={0.7}
                  strokeLinecap="round"
                />

                {/* User pitch — ink brush */}
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

                {/* Recording dot */}
                {recording && (
                  <circle cx={canvasW - 20} cy={22} r={6} fill="var(--primary)" opacity={0.9}>
                    <animate attributeName="opacity" values="0.9;0.2;0.9" dur="0.7s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Tone labels on right */}
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

              {/* Legend */}
              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 rounded" style={{ backgroundColor: activeToneData.color, opacity: 0.7 }} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)" }}>Wzorzec ({activeToneData.label})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 rounded" style={{ backgroundColor: "var(--muted-foreground)", opacity: 0.4 }} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)" }}>Inne tony (odniesienie)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 rounded" style={{ backgroundColor: "var(--foreground)", opacity: 0.7 }} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)" }}>Twój głos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback panel */}
          {hasDone && score !== null && (
            <div
              className="rounded-2xl p-5"
              style={{
                backgroundColor: score >= 80 ? "rgba(79,121,66,0.06)" : "rgba(200,62,52,0.05)",
                border: `1.5px solid ${score >= 80 ? "rgba(79,121,66,0.25)" : "rgba(200,62,52,0.22)"}`,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-none"
                  style={{ backgroundColor: score >= 80 ? "rgba(79,121,66,0.1)" : "rgba(200,62,52,0.08)" }}
                >
                  <Info size={18} color={score >= 80 ? "var(--accent)" : "var(--primary)"} strokeWidth={1.5} />
                </div>
                <div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: score >= 80 ? "var(--accent)" : "var(--primary)", marginBottom: "4px" }}>
                    {score >= 80 ? "Doskonale! Ton rozpoznany poprawnie." : "Prawie! Małe korekty potrzebne."}
                  </p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                    {score >= 80
                      ? `Twój głos zgodny ze wzorcem ${activeToneData.label} w ${score}%. Linia głosowa przebiega poprawnie.`
                      : `Spróbuj ${activeTone === 1 ? "utrzymać ton na stałym, wysokim poziomie przez całą sylabę" : activeTone === 2 ? "zacząć niżej i wyraźniej wznosić ton" : activeTone === 3 ? "wyraźniej opaść, a potem wznieść głos" : "zacząć wyżej i zdecydowanie opaść"}.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* HSK tone distribution info */}
          <div
            className="rounded-2xl border border-border bg-card p-5"
            style={{ boxShadow: "0 1px 12px rgba(26,26,26,0.04)" }}
          >
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em", marginBottom: "14px" }}>
              TWOJA CELNOŚĆ TONÓW
            </p>
            <div className="flex flex-col gap-3">
              {tones.map((t, i) => {
                const accuracies = [85, 72, 61, 90];
                const acc = accuracies[i];
                return (
                  <div key={t.number} className="flex items-center gap-4">
                    <span
                      style={{
                        fontFamily: "'Noto Serif SC', serif",
                        fontSize: "18px",
                        color: t.color,
                        fontWeight: 600,
                        width: "28px",
                        textAlign: "center",
                      }}
                    >
                      {t.mark}
                    </span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${acc}%`, backgroundColor: t.color, opacity: 0.7 }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        color: acc >= 80 ? "var(--accent)" : "var(--primary)",
                        fontWeight: 600,
                        width: "36px",
                        textAlign: "right",
                      }}
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