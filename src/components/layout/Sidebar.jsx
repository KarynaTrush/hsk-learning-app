import React from 'react';
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import logo from '../../assets/images/logo.png';
import styles from './Sidebar.module.css';

export default function Sidebar({ isMain, activeTab, goMain }) {
  const { t } = useTranslation();
  const { state } = useAppState();

  const menuItems = [
    { id: "dashboard", label: t("nav.dashboard"), hanzi: "主", sublabel: t("nav.dashboardSub") },
    { id: "path",      label: t("nav.path"),      hanzi: "路", sublabel: t("nav.pathSub") },
    { id: "tones",     label: t("nav.tones"),     hanzi: "声", sublabel: t("nav.tonesSub") },
    { id: "writing",   label: t("nav.writing"),   hanzi: "写", sublabel: t("nav.writingSub") },
    { id: "stories",   label: t("nav.stories"),   hanzi: "书", sublabel: t("nav.storiesSub") },
    { id: "profile",   label: t("nav.profile"),   hanzi: "我", sublabel: t("nav.profileSub") },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.topSection}>
        <div className={styles.logoWrapper}>
          <button
            type="button"
            onClick={() => goMain("dashboard")}
            className={styles.logoButton}
            aria-label={t("nav.dashboard", "Главная панель")}
          >
            <img
              src={logo}
              alt="HSK Platform Logo"
              className={styles.logoImage}
            />
          </button>
        </div>
        <nav className={styles.navScrollable} aria-label="Primary Navigation">
          {menuItems.map((tab) => {
            const isActive = isMain && activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => goMain(tab.id)}
                className={`${styles.navButton} ${isActive ? styles.navButtonActive : ""}`}
              >
                <div className={`${styles.hanziBox} ${isActive ? styles.hanziBoxActive : ""}`}>
                  <span className={isActive ? styles.hanziTextActive : styles.hanziText}>
                    {tab.hanzi}
                  </span>
                </div>
                <div className={styles.textGroup}>
                  <p className={`${isActive ? styles.labelActive : styles.label} truncate`}>
                    {tab.label}
                  </p>
                  <p className={`${isActive ? styles.sublabelActive : styles.sublabel} truncate`}>
                    {tab.sublabel}
                  </p>
                </div>
                {isActive && (
                  <div className={styles.activeDot} />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}