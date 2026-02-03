import { SCHEMA_VERSION } from "../version.js";
import { createElement } from "../ui/dom.js";

// Migration service stub with confirmation flow.
export const createMigrationService = ({ modal }) => {
  const needsMigration = (incomingVersion) => incomingVersion < SCHEMA_VERSION;

  const confirmMigration = ({ incomingVersion }) =>
    new Promise((resolve) => {
      const content = createElement("div", {
        children: [
          createElement("p", {
            text:
              "This backup is from an older version of GM-Toolkit. We need to update it before importing.",
          }),
          createElement("p", {
            text: `Incoming schema: v${incomingVersion}. Current schema: v${SCHEMA_VERSION}.`,
          }),
        ],
      });

      modal.open({
        title: "Confirm migration",
        content,
        actions: [
          { label: "Cancel", variant: "secondary", onClick: () => resolve(false) },
          { label: "Continue", variant: "primary", onClick: () => resolve(true) },
        ],
      });
    });

  const migratePayload = (payload) => {
    if (!payload) {
      return payload;
    }

    // Schema v2 migration: add campaign XP split setting + status defaults.
    const campaign = {
      ...payload.campaign,
      partySizeForXpSplit: Math.max(1, Number(payload.campaign?.partySizeForXpSplit || 4)),
    };

    const migrateCollectionStatus = (collection) => {
      const next = {};
      Object.values(collection || {}).forEach((entity) => {
        next[entity.id] = {
          ...entity,
          status: entity.status || "complete",
        };
      });
      return next;
    };

    return {
      ...payload,
      campaign,
      party: payload.party || {},
      npcs: migrateCollectionStatus(payload.npcs),
      creatures: migrateCollectionStatus(payload.creatures),
      encounters: payload.encounters || {},
      locations: payload.locations || {},
      items: payload.items || {},
      sessions: payload.sessions || {},
      sessionReviews: payload.sessionReviews || {},
    };
  };

  return { needsMigration, confirmMigration, migratePayload };
};
