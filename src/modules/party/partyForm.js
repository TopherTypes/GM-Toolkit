import { createElement } from "../../ui/dom.js";

// Party form builder for create/edit flows.
export const createPartyForm = ({ member, onSubmit, onCancel }) => {
  const form = createElement("form", { className: "form-grid" });

  const playerNameInput = createElement("input", {
    className: "input",
    attrs: { type: "text", required: true, value: member?.playerName || "", "aria-label": "Player name" },
  });
  const characterNameInput = createElement("input", {
    className: "input",
    attrs: { type: "text", required: true, value: member?.characterName || "", "aria-label": "Character name" },
  });
  const classInput = createElement("input", {
    className: "input",
    attrs: { type: "text", value: member?.class || "", "aria-label": "Character class" },
  });
  const levelInput = createElement("input", {
    className: "input",
    attrs: { type: "number", min: 1, value: member?.level ?? 1, "aria-label": "Character level" },
  });

  const acNormalInput = createElement("input", {
    className: "input",
    attrs: { type: "number", min: 0, value: member?.ac?.normal ?? 10, "aria-label": "Armor class" },
  });
  const acTouchInput = createElement("input", {
    className: "input",
    attrs: { type: "number", min: 0, value: member?.ac?.touch ?? 10, "aria-label": "Touch armor class" },
  });
  const acFlatFootedInput = createElement("input", {
    className: "input",
    attrs: { type: "number", min: 0, value: member?.ac?.flatFooted ?? 10, "aria-label": "Flat-footed armor class" },
  });
  const hpInput = createElement("input", {
    className: "input",
    attrs: { type: "number", min: 0, value: member?.hp ?? 0, "aria-label": "Hit points" },
  });
  const notesInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, "aria-label": "Party member notes" },
  });
  notesInput.value = member?.notes || "";

  form.append(
    createElement("label", { text: "Player name", children: [playerNameInput] }),
    createElement("label", { text: "Character name", children: [characterNameInput] }),
    createElement("label", { text: "Class", children: [classInput] }),
    createElement("label", { text: "Level", children: [levelInput] }),
    createElement("div", {
      className: "form-row inline",
      children: [
        createElement("label", { text: "AC", children: [acNormalInput] }),
        createElement("label", { text: "Touch AC", children: [acTouchInput] }),
        createElement("label", { text: "Flat-footed AC", children: [acFlatFootedInput] }),
      ],
    }),
    createElement("label", { text: "HP", children: [hpInput] }),
    createElement("label", { text: "Notes", children: [notesInput] })
  );

  // Normalize values before sending them to storage.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onSubmit?.({
      playerName: playerNameInput.value.trim(),
      characterName: characterNameInput.value.trim(),
      class: classInput.value.trim(),
      level: Number(levelInput.value || 1),
      ac: {
        normal: Number(acNormalInput.value || 0),
        touch: Number(acTouchInput.value || 0),
        flatFooted: Number(acFlatFootedInput.value || 0),
      },
      hp: Number(hpInput.value || 0),
      notes: notesInput.value.trim(),
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
