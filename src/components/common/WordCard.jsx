export default function WordCard({ 
  hanzi, 
  pinyin, 
  translation, 
  level = "HSK 2", 
  variant = "default", 
  onClick 
}) {
  const isCompact = variant === "compact";
  const isDetailed = variant === "detailed";

  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-[var(--card)] transition-all duration-200 border border-[var(--border)] ${
        onClick ? "cursor-pointer hover:border-[var(--primary)]/40 hover:shadow-sm active:scale-[0.99]" : ""
      } ${isCompact ? "p-4 flex items-center justify-between" : "p-6 flex flex-col items-center text-center"}`}
    >
      {isCompact ? (
        <>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--secondary)] flex items-center justify-center border border-[var(--border)]">
              <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "20px", fontWeight: 600, color: "var(--foreground)" }}>
                {hanzi}
              </span>
            </div>
            <div>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>
                {pinyin}
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)" }}>
                {translation}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
            {level}
          </span>
        </>
      ) : (
        <>
          <div className="w-full flex justify-between items-center mb-3">
            <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-md bg-[var(--primary)]/5 text-[var(--primary)] border border-[var(--primary)]/10">
              {level}
            </span>
            {isDetailed && (
              <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                Radical: 水
              </span>
            )}
          </div>

          <div 
            className="rounded-2xl bg-[var(--secondary)] flex items-center justify-center border border-[var(--border)] mb-4 select-none"
            style={{ 
              width: isDetailed ? "120px" : "80px", 
              height: isDetailed ? "120px" : "80px" 
            }}
          >
            <span 
              style={{ 
                fontFamily: "'Noto Serif SC', serif", 
                fontSize: isDetailed ? "52px" : "36px", 
                fontWeight: 700, 
                color: "var(--foreground)" 
              }}
            >
              {hanzi}
            </span>
          </div>

          <h3 
            style={{ 
              fontFamily: "Inter, sans-serif", 
              fontSize: isDetailed ? "20px" : "16px", 
              fontWeight: 600, 
              color: "var(--primary)" 
            }}
          >
            {pinyin}
          </h3>

          <p 
            className="mt-1"
            style={{ 
              fontFamily: "Inter, sans-serif", 
              fontSize: isDetailed ? "15px" : "13px", 
              color: "var(--muted-foreground)" 
            }}
          >
            {translation}
          </p>

          {isDetailed && (
            <div className="w-full mt-6 pt-4 border-t border-[var(--border)] text-left">
              <p className="text-[10px] font-bold text-[var(--muted-foreground)] tracking-wider mb-2 uppercase">Przykłady:</p>
              <div className="bg-[var(--secondary)]/50 p-2.5 rounded-lg border border-[var(--border)] mb-2">
                <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "14px", color: "var(--foreground)" }}>我喜欢吃这个。</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--muted-foreground)" }}>Wǒ xǐhuan chī zhège. — Lubię это есть.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}