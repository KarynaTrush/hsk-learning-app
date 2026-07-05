import React, { useState } from 'react';
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

export default function App() {
  const [screen, setScreen] = useState(() => {
    return localStorage.getItem("hsk_current_screen") || "auth";
  });

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("hsk_current_tab") || "dashboard";
  });
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
    if (item === "errors")  saveAndSetScreen("mojebledy");
    if (item === "srs")     saveAndSetScreen("powtorki");
    if (item === "stories") saveAndSetScreen("character");
  }

  const subScreenLabel = {
    lesson:    { title: "Lekcja · Jedzenie", subtitle: "食物 · HSK 2" },
    character: { title: "Karta Hieroglifa", subtitle: "字卡 · 食 (shí)" },
    mojebledy: { title: "Moje Błędy", subtitle: "错误复习 · Do powtórzenia" },
    powtorki:  { title: "Powtórki · SRS", subtitle: "间隔重复 · Spaced Repetition" },
  };

  const isAuth = screen === "auth" || screen === "placement";
  const isMain = screen === "main";
  const isSub  = !isAuth && !isMain;

  if (isAuth) {
    return (
      <div className="min-h-screen bg-background flex">
        {screen === "auth" && (
          <AuthScreen onAuth={() => saveAndSetScreen("placement")} />
        )}
        {screen === "placement" && (
          <PlacementTestScreen onComplete={() => goMain("dashboard")} />
        )}
      </div>
    );
  }
  const subMeta = subScreenLabel[screen];
  const tabTitles = {
    dashboard: { title: "Panel główny", subtitle: "Twój dzień nauki" },
    path:      { title: "Mapa Wiedzy",  subtitle: "Ścieżka HSK" },
    tones:     { title: "Tony",         subtitle: "Wizualizator" },
    profile:   { title: "Profil",       subtitle: "Statystyki" },
  };

  const currentHeaderMeta = isSub ? subMeta : tabTitles[activeTab];
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
      <Sidebar 
        isMain={isMain}
        activeTab={activeTab} 
        goMain={goMain} 
      />
      <div className="flex-1 flex flex-col min-h-screen" style={{ minWidth: 0 }}>
        <Header 
          title={currentHeaderMeta?.title} 
          subtitle={currentHeaderMeta?.subtitle} 
          isSub={isSub}
          screen={screen}
          goMain={goMain}
        />
        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {screen === "main" && activeTab === "dashboard" && (
            <DashboardScreen onStartLesson={() => saveAndSetScreen("lesson")} />
          )}
          {screen === "main" && activeTab === "path" && (
            <LearningPathScreen onNodeSelect={() => saveAndSetScreen("lesson")} />
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
            <MistakesScreen
              onBack={() => goMain("profile")}
              onPractice={() => saveAndSetScreen("lesson")}
            />
          )}
          {screen === "powtorki" && (
            <ReviewsScreen onBack={() => goMain("profile")} />
          )}
        </main>
      </div>
    </div>
  );
}