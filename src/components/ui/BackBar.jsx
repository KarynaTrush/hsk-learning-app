import React from "react";
import { ArrowLeft } from "lucide-react";
import styles from "./BackBar.module.css";

export default function BackBar({ label, onClick }) {
  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.btn} onClick={onClick}>
        <ArrowLeft size={16} strokeWidth={2.2} />
        {label}
      </button>
    </div>
  );
}