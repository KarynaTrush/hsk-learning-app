import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createCard, reviewCard } from "../lib/srs";
import { vocabByHanzi, vocabByNode } from "../data/vocab";
import { nodesUpTo } from "../data/path";

const STORAGE_KEY = "xinna_state";
const THEME_KEY = "xinna_theme";

function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayKey() {
  return dateKey();
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
}

export function defaultState() {
  return {
    user: null,
    theme: localStorage.getItem(THEME_KEY) || "light",
    placementDone: false,
    hskLevel: 1,
    targetHsk: 3,
    startedAt: null,
    streak: { count: 0, lastDate: null },
    daily: { date: todayKey(), lesson: false, srs: false, tones: false },
    completedNodeIds: [],
    activeNodeId: 1,
    practiceHanzis: null,
    words: {},
    mistakes: [],
    toneScores: { 1: [], 2: [], 3: [], 4: [] },
    minutesThisWeek: 0.4,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function bumpStreak(state) {
  const today = todayKey();
  const streak = { ...(state.streak || { count: 0, lastDate: null }) };
  if (streak.lastDate === today) return streak;
  if (streak.lastDate === yesterdayKey()) streak.count = (streak.count || 0) + 1;
  else streak.count = 1;
  streak.lastDate = today;
  return streak;
}

function ensureDaily(state) {
  const today = todayKey();
  if (state.daily?.date === today) return state.daily;
  return { date: today, lesson: false, srs: false, tones: false };
}

const Ctx = createContext(null);

export function AppStateProvider({ children }) {
  const [state, setState] = useState(() => {
    const s = loadState();
    s.daily = ensureDaily(s);
    return s;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
    localStorage.setItem(THEME_KEY, state.theme);
  }, [state.theme]);

  const api = useMemo(() => ({
    state,
    login(user) {
      setState((s) => ({
        ...s,
        user: {
          name: user.name || s.user?.name || "",
          email: user.email || s.user?.email || "",
          guest: Boolean(user.guest),
        },
        startedAt: s.startedAt || new Date().toISOString(),
        streak: bumpStreak(s),
      }));
    },
    logout() {
      localStorage.removeItem(STORAGE_KEY);
      setState(defaultState());
      localStorage.setItem("hsk_current_screen", "auth");
    },
    completePlacement(correctCount, total) {
      const ratio = correctCount / total;
      let hskLevel = 1;
      let activeNodeId = 1;
      let completedNodeIds = [];
      if (ratio >= 0.85) {
        hskLevel = 3;
        activeNodeId = 25;
        completedNodeIds = nodesUpTo(24);
      } else if (ratio >= 0.5) {
        hskLevel = 2;
        activeNodeId = 13;
        completedNodeIds = nodesUpTo(12);
      }
      const targetHsk = Math.min(6, hskLevel + 1);
      setState((s) => ({
        ...s,
        placementDone: true,
        hskLevel,
        targetHsk,
        activeNodeId,
        completedNodeIds,
        startedAt: s.startedAt || new Date().toISOString(),
        streak: bumpStreak(s),
      }));
      return { hskLevel, targetHsk };
    },
    openLesson(nodeId, practiceHanzis = null) {
      setState((s) => ({ ...s, activeNodeId: nodeId, practiceHanzis }));
    },
    recordAnswer(hanzi, correct) {
      setState((s) => {
        const prev = s.words[hanzi] || createCard(hanzi, { category: vocabByHanzi(hanzi)?.category });
        const words = { ...s.words, [hanzi]: reviewCard(prev, correct ? 4 : 1) };
        let mistakes = [...(s.mistakes || [])];
        if (!correct) {
          const i = mistakes.findIndex((m) => m.hanzi === hanzi);
          if (i >= 0) mistakes[i] = { ...mistakes[i], count: mistakes[i].count + 1, lastAt: Date.now() };
          else mistakes.push({ hanzi, count: 1, lastAt: Date.now() });
        }
        return { ...s, words, mistakes, streak: bumpStreak(s) };
      });
    },
    completeLesson(nodeId) {
      const words = vocabByNode(nodeId);
      setState((s) => {
        const nextWords = { ...s.words };
        for (const w of words) {
          if (!nextWords[w.hanzi]) nextWords[w.hanzi] = createCard(w.hanzi, { category: w.category });
        }
        const completed = new Set(s.completedNodeIds);
        completed.add(nodeId);
        const daily = { ...ensureDaily(s), lesson: true };
        return {
          ...s,
          words: nextWords,
          completedNodeIds: [...completed],
          activeNodeId: nodeId + 1,
          practiceHanzis: null,
          daily,
          minutesThisWeek: (s.minutesThisWeek || 0) + 0.25,
          streak: bumpStreak(s),
        };
      });
    },
    reviewResult(hanzi, know) {
      setState((s) => {
        const prev = s.words[hanzi] || createCard(hanzi);
        const words = { ...s.words, [hanzi]: reviewCard(prev, know ? 5 : 1) };
        let mistakes = [...(s.mistakes || [])];
        if (!know) {
          const i = mistakes.findIndex((m) => m.hanzi === hanzi);
          if (i >= 0) mistakes[i] = { ...mistakes[i], count: mistakes[i].count + 1, lastAt: Date.now() };
          else mistakes.push({ hanzi, count: 1, lastAt: Date.now() });
        }
        const daily = { ...ensureDaily(s), srs: true };
        return { ...s, words, mistakes, daily, streak: bumpStreak(s) };
      });
    },
    dismissMistake(hanzi) {
      setState((s) => ({
        ...s,
        mistakes: (s.mistakes || []).filter((m) => m.hanzi !== hanzi),
      }));
    },
    markTodo(key) {
      setState((s) => ({ ...s, daily: { ...ensureDaily(s), [key]: !s.daily?.[key] }, streak: bumpStreak(s) }));
    },
    recordTone(tone, score) {
      setState((s) => {
        const list = [...(s.toneScores?.[tone] || []), score].slice(-8);
        return {
          ...s,
          toneScores: { ...s.toneScores, [tone]: list },
          daily: { ...ensureDaily(s), tones: true },
          streak: bumpStreak(s),
        };
      });
    },
    toggleTheme() {
      setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));
    },
    updateProfile(patch) {
      setState((s) => ({ ...s, user: { ...s.user, ...patch } }));
    },
  }), [state]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState outside provider");
  return ctx;
}
