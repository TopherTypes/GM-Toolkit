import { createElement } from "../../ui/dom.js";
import { normalizeTags } from "../../utils/strings.js";
import { generateUniquePassphrase, normalizePassphrase } from "./passphraseService.js";

// Item form builder shared by create/edit flows.
export const createItemForm = ({
  item,
  onSubmit,
  onCancel,
  tagSuggestions = [],
  existingPassphrases = [],
  onPassphraseMessage,
} = {}) => {
  const form = createElement("form", { className: "form-grid" });

  // Core item inputs for name and passphrase pairing.
  const nameInput = createElement("input", {
    className: "input",
    attrs: { type: "text", required: true, value: item?.name || "", "aria-label": "Item name" },
  });
  const passphraseInput = createElement("input", {
    className: "input",
    attrs: {
      type: "text",
      value: item?.passphrase || "",
      "aria-label": "Item passphrase",
      placeholder: "e.g., ashen key",
    },
  });

  const passphraseHint = createElement("p", {
    className: "text-muted",
    text: "The passphrase appears on both unidentified and identified cards.",
  });

  const regenerateButton = createElement("button", {
    className: "button secondary",
    text: "Regenerate",
    attrs: { type: "button" },
  });

  const setPassphrase = (result) => {
    passphraseInput.value = result.passphrase;
    if (result.message) {
      onPassphraseMessage?.(result.message);
    }
  };

  regenerateButton.addEventListener("click", () => {
    const result = generateUniquePassphrase({ existingPassphrases });
    setPassphrase(result);
  });

  // Text areas capture unidentified and identified card copy.
  const descriptionInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, "aria-label": "Unidentified description" },
  });
  descriptionInput.value = item?.description || "";

  const detailsInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 6, "aria-label": "Identified details" },
  });
  detailsInput.value = item?.details || "";

  const notesInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, "aria-label": "Item notes" },
  });
  notesInput.value = item?.notes || "";

  const tagsInput = createElement("input", {
    className: "input",
    attrs: {
      type: "text",
      list: "item-tags",
      value: (item?.tags || []).join(", "),
      "aria-label": "Item tags",
    },
  });
  const tagList = createElement("datalist", {
    attrs: { id: "item-tags" },
    children: tagSuggestions.map((tag) => createElement("option", { attrs: { value: tag } })),
  });

  // Ensure a default passphrase exists when creating new items.
  if (!passphraseInput.value.trim()) {
    setPassphrase(generateUniquePassphrase({ existingPassphrases }));
  }

  form.append(
    createElement("label", { text: "Name", children: [nameInput] }),
    createElement("label", {
      text: "Passphrase",
      children: [
        passphraseInput,
        createElement("div", { className: "form-row inline", children: [regenerateButton] }),
        passphraseHint,
      ],
    }),
    createElement("label", { text: "Unidentified description", children: [descriptionInput] }),
    createElement("label", { text: "Identified details", children: [detailsInput] }),
    createElement("label", { text: "Notes", children: [notesInput] }),
    createElement("label", { text: "Tags (comma separated)", children: [tagsInput, tagList] })
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const tagValues = tagsInput.value.split(",").map((tag) => tag.trim()).filter(Boolean);

    // Normalize passphrases for consistent storage and collision checks.
    const normalizedPassphrase = normalizePassphrase(passphraseInput.value);

    onSubmit?.({
      name: nameInput.value.trim(),
      passphrase: normalizedPassphrase,
      description: descriptionInput.value.trim(),
      details: detailsInput.value.trim(),
      notes: notesInput.value.trim(),
      tags: normalizeTags(tagValues),
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
