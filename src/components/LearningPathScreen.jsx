import { Lock, AlertTriangle, Star, CheckCircle2, ChevronRight } from "lucide-react";

const hskLevels = [
  {
    level: 1,
    label: "HSK 1",
    status: "completed",
    color: "var(--accent)",
    bgColor: "rgba(79,121,66,0.06)",
    borderColor: "rgba(79,121,66,0.25)",
    nodes: [
      { id: 1, hanzi: "你好", label: "Powitania", sublabel: "Podstawowe zwroty", status: "completed" },
      { id: 2, hanzi: "数字", label: "Liczby 1–100", sublabel: "Cyfry i liczenie", status: "completed" },
      { id: 3, hanzi: "家人", label: "Rodzina", sublabel: "Relacje rodzinne", status: "completed" },
      { id: 4, hanzi: "时间", label: "Czas", sublabel: "Dni i godziny", status: "completed", mistakes: true },
    ],
  },
  {
    level: 2,
    label: "HSK 2",
    status: "active",
    color: "var(--primary)",
    bgColor: "rgba(200,62,52,0.04)",
    borderColor: "rgba(200,62,52,0.2)",
    nodes: [
      { id: 5, hanzi: "食物", label: "Jedzenie", sublabel: "Potrawy i napoje", status: "active" },
      { id: 6, hanzi: "购物", label: "Zakupy", sublabel: "Handel i pieniądze", status: "locked" },
      { id: 7, hanzi: "交通", label: "Transport", sublabel: "Podróże i kierunki", status: "locked" },
      { id: 8, hanzi: "天气", label: "Pogoda", sublabel: "Opisy klimatu", status: "locked" },
    ],
  },
  {
    level: 3,
    label: "HSK 3",
    status: "locked",
    color: "var(--muted-foreground)",
    bgColor: "var(--muted)",
    borderColor: "var(--border)",
    nodes: [
      { id: 9, hanzi: "工作", label: "Praca", sublabel: "Zawody i miejsca", status: "locked" },
      { id: 10, hanzi: "健康", label: "Zdrowie", sublabel: "Ciało i medycyna", status: "locked" },
      { id: 11, hanzi: "旅行", label: "Podróże", sublabel: "Miejsca i kultura", status: "locked" },
      { id: 12, hanzi: "情感", label: "Emocje", sublabel: "Uczucia i relacje", status: "locked" },
    ],
  },
];

function NodeCard({ node, onSelect }) {
  const isDone   = node.status === "completed";
  const isActive = node.status === "active";
  const isLocked = node.status === "locked";

  return (
    <button
      onClick={() => !isLocked && onSelect()}
      className="flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-200 group text-center"
      style={{
        backgroundColor: isActive
          ? "var(--card)"
          : isDone
          ? "rgba(79,121,66,0.04)"
          : "var(--muted)",
        borderColor: isActive
          ? "var(--primary)"
          : isDone
          ? "rgba(79,121,66,0.28)"
          : "var(--border)",
        boxShadow: isActive
          ? "0 0 0 3px rgba(200,62,52,0.12), 0 4px 20px rgba(200,62,52,0.10)"
          : isDone
          ? "0 1px 8px rgba(26,26,26,0.04)"
          : "none",
        opacity: isLocked ? 0.5 : 1,
        cursor: isLocked ? "not-allowed" : "pointer",
        minWidth: 0,
      }}
    >
      {/* Hanzi circle */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center relative"
        style={{
          backgroundColor: isActive
            ? "rgba(200,62,52,0.08)"
            : isDone
            ? "rgba(79,121,66,0.1)"
            : "var(--secondary)",
          border: isActive
            ? "2px solid var(--primary)"
            : isDone
            ? "2px solid var(--accent)"
            : "1.5px solid var(--border)",
        }}
      >
        {isLocked ? (
          <Lock size={18} color="var(--muted-foreground)" strokeWidth={1.5} />
        ) : (
          <span
            style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: "22px",
              fontWeight: 700,
              color: isActive ? "var(--primary)" : isDone ? "var(--accent)" : "var(--muted-foreground)",
            }}
          >
            {node.hanzi[0]}
          </span>
        )}
        {/* Status indicator */}
        {isDone && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <span style={{ fontSize: "10px", color: "white", lineHeight: 1 }}>✓</span>
          </div>
        )}
        {isActive && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Star size={10} color="white" fill="white" />
          </div>
        )}
        {node.mistakes && (
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#D4A843" }}
          >
            <AlertTriangle size={9} color="white" strokeWidth={2.5} />
          </div>
        )}
      </div>

      <div>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: isActive ? 600 : 500,
            color: isLocked ? "var(--muted-foreground)" : "var(--foreground)",
            lineHeight: 1.2,
          }}
        >
          {node.label}
        </p>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "10px",
            color: "var(--muted-foreground)",
            marginTop: "2px",
          }}
        >
          {node.sublabel}
        </p>
      </div>

      {isActive && (
        <div
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: "rgba(200,62,52,0.1)" }}
        >
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.04em" }}>
            TERAZ
          </span>
        </div>
      )}
    </button>
  );
}

export default function LearningPathScreen({ onNodeSelect }) {
  return (
    <div className="p-8" style={{ maxWidth: "1100px", margin: "0 auto" }}>

      {/* Page intro */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.07em", marginBottom: "4px" }}>
            学习路径 · TWOJA ŚCIEŻKA HSK
          </p>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "var(--muted-foreground)", maxWidth: "480px", lineHeight: 1.6 }}>
            Ucz się krok po kroku. Każdy poziom odblokuje się po ukończeniu poprzedniego.
            Węzły z ikoną ⚠ zawierają tematy, w których popełniłaś błędy.
          </p>
        </div>

        {/* Legend */}
        <div className="flex gap-5 flex-none mt-1">
          {[
            { color: "var(--accent)", label: "Ukończono" },
            { color: "var(--primary)", label: "Aktywne" },
            { color: "#D4A843", label: "Błędy" },
            { color: "var(--muted-foreground)", label: "Zablokowane", opacity: 0.4 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color, opacity: item.opacity || 1 }} />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HSK levels — vertical stack with wide node rows */}
      <div className="flex flex-col gap-6">
        {hskLevels.map((level, li) => (
          <div key={level.level}>
            {/* Level header banner */}
            <div
              className="flex items-center justify-between px-6 py-4 rounded-2xl mb-4"
              style={{
                backgroundColor: level.bgColor,
                border: `1.5px solid ${level.borderColor}`,
              }}
            >
              <div className="flex items-center gap-4">
                {/* Level badge */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-none"
                  style={{
                    backgroundColor: level.status === "completed" ? "var(--accent)" : level.status === "active" ? "rgba(200,62,52,0.15)" : "var(--muted)",
                    border: `2px solid ${level.color}`,
                  }}
                >
                  {level.status === "completed" ? (
                    <CheckCircle2 size={18} color="white" strokeWidth={2} />
                  ) : (
                    <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "14px", fontWeight: 700, color: level.color }}>
                      {level.level}
                    </span>
                  )}
                </div>
                <div>
                  <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "18px", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.1 }}>
                    {level.label}
                  </p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)" }}>
                    {level.status === "completed"
                      ? "Ukończono · 4 / 4 lekcji"
                      : level.status === "active"
                      ? "W toku · 1 / 4 lekcji"
                      : "Zablokowane · 0 / 4 lekcji"}
                  </p>
                </div>
              </div>

              {level.status !== "locked" && (
                <div className="flex items-center gap-2">
                  {level.status === "active" && (
                    <button
                      onClick={onNodeSelect}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:opacity-90 active:scale-95"
                      style={{
                        backgroundColor: "var(--primary)",
                        color: "var(--primary-foreground)",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        fontWeight: 600,
                        boxShadow: "0 2px 10px rgba(200,62,52,0.2)",
                      }}
                    >
                      Kontynuuj <ChevronRight size={14} strokeWidth={2} />
                    </button>
                  )}
                  {level.status === "completed" && (
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card transition-all hover:border-accent/30 active:scale-95"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)" }}
                    >
                      Powtórz lekcje
                    </button>
                  )}
                </div>
              )}

              {level.status === "locked" && (
                <div className="flex items-center gap-2">
                  <Lock size={14} color="var(--muted-foreground)" strokeWidth={1.5} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)" }}>
                    Ukończ HSK {level.level - 1}, aby odblokować
                  </span>
                </div>
              )}
            </div>

            {/* Node grid — 4 cols */}
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(4, 1fr)", opacity: level.status === "locked" ? 0.55 : 1 }}
            >
              {level.nodes.map((node, ni) => (
                <div key={node.id} className="flex flex-col items-center gap-0">
                  <NodeCard node={node} onSelect={onNodeSelect} />
                </div>
              ))}
            </div>

            {/* Connector between levels */}
            {li < hskLevels.length - 1 && (
              <div className="flex justify-center mt-4">
                <div
                  className="flex flex-col items-center gap-0"
                  style={{ opacity: hskLevels[li + 1].status === "locked" ? 0.25 : 0.6 }}
                >
                  <div className="w-px h-4" style={{ backgroundColor: "var(--border)" }} />
                  <ChevronRight
                    size={16}
                    color="var(--muted-foreground)"
                    strokeWidth={1.5}
                    style={{ transform: "rotate(90deg)" }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}