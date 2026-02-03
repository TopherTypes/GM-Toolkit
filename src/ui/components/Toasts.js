import { createElement } from "../dom.js";

// Toast notification manager for transient messages.
export const createToasts = () => {
  const container = createElement("div", { className: "toast-container" });

  const show = (message, { timeout = 4000 } = {}) => {
    const toast = createElement("div", { className: "toast", text: message });
    container.append(toast);
    setTimeout(() => {
      toast.remove();
    }, timeout);
  };

  return { element: container, show };
};
