import { Search, Bell } from "lucide-react";

export default function Header({ title, subtitle, isSub, screen, goMain }) {
  return (
    <header
      className="flex-none flex items-center justify-between px-8 py-4"
      style={{
        backgroundColor: "var(--background)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 20,
        boxSizing: "border-box"
      }}
    >
      <div>
        <h1 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "20px", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.2 }}>
          {title}
        </h1>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)" }}>
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-3.5">
        {isSub && (
          <button
            onClick={() => goMain(["mojebledy", "powtorki", "character"].includes(screen) ? "profile" : "dashboard")}
            className="px-4 py-2 rounded-lg border border-border bg-secondary text-sm transition-all hover:border-primary/30 active:scale-95 cursor-pointer"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--muted-foreground)" }}
          >
            ← Wróć
          </button>
        )}
        <button className="w-9 h-9 rounded-full flex items-center justify-center border border-border bg-card transition-all hover:border-primary/30 active:scale-90 cursor-pointer">
          <Search size={15} color="var(--muted-foreground)" strokeWidth={1.5} />
        </button>
        <button className="w-9 h-9 rounded-full flex items-center justify-center border border-border bg-card relative transition-all hover:border-primary/30 active:scale-90 cursor-pointer">
          <Bell size={15} color="var(--muted-foreground)" strokeWidth={1.5} />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
        </button>
        <div className="w-[1px] h-5 bg-border mx-0.5" />
        <button 
          onClick={() => goMain("profile")}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-none transition-all border hover:border-primary/40 active:scale-95 cursor-pointer"
          style={{
            border: "1.5px solid var(--primary)",
            backgroundColor: "rgba(200,62,52,0.06)",
          }}
        >
          <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "16px", fontWeight: 700, color: "var(--primary)" }}>
            安
          </span>
        </button>
      </div>
    </header>
  );
}