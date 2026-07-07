import { useState } from "react";
import styles from "./Auth.module.css";

export default function AuthScreen({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");

  const handleInputFocus = (e) => {
    e.target.style.borderColor = "var(--primary)";
    e.target.style.boxShadow = "0 0 0 3px rgba(200,62,52,0.08)";
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = "var(--border)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.bgCharacterXue}>
          <span>學</span>
        </div>
        <div className={styles.bgCharacterYu}>
          <span>語</span>
        </div>
        <div className={styles.bgCharacterDao}>
          <span>道</span>
        </div>
        <div className={styles.panelBorder} />
        
        <div className={styles.leftHeader}>
          <div className="flex items-center gap-4 mb-16">
            <div className={styles.logoBox}>
              <span className={styles.logoHanzi}>漢</span>
            </div>
            <div>
              <p className={styles.logoTitle}>漢語學習</p>
              <p className={styles.logoSubtitle}>PLATFORMA JĘZYKA CHIŃSKIEGO</p>
            </div>
          </div>

          <h2 className={styles.mainHeading}>
            Opanuj mandaryński
            <br />
            <span className={styles.headingAccent}>krok po kroku.</span>
          </h2>
          <p className={styles.description}>
            Ucz się opartą na standardach HSK ścieżką — z wizualizatorem
            tonów, AI-rekomendowanymi lekcjami i piśmiennictwem kaligrafia.
          </p>
        </div>

        <div className={styles.leftFeatures}>
          {[
            { hanzi: "声", label: "Wizualizator tonów w czasie rzeczywistym" },
            { hanzi: "智", label: "Lekcje rekomendowane przez AI" },
            { hanzi: "字", label: "Kaligraficzne ćwiczenia pisania" },
          ].map((f) => (
            <div key={f.hanzi} className="flex items-center gap-3">
              <div className={styles.featureIconBox}>
                <span className={styles.featureHanzi}>{f.hanzi}</span>
              </div>
              <span className={styles.featureLabel}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className={styles.mobileLogoBox}>
            <span className={styles.mobileLogoHanzi}>漢</span>
          </div>
          <span className={styles.mobileLogoTitle}>漢語學習</span>
        </div>

        <div className={styles.formWrapper}>
          <div className="mb-8">
            <h1 className={styles.formTitle}>
              {mode === "login" ? "Witaj z powrotem" : "Utwórz konto"}
            </h1>
            <p className={styles.formSubtitle}>
              {mode === "login"
                ? "Zaloguj się i kontynuuj naukę"
                : "Zacznij swoją przygodę z językiem chińskim"}
            </p>
          </div>

          <div className={styles.modeToggleContainer}>
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={styles.modeButton}
                style={{
                  backgroundColor: mode === m ? "var(--card)" : "transparent",
                  color: mode === m ? "var(--foreground)" : "var(--muted-foreground)",
                  fontWeight: mode === m ? 600 : 400,
                  boxShadow: mode === m ? "0 1px 4px rgba(26,26,26,0.08)" : "none",
                }}
              >
                {m === "login" ? "Zaloguj się" : "Zarejestruj się"}
              </button>
            ))}
          </div>

          <div className={styles.inputFieldContainer}>
            <div>
              <label className={styles.inputLabel}>ADRES E-MAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.com"
                className={styles.inputElement}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>
            <div>
              <label className={styles.inputLabel}>HASŁO</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.inputElement}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>
          </div>

          {mode === "login" && (
            <div className={styles.forgotPasswordRow}>
              <button className={styles.forgotPasswordButton}>
                Zapomniałeś hasła?
              </button>
            </div>
          )}

          <button
            onClick={onAuth}
            className={`hover:opacity-90 active:scale-[0.98] ${styles.submitButton}`}
          >
            {mode === "register" ? "Zarejestruj się →" : "Zaloguj się →"}
          </button>

          <div className={styles.dividerRow}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>或</span>
            <div className={styles.dividerLine} />
          </div>

          <button
            onClick={onAuth}
            className={`active:scale-[0.98] ${styles.guestButton}`}
          >
            Kontynuuj bez konta
          </button>

          <p className={styles.legalText}>
            Rejestrując się, akceptujesz{" "}
            <span className={styles.legalLink}>Warunki korzystania</span>{" "}
            i{" "}
            <span className={styles.legalLink}>Politykę prywatności</span>.
          </p>
        </div>
      </div>
    </div>
  );
}