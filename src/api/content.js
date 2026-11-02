import i18n from "../i18n";
import { supabase } from "./supabase";
import { buildContent } from "../data/buildContent";
import { setVocab } from "../data/vocab";
import { setPathData } from "../data/path";
import { setStories } from "../data/stories";
import { setGrammar } from "../data/grammar";
import { setDictionary } from "../data/dictionary";

const CACHE_KEY = "xinna_content_v4";
const CACHE_TTL_MS = import.meta.env.DEV ? 5 * 60 * 1000 : 6 * 60 * 60 * 1000;
const LANGS = ["ru", "pl", "en"];
async function fetchAll(build) {
  const out = [];
  const size = 1000;
  for (let from = 0; ; from += size) {
    const { data, error } = await build().range(from, from + size - 1);
    if (error) throw error;
    out.push(...data);
    if (data.length < size) break;
  }
  return out;
}

async function fetchRaw() {
  if (!supabase) throw new Error("Supabase не настроен (.env.local)");
  const [lessons, lessonWords, texts, sentences, textVocab, lessonNotes, lessonSentences, lessonQuiz, grammar, dictionary] = await Promise.all([
    fetchAll(() => supabase.from("lessons").select("*").order("hsk_level").order("position")),
    fetchAll(() =>
      supabase
        .from("lesson_words")
        .select("lesson_id, position, words(id, hanzi, pinyin, hsk_level, meaning_en, meaning_ru, meaning_pl)")
        .order("lesson_id")
        .order("position")
    ),
    fetchAll(() => supabase.from("texts").select("*").order("id")),
    fetchAll(() => supabase.from("text_sentences").select("*").order("text_id").order("position")),
    fetchAll(() => supabase.from("text_vocab").select("*").order("text_id").order("position")),
    fetchAll(() => supabase.from("lesson_notes").select("*").order("lesson_id").order("position")),
    fetchAll(() => supabase.from("lesson_sentences").select("*").order("lesson_id").order("position")),
    fetchAll(() => supabase.from("lesson_quiz").select("*").order("lesson_id").order("position")),
    fetchAll(() => supabase.from("grammar_points").select("*").order("hsk_level").order("position")).catch(() => []),
    fetchAll(() =>
      supabase.from("words").select("hanzi, pinyin, hsk_level, meaning_en, meaning_ru, meaning_pl").order("id")
    ).catch(() => []),
  ]);
  return { lessons, lessonWords, texts, sentences, textVocab, lessonNotes, lessonSentences, lessonQuiz, grammar, dictionary };
}

function readCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY));
    return parsed && parsed.raw ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(raw) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), raw }));
  } catch {
    /* кэш не обязателен */
  }
}
function registerTranslations({ nodes, vocab, stories }) {
  const add = (lng, key, value) => i18n.addResource(lng, "translation", key, value);
  for (const lng of LANGS) {
    for (const n of nodes) {
      add(lng, `pathNodes.${n.nodeKey}.label`, n.title[lng] || n.title.ru);
      if (!i18n.getResource(lng, "translation", `pathNodes.${n.nodeKey}.sub`)) {
        add(lng, `pathNodes.${n.nodeKey}.sub`, n.block.title[lng] || "");
      }
    }
    for (const w of vocab) {
      add(lng, `meanings.${w.hanzi}`, w.meaning[lng] || w.meaning.ru || w.meaning.en);
      const exKey = `examples.${w.hanzi}`;
      if (i18n.getResource(lng, "translation", exKey) === undefined) add(lng, exKey, "");
    }
    for (const s of stories) {
      if (s.cultureKey && s.culture[lng]) add(lng, s.cultureKey, s.culture[lng]);
    }
  }
}

function applyRaw(raw) {
  const content = buildContent(raw);
  setVocab(content.vocab);
  setPathData(content.nodes);
  setStories(content.stories);
  setGrammar(content.grammar);
  setDictionary(content.dictionary);
  registerTranslations(content);
}

export async function loadContent() {
  const cached = readCache();
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    applyRaw(cached.raw);
    return;
  }
  try {
    const raw = await fetchRaw();
    writeCache(raw);
    applyRaw(raw);
  } catch (e) {
    if (cached) {
      console.warn("Не удалось обновить контент, используем кэш:", e);
      applyRaw(cached.raw);
      return;
    }
    throw e;
  }
}