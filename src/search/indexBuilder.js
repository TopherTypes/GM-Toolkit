import { normalizeTag } from "../utils/strings.js";

// Build a basic search index for the current campaign.
export const buildIndex = (campaign) => {
  if (!campaign) {
    return {
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
  }

  // Cache name lookups so global search metadata can resolve parent/session references.
  const locationNameById = new Map(
    Object.values(campaign.locations || {}).map((location) => [location.id, location.name])
  );
  const sessionTitleById = new Map(
    Object.values(campaign.sessions || {}).map((session) => [session.id, session.title || "Untitled session"])
  );

  const partyDocs = Object.values(campaign.party || {}).map((member) => ({
    id: member.id,
    title: member.characterName || "Unnamed character",
    playerName: member.playerName || "",
    className: member.class || "",
    level: member.level ?? null,
    isArchived: member.isArchived || false,
  }));

  const npcDocs = Object.values(campaign.npcs || {}).map((npc) => ({
    id: npc.id,
    name: npc.name,
    role: npc.role || "",
    className: npc.class || "",
    level: npc.level ?? null,
    tags: (npc.tags || []).map(normalizeTag),
    notes: npc.notes || "",
    isArchived: npc.isArchived || false,
  }));

  const creatureDocs = Object.values(campaign.creatures || {}).map((creature) => ({
    id: creature.id,
    name: creature.name,
    type: creature.type || "",
    cr: creature.cr || "",
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
    parentLocationId: location.parentLocationId || "",
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
    title: session.title || "Untitled session",
    date: session.date || "",
    tags: (session.tags || []).map(normalizeTag),
    isArchived: session.isArchived || false,
  }));

  const reviewDocs = Object.values(campaign.sessionReviews || {}).map((review) => ({
    id: review.id,
    title: review.summary ? review.summary.slice(0, 60) : "Session review",
    sessionId: review.sessionId || "",
    isArchived: review.isArchived || false,
  }));

  const globalDocs = [
    ...partyDocs.map((member) => ({
      id: member.id,
      type: "party",
      title: member.title,
      meta: [member.playerName ? `Player: ${member.playerName}` : null, member.className || ""]
        .filter(Boolean)
        .join(" • "),
      tags: [],
      isArchived: member.isArchived,
    })),
    ...npcDocs.map((npc) => ({
      id: npc.id,
      type: "npc",
      title: npc.name,
      meta: [npc.role, npc.className, npc.level ? `Level ${npc.level}` : null].filter(Boolean).join(" • "),
      tags: npc.tags || [],
      isArchived: npc.isArchived,
    })),
    ...creatureDocs.map((creature) => ({
      id: creature.id,
      type: "creature",
      title: creature.name,
      meta: [creature.type, creature.cr ? `CR ${creature.cr}` : null].filter(Boolean).join(" • "),
      tags: creature.tags || [],
      isArchived: creature.isArchived,
    })),
    ...encounterDocs.map((encounter) => ({
      id: encounter.id,
      type: "encounter",
      title: encounter.title,
      meta: encounter.mapRef ? `Map: ${encounter.mapRef}` : "",
      tags: encounter.tags || [],
      isArchived: encounter.isArchived,
    })),
    ...locationDocs.map((location) => ({
      id: location.id,
      type: "location",
      title: location.name,
      meta: location.parentLocationId
        ? `Parent: ${locationNameById.get(location.parentLocationId) || "Unknown"}`
        : "",
      tags: location.tags || [],
      isArchived: location.isArchived,
    })),
    ...itemDocs.map((item) => ({
      id: item.id,
      type: "item",
      title: item.name,
      meta: item.passphrase ? `Passphrase: ${item.passphrase}` : "",
      tags: item.tags || [],
      isArchived: item.isArchived,
    })),
    ...sessionDocs.map((session) => ({
      id: session.id,
      type: "session",
      title: session.title,
      meta: session.date ? `Date: ${session.date}` : "",
      tags: session.tags || [],
      isArchived: session.isArchived,
    })),
    ...reviewDocs.map((review) => ({
      id: review.id,
      type: "review",
      title: review.title,
      meta: review.sessionId
        ? `Session: ${sessionTitleById.get(review.sessionId) || "Unknown"}`
        : "",
      tags: [],
      isArchived: review.isArchived,
    })),
  ];

  return {
    global: globalDocs,
    party: partyDocs,
    npcs: npcDocs,
    creatures: creatureDocs,
    encounters: encounterDocs,
    locations: locationDocs,
    items: itemDocs,
    sessions: sessionDocs,
    reviews: reviewDocs,
  };
};
