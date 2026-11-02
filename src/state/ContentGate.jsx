import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { loadContent } from "../api/content";

// Показывает приложение только после того, как слова, уроки и тексты загружены
export default function ContentGate({ children }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      await loadContent();
      setStatus("ready");
    } catch (e) {
      console.warn("Контент не загружен:", e);
      setMessage(e?.message || String(e));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "ready") return children;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: "var(--background)", color: "var(--muted-foreground)", padding: 24, textAlign: "center" }}
    >
      {status === "loading" ? (
        <p>{t("content.loading")}</p>
      ) : (
        <>
          <p style={{ color: "var(--primary)", fontWeight: 600 }}>{t("content.error")}</p>
          {import.meta.env.DEV && message && <small style={{ maxWidth: 480, wordBreak: "break-word" }}>[dev] {message}</small>}
          <button
            onClick={load}
            style={{ padding: "0.6rem 1.4rem", borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", cursor: "pointer" }}
          >
            {t("content.retry")}
          </button>
        </>
      )}
    </div>
  );
}
