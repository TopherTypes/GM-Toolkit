// Storage key constants for GM-Toolkit.
export const STORAGE_PREFIX = "gmtoolkit:";
export const INDEX_KEY = `${STORAGE_PREFIX}index`;
export const SETTINGS_KEY = `${STORAGE_PREFIX}settings`;
export const DEBUG_KEY = `${STORAGE_PREFIX}debug`;

export const campaignKey = (campaignId) => `${STORAGE_PREFIX}campaign:${campaignId}`;
