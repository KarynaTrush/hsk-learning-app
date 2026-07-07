import React, { useState } from "react";
import { ChevronRight, AlertCircle, RefreshCw, TrendingUp, Target, FileText } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import styles from "./Profile.module.css";

const accuracyData = [{ name: "Celność", value: 78, fill: "#4F7942" }];

// Данные по категориям для всех 6 уровней HSK
// Данные по категориям для всех 6 уровней HSK
const hskData = {
  1: [
    { label: "Jedzenie", pct: 90, color: "var(--accent)" },
    { label: "Czas", pct: 85, color: "var(--primary)" },
    { label: "Rodzina", pct: 100, color: "var(--accent)" },
    { label: "Zakupy", pct: 75, color: "#D4A843" },
    { label: "Liczby", pct: 95, color: "var(--accent)" },
    { label: "Ludzie", pct: 80, color: "var(--primary)" },
    { label: "Natura", pct: 70, color: "#D4A843" },
    { label: "Powitania", pct: 100, color: "var(--accent)" },
    { label: "Szkoła", pct: 60, color: "var(--primary)" },
  ],
  2: [
    { label: "Jedzenie", pct: 58, color: "var(--primary)" },
    { label: "Czas", pct: 82, color: "var(--accent)" },
    { label: "Rodzina", pct: 95, color: "var(--accent)" },
    { label: "Zakupy", pct: 30, color: "#D4A843" },
    { label: "Miejsca", pct: 45, color: "var(--primary)" },
    { label: "Praca", pct: 70, color: "var(--accent)" },
    { label: "Podróże", pct: 20, color: "#D4A843" },
    { label: "Pogoda", pct: 88, color: "var(--accent)" },
    { label: "Zwierzęta", pct: 65, color: "var(--accent)" },
    { label: "Zdrowie", pct: 40, color: "var(--primary)" },
    { label: "Rozrywka", pct: 15, color: "#D4A843" },
    { label: "Transport", pct: 50, color: "var(--primary)" },
    { label: "Kolory", pct: 90, color: "var(--accent)" },
    { label: "Ubrania", pct: 35, color: "#D4A843" },
  ],
  3: [
    { label: "Miejsca", pct: 55, color: "var(--accent)" },
    { label: "Praca", pct: 42, color: "var(--primary)" },
    { label: "Podróże", pct: 38, color: "var(--primary)" },
    { label: "Pogoda", pct: 60, color: "var(--accent)" },
    { label: "Kultura", pct: 25, color: "#D4A843" },
    { label: "Media", pct: 10, color: "#D4A843" },
    { label: "Edukacja", pct: 70, color: "var(--accent)" },
    { label: "Emocje", pct: 32, color: "var(--primary)" },
    { label: "Środowisko", pct: 15, color: "#D4A843" },
    { label: "Społeczeństwo", pct: 5, color: "#D4A843" },
    { label: "Zainteresowania", pct: 65, color: "var(--accent)" },
    { label: "Sport", pct: 48, color: "var(--primary)" },
    { label: "Mieszkanie", pct: 50, color: "var(--accent)" },
    { label: "Technologia", pct: 12, color: "#D4A843" },
  ],
  4: [
    { label: "Biznes", pct: 0, color: "var(--muted)" },
    { label: "Edukacja", pct: 0, color: "var(--muted)" },
    { label: "Natura", pct: 0, color: "var(--muted)" },
    { label: "Społeczeństwo", pct: 0, color: "var(--muted)" },
    { label: "Kariera zawodowa", pct: 0, color: "var(--muted)" },
    { label: "Nauka i rozwój", pct: 0, color: "var(--muted)" },
    { label: "Stosunki międzyludzkie", pct: 0, color: "var(--muted)" },
    { label: "Prawo i porządek", pct: 0, color: "var(--muted)" },
    { label: "Ekologia", pct: 0, color: "var(--muted)" },
    { label: "Sztuka i literatura", pct: 0, color: "var(--muted)" },
  ],
  5: [
    { label: "Technologia", pct: 0, color: "var(--muted)" },
    { label: "Nauka", pct: 0, color: "var(--muted)" },
    { label: "Polityka", pct: 0, color: "var(--muted)" },
    { label: "Ekonomia globalna", pct: 0, color: "var(--muted)" },
    { label: "Psychologia", pct: 0, color: "var(--muted)" },
    { label: "Tradycje i obyczaje", pct: 0, color: "var(--muted)" },
    { label: "Medycyna nowoczesna", pct: 0, color: "var(--muted)" },
    { label: "Filozofia życiowa", pct: 0, color: "var(--muted)" },
  ],
  6: [
    { label: "Filozofia klasyczna", pct: 0, color: "var(--muted)" },
    { label: "Historia starożytna", pct: 0, color: "var(--muted)" },
    { label: "Literatura klasyczna", pct: 0, color: "var(--muted)" },
    { label: "Archeologia", pct: 0, color: "var(--muted)" },
    { label: "Stosunki międzynarodowe", pct: 0, color: "var(--muted)" },
    { label: "Metafizyka", pct: 0, color: "var(--muted)" },
    { label: "Sztuka tradycyjna", pct: 0, color: "var(--muted)" },
    { label: "Lingwistyka porównawcza", pct: 0, color: "var(--muted)" },
  ]
};

export default function ProfileScreen({ onMenuSelect }) {
  const [activeHsk, setActiveHsk] = useState(3);

  return (
    <div className={styles.container}>
      <div className={styles.topGrid}>
        <div className={styles.profileCard}>
          <div className={styles.avatarBox}>
            <span className={styles.avatarText}>安</span>
          </div>
          <div>
            <h2 className={styles.profileName}>Карина Труш</h2>
            <p className={styles.profileMetaText}>
              Uczy się od 14 tygodni · HSK 3 → 4 · 5-dniowa passa 🔥
            </p>
            <div className="flex gap-3">
              <div className={styles.badgeSuccess}>
                <span className={styles.badgeSuccessText}>HSK 3 Certyfik.</span>
              </div>
              <div className={styles.badgePrimary}>
                <span className={styles.badgePrimaryText}>Celuje w HSK 4</span>
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <button className={styles.editButton}>Edytuj profil</button>
          </div>
        </div>

        <div className={styles.examForecastCard}>
          <div className={styles.examMeta}>
            <TrendingUp size={16} color="var(--primary)" strokeWidth={1.8} />
            <span className={styles.examMetaText}>PRZEWIDYWANA DATA EGZAMINU</span>
          </div>
          <div>
            <p className={styles.examLevel}>HSK 4</p>
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
          <div className={styles.miniCardsRow}>
            <div className={styles.numericStatCard}>
              <p className={styles.statMetaTitle}>SŁOWA</p>
              <p className={styles.miniStatNumber}>248</p>
              <p className={styles.statTrendText}>↑ +12</p>
            </div>
            <div className={styles.numericStatCard}>
              <p className={styles.statMetaTitle}>LEKCJE</p>
              <p className={styles.miniStatNumber}>42</p>
              <p className={styles.statTrendText}>↑ +4 dzisiaj</p>
            </div>
          </div>
          
          <div className={styles.numericStatCard}>
            <p className={styles.statMetaTitle}>CELNOŚĆ</p>
            <div className={styles.statValueRow}>
              <div>
                <p className={styles.bigStatNumber} style={{ color: "var(--accent)" }}>78%</p>
                <p className={styles.statSubLabel}>średnia</p>
              </div>
              <div style={{ width: 70, height: 70 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius={24} outerRadius={34} startAngle={90} endAngle={90 - (78 / 100) * 360} data={accuracyData}>
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
          <div className={styles.chartHeaderColumn}>
            <p className={styles.chartTitle}>POSTĘP PO KATEGORIACH</p>
            <div className={styles.hskTabsWrapper}>
              {[1, 2, 3, 4, 5, 6].map((level) => (
                <button
                  key={level}
                  onClick={() => setActiveHsk(level)}
                  className={`${styles.hskTabButton} ${activeHsk === level ? styles.hskTabActive : ""}`}
                >
                  HSK {level}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.scrollContainer}>
            {hskData[activeHsk].map((item) => (
              <div key={item.label} className={styles.categoryRow}>
                <span className={styles.categoryLabel}>{item.label}</span>
                <div className={styles.categoryBarTrack}>
                  <div 
                    className={styles.categoryBarFill} 
                    style={{ width: `${item.pct}%`, backgroundColor: item.color, transition: "width 0.3s ease" }} 
                  />
                </div>
                <span className={styles.categoryPercent}>{item.pct}%</span>
              </div>
            ))}
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
              icon: <FileText size={20} color="var(--accent)" strokeWidth={1.5} />,
              iconBg: "rgba(79,121,66,0.1)",
              label: "Baza gramatyki",
              sublabel: "Wymagane konstrukcje HSK",
              badge: "32",
              badgeColor: "var(--accent)",
              badgeBg: "rgba(79,121,66,0.1)",
              key: "grammar",
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
        </div>

      </div>
    </div>
  );
}