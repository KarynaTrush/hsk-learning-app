import React from "react";
import { ChevronRight } from "lucide-react";
import styles from "./WordCard.module.css"; 

export default function WordCard({ hanzi, pinyin, translation, onClick }) {
  return (
    <div 
      className={styles.card} 
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className={styles.hanziBox}>
        <span className={styles.hanziText}>{hanzi}</span>
      </div>
      <div className={styles.infoInfo}>
        <p className={styles.pinyinText}>{pinyin}</p>
        <p className={styles.translationText}>{translation}</p>
      </div>
      {onClick && (
        <ChevronRight size={14} className={styles.arrowIcon} strokeWidth={2} />
      )}
    </div>
  );
}