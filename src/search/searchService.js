import { matchesText, normalizeTag } from "../utils/strings.js";

// Simple search service for module-level and global search.
export const createSearchService = () => {
  let index = { npcs: [] };

  const setIndex = (newIndex) => {
    index = newIndex || { npcs: [] };
  };

  const searchNpcs = (query) => {
    if (!query) return index.npcs;
    const normalized = String(query).toLowerCase();
    return index.npcs.filter((npc) => {
      const haystack = [npc.name, npc.notes, ...(npc.tags || [])].join(" ");
      return matchesText(haystack, normalized);
    });
  };

  const suggestTags = () => {
    const tags = new Set();
    index.npcs.forEach((npc) => {
      (npc.tags || []).forEach((tag) => tags.add(normalizeTag(tag)));
    });
    return Array.from(tags).filter(Boolean);
  };

  return { setIndex, searchNpcs, suggestTags };
};
