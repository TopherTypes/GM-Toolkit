import { createElement } from "../dom.js";

// Layout wrapper for detail pages with optional sidebar.
export const createDetailLayout = ({ title, actions = [], mainContent, sidebarContent }) => {
  const header = createElement("div", {
    className: "card",
    children: [
      createElement("h1", { text: title }),
      createElement("div", {
        children: actions.map((action) => {
          const button = createElement("button", {
            className: `button ${action.variant || "secondary"}`.trim(),
            text: action.label,
            attrs: { type: "button" },
          });
          button.addEventListener("click", action.onClick);
          return button;
        }),
      }),
    ],
  });

  const content = createElement("div", {
    className: "card",
    children: [mainContent],
  });

  if (!sidebarContent) {
    return createElement("div", { children: [header, content] });
  }

  const layout = createElement("div", {
    className: "form-row inline",
    children: [
      createElement("div", { children: [header, content] }),
      createElement("div", { className: "references-panel", children: [sidebarContent] }),
    ],
  });

  return layout;
};
