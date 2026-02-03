import { createElement } from "../dom.js";

// Simple reusable list view for module list pages.
export const createListView = () => {
  const container = createElement("div", { className: "list" });

  const setItems = (items) => {
    container.innerHTML = "";
    items.forEach((item) => {
      const isClickable = Boolean(item.onClick);
      const row = createElement(isClickable ? "button" : "div", {
        className: `list-item${isClickable ? " list-item--clickable" : ""}${
          item.isArchived ? " list-item--archived" : ""
        }`,
        attrs: isClickable
          ? { type: "button", "aria-label": item.ariaLabel || `Open ${item.title}` }
          : {},
      });
      const title = createElement("strong", { className: "list-item__title", text: item.title });
      const badges = createElement("div", {
        className: "list-item__badges",
        children: (item.badges || []).map((badge) =>
          createElement("span", {
            className: `badge ${badge.variant || ""}`.trim(),
            text: badge.text,
          })
        ),
      });
      const main = createElement("div", { className: "list-item__main", children: [title, badges] });
      const meta = createElement("div", { className: "list-item__meta", text: item.meta || "" });
      row.append(main, meta);
      if (isClickable) {
        row.addEventListener("click", item.onClick);
      }
      container.append(row);
    });
  };

  return { element: container, setItems };
};
