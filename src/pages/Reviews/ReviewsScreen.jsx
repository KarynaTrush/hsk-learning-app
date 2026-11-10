import React, { useState } from "react";
import { Volume2, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { dueCards } from "../../lib/srs";
import { vocabByHanzi, wordMeaning } from "../../data/vocab";
import PageBanner from "../../components/ui/PageBanner";
import { speakZh, ttsSupported } from "../../lib/tts";
import styles from "./Reviews.module.css";

const SESSION_SIZE = 20;

function resolveHanzi(card, wordsMap) {
  if (typeof card === "string") return card;
  if (card?.hanzi) return card.hanzi;
  for (const [key, value] of Object.entries(wordsMap || {})) {
    if (value === card) return key;
  }
  const json = JSON.stringify(card);
  for (const [key, value] of Object.entries(wordsMap || {})) {
    if (JSON.stringify(value) === json) return key;
  }
  return null;
}

function buildDueQueue(wordsMap) {
  const seen = new Set();
  const out = [];
  for (const card of dueCards(wordsMap)) {
    const hanzi = resolveHanzi(card, wordsMap);
    const word = hanzi && vocabByHanzi(hanzi);
    if (word && !seen.has(hanzi)) {
      seen.add(hanzi);
      out.push(word);
    }
    if (out.length >= SESSION_SIZE) break;
  }
  return out;
}

function buildWeakQueue(mistakes) {
  return [...(mistakes || [])]
    .sort((a, b) => b.count - a.count)
    .map((m) => vocabByHanzi(m.hanzi))
    .filter(Boolean)
    .slice(0, 10);
}

function MiZiGeGrid({ hanzi, size = 230 }) {
  const half = size / 2;
  const pad = 12;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", color: "var(--foreground)", maxWidth: "100%" }}>
      <rect x={pad} y={pad} width={size - pad * 2} height={size - pad * 2} rx={6} fill="none" stroke="#C83E34" strokeWidth={1.6} strokeDasharray="5 3" opacity={0.7} />
      <line x1={pad} y1={half} x2={size - pad} y2={half} stroke="#C83E34" strokeWidth={0.8} strokeDasharray="4 4" opacity={0.35} />
      <line x1={half} y1={pad} x2={half} y2={size - pad} stroke="#C83E34" strokeWidth={0.8} strokeDasharray="4 4" opacity={0.35} />
      <line x1={pad} y1={pad} x2={size - pad} y2={size - pad} stroke="#C83E34" strokeWidth={0.6} strokeDasharray="3 5" opacity={0.2} />
      <line x1={size - pad} y1={pad} x2={pad} y2={size - pad} stroke="#C83E34" strokeWidth={0.6} strokeDasharray="3 5" opacity={0.2} />
      <text
        x={half}
        y={half + 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={hanzi.length === 1 ? size * 0.52 : hanzi.length === 2 ? size * 0.34 : size * 0.24}
        fontFamily="'Noto Serif SC', serif"
        fontWeight={700}
        fill="currentColor"
      >
        {hanzi}
      </text>
    </svg>
  );
}

export default function ReviewsScreen() {
  const { t, i18n } = useTranslation();
  const { state, reviewResult } = useAppState();
  const lang = i18n.resolvedLanguage || "ru";

  const [mode, setMode] = useState("due");
  const [queue, setQueue] = useState(() => buildDueQueue(state.words));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState({ know: 0, dont: 0 });

  const finished = queue.length > 0 && index >= queue.length;
  const word = queue[index];

  function answer(know) {
    reviewResult(word.hanzi, know);
    setResults((r) => ({ know: r.know + (know ? 1 : 0), dont: r.dont + (know ? 0 : 1) }));
    setIndex((i) => i + 1);
    setRevealed(false);
  }

  function restart(nextMode) {
    const next = nextMode === "weak" ? buildWeakQueue(state.mistakes) : buildDueQueue(state.words);
    setMode(nextMode);
    setQueue(next);
    setIndex(0);
    setRevealed(false);
    setResults({ know: 0, dont: 0 });
  }

  const banner = (
    <PageBanner color="#D4A843" hanzi="复" kicker={t("reviewsPage.kicker")} title={t("screens.reviewsTitle")} subtitle={t("reviewsPage.subtitle")}>
      {queue.length > 0 && !finished && (
        <span className={styles.bannerChip}>{t("reviewsPage.cardOf", { current: index + 1, total: queue.length })}</span>
      )}
    </PageBanner>
  );

  if (queue.length === 0) {
    const weak = buildWeakQueue(state.mistakes);
    return (
      <div className={styles.container}>
        {banner}
        <div className={styles.emptyCard}>
          <span className={styles.emptyIcon}>完</span>
          <h3 className={styles.emptyTitle}>{t("reviewsPage.emptyTitle")}</h3>
          <p className={styles.emptyText}>{weak.length ? t("reviewsPage.emptyText") : t("reviewsPage.noWeak")}</p>
          {weak.length > 0 && (
            <button type="button" className={styles.primary} onClick={() => restart("weak")}>
              {t("reviewsPage.weakBtn", { count: weak.length })}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className={styles.container}>
        {banner}
        <div className={styles.emptyCard}>
          <span className={styles.emptyIcon}>完</span>
          <h3 className={styles.emptyTitle}>{t("reviewsPage.doneTitle")}</h3>
          <p className={styles.emptyText}>{t("reviewsPage.doneText", { count: queue.length })}</p>
          <div className={styles.resultRow}>
            <div>
              <p className={styles.resultValue} style={{ color: "var(--accent)" }}>{results.know}</p>
              <p className={styles.resultLabel}>{t("reviewsPage.known")}</p>
            </div>
            <div className={styles.resultDivider} />
            <div>
              <p className={styles.resultValue} style={{ color: "var(--primary)" }}>{results.dont}</p>
              <p className={styles.resultLabel}>{t("reviewsPage.toLearn")}</p>
            </div>
          </div>
          <button type="button" className={styles.primary} onClick={() => restart("due")}>{t("reviewsPage.again")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {banner}
      <div className={styles.grid}>
        <div className={styles.col}>
          <div className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.hskBadge}>HSK {word.hsk}</span>
              {mode === "weak" && <span className={styles.weakBadge}>{t("reviewsPage.weakMode")}</span>}
              {ttsSupported() && (
                <button type="button" className={styles.audio} onClick={() => speakZh(word.hanzi, 0.8)} aria-label="audio">
                  <Volume2 size={16} strokeWidth={1.8} />
                </button>
              )}
            </div>
            <div className={styles.gridWrap}>
              <MiZiGeGrid hanzi={word.hanzi} />
            </div>
            {revealed ? (
              <div className={styles.revealed}>
                <p className={styles.pinyin}>{word.pinyin}</p>
                <p className={styles.meaning}>{wordMeaning(word, lang)}</p>
                {word.example && <p className={styles.example}>{word.example}</p>}
              </div>
            ) : (
              <p className={styles.dots}>· · ·</p>
            )}
          </div>

          {!revealed ? (
            <button type="button" className={styles.primary} onClick={() => setRevealed(true)}>{t("reviewsPage.show")}</button>
          ) : (
            <div className={styles.answers}>
              <button type="button" className={styles.dontKnow} onClick={() => answer(false)}>
                <X size={22} strokeWidth={2.4} />
                {t("reviewsPage.dontKnow")}
              </button>
              <button type="button" className={styles.know} onClick={() => answer(true)}>
                <Check size={22} strokeWidth={2.4} />
                {t("reviewsPage.know")}
              </button>
            </div>
          )}
        </div>

        <div className={styles.col}>
          <section className={styles.side}>
            <p className={styles.kicker}>{t("reviewsPage.queueTitle")}</p>
            <div className={styles.queue}>
              {queue.map((w, i) => (
                <div key={w.hanzi} className={`${styles.queueItem} ${i === index ? styles.queueActive : ""} ${i < index ? styles.queueDone : ""}`}>
                  <span className={styles.queueNum}>{i < index ? "✓" : i + 1}</span>
                  <span className={styles.queueHanzi}>{w.hanzi}</span>
                  <span className={styles.queuePinyin}>{i <= index ? w.pinyin : ""}</span>
                </div>
              ))}
            </div>
          </section>
          <section className={styles.side}>
            <p className={styles.kicker}>{t("reviewsPage.sessionTitle")}</p>
            <div className={styles.resultRow}>
              <div>
                <p className={styles.resultValue} style={{ color: "var(--accent)" }}>{results.know}</p>
                <p className={styles.resultLabel}>{t("reviewsPage.known")}</p>
              </div>
              <div className={styles.resultDivider} />
              <div>
                <p className={styles.resultValue} style={{ color: "var(--primary)" }}>{results.dont}</p>
                <p className={styles.resultLabel}>{t("reviewsPage.toLearn")}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}