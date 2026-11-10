import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { GRAMMAR } from "../../data/grammar";
import PageBanner from "../../components/ui/PageBanner";
import GrammarTopic from "./Grammartopic";
import styles from "./Grammar.module.css";

export default function GrammarScreen({ initialTopicId }) {
  const { t, i18n } = useTranslation();
  const { state } = useAppState();
  const lang = i18n.resolvedLanguage || "ru";
  const [level, setLevel] = useState(GRAMMAR.find((g) => g.id === initialTopicId)?.level || GRAMMAR[0]?.level || 1);
  const [openId, setOpenId] = useState(initialTopicId || null);
  const pick = (o) => o?.[lang] || o?.ru || "";

  const opened = GRAMMAR.find((g) => g.id === openId);
  if (opened) return <GrammarTopic topic={opened} onBack={() => setOpenId(null)} />;

  const items = GRAMMAR.filter((g) => g.level === level);

  return (
    <div className={styles.container}>
      <PageBanner color="#4F7942" hanzi="法" kicker={t("grammar.kicker")} title={t("grammar.title")} subtitle={t("grammar.subtitle2")} />

      <div className={styles.tabs}>
        {[1, 2, 3, 4, 5, 6].map((lv) => {
          const count = GRAMMAR.filter((g) => g.level === lv).length;
          return (
            <button key={lv} type="button" className={`${styles.tab} ${level === lv ? styles.tabActive : ""}`} onClick={() => setLevel(lv)}>
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
          {items.map((g, i) => {
            const s = state.grammarStats?.[g.id];
            const pct = s && s.answers ? Math.round((s.correct / s.answers) * 100) : null;
            return (
              <button key={g.id} type="button" className={styles.topicCard} onClick={() => setOpenId(g.id)}>
                <span className={styles.number}>{i + 1}</span>
                <span className={styles.topicText}>
                  <span className={styles.cardTitle}>{pick(g.title)}</span>
                  <span className={styles.topicPattern}>{g.pattern}</span>
                  <span className={styles.topicBody}>{pick(g.body)}</span>
                </span>
                <span className={styles.topicSide}>
                  {pct !== null && <span className={styles.topicPct} style={{ color: pct >= 70 ? "var(--accent)" : "var(--primary)" }}>{pct}%</span>}
                  <ArrowRight size={18} strokeWidth={2.2} />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}