import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { LANG_CODES, LANG_STORAGE_KEY } from "../../i18n";
import StandardSwitch from "../ui/StandardSwitch";
import logo from "../../assets/images/logo.png";
import styles from "./TopBar.module.css";

const CODES = Array.isArray(LANG_CODES)
  ? LANG_CODES
  : LANG_CODES instanceof Set
    ? Array.from(LANG_CODES)
    : Object.keys(LANG_CODES || {});

export default function TopBar({ title, onSkip }) {
  const { t, i18n } = useTranslation();
  const { state, toggleTheme, setStandard } = useAppState();
  const current = i18n.resolvedLanguage || "ru";

  function changeLanguage(code) {
    i18n.changeLanguage(code);
    localStorage.setItem(LANG_STORAGE_KEY, code);
  }

  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        <img src={logo} alt="XINNA" className={styles.logo} />
        {title && <span className={styles.title}>{title}</span>}
      </div>
      <div className={styles.actions}>
        <StandardSwitch value={state.hskStandard || "2.0"} onChange={setStandard} t={t} compact />
        <div className={styles.lang}>
          {CODES.map((code) => (
            <button key={code} type="button" className={`${styles.langBtn} ${current === code ? styles.langActive : ""}`} onClick={() => changeLanguage(code)}>
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        <button type="button" className={styles.iconBtn} onClick={toggleTheme} aria-label={t("account.theme")}>
          {state.theme === "dark" ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
        </button>
        {onSkip && (
          <button type="button" className={styles.skip} onClick={onSkip}>
            {t("app.skipPlacement")}
          </button>
        )}
      </div>
    </header>
  );
}