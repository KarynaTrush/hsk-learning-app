import { ChevronRight, BookOpen, Target, Flame, TrendingUp, Zap } from "lucide-react";
import WordCard from "../../components/common/WordCard";

const days = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];
const completedDays = [0, 1, 2, 3, 4];

const previewWords = [
  { hanzi: "米饭", pinyin: "mǐfàn", translation: "ryż" },
  { hanzi: "面条", pinyin: "miàntiáo", translation: "makaron" },
  { hanzi: "饺子", pinyin: "jiǎozi", translation: "pierożki" },
];

const errorWords = [
  { hanzi: "饺子", pinyin: "jiǎozi", translation: "pierożki" },
  { hanzi: "星期", pinyin: "xīngqī", translation: "tydzień" },
  { hanzi: "商店", pinyin: "shāngdiàn", translation: "sklep" },
  { hanzi: "便宜", pinyin: "piányi", translation: "tani" },
  { hanzi: "医院", pinyin: "yīyuàn", translation: "szpital" },
];

export default function DashboardScreen({ onStartLesson }) {
  return (
    <div className="p-8" style={{ maxWidth: "1200px", margin: "0 auto" }}>

      <div className="flex items-center justify-between mb-8">
        <div>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              color: "var(--muted-foreground)",
              letterSpacing: "0.06em",
              marginBottom: "4px",
            }}
          >
            DZIEŃ DOBRY, ANNA · {new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h2
            style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: "28px",
              fontWeight: 700,
              color: "var(--foreground)",
            }}
          >
            Twój panel nauki
          </h2>
        </div>
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-2xl border"
          style={{
            backgroundColor: "rgba(212,168,67,0.06)",
            borderColor: "rgba(212,168,67,0.3)",
          }}
        >
          <Flame size={20} color="#D4A843" strokeWidth={1.8} />
          <div>
            <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "22px", fontWeight: 700, color: "#A07820", lineHeight: 1 }}>5</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)" }}>dni z rzędu</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr 300px" }}>

        <div className="flex flex-col gap-5">

          <div
            className="rounded-2xl border border-border bg-card p-6"
            style={{ boxShadow: "0 1px 20px rgba(26,26,26,0.05)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em" }}>CEL DZIENNY</p>
                <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "18px", fontWeight: 600, color: "var(--foreground)", marginTop: "2px" }}>5-dniowa passa!</p>
              </div>
              <div
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "rgba(79,121,66,0.08)", border: "1px solid rgba(79,121,66,0.25)" }}
              >
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>
                  20 min / dzień
                </span>
              </div>
            </div>

            <div className="flex justify-between gap-2">
              {days.map((day, i) => {
                const done = completedDays.includes(i);
                const today = i === 5;
                return (
                  <div key={day} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className="w-full rounded-xl flex flex-col items-center py-3 gap-1.5 transition-all"
                      style={{
                        backgroundColor: done
                          ? "rgba(79,121,66,0.08)"
                          : today
                          ? "rgba(200,62,52,0.05)"
                          : "var(--muted)",
                        border: done
                          ? "1.5px solid rgba(79,121,66,0.3)"
                          : today
                          ? "1.5px solid rgba(200,62,52,0.3)"
                          : "1px solid var(--border)",
                      }}
                    >
                      {done ? (
                        <span style={{ fontSize: "16px", color: "var(--accent)" }}>✓</span>
                      ) : (
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: today ? "var(--primary)" : "var(--muted-foreground)", fontWeight: today ? 600 : 400 }}>
                          {day[0]}
                        </span>
                      )}
                    </div>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: done ? "var(--accent)" : today ? "var(--primary)" : "var(--muted-foreground)", fontWeight: today || done ? 600 : 400 }}>
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Poznane słowa", value: "248", unit: "łącznie", icon: <BookOpen size={16} color="var(--accent)" strokeWidth={1.5} />, accent: "var(--accent)" },
              { label: "Celność", value: "78%", unit: "średnia", icon: <Target size={16} color="var(--primary)" strokeWidth={1.5} />, accent: "var(--primary)" },
              { label: "Czas (tydzień)", value: "4.2h", unit: "aktywność", icon: <Zap size={16} color="#D4A843" strokeWidth={1.5} />, accent: "#D4A843" },
              { label: "Lekcje", value: "37", unit: "ukończone", icon: <TrendingUp size={16} color="var(--accent)" strokeWidth={1.5} />, accent: "var(--accent)" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-card p-4"
                style={{ boxShadow: "0 1px 12px rgba(26,26,26,0.04)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)", letterSpacing: "0.05em" }}>
                    {stat.label.toUpperCase()}
                  </span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--secondary)" }}>
                    {stat.icon}
                  </div>
                </div>
                <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "28px", fontWeight: 700, color: stat.accent, lineHeight: 1 }}>
                  {stat.value}
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", marginTop: "3px" }}>
                  {stat.unit}
                </p>
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl border border-border bg-card p-5"
            style={{ boxShadow: "0 1px 12px rgba(26,26,26,0.04)" }}
          >
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em", marginBottom: "16px" }}>
              CZAS NAUKI · OSTATNIE 7 DNI
            </p>
            <div className="flex items-end gap-3" style={{ height: "64px" }}>
              {[28, 45, 20, 55, 38, 60, 15].map((val, i) => {
                const isToday = i === 5;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-t-sm"
                      style={{
                        height: `${(val / 60) * 100}%`,
                        backgroundColor: isToday ? "var(--primary)" : "var(--accent)",
                        opacity: isToday ? 1 : 0.55,
                        minHeight: "4px",
                      }}
                    />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: isToday ? "var(--primary)" : "var(--muted-foreground)", fontWeight: isToday ? 600 : 400 }}>
                      {days[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em" }}>
              POLECANA LEKCJA
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--primary)", animation: "pulse 2s infinite" }} />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--primary)", fontWeight: 600 }}>AI · na żywo</span>
            </div>
          </div>

          <div
            className="rounded-2xl border border-border bg-card overflow-hidden flex-1"
            style={{ boxShadow: "0 4px 32px rgba(26,26,26,0.09)" }}
          >
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, var(--primary) 0%, #E8534A 70%, rgba(200,62,52,0.15) 100%)" }} />

            <div className="p-7">
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-none"
                  style={{ backgroundColor: "rgba(200,62,52,0.07)", border: "1px solid rgba(200,62,52,0.15)" }}
                >
                  <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "32px", fontWeight: 700, color: "var(--primary)" }}>食</span>
                </div>
                <div className="flex-1">
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.05em", marginBottom: "3px" }}>HSK 2 · SŁOWNICTWO</p>
                  <h3 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "24px", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.2 }}>
                    食物 · Jedzenie
                  </h3>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)", marginTop: "2px" }}>12 słów · ~15 min</p>
                </div>
              </div>

              <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: "var(--secondary)", borderLeft: "3px solid var(--primary)" }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)", letterSpacing: "0.07em", marginBottom: "8px" }}>DLACZEGO TA LEKCJA?</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "var(--foreground)", lineHeight: 1.65 }}>
                  Opanowałaś <span style={{ color: "var(--accent)", fontWeight: 600 }}>80% słownictwa HSK 2</span>, ale popełniłaś ostatnio błędy w kategorii <span style={{ color: "var(--primary)", fontWeight: 600 }}>'Jedzenie'</span>. Powtórzenie wzmocni trwałość и celność do 88%.
                </p>
              </div>

              <div className="mb-7">
                <div className="flex justify-between mb-2">
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)" }}>Postęp lekcji</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>7 / 12 słów</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                  <div className="h-full rounded-full" style={{ width: "58%", backgroundColor: "var(--accent)" }} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 mb-7">
                {previewWords.map((word) => (
                  <WordCard
                    key={word.hanzi}
                    hanzi={word.hanzi}
                    pinyin={word.pinyin}
                    translation={word.translation}
                    variant="compact"
                  />
                ))}
                <div className="text-center py-1.5 rounded-xl border border-dashed border-[var(--border)] bg-[var(--secondary)]/30">
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)", fontWeight: 500 }}>
                    + 9 więcej słów в этой лекции
                  </span>
                </div>
              </div>

              <button
                onClick={onStartLesson}
                className="w-full py-4 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "15px",
                  fontWeight: 600,
                  boxShadow: "0 3px 20px rgba(200,62,52,0.28)",
                }}
              >
                <BookOpen size={18} strokeWidth={1.8} />
                <span>Rozpocznij naukę</span>
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">

          <div
            className="rounded-2xl border p-5"
            style={{
              background: "linear-gradient(135deg, rgba(79,121,66,0.06) 0%, rgba(79,121,66,0.02) 100%)",
              borderColor: "rgba(79,121,66,0.25)",
              boxShadow: "0 1px 16px rgba(79,121,66,0.08)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Target size={15} color="var(--accent)" strokeWidth={1.8} />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em" }}>PROGNOZA</span>
            </div>
            <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "28px", fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>HSK 3</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)", marginTop: "4px" }}>Egzamin: 15.03.2027</p>
            <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
              <div className="h-full rounded-full" style={{ width: "62%", backgroundColor: "var(--accent)" }} />
            </div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--accent)", marginTop: "5px" }}>62% gotowości do HSK 3</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "0 1px 12px rgba(26,26,26,0.04)" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em", marginBottom: "14px" }}>DZISIAJ DO ZROBIENIA</p>
            <div className="flex flex-col gap-3">
              {[
                { label: "Lekcja: Jedzenie", done: false, time: "15 min", color: "var(--primary)" },
                { label: "Powtórki SRS", done: false, time: "47 kart", color: "#D4A843" },
                { label: "Ćwiczenia tonów", done: false, time: "10 min", color: "var(--accent)" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-none"
                    style={{ border: `1.5px solid ${item.color}`, backgroundColor: item.done ? item.color : "transparent" }}
                  >
                    {item.done && <span style={{ fontSize: "10px", color: "white" }}>✓</span>}
                  </div>
                  <div className="flex-1">
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--foreground)", fontWeight: 400 }}>{item.label}</p>
                  </div>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)" }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl border p-5"
            style={{
              backgroundColor: "rgba(200,62,52,0.03)",
              borderColor: "rgba(200,62,52,0.18)",
              boxShadow: "0 1px 12px rgba(200,62,52,0.04)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em" }}>
                OSTATNIE BŁĘDY
              </p>
              <div className="px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(200,62,52,0.1)" }}>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--primary)", fontWeight: 700 }}>23</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {errorWords.map((word) => (
                <WordCard
                  key={word.hanzi}
                  hanzi={word.hanzi}
                  pinyin={word.pinyin}
                  translation={word.translation}
                  variant="compact"
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "0 1px 12px rgba(26,26,26,0.04)" }}>
            <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "32px", opacity: 0.1, display: "block", lineHeight: 1, marginBottom: "8px" }}>「</span>
            <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "15px", color: "var(--foreground)", lineHeight: 1.6 }}>学如逆水行舟，不进则退。</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", marginTop: "8px", lineHeight: 1.5 }}>
              Nauka jest jak wiosłowanie pod prąd — jeśli nie płyniesz naprzód, cofasz się.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}