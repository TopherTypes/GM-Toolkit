import { SCHEMA_VERSION } from "../version.js";

// Export service for selected campaign backups.
export const createExportService = ({ toasts }) => {
  const exportCampaign = ({ campaignId, payload }) => {
    if (!payload) {
      toasts?.show("No campaign loaded to export.");
      return null;
    }

    const exportBlob = {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      campaignId,
      payload,
      isFixture: payload.campaign?.isFixture || false,
      fixtureId: payload.campaign?.fixtureId || null,
      fixtureLabel: payload.campaign?.fixtureLabel || null,
      fixtureVersion: payload.campaign?.fixtureVersion || null,
    };

    const blob = new Blob([JSON.stringify(exportBlob, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gmtoolkit-${payload.campaign?.name || "campaign"}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toasts?.show("Export complete.");
    return exportBlob;
  };

  return { exportCampaign };
};
