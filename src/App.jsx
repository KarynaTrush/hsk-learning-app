import { useState } from "react";
import { Search, Bell } from "lucide-react";
import AuthScreen from "./components/AuthScreen";
import PlacementTestScreen from "./components/PlacementTestScreen";
import DashboardScreen from "./components/DashboardScreen";
import LearningPathScreen from "./components/LearningPathScreen";
import LessonScreen from "./components/LessonScreen";
import CharacterDetailScreen from "./components/CharacterDetailScreen";
import ToneVisualizerScreen from "./components/ToneVisualizerScreen";
import ProfileScreen from "./components/ProfileScreen";
import MojeBledyScreen from "./components/MojeBledyScreen";
import PowtorkiScreen from "./components/PowtorkiScreen";

const tabConfig = [
  { id: "dashboard", label: "Panel główny", hanzi: "主", sublabel: "Twój dzień nauki" },
  { id: "path",      label: "Mapa Wiedzy",  hanzi: "路", sublabel: "Ścieżka HSK" },
  { id: "tones",     label: "Tony",         hanzi: "声", sublabel: "Wizualizator" },
  { id: "profile",   label: "Profil",       hanzi: "我", sublabel: "Statystyki" },
];

export default function App() {
  const [screen, setScreen] = useState("auth");
  const [activeTab, setActiveTab] = useState("dashboard");

  function goMain(tab = "dashboard") {
    setActiveTab(tab);
    setScreen("main");
  }

  function handleMenuSelect(item) {
    if (item === "errors")  setScreen("mojebledy");
    if (item === "srs")     setScreen("powtorki");
    if (item === "stories") setScreen("character");
  }

  /* Breadcrumb labels for sub-screens */
  const subScreenLabel = {
    lesson:    { title: "Lekcja · Jedzenie", subtitle: "食物 · HSK 2" },
    character: { title: "Karta Hieroglifa", subtitle: "字卡 · 食 (shí)" },
    mojebledy: { title: "Moje Błędy", subtitle: "错误复习 · Do powtórzenia" },
    powtorki:  { title: "Powtórki · SRS", subtitle: "间隔重复 · Spaced Repetition" },
  };

  const isAuth = screen === "auth" || screen === "placement";
  const isMain = screen === "main";
  const isSub  = !isAuth && !isMain;

  /* ── Auth + Placement: full-page, no sidebar ─── */
  if (isAuth) {
    return (
      <div className="min-h-screen bg-background flex">
        {screen === "auth" && (
          <AuthScreen onAuth={() => setScreen("placement")} />
        )}
        {screen === "placement" && (
          <PlacementTestScreen onComplete={() => goMain("dashboard")} />
        )}
      </div>
    );
  }

  /* ── Main app shell: sidebar + content ─── */
  const activeTabMeta = tabConfig.find((t) => t.id === activeTab);
  const subMeta = subScreenLabel[screen];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>

      {/* ════════════════════════════════════════
          LEFT SIDEBAR  (260px fixed)
      ════════════════════════════════════════ */}
      <aside
        className="flex-none flex flex-col"
        style={{
          width: "260px",
          minHeight: "100vh",
          backgroundColor: "var(--secondary)",
          borderRight: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 30,
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-6 py-6"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-none"
            style={{
              border: "1.5px solid var(--primary)",
              backgroundColor: "rgba(200,62,52,0.06)",
            }}
          >
            <span
              style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--primary)",
                lineHeight: 1,
              }}
            >
              漢
            </span>
          </div>
          <div>
            <p
              style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--foreground)",
                lineHeight: 1.2,
              }}
            >
              漢語學習
            </p>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "10px",
                color: "var(--muted-foreground)",
                letterSpacing: "0.06em",
              }}
            >
              PLATFORMA HSK
            </p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {tabConfig.map((tab) => {
            const isActive = isMain && activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => goMain(tab.id)}
                className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-left transition-all duration-200 group"
                style={{
                  backgroundColor: isActive ? "rgba(200,62,52,0.08)" : "transparent",
                  border: isActive ? "1px solid rgba(200,62,52,0.18)" : "1px solid transparent",
                }}
              >
                {/* Hanzi icon */}
                <div
                  className="flex-none w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: isActive ? "rgba(200,62,52,0.1)" : "var(--muted)",
                    border: isActive ? "1px solid rgba(200,62,52,0.2)" : "1px solid var(--border)",
                    transition: "all 0.2s",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Noto Serif SC', serif",
                      fontSize: "17px",
                      fontWeight: isActive ? 700 : 400,
                      color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                    }}
                  >
                    {tab.hanzi}
                  </span>
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                      lineHeight: 1.2,
                    }}
                  >
                    {tab.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "10px",
                      color: isActive ? "var(--primary)" : "transparent",
                      transition: "color 0.2s",
                    }}
                  >
                    {tab.sublabel}
                  </p>
                </div>
                {isActive && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full flex-none"
                    style={{ backgroundColor: "var(--primary)" }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* HSK forecast badge */}
        <div className="px-4 pb-3">
          <div
            className="rounded-xl px-4 py-3"
            style={{
              backgroundColor: "rgba(79,121,66,0.08)",
              border: "1px solid rgba(79,121,66,0.2)",
            }}
          >
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "10px",
                color: "var(--muted-foreground)",
                letterSpacing: "0.06em",
                marginBottom: "3px",
              }}
            >
              PROGNOZA EGZAMINU
            </p>
            <p
              style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              HSK 3
            </p>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                color: "var(--muted-foreground)",
                marginTop: "1px",
              }}
            >
              est. 15.03.2027
            </p>
          </div>
        </div>

        {/* User avatar */}
        <div
          className="flex items-center gap-3 px-5 py-4 mx-3 mb-4 rounded-xl"
          style={{
            backgroundColor: "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-none"
            style={{
              border: "1.5px solid var(--primary)",
              backgroundColor: "rgba(200,62,52,0.06)",
            }}
          >
            <span
              style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--primary)",
              }}
            >
              安
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--foreground)",
              }}
            >
              Anna Kowalska
            </p>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "10px",
                color: "var(--muted-foreground)",
              }}
            >
              HSK 2 → 3
            </p>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════
          MAIN CONTENT AREA
      ════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ minWidth: 0 }}>

        {/* Top bar */}
        <header
          className="flex-none flex items-center justify-between px-8 py-4"
          style={{
            backgroundColor: "var(--background)",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--foreground)",
                lineHeight: 1.2,
              }}
            >
              {isSub ? subMeta?.title : activeTabMeta?.label}
            </h1>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                color: "var(--muted-foreground)",
              }}
            >
              {isSub ? subMeta?.subtitle : activeTabMeta?.sublabel}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isSub && (
              <button
                onClick={() => goMain(["mojebledy","powtorki","character"].includes(screen) ? "profile" : "dashboard")}
                className="px-4 py-2 rounded-lg border border-border bg-secondary text-sm transition-all hover:border-primary/30 active:scale-95"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  color: "var(--muted-foreground)",
                }}
              >
                ← Wróć
              </button>
            )}
            {/* Search */}
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center border border-border bg-card transition-all hover:border-primary/30 active:scale-90"
            >
              <Search size={15} color="var(--muted-foreground)" strokeWidth={1.5} />
            </button>
            {/* Notifications */}
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center border border-border bg-card relative transition-all hover:border-primary/30 active:scale-90"
            >
              <Bell size={15} color="var(--muted-foreground)" strokeWidth={1.5} />
              <div
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--primary)" }}
              />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {screen === "main" && activeTab === "dashboard" && (
            <DashboardScreen onStartLesson={() => setScreen("lesson")} />
          )}
          {screen === "main" && activeTab === "path" && (
            <LearningPathScreen onNodeSelect={() => setScreen("lesson")} />
          )}
          {screen === "main" && activeTab === "tones" && (
            <ToneVisualizerScreen />
          )}
          {screen === "main" && activeTab === "profile" && (
            <ProfileScreen onMenuSelect={handleMenuSelect} />
          )}
          {screen === "lesson" && (
            <LessonScreen onComplete={() => goMain("dashboard")} />
          )}
          {screen === "character" && (
            <CharacterDetailScreen onBack={() => goMain("profile")} />
          )}
          {screen === "mojebledy" && (
            <MojeBledyScreen
              onBack={() => goMain("profile")}
              onPractice={() => setScreen("lesson")}
            />
          )}
          {screen === "powtorki" && (
            <PowtorkiScreen onBack={() => goMain("profile")} />
          )}
        </main>
      </div>
    </div>
  );
}