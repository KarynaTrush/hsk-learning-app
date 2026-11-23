import React from "react";
import styles from "./StandardSwitch.module.css";

export default function StandardSwitch({ value, onChange, t, compact = false }) {
  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ""}`} role="group" aria-label={t("standard.title")}>
      <button
        type="button"
        className={`${styles.option} ${value === "2.0" ? styles.active : ""}`}
        onClick={() => onChange("2.0")}
      >
        HSK 2.0
      </button>
      <button type="button" className={`${styles.option} ${styles.disabled}`} disabled title={t("standard.soonHint")}>
        HSK 3.0
        <span className={styles.soon}>{t("standard.soon")}</span>
      </button>
    </div>
  );
}