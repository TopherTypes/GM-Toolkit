import { createElement } from "../../ui/dom.js";

// Build the session review form for create/edit flows.
export const createReviewForm = ({
  review,
  sessions = [],
  npcs = [],
  locations = [],
  onSubmit,
  onCancel,
}) => {
  const form = createElement("form", { className: "form-grid" });

  // Session linking is required for every review entry.
  const sessionSelect = createElement("select", {
    className: "select",
    attrs: { required: true, "aria-label": "Linked session" },
  });
  sessionSelect.append(createElement("option", { text: "Select a session", attrs: { value: "" } }));

  const sortedSessions = [...sessions].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  sortedSessions.forEach((session) => {
    const label = [session.title || "Untitled session", session.date ? `(${session.date})` : ""]
      .filter(Boolean)
      .join(" ");
    sessionSelect.append(createElement("option", { text: label, attrs: { value: session.id } }));
  });
  sessionSelect.value = review?.sessionId || "";

  const summaryInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, "aria-label": "Session summary" },
  });
  summaryInput.value = review?.summary || "";

  const keyMomentsInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, "aria-label": "Key moments" },
  });
  keyMomentsInput.value = review?.keyMoments || "";

  const outcomesInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, "aria-label": "Outcomes" },
  });
  outcomesInput.value = review?.outcomes || "";

  const rewardsInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, "aria-label": "Rewards given" },
  });
  rewardsInput.value = review?.rewards || "";

  const infoFreeTextInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, "aria-label": "Information changes (free text)" },
  });
  infoFreeTextInput.value = review?.informationChanges?.freeText || "";

  const nextHooksInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, "aria-label": "Next hooks" },
  });
  nextHooksInput.value = review?.nextHooks || "";

  const gmNotesInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, "aria-label": "GM notes" },
  });
  gmNotesInput.value = review?.gmNotes || "";

  // Maintain a working copy of structured information change records.
  const changeRecords = (review?.informationChanges?.changes || []).map((change) => ({ ...change }));
  const changesContainer = createElement("div", { className: "form-grid" });

  const entityTypes = [
    { value: "npc", label: "NPC" },
    { value: "location", label: "Location" },
    { value: "plotline", label: "Plotline" },
    { value: "other", label: "Other" },
  ];

  const changeTypes = [
    { value: "updated", label: "Updated" },
    { value: "revealed", label: "Revealed" },
    { value: "moved", label: "Moved" },
    { value: "removed", label: "Removed" },
    { value: "note", label: "Note" },
  ];

  const buildEntitySelect = ({ entityType, entityId }) => {
    const select = createElement("select", {
      className: "select",
      attrs: { "aria-label": "Linked entity" },
    });
    select.append(createElement("option", { text: "Select entity (optional)", attrs: { value: "" } }));
    const source = entityType === "npc" ? npcs : locations;
    const sorted = [...source].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    sorted.forEach((entity) => {
      select.append(createElement("option", { text: entity.name, attrs: { value: entity.id } }));
    });
    select.value = entityId || "";
    return select;
  };

  const renderChangeRecords = () => {
    changesContainer.innerHTML = "";
    if (!changeRecords.length) {
      changesContainer.append(createElement("p", { text: "No structured changes yet." }));
      return;
    }

    changeRecords.forEach((change, index) => {
      const entityTypeSelect = createElement("select", {
        className: "select",
        attrs: { "aria-label": "Entity type" },
      });
      entityTypes.forEach((option) => {
        entityTypeSelect.append(
          createElement("option", { text: option.label, attrs: { value: option.value } })
        );
      });
      entityTypeSelect.value = change.entityType || "other";

      const changeTypeSelect = createElement("select", {
        className: "select",
        attrs: { "aria-label": "Change type" },
      });
      changeTypes.forEach((option) => {
        changeTypeSelect.append(
          createElement("option", { text: option.label, attrs: { value: option.value } })
        );
      });
      changeTypeSelect.value = change.changeType || "updated";

      const entityIdInput = createElement("input", {
        className: "input",
        attrs: {
          type: "text",
          placeholder: "Reference ID (optional)",
          "aria-label": "Reference ID",
        },
      });
      entityIdInput.value = change.entityId || "";

      const noteInput = createElement("textarea", {
        className: "textarea",
        attrs: { rows: 2, "aria-label": "Change note" },
      });
      noteInput.value = change.note || "";

      const removeButton = createElement("button", {
        className: "button secondary",
        text: "Remove",
        attrs: { type: "button" },
      });

      const updateChange = () => {
        const entityType = entityTypeSelect.value;
        changeRecords[index] = {
          ...changeRecords[index],
          entityType,
          changeType: changeTypeSelect.value,
          entityId: entityIdInput.value.trim(),
          note: noteInput.value.trim(),
        };
      };

      const updateEntityInput = () => {
        const nextEntityType = entityTypeSelect.value;
        changeRecords[index].entityType = nextEntityType;
        changeRecords[index].entityId = "";
        renderChangeRecords();
      };

      const entityFieldWrapper = createElement("div", { className: "stack" });
      const renderEntityField = () => {
        entityFieldWrapper.innerHTML = "";
        if (entityTypeSelect.value === "npc" || entityTypeSelect.value === "location") {
          const entitySelect = buildEntitySelect({
            entityType: entityTypeSelect.value,
            entityId: change.entityId,
          });
          entitySelect.addEventListener("change", () => {
            entityIdInput.value = entitySelect.value;
            updateChange();
          });
          entityFieldWrapper.append(entitySelect);
          entityIdInput.value = entitySelect.value;
          return;
        }
        entityFieldWrapper.append(entityIdInput);
      };

      entityTypeSelect.addEventListener("change", updateEntityInput);
      changeTypeSelect.addEventListener("change", updateChange);
      entityIdInput.addEventListener("input", updateChange);
      noteInput.addEventListener("input", updateChange);

      removeButton.addEventListener("click", () => {
        changeRecords.splice(index, 1);
        renderChangeRecords();
      });

      renderEntityField();

      changesContainer.append(
        createElement("div", {
          className: "card",
          children: [
            createElement("div", {
              className: "form-row inline",
              children: [
                createElement("label", { text: "Entity type", children: [entityTypeSelect] }),
                createElement("label", { text: "Change", children: [changeTypeSelect] }),
                createElement("label", { text: "Entity", children: [entityFieldWrapper] }),
              ],
            }),
            createElement("label", { text: "Note", children: [noteInput] }),
            removeButton,
          ],
        })
      );
    });
  };

  renderChangeRecords();

  const addChangeButton = createElement("button", {
    className: "button secondary",
    text: "Add change",
    attrs: { type: "button" },
  });
  addChangeButton.addEventListener("click", () => {
    changeRecords.push({
      entityType: "npc",
      entityId: "",
      changeType: "updated",
      note: "",
    });
    renderChangeRecords();
  });

  if (!sortedSessions.length) {
    form.append(
      createElement("p", {
        className: "text-muted",
        text: "Create a session first to link a review.",
      })
    );
  }

  form.append(
    createElement("label", { text: "Session", children: [sessionSelect] }),
    createElement("label", { text: "Summary", children: [summaryInput] }),
    createElement("label", { text: "Key moments", children: [keyMomentsInput] }),
    createElement("label", { text: "Outcomes", children: [outcomesInput] }),
    createElement("label", { text: "Rewards", children: [rewardsInput] }),
    createElement("label", { text: "Information changes (free text)", children: [infoFreeTextInput] }),
    createElement("label", { text: "Structured information changes", children: [changesContainer, addChangeButton] }),
    createElement("label", { text: "Next hooks", children: [nextHooksInput] }),
    createElement("label", { text: "GM notes", children: [gmNotesInput] })
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const sessionId = sessionSelect.value.trim();
    const cleanedChanges = changeRecords
      .map((change) => ({
        entityType: change.entityType || "other",
        entityId: change.entityId?.trim() || "",
        changeType: change.changeType || "note",
        note: change.note?.trim() || "",
      }))
      .filter((change) => change.note || change.entityId);

    onSubmit?.({
      sessionId,
      summary: summaryInput.value.trim(),
      keyMoments: keyMomentsInput.value.trim(),
      outcomes: outcomesInput.value.trim(),
      rewards: rewardsInput.value.trim(),
      informationChanges: {
        freeText: infoFreeTextInput.value.trim(),
        changes: cleanedChanges,
      },
      nextHooks: nextHooksInput.value.trim(),
      gmNotes: gmNotesInput.value.trim(),
    });
  });

  if (onCancel) {
    const cancelButton = createElement("button", {
      className: "button secondary",
      text: "Cancel",
      attrs: { type: "button" },
    });
    cancelButton.addEventListener("click", () => onCancel());
    form.append(cancelButton);
  }

  return form;
};
