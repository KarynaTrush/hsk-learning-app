import React, { useState } from "react";
import { Lock, Star, CheckCircle2, ChevronRight, AlertTriangle } from "lucide-react";
import styles from "./LearningPath.module.css";


const hskLevels = {
  "1": {
    label: "HSK 1",
    status: "completed",
    color: "var(--accent)", // Зеленый
    bgColor: "rgba(79,121,66,0.04)",
    borderColor: "rgba(79,121,66,0.2)",
    subcategories: [
      {
        title: "Podstawy języka",
        nodes: [
          { id: 1, hanzi: "你好", label: "Powitania", sublabel: "Podstawowe zwroty", status: "completed" },
          { id: 2, hanzi: "数字", label: "Liczby 1–100", sublabel: "Cyfry i liczenie", status: "completed" },
          { id: 3, hanzi: "代词", label: "Zaimki osobowe", sublabel: "Ja, ty, on, my", status: "completed" },
          { id: 4, hanzi: "时间", label: "Czas i daty", sublabel: "Dni i godziny", status: "completed", mistakes: true }
        ]
      },
      {
        title: "Życie codzienne",
        nodes: [
          { id: 5, hanzi: "家人", label: "Rodzina", sublabel: "Relacje rodzinne", status: "completed" },
          { id: 6, hanzi: "国家", label: "Państwa i języki", sublabel: "Pochodzenie i kraje", status: "completed" },
          { id: 7, hanzi: "爱好", label: "Hobby", sublabel: "Czas wolny i pasje", status: "completed" },
          { id: 8, hanzi: "天气", label: "Pogoda", sublabel: "Podstawowe opisy", status: "completed" }
        ]
      },
      {
        title: "Otoczenie i miejsca",
        nodes: [
          { id: 9, hanzi: "学校", label: "Szkoła", sublabel: "Przedmioty i miejsca", status: "completed" },
          { id: 10, hanzi: "家里", label: "W domu", sublabel: "Meble i pokoje", status: "completed" },
          { id: 11, hanzi: "买东西", label: "Zakupy", sublabel: "Proste transakcje", status: "completed" },
          { id: 12, hanzi: "水果", label: "Owoce", sublabel: "Popularne produkty", status: "completed" }
        ]
      }
    ],
  },
  "2": {
    label: "HSK 2",
    status: "active",
    color: "var(--primary)", // Красный
    bgColor: "rgba(200,62,52,0.04)",
    borderColor: "rgba(200,62,52,0.15)",
    subcategories: [
      {
        title: "Człowiek i otoczenie",
        nodes: [
          { id: 13, hanzi: "食物", label: "Jedzenie", sublabel: "Potrawy i napoje", status: "active" },
          { id: 14, hanzi: "日常", label: "Rutyna дня", sublabel: "Czynności codzienne", status: "normal" },
          { id: 15, hanzi: "身体", label: "Wygląd zewnętrzny", sublabel: "Opis sylwetki", status: "normal" },
          { id: 16, hanzi: "疾病", label: "Zdrowie", sublabel: "Samopoczucie i lekarz", status: "normal" }
        ]
      },
      {
        title: "Miasto i przestрэń",
        nodes: [
          { id: 17, hanzi: "购物", label: "W sklepie", sublabel: "Ubrania i ceny", status: "normal" },
          { id: 18, hanzi: "交通", label: "Transport", sublabel: "Podróże i kierunki", status: "normal" },
          { id: 19, hanzi: "方向", label: "Orientacja w terenie", sublabel: "Prawo, lewo, prosto", status: "normal" },
          { id: 20, hanzi: "公共场所", label: "Miejsca publiczne", sublabel: "Kino, bank, szpital", status: "normal" }
        ]
      },
      {
        title: "Praca i zainteresowania",
        nodes: [
          { id: 21, hanzi: "工作", label: "Zawody", sublabel: "Praca i biuro", status: "normal" },
          { id: 22, hanzi: "动物", label: "Zwierzęta", sublabel: "Natura i środowisko", status: "normal" },
          { id: 23, hanzi: "颜色", label: "Kolory i styl", sublabel: "Opisywanie przedmiotów", status: "normal" },
          { id: 24, hanzi: "运动", label: "Sport i fitness", sublabel: "Aktywność fizyczna", status: "normal" }
        ]
      }
    ],
  },
  "3": {
    label: "HSK 3",
    status: "normal",
    color: "#D4A843", // Благородный золотой/желтый
    bgColor: "rgba(212,168,67,0.04)",
    borderColor: "rgba(212,168,67,0.18)",
    subcategories: [
      {
        title: "Komunikacja i relacje",
        nodes: [
          { id: 25, hanzi: "旅行", label: "Podróże", sublabel: "Turystyka i rezerwacje", status: "normal" },
          { id: 26, hanzi: "情感", label: "Emocje", sublabel: "Uczucia i relacje", status: "normal" },
          { id: 27, hanzi: "教育", label: "Edukacja wyższa", sublabel: "Uniwersytet", status: "normal" },
          { id: 28, hanzi: "职场", label: "Kariera zawodowa", sublabel: "Rozmowa o pracę", status: "normal" }
        ]
      },
      {
        title: "Czas wolny i kultura",
        nodes: [
          { id: 29, hanzi: "音乐", label: "Muzyka", sublabel: "Gatunki i instrumenty", status: "normal" },
          { id: 30, hanzi: "电影", label: "Kino i teatr", sublabel: "Filmy i spektakle", status: "normal" },
          { id: 31, hanzi: "节日", label: "Tradycje", sublabel: "Chińskie święta", status: "normal" },
          { id: 32, hanzi: "历史", label: "Opowieści", sublabel: "Mitologia i legendy", status: "normal" }
        ]
      },
      {
        title: "Otoczenie i miasto",
        nodes: [
          { id: 33, hanzi: "银行", label: "Usługi", sublabel: "Poczta i bankowość", status: "normal" },
          { id: 34, hanzi: "公寓", label: "Mieszkanie", sublabel: "Wynajem i opłaty", status: "normal" },
          { id: 35, hanzi: "餐厅", label: "Restauracja", sublabel: "Zamawianie jedzenia", status: "normal" },
          { id: 36, hanzi: "气候", label: "Natura", sublabel: "Zmiany klimatyczne", status: "normal" }
        ]
      }
    ]
  },
  "4": {
    label: "HSK 4",
    status: "normal",
    color: "#2B6CB0", // Насыщенный синий
    bgColor: "rgba(43,108,176,0.04)",
    borderColor: "rgba(43,108,176,0.18)",
    subcategories: [
      {
        title: "Życie społeczne",
        nodes: [
          { id: 37, hanzi: "社会", label: "Społeczeństwo", sublabel: "Kultura i życie", status: "normal" },
          { id: 38, hanzi: "经济", label: "Biznes i finanse", sublabel: "Rynek globalny", status: "normal" },
          { id: 39, hanzi: "法律", label: "Prawo", sublabel: "System sądownictwa", status: "normal" },
          { id: 40, hanzi: "习惯", label: "Obyczaje", sublabel: "Tradycje społeczne", status: "normal" }
        ]
      },
      {
        title: "Nauka i rozwój",
        nodes: [
          { id: 41, hanzi: "科学", label: "Badania", sublabel: "Projekty naukowe", status: "normal" },
          { id: 42, hanzi: "技术", label: "Technologia", sublabel: "Rozwój cyfrowy", status: "normal" },
          { id: 43, hanzi: "环境", label: "Ekologia", sublabel: "Ochrona przyrody", status: "normal" },
          { id: 44, hanzi: "创新", label: "Innowacje", sublabel: "Nowe patenty", status: "normal" }
        ]
      },
      {
        title: "Media i sztuka",
        nodes: [
          { id: 45, hanzi: "新闻", label: "Wiadomości", sublabel: "Prasa i telewizja", status: "normal" },
          { id: 46, hanzi: "艺术", label: "Sztuka", sublabel: "Kultura wysoka", status: "normal" },
          { id: 47, hanzi: "广告", label: "Marketing", sublabel: "Reklama i media", status: "normal" },
          { id: 48, hanzi: "作家", label: "Literatura", sublabel: "Współczesne dzieła", status: "normal" }
        ]
      }
    ]
  },
  "5": {
    label: "HSK 5",
    status: "normal",
    color: "#6B46C1", // Глубокий фиолетовый
    bgColor: "rgba(107,70,193,0.04)",
    borderColor: "rgba(107,70,193,0.18)",
    subcategories: [
      {
        title: "Zaawansowana dyskusja",
        nodes: [
          { id: 49, hanzi: "哲学", label: "Filozofia", sublabel: "Chińska myśl i etyka", status: "normal" },
          { id: 50, hanzi: "媒体", label: "Media i prasa", sublabel: "Wiadomości krajowe", status: "normal" },
          { id: 51, hanzi: "心理", label: "Psychologia", sublabel: "Zachowanie ludzkie", status: "normal" },
          { id: 52, hanzi: "逻辑", label: "Logika", sublabel: "Argumentacja", status: "normal" }
        ]
      },
      {
        title: "Biznes i rynki",
        nodes: [
          { id: 53, hanzi: "谈判", label: "Negocjacje", sublabel: "Spotkania biznesowe", status: "normal" },
          { id: 54, hanzi: "投资", label: "Inwestycje", sublabel: "Giełda i kapitał", status: "normal" },
          { id: 55, hanzi: "贸易", label: "Eksport i import", sublabel: "Wymiana handlowa", status: "normal" },
          { id: 56, hanzi: "管理", label: "Zarządzanie", sublabel: "Zasoby ludzkie", status: "normal" }
        ]
      },
      {
        title: "Kultura i nauka",
        nodes: [
          { id: 57, hanzi: "历史", label: "Historia", sublabel: "Starożytne dynastie", status: "normal" },
          { id: 58, hanzi: "教育", label: "System szkolnictwa", sublabel: "Reformy edukacji", status: "normal" },
          { id: 59, hanzi: "地理", label: "Geografia", sublabel: "Ukształtowanie terenu", status: "normal" },
          { id: 60, hanzi: "古迹", label: "Zabytki", sublabel: "Dziedzictwo UNESCO", status: "normal" }
        ]
      }
    ]
  },
  "6": {
    label: "HSK 6",
    status: "normal",
    color: "#DD6B20", // Насыщенный оранжевый
    bgColor: "rgba(221,107,32,0.04)",
    borderColor: "rgba(221,107,32,0.18)",
    subcategories: [
      {
        title: "Sfery specjalistyczne",
        nodes: [
          { id: 61, hanzi: "政治", label: "Polityka", sublabel: "Dyplomacja i prawo", status: "normal" },
          { id: 62, hanzi: "医疗", label: "Medycyna", sublabel: "Biotechnologia", status: "normal" },
          { id: 63, hanzi: "工业", label: "Przemysł", sublabel: "Automatyzacja fabryk", status: "normal" },
          { id: 64, hanzi: "军事", label: "Strategia", sublabel: "Historia wojskowości", status: "normal" }
        ]
      },
      {
        title: "Ekonomia i globalizacja",
        nodes: [
          { id: 65, hanzi: "财政", label: "Finanse publiczne", sublabel: "Budżet państwa", status: "normal" },
          { id: 66, hanzi: "法规", label: "Akty prawne", sublabel: "Konstytucja i kodeksy", status: "normal" },
          { id: 67, hanzi: "外汇", label: "Waluty", sublabel: "Rynki finansowe", status: "normal" },
          { id: 68, hanzi: "资源", label: "Surowce naturalne", sublabel: "Energetyka globalna", status: "normal" }
        ]
      },
      {
        title: "Socjologia i humanistyka",
        nodes: [
          { id: 69, hanzi: "人口", label: "Demografia", sublabel: "Struktura społeczna", status: "normal" },
          { id: 70, hanzi: "宗教", label: "Religioznawstwo", sublabel: "Systemy filozoficzne", status: "normal" },
          { id: 71, hanzi: "考古", label: "Archeologia", sublabel: "Wykopaliska naukowe", status: "normal" },
          { id: 72, hanzi: "审美", label: "Estetyka", sublabel: "Krytyka literacka", status: "normal" }
        ]
      }
    ]
  },
  "7-9": {
    label: "HSK 7-9",
    status: "normal",
    color: "#319795", // Морская волна / Тёмный бирюзовый
    bgColor: "rgba(49,151,149,0.04)",
    borderColor: "rgba(49,151,149,0.18)",
    subcategories: [
      {
        title: "Poziom akademicki",
        nodes: [
          { id: 73, hanzi: "学术", label: "Badania", sublabel: "Prace naukowe", status: "normal" },
          { id: 74, hanzi: "智能", label: "Sztuczna inteligencja", sublabel: "Nowe technologie", status: "normal" },
          { id: 75, hanzi: "核心", label: "Metodologia", sublabel: "Analiza statystyczna", status: "normal" },
          { id: 76, hanzi: "论文", label: "Dyskurs naukowy", sublabel: "Publikacje i recenzje", status: "normal" }
        ]
      },
      {
        title: "Kultura wyższa i źródła",
        nodes: [
          { id: 77, hanzi: "古文", label: "Klasyczny chiński", sublabel: "Teksty źródłowe", status: "normal" },
          { id: 78, hanzi: "诗歌", label: "Poezja Tang", sublabel: "Analiza wersyfikacji", status: "normal" },
          { id: 79, hanzi: "戏剧", label: "Opera chińska", sublabel: "Tradycje teatralne", status: "normal" },
          { id: 80, hanzi: "思想", label: "Konfucjanizm", sublabel: "Teksty filozoficzne", status: "normal" }
        ]
      },
      {
        title: "Globalne wyzwania IT",
        nodes: [
          { id: 81, hanzi: "安全", label: "Cyberbezpieczeństwo", sublabel: "Ochrona danych", status: "normal" },
          { id: 82, hanzi: "数据", label: "Big Data", sublabel: "Analiza algorytmiczna", status: "normal" },
          { id: 83, hanzi: "网络", label: "Chmury obliczeniowe", sublabel: "Infrastruktura sieci", status: "normal" },
          { id: 84, hanzi: "量子", label: "Fizyka kwantowa", sublabel: "Komputery kwantowe", status: "normal" }
        ]
      }
    ]
  }
};

function NodeCard({ node, onSelect, levelColor }) {
  let safeColor = levelColor;
  if (levelColor === "var(--accent)") {
    safeColor = "#4F7942"; 
  } else if (levelColor === "var(--primary)") {
    safeColor = "#C83E34"; 
  }

  const cardBgColor = `${safeColor}0A`;    
  const avatarBgColor = `${safeColor}14`;

  return (
    <button 
      onClick={onSelect} 
      className={styles.nodeCardButton}
      style={{ 
        backgroundColor: cardBgColor, 
        borderColor: safeColor 
      }}
    >
      <div 
        className={styles.nodeAvatarBox}
        style={{ 
          borderColor: safeColor, 
          backgroundColor: avatarBgColor 
        }}
      >
        <span 
          className={styles.nodeHanzi}
          style={{ color: safeColor }}
        >
          {node.hanzi[0]}
        </span>
      </div>
      <div>
        <p className={`${styles.nodeLabel} ${styles.nodeLabelActive}`}>
          {node.label}
        </p>
        <p className={styles.nodeSublabel}>
          {node.sublabel}
        </p>
      </div>
    </button>
  );
}
export default function LearningPathScreen({ onNodeSelect }) {
  const [activeTab, setActiveTab] = useState("1");
  const currentLevelData = hskLevels[activeTab];

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.legendList}>
          {[
            { color: "var(--accent)", label: "Ukończono" },
            { color: "var(--primary)", label: "Aktywne" },
            { color: "var(--muted-foreground)", label: "Zablokowane", opacity: 0.4 },
          ].map((item) => (
            <div key={item.label} className={styles.legendItem}>
              <div className={styles.legendDot} style={{ backgroundColor: item.color, opacity: item.opacity || 1 }} />
              <span className={styles.legendLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.tabsContainer}>
        {Object.keys(hskLevels).map((level) => {
          const isCurrentActive = activeTab === level;
          
          return (
            <button
              key={level}
              className={`${styles.tabButton} ${isCurrentActive ? styles.activeTab : ""}`}
              onClick={() => setActiveTab(level)}
            >
              HSK {level}
            </button>
          );
        })}
      </div>

      <div className={styles.pathSection}>
        <div className={styles.subcategoriesContainer}>
          {currentLevelData.subcategories && currentLevelData.subcategories.map((sub, idx) => (
            <div key={idx} className={styles.subcategoryBlock}>
              <div 
                className={styles.subcategoryHeaderCard}
                style={{
                  backgroundColor: `${currentLevelData.color === "var(--accent)" ? "#4F7942" : currentLevelData.color === "var(--primary)" ? "#C83E34" : currentLevelData.color}0A`,
                  borderColor: currentLevelData.color === "var(--accent)" ? "#4F7942" : currentLevelData.color === "var(--primary)" ? "#C83E34" : currentLevelData.borderColor,
                  borderStyle: "solid",
                  borderWidth: "1.5px"
                }}
              >
                <div className={styles.subcategoryInfoBlock}>
                  <div 
                    className={styles.subcategoryIconNumber}
                    style={{ backgroundColor: currentLevelData.color || "var(--primary)" }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className={styles.subcategoryTitleText}>{sub.title}</h4>
                    <p className={styles.subcategoryMetaText}>Blok tematyczny · {sub.nodes.length} leksje</p>
                  </div>
                </div>
              </div>
              <div className={styles.nodesGrid}>
                {sub.nodes.map((node) => (
                  <div key={node.id} className={styles.nodeWrapper}>
                    <NodeCard 
                      node={node} 
                      onSelect={onNodeSelect} 
                      levelColor={currentLevelData.color} 
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}