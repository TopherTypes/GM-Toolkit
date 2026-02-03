import { createElement, qsa } from "../dom.js";

// Modal dialog manager with accessible focus handling and focus trapping.
export const createModal = () => {
  let backdrop = null;
  let previousFocus = null;
  let keydownHandler = null;
  let titleId = 0;

  const focusableSelector =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  const getFocusableElements = (scope) => qsa(focusableSelector, scope);

  const close = () => {
    if (backdrop) {
      backdrop.remove();
    }
    backdrop = null;
    if (keydownHandler) {
      document.removeEventListener("keydown", keydownHandler);
      keydownHandler = null;
    }
    if (previousFocus && previousFocus.focus) {
      previousFocus.focus();
    }
    previousFocus = null;
  };

  const open = ({ title, content, actions = [], closeOnEscape = true, closeOnBackdrop = true }) => {
    close();
    const modalTitleId = `modal-title-${titleId++}`;
    const modal = createElement("div", {
      className: "modal",
      attrs: { role: "dialog", "aria-modal": "true", "aria-labelledby": modalTitleId, tabIndex: -1 },
    });
    const titleEl = createElement("h2", { text: title, attrs: { id: modalTitleId } });
    const closeButton = createElement("button", {
      className: "modal__close",
      text: "Close",
      attrs: { type: "button", "aria-label": "Close modal" },
    });
    const header = createElement("div", { className: "modal__header", children: [titleEl, closeButton] });
    const body = createElement("div", { className: "modal__body", children: [content] });
    const actionsRow = createElement("div", { className: "modal__actions" });

    actions.forEach((action) => {
      const button = createElement("button", {
        className: `button ${action.variant || "secondary"}`.trim(),
        text: action.label,
        attrs: { type: "button", ...(action.attrs || {}) },
      });
      button.disabled = Boolean(action.disabled);
      action.onMount?.(button);
      button.addEventListener("click", () => {
        action.onClick?.();
      });
      actionsRow.append(button);
    });

    modal.append(header, body, actionsRow);

    backdrop = createElement("div", {
      className: "modal-backdrop",
      children: [modal],
    });

    const handleBackdropClick = (event) => {
      if (event.target === backdrop && closeOnBackdrop) {
        close();
      }
    };
    backdrop.addEventListener("click", handleBackdropClick);
    closeButton.addEventListener("click", () => close());

    keydownHandler = (event) => {
      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const focusable = getFocusableElements(modal);
      if (!focusable.length) {
        event.preventDefault();
        modal.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.append(backdrop);
    previousFocus = document.activeElement;
    document.addEventListener("keydown", keydownHandler);
    const focusable = getFocusableElements(modal);
    (focusable[0] || modal).focus();
  };

  return { open, close };
};
