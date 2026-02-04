import { createElement } from "../../ui/dom.js";
import { createDetailLayout } from "../../ui/components/DetailLayout.js";
import { createPartyForm } from "./partyForm.js";
import { createReferencesPanel } from "../../ui/components/ReferencesPanel.js";
import { nowIso } from "../../utils/dates.js";

// Party detail page for editing and archiving members.
export const renderPartyDetailPage = ({ app, campaignId, memberId, campaign }) => {
  const member = campaign.party?.[memberId];
  if (!member) {
    return createElement("div", { className: "card", text: "Party member not found." });
  }

  const form = createPartyForm({
    member,
    onSubmit: async (data) => {
      await app.campaignStore.updatePartyMember(memberId, { ...data, updatedAt: nowIso() });
      app.toasts.show("Party member updated.");
    },
  });

  const saveButton = createElement("button", {
    className: "button",
    text: "Save changes",
    attrs: { type: "submit" },
  });
  form.append(saveButton);

  // Confirm archiving to avoid accidental removal from the roster.
  const archiveAction = () => {
    const content = createElement("p", { text: "Archive this party member? You can restore them later." });
    app.modal.open({
      title: "Archive party member",
      content,
      actions: [
        {
          label: "Archive",
          variant: "danger",
          onClick: async () => {
            app.modal.close();
            await app.campaignStore.updatePartyMember(memberId, { isArchived: true, archivedAt: nowIso() });
            app.toasts.show("Party member archived.");
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => app.modal.close() },
      ],
    });
  };

  const restoreAction = () => {
    const content = createElement("p", { text: "Restore this party member to active status?" });
    app.modal.open({
      title: "Restore party member",
      content,
      actions: [
        {
          label: "Restore",
          variant: "primary",
          onClick: async () => {
            app.modal.close();
            await app.campaignStore.updatePartyMember(memberId, { isArchived: false, archivedAt: null });
            app.toasts.show("Party member restored.");
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => app.modal.close() },
      ],
    });
  };

  const layout = createDetailLayout({
    title: member.characterName || "Party member",
    actions: [
      member.isArchived
        ? { label: "Restore", variant: "primary", onClick: restoreAction }
        : { label: "Archive", variant: "danger", onClick: archiveAction },
    ],
    mainContent: form,
    sidebarContent: createReferencesPanel(),
  });

  return layout;
};
