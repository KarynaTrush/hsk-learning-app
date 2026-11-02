import { EXAMPLES } from "./examples.js";
import { REQUIRED_OVERRIDES } from "./stories.js";

const LANGS = ["ru", "pl", "en"];

function slugKey(slug) {
  return slug.replace(/^hsk\d+-/, "");
}

export function buildContent(raw) {
  const lessons = [...raw.lessons].sort((a, b) => a.hsk_level - b.hsk_level || a.position - b.position);
  const groupBy = (rows) => {
    const map = new Map();
    for (const r of rows || []) {
      if (!map.has(r.lesson_id)) map.set(r.lesson_id, []);
      map.get(r.lesson_id).push(r);
    }
    for (const list of map.values()) list.sort((a, b) => a.position - b.position);
    return map;
  };
  const notesByLesson = groupBy(raw.lessonNotes);
  const sentencesByLesson = groupBy(raw.lessonSentences);
  const quizByLesson = groupBy(raw.lessonQuiz);

  const wordsByLesson = new Map();
  for (const row of raw.lessonWords) {
    if (!row.words) continue;
    if (!wordsByLesson.has(row.lesson_id)) wordsByLesson.set(row.lesson_id, []);
    wordsByLesson.get(row.lesson_id).push(row);
  }

  const nodes = [];
  const vocabMap = new Map(); // hanzi -> слово (слова с двумя чтениями объединяем)

  lessons.forEach((l, i) => {
    const nodeId = l.hsk_level * 100 + l.position;
    const key = slugKey(l.slug);
    const rows = (wordsByLesson.get(l.id) || []).sort((a, b) => a.position - b.position);

    for (const { words: w } of rows) {
      const meaning = {
        ru: w.meaning_ru || w.meaning_en || "",
        pl: w.meaning_pl || w.meaning_en || "",
        en: w.meaning_en || "",
      };
      const prev = vocabMap.get(w.hanzi);
      if (prev && !prev.nodeIds.includes(nodeId)) {
        prev.nodeIds.push(nodeId);
      } else if (prev) {
        if (!prev.pinyin.split(" / ").includes(w.pinyin)) prev.pinyin = `${prev.pinyin} / ${w.pinyin}`;
        for (const lang of LANGS) {
          if (meaning[lang] && !prev.meaning[lang].includes(meaning[lang])) {
            prev.meaning[lang] = prev.meaning[lang] ? `${prev.meaning[lang]}; ${meaning[lang]}` : meaning[lang];
          }
        }
      } else {
        vocabMap.set(w.hanzi, {
          id: w.id,
          hanzi: w.hanzi,
          pinyin: w.pinyin,
          hsk: w.hsk_level,
          category: key,
          nodeId,
          nodeIds: [nodeId],
          example: EXAMPLES[w.hanzi],
          meaning,
        });
      }
    }

    nodes.push({
      id: nodeId,
      lessonId: l.id,
      slug: l.slug,
      nodeKey: key,
      level: l.hsk_level,
      hanzi: l.icon || "字",
      category: key,
      title: { ru: l.title_ru, pl: l.title_pl, en: l.title_en },
      block: {
        position: l.block_position || 1,
        title: {
          ru: l.block_ru || `Блок ${l.block_position || 1}`,
          pl: l.block_pl || `Blok ${l.block_position || 1}`,
          en: l.block_en || `Block ${l.block_position || 1}`,
        },
      },
      wordCount: new Set(rows.map((r) => r.words.hanzi)).size,
      wordHanzi: [...new Set(rows.map((r) => r.words.hanzi))],
      notes: (notesByLesson.get(l.id) || []).map((n) => ({
        id: n.id,
        position: n.position,
        kind: n.kind,
        title: { ru: n.title_ru, pl: n.title_pl, en: n.title_en },
        body: { ru: n.body_ru, pl: n.body_pl, en: n.body_en },
        examples: n.examples || [],
      })),
      sentences: (sentencesByLesson.get(l.id) || []).map((s) => ({
        id: s.id,
        position: s.position,
        zh: s.zh,
        pinyin: s.pinyin,
        tokens: s.tokens || [],
        blankIndex: s.blank_index,
        tr: { ru: s.ru, pl: s.pl, en: s.en },
      })),
      quiz: (quizByLesson.get(l.id) || []).map((z) => ({
        id: z.id,
        position: z.position,
        prompt: { ru: z.prompt_ru, pl: z.prompt_pl, en: z.prompt_en },
        audio: z.audio,
        skill: z.skill,
        options: z.options || [],
        correct: z.correct,
        explain: { ru: z.explain_ru, pl: z.explain_pl, en: z.explain_en },
      })),
    });
  });
  const sentencesByText = new Map();
  for (const s of raw.sentences) {
    if (!sentencesByText.has(s.text_id)) sentencesByText.set(s.text_id, []);
    sentencesByText.get(s.text_id).push(s);
  }
  const vocabByText = new Map();
  for (const v of raw.textVocab) {
    if (!vocabByText.has(v.text_id)) vocabByText.set(v.text_id, []);
    vocabByText.get(v.text_id).push(v);
  }

  const stories = [...raw.texts]
    .sort((a, b) => a.id - b.id)
    .map((t) => {
      const sentences = (sentencesByText.get(t.id) || []).sort((a, b) => a.position - b.position);
      const vocab = (vocabByText.get(t.id) || []).sort((a, b) => a.position - b.position);
      const hasCulture = Boolean(t.culture_ru || t.culture_pl || t.culture_en);
      return {
        id: t.slug,
        hsk: t.hsk_level,
        category: t.topic,
        topic: t.topic,
        minutes: t.minutes,
        titleZh: t.title_zh,
        title: { ru: t.title_ru, pl: t.title_pl, en: t.title_en },
        summary: { ru: t.summary_ru, pl: t.summary_pl, en: t.summary_en },
        culture: { ru: t.culture_ru, pl: t.culture_pl, en: t.culture_en },
        cultureKey: hasCulture ? `storiesDb.${t.slug}.culture` : undefined,
        body: sentences.map((s) => s.zh).join(""),
        sentences: sentences.map((s) => ({ zh: s.zh, py: s.pinyin })),
        vocab: vocab.map((v) => ({
          zh: v.zh,
          py: v.pinyin,
          m: { ru: v.meaning_ru, pl: v.meaning_pl, en: v.meaning_en },
        })),
        required: REQUIRED_OVERRIDES[t.slug] || [],
      };
    });

  const grammar = [...(raw.grammar || [])]
    .sort((a, b) => a.hsk_level - b.hsk_level || a.position - b.position)
    .map((g) => ({
      id: g.id,
      level: g.hsk_level,
      position: g.position,
      pattern: g.pattern,
      title: { ru: g.title_ru, pl: g.title_pl, en: g.title_en },
      body: { ru: g.body_ru, pl: g.body_pl, en: g.body_en },
      examples: g.examples || [],
    }));

  const dictMap = new Map();
  for (const w of raw.dictionary || []) {
    const meaning = {
      ru: w.meaning_ru || w.meaning_en || "",
      pl: w.meaning_pl || w.meaning_en || "",
      en: w.meaning_en || "",
    };
    const prev = dictMap.get(w.hanzi);
    if (!prev) {
      dictMap.set(w.hanzi, { hanzi: w.hanzi, pinyin: w.pinyin, hsk: w.hsk_level, meaning });
    } else {
      if (!prev.pinyin.split(" / ").includes(w.pinyin)) prev.pinyin = `${prev.pinyin} / ${w.pinyin}`;
      for (const lang of LANGS) {
        if (meaning[lang] && !prev.meaning[lang].includes(meaning[lang])) {
          prev.meaning[lang] = prev.meaning[lang] ? `${prev.meaning[lang]}; ${meaning[lang]}` : meaning[lang];
        }
      }
    }
  }

  return { nodes, vocab: [...vocabMap.values()], stories, grammar, dictionary: [...dictMap.values()] };
}