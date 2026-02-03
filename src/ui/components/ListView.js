import { createElement } from "../dom.js";

// Simple reusable list view for module list pages.
export const createListView = () => {
  const container = createElement("div", { className: "list" });

  const setItems = (items) => {
    container.innerHTML = "";
    items.forEach((item) => {
      const row = createElement("div", { className: "list-item" });
      const main = createElement("div", { children: [createElement("strong", { text: item.title })] });
      const meta = createElement("div", { className: "list-item__meta", text: item.meta || "" });
      row.append(main, meta);
      if (item.onClick) {
        row.tabIndex = 0;
        row.addEventListener("click", item.onClick);
        row.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            item.onClick();
          }
        });
      }
      container.append(row);
    });
  };

  return { element: container, setItems };
};
