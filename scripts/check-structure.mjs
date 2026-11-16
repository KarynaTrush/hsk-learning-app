import fs from "fs";
import path from "path";

const SRC = "src";
const EXTENSIONS = [".js", ".jsx", ".json", ".css", ""];
const INDEXES = ["index.js", "index.jsx"];
const ENTRIES = new Set([path.join(SRC, "main.jsx")]);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(SRC).filter((f) => !f.endsWith(".DS_Store"));
const codeFiles = files.filter((f) => /\.(jsx?|mjs)$/.test(f));
const known = new Set(files);
const lower = new Map(files.map((f) => [f.toLowerCase(), f]));

const importRe = /(?:import\s+(?:[^'"]*?\s+from\s+)?|import\(|export\s+[^'"]*?\s+from\s+)["']([^"']+)["']/g;

const used = new Set();
const broken = [];
const caseProblems = [];

for (const file of codeFiles) {
  const text = fs.readFileSync(file, "utf8");
  let m;
  while ((m = importRe.exec(text))) {
    const spec = m[1];
    if (!spec.startsWith(".")) continue;
    const base = path.normalize(path.join(path.dirname(file), spec));
    const candidates = [
      ...EXTENSIONS.map((ext) => base + ext),
      ...INDEXES.map((idx) => path.join(base, idx)),
    ];
    const exact = candidates.find((c) => known.has(c));
    if (exact) {
      used.add(exact);
      continue;
    }
    const loose = candidates.map((c) => lower.get(c.toLowerCase())).find(Boolean);
    if (loose) {
      used.add(loose);
      caseProblems.push({ file, spec, actual: loose });
    } else {
      broken.push({ file, spec });
    }
  }
}

const unused = files.filter((f) => !used.has(f) && !ENTRIES.has(f) && /\.(jsx?|css)$/.test(f));
const dsStore = walk(".").filter((f) => f.endsWith(".DS_Store") && !f.includes("node_modules")).length;

console.log("=== Битые импорты (файл не найден) ===");
console.log(broken.length ? broken.map((b) => `${b.file}  ->  ${b.spec}`).join("\n") : "нет");
console.log("\n=== Неправильный регистр букв (сломается при публикации) ===");
console.log(caseProblems.length ? caseProblems.map((c) => `${c.file}  импортирует "${c.spec}", а файл называется ${c.actual}`).join("\n") : "нет");
console.log("\n=== Никем не используется (кандидаты на удаление) ===");
console.log(unused.length ? unused.join("\n") : "нет");
console.log(`\nФайлов .DS_Store в проекте: ${dsStore}`);