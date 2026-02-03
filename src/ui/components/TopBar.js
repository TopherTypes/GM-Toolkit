import { createElement } from "../dom.js";

// Top bar with campaign switcher, search, and import/export actions.
export const createTopBar = ({
  onCampaignChange,
  onCreateCampaign,
  onSearch,
  onExport,
  onImport,
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

  const savingIndicator = createElement("span", {
    className: "badge",
    text: "Saved",
  });

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

  exportButton.addEventListener("click", () => {
    onExport?.();
  });

  importButton.addEventListener("click", () => {
    onImport?.();
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
        children: [searchInput, exportButton, importButton],
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
    updateSavingIndicator: (status) => {
      savingIndicator.textContent = status;
      savingIndicator.className = status === "Saving…" ? "badge warning" : "badge";
    },
    focusSearch: () => {
      searchInput.focus();
    },
  };
};
