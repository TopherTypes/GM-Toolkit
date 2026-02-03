import { createElement } from "../../ui/dom.js";
import { createDetailLayout } from "../../ui/components/DetailLayout.js";
import { createReferencesPanel } from "../../ui/components/ReferencesPanel.js";
import { createId } from "../../utils/ids.js";
import { nowIso } from "../../utils/dates.js";
import { normalizeTags } from "../../utils/strings.js";
import { routes } from "../../router/routes.js";
import { openPickerModal } from "../../ui/components/PickerModal.js";
import { calculateEncounterXp, getParticipantXp } from "./encounterUtils.js";
import { getXpForCr, normalizeCr } from "../../utils/xp.js";

// Encounter detail page for editing participants and notes.
export const renderEncounterDetailPage = ({ app, campaignId, encounterId, campaign }) => {
  const encounter = campaign.encounters?.[encounterId];
  if (!encounter) {
    return createElement("div", { className: "card", text: "Encounter not found." });
  }

  const participants = (encounter.participants || []).map((participant) => ({ ...participant }));

  const form = createElement("form", { className: "form-grid" });
  const titleInput = createElement("input", {
    className: "input",
    attrs: { type: "text", required: true, value: encounter.title || "", "aria-label": "Encounter title" },
  });
  const mapInput = createElement("input", {
    className: "input",
    attrs: { type: "text", required: true, value: encounter.mapRef || "", "aria-label": "Map reference" },
  });
  const tacticsInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, required: true, "aria-label": "Tactics" },
  });
  tacticsInput.value = encounter.tactics || "";
  const treasureInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, required: true, "aria-label": "Treasure notes" },
  });
  treasureInput.value = encounter.treasureNotes || "";

  const notesInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, "aria-label": "Encounter notes" },
  });
  notesInput.value = encounter.notes || "";

  const tagsInput = createElement("input", {
    className: "input",
    attrs: {
      type: "text",
      list: "encounter-tags",
      value: (encounter.tags || []).join(", "),
      "aria-label": "Encounter tags",
    },
  });
  const tagList = createElement("datalist", {
    attrs: { id: "encounter-tags" },
    children: app.searchService.suggestTags({ scopes: ["encounters"] }).map((tag) =>
      createElement("option", { attrs: { value: tag } })
    ),
  });

  const participantsContainer = createElement("div", { className: "form-grid" });
  const xpSummary = createElement("div", { className: "card" });

  const renderXpSummary = () => {
    const summary = calculateEncounterXp({ encounter: { participants }, campaign });
    xpSummary.innerHTML = "";
    xpSummary.append(
      createElement("h3", { text: "XP Summary" }),
      createElement("p", { text: `Total XP: ${summary.totalXp.toLocaleString()}` }),
      createElement("p", {
        text: `Per member (${summary.partySize}): ${summary.xpPerMember.toLocaleString()}`,
      })
    );

    if (summary.warnings.length) {
      xpSummary.append(
        createElement("p", {
          className: "text-muted",
          text: `Warnings: ${summary.warnings.join(" ")}`,
        })
      );
    }
  };

  const renderParticipants = () => {
    participantsContainer.innerHTML = "";
    if (!participants.length) {
      participantsContainer.append(createElement("p", { text: "No participants yet." }));
      renderXpSummary();
      return;
    }

    participants.forEach((participant, index) => {
      const isCreature = participant.type === "creature";
      const entity = isCreature
        ? campaign.creatures?.[participant.refId]
        : campaign.npcs?.[participant.refId];
      const name = entity?.name || "Unknown";
      const openButton = createElement("button", {
        className: "button secondary small",
        text: name,
        attrs: { type: "button" },
      });
      const quantityInput = createElement("input", {
        className: "input",
        attrs: {
          type: "number",
          min: 1,
          value: participant.quantity || 1,
          "aria-label": "Quantity",
        },
      });
      const roleInput = createElement("input", {
        className: "input",
        attrs: { type: "text", value: participant.role || "", "aria-label": "Role" },
      });
      const xpValue = createElement("span", {
        className: "text-muted",
        text: `XP ${getParticipantXp({ participant, campaign }).toLocaleString()}`,
      });
      const removeButton = createElement("button", {
        className: "button secondary",
        text: "Remove",
        attrs: { type: "button" },
      });

      quantityInput.addEventListener("input", () => {
        participants[index].quantity = Math.max(1, Number(quantityInput.value || 1));
        xpValue.textContent = `XP ${getParticipantXp({ participant: participants[index], campaign }).toLocaleString()}`;
        renderXpSummary();
      });

      roleInput.addEventListener("input", () => {
        participants[index].role = roleInput.value.trim();
      });

      removeButton.addEventListener("click", () => {
        participants.splice(index, 1);
        renderParticipants();
      });

      openButton.addEventListener("click", () => {
        if (participant.type === "creature") {
          window.location.hash = routes.creatureDetail(campaignId, participant.refId);
          return;
        }
        window.location.hash = routes.npcDetail(campaignId, participant.refId);
      });

      const row = createElement("div", {
        className: "form-row inline",
        children: [
          createElement("div", {
            className: "stack",
            children: [
              openButton,
              createElement("span", { className: "text-muted", text: isCreature ? "Creature" : "NPC" }),
            ],
          }),
          createElement("label", { text: "Qty", children: [quantityInput] }),
          createElement("label", { text: "Role", children: [roleInput] }),
          xpValue,
          removeButton,
        ],
      });
      participantsContainer.append(row);
    });

    renderXpSummary();
  };

  const openCreatureQuickCreate = () => {
    const nameInput = createElement("input", {
      className: "input",
      attrs: { type: "text", required: true, "aria-label": "Creature name" },
    });
    const typeInput = createElement("input", {
      className: "input",
      attrs: { type: "text", required: true, "aria-label": "Creature type" },
    });
    const crInput = createElement("input", {
      className: "input",
      attrs: { type: "text", required: true, "aria-label": "Creature CR" },
    });
    const sourceLabelInput = createElement("input", {
      className: "input",
      attrs: { type: "text", "aria-label": "Source label" },
    });
    const sourceUrlInput = createElement("input", {
      className: "input",
      attrs: { type: "url", "aria-label": "Source URL" },
    });

    const form = createElement("form", {
      className: "form-grid",
      children: [
        createElement("label", { text: "Name", children: [nameInput] }),
        createElement("label", { text: "Type", children: [typeInput] }),
        createElement("label", { text: "CR", children: [crInput] }),
        createElement("label", { text: "Source label", children: [sourceLabelInput] }),
        createElement("label", { text: "Source URL", children: [sourceUrlInput] }),
        createElement("button", { className: "button", text: "Create", attrs: { type: "submit" } }),
      ],
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!nameInput.value.trim() || !typeInput.value.trim() || !crInput.value.trim()) {
        app.banners.show("Creature name, type, and CR are required.", "error");
        return;
      }
      const normalizedCr = normalizeCr(crInput.value);
      const xpAward = getXpForCr(normalizedCr);
      if (xpAward === null) {
        app.banners.show("CR not recognized. XP saved as 0.", "warning");
      }
      const timestamp = nowIso();
      const creature = {
        id: createId("crt"),
        campaignId,
        name: nameInput.value.trim(),
        type: typeInput.value.trim(),
        cr: normalizedCr,
        xpAward: xpAward ?? 0,
        source: {
          label: sourceLabelInput.value.trim(),
          url: sourceUrlInput.value.trim(),
        },
        extracted: { ac: "", hp: "", initiative: "" },
        statBlock: "",
        notes: "",
        tags: [],
        variantOfCreatureId: null,
        status: "wip",
        createdAt: timestamp,
        updatedAt: timestamp,
        isArchived: false,
        archivedAt: null,
      };
      await app.campaignStore.addCreature(creature);
      app.modal.close();
      addParticipant({ type: "creature", refId: creature.id });
    });

    app.modal.open({ title: "Quick create creature", content: form, actions: [] });
  };

  const openNpcQuickCreate = () => {
    const nameInput = createElement("input", {
      className: "input",
      attrs: { type: "text", required: true, "aria-label": "NPC name" },
    });
    const roleInput = createElement("input", {
      className: "input",
      attrs: { type: "text", "aria-label": "NPC role" },
    });
    const classInput = createElement("input", {
      className: "input",
      attrs: { type: "text", "aria-label": "NPC class" },
    });
    const levelInput = createElement("input", {
      className: "input",
      attrs: { type: "number", min: 0, value: 1, "aria-label": "NPC level" },
    });

    const form = createElement("form", {
      className: "form-grid",
      children: [
        createElement("label", { text: "Name", children: [nameInput] }),
        createElement("label", { text: "Role", children: [roleInput] }),
        createElement("label", { text: "Class", children: [classInput] }),
        createElement("label", { text: "Level", children: [levelInput] }),
        createElement("button", { className: "button", text: "Create", attrs: { type: "submit" } }),
      ],
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!nameInput.value.trim()) {
        app.banners.show("NPC name is required.", "error");
        return;
      }
      const timestamp = nowIso();
      const npc = {
        id: createId("npc"),
        campaignId,
        name: nameInput.value.trim(),
        role: roleInput.value.trim(),
        class: classInput.value.trim(),
        level: Number(levelInput.value || 1),
        attributes: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        keySkills: [],
        notes: "",
        tags: [],
        status: "wip",
        createdAt: timestamp,
        updatedAt: timestamp,
        isArchived: false,
        archivedAt: null,
      };
      await app.campaignStore.addNpc(npc);
      app.modal.close();
      addParticipant({ type: "npc", refId: npc.id });
    });

    app.modal.open({ title: "Quick create NPC", content: form, actions: [] });
  };

  const addParticipant = ({ type, refId }) => {
    const existingIndex = participants.findIndex(
      (entry) => entry.type === type && entry.refId === refId
    );
    if (existingIndex >= 0) {
      participants[existingIndex].quantity = (participants[existingIndex].quantity || 1) + 1;
    } else {
      participants.push({ type, refId, quantity: 1, role: "" });
    }
    renderParticipants();
  };

  const openCreaturePicker = () => {
    const items = Object.values(campaign.creatures || {});
    openPickerModal({
      app,
      title: "Add creature",
      items,
      getTitle: (item) => item.name,
      getMeta: (item) => [item.type, item.cr ? `CR ${item.cr}` : ""].filter(Boolean).join(" • "),
      onPick: (item) => {
        app.modal.close();
        addParticipant({ type: "creature", refId: item.id });
      },
      onQuickCreate: openCreatureQuickCreate,
      searchPlaceholder: "Search creatures",
    });
  };

  const openNpcPicker = () => {
    const items = Object.values(campaign.npcs || {});
    openPickerModal({
      app,
      title: "Add NPC",
      items,
      getTitle: (item) => item.name,
      getMeta: (item) => [item.role, item.class ? `${item.class} ${item.level || ""}` : ""].filter(Boolean).join(" • "),
      onPick: (item) => {
        app.modal.close();
        addParticipant({ type: "npc", refId: item.id });
      },
      onQuickCreate: openNpcQuickCreate,
      searchPlaceholder: "Search NPCs",
    });
  };

  const addCreatureButton = createElement("button", {
    className: "button secondary",
    text: "Add creature",
    attrs: { type: "button" },
  });
  const addNpcButton = createElement("button", {
    className: "button secondary",
    text: "Add NPC",
    attrs: { type: "button" },
  });
  addCreatureButton.addEventListener("click", openCreaturePicker);
  addNpcButton.addEventListener("click", openNpcPicker);

  form.append(
    createElement("label", { text: "Title", children: [titleInput] }),
    createElement("label", { text: "Map reference", children: [mapInput] }),
    createElement("label", { text: "Participants", children: [participantsContainer] }),
    createElement("div", {
      className: "form-row inline",
      children: [addCreatureButton, addNpcButton],
    }),
    xpSummary,
    createElement("label", { text: "Tactics", children: [tacticsInput] }),
    createElement("label", { text: "Treasure notes", children: [treasureInput] }),
    createElement("label", { text: "Notes", children: [notesInput] }),
    createElement("label", { text: "Tags (comma separated)", children: [tagsInput, tagList] })
  );

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!participants.length) {
      app.banners.show("Add at least one participant to calculate XP.", "warning");
    }

    const xpWarnings = calculateEncounterXp({ encounter: { participants }, campaign }).warnings;
    if (xpWarnings.length) {
      app.banners.show(`XP warnings: ${xpWarnings.join(" ")}`, "warning");
    }

    const tags = normalizeTags(tagsInput.value.split(",").map((tag) => tag.trim()).filter(Boolean));
    await app.campaignStore.updateEncounter(encounterId, {
      title: titleInput.value.trim(),
      mapRef: mapInput.value.trim(),
      tactics: tacticsInput.value.trim(),
      treasureNotes: treasureInput.value.trim(),
      participants: participants.map((participant) => ({
        ...participant,
        quantity: Math.max(1, Number(participant.quantity || 1)),
      })),
      notes: notesInput.value.trim(),
      tags,
    });
    app.toasts.show("Encounter updated.");
  });

  const saveButton = createElement("button", {
    className: "button",
    text: "Save changes",
    attrs: { type: "submit" },
  });
  form.append(saveButton);

  const archiveAction = () => {
    const content = createElement("p", { text: "Archive this encounter? You can restore it later." });
    app.modal.open({
      title: "Archive encounter",
      content,
      actions: [
        {
          label: "Archive",
          variant: "danger",
          onClick: async () => {
            app.modal.close();
            await app.campaignStore.updateEncounter(encounterId, { isArchived: true, archivedAt: nowIso() });
            app.toasts.show("Encounter archived.");
            window.location.hash = routes.moduleList(campaignId, "encounters");
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => app.modal.close() },
      ],
    });
  };

  const restoreAction = () => {
    const content = createElement("p", { text: "Restore this encounter to active status?" });
    app.modal.open({
      title: "Restore encounter",
      content,
      actions: [
        {
          label: "Restore",
          variant: "primary",
          onClick: async () => {
            app.modal.close();
            await app.campaignStore.updateEncounter(encounterId, { isArchived: false, archivedAt: null });
            app.toasts.show("Encounter restored.");
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => app.modal.close() },
      ],
    });
  };

  const sessionBacklinks = Object.values(campaign.sessions || {})
    .filter((session) => (session.encounterIds || []).includes(encounterId))
    .map((session) => ({
      label: session.title || "Untitled session",
      meta: session.date || "",
      onClick: () => {
        window.location.hash = routes.sessionDetail(campaignId, session.id);
      },
    }));

  renderParticipants();

  const layout = createDetailLayout({
    title: encounter.title,
    actions: [
      encounter.isArchived
        ? { label: "Restore", variant: "primary", onClick: restoreAction }
        : { label: "Archive", variant: "danger", onClick: archiveAction },
    ],
    mainContent: form,
    sidebarContent: createReferencesPanel({
      sections: [
        {
          title: "Used in sessions",
          items: sessionBacklinks,
        },
      ],
    }),
  });

  return layout;
};
