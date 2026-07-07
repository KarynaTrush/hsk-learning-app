import { Lock, AlertTriangle, Star, CheckCircle2, ChevronRight } from "lucide-react";
import styles from "./LearningPath.module.css"; // Подключаем стили

const hskLevels = [
  {
    level: 1,
    label: "HSK 1",
    status: "completed",
    color: "var(--accent)",
    bgColor: "rgba(79,121,66,0.06)",
    borderColor: "rgba(79,121,66,0.25)",
    nodes: [
      { id: 1, hanzi: "你好", label: "Powitania", sublabel: "Podstawowe zwroty", status: "completed" },
      { id: 2, hanzi: "数字", label: "Liczby 1–100", sublabel: "Cyfry i liczenie", status: "completed" },
      { id: 3, hanzi: "家人", label: "Rodzina", sublabel: "Relacje rodzinne", status: "completed" },
      { id: 4, hanzi: "时间", label: "Czas", sublabel: "Dni i godziny", status: "completed", mistakes: true },
    ],
  },
  {
    level: 2,
    label: "HSK 2",
    status: "active",
    color: "var(--primary)",
    bgColor: "rgba(200,62,52,0.04)",
    borderColor: "rgba(200,62,52,0.2)",
    nodes: [
      { id: 5, hanzi: "食物", label: "Jedzenie", sublabel: "Potrawy i napoje", status: "active" },
      { id: 6, hanzi: "购物", label: "Zakupy", sublabel: "Handel i pieniądze", status: "locked" },
      { id: 7, hanzi: "交通", label: "Transport", sublabel: "Podróże i kierunki", status: "locked" },
      { id: 8, hanzi: "天气", label: "Pogoda", sublabel: "Opisy klimatu", status: "locked" },
    ],
  },
  {
    level: 3,
    label: "HSK 3",
    status: "locked",
    color: "var(--muted-foreground)",
    bgColor: "var(--muted)",
    borderColor: "var(--border)",
    nodes: [
      { id: 9, hanzi: "工作", label: "Praca", sublabel: "Zawody i miejsca", status: "locked" },
      { id: 10, hanzi: "健康", label: "Zdrowie", sublabel: "Ciało i medycyna", status: "locked" },
      { id: 11, hanzi: "旅行", label: "Podróże", sublabel: "Miejsca i kultura", status: "locked" },
      { id: 12, hanzi: "情感", label: "Emocje", sublabel: "Uczucia i relacje", status: "locked" },
    ],
  },
];

function NodeCard({ node, onSelect }) {
  const isDone   = node.status === "completed";
  const isActive = node.status === "active";
  const isLocked = node.status === "locked";

  // Динамически выбираем классы в зависимости от состояния ноды
  let cardStyle = styles.nodeCardButtonLocked;
  let avatarStyle = styles.nodeAvatarLocked;
  let hanziStyle = styles.nodeHanziLocked;
  let labelStyle = styles.nodeLabelLocked;

  if (isActive) {
    cardStyle = `${styles.nodeCardButton} ${styles.nodeCardButtonActive}`;
    avatarStyle = `${styles.nodeAvatarBox} ${styles.nodeAvatarActive}`;
    hanziStyle = `${styles.nodeHanzi} ${styles.nodeHanziActive}`;
    labelStyle = `${styles.nodeLabel} ${styles.nodeLabelActive}`;
  } else if (isDone) {
    cardStyle = `${styles.nodeCardButton} ${styles.nodeCardButtonDone}`;
    avatarStyle = `${styles.nodeAvatarBox} ${styles.nodeAvatarDone}`;
    hanziStyle = `${styles.nodeHanzi} ${styles.nodeHanziDone}`;
    labelStyle = `${styles.nodeLabel} ${styles.nodeLabelDone}`;
  } else {
    cardStyle = `${styles.nodeCardButton} ${styles.nodeCardButtonLocked}`;
    avatarStyle = `${styles.nodeAvatarBox} ${styles.nodeAvatarLocked}`;
    hanziStyle = `${styles.nodeHanzi} ${styles.nodeHanziLocked}`;
  }

  return (
    <button onClick={() => !isLocked && onSelect()} className={cardStyle}>
      <div className={avatarStyle}>
        {isLocked ? (
          <Lock size={18} color="var(--muted-foreground)" strokeWidth={1.5} />
        ) : (
          <span className={hanziStyle}>
            {node.hanzi[0]}
          </span>
        )}
        
        {/* Маленькие бейджи-индикаторы на кружках */}
        {isDone && (
          <div className={styles.badgeDone}>
            <span className={styles.badgeDoneText}>✓</span>
          </div>
        )}
        {isActive && (
          <div className={styles.badgeActive}>
            <Star size={10} color="white" fill="white" />
          </div>
        )}
        {node.mistakes && (
          <div className={styles.badgeMistakes}>
            <AlertTriangle size={9} color="white" strokeWidth={2.5} />
          </div>
        )}
      </div>

      <div>
        <p className={labelStyle}>{node.label}</p>
        <p className={styles.nodeSublabel}>{node.sublabel}</p>
      </div>

      {isActive && (
        <div className={styles.nowBadge}>
          <span className={styles.nowBadgeText}>TERAZ</span>
        </div>
      )}
    </button>
  );
}

export default function LearningPathScreen({ onNodeSelect }) {
  return (
    <div className={styles.container}>
      {/* Верхний заголовок и легенда */}
      <div className={styles.headerRow}>
        <div>
          <p className={styles.metaTitle}>学习路径 · TWOJA ŚCIEŻKA HSK</p>
          <p className={styles.description}>
            Ucz się krok po kroku. Każdy poziom odblokuje się po ukończeniu poprzedniego.
            Węzły z ikoną ⚠ zawierają tematy, w których popełniłaś błędy.
          </p>
        </div>

        <div className={styles.legendList}>
          {[
            { color: "var(--accent)", label: "Ukończono" },
            { color: "var(--primary)", label: "Aktywne" },
            { color: "#D4A843", label: "Błędy" },
            { color: "var(--muted-foreground)", label: "Zablokowane", opacity: 0.4 },
          ].map((item) => (
            <div key={item.label} className={styles.legendItem}>
              <div className={styles.legendDot} style={{ backgroundColor: item.color, opacity: item.opacity || 1 }} />
              <span className={styles.legendLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Список уровней */}
      <div className={styles.pathSection}>
        {hskLevels.map((level, li) => (
          <div key={level.level}>
            
            {/* Шапка уровня */}
            <div
              className={styles.levelHeaderCard}
              style={{
                backgroundColor: level.bgColor,
                borderColor: level.borderColor,
                borderStyle: "solid",
                borderWidth: "1.5px"
              }}
            >
              <div className={styles.levelInfoBlock}>
                <div
                  className={styles.levelIconBox}
                  style={{
                    backgroundColor: level.status === "completed" ? "var(--accent)" : level.status === "active" ? "rgba(200,62,52,0.15)" : "var(--muted)",
                    border: `2px solid ${level.color}`,
                  }}
                >
                  {level.status === "completed" ? (
                    <CheckCircle2 size={18} color="white" strokeWidth={2} />
                  ) : (
                    <span className={styles.levelIconText} style={{ color: level.color }}>
                      {level.level}
                    </span>
                  )}
                </div>
                <div>
                  <p className={styles.levelTitle}>{level.label}</p>
                  <p className={styles.levelStatusText}>
                    {level.status === "completed"
                      ? "Ukończono · 4 / 4 lekcji"
                      : level.status === "active"
                      ? "W toku · 1 / 4 lekcji"
                      : "Zablokowane · 0 / 4 lekcji"}
                  </p>
                </div>
              </div>

              {level.status !== "locked" && (
                <div className={styles.actionsBlock}>
                  {level.status === "active" && (
                    <button onClick={onNodeSelect} className={styles.continueButton}>
                      Kontynuuj <ChevronRight size={14} strokeWidth={2} />
                    </button>
                  )}
                  {level.status === "completed" && (
                    <button className={styles.reviewButton}>
                      Powtórz lekcje
                    </button>
                  )}
                </div>
              )}

              {level.status === "locked" && (
                <div className={styles.lockedInfoBlock}>
                  <Lock size={14} color="var(--muted-foreground)" strokeWidth={1.5} />
                  <span className={styles.lockedLevelText}>
                    Ukończ HSK {level.level - 1}, aby odblokować
                  </span>
                </div>
              )}
            </div>

            {/* Сетка с карточками */}
            <div 
              className={styles.nodesGrid}
              style={{ opacity: level.status === "locked" ? 0.55 : 1 }}
            >
              {level.nodes.map((node) => (
                <div key={node.id} className={styles.nodeWrapper}>
                  <NodeCard node={node} onSelect={onNodeSelect} />
                </div>
              ))}
            </div>

            {/* Соединительная стрелочка вниз между уровнями */}
            {li < hskLevels.length - 1 && (
              <div className={styles.separatorContainer}>
                <div
                  className={styles.separatorFlex}
                  style={{ opacity: hskLevels[li + 1].status === "locked" ? 0.25 : 0.6 }}
                >
                  <div className={styles.separatorLine} />
                  <ChevronRight
                    size={16}
                    color="var(--muted-foreground)"
                    strokeWidth={1.5}
                    className={styles.separatorIcon}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}