export const T = (ru, pl, en) => ({ ru, pl: pl || ru, en: en || ru });

export const fact = (emoji, title, text) => ({ kind: "fact", payload: { emoji, title, text } });

export const w = (hanzi, pinyin, m, emoji, ex) => ({
  hanzi,
  pinyin,
  m,
  ...(emoji ? { emoji } : {}),
  ...(ex ? { ex: { zh: ex[0], py: ex[1], m: ex[2] } } : {}),
});
export const words = (items, title) => ({ kind: "words", payload: { ...(title ? { title } : {}), items } });

export const match = (pairs, title) => ({ kind: "game", payload: { type: "match", ...(title ? { title } : {}), pairs } });
export const listen = (items, title, big = false) => ({
  kind: "game",
  payload: { type: "listen", ...(big ? { big: true } : {}), ...(title ? { title } : {}), items: items.map(([say, options, correct, explain]) => ({ say, options, correct, ...(explain ? { explain } : {}) })) },
});
export const emojiPick = (items, title, big = true) => ({
  kind: "game",
  payload: { type: "emoji", ...(big ? { big: true } : {}), ...(title ? { title } : {}), items: items.map(([emoji, options, correct, explain]) => ({ emoji, options, correct, ...(explain ? { explain } : {}) })) },
});
export const build = (items, title) => ({
  kind: "game",
  payload: { type: "build", ...(title ? { title } : {}), items: items.map(([target, answer, hint, explain]) => ({ ...(target ? { target } : {}), answer, hint, ...(explain ? { explain } : {}) })) },
});

export const p = (text) => ({ t: "p", text });
export const tip = (text) => ({ t: "tip", text });
export const ex = (zh, py, m, say) => ({ t: "ex", zh, py, m, ...(say ? { say } : {}) });
export const chart = (cols, cells) => ({ t: "chart", cols, cells });
export const table = (head, rows) => ({ t: "table", head, rows });
export const theory = (title, ...blocks) => ({ kind: "theory", payload: { title, blocks } });

export const q = (question, options, correct, explain, extra = {}) => ({ q: question, options, correct, ...(explain ? { explain } : {}), ...extra });
export const tf = (statement, truth, explain) => ({ q: statement, tf: truth, ...(explain ? { explain } : {}) });
export const short = (question, accept, explain) => ({ type: "short", q: question, accept, ...(explain ? { explain } : {}) });
export const quiz = (qs, title) => ({ kind: "quiz", payload: { ...(title ? { title } : {}), qs } });

export const text = (title, lines, qs) => ({
  kind: "text",
  payload: { title, lines: lines.map(([zh, py, m]) => ({ zh, py, m })), qs },
});

export const recall = ({ words: wordList, tf: tfList = [], sentences = [], extraMeanings = [], extraHanzi = [] }) => ({
  kind: "recall",
  payload: {
    words: wordList,
    ...(tfList.length ? { tf: tfList.map(([zh, py, m, ok, explain]) => ({ zh, py, m, ok, ...(explain ? { explain } : {}) })) } : {}),
    ...(sentences.length ? { sentences: sentences.map(([zh, tokens, m]) => ({ zh, tokens, m })) } : {}),
    ...(extraMeanings.length ? { extraMeanings } : {}),
    ...(extraHanzi.length ? { extraHanzi } : {}),
  },
});

export const lesson = ({ slug, position, icon, block, title, slides }) => ({ slug, position, icon, block, title, slides });
