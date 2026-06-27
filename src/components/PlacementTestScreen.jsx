import { useState } from "react";
import { Check } from "lucide-react";

const questions = [
  {
    hanzi: "吃", pinyin: "chī", question: "Co oznacza ten znak?",
    options: [
      { pinyin: "chī", polish: "jeść" },
      { pinyin: "hē", polish: "pić" },
      { pinyin: "zuò", polish: "siedzieć" },
      { pinyin: "zǒu", polish: "iść" },
    ],
    correct: 0,
  },
  {
    hanzi: "美", pinyin: "měi", question: "Co oznacza ten znak?",
    options: [
      { pinyin: "hǎo", polish: "dobry" },
      { pinyin: "měi", polish: "piękny" },
      { pinyin: "dà", polish: "duży" },
      { pinyin: "xiǎo", polish: "mały" },
    ],
    correct: 1,
  },
  {
    hanzi: "朋友", pinyin: "péngyou", question: "Co oznacza to słowo?",
    options: [
      { pinyin: "jiārén", polish: "rodzina" },
      { pinyin: "lǎoshī", polish: "nauczyciel" },
      { pinyin: "péngyou", polish: "przyjaciel" },
      { pinyin: "tóngxué", polish: "kolega z klasy" },
    ],
    correct: 2,
  },
];

export default function PlacementTestScreen({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const q = questions[current];
  const progress = (current / questions.length) * 100;

  function handleConfirm() {
    if (selected === null) return;
    setConfirmed(true);
    setTimeout(() => {
      if (current < questions.length - 1) { 
        setCurrent((c) => c + 1); 
        setSelected(null); 
        setConfirmed(false); 
      } else {
        onComplete();
      }
    }, 700);
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>

      {/* ── Left decorative panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between flex-none"
        style={{ width: "380px", backgroundColor: "#F0ECE2", borderRight: "1px solid var(--border)", position: "relative", overflow: "hidden" }}
      >
        {/* Large ink background character */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.055 }}>
          <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "340px", fontWeight: 700, color: "#1A1A1A", lineHeight: 1 }}>
            {q.hanzi[0]}
          </span>
        </div>

        <div className="relative z-10 px-12 pt-16">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ border: "1.5px solid var(--primary)", backgroundColor: "rgba(200,62,52,0.06)" }}>
              <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "20px", fontWeight: 700, color: "var(--primary)" }}>漢</span>
            </div>
            <div>
              <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "16px", fontWeight: 700, color: "var(--foreground)" }}>漢語學習</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)", letterSpacing: "0.08em" }}>TEST POZIOMUJĄCY</p>
            </div>
          </div>

          <h2 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "32px", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.3, marginBottom: "12px" }}>
            Sprawdźmy Twój<br /><span style={{ color: "var(--primary)" }}>poziom języka</span>
          </h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "var(--muted-foreground)", lineHeight: 1.65 }}>
            Krótki test, który pomoże nam dopasować ścieżkę nauki do Twoich umiejętności.
          </p>
        </div>

        <div className="relative z-10 px-12 pb-14">
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em", marginBottom: "8px" }}>POSTĘP</p>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(200,62,52,0.15)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: "var(--primary)" }} />
          </div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--primary)", marginTop: "6px" }}>
            Pytanie {current + 1} z {questions.length}
          </p>
        </div>
      </div>

      {/* ── Right: Question area ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div style={{ width: "100%", maxWidth: "560px" }}>

          {/* Mobile progress */}
          <div className="lg:hidden mb-8">
            <div className="flex justify-between mb-2">
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)" }}>Pytanie {current + 1} z {questions.length}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: "var(--primary)" }} />
            </div>
          </div>

          {/* Question label */}
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.07em", marginBottom: "24px" }}>
            {q.question}
          </p>

          {/* Large Hanzi card */}
          <div
            className="rounded-2xl border border-border bg-card flex flex-col items-center py-10 mb-8"
            style={{ boxShadow: "0 4px 32px rgba(26,26,26,0.09)" }}
          >
            <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "100px", fontWeight: 700, color: "var(--foreground)", lineHeight: 1 }}>
              {q.hanzi}
            </span>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "20px", color: "var(--primary)", letterSpacing: "0.05em", marginTop: "12px" }}>
              {q.pinyin}
            </span>
          </div>

          {/* Options grid 2×2 */}
          <div className="grid grid-cols-2 gap-3 mb-7">
            {q.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect  = confirmed && i === q.correct;
              const isWrong    = confirmed && isSelected && i !== q.correct;

              return (
                <button
                  key={i}
                  onClick={() => !confirmed && setSelected(i)}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    backgroundColor: isCorrect ? "rgba(79,121,66,0.07)" : isWrong ? "rgba(200,62,52,0.05)" : isSelected ? "rgba(200,62,52,0.04)" : "var(--card)",
                    borderColor: isCorrect ? "var(--accent)" : isWrong ? "var(--primary)" : isSelected ? "var(--primary)" : "var(--border)",
                    boxShadow: isSelected && !confirmed ? "0 0 0 2px rgba(200,62,52,0.15)" : "none",
                  }}
                >
                  {/* Letter badge */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-none border"
                    style={{
                      borderColor: isCorrect ? "var(--accent)" : isSelected ? "var(--primary)" : "var(--border)",
                      backgroundColor: isCorrect ? "var(--accent)" : isSelected && !confirmed ? "var(--primary)" : "transparent",
                    }}
                  >
                    {isCorrect
                      ? <Check size={14} color="white" strokeWidth={2.5} />
                      : <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: isSelected && !confirmed ? "white" : "var(--muted-foreground)" }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                    }
                  </div>
                  <div>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: isSelected || isCorrect ? "var(--foreground)" : "var(--muted-foreground)", fontWeight: isSelected ? 500 : 400, display: "block" }}>
                      {opt.pinyin}
                    </span>
                    <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "16px", color: "var(--foreground)", fontWeight: 600, display: "block" }}>
                      {opt.polish}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={selected === null}
            className="w-full py-4 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed"
            style={{
              backgroundColor: selected !== null ? "var(--primary)" : "var(--muted)",
              color: selected !== null ? "var(--primary-foreground)" : "var(--muted-foreground)",
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              boxShadow: selected !== null ? "0 3px 16px rgba(200,62,52,0.25)" : "none",
              opacity: selected !== null ? 1 : 0.6,
            }}
          >
            Zatwierdź odpowiedź
          </button>
        </div>
      </div>
    </div>
  );
}