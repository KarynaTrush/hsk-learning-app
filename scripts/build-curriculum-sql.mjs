import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const ARG = process.argv.slice(2);
const target = ARG.find((a) => !a.startsWith("--"));
const chunkArg = ARG.find((a) => a.startsWith("--chunk="));
const CHUNK = chunkArg ? Number(chunkArg.split("=")[1]) : 8;
const KINDS = new Set(["fact", "words", "game", "theory", "quiz", "text", "recall", "write"]);
const GAMES = new Set(["match", "listen", "emoji", "build", "tone_visualizer", "bughunt", "radical_puzzle", "radical_build", "chatsim"]);
const BLOCKS = new Set(["p", "tip", "ex", "chart", "table"]);
const PUNCT = new Set("，。！？、：；“”‘’（）,.!?:;()\" ".split(""));

if (!target) {
  console.log("Использование: node scripts/build-curriculum-sql.mjs hsk0 [--chunk=8]\nФайл урока берётся из data/curriculum/<название>.mjs");
  process.exit(1);
}

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const unique = (arr) => new Set(arr).size === arr.length;

const module = await import(pathToFileURL(path.resolve(`data/curriculum/${target}.mjs`)).href);
const { level, replaceLevel, lessons } = module.default;

const wordLevels = new Map();
if (fs.existsSync("data/words.csv")) {
  for (const line of fs.readFileSync("data/words.csv", "utf8").split(/\r?\n/).slice(1)) {
    const m = line.match(/^([^,]+),([^,]+),(\d),/);
    if (m) {
      if (!wordLevels.has(m[1])) wordLevels.set(m[1], new Set());
      wordLevels.get(m[1]).add(Number(m[3]));
    }
  }
}

function checkQuestion(where, x) {
  if (x.tf !== undefined) {
    if (typeof x.tf !== "boolean" || !x.q) err(where, "вопрос «верно/неверно» без текста или без значения tf");
    return;
  }
  if (x.type === "short") {
    if (!x.q || !Array.isArray(x.accept) || !x.accept.length) err(where, "короткий ответ: нужен вопрос и список допустимых ответов");
    return;
  }
  if (!x.q && !x.big && !x.emoji && !x.say) err(where, "у вопроса нет ни текста, ни картинки, ни звука");
  if (!Array.isArray(x.options) || x.options.length < 2) return err(where, "нужно минимум два варианта ответа");
  if (!unique(x.options)) err(where, `варианты ответа повторяются: ${x.options.join(" | ")}`);
  if (!Number.isInteger(x.correct) || x.correct < 0 || x.correct >= x.options.length) err(where, `номер верного ответа ${x.correct} вне диапазона`);
}

function checkSlide(where, s) {
  if (!KINDS.has(s.kind)) return err(where, `неизвестный тип слайда «${s.kind}»`);
  const pl = s.payload;
  if (!pl) return err(where, "нет содержимого слайда");
  if (s.kind === "fact") {
    if (!pl.emoji || !pl.title || !pl.text) err(where, "факт: нужны emoji, заголовок и текст");
  }
  if (s.kind === "words") {
    if (!pl.items?.length) err(where, "слова: пустой список");
    for (const it of pl.items || []) if (!it.hanzi || !it.pinyin || !it.m) err(where, `слово без иероглифа, пиньиня или значения: ${JSON.stringify(it)}`);
  }
if (s.kind === "game") {
    if (!GAMES.has(pl.type)) return err(where, `неизвестная игра «${pl.type}»`);
    if (pl.type === "match") {
      if (!pl.pairs || pl.pairs.length < 2) err(where, "пары: нужно минимум две");
      else {
        if (!unique(pl.pairs.map((x) => x[0]))) err(where, "в парах повторяются элементы слева");
        if (!unique(pl.pairs.map((x) => x[1]))) err(where, "в парах повторяются элементы справа");
      }
    } else if (pl.type === "build") {
      for (const it of pl.items || []) if (!Array.isArray(it.answer) || it.answer.length < 2) err(where, "сборка: нужен ответ из минимум двух частей");
    } else if (pl.type === "chatsim") {
      if (!pl.messages || !pl.messages.length) err(where, "WeChat чат без сообщений");
    } else if (pl.type === "radical_puzzle") {
      if (!pl.hanzi || !pl.correctRadicals) err(where, "пазл иероглифа: нет знака или радикалов");
    } else if (pl.type === "radical_build") {
      if (!pl.items || !pl.items.length) err(where, "сборка из радикалов без заданий");
    } else if (pl.type === "bughunt") {
      if (!pl.cases || !pl.cases.length) err(where, "детектив ошибок без кейсов");
      for (const c of pl.cases || []) {
        if (!Array.isArray(c.options) || c.options.length < 2) err(where, "детектив: нужно минимум два варианта ответа");
        if (!Number.isInteger(c.correct) || c.correct < 0 || c.correct >= c.options.length) err(where, `детектив: номер верного ответа вне диапазона`);
      }
    } else if (pl.type === "tone_visualizer") {
    } else {
      for (const it of pl.items || []) checkQuestion(where, it);
      if (!pl.items?.length) err(where, "игра без заданий");
    }
  }

  if (s.kind === "theory") {
    if (!pl.blocks?.length) err(where, "теория без блоков");
    for (const b of pl.blocks || []) {
      if (!BLOCKS.has(b.t)) err(where, `неизвестный блок «${b.t}»`);
      if (b.t === "table") for (const r of b.rows) if (r.length !== b.head.length) err(where, `в таблице строка из ${r.length} ячеек при ${b.head.length} заголовках: ${r.join(" | ")}`);
      if (b.t === "chart") for (const c of b.cells) if (!c[0]) err(where, "в таблице-схеме пустая ячейка");
    }
  }
  if (s.kind === "quiz" || s.kind === "text") {
    if (!pl.qs?.length) err(where, "нет вопросов");
    for (const x of pl.qs || []) checkQuestion(where, x);
    if (s.kind === "text" && !pl.lines?.length) err(where, "текст без строк");
  }
  if (s.kind === "recall") {
    if ((pl.words || []).length < 4) err(where, "проверка слов: нужно минимум 4 слова");
    for (const sen of pl.sentences || []) {
      const stripped = [...sen.zh].filter((c) => !PUNCT.has(c)).join("");
      if (sen.tokens.join("") !== stripped) err(where, `слова предложения «${sen.zh}» не складываются в него: ${sen.tokens.join("")}`);
    }
  }
}

const slugs = new Set();
const positions = new Set();
const blockNames = new Map();
let slideCount = 0;
const linkByLesson = new Map();

for (const l of lessons) {
  const where = `урок ${l.slug}`;
  if (!l.slug || slugs.has(l.slug)) err(where, "slug пустой или повторяется");
  slugs.add(l.slug);
  if (positions.has(l.position)) err(where, `позиция ${l.position} повторяется`);
  positions.add(l.position);
  if ([...String(l.icon || "")].length !== 1) err(where, "icon должен быть одним символом");
  if (!l.title?.ru) err(where, "нет названия");
  const [bp, bt] = l.block || [];
  if (!bp || !bt?.ru) err(where, "не указан блок");
  else if (blockNames.has(bp) && blockNames.get(bp) !== bt.ru) err(where, `блок ${bp} назван по-разному: «${blockNames.get(bp)}» и «${bt.ru}»`);
  else blockNames.set(bp, bt.ru);
  if (!l.slides?.length) err(where, "нет слайдов");
  const linked = new Map();
  l.slides.forEach((s, i) => {
    checkSlide(`${where}, слайд ${i + 1} (${s.kind})`, s);
    slideCount++;
    const list = s.kind === "words" ? s.payload.items : s.kind === "recall" ? s.payload.words : [];
    for (const it of list || []) {
      const found = wordLevels.get(it.hanzi);
      if (!found) continue;
      const lv = [...found].filter((x) => x <= Math.max(level, 1)).sort((a, b) => b - a)[0];
      if (lv && level >= 1) linked.set(it.hanzi, lv);
    }
  });
  linkByLesson.set(l.slug, linked);
}

const FORCE = ARG.includes("--force");
const isStub = (l) => l.slides.length === 1 && l.slides[0].kind === "fact" && /Шаблон/.test(l.slides[0].payload?.text || "");
const stubCount = lessons.filter(isStub).length;
if (replaceLevel && stubCount > 0 && !FORCE) {
  err(`уровень ${target}`, `${stubCount} из ${lessons.length} уроков состоят из заглушки «Шаблон…». Сборка остановлена, чтобы не удалить настоящие уроки. Заполните уроки или добавьте --force`);
}

if (errors.length) {
  console.log("ОШИБКИ (SQL не создан):\n" + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}

fs.mkdirSync("data/generated", { recursive: true });
const parts = [];
for (let i = 0; i < lessons.length; i += CHUNK) parts.push(lessons.slice(i, i + CHUNK));

parts.forEach((chunk, idx) => {
  const out = [];
  const chunkSlugs = chunk.map((l) => q(l.slug)).join(", ");
  if (idx === 0 && replaceLevel) out.push(`delete from public.lessons where hsk_level = ${level};`);
  out.push(`delete from public.lessons where slug in (${chunkSlugs});`, "");
  out.push("insert into public.lessons (slug, hsk_level, position, icon, title_ru, title_pl, title_en, block_position, block_ru, block_pl, block_en) values");
  out.push(
    chunk
      .map((l) => `  (${[q(l.slug), level, l.position, q(l.icon), q(l.title.ru), q(l.title.pl), q(l.title.en), l.block[0], q(l.block[1].ru), q(l.block[1].pl), q(l.block[1].en)].join(", ")})`)
      .join(",\n") + ";",
    ""
  );
  const rows = [];
  for (const l of chunk) l.slides.forEach((s, i) => rows.push(`  (${q(l.slug)}, ${i + 1}, ${q(s.kind)}, ${q(JSON.stringify(s.payload))})`));
  out.push("insert into public.lesson_slides (lesson_id, position, kind, payload)", "select l.id, v.pos, v.kind, v.payload::jsonb", "from (values", rows.join(",\n"), ") as v(slug, pos, kind, payload)", "join public.lessons l on l.slug = v.slug;", "");
  const wordRows = [];
  for (const l of chunk) {
    let pos = 1;
    for (const [hanzi, lv] of linkByLesson.get(l.slug)) wordRows.push(`  (${q(l.slug)}, ${q(hanzi)}, ${pos++}, ${lv})`);
  }
  if (wordRows.length) {
    out.push("insert into public.lesson_words (lesson_id, word_id, position)", "select l.id, w.id, v.pos", "from (values", wordRows.join(",\n"), ") as v(slug, hanzi, pos, wlevel)", "join public.lessons l on l.slug = v.slug", "join public.words w on w.hanzi = v.hanzi and w.hsk_level = v.wlevel;", "");
  }
  out.push(`select l.slug, (select count(*) from public.lesson_slides s where s.lesson_id = l.id) as slides, (select count(*) from public.lesson_words w where w.lesson_id = l.id) as words from public.lessons l where l.slug in (${chunkSlugs}) order by l.position;`);
  const file = `data/generated/curriculum_${target}_part${idx + 1}.sql`;
  fs.writeFileSync(file, out.join("\n") + "\n");
  console.log(`${file}: уроков ${chunk.length}, ${Math.round(fs.statSync(file).size / 1024)} КБ`);
});

console.log(`\nГотово. Уроков: ${lessons.length}, слайдов: ${slideCount}, блоков: ${blockNames.size}, частей SQL: ${parts.length}.`);
if (replaceLevel) console.log(`Внимание: первая часть удаляет ВСЕ старые уроки уровня HSK ${level}.`);
if (warnings.length) console.log("\nПредупреждения:\n" + warnings.map((w) => "  - " + w).join("\n"));
console.log("\nДальше: по очереди запустите файлы part1, part2, ... в Supabase → SQL Editor.");
