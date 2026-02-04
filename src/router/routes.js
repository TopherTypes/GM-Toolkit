// Canonical route helpers for GM-Toolkit hash routing.
export const routes = {
  root: () => "#/",
  dashboard: (campaignId) => `#/c/${campaignId}`,
  moduleList: (campaignId, module) => `#/c/${campaignId}/${module}`,
  partyDetail: (campaignId, memberId) => `#/c/${campaignId}/party/${memberId}`,
  npcDetail: (campaignId, npcId) => `#/c/${campaignId}/npcs/${npcId}`,
  creatureDetail: (campaignId, creatureId) => `#/c/${campaignId}/creatures/${creatureId}`,
  encounterDetail: (campaignId, encounterId) => `#/c/${campaignId}/encounters/${encounterId}`,
  locationDetail: (campaignId, locationId) => `#/c/${campaignId}/locations/${locationId}`,
  itemDetail: (campaignId, itemId) => `#/c/${campaignId}/items/${itemId}`,
  sessionDetail: (campaignId, sessionId) => `#/c/${campaignId}/sessions/${sessionId}`,
  reviewDetail: (campaignId, reviewId) => `#/c/${campaignId}/reviews/${reviewId}`,
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
