import { useState } from "react";
import { Play, Pause, FileText, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function MiZiGeGrid({ hanzi, size = 200, highlight }) {
  const s = size;
  const half = s / 2;
  const brd = 14;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-label={`Siatka Mi-zi-ge dla znaku ${hanzi}`}>
      <rect x={brd} y={brd} width={s - brd * 2} height={s - brd * 2} rx={3} fill="#FEFCF5" />
      <rect x={brd} y={brd} width={s - brd * 2} height={s - brd * 2} rx={3} fill="none" stroke="#C83E34" strokeWidth={1.4} strokeDasharray="5 3" opacity={0.75} />
      <line x1={brd} y1={half} x2={s - brd} y2={half} stroke="#C83E34" strokeWidth={0.7} strokeDasharray="4 4" opacity={0.3} />
      <line x1={half} y1={brd} x2={half} y2={s - brd} stroke="#C83E34" strokeWidth={0.7} strokeDasharray="4 4" opacity={0.3} />
      <line x1={brd} y1={brd} x2={s - brd} y2={s - brd} stroke="#C83E34" strokeWidth={0.5} strokeDasharray="3 5" opacity={0.18} />
      <line x1={s - brd} y1={brd} x2={brd} y2={s - brd} stroke="#C83E34" strokeWidth={0.5} strokeDasharray="3 5" opacity={0.18} />
      {[[brd, brd], [s - brd, brd], [brd, s - brd], [s - brd, s - brd]].map(([cx, cy], i) => (
        <circle key={`c${i}`} cx={cx} cy={cy} r={2.2} fill="#C83E34" opacity={0.5} />
      ))}
      {[[half, brd], [half, s - brd], [brd, half], [s - brd, half]].map(([cx, cy], i) => (
        <circle key={`m${i}`} cx={cx} cy={cy} r={1.5} fill="#C83E34" opacity={0.28} />
      ))}
      <text x={half} y={half + 1} textAnchor="middle" dominantBaseline="central"
        fontSize={hanzi.length === 1 ? s * 0.55 : s * 0.38}
        fontFamily="'Noto Serif SC', serif" fontWeight={700} fill="#1A1A1A"
        opacity={highlight !== undefined ? 0.08 : 0.88}
      >
        {hanzi}
      </text>
    </svg>
  );
}
const STROKES_SHI = [
  { label: "1", desc: "Prawa kreska ukośna (点) — skos w prawo-dół", path: "M 106 22 C 110 26, 116 34, 118 42", type: "diǎn" },
  { label: "2", desc: "Pozioma kreska (横 héng) — od lewej do prawej", path: "M 76 46 L 128 46", type: "héng" },
  { label: "3", desc: "Lewy skos (撇 piě) — ukos w lewo-dół", path: "M 100 55 C 94 65, 82 80, 72 92", type: "piě" },
  { label: "4", desc: "Prawy skos (捺 nà) — ukos w prawo-dół", path: "M 100 55 C 108 67, 118 82, 130 94", type: "nà" },
  { label: "5", desc: "Pionowa kreska z haczykiem (竖钩 shùgōu)", path: "M 100 98 L 100 148 C 100 152, 97 156, 92 158", type: "shùgōu" },
  { label: "6", desc: "Lewa dolna kreska (撇) — skos w lewo", path: "M 100 114 C 90 122, 78 136, 70 152", type: "piě" },
  { label: "7", desc: "Prawa dolna kreska (横折)", path: "M 100 114 C 108 118, 116 128, 120 148", type: "héngzhé" },
  { label: "8", desc: "Zamknięcie (横) — dolna pozioma kreska", path: "M 68 160 L 132 160", type: "héng" },
  { label: "9", desc: "Pionowa (竖) — wewnętrzna", path: "M 100 166 L 100 180", type: "shù" },
];

const STROKE_COLORS = ["#C8B4A0","#B8A090","#A89080","#987060","#885050","#784040","#683030","#582020","#1A1A1A"];

function StrokeCanvas({ visible }) {
  return (
    <svg width={200} height={200} viewBox="0 0 200 200" style={{ display: "block" }}>
      <rect x={4} y={4} width={192} height={192} rx={3} fill="#FEFCF5" />
      <rect x={4} y={4} width={192} height={192} rx={3} fill="none" stroke="#C83E34" strokeWidth={1.2} strokeDasharray="5 3" opacity={0.55} />
      <line x1={4} y1={100} x2={196} y2={100} stroke="#C83E34" strokeWidth={0.6} strokeDasharray="4 4" opacity={0.22} />
      <line x1={100} y1={4} x2={100} y2={196} stroke="#C83E34" strokeWidth={0.6} strokeDasharray="4 4" opacity={0.22} />
      <text x={100} y={102} textAnchor="middle" dominantBaseline="central" fontSize={108} fontFamily="'Noto Serif SC', serif" fontWeight={700} fill="#1A1A1A" opacity={0.06}>食</text>
      {STROKES_SHI.slice(0, visible).map((stroke, i) => {
        const isActive = i === visible - 1;
        return (
          <path key={i} d={stroke.path} stroke={isActive ? "#C83E34" : STROKE_COLORS[i]}
            strokeWidth={isActive ? 7 : 6} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={isActive ? 1 : 0.85} />
        );
      })}
      {visible > 0 && (() => {
        const match = STROKES_SHI[visible - 1].path.match(/M\s*([\d.]+)\s+([\d.]+)/);
        if (!match) return null;
        return <circle cx={parseFloat(match[1])} cy={parseFloat(match[2])} r={4} fill="#C83E34" opacity={0.9} />;
      })()}
    </svg>
  );
}

export default function CharacterDetailScreen({ onBack }) {
  const [animating, setAnimating] = useState(false);
  const [strokeVisible, setStrokeVisible] = useState(0);
  const [intervalRef, setIntervalRef] = useState(null);

  function handleAnimate() {
    if (animating) {
      if (intervalRef) clearInterval(intervalRef);
      setIntervalRef(null);
      setAnimating(false);
      return;
    }
    setStrokeVisible(0);
    setAnimating(true);
    let step = 0;
    const iv = setInterval(() => {
      step++;
      setStrokeVisible(step);
      if (step >= STROKES_SHI.length) {
        clearInterval(iv);
        setIntervalRef(null);
        setAnimating(false);
      }
    }, 420);
    setIntervalRef(iv);
  }

  return (
    <div className="p-8" style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div className="grid gap-8" style={{ gridTemplateColumns: "380px 1fr" }}>
        <div className="flex flex-col gap-5">
          <div
            className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center"
            style={{ boxShadow: "0 4px 32px rgba(26,26,26,0.09)" }}
          >
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)", letterSpacing: "0.08em", marginBottom: "16px" }}>
              SIATKA KALIGRAFII · 米字格
            </p>
            <MiZiGeGrid hanzi="食" size={240} />
            <div className="mt-6 flex items-center gap-3">
              <button className="w-11 h-11 rounded-full border border-border bg-secondary flex items-center justify-center transition-all hover:scale-105 active:scale-90">
                <Volume2 size={18} color="var(--primary)" strokeWidth={1.5} />
              </button>
              <div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "20px", fontWeight: 600, color: "var(--primary)", letterSpacing: "0.05em" }}>shí</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)" }}>Wymów głośno</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAnimate}
              className="flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                boxShadow: "0 2px 12px rgba(200,62,52,0.22)",
              }}
            >
              {animating ? <Pause size={16} strokeWidth={2} /> : <Play size={16} strokeWidth={2} />}
              <span>{animating ? "Pauza" : "Uruchom animację"}</span>
            </button>
            <button
              className="px-5 py-3.5 rounded-xl border border-border bg-card flex items-center justify-center gap-2 transition-all hover:border-foreground/20 active:scale-95"
            >
              <FileText size={16} color="var(--foreground)" strokeWidth={1.5} />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "var(--foreground)" }}>Pobierz PDF</span>
            </button>
          </div>
          <div
            className="rounded-2xl border border-border bg-card p-5"
            style={{ boxShadow: "0 1px 12px rgba(26,26,26,0.04)" }}
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "PINYIN", value: "shí", isPin: true },
                { label: "RADYKAŁ", value: "食 (shí)" },
                { label: "ZNACZENIE", value: "jeść / jedzenie" },
                { label: "HSK", value: "Poziom 1" },
                { label: "KRESK", value: "9 kresek" },
                { label: "TONY", value: "2. ton (wznoszący)" },
              ].map((item) => (
                <div key={item.label}>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: "var(--muted-foreground)", letterSpacing: "0.08em", marginBottom: "3px" }}>{item.label}</p>
                  <p style={{ fontFamily: item.isPin ? "Inter, sans-serif" : "'Noto Serif SC', serif", fontSize: item.isPin ? "20px" : "14px", color: item.isPin ? "var(--primary)" : "var(--foreground)", fontWeight: item.isPin ? 600 : 500 }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div
            className="rounded-2xl border border-border bg-card overflow-hidden"
            style={{ boxShadow: "0 2px 20px rgba(26,26,26,0.07)" }}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--secondary)" }}
            >
              <div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}>Kolejność kresek</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)" }}>
                  {STROKES_SHI.length} kresek łącznie · {strokeVisible > 0 ? `Kreska ${strokeVisible} z ${STROKES_SHI.length}` : "Naciśnij animuj"}
                </p>
              </div>
              {strokeVisible > 0 && strokeVisible <= STROKES_SHI.length && (
                <div
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: "rgba(200,62,52,0.1)", border: "1px solid rgba(200,62,52,0.2)" }}
                >
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--primary)", fontWeight: 600 }}>
                    {STROKES_SHI[strokeVisible - 1].type}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center p-8">
              <StrokeCanvas visible={strokeVisible} />
            </div>

            {strokeVisible > 0 && strokeVisible <= STROKES_SHI.length && (
              <div
                className="px-6 py-4"
                style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--secondary)" }}
              >
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--foreground)" }}>
                  <span style={{ color: "var(--primary)", fontWeight: 600 }}>Kreska {strokeVisible}:</span>{" "}
                  {STROKES_SHI[strokeVisible - 1].desc}
                </p>
              </div>
            )}
          </div>

          {/* Stroke step grid */}
          <div
            className="rounded-2xl border border-border bg-card p-5"
            style={{ boxShadow: "0 1px 12px rgba(26,26,26,0.04)" }}
          >
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em", marginBottom: "14px" }}>
              KROKI ANIMACJI
            </p>
            <div className="grid grid-cols-9 gap-2">
              {STROKES_SHI.map((stroke, i) => (
                <button
                  key={i}
                  onClick={() => { setStrokeVisible(i + 1); setAnimating(false); if (intervalRef) clearInterval(intervalRef); }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className="w-full aspect-square rounded-lg flex items-center justify-center border transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: i < strokeVisible ? (i === strokeVisible - 1 ? "rgba(200,62,52,0.1)" : "rgba(79,121,66,0.08)") : "var(--secondary)",
                      borderColor: i < strokeVisible ? (i === strokeVisible - 1 ? "var(--primary)" : "rgba(79,121,66,0.3)") : "var(--border)",
                    }}
                  >
                    <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "18px", fontWeight: 700, color: i < strokeVisible ? (i === strokeVisible - 1 ? "var(--primary)" : "var(--accent)") : "var(--muted-foreground)", opacity: i < strokeVisible ? 1 : 0.35 }}>
                      {stroke.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div
            className="rounded-2xl border border-border bg-card p-5"
            style={{ boxShadow: "0 1px 12px rgba(26,26,26,0.04)" }}
          >
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em", marginBottom: "14px" }}>
              POWIĄZANE SŁOWA
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { word: "食物", meaning: "jedzenie" },
                { word: "食堂", meaning: "stołówka" },
                { word: "饮食", meaning: "żywienie" },
                { word: "食谱", meaning: "przepis" },
              ].map((item) => (
                <div
                  key={item.word}
                  className="px-3 py-2 rounded-xl border border-border bg-secondary"
                >
                  <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "16px", fontWeight: 700, color: "var(--foreground)", display: "block" }}>{item.word}</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)" }}>{item.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}