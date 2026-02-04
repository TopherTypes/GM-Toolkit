import { matchesText, normalizeTag } from "../utils/strings.js";

// Simple search service for module-level and global search.
export const createSearchService = () => {
  let index = {
    global: [],
    party: [],
    npcs: [],
    creatures: [],
    encounters: [],
    locations: [],
    items: [],
    sessions: [],
    reviews: [],
  };

  const setIndex = (newIndex) => {
    index = newIndex || {
      global: [],
      party: [],
      npcs: [],
      creatures: [],
      encounters: [],
      locations: [],
      items: [],
      sessions: [],
      reviews: [],
    };
  };

  // Global search only matches names/titles and tags for predictable performance.
  const searchGlobal = (query) => {
    if (!query) return [];
    const normalized = String(query).toLowerCase();
    return index.global.filter((result) => {
      const haystack = [result.title, ...(result.tags || [])].join(" ");
      return matchesText(haystack, normalized);
    });
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

  return { setIndex, searchGlobal, searchNpcs, suggestTags };
};
