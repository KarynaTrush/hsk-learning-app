import React, { useState } from "react";
import { Search, Bell, Settings, Sun } from "lucide-react";
import styles from "./Header.module.css"; 
export default function Header({ title, subtitle, onProfileClick }) {
  const [currentLang, setCurrentLang] = useState("PL");

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
              onClick={() => setCurrentLang(lang)}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        <button className={styles.iconButton} aria-label="Zmień motyw">
          <Sun size={18} color="var(--muted-foreground)" strokeWidth={1.8} />
        </button>

        <button className={styles.iconButton} aria-label="Szukaj">
          <Search size={18} color="var(--muted-foreground)" strokeWidth={1.8} />
        </button>

        <button className={styles.iconButton} aria-label="Powiadomienia">
          <Bell size={18} color="var(--muted-foreground)" strokeWidth={1.8} />
          <div className={styles.notificationDot} />
        </button>

        <button className={styles.iconButton} aria-label="Ustawienia">
          <Settings size={18} color="var(--muted-foreground)" strokeWidth={1.8} />
        </button>

        <div className={styles.divider} />

        <button 
          onClick={onProfileClick} 
          className={styles.profileAvatar}
          aria-label="Profil użytkownika"
        >
          <span className={styles.avatarHanzi}>安</span>
        </button>
      </div>
    </header>
  );
}