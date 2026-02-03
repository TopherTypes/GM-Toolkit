import { createElement } from "../dom.js";

// References/backlinks panel renderer with optional sections.
export const createReferencesPanel = ({ title = "References", sections = [] } = {}) => {
  const container = createElement("div", { className: "references" });
  const header = createElement("h3", { text: title });
  const content = createElement("div", { className: "references__content" });

  const activeSections = sections.filter((section) => section.items?.length);
  if (!activeSections.length) {
    content.append(
      createElement("p", {
        text: "No references yet.",
        className: "references__empty",
      })
    );
  } else {
    activeSections.forEach((section) => {
      const sectionHeader = createElement("h4", { text: section.title });
      const list = createElement("div", { className: "references__list" });
      section.items.forEach((item) => {
        const button = createElement("button", {
          className: "button secondary small",
          text: item.label,
          attrs: { type: "button" },
        });
        button.addEventListener("click", () => item.onClick?.());
        const row = createElement("div", {
          className: "references__item",
          children: [button],
        });
        if (item.meta) {
          row.append(createElement("span", { className: "references__meta", text: item.meta }));
        }
        list.append(row);
      });
      content.append(sectionHeader, list);
    });
  }

  container.append(header, content);
  return container;
};
