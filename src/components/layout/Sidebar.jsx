import React from 'react';
import { useTranslation } from "react-i18next";
import logo from '../../assets/images/logo.png';
import styles from './Sidebar.module.css';

export default function Sidebar({ isMain, activeTab, goMain }) {
  const { t } = useTranslation();

  const menuItems = [
    { id: "dashboard", label: t("nav.dashboard"), hanzi: "主", sublabel: t("nav.dashboardSub") },
    { id: "path",      label: t("nav.path"),      hanzi: "路", sublabel: t("nav.pathSub") },
    { id: "tones",     label: t("nav.tones"),     hanzi: "声", sublabel: t("nav.tonesSub") },
    { id: "stories",   label: t("nav.stories"),   hanzi: "书", sublabel: t("nav.storiesSub") },
    { id: "profile",   label: t("nav.profile"),   hanzi: "我", sublabel: t("nav.profileSub") },
  ];

  return (
    <aside className={`flex-none flex flex-col justify-between ${styles.sidebar}`}>
      <div className="flex flex-col flex-1">
        <div className={`flex items-center justify-center px-2 py-2 ${styles.logoWrapper}`}>
          <img 
            src={logo} 
            alt="HSK Platform Logo" 
            className="w-full h-auto max-h-25 object-contain" 
          />
        </div>

        <nav className={`flex flex-col gap-1 px-3 py-4 flex-1 ${styles.navScrollable}`}>
          {menuItems.map((tab) => {
            const isActive = isMain && activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => goMain(tab.id)}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 group w-full cursor-pointer ${
                  isActive ? styles.navButtonActive : styles.navButton
                }`}
              >
                <div className={`flex-none w-9 h-9 rounded-lg flex items-center justify-center ${
                  isActive ? styles.hanziBoxActive : styles.hanziBox
                }`}>
                  <span className={isActive ? styles.hanziTextActive : styles.hanziText}>
                    {tab.hanzi}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`${isActive ? styles.labelActive : styles.label} truncate`}>
                    {tab.label}
                  </p>
                  <p className={isActive ? styles.sublabelActive : styles.sublabel}>
                    {tab.sublabel}
                  </p>
                </div>
                {isActive && (
                  <div className={`ml-auto w-1.5 h-1.5 rounded-full flex-none ${styles.activeDot}`} />
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="px-4 pb-5 pt-2">
        <div className={`rounded-xl px-4 py-3 ${styles.forecastWidget}`}>
          <p className={styles.forecastTitle}>{t("nav.examForecast")}</p>
          <p className={styles.forecastValue}>HSK 3</p>
          <p className={styles.forecastDate}>est. 15.03.2027</p>
        </div>
      </div>
    </aside>
  );
}