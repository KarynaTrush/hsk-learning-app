import React, { useState } from "react";
import { ChevronRight, BookOpen, Target, Flame, TrendingUp, Zap, AlertCircle, RefreshCw } from "lucide-react";
import styles from "./Dashboard.module.css";

const previewWords = [
  { hanzi: "吃货", pinyin: "chīhuò", translation: "żarłok / smakosz" },
  { hanzi: "美食", pinyin: "měishí", translation: "przysmaki" },
  { hanzi: "火锅", pinyin: "huǒguō", translation: "gorący kociołek" },
  { hanzi: "零食", pinyin: "língshí", translation: "przekąski" },
  { hanzi: "外卖", pinyin: "wàimài", translation: "jedzenie na wynos" },
  { hanzi: "夜宵", pinyin: "yèxiāo", translation: "nocna przekąska" },
  { hanzi: "爆米花", pinyin: "bàomǐhuā", translation: "popcorn" },
  { hanzi: "垃圾食品", pinyin: "lājī shípǐn", translation: "śmieciowe jedzenie" },
  { hanzi: "招牌菜", pinyin: "zhāopáicài", translation: "danie popisowe" },
  { hanzi: "重口味", pinyin: "zhòngkǒuwèi", translation: "ostre smaki" },
  { hanzi: "开胃菜", pinyin: "kāiwèicài", translation: "przystawka" },
  { hanzi: "甜點", pinyin: "tiándiǎn", translation: "deser" },
];

const errorWords = [
  { hanzi: "矛盾", pinyin: "máodùn", translation: "sprzeczność" },
  { hanzi: "马虎", pinyin: "mǎhu", translation: "beztroski" },
  { hanzi: "吃醋", pinyin: "chīcù", translation: "zazdrosny" },
  { hanzi: "凡尔赛", pinyin: "fán'ěrsài", translation: "flexowanie" },
  { hanzi: "摸鱼", pinyin: "mōyú", translation: "obijanie się" },
  { hanzi: "顺其自然", pinyin: "shùnqí zìrán", translation: "naturalnie" },
  { hanzi: "不可思议", pinyin: "bùkě sīyì", translation: "niesamowity" },
  { hanzi: "八卦", pinyin: "bāguà", translation: "plotki" },
  { hanzi: "内卷", pinyin: "nèijuǎn", translation: "wyścig szczurów" },
  { hanzi: "躺平", pinyin: "tǎngpíng", translation: "odpuszczanie" },
  { hanzi: "洗脑", pinyin: "xǐnǎo", translation: "pranie mózgu" },
  { hanzi: "吐槽", pinyin: "tùcáo", translation: "narzekanie" },
];

// Кастомная карточка для слов посередине лекции (иероглифы строго по центру)
function DashboardPreviewCard({ hanzi, pinyin, translation }) {
  const isLong = hanzi.length > 2;
  return (
    <div className={styles.previewWordCard}>
      <div className={`${styles.previewIconBox} ${isLong ? styles.previewIconBoxLong : ""}`}>
        <span className={`${styles.previewHanzi} ${isLong ? styles.previewHanziLong : ""}`}>{hanzi}</span>
      </div>
      <div className={styles.previewContentBox}>
        <h4 className={`${styles.previewPinyin} ${isLong ? styles.previewPinyinLong : ""}`}>{pinyin}</h4>
        {translation && <p className={styles.previewTranslation}>{translation}</p>}
      </div>
    </div>
  );
}

// Кастомная карточка для ошибок в сайдбаре
function DashboardErrorCard({ hanzi, pinyin, translation }) {
  const isLong = hanzi.length > 2;
  return (
    <div className={styles.errCard}>
      <div className={`${styles.errIconBox} ${isLong ? styles.errIconBoxLong : ""}`}>
        <span className={`${styles.errHanzi} ${isLong ? styles.errHanziLong : ""}`}>{hanzi}</span>
      </div>
      <div className={styles.errContentBox}>
        <h4 className={`${styles.errPinyin} ${isLong ? styles.errPinyinLong : ""}`}>{pinyin}</h4>
        {translation && <p className={styles.errTranslation}>{translation}</p>}
      </div>
    </div>
  );
}

export default function DashboardScreen({ onStartLesson, onStartReview }) {
  const [todos, setTodos] = useState([
    { id: 1, label: "Lekcja: Jedzenie", done: false, time: "15 min", color: "var(--primary)" },
    { id: 2, label: "Powtórki SRS", done: false, time: "47 kart", color: "#D4A843" },
    { id: 3, label: "Ćwiczenia tonów", done: false, time: "10 min", color: "var(--accent)" },
  ]);

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <p className={styles.welcomeText}>
            DZIEŃ DOBRY, KARYNA · {new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h2 className={styles.title}>Twój panel nauki</h2>
        </div>
        <div className={styles.streakBadge}>
          <Flame size={20} color="#D4A843" strokeWidth={1.8} />
          <div>
            <p className={styles.streakNumber}>5</p>
            <p className={styles.streakLabel}>dni z rzędu</p>
          </div>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        
        <div className={styles.mainColumn}>
          <div className={styles.lessonSectionWrapper}>
            <div className="flex items-center justify-between mb-3">
              <span className={styles.recommendationLabel}>DEDYKOWANA LEKCJA DLA CIEBIE</span>
              <div className={styles.aiLiveBadge}>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                <span className={styles.aiLiveText}>AI GENERATOR · LIVE</span>
              </div>
            </div>

            <div className={styles.lessonCard}>
              <div className={styles.lessonCardLine} />
              <div className={styles.lessonCardContent}>
                
                <div className={styles.lectureTagsRow}>
                  <span className={styles.lectureTagUrgent}>⚠️ Wymaga powtórzenia</span>
                  <span className={styles.lectureTagMatch}>🎯 Dopasowanie: 98%</span>
                </div>

                <div className={styles.lessonMainInfo}>
                  <div className={styles.lessonHanziIcon}>
                    <span className={styles.lessonHanziText}>食</span>
                  </div>
                  <div className="flex-1">
                    <p className={styles.lessonMetaText}>HSK 2 · SŁOWNICTWO</p>
                    <h3 className={styles.lessonTitle}>食物 · Jedzenie</h3>
                    <p className={styles.lessonDuration}>12 новых słówek · ~15 min sesji</p>
                  </div>
                </div>

                <div className={styles.reasonCallout}>
                  <p className={styles.reasonMeta}>ANALIZA SYSTEMU SRS & AI</p>
                  <p className={styles.reasonText}>
                    Opanowałaś już <span className="text-[var(--accent)] font-semibold">80% słownictwa HSK 2</span>, ale algorytm zarejestrował niedawne błędy w krytycznej kategorii <span className="text-[var(--primary)] font-semibold">'Jedzenie'</span>. Bieżąca sesja zamknie te luki i podniesie ogólną celność do bezpiecznych 88%.
                  </p>
                </div>

                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Aktualny stan zaawansowania</span>
                    <span className={styles.progressCount}>7 z 12 słów (58%)</span>
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div className={styles.progressBar} style={{ width: "58%" }} />
                  </div>
                </div>

                {/* Ограничиваем сетку только 4 словами на главном экране */}
                <div className={styles.previewWordsGrid}>
                  {previewWords.slice(0, 4).map((word) => (
                    <DashboardPreviewCard
                      key={word.hanzi}
                      hanzi={word.hanzi}
                      pinyin={word.pinyin}
                      translation={word.translation}
                    />
                  ))}
                  <div className={styles.moreWordsRow}>
                    <span className={styles.moreWordsText}>+ 8 słówek oczekuje</span>
                  </div>
                </div>

                <button onClick={onStartLesson} className={styles.startButton}>
                  <BookOpen size={18} strokeWidth={1.8} />
                  <span>Rozpocznij spersonalizowaną naukę</span>
                  <ChevronRight size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.quoteCard}>
            <p className={styles.quoteTitle}>CYTAT DNIA</p>
            <p className={styles.quoteHanzi}>学如逆水行舟，不进则退。</p>
            <p className={styles.quoteTranslation}>
              „Nauka jest jak wiosłowanie pod prąd — jeśli nie płyniesz naprzód, cofasz się.”
            </p>
          </div>

          <div className={styles.todoCard}>
            <p className={styles.todoTitle}>DZISIAJ DO ZROBIENIA</p>
            <div className={styles.todoList}>
              {todos.map((item) => (
                <div 
                  key={item.id} 
                  className={`${styles.todoItem} ${item.done ? styles.todoItemDone : ""}`}
                  onClick={() => toggleTodo(item.id)}
                >
                  <div
                    className={styles.todoCheckbox}
                    style={{ 
                      border: `1.5px solid ${item.color}`, 
                      backgroundColor: item.done ? item.color : "transparent" 
                    }}
                  >
                    {item.done && <span className={styles.todoCheckboxMark}>✓</span>}
                  </div>
                  <div className="flex-1">
                    <p className={styles.todoLabel}>{item.label}</p>
                  </div>
                  <span className={styles.todoTime}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.errorsCard}>
            <div className={styles.errorsHeader}>
              <div className="flex items-center gap-2">
                <AlertCircle size={16} color="var(--primary)" strokeWidth={1.8} />
                <p className={styles.errorsTitle}>OSTATNIE BŁĘDY</p>
              </div>
              <div className={styles.errorsBadge}>
                <span className={styles.errorsBadgeText}>23</span>
              </div>
            </div>
            
            <div className={styles.errorsScrollContainer}>
              {errorWords.map((word) => (
                <DashboardErrorCard
                  key={word.hanzi}
                  hanzi={word.hanzi}
                  pinyin={word.pinyin}
                  translation={word.translation}
                />
              ))}
            </div>

            <button onClick={onStartReview} className={styles.reviewAllButton}>
              <RefreshCw size={13} strokeWidth={2} />
              <span>Powtórz te słowa (SRS)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}