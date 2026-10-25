import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import AuthScreen from "./pages/Auth/AuthScreen";
import PlacementTestScreen from "./pages/PlacementTest/PlacementTestScreen";
import DashboardScreen from "./pages/Dashboard/DashboardScreen";
import LearningPathScreen from "./pages/LearningPath/LearningPathScreen";
import LessonScreen from "./pages/Lesson/LessonScreen";
import ProfileScreen from "./pages/Profile/ProfileScreen";
import ToneVisualizerScreen from "./pages/ToneVisualizer/ToneVisualizerScreen";
import CharacterDetailScreen from "./pages/CharacterDetail/CharacterDetailScreen";
import MistakesScreen from "./pages/Mistakes/MistakesScreen";
import ReviewsScreen from "./pages/Reviews/ReviewsScreen";
import ReadingScreen from "./pages/Reading/ReadingScreen";
import { useAppState } from "./state/AppState";
import { nodeById } from "./data/path";
import { vocabByHanzi } from "./data/vocab";

const RESTORABLE_SCREENS = ["main", "mistakes", "reviews"];
const SKIP_PLACEMENT_IN_DEV = import.meta.env.DEV;

export default function App() {
  const { t } = useTranslation();
  const { state, openLesson, logout } = useAppState();

const hasSession = Boolean(state.user || state.placementDone);
const needsPlacement = !state.placementDone && !SKIP_PLACEMENT_IN_DEV;

const [screen, setScreen] = useState(() => {
  if (hasSession && !needsPlacement) {
    const saved = localStorage.getItem("hsk_current_screen");
    return ["main", "mistakes", "reviews", "mojebledy", "powtorki"].includes(saved) ? saved : "main";
  }
  if (hasSession) return "placement";
  return "auth";
});

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("hsk_current_tab") || "dashboard");
  const [focusHanzi, setFocusHanzi] = useState("食");

  function goMain(tab = "dashboard") {
    setActiveTab(tab);
    setScreen("main");
    localStorage.setItem("hsk_current_screen", "main");
    localStorage.setItem("hsk_current_tab", tab);
  }
  const saveAndSetScreen = (newScreen) => {
    setScreen(newScreen);
    localStorage.setItem("hsk_current_screen", newScreen);
  };

  function handleMenuSelect(item) {
    if (item === "errors") saveAndSetScreen("mistakes");
    if (item === "srs") saveAndSetScreen("reviews");
    if (item === "stories") goMain("stories");
    if (item === "goals") goMain("dashboard");
    if (item === "grammar") goMain("path");
  }

  function startLesson(nodeId, hanzis) {
    openLesson(nodeId, hanzis);
    saveAndSetScreen("lesson");
  }

  const node = nodeById(state.activeNodeId);

  const subScreenLabel = {
    lesson:    {
      title: node ? t(`pathNodes.${node.nodeKey}.label`) : t("screens.lessonTitle"),
      subtitle: node ? `${node.hanzi} · HSK ${vocabByHanzi(node.hanzi)?.hsk || ""}` : t("screens.lessonSubtitle"),
    },
    character: { title: t("screens.characterTitle"), subtitle: `字卡 · ${focusHanzi}` },
    mistakes: { title: t("screens.mistakesTitle"), subtitle: t("screens.mistakesSubtitle") },
    reviews:  { title: t("screens.reviewsTitle"), subtitle: t("screens.reviewsSubtitle") },
  };

  const isAuth = screen === "auth" || screen === "placement";
  const isMain = screen === "main";
  const isSub  = !isAuth && !isMain;

  if (isAuth) {
    return (
      <div className="min-h-screen bg-background flex">
        {screen === "auth" && (
          <AuthScreen onAuth={() => saveAndSetScreen(needsPlacement ? "placement" : "main")} />
        )}
        {screen === "placement" && (
          <PlacementTestScreen onComplete={() => goMain("dashboard")} />
        )}
      </div>
    );
  }

  const subMeta = subScreenLabel[screen];
  const tabTitles = {
    dashboard: { title: t("nav.dashboard"), subtitle: t("nav.dashboardSub") },
    path:      { title: t("nav.path"),      subtitle: t("nav.pathSub") },
    tones:     { title: t("nav.tones"),     subtitle: t("nav.tonesSub") },
    stories:   { title: t("nav.stories"),   subtitle: t("nav.storiesSub") },
    profile:   { title: t("nav.profile"),   subtitle: t("nav.profileSub") },
  };

  const currentHeaderMeta = isSub ? subMeta : tabTitles[activeTab];
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
      <Sidebar isMain={isMain} activeTab={activeTab} goMain={goMain} />
      <div className="flex-1 flex flex-col min-h-screen" style={{ minWidth: 0 }}>
        <Header
          title={currentHeaderMeta?.title}
          subtitle={currentHeaderMeta?.subtitle}
          onProfileClick={() => goMain("profile")}
          onOpenCharacter={(hanzi) => { setFocusHanzi(hanzi); saveAndSetScreen("character"); }}
          onLogout={() => { logout(); setScreen("auth"); }}
        />
        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {screen === "main" && activeTab === "dashboard" && (
            <DashboardScreen
              onStartLesson={() => startLesson(state.activeNodeId)}
              onStartReview={() => saveAndSetScreen("powtorki")}
            />
          )}
          {screen === "main" && activeTab === "path" && (
            <LearningPathScreen onNodeSelect={(id) => startLesson(id)} />
          )}
          {screen === "main" && activeTab === "tones" && <ToneVisualizerScreen />}
          {screen === "main" && activeTab === "stories" && <ReadingScreen />}
          {screen === "main" && activeTab === "profile" && (
            <ProfileScreen onMenuSelect={handleMenuSelect} />
          )}
          {screen === "lesson" && (
            <LessonScreen onComplete={() => goMain("dashboard")} />
          )}
          {screen === "character" && (
            <CharacterDetailScreen hanzi={focusHanzi} onBack={() => goMain("profile")} />
          )}
          {screen === "mistakes" && (
            <MistakesScreen
              onBack={() => goMain("profile")}
              onPractice={(hanzis) => startLesson(state.activeNodeId, hanzis)}
            />
          )}
          {screen === "reviews" && (
            <ReviewsScreen onBack={() => goMain("profile")} />
          )}
        </main>
      </div>
    </div>
  );
}