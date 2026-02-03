import { createElement } from "../../ui/dom.js";
import { createTestDataBadge } from "../../ui/components/Badges.js";
import { routes } from "../../router/routes.js";

// Campaign dashboard page with summary and PDF smoke test.
export const renderDashboardPage = ({ app, campaign, campaignId }) => {
  const container = createElement("div", { className: "form-grid" });

  const headerCard = createElement("div", { className: "card" });
  const badges = [];
  if (campaign?.campaign?.isFixture) {
    badges.push(createTestDataBadge());
  }

  headerCard.append(
    createElement("h1", { text: campaign?.campaign?.name || "Campaign" }),
    ...badges,
    createElement("p", { text: campaign?.campaign?.adventurePath || "" }),
    createElement("p", { text: campaign?.campaign?.notes || "" })
  );

  const pdfButton = createElement("button", {
    className: "button",
    text: "PDF Smoke Test",
    attrs: { type: "button" },
  });
  pdfButton.addEventListener("click", () => app.pdfService.generateSmokeTest());

  const deleteButton = createElement("button", {
    className: "button danger",
    text: "Delete campaign",
    attrs: { type: "button" },
  });

  deleteButton.addEventListener("click", () => {
    const campaignName = campaign?.campaign?.name || "Campaign";
    const confirmationInput = createElement("input", {
      className: "input",
      attrs: {
        type: "text",
        placeholder: `Type "${campaignName}" to confirm`,
        "aria-label": "Type campaign name to confirm deletion",
      },
    });
    const warningText = createElement("p", {
      text: "This removes the campaign from this browser. Export a backup first if you need it later.",
    });
    const confirmHint = createElement("p", {
      text: "What you can do now: Export a backup, then type the campaign name to delete it.",
    });

    let confirmButton = null;
    const updateConfirmState = () => {
      if (!confirmButton) return;
      confirmButton.disabled = confirmationInput.value.trim() !== campaignName;
    };

    confirmationInput.addEventListener("input", updateConfirmState);

    app.modal.open({
      title: "Delete campaign",
      content: createElement("div", {
        className: "form-grid",
        children: [
          warningText,
          confirmHint,
          createElement("label", { text: "Confirm campaign name", children: [confirmationInput] }),
        ],
      }),
      actions: [
        {
          label: "Delete campaign",
          variant: "danger",
          disabled: true,
          onMount: (button) => {
            confirmButton = button;
            updateConfirmState();
          },
          onClick: async () => {
            const nextId = await app.campaignStore.deleteCampaign(campaignId);
            app.modal.close();
            app.toasts.show("Campaign deleted.");
            window.location.hash = nextId ? routes.dashboard(nextId) : routes.root();
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => app.modal.close() },
      ],
      closeOnEscape: false,
      closeOnBackdrop: false,
    });
  });

  const summaryCard = createElement("div", {
    className: "card",
    children: [
      createElement("h2", { text: "Quick stats" }),
      createElement("p", { text: `NPCs: ${Object.keys(campaign?.npcs || {}).length}` }),
      createElement("p", { text: `Locations: ${Object.keys(campaign?.locations || {}).length}` }),
      createElement("p", { text: `Encounters: ${Object.keys(campaign?.encounters || {}).length}` }),
      pdfButton,
    ],
  });

  const dangerCard = createElement("div", {
    className: "card",
    children: [
      createElement("h2", { text: "Danger zone" }),
      createElement("p", { text: "Delete this campaign from this browser. Export first if needed." }),
      deleteButton,
    ],
  });

  container.append(headerCard, summaryCard, dangerCard);

  return container;
};
