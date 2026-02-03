import { normalizeTag } from "../utils/strings.js";

// Build a basic search index for the current campaign.
export const buildIndex = (campaign) => {
  if (!campaign) {
    return { npcs: [] };
  }

  const npcDocs = Object.values(campaign.npcs || {}).map((npc) => ({
    id: npc.id,
    name: npc.name,
    tags: (npc.tags || []).map(normalizeTag),
    notes: npc.notes || "",
    isArchived: npc.isArchived || false,
  }));

  return { npcs: npcDocs };
};
