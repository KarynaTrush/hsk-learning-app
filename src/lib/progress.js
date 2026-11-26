import { PATH_NODES } from "../data/path";

export const NODE_SCALE = 1000;
export const NODE_SCHEME = 2;

export function migrateNodeId(id) {
  if (!Number.isInteger(id) || id < 1) return id;
  const level = Math.floor((id - 1) / 100);
  return level * NODE_SCALE + (id - level * 100);
}

export function migrateProgress(saved) {
  if (!saved || typeof saved !== "object" || saved.nodeScheme === NODE_SCHEME) return saved;
  const next = { ...saved, nodeScheme: NODE_SCHEME };
  if (Array.isArray(saved.completedNodeIds)) {
    next.completedNodeIds = [...new Set(saved.completedNodeIds.map(migrateNodeId))];
  }
  if (saved.activeNodeId !== undefined) next.activeNodeId = migrateNodeId(saved.activeNodeId);
  return next;
}

function toSet(completed) {
  return completed instanceof Set ? completed : new Set(completed || []);
}

export function frontierIndex(completed) {
  const set = toSet(completed);
  const index = PATH_NODES.findIndex((n) => !set.has(n.id));
  return index === -1 ? Math.max(0, PATH_NODES.length - 1) : index;
}

export function frontierNodeId(completed) {
  return PATH_NODES.length ? PATH_NODES[frontierIndex(completed)].id : 1;
}

export function frontierLevel(completed) {
  return PATH_NODES.length ? PATH_NODES[frontierIndex(completed)].level : null;
}

export function learnerLevel(state) {
  return Math.max(1, state?.hskLevel || 0, frontierLevel(state?.completedNodeIds) ?? 0);
}
