import React, { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { requestPasswordReset } from "../../api/auth";
import styles from "./ResetPassword.module.css";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function ForgotPasswordModal({ initialEmail = "", onClose }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (status === "sending") return;
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setError("invalid_email");
      return;
    }
    setError("");
    setStatus("sending");
    try {
      await requestPasswordReset(clean);
      setStatus("sent");
    } catch (err) {
      setError(err?.code || "server_error");
      setStatus("idle");
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h3 className={styles.title}>{t("resetPw.forgotTitle")}</h3>
          <button type="button" className={styles.close} onClick={onClose} aria-label={t("flow.close")}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        {status === "sent" ? (
          <>
            <p className={styles.text}>{t("resetPw.sent", { email: email.trim() })}</p>
            <p className={styles.hint}>{t("resetPw.sentHint")}</p>
            <button type="button" className={styles.primary} onClick={onClose}>{t("resetPw.back")}</button>
          </>
        ) : (
          <form onSubmit={submit} className={styles.form}>
            <p className={styles.text}>{t("resetPw.forgotText")}</p>
            <input
              className={styles.input}
              type="email"
              autoComplete="email"
              placeholder={t("resetPw.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            {error && <p className={styles.error}>{t(`resetPw.errors.${error}`, { defaultValue: t("resetPw.errors.server_error") })}</p>}
            <button type="submit" className={styles.primary} disabled={status === "sending"}>
              {status === "sending" ? t("resetPw.sending") : t("resetPw.send")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}