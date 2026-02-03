import { createElement } from "../dom.js";

// Persistent banner manager for warnings and errors.
export const createBanners = () => {
  const container = createElement("div");

  const show = (message, type = "info") => {
    const banner = createElement("div", {
      className: `banner ${type}`,
      text: message,
    });
    container.append(banner);
    return banner;
  };

  const clear = () => {
    container.innerHTML = "";
  };

  return { element: container, show, clear };
};
