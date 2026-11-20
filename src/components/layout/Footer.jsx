import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./Footer.module.css";

const CONTACT_ITEMS = [
  {
    id: "instagram",
    platform: "Instagram",
    handle: "@karitrush",
    href: "https://instagram.com/karitrush",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    id: "threads",
    platform: "Threads",
    handle: "@karitrush",
    href: "https://threads.net/@karitrush",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12a7 7 0 1 0-7 7c3.87 0 6.5-2.1 6.5-5.5 0-2.6-1.8-4.2-4.2-4.2-2.1 0-3.6 1.3-3.6 3.2 0 1.7 1.2 2.9 2.9 2.9 1.6 0 2.7-1.1 2.7-2.8V8.5" />
      </svg>
    ),
  },
  {
    id: "facebook",
    platform: "Facebook",
    handle: "Karyna Trush",
    href: "https://www.facebook.com/profile.php?id=100086401967840",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    id: "youtube",
    platform: "YouTube",
    handle: "     ",
    href: "https://www.youtube.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
  },
  {
    id: "email",
    platform: "Email",
    handle: "trushkaryna@gmail.com",
    href: "mailto:trush.karyna@gmail.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

export default function Footer({ onNavigateTab, onOpenSub }) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <div className={styles.brand}>
            <span className={styles.logoMark}>心娜</span>
            <div className={styles.brandText}>
              <span className={styles.title}>XINNA</span>
              <span className={styles.subtitle}>
                {t("footer.subtitle", "Adaptive HSK 2.0 Learning Platform")}
              </span>
            </div>
          </div>

          <nav className={styles.links} aria-label="Footer navigation">
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => onNavigateTab("dashboard")}
            >
              {t("nav.dashboard", "Dashboard")}
            </button>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => onNavigateTab("path")}
            >
              {t("nav.path", "HSK Map")}
            </button>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => onOpenSub("grammar")}
            >
              {t("grammar.title", "Grammar")}
            </button>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => onOpenSub("mistakes")}
            >
              {t("screens.mistakesTitle", "Mistakes")}
            </button>
          </nav>
        </div>

        <div className={styles.socialsGrid} aria-label="Contacts and social links">
          {CONTACT_ITEMS.map((item) => {
            const isMail = item.href.startsWith("mailto:");
            return (
              <a
                key={item.id}
                href={item.href}
                target={isMail ? undefined : "_blank"}
                rel={isMail ? undefined : "noopener noreferrer"}
                className={styles.socialChip}
              >
                <span className={styles.socialIcon}>{item.icon}</span>
                <span className={styles.socialInfo}>
                  <span className={styles.socialPlatform}>{item.platform}</span>
                  <span className={styles.socialHandle}>{item.handle}</span>
                </span>
              </a>
            );
          })}
        </div>
        <div className={styles.bottomRow}>
          <span>© {currentYear} Karyna Trush</span>
          <span className={styles.dot}>·</span>
          <span>Politechnika Opolska</span>
        </div>
      </div>
    </footer>
  );
}