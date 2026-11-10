import React, { useMemo, useState } from "react";
import { RotateCcw, Check, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "../../state/AppState";
import { nodeById, nodeTitle } from "../../data/path";
import { vocabByHanzi, wordMeaning } from "../../data/vocab";
import { GRAMMAR } from "../../data/grammar";
import PageBanner from "../../components/ui/PageBanner";
import styles from "./Mistakes.module.css";

const TONE_COLORS = { 1: "#6B8CAE", 2: "#4F7942", 3: "#D4A843", 4: "#C83E34" };

function whenText(ts, lang, t) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const minutes = Math.round(diff / 60000);
  if (minutes < 2) return t("mistakes.justNow");
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  return rtf.format(-Math.round(hours / 24), "day");
}

export default function MistakesScreen({ onPractice, onOpenTarget }) {
  const { t, i18n } = useTranslation();
  const { state, dismissMistake } = useAppState();
  const lang = i18n.resolvedLanguage || "ru";
  const pick = (o) => o?.[lang] || o?.ru || "";

  const [tab, setTab] = useState("words");
  const [lessonFilter, setLessonFilter] = useState("all");

  const wordRows = useMemo(
    () =>
      [...(state.mistakes || [])]
        .sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0))
        .map((m) => {
          const word = vocabByHanzi(m.hanzi);
          if (!word) return null;
          const node = nodeById(word.nodeId);
          return { ...m, word, lesson: node ? nodeTitle(node, lang) : "", lessonId: word.nodeId };
        })
        .filter(Boolean),
    [state.mistakes, lang]
  );

  const lessons = useMemo(() => {
    const map = new Map();
    for (const r of wordRows) if (r.lesson) map.set(r.lessonId, r.lesson);
    return [...map.entries()];
  }, [wordRows]);

  const shownWords = wordRows.filter((r) => lessonFilter === "all" || String(r.lessonId) === lessonFilter);

  const writingRows = Object.entries(state.writingStats || {})
    .map(([char, v]) => ({ char, ...v }))
    .filter((r) => r.mistakes > 0)
    .sort((a, b) => b.mistakes - a.mistakes);

  const toneRows = [1, 2, 3, 4]
    .map((n) => {
      const list = state.toneScores?.[n] || [];
      return { tone: n, attempts: list.length, avg: list.length ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : null };
    })
    .filter((r) => r.attempts > 0)
    .sort((a, b) => a.avg - b.avg);

  const grammarRows = Object.entries(state.grammarStats || {})
    .map(([id, v]) => {
      const topic = GRAMMAR.find((g) => g.id === Number(id));
      return topic && v.answers > 0 ? { topic, answers: v.answers, percent: Math.round((v.correct / v.answers) * 100) } : null;
    })
    .filter((r) => r && r.percent < 100)
    .sort((a, b) => a.percent - b.percent);

  const counts = { words: wordRows.length, writing: writingRows.length, tones: toneRows.filter((r) => r.avg < 75).length, grammar: grammarRows.length };
  const totalErrors = wordRows.reduce((s, r) => s + r.count, 0);
  const tabs = ["words", "writing", "tones", "grammar"];

  return (
    <div className={styles.container}>
      <PageBanner color="#C83E34" hanzi="错" kicker={t("mistakes.kicker")} title={t("screens.mistakesTitle")} subtitle={t("mistakes.subtitle")}>
        <span className={styles.bannerChip}>{t("mistakes.totalErrors", { count: totalErrors })}</span>
      </PageBanner>

      <div className={styles.tabs}>
        {tabs.map((id) => (
          <button key={id} type="button" className={`${styles.tab} ${tab === id ? styles.tabActive : ""}`} onClick={() => setTab(id)}>
            <span>{t(`mistakes.tabs.${id}`)}</span>
            <small>{counts[id]}</small>
          </button>
        ))}
      </div>

      {tab === "words" && (
        <div className={styles.layout}>
          <aside className={styles.side}>
            <p className={styles.kicker}>{t("mistakes.byLesson")}</p>
            <button type="button" className={`${styles.filter} ${lessonFilter === "all" ? styles.filterActive : ""}`} onClick={() => setLessonFilter("all")}>
              <span>{t("mistakes.all")}</span>
              <small>{wordRows.length}</small>
            </button>
            {lessons.map(([id, name]) => (
              <button key={id} type="button" className={`${styles.filter} ${lessonFilter === String(id) ? styles.filterActive : ""}`} onClick={() => setLessonFilter(String(id))}>
                <span>{name}</span>
                <small>{wordRows.filter((r) => r.lessonId === id).length}</small>
              </button>
            ))}
            {shownWords.length > 0 && (
              <button type="button" className={styles.practice} onClick={() => onPractice(shownWords.map((r) => r.hanzi))}>
                <RotateCcw size={16} strokeWidth={2.2} />
                {t("mistakes.practice", { count: shownWords.length })}
              </button>
            )}
          </aside>

          <div className={styles.list}>
            {shownWords.length === 0 && <p className={styles.empty}>{t("mistakes.empty")}</p>}
            {shownWords.map((r) => (
              <div key={r.hanzi} className={styles.row}>
                <div className={styles.hanziBox} style={{ fontSize: r.hanzi.length === 1 ? 30 : r.hanzi.length === 2 ? 22 : 16 }}>{r.hanzi}</div>
                <div className={styles.rowMain}>
                  <p className={styles.pinyin}>{r.word.pinyin}</p>
                  <p className={styles.meaning}>{wordMeaning(r.word, lang)}</p>
                  <p className={styles.time}>{t("mistakes.lastError", { when: whenText(r.lastAt, lang, t) })}</p>
                </div>
                {r.lesson && <span className={styles.lessonBadge}>{r.lesson}</span>}
                <span className={styles.count} style={{ color: r.count >= 5 ? "var(--primary)" : r.count >= 3 ? "#A07820" : "var(--accent)" }}>×{r.count}</span>
                <button type="button" className={styles.dismiss} onClick={() => dismissMistake(r.hanzi)} title={t("mistakes.dismiss")}>
                  <Check size={16} strokeWidth={2.6} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "writing" && (
        <div className={styles.list}>
          {writingRows.length === 0 && <p className={styles.empty}>{t("mistakes.emptyWriting")}</p>}
          {writingRows.map((r) => (
            <div key={r.char} className={styles.row}>
              <div className={styles.hanziBox} style={{ fontSize: 30, color: "#8A4F9E" }}>{r.char}</div>
              <div className={styles.rowMain}>
                <p className={styles.meaning}>{t("mistakes.writeMistakes", { count: r.mistakes })}</p>
                <p className={styles.time}>{t("mistakes.writeAttempts", { count: r.attempts })}</p>
              </div>
              <span className={styles.stars}>
                {[1, 2, 3].map((n) => <Star key={n} size={16} fill={n <= r.bestStars ? "#D4A843" : "none"} color={n <= r.bestStars ? "#D4A843" : "var(--border)"} />)}
              </span>
              <button type="button" className={styles.action} onClick={() => onOpenTarget({ type: "writing", target: { char: r.char } })}>
                {t("mistakes.write")}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "tones" && (
        <div className={styles.list}>
          {toneRows.length === 0 && <p className={styles.empty}>{t("mistakes.emptyTones")}</p>}
          {toneRows.map((r) => (
            <div key={r.tone} className={styles.row}>
              <div className={styles.hanziBox} style={{ fontSize: 28, color: TONE_COLORS[r.tone] }}>{["ā", "á", "ǎ", "à"][r.tone - 1]}</div>
              <div className={styles.rowMain}>
                <p className={styles.meaning}>{t(`toneLab.tone.${r.tone}.name`)} · {t(`toneLab.tone.${r.tone}.desc`)}</p>
                <div className={styles.bar}><span style={{ width: `${r.avg}%`, background: TONE_COLORS[r.tone] }} /></div>
                <p className={styles.time}>{t("mistakes.toneAvg", { percent: r.avg })} · {t("mistakes.attempts", { count: r.attempts })}</p>
              </div>
              {r.avg < 75 && <span className={styles.weakBadge}>{t("mistakes.weak")}</span>}
              <button type="button" className={styles.action} onClick={() => onOpenTarget({ type: "tones", target: { tone: r.tone } })}>
                {t("mistakes.train")}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "grammar" && (
        <div className={styles.list}>
          {grammarRows.length === 0 && <p className={styles.empty}>{t("mistakes.emptyGrammar")}</p>}
          {grammarRows.map((r) => (
            <div key={r.topic.id} className={styles.row}>
              <div className={styles.hanziBox} style={{ fontSize: 26, color: "#4F7942" }}>法</div>
              <div className={styles.rowMain}>
                <p className={styles.meaning}>{pick(r.topic.title)}</p>
                <div className={styles.bar}><span style={{ width: `${r.percent}%`, background: r.percent >= 70 ? "var(--accent)" : "var(--primary)" }} /></div>
                <p className={styles.time}>{t("mistakes.grammarPercent", { percent: r.percent })} · {t("mistakes.answers", { count: r.answers })}</p>
              </div>
              <span className={styles.lessonBadge}>HSK {r.topic.level}</span>
              <button type="button" className={styles.action} onClick={() => onOpenTarget({ type: "grammar", target: { topicId: r.topic.id } })}>
                {t("mistakes.openTopic")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}