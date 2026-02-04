import { nowIso } from "../utils/dates.js";
import { createId } from "../utils/ids.js";
import { normalizeTags } from "../utils/strings.js";

// Avoid smart quotes or typographic punctuation; keep JS source ASCII/UTF-8.
// In-memory campaign store with persistence hooks.
export const createCampaignStore = ({ storageService, toasts, banners }) => {
  let currentCampaignId = null;
  let currentCampaign = null;
  let isSaving = false;
  // Track the last successful persistence time for UI feedback.
  let lastSavedAt = null;
  const listeners = new Set();

  const notify = () => {
    listeners.forEach((listener) =>
      listener({ currentCampaignId, currentCampaign, isSaving, lastSavedAt })
    );
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const setSaving = (value) => {
    isSaving = value;
    notify();
  };

  const createEmptyPayload = (campaign) => ({
    campaign: campaign,
    party: {},
    npcs: {},
    creatures: {},
    encounters: {},
    locations: {},
    items: {},
    sessions: {},
    sessionReviews: {},
  });

  const createCampaign = async ({ name, adventurePath, notes, tags }) => {
    const id = createId("cmp");
    const timestamp = nowIso();
    const campaign = {
      id,
      name,
      adventurePath,
      notes,
      tags: normalizeTags(tags),
      partySizeForXpSplit: 4,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const payload = createEmptyPayload(campaign);
    await storageService.saveCampaign(id, payload);
    const index = storageService.loadIndex();
    index.campaigns.push({
      campaignId: id,
      name,
      adventurePath,
      updatedAt: timestamp,
      isFixture: false,
    });
    index.lastOpenedCampaignId = id;
    storageService.saveIndex(index);
    await loadCampaign(id);
    toasts?.show("Campaign created.");
    return id;
  };

  const loadCampaign = async (campaignId) => {
    setSaving(true);
    const stored = await storageService.loadCampaign(campaignId);
    if (!stored) {
      setSaving(false);
      return null;
    }
    currentCampaignId = campaignId;
    currentCampaign = stored.payload;
    lastSavedAt = currentCampaign?.campaign?.updatedAt || null;
    setSaving(false);
    const index = storageService.loadIndex();
    index.lastOpenedCampaignId = campaignId;
    storageService.saveIndex(index);
    notify();
    return stored.payload;
  };

  const updateCampaignMeta = async (updates) => {
    if (!currentCampaign) return;
    const timestamp = nowIso();
    currentCampaign.campaign = {
      ...currentCampaign.campaign,
      ...updates,
      tags: normalizeTags(updates.tags ?? currentCampaign.campaign.tags),
      updatedAt: timestamp,
    };
    await persist();
  };

  const addNpc = async (npc) => {
    if (!currentCampaign) return;
    currentCampaign.npcs[npc.id] = npc;
    await persist();
  };

  // Create a new party member entry in the active campaign payload.
  const addPartyMember = async (member) => {
    if (!currentCampaign) return;
    currentCampaign.party[member.id] = member;
    await persist();
  };

  // Update an existing party member entry with fresh metadata.
  const updatePartyMember = async (memberId, updates) => {
    if (!currentCampaign?.party[memberId]) return;
    currentCampaign.party[memberId] = {
      ...currentCampaign.party[memberId],
      ...updates,
      updatedAt: nowIso(),
    };
    await persist();
  };

  const updateNpc = async (npcId, updates) => {
    if (!currentCampaign?.npcs[npcId]) return;
    currentCampaign.npcs[npcId] = { ...currentCampaign.npcs[npcId], ...updates, updatedAt: nowIso() };
    await persist();
  };

  const addCreature = async (creature) => {
    if (!currentCampaign) return;
    currentCampaign.creatures[creature.id] = creature;
    await persist();
  };

  const updateCreature = async (creatureId, updates) => {
    if (!currentCampaign?.creatures[creatureId]) return;
    currentCampaign.creatures[creatureId] = {
      ...currentCampaign.creatures[creatureId],
      ...updates,
      updatedAt: nowIso(),
    };
    await persist();
  };

  const addEncounter = async (encounter) => {
    if (!currentCampaign) return;
    currentCampaign.encounters[encounter.id] = encounter;
    await persist();
  };

  const updateEncounter = async (encounterId, updates) => {
    if (!currentCampaign?.encounters[encounterId]) return;
    currentCampaign.encounters[encounterId] = {
      ...currentCampaign.encounters[encounterId],
      ...updates,
      updatedAt: nowIso(),
    };
    await persist();
  };

  // Create a new location entry in the active campaign payload.
  const addLocation = async (location) => {
    if (!currentCampaign) return;
    currentCampaign.locations[location.id] = location;
    await persist();
  };

  // Update an existing location entry with fresh metadata.
  const updateLocation = async (locationId, updates) => {
    if (!currentCampaign?.locations[locationId]) return;
    currentCampaign.locations[locationId] = {
      ...currentCampaign.locations[locationId],
      ...updates,
      updatedAt: nowIso(),
    };
    await persist();
  };

  // Create a new item entry in the active campaign payload.
  const addItem = async (item) => {
    if (!currentCampaign) return;
    currentCampaign.items[item.id] = item;
    await persist();
  };

  // Update an existing item entry with fresh metadata.
  const updateItem = async (itemId, updates) => {
    if (!currentCampaign?.items[itemId]) return;
    currentCampaign.items[itemId] = {
      ...currentCampaign.items[itemId],
      ...updates,
      updatedAt: nowIso(),
    };
    await persist();
  };

  const addSession = async (session) => {
    if (!currentCampaign) return;
    currentCampaign.sessions[session.id] = session;
    await persist();
  };

  const updateSession = async (sessionId, updates) => {
    if (!currentCampaign?.sessions[sessionId]) return;
    currentCampaign.sessions[sessionId] = {
      ...currentCampaign.sessions[sessionId],
      ...updates,
      updatedAt: nowIso(),
    };
    await persist();
  };

  // Create a new session review entry for post-session outcomes.
  const addSessionReview = async (review) => {
    if (!currentCampaign) return;
    currentCampaign.sessionReviews[review.id] = review;
    await persist();
  };

  // Update an existing session review entry with fresh metadata.
  const updateSessionReview = async (reviewId, updates) => {
    if (!currentCampaign?.sessionReviews[reviewId]) return;
    currentCampaign.sessionReviews[reviewId] = {
      ...currentCampaign.sessionReviews[reviewId],
      ...updates,
      updatedAt: nowIso(),
    };
    await persist();
  };

  const persist = async () => {
    if (!currentCampaignId || !currentCampaign) return;
    setSaving(true);
    await storageService.saveCampaign(currentCampaignId, currentCampaign);
    const index = storageService.loadIndex();
    const entry = index.campaigns.find((item) => item.campaignId === currentCampaignId);
    if (entry) {
      entry.name = currentCampaign.campaign.name;
      entry.adventurePath = currentCampaign.campaign.adventurePath;
      entry.updatedAt = nowIso();
    }
    storageService.saveIndex(index);
    const usage = storageService.estimateUsage();
    if (usage.percent >= 90) {
      banners?.show("Storage is almost full. Export now and consider cleaning archived items.", "warning");
    } else if (usage.percent >= 70) {
      banners?.show("Storage is getting full. Export a backup soon.", "warning");
    }
    lastSavedAt = nowIso();
    setSaving(false);
  };

  // Prefer the most recently updated campaign when selecting a fallback route.
  const selectMostRecentCampaignId = (campaigns) => {
    if (!campaigns.length) {
      return null;
    }
    const sorted = [...campaigns].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    return sorted[0]?.campaignId || null;
  };

  const deleteCampaign = async (campaignId) => {
    const index = storageService.loadIndex();
    const remaining = index.campaigns.filter((campaign) => campaign.campaignId !== campaignId);
    index.campaigns = remaining;
    index.lastOpenedCampaignId = selectMostRecentCampaignId(remaining);
    storageService.saveIndex(index);
    storageService.deleteCampaign(campaignId);
    if (currentCampaignId === campaignId) {
      currentCampaignId = null;
      currentCampaign = null;
    }
    notify();
    return index.lastOpenedCampaignId;
  };

  return {
    subscribe,
    createCampaign,
    loadCampaign,
    updateCampaignMeta,
    addPartyMember,
    updatePartyMember,
    addNpc,
    updateNpc,
    addCreature,
    updateCreature,
    addEncounter,
    updateEncounter,
    addLocation,
    updateLocation,
    addItem,
    updateItem,
    addSession,
    updateSession,
    addSessionReview,
    updateSessionReview,
    deleteCampaign,
    persist,
    getCurrentCampaign: () => currentCampaign,
    getCurrentCampaignId: () => currentCampaignId,
    isSaving: () => isSaving,
    getLastSavedAt: () => lastSavedAt,
    createEmptyPayload,
  };
};
