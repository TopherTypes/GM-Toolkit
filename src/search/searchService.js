import { matchesText, normalizeTag } from "../utils/strings.js";

// Simple search service for module-level and global search.
export const createSearchService = () => {
  let index = { npcs: [], creatures: [], encounters: [], locations: [], items: [], sessions: [] };

  const setIndex = (newIndex) => {
    index = newIndex || { npcs: [], creatures: [], encounters: [], locations: [], items: [], sessions: [] };
  };

  const searchNpcs = (query) => {
    if (!query) return index.npcs;
    const normalized = String(query).toLowerCase();
    return index.npcs.filter((npc) => {
      const haystack = [npc.name, npc.notes, ...(npc.tags || [])].join(" ");
      return matchesText(haystack, normalized);
    });
  };

  // Suggest tags across one or more module scopes.
  const suggestTags = ({ scopes } = {}) => {
    const tagSet = new Set();
    const targets = scopes?.length
      ? scopes
      : ["npcs", "creatures", "encounters", "locations", "items", "sessions"];
    targets.forEach((scope) => {
      (index[scope] || []).forEach((doc) => {
        (doc.tags || []).forEach((tag) => tagSet.add(normalizeTag(tag)));
      });
    });
    return Array.from(tagSet).filter(Boolean);
  };

  return { setIndex, searchNpcs, suggestTags };
};
