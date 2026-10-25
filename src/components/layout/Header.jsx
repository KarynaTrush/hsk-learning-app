import React, { useMemo, useState } from "react";
import { Search, Bell, Settings, Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LANG_CODES, CODE_TO_LABEL, LANG_STORAGE_KEY } from "../../i18n";
import { useAppState } from "../../state/AppState";
import { VOCAB } from "../../data/vocab";
import { dueCards } from "../../lib/srs";
import overlay from "../overlays/Overlays.module.css";
import styles from "./Header.module.css";

export default function Header({ title, subtitle, onProfileClick, onOpenCharacter, onLogout }) {
  const { t, i18n } = useTranslation();
  const { state, toggleTheme } = useAppState();
  const currentLang = CODE_TO_LABEL[i18n.resolvedLanguage] || CODE_TO_LABEL[i18n.language] || "RU";
  const [panel, setPanel] = useState(null);
  const [query, setQuery] = useState("");

  const due = dueCards(state.words).length;
  const mistakeCount = state.mistakes?.length || 0;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return VOCAB.slice(0, 8);
    return VOCAB.filter((w) => {
      const meaning = t(`meanings.${w.hanzi}`, { defaultValue: "" }).toLowerCase();
      return w.hanzi.includes(query) || w.pinyin.toLowerCase().includes(q) || meaning.includes(q);
    }).slice(0, 12);
  }, [query, t]);

  function handleLangChange(lang) {
    const code = LANG_CODES[lang];
    i18n.changeLanguage(code);
  }

  return (
    <header className={styles.header}>
      <div className={styles.titleWrapper}>
        <h1 className={styles.mainTitle}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      <div className={styles.actionsWrapper}>
        <div className={styles.langSelector}>
          {["EN", "RU", "PL"].map((lang) => (
            <button
              key={lang}
              className={`${styles.langButton} ${currentLang === lang ? styles.langButtonActive : ""}`}
              onClick={() => handleLangChange(lang)}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        <button className={styles.iconButton} aria-label={t("header.changeTheme")} onClick={toggleTheme}>
          {state.theme === "dark"
            ? <Moon size={18} color="var(--muted-foreground)" strokeWidth={1.8} />
            : <Sun size={18} color="var(--muted-foreground)" strokeWidth={1.8} />}
        </button>

        <button className={styles.iconButton} aria-label={t("header.search")} onClick={() => setPanel("search")}>
          <Search size={18} color="var(--muted-foreground)" strokeWidth={1.8} />
        </button>

        <button className={styles.iconButton} aria-label={t("header.notifications")} onClick={() => setPanel("notify")}>
          <Bell size={18} color="var(--muted-foreground)" strokeWidth={1.8} />
          {(due > 0 || mistakeCount > 0) && <div className={styles.notificationDot} />}
        </button>

        <button className={styles.iconButton} aria-label={t("header.settings")} onClick={() => setPanel("settings")}>
          <Settings size={18} color="var(--muted-foreground)" strokeWidth={1.8} />
        </button>

        <div className={styles.divider} />

        <button onClick={onProfileClick} className={styles.profileAvatar} aria-label={t("header.userProfile")}>
          <span className={styles.avatarHanzi}>安</span>
        </button>
      </div>

      {panel && (
        <div className={overlay.backdrop} onClick={() => setPanel(null)}>
          <div className={overlay.panel} onClick={(e) => e.stopPropagation()}>
            {panel === "search" && (
              <>
                <p className={overlay.title}>{t("search.dictionary")}</p>
                <input
                  className={overlay.searchInput}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("search.placeholder")}
                  autoFocus
                />
                {results.length === 0 && <p className={overlay.empty}>{t("search.empty")}</p>}
                {results.map((w) => (
                  <div
                    key={w.hanzi}
                    className={overlay.row}
                    onClick={() => { setPanel(null); onOpenCharacter?.(w.hanzi); }}
                  >
                    <span className={overlay.hanzi}>{w.hanzi}</span>
                    <div>
                      <div>{w.pinyin}</div>
                      <div className={overlay.meta}>{t(`meanings.${w.hanzi}`)} · HSK {w.hsk}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {panel === "notify" && (
              <>
                <p className={overlay.title}>{t("notify.title")}</p>
                {due === 0 && mistakeCount === 0 && <p className={overlay.empty}>{t("notify.empty")}</p>}
                {due > 0 && <p className={overlay.meta}>{t("notify.due", { count: due })}</p>}
                {mistakeCount > 0 && <p className={overlay.meta}>{t("notify.mistakes", { count: mistakeCount })}</p>}
              </>
            )}
            {panel === "settings" && (
              <>
                <p className={overlay.title}>{t("settings.title")}</p>
                <button className={overlay.action} onClick={toggleTheme}>
                  {state.theme === "dark" ? t("settings.themeLight") : t("settings.themeDark")}
                </button>
                <button className={overlay.action} onClick={() => { setPanel(null); onLogout?.(); }}>
                  {t("common.logout")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
