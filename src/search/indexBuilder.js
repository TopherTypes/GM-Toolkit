import { normalizeTag } from "../utils/strings.js";

// Build a basic search index for the current campaign.
export const buildIndex = (campaign) => {
  if (!campaign) {
    return { npcs: [], creatures: [], encounters: [], locations: [], items: [], sessions: [] };
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

  const locationDocs = Object.values(campaign.locations || {}).map((location) => ({
    id: location.id,
    name: location.name,
    description: location.description || "",
    tags: (location.tags || []).map(normalizeTag),
    isArchived: location.isArchived || false,
  }));

  const itemDocs = Object.values(campaign.items || {}).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || "",
    details: item.details || "",
    passphrase: item.passphrase || "",
    tags: (item.tags || []).map(normalizeTag),
    isArchived: item.isArchived || false,
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
    locations: locationDocs,
    items: itemDocs,
    sessions: sessionDocs,
  };
};
