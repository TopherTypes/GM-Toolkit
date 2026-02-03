import { createElement } from "../../ui/dom.js";
import { normalizeTags } from "../../utils/strings.js";

// NPC form builder for create/edit flows.
export const createNpcForm = ({ npc, onSubmit, onCancel, tagSuggestions = [] }) => {
  const form = createElement("form", { className: "form-grid" });
  const nameInput = createElement("input", {
    className: "input",
    attrs: { type: "text", required: true, value: npc?.name || "", "aria-label": "NPC name" },
  });
  const roleInput = createElement("input", {
    className: "input",
    attrs: { type: "text", value: npc?.role || "", "aria-label": "NPC role" },
  });
  const classInput = createElement("input", {
    className: "input",
    attrs: { type: "text", value: npc?.class || "", "aria-label": "NPC class" },
  });
  const levelInput = createElement("input", {
    className: "input",
    attrs: { type: "number", min: 0, value: npc?.level ?? 1, "aria-label": "NPC level" },
  });
  const notesInput = createElement("textarea", {
    className: "textarea",
    attrs: { rows: 4, "aria-label": "NPC notes" },
  });
  notesInput.value = npc?.notes || "";

  const tagsInput = createElement("input", {
    className: "input",
    attrs: {
      type: "text",
      list: "npc-tags",
      value: (npc?.tags || []).join(", "),
      "aria-label": "NPC tags",
    },
  });
  const tagList = createElement("datalist", {
    attrs: { id: "npc-tags" },
    children: tagSuggestions.map((tag) => createElement("option", { attrs: { value: tag } })),
  });

  const statusToggle = createElement("input", {
    attrs: { type: "checkbox", "aria-label": "Mark NPC as complete" },
  });
  statusToggle.checked = (npc?.status || "complete") === "complete";

  const attributeInputs = ["str", "dex", "con", "int", "wis", "cha"].map((attr) =>
    createElement("input", {
      className: "input",
      attrs: {
        type: "number",
        min: 1,
        value: npc?.attributes?.[attr] ?? 10,
        "aria-label": `${attr.toUpperCase()} score`,
      },
    })
  );

  const skillContainer = createElement("div", { className: "form-grid npc-key-skills" });
  const skills = npc?.keySkills ? npc.keySkills.map((skill) => ({ ...skill })) : [];

  const renderSkills = () => {
    skillContainer.innerHTML = "";
    skills.forEach((skill, index) => {
      const nameField = createElement("input", {
        className: "input",
        attrs: { type: "text", value: skill.name || "", "aria-label": "Skill name" },
      });
      const bonusField = createElement("input", {
        className: "input",
        attrs: { type: "number", value: skill.bonus ?? 0, "aria-label": "Skill bonus" },
      });
      nameField.addEventListener("input", () => {
        skills[index].name = nameField.value;
      });
      bonusField.addEventListener("input", () => {
        skills[index].bonus = Number(bonusField.value || 0);
      });
      const removeButton = createElement("button", {
        className: "button secondary",
        text: "Remove",
        attrs: { type: "button" },
      });
      removeButton.addEventListener("click", () => {
        skills.splice(index, 1);
        renderSkills();
      });
      skillContainer.append(
        createElement("div", {
          className: "form-row inline",
          children: [nameField, bonusField, removeButton],
        })
      );
    });
  };

  renderSkills();

  const addSkillButton = createElement("button", {
    className: "button secondary",
    text: "Add skill",
    attrs: { type: "button" },
  });
  addSkillButton.addEventListener("click", () => {
    skills.push({ name: "", bonus: 0 });
    renderSkills();
  });

  form.append(
    createElement("label", { text: "Name", children: [nameInput] }),
    // Keep completion state visible at the top of the form for quick context.
    createElement("label", {
      text: "Completion",
      children: [
        createElement("div", {
          className: "form-row inline",
          children: [
            createElement("span", { className: "text-muted", text: "WIP" }),
            statusToggle,
            createElement("span", { className: "text-muted", text: "Complete" }),
          ],
        }),
      ],
    }),
    createElement("label", { text: "Role", children: [roleInput] }),
    createElement("label", { text: "Class", children: [classInput] }),
    createElement("label", { text: "Level", children: [levelInput] }),
    createElement("div", {
      className: "form-row inline",
      children: attributeInputs.map((input, index) =>
        createElement("label", {
          text: ["STR", "DEX", "CON", "INT", "WIS", "CHA"][index],
          children: [input],
        })
      ),
    }),
    createElement("label", { text: "Key Skills", children: [skillContainer, addSkillButton] }),
    createElement("label", { text: "Notes", children: [notesInput] }),
    createElement("label", { text: "Tags (comma separated)", children: [tagsInput, tagList] })
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const tagValues = tagsInput.value.split(",").map((tag) => tag.trim()).filter(Boolean);
    const attributes = {
      str: Number(attributeInputs[0].value || 10),
      dex: Number(attributeInputs[1].value || 10),
      con: Number(attributeInputs[2].value || 10),
      int: Number(attributeInputs[3].value || 10),
      wis: Number(attributeInputs[4].value || 10),
      cha: Number(attributeInputs[5].value || 10),
    };
    onSubmit?.({
      name: nameInput.value.trim(),
      role: roleInput.value.trim(),
      class: classInput.value.trim(),
      level: Number(levelInput.value || 1),
      status: statusToggle.checked ? "complete" : "wip",
      attributes,
      keySkills: skills.map((skill) => ({
        name: (skill.name || "").trim(),
        bonus: Number(skill.bonus || 0),
      })),
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
