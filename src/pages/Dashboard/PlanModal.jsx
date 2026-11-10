import React, { useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import styles from "./Dashboard.module.css";

const FIELDS = [
  { id: "newWords", min: 0, max: 30, step: 1 },
  { id: "reviews", min: 0, max: 60, step: 5 },
  { id: "minutes", min: 5, max: 90, step: 5 },
  { id: "tones", min: 0, max: 10, step: 1 },
  { id: "writes", min: 0, max: 10, step: 1 },
];

export default function PlanModal({ plan, t, onSave, onClose }) {
  const [draft, setDraft] = useState(plan);
  const change = (f, dir) =>
    setDraft((d) => ({ ...d, [f.id]: Math.min(f.max, Math.max(f.min, (d[f.id] ?? 0) + dir * f.step)) }));

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{t("home.plan.title")}</h3>
          <button type="button" className={styles.modalClose} onClick={onClose} aria-label={t("flow.close")}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <p className={styles.modalHint}>{t("home.plan.hint")}</p>
        <div className={styles.modalFields}>
          {FIELDS.map((f) => (
            <div key={f.id} className={styles.modalRow}>
              <span className={styles.modalLabel}>{t(`home.plan.${f.id}`)}</span>
              <div className={styles.stepper}>
                <button type="button" onClick={() => change(f, -1)} aria-label="-"><Minus size={16} strokeWidth={2.5} /></button>
                <span>{draft[f.id] ?? 0}</span>
                <button type="button" onClick={() => change(f, 1)} aria-label="+"><Plus size={16} strokeWidth={2.5} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancel} onClick={onClose}>{t("home.plan.cancel")}</button>
          <button type="button" className={styles.modalSave} onClick={() => onSave(draft)}>{t("home.plan.save")}</button>
        </div>
      </div>
    </div>
  );
}