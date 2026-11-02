import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import styles from "./Auth.module.css";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function AuthScreen({ onAuth }) {
  const { t } = useTranslation();
  const { register, signIn, login } = useAppState();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputFocus = (e) => {
    e.target.style.borderColor = "var(--primary)";
    e.target.style.boxShadow = "0 0 0 3px rgba(200,62,52,0.08)";
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = "var(--border)";
    e.target.style.boxShadow = "none";
  };

  const switchMode = (m) => {
    setMode(m);
    setError("");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setDetail("");

    const cleanEmail = email.trim().toLowerCase();
    if (mode === "register" && !name.trim()) return setError("name_required");
    if (!EMAIL_RE.test(cleanEmail)) return setError("invalid_email");
    if (mode === "register" && password.length < 8) return setError("password_short");
    if (!password) return setError("invalid_credentials");

    setLoading(true);
    try {
      if (mode === "register") {
        await register({ name: name.trim(), email: cleanEmail, password });
      } else {
        await signIn({ email: cleanEmail, password });
      }
      setLoading(false);
      onAuth();
    } catch (err) {
      console.warn("Auth error:", err);
      setLoading(false);
      setError(err?.code || "server_error");
      setDetail(err?.detail || err?.message || "");
    }
  }

  function handleGuest() {
    login({ guest: true });
    onAuth();
  }

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
              <p className={styles.logoSubtitle}>{t("auth.platform")}</p>
            </div>
          </div>

          <h2 className={styles.mainHeading}>
            {t("auth.heading")}
            <br />
            <span className={styles.headingAccent}>{t("auth.headingAccent")}</span>
          </h2>
          <p className={styles.description}>{t("auth.description")}</p>
        </div>

        <div className={styles.leftFeatures}>
          {[
            { hanzi: "声", label: t("auth.featTones") },
            { hanzi: "智", label: t("auth.featAi") },
            { hanzi: "字", label: t("auth.featCalligraphy") },
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

        <form className={styles.formWrapper} onSubmit={handleSubmit} noValidate>
          <div className="mb-8">
            <h1 className={styles.formTitle}>
              {mode === "login" ? t("auth.welcomeBack") : t("auth.createAccount")}
            </h1>
            <p className={styles.formSubtitle}>
              {mode === "login" ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}
            </p>
          </div>

          <div className={styles.modeToggleContainer}>
            {["login", "register"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={styles.modeButton}
                style={{
                  backgroundColor: mode === m ? "var(--card)" : "transparent",
                  color: mode === m ? "var(--foreground)" : "var(--muted-foreground)",
                  fontWeight: mode === m ? 600 : 400,
                  boxShadow: mode === m ? "0 1px 4px rgba(26,26,26,0.08)" : "none",
                }}
              >
                {m === "login" ? t("auth.login") : t("auth.register")}
              </button>
            ))}
          </div>

          <div className={styles.inputFieldContainer}>
            {mode === "register" && (
              <div>
                <label className={styles.inputLabel}>{t("auth.name")}</label>
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("auth.namePlaceholder")}
                  className={styles.inputElement}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
            )}
            <div>
              <label className={styles.inputLabel}>{t("auth.email")}</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                className={styles.inputElement}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>
            <div>
              <label className={styles.inputLabel}>{t("auth.password")}</label>
              <input
                type="password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
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
              <button type="button" className={styles.forgotPasswordButton}>
                {t("auth.forgotPassword")}
              </button>
            </div>
          )}

          {error && (
            <p className={styles.errorText} role="alert">
              {t(`auth.errors.${error}`, { defaultValue: t("auth.errors.server_error") })}
              {import.meta.env.DEV && detail && (
                <small style={{ display: "block", marginTop: 6, opacity: 0.8, wordBreak: "break-word" }}>
                  [dev] {detail}
                </small>
              )}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`hover:opacity-90 active:scale-[0.98] ${styles.submitButton}`}
          >
            {loading ? t("auth.loading") : mode === "register" ? t("auth.registerSubmit") : t("auth.loginSubmit")}
          </button>

          <div className={styles.dividerRow}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>或</span>
            <div className={styles.dividerLine} />
          </div>

          <button
            type="button"
            onClick={handleGuest}
            className={`active:scale-[0.98] ${styles.guestButton}`}
          >
            {t("auth.continueGuest")}
          </button>

          <p className={styles.legalText}>
            {t("auth.legal")} <span className={styles.legalLink}>{t("auth.terms")}</span> {t("auth.and")}{" "}
            <span className={styles.legalLink}>{t("auth.privacy")}</span>.
          </p>
        </form>
      </div>
    </div>
  );
}