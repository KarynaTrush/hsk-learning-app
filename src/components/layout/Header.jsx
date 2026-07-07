import React from "react";
import { Search, Bell } from "lucide-react";
import styles from "./Header.module.css"; // Подключаем стили

export default function Header({ title, subtitle, onProfileClick }) {
  return (
    <header className={styles.header}>
      {/* Левый блок: Заголовки */}
      <div className={styles.titleWrapper}>
        <h1 className={styles.mainTitle}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {/* Правый блок: Инструменты и Аватар */}
      <div className={styles.actionsWrapper}>
        {/* Кнопка поиска */}
        <button className={styles.iconButton} aria-label="Szukaj">
          <Search size={18} color="var(--muted-foreground)" strokeWidth={1.8} />
        </button>

        {/* Кнопка уведомлений с индикатором */}
        <button className={styles.iconButton} aria-label="Powiadomienia">
          <Bell size={18} color="var(--muted-foreground)" strokeWidth={1.8} />
          <div className={styles.notificationDot} />
        </button>

        {/* Кнопка профиля (Аватар с китайским инициалом) */}
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