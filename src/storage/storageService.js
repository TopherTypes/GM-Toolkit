import { INDEX_KEY, SETTINGS_KEY, DEBUG_KEY, campaignKey } from "./storageKeys.js";
import { computeChecksum } from "./checksum.js";
import { SCHEMA_VERSION } from "../version.js";

// Storage service for campaigns, settings, and debug data.
export const createStorageService = ({ banners, debug }) => {
  const loadIndex = () => {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) {
      return { schemaVersion: SCHEMA_VERSION, lastOpenedCampaignId: null, campaigns: [] };
    }
    return JSON.parse(raw);
  };

  const saveIndex = (index) => {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  };

  const loadSettings = () => {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw
      ? JSON.parse(raw)
      : { theme: "system", darkModeOverride: null, showArchivedByDefault: false };
  };

  const saveSettings = (settings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  };

  const loadDebug = () => {
    const raw = localStorage.getItem(DEBUG_KEY);
    return raw ? JSON.parse(raw) : { enabled: false };
  };

  const saveDebug = (debugState) => {
    localStorage.setItem(DEBUG_KEY, JSON.stringify(debugState));
  };

  const loadCampaign = async (campaignId) => {
    const raw = localStorage.getItem(campaignKey(campaignId));
    if (!raw) {
      return null;
    }
    const stored = JSON.parse(raw);
    if (stored?.payload) {
      const checksum = await computeChecksum(JSON.stringify(stored.payload));
      if (checksum !== stored.checksum?.value) {
        banners?.show("Warning: Campaign checksum mismatch. Export a backup soon.", "warning");
      }
    }
    return stored;
  };

  const saveCampaign = async (campaignId, payload) => {
    const payloadString = JSON.stringify(payload);
    const checksumValue = await computeChecksum(payloadString);
    const stored = {
      schemaVersion: SCHEMA_VERSION,
      campaignId,
      checksum: { algo: "sha-256", value: checksumValue },
      savedAt: new Date().toISOString(),
      payload,
    };
    localStorage.setItem(campaignKey(campaignId), JSON.stringify(stored));
  };

  const estimateUsage = () => {
    let totalBytes = 0;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("gmtoolkit:")) {
        const value = localStorage.getItem(key) || "";
        totalBytes += new TextEncoder().encode(value).length;
      }
    });
    const limitBytes = 5 * 1024 * 1024;
    return { totalBytes, limitBytes, percent: Math.min(100, Math.round((totalBytes / limitBytes) * 100)) };
  };

  const logDebug = (...args) => {
    if (debug?.enabled) {
      console.debug("[GM-Toolkit]", ...args);
    }
  };

  return {
    loadIndex,
    saveIndex,
    loadSettings,
    saveSettings,
    loadDebug,
    saveDebug,
    loadCampaign,
    saveCampaign,
    estimateUsage,
    logDebug,
  };
};
