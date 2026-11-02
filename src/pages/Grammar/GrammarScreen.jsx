import React, { useState } from "react";
import { ArrowLeft, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GRAMMAR } from "../../data/grammar";
import PageBanner from "../../components/ui/PageBanner";
import { speakZh, ttsSupported } from "../../lib/tts";
import styles from "./Grammar.module.css";

export default function GrammarScreen({ onBack }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || "ru";
  const firstWithTopics = GRAMMAR[0]?.level || 1;
  const [level, setLevel] = useState(firstWithTopics);
  const pick = (o) => o?.[lang] || o?.ru || "";
  const items = GRAMMAR.filter((g) => g.level === level);

  return (
    <div className={styles.container}>
      <PageBanner color="#4F7942" hanzi="法" kicker={t("grammar.kicker")} title={t("grammar.title")} subtitle={t("grammar.subtitle")}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={16} strokeWidth={2} />
          {t("grammar.back")}
        </button>
      </PageBanner>

      <div className={styles.tabs}>
        {[1, 2, 3, 4, 5, 6].map((lv) => {
          const count = GRAMMAR.filter((g) => g.level === lv).length;
          return (
            <button
              key={lv}
              type="button"
              className={`${styles.tab} ${level === lv ? styles.tabActive : ""}`}
              onClick={() => setLevel(lv)}
            >
              <span>HSK {lv}</span>
              <small>{count || "—"}</small>
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>{t("grammar.empty")}</p>
      ) : (
        <div className={styles.list}>
          {items.map((g, i) => (
            <article key={g.id} className={styles.card}>
              <header className={styles.cardHeader}>
                <span className={styles.number}>{i + 1}</span>
                <h3 className={styles.cardTitle}>{pick(g.title)}</h3>
              </header>
              {g.pattern && (
                <div className={styles.patternRow}>
                  <span className={styles.patternLabel}>{t("grammar.pattern")}</span>
                  <span className={styles.pattern}>{g.pattern}</span>
                </div>
              )}
              <p className={styles.body}>{pick(g.body)}</p>
              <div className={styles.examples}>
                {g.examples.map((e, j) => (
                  <div key={j} className={styles.example}>
                    <div>
                      <p className={styles.exampleZh}>{e.zh}</p>
                      <p className={styles.examplePy}>{e.py}</p>
                    </div>
                    <p className={styles.exampleTr}>{e[lang] || e.ru}</p>
                    {ttsSupported() && (
                      <button type="button" className={styles.audio} onClick={() => speakZh(e.zh)} aria-label="audio">
                        <Volume2 size={16} strokeWidth={1.8} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}