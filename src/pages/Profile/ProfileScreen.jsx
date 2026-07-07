import { ChevronRight, AlertCircle, RefreshCw, BookOpen, TrendingUp, Target } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import styles from "./Profile.module.css";

const accuracyData = [{ name: "Celność", value: 78, fill: "#4F7942" }];

export default function ProfileScreen({ onMenuSelect }) {
  return (
    <div className={styles.container}>
      <div className={styles.topGrid}>
        <div className={styles.profileCard}>
          <div className={styles.avatarBox}>
            <span className={styles.avatarText}>安</span>
          </div>
          <div>
            <h2 className={styles.profileName}>
              Anna Kowalska
            </h2>
            <p className={styles.profileMetaText}>
              Uczy się od 14 tygodni · HSK 2 → 3 · 5-dniowa passa 🔥
            </p>
            <div className="flex gap-3">
              <div className={styles.badgeSuccess}>
                <span className={styles.badgeSuccessText}>HSK 2 Certyfik.</span>
              </div>
              <div className={styles.badgePrimary}>
                <span className={styles.badgePrimaryText}>Celuje w HSK 3</span>
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <button className={styles.editButton}>
              Edytuj profil
            </button>
          </div>
        </div>
        <div className={styles.examForecastCard}>
          <div className={styles.examMeta}>
            <TrendingUp size={16} color="var(--primary)" strokeWidth={1.8} />
            <span className={styles.examMetaText}>PRZEWIDYWANA DATA EGZAMINU</span>
          </div>
          <div>
            <p className={styles.examLevel}>HSK 3</p>
            <p className={styles.examDate}>15.03.2027</p>
          </div>
          <div className="mt-4">
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Gotowość</span>
              <span className={styles.progressValue}>62%</span>
            </div>
            <div className={styles.progressBarTrack}>
              <div className={styles.progressBarFill} style={{ width: "62%" }} />
            </div>
          </div>
        </div>

      </div>

      <div className={styles.threeColumnGrid}>
        <div className={styles.flexCol}>
          <div className={styles.numericStatCard}>
            <p className={styles.statMetaTitle}>POZNANE SŁOWA</p>
            <div className={styles.statValueRow}>
              <p className={styles.bigStatNumber}>248</p>
              <p className={styles.statTrendText}>↑ +12 ten tydzień</p>
            </div>
          </div>
          
          <div className={styles.numericStatCard}>
            <p className={styles.statMetaTitle}>CELNOŚĆ</p>
            <div className={styles.statValueRow}>
              <div>
                <p className={styles.bigStatNumber} style={{ color: "var(--accent)" }}>78%</p>
                <p className={styles.statSubLabel}>średnia</p>
              </div>
              <div style={{ width: 80, height: 80 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius={28} outerRadius={40} startAngle={90} endAngle={90 - (78 / 100) * 360} data={accuracyData}>
                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "var(--muted)" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className={styles.numericStatCard}>
            <p className={styles.statMetaTitle}>CZAS NAUKI</p>
            <p className={styles.bigStatNumber} style={{ color: "#D4A843" }}>4.2h</p>
            <p className={styles.statSubLabel}>ten tydzień</p>
          </div>
        </div>
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>AKTYWNOŚĆ · 7 DNI</p>
          <div className={styles.chartCanvas}>
            {[28, 45, 20, 55, 38, 60, 15].map((val, i) => {
              const d = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"][i];
              const isToday = i === 5;
              return (
                <div key={i} className={styles.chartBarColumn}>
                  <div
                    className={styles.chartBar}
                    style={{ 
                      height: `${(val / 60) * 100}%`, 
                      backgroundColor: isToday ? "var(--primary)" : "var(--accent)", 
                      opacity: isToday ? 1 : 0.55 
                    }}
                  />
                  <span 
                    className={styles.chartDayLabel}
                    style={{ 
                      color: isToday ? "var(--primary)" : "var(--muted-foreground)", 
                      fontWeight: isToday ? 600 : 400 
                    }}
                  >
                    {d}
                  </span>
                </div>
              );
            })}
          </div>

          <div className={styles.categoriesDivider}>
            <p className={styles.categoriesTitle}>POSTĘP PO KATEGORIACH</p>
            <div className={styles.categoryList}>
              {[
                { label: "Jedzenie", pct: 58, color: "var(--primary)" },
                { label: "Czas", pct: 82, color: "var(--accent)" },
                { label: "Rodzina", pct: 95, color: "var(--accent)" },
                { label: "Zakupy", pct: 30, color: "#D4A843" },
              ].map((item) => (
                <div key={item.label} className={styles.categoryRow}>
                  <span className={styles.categoryLabel}>{item.label}</span>
                  <div className={styles.categoryBarTrack}>
                    <div className={styles.categoryBarFill} style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                  </div>
                  <span className={styles.categoryPercent}>{item.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.flexCol}>
          {[
            {
              icon: <AlertCircle size={20} color="var(--primary)" strokeWidth={1.5} />,
              iconBg: "rgba(200,62,52,0.08)",
              label: "Moje błędy",
              sublabel: "Powtórz trudne słowa",
              badge: "23",
              badgeColor: "var(--primary)",
              badgeBg: "rgba(200,62,52,0.1)",
              key: "errors",
            },
            {
              icon: <RefreshCw size={20} color="#D4A843" strokeWidth={1.5} />,
              iconBg: "rgba(212,168,67,0.1)",
              label: "Powtórki (SRS)",
              sublabel: "Spaced Repetition System",
              badge: "47",
              badgeColor: "#A07820",
              badgeBg: "rgba(212,168,67,0.1)",
              key: "srs",
            },
            {
              icon: <BookOpen size={20} color="var(--accent)" strokeWidth={1.5} />,
              iconBg: "rgba(79,121,66,0.1)",
              label: "Chińskie historie i kultura",
              sublabel: "Czytanie i kulturoznawstwo",
              badge: null,
              badgeColor: null,
              badgeBg: null,
              key: "stories",
            },
            {
              icon: <Target size={20} color="#6B8CAE" strokeWidth={1.5} />,
              iconBg: "rgba(107,140,174,0.1)",
              label: "Cele i wyzwania",
              sublabel: "Tygodniowe cele nauki",
              badge: "3",
              badgeColor: "#4A6A8A",
              badgeBg: "rgba(107,140,174,0.1)",
              key: "goals",
            },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => onMenuSelect(item.key)}
              className={styles.menuButton}
            >
              <div className={styles.menuIconBox} style={{ backgroundColor: item.iconBg }}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={styles.menuLabel}>{item.label}</p>
                <p className={styles.menuSublabel}>{item.sublabel}</p>
              </div>
              <div className={styles.menuBadgeBox}>
                {item.badge && (
                  <div className={styles.menuBadge} style={{ backgroundColor: item.badgeBg || undefined, border: `1px solid ${item.badgeColor}30` }}>
                    <span className={styles.menuBadgeText} style={{ color: item.badgeColor || undefined }}>{item.badge}</span>
                  </div>
                )}
                <ChevronRight size={16} color="var(--muted-foreground)" strokeWidth={1.5} />
              </div>
            </button>
          ))}
          
          <button className={styles.settingsButton}>
            <span className={styles.settingsButtonText}>Ustawienia konta</span>
          </button>
        </div>
      </div>
    </div>
  );
}