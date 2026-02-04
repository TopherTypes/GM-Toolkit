import { createElement } from "../dom.js";

// Top bar with campaign switcher, search, and import/export actions.
export const createTopBar = ({
  onCampaignChange,
  onCreateCampaign,
  onSearch,
  onExport,
  onImport,
  onSettings,
}) => {
  const campaignSelect = createElement("select", {
    className: "select",
    attrs: { "aria-label": "Campaign switcher" },
  });

  const createButton = createElement("button", {
    className: "button secondary",
    text: "New campaign",
    attrs: { type: "button" },
  });

  const searchInput = createElement("input", {
    className: "input",
    attrs: {
      type: "search",
      placeholder: "Search (Ctrl+K)",
      "aria-label": "Global search",
    },
  });

  const searchButton = createElement("button", {
    className: "button secondary",
    text: "Search",
    attrs: { type: "button", "aria-label": "Open global search" },
  });

  const exportButton = createElement("button", {
    className: "button secondary",
    text: "Export",
    attrs: { type: "button" },
  });

  const importButton = createElement("button", {
    className: "button secondary",
    text: "Import",
    attrs: { type: "button" },
  });

  const settingsButton = createElement("button", {
    className: "button secondary",
    text: "Settings",
    attrs: { type: "button" },
  });

  const savingIndicator = createElement("span", {
    className: "badge",
    text: "Saved",
  });
  savingIndicator.setAttribute("aria-live", "polite");

  campaignSelect.addEventListener("change", (event) => {
    onCampaignChange?.(event.target.value);
  });

  createButton.addEventListener("click", () => {
    onCreateCampaign?.();
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      onSearch?.(event.target.value);
    }
  });

  searchButton.addEventListener("click", () => {
    onSearch?.(searchInput.value);
  });

  exportButton.addEventListener("click", () => {
    onExport?.();
  });

  importButton.addEventListener("click", () => {
    onImport?.();
  });

  settingsButton.addEventListener("click", () => {
    onSettings?.();
  });

  const element = createElement("header", {
    className: "app-topbar",
    children: [
      createElement("div", {
        className: "app-topbar__left",
        children: [
          createElement("span", { className: "app-logo", text: "GM-Toolkit" }),
          campaignSelect,
          createButton,
          savingIndicator,
        ],
      }),
      createElement("div", {
        className: "app-topbar__right",
        children: [
          createElement("div", {
            className: "app-topbar__search",
            children: [searchInput, searchButton],
          }),
          exportButton,
          importButton,
          settingsButton,
        ],
      }),
    ],
  });

  return {
    element,
    updateCampaigns: (campaigns, activeId) => {
      campaignSelect.innerHTML = "";
      campaigns.forEach((campaign) => {
        const label = campaign.isFixture ? `${campaign.name} (Test Data)` : campaign.name;
        const option = createElement("option", {
          text: label,
          attrs: { value: campaign.campaignId },
        });
        if (campaign.campaignId === activeId) {
          option.selected = true;
        }
        campaignSelect.append(option);
      });
      campaignSelect.disabled = campaigns.length === 0;
    },
    updateSavingIndicator: ({ isSaving, lastSavedLabel } = {}) => {
      if (isSaving) {
        savingIndicator.textContent = "Saving…";
        savingIndicator.className = "badge warning";
        return;
      }
      savingIndicator.textContent = lastSavedLabel ? `Saved ${lastSavedLabel}` : "Saved";
      savingIndicator.className = "badge";
    },
    focusSearch: () => {
      searchInput.focus();
    },
  };
};
