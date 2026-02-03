import { createElement } from "../../ui/dom.js";
import { createDetailLayout } from "../../ui/components/DetailLayout.js";
import { createReferencesPanel } from "../../ui/components/ReferencesPanel.js";
import { normalizeTags } from "../../utils/strings.js";
import { routes } from "../../router/routes.js";
import { openPickerModal } from "../../ui/components/PickerModal.js";
import { buildEncounterParticipantSummary, calculateEncounterXp } from "../encounters/encounterUtils.js";
import { confirmLoseUnsavedChanges, openEntityPreviewModal } from "../../ui/components/EntityPreviewModal.js";

// Session detail page with encounter references.
export const renderSessionDetailPage = ({ app, campaignId, sessionId, campaign }) => {
  const session = campaign.sessions?.[sessionId];
  if (!session) {
    return createElement("div", { className: "card", text: "Session not found." });
  }

  const encounterIds = [...(session.encounterIds || [])];

  const form = createElement("form", { className: "form-grid" });
  const titleInput = createElement("input", {
    className: "input",
    attrs: { type: "text", required: true, value: session.title || "", "aria-label": "Session title" },
  });
  const dateInput = createElement("input", {
    className: "input",
    attrs: { type: "date", value: session.date || "", "aria-label": "Session date" },
  });
  const overviewInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, "aria-label": "Session overview" },
  });
  overviewInput.value = session.overview || "";
  const agendaInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, "aria-label": "Session agenda" },
  });
  agendaInput.value = session.agenda || "";
  const gmNotesInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, "aria-label": "GM notes" },
  });
  gmNotesInput.value = session.gmNotes || "";

  // Track dirty state to protect against losing unsaved session changes.
  let hasUnsavedChanges = false;
  const markDirty = () => {
    hasUnsavedChanges = true;
  };

  const tagsInput = createElement("input", {
    className: "input",
    attrs: {
      type: "text",
      list: "session-tags",
      value: (session.tags || []).join(", "),
      "aria-label": "Session tags",
    },
  });
  const tagList = createElement("datalist", {
    attrs: { id: "session-tags" },
    children: app.searchService.suggestTags({ scopes: ["sessions"] }).map((tag) =>
      createElement("option", { attrs: { value: tag } })
    ),
  });

  // Mark any form edits as unsaved changes.
  [titleInput, dateInput, overviewInput, agendaInput, gmNotesInput, tagsInput].forEach((input) => {
    input.addEventListener("input", markDirty);
  });

  const encounterList = createElement("div", { className: "form-grid" });

  const renderEncounterList = () => {
    encounterList.innerHTML = "";
    if (!encounterIds.length) {
      encounterList.append(createElement("p", { text: "No encounters linked yet." }));
      return;
    }

    encounterIds.forEach((encounterId, index) => {
      const encounter = campaign.encounters?.[encounterId];
      const summary = encounter
        ? buildEncounterParticipantSummary({ encounter, campaign })
        : "Missing encounter.";
      const xpSummary = encounter
        ? calculateEncounterXp({ encounter, campaign }).totalXp.toLocaleString()
        : "0";

      const title = encounter?.title || "Unknown encounter";
      const mapRef = encounter?.mapRef || "";

      const upButton = createElement("button", {
        className: "button secondary small",
        text: "Up",
        attrs: { type: "button" },
      });
      const downButton = createElement("button", {
        className: "button secondary small",
        text: "Down",
        attrs: { type: "button" },
      });
      const removeButton = createElement("button", {
        className: "button secondary small",
        text: "Remove",
        attrs: { type: "button" },
      });
      const openButton = createElement("button", {
        className: "button secondary small",
        text: "Preview",
        attrs: { type: "button" },
      });

      upButton.disabled = index === 0;
      downButton.disabled = index === encounterIds.length - 1;

      upButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const swapIndex = index - 1;
        if (swapIndex < 0) return;
        [encounterIds[index], encounterIds[swapIndex]] = [
          encounterIds[swapIndex],
          encounterIds[index],
        ];
        renderEncounterList();
        markDirty();
      });

      downButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const swapIndex = index + 1;
        if (swapIndex >= encounterIds.length) return;
        [encounterIds[index], encounterIds[swapIndex]] = [
          encounterIds[swapIndex],
          encounterIds[index],
        ];
        renderEncounterList();
        markDirty();
      });

      removeButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        encounterIds.splice(index, 1);
        renderEncounterList();
        markDirty();
      });

      openButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const navigateToDetail = () => {
          window.location.hash = routes.encounterDetail(campaignId, encounterId);
        };
        const handleOpenFull = () => {
          app.modal.close();
          if (hasUnsavedChanges) {
            confirmLoseUnsavedChanges({ app, onConfirm: navigateToDetail });
            return;
          }
          navigateToDetail();
        };
        openEntityPreviewModal({
          app,
          type: "encounter",
          entity: encounter,
          encounterSummary: summary,
          encounterXpTotal: xpSummary,
          onOpenFull: encounter ? handleOpenFull : null,
        });
      });

      const row = createElement("div", {
        className: "card",
        children: [
          createElement("strong", { text: title }),
          createElement("p", { className: "text-muted", text: mapRef }),
          createElement("p", { className: "text-muted", text: summary }),
          createElement("p", { text: `Total XP: ${xpSummary}` }),
          createElement("div", {
            className: "form-row inline",
            children: [openButton, upButton, downButton, removeButton],
          }),
        ],
      });

      encounterList.append(row);
    });
  };

  const openEncounterPicker = () => {
    const items = Object.values(campaign.encounters || {});
    openPickerModal({
      app,
      title: "Add encounter",
      items,
      getTitle: (item) => item.title,
      getMeta: (item) => item.mapRef || "",
      onPick: (item) => {
        app.modal.close();
        encounterIds.push(item.id);
        renderEncounterList();
        markDirty();
      },
      searchPlaceholder: "Search encounters",
    });
  };

  const addEncounterButton = createElement("button", {
    className: "button secondary",
    text: "Add encounter",
    attrs: { type: "button" },
  });
  addEncounterButton.addEventListener("click", openEncounterPicker);

  form.append(
    createElement("label", { text: "Title", children: [titleInput] }),
    createElement("label", { text: "Date", children: [dateInput] }),
    createElement("label", { text: "Expected encounters", children: [encounterList] }),
    addEncounterButton,
    createElement("label", { text: "Overview", children: [overviewInput] }),
    createElement("label", { text: "Agenda", children: [agendaInput] }),
    createElement("label", { text: "GM notes", children: [gmNotesInput] }),
    createElement("label", { text: "Tags (comma separated)", children: [tagsInput, tagList] })
  );

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!titleInput.value.trim()) {
      app.banners.show("Session title is required.", "error");
      return;
    }
    const tags = normalizeTags(tagsInput.value.split(",").map((tag) => tag.trim()).filter(Boolean));
    await app.campaignStore.updateSession(sessionId, {
      title: titleInput.value.trim(),
      date: dateInput.value || "",
      overview: overviewInput.value.trim(),
      agenda: agendaInput.value.trim(),
      encounterIds: [...encounterIds],
      gmNotes: gmNotesInput.value.trim(),
      tags,
    });
    app.toasts.show("Session updated.");
    hasUnsavedChanges = false;
  });

  const saveButton = createElement("button", {
    className: "button",
    text: "Save changes",
    attrs: { type: "submit" },
  });
  form.append(saveButton);

  renderEncounterList();

  const layout = createDetailLayout({
    title: session.title || "Session",
    actions: [],
    mainContent: form,
    sidebarContent: createReferencesPanel({
      sections: [
        {
          title: "Referenced encounters",
          items: encounterIds.map((id) => {
            const encounter = campaign.encounters?.[id];
            return {
              label: encounter?.title || "Unknown encounter",
              meta: encounter?.mapRef || "",
              onClick: () => {
                window.location.hash = routes.encounterDetail(campaignId, id);
              },
            };
          }),
        },
      ],
    }),
  });

  return layout;
};
