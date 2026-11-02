import React, { useMemo, useState } from "react";
import { Lock, Check, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { STORIES, CHENGYU } from "../../data/stories";
import { nodeById } from "../../data/path";
import PageBanner from "../../components/ui/PageBanner";
import { speakZh, ttsSupported } from "../../lib/tts";
import StoryReader from "./StoryReader";
import styles from "./Reading.module.css";

const UNLOCK_ALL = import.meta.env.VITE_UNLOCK_ALL === "true";

const FILTERS = [
  { id: "all" },
  { id: "hsk1", test: (s) => s.hsk === 1 },
  { id: "hsk2", test: (s) => s.hsk === 2 },
  { id: "hsk3", test: (s) => s.hsk === 3 },
  { id: "hsk4", test: (s) => s.hsk >= 4 },
  { id: "legends", test: (s) => s.topic === "legends" },
  { id: "etiquette", test: (s) => s.topic === "etiquette" },
  { id: "modern", test: (s) => s.topic === "modern" },
];

const NOTES = [
  { key: "tea", hanzi: "茶" },
  { key: "table", hanzi: "筷" },
  { key: "colors", hanzi: "红" },
];

export default function ReadingScreen() {
  const { t, i18n } = useTranslation();
  const { state, markStoryRead } = useAppState();
  const lang = i18n.resolvedLanguage || "ru";
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);

  const pick = (obj) => obj?.[lang] || obj?.ru || "";
  const storyTitle = (s) => (s.titleKey ? t(s.titleKey) : pick(s.title));
  const currentLevel = Math.max(1, nodeById(state.activeNodeId)?.level ?? state.hskLevel ?? 1);
  const readSet = useMemo(() => new Set(state.readStories || []), [state.readStories]);
  const chengyu = CHENGYU[Math.floor(Date.now() / 86400000) % CHENGYU.length];

  const filtered = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter);
    return f?.test ? STORIES.filter(f.test) : STORIES;
  }, [filter]);

  const filterLabel = (id) => {
    if (id === "all") return t("stories.all");
    if (id === "hsk4") return "HSK 4+";
    if (id.startsWith("hsk")) return `HSK ${id.slice(3)}`;
    return t(`reading.topic.${id}`);
  };

  const opened = STORIES.find((s) => s.id === openId);
  if (opened) {
    return (
      <StoryReader
        story={opened}
        isRead={readSet.has(opened.id)}
        onBack={() => setOpenId(null)}
        onRead={markStoryRead}
      />
    );
  }

  const openCount = STORIES.filter((s) => UNLOCK_ALL || s.hsk <= currentLevel).length;

  return (
    <div className={styles.container}>
      <PageBanner
        color="#A07820"
        hanzi="书"
        kicker={t("reading.bannerKicker", { level: currentLevel })}
        title={t("nav.stories")}
        subtitle={t("reading.bannerSubtitle", { open: openCount, total: STORIES.length })}
      />

      <div className={styles.chengyuCard}>
        <span className={styles.chengyuWatermark}>成</span>
        <div className={styles.chengyuMain}>
          <p className={styles.chengyuLabel}>{t("reading.chengyuOfDay")}</p>
          <div className={styles.chengyuRow}>
            <h2 className={styles.chengyuZh}>{chengyu.zh}</h2>
            {ttsSupported() && (
              <button type="button" className={styles.chengyuSpeak} onClick={() => speakZh(chengyu.zh, 0.8)}>
                <Volume2 size={20} strokeWidth={1.8} />
              </button>
            )}
            <p className={styles.chengyuPy}>{chengyu.py}</p>
          </div>
        </div>
        <div className={styles.chengyuMeaning}>
          <p className={styles.chengyuLiteral}>“{pick(chengyu.literal)}”</p>
          <p>{pick(chengyu.meaning)}</p>
        </div>
      </div>

      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`${styles.chip} ${filter === f.id ? styles.chipActive : ""}`}
          >
            {filterLabel(f.id)}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className={styles.empty}>{t("reading.empty")}</p>}

      <div className={styles.grid}>
        {filtered.map((s) => {
          const locked = !UNLOCK_ALL && s.hsk > currentLevel;
          const done = readSet.has(s.id);
          return (
            <article key={s.id} className={`${styles.card} ${locked ? styles.cardLocked : ""}`}>
              <div className={`${styles.cardTop} ${styles[`tint_${s.topic}`] || ""}`}>
                <span className={styles.cardHanzi}>{s.titleZh[0]}</span>
                {locked && <span className={styles.lockBadge}><Lock size={18} strokeWidth={2} /></span>}
                {done && <span className={styles.doneBadge}><Check size={16} strokeWidth={3} /></span>}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.metaRow}>
                  <span className={styles.hskBadge}>{s.hsk >= 4 ? "HSK 4+" : `HSK ${s.hsk}`}</span>
                  <span className={styles.minutes}>{t("reading.min", { count: s.minutes })}</span>
                </div>
                <h3 className={styles.cardTitleZh}>{s.titleZh}</h3>
                <p className={styles.cardTitle}>{storyTitle(s)}</p>
                <p className={styles.cardExcerpt}>{s.summary?.[lang] || s.summary?.ru || `${s.sentences[0].zh}…`}</p>
                <button type="button" className={styles.readBtn} disabled={locked} onClick={() => setOpenId(s.id)}>
                  {locked ? t("reading.locked", { level: s.hsk >= 4 ? "4+" : s.hsk }) : done ? t("reading.readAgain") : t("reading.readNow")}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <section className={styles.notes}>
        <p className={styles.notesTitle}>{t("reading.notes")}</p>
        <div className={styles.notesGrid}>
          {NOTES.map((n) => (
            <div key={n.key} className={styles.noteItem}>
              <span className={styles.noteIcon}>{n.hanzi}</span>
              <div>
                <p className={styles.noteTitle}>{t(`reading.notesItems.${n.key}.title`)}</p>
                <p className={styles.noteText}>{t(`reading.notesItems.${n.key}.text`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}