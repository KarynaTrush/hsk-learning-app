import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { goalProgress } from "../../lib/activity";
import logo from '../../assets/images/logo.png';
import styles from './Sidebar.module.css';

export default function Sidebar({ isMain, activeTab, goMain }) {
  const { t } = useTranslation();
  const { state } = useAppState();
  const goal = goalProgress(state);
  const [goalOpen, setGoalOpen] = useState(false);

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
          <img
            src={logo}
            alt="HSK Platform Logo"
            className="w-full h-auto max-h-20 object-contain"
          />
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

        <div className={`${styles.forecastDrawer} ${goalOpen ? styles.forecastDrawerOpen : ""}`}>
          <button
            type="button"
            className={styles.forecastHandle}
            onClick={() => setGoalOpen((prev) => !prev)}
            aria-expanded={goalOpen}
          >
            <span className={styles.handleBadge}>HSK {goal.target}</span>
            <span className={styles.handleText}>{t("nav.goal")} · {goal.percent}%</span>
            <span className={styles.handleArrow}>{goalOpen ? "▾" : "▴"}</span>
          </button>

          <div className={styles.forecastBody}>
            <div className={styles.forecastWidget}>
              <div className={styles.forecastHeader}>
                <p className={styles.forecastTitle}>{t("nav.goal")}</p>
                <p className={styles.forecastValue}>HSK {goal.target}</p>
              </div>
              <div className={styles.forecastBar}>
                <div className={styles.forecastFill} style={{ width: `${goal.percent}%` }} />
              </div>
              <p className={styles.forecastDate}>{t("nav.goalPercent", { percent: goal.percent })}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}