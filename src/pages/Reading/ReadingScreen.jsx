import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Play, Square, Volume2, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { STORIES, CHENGYU } from "../../data/stories";
import { vocabByHanzi } from "../../data/vocab";
import styles from "./Reading.module.css";

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
  { key: "tea", hanzi: "茶", tone: "primary" },
  { key: "table", hanzi: "筷", tone: "accent" },
  { key: "colors", hanzi: "红", tone: "accent" },
];

const SPEEDS = [0.8, 1.0];
const speechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

export default function ReadingScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || "ru";

  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState("s5");
  const [showPinyin, setShowPinyin] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [playing, setPlaying] = useState(false);
  const panelRef = useRef(null);
  const speechToken = useRef(0);

  const pick = (obj) => obj?.[lang] || obj?.ru || "";
  const storyTitle = (s) => (s.titleKey ? t(s.titleKey) : pick(s.title));

  const filtered = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter);
    return f?.test ? STORIES.filter(f.test) : STORIES;
  }, [filter]);

  const selected = STORIES.find((s) => s.id === selectedId) || STORIES[0];
  const chengyu = CHENGYU[Math.floor(Date.now() / 86400000) % CHENGYU.length];

  const vocab = useMemo(() => {
    if (selected.vocab) return selected.vocab.map((w) => ({ zh: w.zh, py: w.py, m: pick(w.m) }));
    return (selected.required || [])
      .map((h) => {
        const v = vocabByHanzi(h);
        return v ? { zh: h, py: v.pinyin, m: t(`meanings.${h}`, { defaultValue: "" }) } : null;
      })
      .filter(Boolean);
  }, [selected, lang, t]);

  function stopSpeech() {
    speechToken.current += 1;
    if (speechSupported()) window.speechSynthesis.cancel();
    setPlaying(false);
  }

  function speak(text, rate, trackPlaying) {
    if (!speechSupported()) return;
    window.speechSynthesis.cancel();
    const token = ++speechToken.current;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    u.rate = rate;
    const done = () => {
      if (speechToken.current === token) setPlaying(false);
    };
    u.onend = done;
    u.onerror = done;
    setPlaying(!!trackPlaying);
    window.speechSynthesis.speak(u);
  }

  function handlePlay() {
    if (playing) return stopSpeech();
    speak(selected.sentences.map((s) => s.zh).join(""), speed, true);
  }

  function openStory(id) {
    setSelectedId(id);
    if (typeof window !== "undefined" && window.innerWidth < 1100) {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  useEffect(() => {
    stopSpeech();
  }, [selectedId]);

  useEffect(() => () => stopSpeech(), []); 

  const filterLabel = (id) => {
    if (id === "all") return t("stories.all");
    if (id === "hsk4") return "HSK 4+";
    if (id.startsWith("hsk")) return `HSK ${id.slice(3)}`;
    return t(`reading.topic.${id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`${styles.chip} ${filter === f.id ? styles.chipActive : ""}`}
          >
            {filterLabel(f.id)}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className={styles.main}>
          <div className={styles.chengyuCard}>
            <span className={styles.chengyuWatermark}>成</span>
            <p className={styles.chengyuLabel}>{t("reading.chengyuOfDay")}</p>
            <div className={styles.chengyuRow}>
              <h2 className={styles.chengyuZh}>{chengyu.zh}</h2>
              <button
                className={styles.chengyuSpeak}
                onClick={() => speak(chengyu.zh, 1, false)}
                aria-label={t("reading.play", { speed: 1 })}
              >
                <Volume2 size={20} strokeWidth={1.8} />
              </button>
            </div>
            <p className={styles.chengyuPy}>{chengyu.py}</p>
            <p className={styles.chengyuLiteral}>“{pick(chengyu.literal)}”</p>
            <p className={styles.chengyuMeaning}>{pick(chengyu.meaning)}</p>
          </div>

          {filtered.length === 0 && <p className={styles.empty}>{t("reading.empty")}</p>}

          <div className={styles.grid}>
            {filtered.map((s) => (
              <article
                key={s.id}
                className={`${styles.card} ${selected.id === s.id ? styles.cardActive : ""}`}
              >
                <div className={`${styles.cardTop} ${styles[`tint_${s.topic}`] || ""}`}>
                  <span className={styles.cardHanzi}>{s.titleZh[0]}</span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.metaRow}>
                    <span className={styles.hskBadge}>{s.hsk >= 4 ? "HSK 4+" : `HSK ${s.hsk}`}</span>
                    <span className={styles.minutes}>{t("reading.min", { count: s.minutes })}</span>
                  </div>
                  <h3 className={styles.cardTitleZh}>{s.titleZh}</h3>
                  <p className={styles.cardTitle}>{storyTitle(s)}</p>
                  <p className={styles.cardExcerpt}>
                    {s.sentences[0].zh}… {s.summary ? pick(s.summary) : ""}
                  </p>
                  <button className={styles.readBtn} onClick={() => openStory(s.id)}>
                    {t("reading.readNow")} <ChevronRight size={16} strokeWidth={1.8} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА */}
        <aside className={styles.side}>
          <section className={styles.panel} ref={panelRef}>
            <div className={styles.panelHeader}>
              <p className={styles.panelLabel}>{t("reading.interactive")}</p>
              <div className={styles.controls}>
                <button
                  className={`${styles.ctrl} ${showPinyin ? styles.ctrlOn : ""}`}
                  onClick={() => setShowPinyin((v) => !v)}
                >
                  {showPinyin ? <Eye size={14} strokeWidth={1.8} /> : <EyeOff size={14} strokeWidth={1.8} />}
                  {t("reading.pinyin")}
                </button>
                {SPEEDS.map((sp) => (
                  <button
                    key={sp}
                    className={`${styles.ctrl} ${speed === sp ? styles.ctrlOn : ""}`}
                    onClick={() => setSpeed(sp)}
                  >
                    {sp.toFixed(1)}x
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.panelBody}>
              <p className={styles.storyHeading}>
                {selected.titleZh} · {storyTitle(selected)}
              </p>

              {selected.sentences.map((s, i) => (
                <div key={i} className={styles.sentence}>
                  {showPinyin && <p className={styles.sentencePy}>{s.py}</p>}
                  <p className={styles.sentenceZh}>{s.zh}</p>
                </div>
              ))}

              <button className={styles.playBtn} onClick={handlePlay} disabled={!speechSupported()}>
                {playing ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                {playing ? t("reading.stop") : t("reading.play", { speed: speed.toFixed(1) })}
              </button>

              {selected.cultureKey && (
                <div className={styles.cultureBox}>
                  <p className={styles.sectionLabel}>{t("stories.culture")}</p>
                  <p className={styles.cultureText}>{t(selected.cultureKey)}</p>
                </div>
              )}

              {vocab.length > 0 && (
                <>
                  <p className={styles.sectionLabel}>{t("reading.lessonVocab")}</p>
                  <ul className={styles.vocabList}>
                    {vocab.map((w) => (
                      <li key={w.zh} className={styles.vocabItem}>
                        <span className={styles.vocabZh}>{w.zh}</span>
                        <div>
                          <p className={styles.vocabPy}>{w.py}</p>
                          {w.m && <p className={styles.vocabMeaning}>{w.m}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelBody}>
              <p className={styles.sectionLabel}>{t("reading.notes")}</p>
              <ul className={styles.notesList}>
                {NOTES.map((n) => (
                  <li key={n.key} className={styles.noteItem}>
                    <span className={`${styles.noteIcon} ${n.tone === "primary" ? styles.noteIconPrimary : styles.noteIconAccent}`}>
                      {n.hanzi}
                    </span>
                    <div>
                      <p className={styles.noteTitle}>{t(`reading.notesItems.${n.key}.title`)}</p>
                      <p className={styles.noteText}>{t(`reading.notesItems.${n.key}.text`)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
