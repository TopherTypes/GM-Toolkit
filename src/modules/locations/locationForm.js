import { createElement } from "../../ui/dom.js";
import { normalizeTags } from "../../utils/strings.js";

// Location form builder shared by create/edit flows.
export const createLocationForm = ({
  location,
  onSubmit,
  onCancel,
  tagSuggestions = [],
  locations = [],
} = {}) => {
  const form = createElement("form", { className: "form-grid" });

  // Primary fields for the location entity.
  const nameInput = createElement("input", {
    className: "input",
    attrs: { type: "text", required: true, value: location?.name || "", "aria-label": "Location name" },
  });
  const descriptionInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 6, "aria-label": "Location description" },
  });
  descriptionInput.value = location?.description || "";

  // Parent location selector with a none/default option.
  const parentSelect = createElement("select", {
    className: "select",
    attrs: { "aria-label": "Parent location" },
  });
  parentSelect.append(createElement("option", { text: "No parent", attrs: { value: "" } }));

  const sortedLocations = [...locations]
    .filter((candidate) => candidate.id !== location?.id)
    .sort((a, b) => a.name.localeCompare(b.name));

  sortedLocations.forEach((candidate) => {
    const suffix = candidate.isArchived ? " (archived)" : "";
    parentSelect.append(
      createElement("option", {
        text: `${candidate.name}${suffix}`,
        attrs: { value: candidate.id },
      })
    );
  });
  parentSelect.value = location?.parentLocationId || "";

  // Tags are optional but normalized to keep storage consistent across modules.
  const tagsInput = createElement("input", {
    className: "input",
    attrs: {
      type: "text",
      list: "location-tags",
      value: (location?.tags || []).join(", "),
      "aria-label": "Location tags",
    },
  });
  const tagList = createElement("datalist", {
    attrs: { id: "location-tags" },
    children: tagSuggestions.map((tag) => createElement("option", { attrs: { value: tag } })),
  });

  form.append(
    createElement("label", { text: "Name", children: [nameInput] }),
    createElement("label", { text: "Parent location", children: [parentSelect] }),
    createElement("label", { text: "Description", children: [descriptionInput] }),
    createElement("label", { text: "Tags (comma separated)", children: [tagsInput, tagList] })
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Normalize inputs for storage in the campaign data model.
    const tagValues = tagsInput.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    onSubmit?.({
      name: nameInput.value.trim(),
      parentLocationId: parentSelect.value || null,
      description: descriptionInput.value.trim(),
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
