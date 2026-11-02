import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createCard, reviewCard } from "../lib/srs";
import { vocabByHanzi, vocabByNode } from "../data/vocab";
import { nextNodeId, nodesBeforeLevel, firstNodeOfLevel } from "../data/path";
import { supabase } from "../api/supabase";
import * as authApi from "../api/auth";
import * as profileApi from "../api/profile";
import * as progressApi from "../api/progress";

const STORAGE_KEY = "xinna_state";
const STATE_AT_KEY = "xinna_state_at";
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
    stats: { answers: 0, correct: 0 },
    skills: {},
    readStories: [],
    studyLog: {},
    wordsLog: {},
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

function bumpStats(stats, correct) {
  const base = stats || { answers: 0, correct: 0 };
  return { answers: base.answers + 1, correct: base.correct + (correct ? 1 : 0) };
}

function bumpSkill(skills, skill, correct) {
  const base = skills || {};
  const prev = base[skill] || { answers: 0, correct: 0 };
  return { ...base, [skill]: { answers: prev.answers + 1, correct: prev.correct + (correct ? 1 : 0) } };
}

function logWords(s, words) {
  return { ...(s.wordsLog || {}), [todayKey()]: Object.keys(words).length };
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
  const [authReady, setAuthReady] = useState(!supabase);
  const [syncStatus, setSyncStatus] = useState("idle");

  const bootLocalAt = useRef(Number(localStorage.getItem(STATE_AT_KEY) || 0));
  const lastPushed = useRef("");
  const lastProfileSync = useRef("");
  const syncBlocked = useRef(false);
  const userRef = useRef(state.user);
  userRef.current = state.user;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(STATE_AT_KEY, String(Date.now()));
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
    localStorage.setItem(THEME_KEY, state.theme);
  }, [state.theme]);

  const resetLocalState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STATE_AT_KEY);
    lastPushed.current = "";
    lastProfileSync.current = "";
    syncBlocked.current = false;
    setState(defaultState());
    localStorage.setItem("hsk_current_screen", "auth");
  }, []);

  const hydrate = useCallback(async (authUser, { preferLocalAt = 0 } = {}) => {
    const [profile, progress] = await Promise.all([
      profileApi.fetchProfile(authUser.id).catch(() => null),
      progressApi.loadProgress(authUser.id),
    ]);
    const cloudState = progress?.state && Object.keys(progress.state).length ? progress.state : null;
    const cloudAt = progress?.updated_at ? new Date(progress.updated_at).getTime() : 0;
    const local = loadState();

    const useLocal = preferLocalAt > 0 && local.user?.id === authUser.id && preferLocalAt > cloudAt;
    const base = useLocal ? local : { ...defaultState(), ...(cloudState || {}) };

    const next = {
      ...base,
      user: {
        id: authUser.id,
        email: authUser.email || "",
        name: profile?.display_name || "",
        surname: profile?.surname || "",
        avatarUrl: profile?.avatar_url || "",
        guest: false,
      },
      startedAt: base.startedAt || authUser.created_at || new Date().toISOString(),
    };
    next.daily = ensureDaily(next);
    next.streak = bumpStreak(next);
    syncBlocked.current = false;
    lastPushed.current = "";
    setState(next);
  }, []);

  async function hydrateOrThrow(user) {
    try {
      await hydrate(user);
    } catch (e) {
      console.warn("Не удалось загрузить данные после входа:", e);
      const err = new authApi.AuthError("server_error");
      err.detail = ["после входа", e?.code, e?.message].filter(Boolean).join(" | ");
      throw err;
    }
  }

  useEffect(() => {
    if (!supabase) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (!session) {
          if (loadState().user?.id) resetLocalState();
        } else {
          await hydrate(session.user, { preferLocalAt: bootLocalAt.current });
        }
      } catch (e) {
        console.warn("Не удалось загрузить данные из Supabase:", e);
        syncBlocked.current = true;
        setSyncStatus("error");
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setTimeout(() => {
          if (userRef.current?.id) resetLocalState();
        }, 0);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const u = state.user;
    if (!supabase || !authReady || !u?.id || u.guest || syncBlocked.current) return undefined;
    const { user, ...rest } = state;
    const json = JSON.stringify(rest);
    if (json === lastPushed.current) return undefined;

    const timer = setTimeout(async () => {
      setSyncStatus("saving");
      try {
        await progressApi.saveProgress(u.id, rest);
        lastPushed.current = json;
        const meta = JSON.stringify([rest.hskLevel, rest.targetHsk, rest.placementDone]);
        if (meta !== lastProfileSync.current) {
          await profileApi.updateProfile(u.id, {
            hsk_level: rest.hskLevel,
            target_hsk: rest.targetHsk,
            placement_done: rest.placementDone,
          });
          lastProfileSync.current = meta;
        }
        setSyncStatus("idle");
      } catch (e) {
        console.warn("Не удалось сохранить прогресс:", e);
        setSyncStatus("error");
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [state, authReady]);

  function logEvent(hanzi, correct, source, responseMs = null, meta = {}) {
    const u = userRef.current;
    if (!supabase || !u?.id || u.guest || syncBlocked.current) return;
    progressApi.logAnswer(u.id, { hanzi, correct, source, responseMs, type: meta.type, skill: meta.skill, lessonId: meta.lessonId, policy: meta.policy }).catch((e) => console.warn("answer_events:", e));
  }

  const api = useMemo(() => ({
    state,

    async register({ name, email, password }) {
      const { user } = await authApi.signUp({ name, email, password });
      await hydrateOrThrow(user);
    },
    async signIn({ email, password }) {
      const { user } = await authApi.signIn({ email, password });
      await hydrateOrThrow(user);
    },
    login(user) {
      setState((s) => ({
        ...s,
        user: { name: user?.name || s.user?.name || "", email: user?.email || "", guest: true },
        startedAt: s.startedAt || new Date().toISOString(),
        streak: bumpStreak(s),
      }));
    },
    async logout() {
      resetLocalState();
      await authApi.signOut();
    },
    async updateProfile(patch) {
      setState((s) => ({ ...s, user: { ...s.user, ...patch } }));
      const u = userRef.current;
      if (!supabase || !u?.id) return;
      const cols = {};
      if ("name" in patch) cols.display_name = patch.name;
      if ("surname" in patch) cols.surname = patch.surname;
      if ("ui_language" in patch) cols.ui_language = patch.ui_language;
      if ("avatarUrl" in patch) cols.avatar_url = patch.avatarUrl;
      if (Object.keys(cols).length) {
        try {
          await profileApi.updateProfile(u.id, cols);
        } catch (e) {
          console.warn("profiles:", e);
        }
      }
    },
    async changePassword(oldPassword, newPassword) {
      await authApi.changePassword({ email: userRef.current?.email, oldPassword, newPassword });
    },
    async deleteAccount() {
      await authApi.deleteAccount();
      resetLocalState();
    },

    completePlacement(correctCount, total) {
      const ratio = correctCount / total;
      const hskLevel = ratio >= 0.85 ? 3 : ratio >= 0.5 ? 2 : 1;
      const startAtBasics = ratio < 0.25;
      const completedNodeIds = startAtBasics ? [] : nodesBeforeLevel(hskLevel);
      const activeNodeId = firstNodeOfLevel(startAtBasics ? 0 : hskLevel);
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
    recordAnswer(hanzi, correct, responseMs = null, meta = {}) {
      setState((s) => {
        const prev = s.words[hanzi] || createCard(hanzi, { category: vocabByHanzi(hanzi)?.category });
        const words = { ...s.words, [hanzi]: reviewCard(prev, correct ? 4 : 1) };
        let mistakes = [...(s.mistakes || [])];
        if (!correct) {
          const i = mistakes.findIndex((m) => m.hanzi === hanzi);
          if (i >= 0) mistakes[i] = { ...mistakes[i], count: mistakes[i].count + 1, lastAt: Date.now() };
          else mistakes.push({ hanzi, count: 1, lastAt: Date.now() });
        }
        return { ...s, words, mistakes, stats: bumpStats(s.stats, correct), skills: meta.skill ? bumpSkill(s.skills, meta.skill, correct) : s.skills, wordsLog: logWords(s, words), streak: bumpStreak(s) };
      });
      logEvent(hanzi, correct, "lesson", responseMs, meta);
    },
    recordExercise({ ref, correct, ms = null, type, skill, lessonId = null, policy = null }) {
      setState((s) => ({
        ...s,
        stats: bumpStats(s.stats, correct),
        skills: bumpSkill(s.skills, skill, correct),
        streak: bumpStreak(s),
      }));
      logEvent(ref, correct, "lesson", ms, { type, skill, lessonId, policy });
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
          wordsLog: logWords(s, nextWords),
          completedNodeIds: [...completed],
          activeNodeId: nextNodeId(nodeId),
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
        return { ...s, words, mistakes, daily, stats: bumpStats(s.stats, know), wordsLog: logWords(s, words), streak: bumpStreak(s) };
      });
      logEvent(hanzi, know, "review");
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
    markStoryRead(id) {
      setState((s) => {
        if ((s.readStories || []).includes(id)) return s;
        return { ...s, readStories: [...(s.readStories || []), id], streak: bumpStreak(s) };
      });
      logEvent(id, true, "reading", null, { type: "read", skill: "reading" });
    },
    addStudySeconds(sec) {
      setState((s) => {
        const key = todayKey();
        const log = { ...(s.studyLog || {}) };
        log[key] = (log[key] || 0) + sec;
        return { ...s, studyLog: log };
      });
    },
    toggleTheme() {
      setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));
    },
  }), [state, hydrate, resetLocalState]);

  const value = useMemo(() => ({ ...api, authReady, syncStatus }), [api, authReady, syncStatus]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState outside provider");
  return ctx;
}