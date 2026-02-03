import { normalizeTag } from "../utils/strings.js";

// Build a basic search index for the current campaign.
export const buildIndex = (campaign) => {
  if (!campaign) {
    return { npcs: [], creatures: [], encounters: [], sessions: [] };
  }

  const npcDocs = Object.values(campaign.npcs || {}).map((npc) => ({
    id: npc.id,
    name: npc.name,
    tags: (npc.tags || []).map(normalizeTag),
    notes: npc.notes || "",
    isArchived: npc.isArchived || false,
  }));

  const creatureDocs = Object.values(campaign.creatures || {}).map((creature) => ({
    id: creature.id,
    name: creature.name,
    type: creature.type || "",
    tags: (creature.tags || []).map(normalizeTag),
    isArchived: creature.isArchived || false,
  }));

  const encounterDocs = Object.values(campaign.encounters || {}).map((encounter) => ({
    id: encounter.id,
    title: encounter.title,
    mapRef: encounter.mapRef || "",
    tags: (encounter.tags || []).map(normalizeTag),
    isArchived: encounter.isArchived || false,
  }));

  const sessionDocs = Object.values(campaign.sessions || {}).map((session) => ({
    id: session.id,
    title: session.title,
    tags: (session.tags || []).map(normalizeTag),
  }));

  return {
    npcs: npcDocs,
    creatures: creatureDocs,
    encounters: encounterDocs,
    sessions: sessionDocs,
  };
};
