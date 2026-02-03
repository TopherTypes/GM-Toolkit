import { createElement } from "../dom.js";

// Modal dialog manager with accessible focus handling.
export const createModal = () => {
  let backdrop = null;

  const close = () => {
    backdrop?.remove();
    backdrop = null;
  };

  const open = ({ title, content, actions = [] }) => {
    close();
    const modal = createElement("div", { className: "modal" });
    const titleEl = createElement("h2", { text: title });
    const body = createElement("div", { children: [content] });
    const actionsRow = createElement("div", { className: "modal__actions" });

    actions.forEach((action) => {
      const button = createElement("button", {
        className: `button ${action.variant || "secondary"}`.trim(),
        text: action.label,
        attrs: { type: "button" },
      });
      button.addEventListener("click", () => {
        action.onClick?.();
      });
      actionsRow.append(button);
    });

    modal.append(titleEl, body, actionsRow);

    backdrop = createElement("div", {
      className: "modal-backdrop",
      attrs: { role: "dialog", "aria-modal": "true" },
      children: [modal],
    });

    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        close();
      }
    });

    document.body.append(backdrop);
  };

  return { open, close };
};
