import { useState } from "react";

export default function AuthScreen({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");

  return (
    <div className="flex w-full min-h-screen">
      {/* ── Left panel: artistic watermark side ── */}
      <div
        className="flex-none hidden lg:flex flex-col justify-between"
        style={{
          width: "52%",
          backgroundColor: "#F0ECE2",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Large decorative ink-wash background characters */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0.055 }}
        >
          <span
            style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: "clamp(280px, 30vw, 420px)",
              fontWeight: 700,
              color: "#1A1A1A",
              lineHeight: 1,
              userSelect: "none",
              letterSpacing: "-0.02em",
            }}
          >
            學
          </span>
        </div>

        {/* Secondary character — top right */}
        <div
          className="absolute top-16 right-16 pointer-events-none"
          style={{ opacity: 0.04 }}
        >
          <span
            style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: "180px",
              fontWeight: 700,
              color: "#1A1A1A",
              lineHeight: 1,
            }}
          >
            語
          </span>
        </div>

        {/* Bottom-left character */}
        <div
          className="absolute bottom-10 left-10 pointer-events-none"
          style={{ opacity: 0.04 }}
        >
          <span
            style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: "140px",
              fontWeight: 700,
              color: "#1A1A1A",
              lineHeight: 1,
            }}
          >
            道
          </span>
        </div>

        {/* Thin vertical red accent line */}
        <div
          className="absolute right-0 top-0 bottom-0 w-px"
          style={{ backgroundColor: "rgba(200,62,52,0.15)" }}
        />

        {/* Content */}
        <div className="relative z-10 px-16 pt-16">
          {/* Seal stamp */}
          <div className="flex items-center gap-4 mb-16">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                border: "2px solid var(--primary)",
                backgroundColor: "rgba(200,62,52,0.06)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Noto Serif SC', serif",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "var(--primary)",
                }}
              >
                漢
              </span>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Noto Serif SC', serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--foreground)",
                }}
              >
                漢語學習
              </p>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                  color: "var(--muted-foreground)",
                  letterSpacing: "0.1em",
                }}
              >
                PLATFORMA JĘZYKA CHIŃSKIEGO
              </p>
            </div>
          </div>

          {/* Marketing headline */}
          <h2
            style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: "42px",
              fontWeight: 700,
              color: "var(--foreground)",
              lineHeight: 1.25,
              maxWidth: "460px",
            }}
          >
            Opanuj mandaryński
            <br />
            <span style={{ color: "var(--primary)" }}>krok po kroku.</span>
          </h2>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              color: "var(--muted-foreground)",
              lineHeight: 1.7,
              maxWidth: "400px",
              marginTop: "20px",
            }}
          >
            Ucz się opartą na standardach HSK ścieżką — z wizualizatorem
            tonów, AI-rekomendowanymi lekcjami i piśmiennictwem kaligrafia.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 px-16 pb-16 flex flex-col gap-3">
          {[
            { hanzi: "声", label: "Wizualizator tonów w czasie rzeczywistym" },
            { hanzi: "智", label: "Lekcje rekomendowane przez AI" },
            { hanzi: "字", label: "Kaligraficzne ćwiczenia pisania" },
          ].map((f) => (
            <div key={f.hanzi} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-none"
                style={{ backgroundColor: "rgba(200,62,52,0.08)", border: "1px solid rgba(200,62,52,0.2)" }}
              >
                <span
                  style={{
                    fontFamily: "'Noto Serif SC', serif",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--primary)",
                  }}
                >
                  {f.hanzi}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  color: "var(--muted-foreground)",
                }}
              >
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 py-16"
        style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}
      >
        {/* Mobile-only logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ border: "1.5px solid var(--primary)", backgroundColor: "rgba(200,62,52,0.06)" }}
          >
            <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "20px", fontWeight: 700, color: "var(--primary)" }}>漢</span>
          </div>
          <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "18px", fontWeight: 700, color: "var(--foreground)" }}>漢語學習</span>
        </div>

        <div style={{ width: "100%", maxWidth: "400px" }}>
          {/* Heading */}
          <div className="mb-8">
            <h1
              style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: "30px",
                fontWeight: 700,
                color: "var(--foreground)",
                marginBottom: "6px",
              }}
            >
              {mode === "login" ? "Witaj z powrotem" : "Utwórz konto"}
            </h1>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                color: "var(--muted-foreground)",
              }}
            >
              {mode === "login"
                ? "Zaloguj się i kontynuuj naukę"
                : "Zacznij swoją przygodę z językiem chińskim"}
            </p>
          </div>

          {/* Mode toggle */}
          <div
            className="flex mb-7 rounded-xl p-1 gap-1"
            style={{ backgroundColor: "var(--muted)" }}
          >
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-2.5 rounded-lg text-sm transition-all duration-200"
                style={{
                  backgroundColor: mode === m ? "var(--card)" : "transparent",
                  color: mode === m ? "var(--foreground)" : "var(--muted-foreground)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: mode === m ? 600 : 400,
                  boxShadow: mode === m ? "0 1px 4px rgba(26,26,26,0.08)" : "none",
                }}
              >
                {m === "login" ? "Zaloguj się" : "Zarejestruj się"}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label
                className="block mb-1.5"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  color: "var(--muted-foreground)",
                  letterSpacing: "0.07em",
                }}
              >
                ADRES E-MAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.com"
                className="w-full px-4 py-3.5 rounded-xl border border-border focus:outline-none transition-all"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: "var(--foreground)",
                  backgroundColor: "var(--secondary)",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(200,62,52,0.08)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label
                className="block mb-1.5"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  color: "var(--muted-foreground)",
                  letterSpacing: "0.07em",
                }}
              >
                HASŁO
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl border border-border focus:outline-none transition-all"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: "var(--foreground)",
                  backgroundColor: "var(--secondary)",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(200,62,52,0.08)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Forgot password */}
          {mode === "login" && (
            <div className="flex justify-end mb-5">
              <button
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  color: "var(--primary)",
                }}
              >
                Zapomniałeś hasła?
              </button>
            </div>
          )}

          {/* Primary CTA */}
          <button
            onClick={onAuth}
            className="w-full py-4 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "0.01em",
              boxShadow: "0 3px 20px rgba(200,62,52,0.28)",
            }}
          >
            {mode === "register" ? "Zarejestruj się →" : "Zaloguj się →"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
            <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: "16px", color: "var(--muted-foreground)", opacity: 0.5 }}>或</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
          </div>

          {/* Secondary */}
          <button
            onClick={onAuth}
            className="w-full py-3.5 rounded-xl border border-border bg-transparent transition-all duration-200 hover:bg-secondary active:scale-[0.98]"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              color: "var(--foreground)",
            }}
          >
            Kontynuuj bez konta
          </button>

          <p
            className="text-center mt-6"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              color: "var(--muted-foreground)",
              lineHeight: 1.6,
            }}
          >
            Rejestrując się, akceptujesz{" "}
            <span style={{ color: "var(--primary)", cursor: "pointer" }}>Warunki korzystania</span>{" "}
            i{" "}
            <span style={{ color: "var(--primary)", cursor: "pointer" }}>Politykę prywatności</span>.
          </p>
        </div>
      </div>
    </div>
  );
}