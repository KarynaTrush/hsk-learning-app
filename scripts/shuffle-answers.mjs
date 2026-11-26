import fs from "node:fs";
import path from "node:path";

const files = process.argv.slice(2);
if (!files.length) {
  console.log("Использование: node shuffle-answers.mjs data/curriculum/hsk1/u01.mjs ...");
  process.exit(1);
}

const STR = String.raw`"(?:[^"\\]|\\.)*"`;
const RE = new RegExp(String.raw`\[\s*(${STR}(?:\s*,\s*${STR})+)\s*,?\s*\]\s*,\s*(\d)(?!\d)`, "g");
const STR_RE = new RegExp(STR, "g");

const dist = {};
let total = 0;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const bak = file + ".bak";
  if (!fs.existsSync(bak)) fs.writeFileSync(bak, src);
  
  let n = 0;
  const out = src.replace(RE, (whole, body, idx) => {
    const opts = body.match(STR_RE);
    const i = Number(idx);
    if (!opts || opts.length < 2 || i >= opts.length) return whole;
    
    // Запоминаем правильный текстовый ответ
    const right = opts[i];
    // Оставляем остальные варианты
    const rest = opts.filter((_, k) => k !== i);
    
    // Честно перемешиваем массив вариантов через Math.random()
    for (let k = rest.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [rest[k], rest[j]] = [rest[j], rest[k]];
    }
    
    // Случайным образом выбираем новую позицию для правильного ответа (от 0 до rest.length)
    const target = Math.floor(Math.random() * (rest.length + 1));
    rest.splice(target, 0, right);
    
    n++;
    dist[target] = (dist[target] || 0) + 1;
    return `[${rest.join(", ")}], ${target}`;
  });
  
  fs.writeFileSync(file, out);
  console.log(`${file}: перемешано ${n}`);
  total += n;
}

console.log("Позиции верного ответа:", dist, "всего:", total);