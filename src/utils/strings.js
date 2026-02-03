// String helpers for tags and comparisons.
export const normalizeTag = (tag) => String(tag || "").trim().toLowerCase();

export const normalizeTags = (tags = []) =>
  Array.from(new Set(tags.map(normalizeTag).filter(Boolean)));

export const matchesText = (value, query) =>
  String(value || "").toLowerCase().includes(String(query || "").toLowerCase());
