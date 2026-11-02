export const DICT = new Map();

export function setDictionary(list) {
  DICT.clear();
  for (const entry of list) DICT.set(entry.hanzi, entry);
}

export function lookupWord(hanzi) {
  return DICT.get(hanzi);
}