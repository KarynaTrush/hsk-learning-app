import { useState } from "react";
import { Volume2, ChevronRight, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const vocabulary = [
  { hanzi: "米饭", pinyin: "mǐfàn", polish: "gotowany ryż", example: "我喜欢吃米饭。", exampleTranslation: "Lubię jeść ryż." },
  { hanzi: "面条", pinyin: "miàntiáo", polish: "makaron", example: "面条很好吃。", exampleTranslation: "Makaron jest bardzo smaczny." },
  { hanzi: "饺子", pinyin: "jiǎozi", polish: "pierożki", example: "微们一起吃饺子吧。", exampleTranslation: "Zjedzmy razem pierożki." },
];

const matchItems = [
  { hanzi: "米饭", polish: "gotowany ryż" },
  { hanzi: "面条", polish: "makaron" },
  { hanzi: "饺子", polish: "pierożki" },
  { hanzi: "水", polish: "woda" },
];

export default function LessonScreen({ onComplete }) {
  const [vocabIndex, setVocabIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const word = vocabulary[vocabIndex];

  function handleSpeak() { 
    setIsPlaying(true); 
    setTimeout(() => setIsPlaying(false), 800); 
  }
  
  function handleCheck() { 
    if (!selected) return; 
    setAnswered(true); 
  }
  
  function handleNext() {
    if (vocabIndex < vocabulary.length - 1) { 
      setVocabIndex((v) => v + 1); 
      setAnswered(false); 
      setSelected(null); 
    } else {
      onComplete();
    }
  }

  return (
    <div className="p-8" style={{ maxWidth: "1000px", margin: "0 auto" }}>

      <div className="flex items-center justify-between mb-7">
        <div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em" }}>
            SŁOWO {vocabIndex + 1} Z {vocabulary.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {vocabulary.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === vocabIndex ? "28px" : "12px",
                  backgroundColor: i < vocabIndex ? "var(--accent)" : i === vocabIndex ? "var(--primary)" : "var(--muted)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-8" style={{ gridTemplateColumns: "420px 1fr" }}>

        <div className="flex flex-col gap-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={vocabIndex}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
            >
              <div
                className="rounded-2xl border border-border bg-card overflow-hidden"
                style={{ boxShadow: "0 4px 32px rgba(26,26,26,0.09)" }}
              >
                <div
                  className="flex flex-col items-center py-10 px-8"
                  style={{ backgroundColor: "var(--secondary)", borderBottom: "1px solid var(--border)" }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        style={{
                          fontFamily: "'Noto Serif SC', serif",
                          fontSize: "96px",
                          fontWeight: 700,
                          color: "var(--foreground)",
                          lineHeight: 1,
                        }}
                      >
                        {word.hanzi}
                      </span>
                      <span
                        className="mt-3"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "22px", color: "var(--primary)", letterSpacing: "0.04em" }}
                      >
                        {word.pinyin}
                      </span>
                      <span
                        className="mt-1"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: "var(--muted-foreground)" }}
                      >
                        {word.polish}
                      </span>
                    </div>
                    <button
                      onClick={handleSpeak}
                      className="w-12 h-12 rounded-full flex items-center justify-center border transition-all hover:scale-105 active:scale-90"
                      style={{
                        borderColor: isPlaying ? "var(--primary)" : "var(--border)",
                        backgroundColor: isPlaying ? "rgba(200,62,52,0.08)" : "var(--card)",
                      }}
                    >
                      <Volume2 size={20} color={isPlaying ? "var(--primary)" : "var(--muted-foreground)"} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)", letterSpacing: "0.07em", marginBottom: "8px" }}>
                    ZDANIE PRZYKŁADOWE
                  </p>
                  <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "20px", color: "var(--foreground)", lineHeight: 1.5, marginBottom: "6px" }}>
                    {word.example}
                  </p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--muted-foreground)" }}>
                    {word.exampleTranslation}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3">
            <button
              onClick={() => { if (vocabIndex > 0) { setVocabIndex((v) => v - 1); setAnswered(false); setSelected(null); } }}
              disabled={vocabIndex === 0}
              className="flex-1 py-3 rounded-xl border border-border bg-card text-sm transition-all hover:border-foreground/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--muted-foreground)" }}
            >
              ← Poprzednie
            </button>
            <button
              onClick={handleNext}
              disabled={!answered && vocabIndex < vocabulary.length - 1}
              className="flex-1 py-3 rounded-xl border text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: answered ? "var(--accent)" : "transparent",
                borderColor: answered ? "var(--accent)" : "var(--border)",
                color: answered ? "var(--accent-foreground)" : "var(--muted-foreground)",
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: answered ? 600 : 400,
              }}
            >
              {vocabIndex < vocabulary.length - 1 ? "Następne →" : "Zakończ lekcję →"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div
            className="rounded-2xl border border-border bg-card p-6"
            style={{ boxShadow: "0 2px 20px rgba(26,26,26,0.06)" }}
          >
            <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "18px", fontWeight: 600, color: "var(--foreground)", marginBottom: "6px" }}>
              Dopasuj znaczenie
            </p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--muted-foreground)", marginBottom: "20px" }}>
              Wybierz polskie tłumaczenie dla znaku{" "}
              <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "16px", color: "var(--primary)", fontWeight: 700 }}>{word.hanzi}</span>
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {matchItems.map((item) => {
                const isSelected = selected === item.polish;
                const isCorrect  = answered && item.polish === word.polish;
                const isWrong    = answered && isSelected && item.polish !== word.polish;
                return (
                  <button
                    key={item.polish}
                    onClick={() => !answered && setSelected(item.polish)}
                    className="py-5 px-4 rounded-xl border text-center transition-all hover:scale-[1.01] active:scale-[0.98]"
                    style={{
                      backgroundColor: isCorrect ? "rgba(79,121,66,0.07)" : isWrong ? "rgba(200,62,52,0.05)" : isSelected ? "rgba(200,62,52,0.04)" : "var(--secondary)",
                      borderColor: isCorrect ? "var(--accent)" : isWrong ? "var(--primary)" : isSelected ? "var(--primary)" : "var(--border)",
                      boxShadow: isSelected && !answered ? "0 0 0 2px rgba(200,62,52,0.15)" : isCorrect ? "0 0 0 2px rgba(79,121,66,0.2)" : "none",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Noto Serif SC', serif",
                        fontSize: "24px",
                        fontWeight: 700,
                        color: isCorrect ? "var(--accent)" : isWrong ? "var(--primary)" : "var(--foreground)",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      {item.hanzi}
                    </span>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--muted-foreground)" }}>
                      {item.polish}
                    </span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl flex items-center gap-4 px-5 py-4 mb-5"
                  style={{
                    backgroundColor: selected === word.polish ? "rgba(79,121,66,0.08)" : "rgba(200,62,52,0.06)",
                    border: `1.5px solid ${selected === word.polish ? "var(--accent)" : "var(--primary)"}`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-none"
                    style={{ backgroundColor: selected === word.polish ? "var(--accent)" : "var(--primary)" }}
                  >
                    {selected === word.polish
                      ? <Check size={16} color="white" strokeWidth={2.5} />
                      : <X size={16} color="white" strokeWidth={2.5} />
                    }
                  </div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: selected === word.polish ? "var(--accent)" : "var(--primary)", fontWeight: 500 }}>
                    {selected === word.polish ? "Świetnie! Dobra odpowiedź." : `Błąd. Poprawna odpowiedź: „${word.polish}"`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {!answered ? (
              <button
                onClick={handleCheck}
                disabled={!selected}
                className="w-full py-4 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed"
                style={{
                  backgroundColor: selected ? "var(--primary)" : "var(--muted)",
                  color: selected ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "15px",
                  fontWeight: 600,
                  boxShadow: selected ? "0 3px 16px rgba(200,62,52,0.25)" : "none",
                  opacity: selected ? 1 : 0.6,
                }}
              >
                Sprawdź odpowiedź
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--accent-foreground)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "15px",
                  fontWeight: 600,
                  boxShadow: "0 3px 16px rgba(79,121,66,0.25)",
                }}
              >
                <span>{vocabIndex < vocabulary.length - 1 ? "Następne słowo" : "Zakończ lekcję"}</span>
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            )}
          </div>
          <div
            className="rounded-2xl border border-border bg-card p-5"
            style={{ boxShadow: "0 1px 12px rgba(26,26,26,0.04)" }}
          >
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em", marginBottom: "12px" }}>
              SŁOWA W TEJ LEKCJI
            </p>
            <div className="flex flex-col gap-2">
              {vocabulary.map((v, i) => (
                <div
                  key={v.hanzi}
                  className="flex items-center gap-4 px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: i === vocabIndex ? "rgba(200,62,52,0.05)" : "transparent",
                    border: i === vocabIndex ? "1px solid rgba(200,62,52,0.15)" : "1px solid transparent",
                  }}
                >
                  <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "20px", fontWeight: 700, color: i < vocabIndex ? "var(--accent)" : i === vocabIndex ? "var(--primary)" : "var(--muted-foreground)" }}>{v.hanzi}</span>
                  <div>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--muted-foreground)" }}>{v.pinyin}</span>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", opacity: 0.7, marginLeft: "8px" }}>{v.polish}</span>
                  </div>
                  {i < vocabIndex && <span className="ml-auto" style={{ fontSize: "12px", color: "var(--accent)" }}>✓</span>}
                  {i === vocabIndex && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--primary)" }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}