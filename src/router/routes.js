// Canonical route helpers for GM-Toolkit hash routing.
export const routes = {
  root: () => "#/",
  dashboard: (campaignId) => `#/c/${campaignId}`,
  moduleList: (campaignId, module) => `#/c/${campaignId}/${module}`,
  npcDetail: (campaignId, npcId) => `#/c/${campaignId}/npcs/${npcId}`,
  creatureDetail: (campaignId, creatureId) => `#/c/${campaignId}/creatures/${creatureId}`,
  encounterDetail: (campaignId, encounterId) => `#/c/${campaignId}/encounters/${encounterId}`,
  sessionDetail: (campaignId, sessionId) => `#/c/${campaignId}/sessions/${sessionId}`,
};

export const moduleListRoutes = [
  "party",
  "npcs",
  "creatures",
  "encounters",
  "locations",
  "items",
  "sessions",
  "reviews",
];
