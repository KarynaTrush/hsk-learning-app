const CJK = /[\u4e00-\u9fff]/;

export function isCjk(ch) {
  return CJK.test(ch);
}

export function segment(text, lookup, maxLen = 5) {
  const chars = [...text];
  const tokens = [];
  let i = 0;
  while (i < chars.length) {
    if (!isCjk(chars[i])) {
      tokens.push({ text: chars[i], entry: null, punct: true });
      i += 1;
      continue;
    }
    let matched = false;
    for (let len = Math.min(maxLen, chars.length - i); len >= 1; len--) {
      const piece = chars.slice(i, i + len).join("");
      if (!/^[\u4e00-\u9fff]+$/.test(piece)) continue;
      const entry = lookup(piece);
      if (entry) {
        tokens.push({ text: piece, entry, punct: false });
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ text: chars[i], entry: null, punct: false });
      i += 1;
    }
  }
  return tokens;
}

export function entryMeaning(entry, lang) {
  return entry?.meaning?.[lang] || entry?.meaning?.ru || entry?.meaning?.en || "";
}