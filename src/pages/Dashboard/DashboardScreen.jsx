import { ChevronRight, BookOpen, Target, Flame, TrendingUp, Zap } from "lucide-react";
import WordCard from "../../components/common/WordCard";
import styles from "./Dashboard.module.css";

const days = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];
const completedDays = [0, 1, 2, 3, 4];

const previewWords = [
  { hanzi: "米饭", pinyin: "mǐfàn", translation: "ryż" },
  { hanzi: "面条", pinyin: "miàntiáo", translation: "makaron" },
  { hanzi: "饺子", pinyin: "jiǎozi", translation: "pierożki" },
];

const errorWords = [
  { hanzi: "饺子", pinyin: "jiǎozi", translation: "pierożki" },
  { hanzi: "星期", pinyin: "xīngqī", translation: "tydzień" },
  { hanzi: "商店", pinyin: "shāngdiàn", translation: "sklep" },
  { hanzi: "便宜", pinyin: "piányi", translation: "tani" },
  { hanzi: "医院", pinyin: "yīyuàn", translation: "szpital" },
];

export default function DashboardScreen({ onStartLesson }) {
  return (
    <div className={styles.container}>

      <div className={styles.headerRow}>
        <div>
          <p className={styles.welcomeText}>
            DZIEŃ DOBRY, ANNA · {new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h2 className={styles.title}>
            Twój panel nauki
          </h2>
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

        <div className={styles.flexCol}>

          <div className={styles.dailyGoalCard}>
            <div className={styles.goalCardHeader}>
              <div>
                <p className={styles.goalMeta}>CEL DZIENNY</p>
                <p className={styles.goalTitle}>5-dniowa passa!</p>
              </div>
              <div className={styles.goalBadge}>
                <span className={styles.goalBadgeText}>
                  20 min / dzień
                </span>
              </div>
            </div>

            <div className={styles.weekCalendar}>
              {days.map((day, i) => {
                const done = completedDays.includes(i);
                const today = i === 5;
                return (
                  <div key={day} className={styles.dayColumn}>
                    <div
                      className={`w-full transition-all ${styles.dayBox}`}
                      style={{
                        backgroundColor: done
                          ? "rgba(79,121,66,0.08)"
                          : today
                          ? "rgba(200,62,52,0.05)"
                          : "var(--muted)",
                        border: done
                          ? "1.5px solid rgba(79,121,66,0.3)"
                          : today
                          ? "1.5px solid rgba(200,62,52,0.3)"
                          : "1px solid var(--border)",
                      }}
                    >
                      {done ? (
                        <span className={styles.doneMark}>✓</span>
                      ) : (
                        <span 
                          className={styles.dayLetter}
                          style={{ 
                            color: today ? "var(--primary)" : "var(--muted-foreground)", 
                            fontWeight: today ? 600 : 400 
                          }}
                        >
                          {day[0]}
                        </span>
                      )}
                    </div>
                    <span 
                      className={styles.dayLabel}
                      style={{ 
                        color: done ? "var(--accent)" : today ? "var(--primary)" : "var(--muted-foreground)", 
                        fontWeight: today || done ? 600 : 400 
                      }}
                    >
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.statsGrid}>
            {[
              { label: "Poznane słowa", value: "248", unit: "łącznie", icon: <BookOpen size={16} color="var(--accent)" strokeWidth={1.5} />, accent: "var(--accent)" },
              { label: "Celność", value: "78%", unit: "średnia", icon: <Target size={16} color="var(--primary)" strokeWidth={1.5} />, accent: "var(--primary)" },
              { label: "Czas (tydzień)", value: "4.2h", unit: "aktywność", icon: <Zap size={16} color="#D4A843" strokeWidth={1.5} />, accent: "#D4A843" },
              { label: "Lekcje", value: "37", unit: "ukończone", icon: <TrendingUp size={16} color="var(--accent)" strokeWidth={1.5} />, accent: "var(--accent)" },
            ].map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <div className={stat.statHeader}>
                  <span className={styles.statLabel}>
                    {stat.label.toUpperCase()}
                  </span>
                  <div className={styles.statIconBox}>
                    {stat.icon}
                  </div>
                </div>
                <p className={styles.statValue} style={{ color: stat.accent }}>
                  {stat.value}
                </p>
                <p className={styles.statUnit}>
                  {stat.unit}
                </p>
              </div>
            ))}
          </div>

          <div className={styles.chartCard}>
            <p className={styles.chartTitle}>
              TIME NAUKI · OSTATNIE 7 DNI
            </p>
            <div className={styles.chartCanvas}>
              {[28, 45, 20, 55, 38, 60, 15].map((val, i) => {
                const isToday = i === 5;
                return (
                  <div key={i} className={styles.chartBarColumn}>
                    <div
                      className={styles.chartBar}
                      style={{
                        height: `${(val / 60) * 100}%`,
                        backgroundColor: isToday ? "var(--primary)" : "var(--accent)",
                        opacity: isToday ? 1 : 0.55,
                      }}
                    />
                    <span 
                      className={styles.chartDayLabel}
                      style={{ 
                        color: isToday ? "var(--primary)" : "var(--muted-foreground)", 
                        fontWeight: isToday ? 600 : 400 
                      }}
                    >
                      {days[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.flexCol}>
          <div className="flex items-center justify-between">
            <span className={styles.recommendationLabel}>
              POLECANA LEKCJA
            </span>
            <div className={styles.aiLiveBadge}>
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              <span className={styles.aiLiveText}>AI · na żywo</span>
            </div>
          </div>

          <div className={styles.lessonCard}>
            <div className={styles.lessonCardLine} />

            <div className={styles.lessonCardContent}>
              <div className={styles.lessonMainInfo}>
                <div className={styles.lessonHanziIcon}>
                  <span className={styles.lessonHanziText}>食</span>
                </div>
                <div className="flex-1">
                  <p className={styles.lessonMetaText}>HSK 2 · SŁOWNICTWO</p>
                  <h3 className={styles.lessonTitle}>
                    食物 · Jedzenie
                  </h3>
                  <p className={styles.lessonDuration}>12 słów · ~15 min</p>
                </div>
              </div>

              <div className={styles.reasonCallout}>
                <p className={styles.reasonMeta}>DLACZEGO TA LEKCJA?</p>
                <p className={styles.reasonText}>
                  Opanowałaś <span className="text-[var(--accent)] font-semibold">80% słownictwa HSK 2</span>, ale popełniłaś ostatnio błędy w kategorii <span className="text-[var(--primary)] font-semibold">'Jedzenie'</span>. Powtórzenie wzmocni trwałość и celność do 88%.
                </p>
              </div>

              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>Postęp lekcji</span>
                  <span className={styles.progressCount}>7 / 12 słów</span>
                </div>
                <div className={styles.progressBarContainer}>
                  <div className={styles.progressBar} style={{ width: "58%" }} />
                </div>
              </div>

              <div className={styles.previewWordsList}>
                {previewWords.map((word) => (
                  <WordCard
                    key={word.hanzi}
                    hanzi={word.hanzi}
                    pinyin={word.pinyin}
                    translation={word.translation}
                    variant="compact"
                  />
                ))}
                <div className={styles.moreWordsRow}>
                  <span className={styles.moreWordsText}>
                    + 9 więcej słów в этой лекции
                  </span>
                </div>
              </div>

              <button onClick={onStartLesson} className={styles.startButton}>
                <BookOpen size={18} strokeWidth={1.8} />
                <span>Rozpocznij naukę</span>
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.flexCol}>

          <div className={styles.forecastCard}>
            <div className={styles.forecastMeta}>
              <Target size={15} color="var(--accent)" strokeWidth={1.8} />
              <span className={styles.forecastMetaText}>PROGNOZA</span>
            </div>
            <p className={styles.forecastValue}>HSK 3</p>
            <p className={styles.forecastDate}>Egzamin: 15.03.2027</p>
            <div className={styles.forecastProgressContainer}>
              <div className={styles.forecastProgressBar} style={{ width: "62%" }} />
            </div>
            <p className={styles.forecastStatusText}>62% gotowości do HSK 3</p>
          </div>

          <div className={styles.todoCard}>
            <p className={styles.todoTitle}>DZISIAJ DO ZROBIENIA</p>
            <div className={styles.todoList}>
              {[
                { label: "Lekcja: Jedzenie", done: false, time: "15 min", color: "var(--primary)" },
                { label: "Powtórki SRS", done: false, time: "47 kart", color: "#D4A843" },
                { label: "Ćwiczenia tonów", done: false, time: "10 min", color: "var(--accent)" },
              ].map((item) => (
                <div key={item.label} className={styles.todoItem}>
                  <div
                    className={styles.todoCheckbox}
                    style={{ border: `1.5px solid ${item.color}`, backgroundColor: item.done ? item.color : "transparent" }}
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
              <p className={styles.errorsTitle}>
                OSTATNIE BŁĘDY
              </p>
              <div className={styles.errorsBadge}>
                <span className={styles.errorsBadgeText}>23</span>
              </div>
            </div>
            <div className={styles.errorsList}>
              {errorWords.map((word) => (
                <WordCard
                  key={word.hanzi}
                  hanzi={word.hanzi}
                  pinyin={word.pinyin}
                  translation={word.translation}
                  variant="compact"
                />
              ))}
            </div>
          </div>

          <div className={styles.quoteCard}>
            <span className={styles.quoteDecoration}>「</span>
            <p className={styles.quoteHanzi}>学如逆水行舟，不进则退。</p>
            <p className={styles.quoteTranslation}>
              Nauka jest jak wiosłowanie pod prąd — jeśli nie płyniesz naprzód, cofasz się.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}