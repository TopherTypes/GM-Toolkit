import { createElement } from "../../ui/dom.js";
import { createDetailLayout } from "../../ui/components/DetailLayout.js";
import { createReferencesPanel } from "../../ui/components/ReferencesPanel.js";
import { nowIso } from "../../utils/dates.js";
import { createItemForm } from "./itemForm.js";
import { normalizePassphrase } from "./passphraseService.js";

// Item detail page for editing, archiving, and backlink review.
export const renderItemDetailPage = ({ app, campaignId, itemId, campaign }) => {
  const item = campaign.items?.[itemId];
  if (!item) {
    return createElement("div", { className: "card", text: "Item not found." });
  }

  const existingPassphrases = Object.values(campaign.items || {})
    .filter((entry) => entry.id !== item.id)
    .map((entry) => entry.passphrase);

  const form = createItemForm({
    item,
    existingPassphrases,
    onPassphraseMessage: (message) => app.banners.show(message, "info"),
    onSubmit: async (data) => {
      if (!data.name) {
        app.banners.show("Item name is required.", "error");
        return;
      }
      if (!data.passphrase) {
        app.banners.show("Passphrase is required.", "error");
        return;
      }
      const normalizedPassphrase = normalizePassphrase(data.passphrase);
      const collision = existingPassphrases
        .map((entry) => normalizePassphrase(entry))
        .includes(normalizedPassphrase);
      if (collision) {
        app.banners.show("That passphrase is already used in this campaign.", "error");
        return;
      }
      await app.campaignStore.updateItem(itemId, { ...data, passphrase: normalizedPassphrase, updatedAt: nowIso() });
      app.toasts.show("Item updated.");
    },
    tagSuggestions: app.searchService.suggestTags({ scopes: ["items"] }),
  });

  const saveButton = createElement("button", {
    className: "button",
    text: "Save changes",
    attrs: { type: "submit" },
  });
  form.append(saveButton);

  const archiveAction = () => {
    const content = createElement("p", { text: "Archive this item? You can restore it later." });
    app.modal.open({
      title: "Archive item",
      content,
      actions: [
        {
          label: "Archive",
          variant: "danger",
          onClick: async () => {
            app.modal.close();
            await app.campaignStore.updateItem(itemId, { isArchived: true, archivedAt: nowIso() });
            app.toasts.show("Item archived.");
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => app.modal.close() },
      ],
    });
  };

  const restoreAction = () => {
    const content = createElement("p", { text: "Restore this item to active status?" });
    app.modal.open({
      title: "Restore item",
      content,
      actions: [
        {
          label: "Restore",
          variant: "primary",
          onClick: async () => {
            app.modal.close();
            await app.campaignStore.updateItem(itemId, { isArchived: false, archivedAt: null });
            app.toasts.show("Item restored.");
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => app.modal.close() },
      ],
    });
  };

  // References panel placeholder (items are not yet linked to sessions/encounters).
  const referencesPanel = createReferencesPanel({ sections: [] });

  return createDetailLayout({
    title: item.name,
    actions: [
      item.isArchived
        ? { label: "Restore", variant: "primary", onClick: restoreAction }
        : { label: "Archive", variant: "danger", onClick: archiveAction },
    ],
    mainContent: form,
    sidebarContent: referencesPanel,
  });
};
