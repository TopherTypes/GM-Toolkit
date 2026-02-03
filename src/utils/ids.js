// ID helpers for GM-Toolkit entities.
export const createId = (prefix = "id") => {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }
  const randomPart = Math.random().toString(36).slice(2, 10);
  const timePart = Date.now().toString(36);
  return `${prefix}_${timePart}_${randomPart}`;
};
