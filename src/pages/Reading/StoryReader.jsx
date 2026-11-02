import React, { useMemo, useRef, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Play, Square, Volume2, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageBanner from "../../components/ui/PageBanner";
import { DICT } from "../../data/dictionary";
import { vocabByHanzi } from "../../data/vocab";
import { segment, entryMeaning } from "../../lib/segment";
import { speakZh, stopSpeech, ttsSupported } from "../../lib/tts";
import styles from "./StoryReader.module.css";

const SPEEDS = [0.8, 1.0];

export default function StoryReader({ story, isRead, onBack, onRead }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || "ru";
  const [showPinyin, setShowPinyin] = useState(false);
  const [speed, setSpeed] = useState(0.8);
  const [active, setActive] = useState(null);
  const [playing, setPlaying] = useState(false);
  const playToken = useRef(0);

  const pick = (o) => o?.[lang] || o?.ru || "";

  const lookup = useMemo(() => {
    const local = new Map(
      story.vocab.map((v) => [v.zh, { pinyin: v.py, meaning: v.m }])
    );
    return (word) => local.get(word) || vocabByHanzi(word) || DICT.get(word);
  }, [story]);

  const sentences = useMemo(
    () => story.sentences.map((s) => ({ ...s, tokens: segment(s.zh, lookup) })),
    [story, lookup]
  );

  function playAll() {
    if (playing) {
      playToken.current += 1;
      stopSpeech();
      setPlaying(false);
      return;
    }
    const token = ++playToken.current;
    setPlaying(true);
    const synth = window.speechSynthesis;
    synth.cancel();
    story.sentences.forEach((s, i) => {
      const u = new SpeechSynthesisUtterance(s.zh);
      u.lang = "zh-CN";
      u.rate = speed;
      const done = () => {
        if (playToken.current === token && i === story.sentences.length - 1) setPlaying(false);
      };
      u.onend = done;
      u.onerror = done;
      synth.speak(u);
    });
  }

  function leave() {
    playToken.current += 1;
    stopSpeech();
    onBack();
  }

  return (
    <div className={styles.container}>
      <PageBanner
        color="#A07820"
        hanzi={story.titleZh[0]}
        kicker={`HSK ${story.hsk >= 4 ? "4+" : story.hsk} · ${t("reading.min", { count: story.minutes })}`}
        title={story.titleZh}
        subtitle={pick(story.title) || (story.titleKey ? t(story.titleKey) : "")}
      >
        <button type="button" className={styles.backBtn} onClick={leave}>
          <ArrowLeft size={16} strokeWidth={2} />
          {t("reading.backToList")}
        </button>
      </PageBanner>

      <div className={styles.tooltipBar}>
        {active ? (
          <>
            <span className={styles.tipHanzi}>{active.text}</span>
            <div>
              <p className={styles.tipPinyin}>{active.entry?.pinyin || "—"}</p>
              <p className={styles.tipMeaning}>{entryMeaning(active.entry, lang) || t("reading.noTranslation")}</p>
            </div>
          </>
        ) : (
          <p className={styles.tipHint}>{t("reading.hoverHint")}</p>
        )}
      </div>

      <div className={styles.controls}>
        <button type="button" className={`${styles.ctrl} ${showPinyin ? styles.ctrlOn : ""}`} onClick={() => setShowPinyin((v) => !v)}>
          {showPinyin ? <Eye size={15} /> : <EyeOff size={15} />} {t("reading.pinyin")}
        </button>
        {SPEEDS.map((sp) => (
          <button key={sp} type="button" className={`${styles.ctrl} ${speed === sp ? styles.ctrlOn : ""}`} onClick={() => setSpeed(sp)}>
            {sp.toFixed(1)}x
          </button>
        ))}
        {ttsSupported() && (
          <button type="button" className={styles.playBtn} onClick={playAll}>
            {playing ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            {playing ? t("flow.close") : t("reading.playAll")}
          </button>
        )}
      </div>

      <article className={styles.text}>
        {sentences.map((s, i) => (
          <div key={i} className={styles.sentence}>
            {ttsSupported() && (
              <button type="button" className={styles.sentenceAudio} onClick={() => speakZh(s.zh, speed)} aria-label="audio">
                <Volume2 size={16} strokeWidth={1.8} />
              </button>
            )}
            <p className={styles.line}>
              {s.tokens.map((tok, j) =>
                tok.punct ? (
                  <span key={j} className={styles.punct}>{tok.text}</span>
                ) : (
                  <span
                    key={j}
                    className={`${styles.token} ${tok.entry ? styles.tokenKnown : ""} ${active === tok ? styles.tokenActive : ""}`}
                    onMouseEnter={() => setActive(tok)}
                    onFocus={() => setActive(tok)}
                    onClick={() => setActive(tok)}
                    tabIndex={0}
                  >
                    <ruby>
                      {tok.text}
                      <rt className={showPinyin ? styles.rtOn : styles.rtOff}>{tok.entry?.pinyin || ""}</rt>
                    </ruby>
                  </span>
                )
              )}
            </p>
          </div>
        ))}
      </article>

      {story.vocab.length > 0 && (
        <section className={styles.panel}>
          <p className={styles.kicker}>{t("reading.lessonVocab")}</p>
          <div className={styles.vocabGrid}>
            {story.vocab.map((v) => (
              <div key={v.zh} className={styles.vocabItem}>
                <span className={styles.vocabZh}>{v.zh}</span>
                <div>
                  <p className={styles.vocabPy}>{v.py}</p>
                  <p className={styles.vocabMeaning}>{pick(v.m)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {story.cultureKey && (
        <section className={styles.panel}>
          <p className={styles.kicker}>{t("stories.culture")}</p>
          <p className={styles.culture}>{t(story.cultureKey)}</p>
        </section>
      )}

      <button
        type="button"
        className={`${styles.readBtn} ${isRead ? styles.readBtnDone : ""}`}
        disabled={isRead}
        onClick={() => onRead(story.id)}
      >
        {isRead ? <><Check size={18} strokeWidth={2.5} /> {t("reading.readDone")}</> : t("reading.markRead")}
      </button>
    </div>
  );
}