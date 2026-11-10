import React, { useEffect, useRef, useState } from "react";
import { Camera, LogOut, Trash2, Monitor } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import * as authApi from "../../api/auth";
import { uploadAvatar } from "../../api/avatar";
import { DATE_LOCALES } from "../../i18n";
import styles from "./Account.module.css";

function describeDevice() {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} · ${os}` : browser;
}

function Notice({ notice, section }) {
  if (!notice || notice.section !== section) return null;
  return <p className={notice.type === "ok" ? styles.noticeOk : styles.noticeError}>{notice.text}</p>;
}

export default function AccountScreen() {
  const { t, i18n } = useTranslation();
  const { state, updateProfile, changePassword, deleteAccount, logout } = useAppState();
  const lang = i18n.resolvedLanguage || "ru";
  const user = state.user || {};
  const isGuest = !user.id;

  const [name, setName] = useState(user.name || "");
  const [surname, setSurname] = useState(user.surname || "");
  const [newEmail, setNewEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [lastSignIn, setLastSignIn] = useState(null);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (isGuest) return;
    authApi.currentAuthUser().then((u) => setLastSignIn(u?.last_sign_in_at || null)).catch(() => {});
  }, [isGuest]);

  const say = (section, type, text) => setNotice({ section, type, text });
  const errorText = (err) => t(`auth.errors.${err?.code || "server_error"}`, { defaultValue: t("auth.errors.server_error") });

  async function run(section, fn, okText) {
    setBusy(section);
    setNotice(null);
    try {
      await fn();
      say(section, "ok", okText);
    } catch (err) {
      say(section, "error", errorText(err));
    } finally {
      setBusy("");
    }
  }

  async function onPickFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy("avatar");
    setNotice(null);
    try {
      const url = await uploadAvatar(user.id, file);
      await updateProfile({ avatarUrl: url });
      say("avatar", "ok", t("account.saved"));
    } catch (err) {
      const key = err?.message === "avatar_type" || err?.message === "avatar_size" ? `account.${err.message}` : "account.avatarFailed";
      say("avatar", "error", t(key));
    } finally {
      setBusy("");
    }
  }

  function onDelete() {
    if (window.confirm(t("account.deleteConfirm"))) {
      run("danger", deleteAccount, t("account.saved"));
    }
  }

  const dateLocale = DATE_LOCALES[lang] || "ru-RU";
  const initial = user.name ? user.name[0].toUpperCase() : "安";

  return (
    <div className={styles.container}>
      <div className={styles.heroCard}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar}>
            {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <span>{initial}</span>}
          </div>
          {!isGuest && (
            <>
              <button type="button" className={styles.avatarEdit} onClick={() => fileRef.current?.click()} disabled={busy === "avatar"} aria-label={t("account.upload")}>
                <Camera size={16} strokeWidth={2} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickFile} />
            </>
          )}
        </div>
        <div className={styles.heroText}>
          <h2 className={styles.heroName}>{[user.name, user.surname].filter(Boolean).join(" ") || t("account.guest")}</h2>
          <p className={styles.heroMail}>{user.email || t("account.noEmail")}</p>
          {!isGuest && <p className={styles.hint}>{t("account.photoHint")}</p>}
          <Notice notice={notice} section="avatar" />
        </div>
      </div>

      {isGuest && <p className={styles.guestNotice}>{t("account.guestNotice")}</p>}

      <div className={styles.grid}>
        {!isGuest && (
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>{t("account.personal")}</h3>
            <label className={styles.label}>{t("account.name")}</label>
            <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
            <label className={styles.label}>{t("account.surname")}</label>
            <input className={styles.input} value={surname} onChange={(e) => setSurname(e.target.value)} />
            <button
              type="button"
              className={styles.primary}
              disabled={busy === "personal"}
              onClick={() => run("personal", () => updateProfile({ name: name.trim(), surname: surname.trim() }), t("account.saved"))}
            >
              {t("account.save")}
            </button>
            <Notice notice={notice} section="personal" />
          </section>
        )}

        {!isGuest && (
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>{t("account.email")}</h3>
            <p className={styles.hint}>{user.email}</p>
            <label className={styles.label}>{t("account.newEmail")}</label>
            <input className={styles.input} type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <button
              type="button"
              className={styles.primary}
              disabled={busy === "email" || !newEmail.includes("@")}
              onClick={() => run("email", () => authApi.changeEmail(newEmail.trim().toLowerCase()), t("account.emailSent"))}
            >
              {t("account.changeEmail")}
            </button>
            <Notice notice={notice} section="email" />
          </section>
        )}

        {!isGuest && (
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>{t("account.password")}</h3>
            <label className={styles.label}>{t("account.oldPassword")}</label>
            <input className={styles.input} type="password" autoComplete="current-password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            <label className={styles.label}>{t("account.newPassword")}</label>
            <input className={styles.input} type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <button
              type="button"
              className={styles.primary}
              disabled={busy === "password" || newPassword.length < 8 || !oldPassword}
              onClick={() =>
                run(
                  "password",
                  async () => {
                    await changePassword(oldPassword, newPassword);
                    setOldPassword("");
                    setNewPassword("");
                  },
                  t("account.passwordChanged")
                )
              }
            >
              {t("account.changePassword")}
            </button>
            <Notice notice={notice} section="password" />
          </section>
        )}

        {!isGuest && (
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>{t("account.sessions")}</h3>
            <div className={styles.device}>
              <Monitor size={20} strokeWidth={1.7} />
              <div>
                <p className={styles.deviceName}>{describeDevice()}</p>
                <p className={styles.hint}>
                  {t("account.thisDevice")}
                  {lastSignIn ? ` · ${t("account.lastSignIn", { date: new Date(lastSignIn).toLocaleString(dateLocale) })}` : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              className={styles.secondary}
              disabled={busy === "sessions"}
              onClick={() => run("sessions", authApi.signOutOthers, t("account.signedOutOthers"))}
            >
              {t("account.signOutOthers")}
            </button>
            <Notice notice={notice} section="sessions" />
          </section>
        )}

        <section className={`${styles.card} ${styles.danger}`}>
          <h3 className={styles.cardTitle}>{t("account.danger")}</h3>
          <button type="button" className={styles.secondary} onClick={logout}>
            <LogOut size={16} /> {t("account.logout")}
          </button>
          {!isGuest && (
            <button type="button" className={styles.destructive} disabled={busy === "danger"} onClick={onDelete}>
              <Trash2 size={16} /> {t("account.delete")}
            </button>
          )}
          <Notice notice={notice} section="danger" />
        </section>
      </div>
    </div>
  );
}