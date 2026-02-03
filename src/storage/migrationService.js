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
    // Stub migration: return payload as-is for schema v1.
    return payload;
  };

  return { needsMigration, confirmMigration, migratePayload };
};
