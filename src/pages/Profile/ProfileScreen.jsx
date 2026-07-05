import { ChevronRight, AlertCircle, RefreshCw, BookOpen, TrendingUp, Target } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

const accuracyData = [{ name: "Celność", value: 78, fill: "#4F7942" }];

export default function ProfileScreen({ onMenuSelect }) {
  return (
    <div className="p-8" style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div className="grid gap-6 mb-7" style={{ gridTemplateColumns: "1fr 340px" }}>
        <div
          className="rounded-2xl border border-border bg-card p-7 flex items-center gap-6"
          style={{ boxShadow: "0 2px 20px rgba(26,26,26,0.07)" }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center flex-none"
            style={{ border: "2.5px solid var(--primary)", backgroundColor: "rgba(200,62,52,0.06)" }}
          >
            <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "36px", fontWeight: 700, color: "var(--primary)" }}>安</span>
          </div>
          <div>
            <h2 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "26px", fontWeight: 700, color: "var(--foreground)", marginBottom: "4px" }}>
              Anna Kowalska
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--muted-foreground)", marginBottom: "12px" }}>
              Uczy się od 14 tygodni · HSK 2 → 3 · 5-dniowa passa 🔥
            </p>
            <div className="flex gap-3">
              <div className="px-3 py-1.5 rounded-full" style={{ backgroundColor: "rgba(79,121,66,0.08)", border: "1px solid rgba(79,121,66,0.25)" }}>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>HSK 2 Certyfik.</span>
              </div>
              <div className="px-3 py-1.5 rounded-full" style={{ backgroundColor: "rgba(200,62,52,0.06)", border: "1px solid rgba(200,62,52,0.2)" }}>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>Celuje w HSK 3</span>
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <button
              className="px-4 py-2 rounded-xl border border-border bg-secondary text-sm transition-all hover:border-foreground/20"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--muted-foreground)" }}
            >
              Edytuj profil
            </button>
          </div>
        </div>
        <div
          className="rounded-2xl p-6 flex flex-col justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(200,62,52,0.07) 0%, rgba(200,62,52,0.02) 100%)",
            border: "1.5px solid rgba(200,62,52,0.22)",
            boxShadow: "0 2px 16px rgba(200,62,52,0.07)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} color="var(--primary)" strokeWidth={1.8} />
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em" }}>PRZEWIDYWANA DATA EGZAMINU</span>
          </div>
          <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "22px", fontWeight: 700, color: "var(--primary)", lineHeight: 1.1, marginBottom: "4px" }}>HSK 3</p>
          <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "18px", fontWeight: 600, color: "var(--foreground)" }}>15.03.2027</p>
          <div className="mt-4">
            <div className="flex justify-between mb-1.5">
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)" }}>Gotowość</span>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--primary)", fontWeight: 600 }}>62%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(200,62,52,0.12)" }}>
              <div className="h-full rounded-full" style={{ width: "62%", backgroundColor: "var(--primary)" }} />
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div className="flex flex-col gap-4">
          <div
            className="rounded-2xl border border-border bg-card p-5"
            style={{ boxShadow: "0 1px 12px rgba(26,26,26,0.04)" }}
          >
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)", letterSpacing: "0.07em", marginBottom: "8px" }}>POZNANE SŁOWA</p>
            <div className="flex items-end justify-between">
              <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "48px", fontWeight: 700, color: "var(--foreground)", lineHeight: 1 }}>248</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--accent)", marginBottom: "6px" }}>↑ +12 ten tydzień</p>
            </div>
          </div>
          <div
            className="rounded-2xl border border-border bg-card p-5"
            style={{ boxShadow: "0 1px 12px rgba(26,26,26,0.04)" }}
          >
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)", letterSpacing: "0.07em", marginBottom: "8px" }}>CELNOŚĆ</p>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "48px", fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>78%</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)", marginTop: "4px" }}>średnia</p>
              </div>
              <div style={{ width: 80, height: 80 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius={28} outerRadius={40} startAngle={90} endAngle={90 - (78/100)*360} data={accuracyData}>
                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "var(--muted)" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div
            className="rounded-2xl border border-border bg-card p-5"
            style={{ boxShadow: "0 1px 12px rgba(26,26,26,0.04)" }}
          >
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)", letterSpacing: "0.07em", marginBottom: "8px" }}>CZAS NAUKI</p>
            <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "48px", fontWeight: 700, color: "#D4A843", lineHeight: 1 }}>4.2h</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)", marginTop: "4px" }}>ten tydzień</p>
          </div>
        </div>
        <div
          className="rounded-2xl border border-border bg-card p-6"
          style={{ boxShadow: "0 1px 12px rgba(26,26,26,0.04)" }}
        >
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.06em", marginBottom: "20px" }}>
            AKTYWNOŚĆ · 7 DNI
          </p>
          <div className="flex items-end gap-3" style={{ height: "140px" }}>
            {[28, 45, 20, 55, 38, 60, 15].map((val, i) => {
              const d = ["Pn","Wt","Śr","Cz","Pt","Sb","Nd"][i];
              const isToday = i === 5;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md"
                    style={{ height: `${(val/60)*100}%`, backgroundColor: isToday ? "var(--primary)" : "var(--accent)", opacity: isToday ? 1 : 0.55, minHeight: "4px" }}
                  />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: isToday ? "var(--primary)" : "var(--muted-foreground)", fontWeight: isToday ? 600 : 400 }}>{d}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--muted-foreground)", letterSpacing: "0.06em", marginBottom: "12px" }}>POSTĘP PO KATEGORIACH</p>
            <div className="flex flex-col gap-3">
              {[
                { label: "Jedzenie", pct: 58, color: "var(--primary)" },
                { label: "Czas", pct: 82, color: "var(--accent)" },
                { label: "Rodzina", pct: 95, color: "var(--accent)" },
                { label: "Zakupy", pct: 30, color: "#D4A843" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", width: "64px" }}>{item.label}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                    <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                  </div>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", width: "30px", textAlign: "right" }}>{item.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {[
            {
              icon: <AlertCircle size={20} color="var(--primary)" strokeWidth={1.5} />,
              iconBg: "rgba(200,62,52,0.08)",
              label: "Moje błędy",
              sublabel: "Powtórz trudne słowa",
              badge: "23",
              badgeColor: "var(--primary)",
              badgeBg: "rgba(200,62,52,0.1)",
              key: "errors",
            },
            {
              icon: <RefreshCw size={20} color="#D4A843" strokeWidth={1.5} />,
              iconBg: "rgba(212,168,67,0.1)",
              label: "Powtórki (SRS)",
              sublabel: "Spaced Repetition System",
              badge: "47",
              badgeColor: "#A07820",
              badgeBg: "rgba(212,168,67,0.1)",
              key: "srs",
            },
            {
              icon: <BookOpen size={20} color="var(--accent)" strokeWidth={1.5} />,
              iconBg: "rgba(79,121,66,0.1)",
              label: "Chińskie historie i kultura",
              sublabel: "Czytanie i kulturoznawstwo",
              badge: null,
              badgeColor: null,
              badgeBg: null,
              key: "stories",
            },
            {
              icon: <Target size={20} color="#6B8CAE" strokeWidth={1.5} />,
              iconBg: "rgba(107,140,174,0.1)",
              label: "Cele i wyzwania",
              sublabel: "Tygodniowe cele nauki",
              badge: "3",
              badgeColor: "#4A6A8A",
              badgeBg: "rgba(107,140,174,0.1)",
              key: "goals",
            },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => onMenuSelect(item.key)}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border border-border bg-card text-left transition-all hover:border-foreground/15 hover:shadow-md active:scale-[0.98]"
              style={{ boxShadow: "0 1px 10px rgba(26,26,26,0.04)" }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-none" style={{ backgroundColor: item.iconBg }}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 500, color: "var(--foreground)" }}>{item.label}</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)" }}>{item.sublabel}</p>
              </div>
              <div className="flex items-center gap-2.5 flex-none">
                {item.badge && (
                  <div className="px-2.5 py-1 rounded-full" style={{ backgroundColor: item.badgeBg || undefined, border: `1px solid ${item.badgeColor}30` }}>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: item.badgeColor || undefined, fontWeight: 700 }}>{item.badge}</span>
                  </div>
                )}
                <ChevronRight size={16} color="var(--muted-foreground)" strokeWidth={1.5} />
              </div>
            </button>
          ))}
          <button
            className="w-full py-4 text-center rounded-2xl border border-border bg-card mt-auto transition-all hover:border-foreground/15"
          >
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--muted-foreground)" }}>Ustawienia konta</span>
          </button>
        </div>
      </div>
    </div>
  );
}