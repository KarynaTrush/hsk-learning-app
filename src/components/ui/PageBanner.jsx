import React from "react";
import styles from "./PageBanner.module.css";

export default function PageBanner({ color = "#C83E34", hanzi, leading, kicker, title, subtitle, children }) {
  return (
    <div className={styles.banner} style={{ "--level": color }}>
      <svg className={styles.art} viewBox="0 0 600 160" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
        <polygon points="0,160 120,60 210,130 320,40 450,140 520,90 600,150 600,160" className={styles.mountainBack} />
        <polygon points="0,160 90,100 180,150 290,85 400,160" className={styles.mountainFront} />
        <rect x="430" y="28" width="90" height="22" rx="11" className={styles.cloud} />
        <rect x="470" y="14" width="70" height="22" rx="11" className={styles.cloud} />
        <rect x="90" y="40" width="70" height="18" rx="9" className={styles.cloud} />
      </svg>
      {(leading || hanzi) && <div className={styles.leading}>{leading || <span>{hanzi}</span>}</div>}
      <div className={styles.text}>
        {kicker && <p className={styles.kicker}>{kicker}</p>}
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {children && <div className={styles.side}>{children}</div>}
    </div>
  );
}