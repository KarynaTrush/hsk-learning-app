import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { setNewPassword } from "../../api/auth";
import TopBar from "../../components/layout/TopBar";
import styles from "./ResetPassword.module.css";

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { finishRecovery } = useAppState();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (status === "saving") return;
    if (password.length < 8) return setError("password_short");
    if (password !== confirm) return setError("password_mismatch");
    setError("");
    setStatus("saving");
    try {
      await setNewPassword(password);
      setStatus("done");
    } catch (err) {
      setError(err?.code || "server_error");
      setStatus("idle");
    }
  }

  return (
    <div className={styles.page}>
      <TopBar />
      <div className={styles.center}>
        <div className={styles.card}>
          <h2 className={styles.title}>{t("resetPw.newTitle")}</h2>
          {status === "done" ? (
            <>
              <p className={styles.text}>{t("resetPw.done")}</p>
              <button type="button" className={styles.primary} onClick={finishRecovery}>{t("resetPw.continue")}</button>
            </>
          ) : (
            <form onSubmit={submit} className={styles.form}>
              <p className={styles.text}>{t("resetPw.newText")}</p>
              <input
                className={styles.input}
                type="password"
                autoComplete="new-password"
                placeholder={t("resetPw.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <input
                className={styles.input}
                type="password"
                autoComplete="new-password"
                placeholder={t("resetPw.confirm")}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {error && <p className={styles.error}>{t(`resetPw.errors.${error}`, { defaultValue: t("resetPw.errors.server_error") })}</p>}
              <button type="submit" className={styles.primary} disabled={status === "saving"}>
                {status === "saving" ? t("resetPw.saving") : t("resetPw.save")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}