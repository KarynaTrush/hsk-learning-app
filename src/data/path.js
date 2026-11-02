const LEVEL_STYLE = {
  "0": { color: "#3C8D93", bgColor: "rgba(60,141,147,0.04)", borderColor: "rgba(60,141,147,0.2)" },
  "1": { color: "var(--accent)", bgColor: "rgba(79,121,66,0.04)", borderColor: "rgba(79,121,66,0.2)" },
  "2": { color: "var(--primary)", bgColor: "rgba(200,62,52,0.04)", borderColor: "rgba(200,62,52,0.15)" },
  "3": { color: "#D4A843", bgColor: "rgba(212,168,67,0.04)", borderColor: "rgba(212,168,67,0.18)" },
  "4": { color: "#2B6CB0", bgColor: "rgba(43,108,176,0.04)", borderColor: "rgba(43,108,176,0.18)" },
  "5": { color: "#6B46C1", bgColor: "rgba(107,70,193,0.04)", borderColor: "rgba(107,70,193,0.18)" },
  "6": { color: "#DD6B20", bgColor: "rgba(221,107,32,0.04)", borderColor: "rgba(221,107,32,0.18)" },
};

export const HSK_LEVELS = {};
for (const [k, v] of Object.entries(LEVEL_STYLE)) HSK_LEVELS[k] = { ...v, groups: [] };

export const PATH_NODES = [];

export function setPathData(nodes) {
  PATH_NODES.length = 0;
  PATH_NODES.push(...nodes);
  for (const k of Object.keys(HSK_LEVELS)) HSK_LEVELS[k].groups = [];

  const byLevel = {};
  for (const n of nodes) {
    const lvl = String(n.level);
    byLevel[lvl] = byLevel[lvl] || {};
    const pos = n.block.position;
    byLevel[lvl][pos] = byLevel[lvl][pos] || { position: pos, title: n.block.title, nodes: [] };
    byLevel[lvl][pos].nodes.push(n);
  }
  for (const [lvl, blocks] of Object.entries(byLevel)) {
    if (!HSK_LEVELS[lvl]) continue;
    HSK_LEVELS[lvl].groups = Object.values(blocks).sort((a, b) => a.position - b.position);
  }
}

export function nodeById(id) {
  return PATH_NODES.find((n) => n.id === id);
}

export function nextNodeId(id) {
  const index = PATH_NODES.findIndex((n) => n.id === id);
  if (index === -1) return PATH_NODES.length ? PATH_NODES[0].id : id;
  return PATH_NODES[index + 1]?.id ?? id;
}

export function nodesUpTo(maxId) {
  return PATH_NODES.filter((n) => n.id <= maxId).map((n) => n.id);
}

export function nodesBeforeLevel(level) {
  return PATH_NODES.filter((n) => n.level < level).map((n) => n.id);
}

export function firstNodeOfLevel(level) {
  const found = PATH_NODES.find((n) => n.level >= level);
  if (found) return found.id;
  return PATH_NODES.length ? PATH_NODES[PATH_NODES.length - 1].id : 1;
}

export function nodeTitle(node, lang) {
  return node?.title?.[lang] || node?.title?.ru || node?.title?.en || "";
}

export function blockTitle(block, lang) {
  return block?.title?.[lang] || block?.title?.ru || block?.title?.en || "";
}