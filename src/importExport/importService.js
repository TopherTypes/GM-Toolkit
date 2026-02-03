import { createElement } from "../ui/dom.js";
import { resolveConflicts } from "./conflictResolver.js";

// Import service with dry run, merge, and conflict handling.
export const createImportService = ({
  storageService,
  campaignStore,
  mergeService,
  migrationService,
  modal,
  toasts,
  banners,
  onPostImportExport,
}) => {
  const openImportDialog = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (file) {
        handleFile(file);
      }
    });
    input.click();
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        await handleImportData(data);
      } catch (error) {
        banners.show("Import failed: invalid JSON file.", "error");
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const validateImport = (data) => {
    if (!data || typeof data !== "object") return "Invalid file.";
    if (!data.schemaVersion || !data.payload) return "Missing schema version or payload.";
    if (!data.campaignId && !data.payload?.campaign?.id) return "Missing campaign ID.";
    return null;
  };

  const handleImportData = async (data) => {
    const error = validateImport(data);
    if (error) {
      banners.show(`Import failed: ${error}`, "error");
      return;
    }

    if (migrationService.needsMigration(data.schemaVersion)) {
      const approved = await migrationService.confirmMigration({ incomingVersion: data.schemaVersion });
      if (!approved) {
        return;
      }
      data.payload = migrationService.migratePayload(data.payload);
    }

    if (data.isFixture) {
      return handleFixtureImport(data);
    }

    const index = storageService.loadIndex();
    const existingEntry = index.campaigns.find((entry) => entry.campaignId === data.campaignId);
    const summary = await buildDryRunSummary({ data, existingEntry });

    const content = createElement("div", {
      children: [
        createElement("p", { text: `Campaign: ${data.payload.campaign?.name || data.campaignId}` }),
        createElement("p", { text: `Schema version: v${data.schemaVersion}` }),
        createElement("p", { text: `New entities: ${summary.newCount}` }),
        createElement("p", { text: `Updates: ${summary.updateCount}` }),
        createElement("p", { text: `Conflicts: ${summary.conflicts.length}` }),
      ],
    });

    modal.open({
      title: "Import summary",
      content,
      actions: [
        existingEntry
          ? {
              label: "Merge into existing",
              variant: "primary",
              onClick: () => handleMergeImport(data, summary),
            }
          : null,
        {
          label: "Import as new copy",
          variant: "secondary",
          onClick: () => handleNewCopyImport(data),
        },
        { label: "Cancel", variant: "secondary", onClick: () => modal.close() },
      ].filter(Boolean),
    });
  };

  const buildDryRunSummary = async ({ data, existingEntry }) => {
    const summary = { newCount: 0, updateCount: 0, conflicts: [] };
    if (!existingEntry) {
      summary.newCount = countEntities(data.payload);
      return summary;
    }

    const existingPayload =
      campaignStore.getCurrentCampaignId() === data.campaignId
        ? campaignStore.getCurrentCampaign()
        : (await storageService.loadCampaign(data.campaignId))?.payload;

    const collections = getCollections(data.payload);
    collections.forEach((collection) => {
      const incoming = data.payload[collection] || {};
      const existing = existingPayload?.[collection] || {};
      Object.entries(incoming).forEach(([id, entity]) => {
        if (!existing[id]) {
          summary.newCount += 1;
        } else if (JSON.stringify(existing[id]) !== JSON.stringify(entity)) {
          summary.updateCount += 1;
        }
      });
      const conflicts = mergeService.detectConflicts(existing, incoming);
      conflicts.forEach((conflict) => summary.conflicts.push({ ...conflict, collection }));
    });
    return summary;
  };

  const handleMergeImport = async (data, summary) => {
    modal.close();
    const conflicts = summary.conflicts;
    if (conflicts.length) {
      return openConflictResolver({ data, conflicts });
    }
    await applyMerge({ data, resolutions: [] });
  };

  const openConflictResolver = ({ data, conflicts }) => {
    const list = createElement("div", { className: "form-grid" });
    const resolutionState = new Map();

    const buildRow = (conflict) => {
      const name = conflict.incoming.name || conflict.incoming.title || conflict.id;
      const select = createElement("select", {
        className: "select",
        attrs: { "aria-label": "Conflict resolution" },
      });

      [
        { value: "duplicate", label: "Duplicate (Imported)" },
        { value: "most-recent", label: "Most recent wins" },
        { value: "incoming", label: "Choose incoming" },
        { value: "existing", label: "Choose existing" },
      ].forEach((option) => {
        select.append(
          createElement("option", {
            text: option.label,
            attrs: { value: option.value },
          })
        );
      });

      resolutionState.set(conflict.id, "duplicate");
      select.addEventListener("change", () => {
        resolutionState.set(conflict.id, select.value);
      });

      return createElement("div", {
        className: "form-row",
        children: [
          createElement("strong", { text: `${name} (${conflict.collection})` }),
          select,
        ],
      });
    };

    conflicts.forEach((conflict) => {
      list.append(buildRow(conflict));
    });

    const bulkSelect = createElement("select", {
      className: "select",
      attrs: { "aria-label": "Bulk resolve" },
    });
    [
      { value: "duplicate", label: "Resolve all as duplicate" },
      { value: "most-recent", label: "Resolve all as most recent" },
      { value: "incoming", label: "Resolve all as incoming" },
      { value: "existing", label: "Resolve all as existing" },
    ].forEach((option) => {
      bulkSelect.append(
        createElement("option", {
          text: option.label,
          attrs: { value: option.value },
        })
      );
    });

    bulkSelect.addEventListener("change", () => {
      const value = bulkSelect.value;
      resolutionState.forEach((_, key) => resolutionState.set(key, value));
      list.querySelectorAll("select").forEach((select) => {
        select.value = value;
      });
    });

    const content = createElement("div", {
      className: "form-grid",
      children: [
        createElement("p", { text: "Review conflicts and choose how to resolve each one." }),
        bulkSelect,
        list,
      ],
    });

    modal.open({
      title: "Resolve conflicts",
      content,
      actions: [
        {
          label: "Apply",
          variant: "primary",
          onClick: async () => {
            modal.close();
            const resolutions = conflicts.map((conflict) => ({
              ...conflict,
              resolution: resolutionState.get(conflict.id) || "duplicate",
            }));
            await applyMerge({ data, resolutions });
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => modal.close() },
      ],
    });
  };

  const applyMerge = async ({ data, resolutions }) => {
    const existingCampaignId = data.campaignId;
    const existingPayload =
      campaignStore.getCurrentCampaignId() === existingCampaignId
        ? campaignStore.getCurrentCampaign()
        : (await storageService.loadCampaign(existingCampaignId))?.payload;

    if (!existingPayload) {
      await handleNewCopyImport(data);
      return;
    }

    const merged = { ...existingPayload };
    merged.campaign = {
      ...existingPayload.campaign,
      ...data.payload.campaign,
      id: existingPayload.campaign.id,
    };
    const collections = getCollections(data.payload);
    collections.forEach((collection) => {
      const incoming = Object.values(data.payload[collection] || {});
      const existing = existingPayload[collection] || {};
      const conflicts = resolutions.filter((conflict) => conflict.collection === collection);
      const resolvedConflicts = resolveConflicts({ conflicts, strategy: null });
      merged[collection] = mergeService.applyResolutions({
        existing,
        incoming,
        resolutions: resolvedConflicts.length ? resolvedConflicts : conflicts,
      });
    });

    await storageService.saveCampaign(existingCampaignId, merged);
    const index = storageService.loadIndex();
    const entry = index.campaigns.find((item) => item.campaignId === existingCampaignId);
    if (entry) {
      entry.updatedAt = new Date().toISOString();
    }
    storageService.saveIndex(index);
    await campaignStore.loadCampaign(existingCampaignId);
    toasts.show("Import merged into existing campaign.");
    await postImportPrompt();
  };

  const handleNewCopyImport = async (data) => {
    modal.close();
    const { payload, newCampaignId } = mergeService.remapIdsForCopy(data.payload);
    await storageService.saveCampaign(newCampaignId, payload);
    const index = storageService.loadIndex();
    index.campaigns.push({
      campaignId: newCampaignId,
      name: payload.campaign.name,
      adventurePath: payload.campaign.adventurePath,
      updatedAt: new Date().toISOString(),
      isFixture: false,
    });
    index.lastOpenedCampaignId = newCampaignId;
    storageService.saveIndex(index);
    await campaignStore.loadCampaign(newCampaignId);
    toasts.show("Import complete as new campaign.");
    await postImportPrompt();
  };

  const handleFixtureImport = async (data) => {
    const content = createElement("div", {
      children: [
        createElement("p", {
          text:
            "You are importing TEST DATA. This will replace the existing fixture campaign with the same fixture ID.",
        }),
        createElement("p", { text: "Your real campaigns will not be affected." }),
      ],
    });

    modal.open({
      title: "Import fixture",
      content,
      actions: [
        {
          label: "Replace fixture",
          variant: "primary",
          onClick: async () => {
            modal.close();
            const index = storageService.loadIndex();
            index.campaigns = index.campaigns.filter(
              (entry) => !(entry.isFixture && entry.fixtureId === data.fixtureId)
            );
            const campaignId = data.payload.campaign?.id || data.campaignId;
            data.payload.campaign = {
              ...data.payload.campaign,
              id: campaignId,
              isFixture: true,
              fixtureId: data.fixtureId,
              fixtureLabel: data.fixtureLabel,
              fixtureVersion: data.fixtureVersion,
            };
            await storageService.saveCampaign(campaignId, data.payload);
            index.campaigns.push({
              campaignId,
              name: data.payload.campaign?.name || "Fixture",
              adventurePath: data.payload.campaign?.adventurePath || "",
              updatedAt: new Date().toISOString(),
              isFixture: true,
              fixtureId: data.fixtureId,
              fixtureLabel: data.fixtureLabel,
              fixtureVersion: data.fixtureVersion,
            });
            index.lastOpenedCampaignId = campaignId;
            storageService.saveIndex(index);
            await campaignStore.loadCampaign(campaignId);
            toasts.show("Fixture import complete.");
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => modal.close() },
      ],
    });
  };

  const postImportPrompt = async () => {
    if (!onPostImportExport) return;
    const content = createElement("p", {
      text: "Import completed. Export an updated backup now?",
    });
    modal.open({
      title: "Export updated backup",
      content,
      actions: [
        { label: "Export", variant: "primary", onClick: onPostImportExport },
        { label: "Not now", variant: "secondary", onClick: () => modal.close() },
      ],
    });
  };

  const countEntities = (payload) =>
    getCollections(payload).reduce((sum, collection) => sum + Object.keys(payload[collection] || {}).length, 0);

  const getCollections = (payload) =>
    ["party", "npcs", "creatures", "encounters", "locations", "items", "sessions", "sessionReviews"].filter(
      (key) => payload[key]
    );

  return { openImportDialog };
};
