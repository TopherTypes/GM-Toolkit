import { createElement } from "../../ui/dom.js";
import { normalizeTags } from "../../utils/strings.js";
import { getXpForCr, normalizeCr } from "../../utils/xp.js";

// Creature form builder for create/edit flows.
export const createCreatureForm = ({
  creature,
  onSubmit,
  onCancel,
  tagSuggestions = [],
  variantOptions = [],
}) => {
  const form = createElement("form", { className: "form-grid" });

  const nameInput = createElement("input", {
    className: "input",
    attrs: { type: "text", required: true, value: creature?.name || "", "aria-label": "Creature name" },
  });
  const typeInput = createElement("input", {
    className: "input",
    attrs: { type: "text", required: true, value: creature?.type || "", "aria-label": "Creature type" },
  });
  const crInput = createElement("input", {
    className: "input",
    attrs: { type: "text", required: true, value: creature?.cr || "", "aria-label": "Creature CR" },
  });
  const xpInput = createElement("input", {
    className: "input",
    attrs: { type: "text", readOnly: true, value: "", "aria-label": "XP award" },
  });
  const xpHint = createElement("p", { className: "text-muted", text: "" });

  const sourceLabelInput = createElement("input", {
    className: "input",
    attrs: { type: "text", value: creature?.source?.label || "", "aria-label": "Source label" },
  });
  const sourceUrlInput = createElement("input", {
    className: "input",
    attrs: { type: "url", value: creature?.source?.url || "", "aria-label": "Source URL" },
  });
  const sourceButton = createElement("button", {
    className: "button secondary",
    text: "Open source",
    attrs: { type: "button" },
  });

  const acInput = createElement("input", {
    className: "input",
    attrs: { type: "text", value: creature?.extracted?.ac || "", "aria-label": "Armor Class" },
  });
  const hpInput = createElement("input", {
    className: "input",
    attrs: { type: "text", value: creature?.extracted?.hp || "", "aria-label": "Hit points" },
  });
  const initiativeInput = createElement("input", {
    className: "input",
    attrs: { type: "text", value: creature?.extracted?.initiative || "", "aria-label": "Initiative" },
  });

  const statBlockInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 10, "aria-label": "Stat block" },
  });
  statBlockInput.value = creature?.statBlock || "";

  const notesInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, "aria-label": "Creature notes" },
  });
  notesInput.value = creature?.notes || "";

  const tagsInput = createElement("input", {
    className: "input",
    attrs: {
      type: "text",
      list: "creature-tags",
      value: (creature?.tags || []).join(", "),
      "aria-label": "Creature tags",
    },
  });
  const tagList = createElement("datalist", {
    attrs: { id: "creature-tags" },
    children: tagSuggestions.map((tag) => createElement("option", { attrs: { value: tag } })),
  });

  const variantSelect = createElement("select", {
    className: "select",
    attrs: { "aria-label": "Variant of" },
  });
  variantSelect.append(createElement("option", { text: "None", attrs: { value: "" } }));
  variantOptions.forEach((option) => {
    variantSelect.append(
      createElement("option", {
        text: option.name,
        attrs: { value: option.id },
      })
    );
  });
  variantSelect.value = creature?.variantOfCreatureId || "";

  // Use a pill-style switch to represent completion status with a single, dynamic label.
  const statusToggle = createElement("input", {
    className: "toggle-switch__input",
    attrs: { type: "checkbox", "aria-label": "Toggle completion status" },
  });
  statusToggle.checked = (creature?.status || "complete") === "complete";
  const statusLabel = createElement("span", {
    className: "text-muted completion-status",
    attrs: { "aria-live": "polite" },
    text: "",
  });
  const statusSwitch = createElement("label", {
    className: "toggle-switch",
    children: [
      statusToggle,
      createElement("span", {
        className: "toggle-switch__slider",
        attrs: { "aria-hidden": "true" },
      }),
    ],
  });
  const updateStatusLabel = () => {
    statusLabel.textContent = statusToggle.checked ? "Completed" : "WIP";
  };
  updateStatusLabel();
  statusToggle.addEventListener("change", updateStatusLabel);

  const updateXpDisplay = () => {
    const xp = getXpForCr(crInput.value);
    if (xp === null) {
      xpInput.value = "Unknown";
      xpHint.textContent = "CR not recognized. XP will be saved as 0.";
      return;
    }
    xpInput.value = xp.toLocaleString();
    xpHint.textContent = "";
  };

  crInput.addEventListener("input", updateXpDisplay);
  updateXpDisplay();

  sourceButton.addEventListener("click", () => {
    const url = sourceUrlInput.value.trim();
    if (url) {
      window.open(url, "_blank", "noopener");
    }
  });

  form.append(
    createElement("label", { text: "Name", children: [nameInput] }),
    // Keep completion state visible at the top of the form for quick context.
    createElement("label", {
      text: "Completion",
      children: [
        createElement("div", {
          className: "completion-toggle",
          children: [statusLabel, statusSwitch],
        }),
      ],
    }),
    createElement("label", { text: "Type", children: [typeInput] }),
    createElement("label", { text: "CR", children: [crInput] }),
    createElement("label", { text: "XP Award (computed)", children: [xpInput, xpHint] }),
    createElement("div", {
      className: "form-row inline",
      children: [
        createElement("label", { text: "Source label", children: [sourceLabelInput] }),
        createElement("label", { text: "Source URL", children: [sourceUrlInput] }),
        sourceButton,
      ],
    }),
    createElement("label", { text: "Variant of", children: [variantSelect] }),
    createElement("div", {
      className: "form-row inline",
      children: [
        createElement("label", { text: "AC", children: [acInput] }),
        createElement("label", { text: "HP", children: [hpInput] }),
        createElement("label", { text: "Initiative", children: [initiativeInput] }),
      ],
    }),
    createElement("label", { text: "Stat block", children: [statBlockInput] }),
    createElement("label", { text: "Notes", children: [notesInput] }),
    createElement("label", { text: "Tags (comma separated)", children: [tagsInput, tagList] })
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const tagValues = tagsInput.value.split(",").map((tag) => tag.trim()).filter(Boolean);
    const normalizedCr = normalizeCr(crInput.value);
    const xpAward = getXpForCr(normalizedCr);

    onSubmit?.({
      data: {
        name: nameInput.value.trim(),
        type: typeInput.value.trim(),
        cr: normalizedCr,
        xpAward: xpAward ?? 0,
        source: {
          label: sourceLabelInput.value.trim(),
          url: sourceUrlInput.value.trim(),
        },
        extracted: {
          ac: acInput.value.trim(),
          hp: hpInput.value.trim(),
          initiative: initiativeInput.value.trim(),
        },
        statBlock: statBlockInput.value.trim(),
        notes: notesInput.value.trim(),
        tags: normalizeTags(tagValues),
        variantOfCreatureId: variantSelect.value || null,
        status: statusToggle.checked ? "complete" : "wip",
      },
      xpUnknown: xpAward === null,
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
