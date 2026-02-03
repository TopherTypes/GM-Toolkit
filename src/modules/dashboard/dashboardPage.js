import { createElement } from "../../ui/dom.js";
import { createTestDataBadge } from "../../ui/components/Badges.js";

// Campaign dashboard page with summary and PDF smoke test.
export const renderDashboardPage = ({ app, campaign }) => {
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

  container.append(headerCard, summaryCard);

  return container;
};
