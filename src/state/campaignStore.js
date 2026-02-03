import { nowIso } from "../utils/dates.js";
import { createId } from "../utils/ids.js";
import { normalizeTags } from "../utils/strings.js";

// In-memory campaign store with persistence hooks.
export const createCampaignStore = ({ storageService, toasts, banners }) => {
  let currentCampaignId = null;
  let currentCampaign = null;
  let isSaving = false;
  const listeners = new Set();

  const notify = () => {
    listeners.forEach((listener) => listener({ currentCampaignId, currentCampaign, isSaving }));
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

  const updateNpc = async (npcId, updates) => {
    if (!currentCampaign?.npcs[npcId]) return;
    currentCampaign.npcs[npcId] = { ...currentCampaign.npcs[npcId], ...updates, updatedAt: nowIso() };
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
      banners?.show(\"Storage is almost full. Export now and consider cleaning archived items.\", \"warning\");
    } else if (usage.percent >= 70) {
      banners?.show(\"Storage is getting full. Export a backup soon.\", \"warning\");
    }
    setSaving(false);
  };

  return {
    subscribe,
    createCampaign,
    loadCampaign,
    updateCampaignMeta,
    addNpc,
    updateNpc,
    persist,
    getCurrentCampaign: () => currentCampaign,
    getCurrentCampaignId: () => currentCampaignId,
    isSaving: () => isSaving,
    createEmptyPayload,
  };
};
