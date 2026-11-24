export function shuffle(list, rng = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function normalizeAnswer(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFC")
    .replace(/[\s.,!?;:'"«»“”()\-–—。，！？、：；]/g, "");
}

export function matchesShort(input, accept) {
  const value = normalizeAnswer(input);
  if (!value) return false;
  return (accept || []).some((a) => normalizeAnswer(a) === value);
}

function distinctOthers(pool, exclude, count, rng) {
  const seen = new Set(exclude);
  const out = [];
  for (const item of shuffle(pool, rng)) {
    if (!item || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
    if (out.length === count) break;
  }
  return out;
}

export function buildRecallQuestions(payload, texts, rng = Math.random) {
  const words = payload.words || [];
  const meaningPool = [...words.map((w) => w.m), ...(payload.extraMeanings || [])];
  const hanziPool = [...words.map((w) => w.hanzi), ...(payload.extraHanzi || [])];
  const questions = [];

  shuffle(words, rng)
    .slice(0, 6)
    .forEach((w, i) => {
      if (i % 2 === 0) {
        const wrong = distinctOthers(meaningPool, [w.m], 3, rng);
        if (wrong.length >= 2) {
          const options = shuffle([w.m, ...wrong], rng);
          questions.push({ q: texts.whatMeans, big: w.hanzi, say: w.hanzi, options, correct: options.indexOf(w.m), wordRef: w.hanzi });
          return;
        }
      }
      const wrong = distinctOthers(hanziPool, [w.hanzi], 3, rng);
      if (wrong.length >= 2) {
        const options = shuffle([w.hanzi, ...wrong], rng);
        questions.push({ q: `${texts.whichWord} ${w.m}`, options, optionsBig: true, correct: options.indexOf(w.hanzi), wordRef: w.hanzi });
      }
    });

  const truth = (payload.tf || []).map((s) => ({ q: `${s.zh}${s.py ? `  (${s.py})` : ""}\n${texts.isTranslation} «${s.m}»`, say: s.zh, tf: Boolean(s.ok), explain: s.explain }));
  const builds = (payload.sentences || []).map((s) => ({ hint: s.m, say: s.zh, answer: s.tokens, tiles: shuffle(s.tokens, rng), zh: s.zh }));
  return { words: questions, truth, builds };
}

export function normalizeQuestion(q, texts) {
  if (q.type === "short") return q;
  if (q.tf !== undefined) return { ...q, options: [texts.true, texts.false], correct: q.tf ? 0 : 1 };
  return q;
}
