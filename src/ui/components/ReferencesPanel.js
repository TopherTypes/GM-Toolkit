import { createElement } from "../dom.js";

// Minimal placeholder for a references/backlinks panel.
export const createReferencesPanel = () =>
  createElement("div", {
    children: [
      createElement("h3", { text: "References" }),
      createElement("p", {
        text: "References will appear here once modules start linking entities.",
      }),
    ],
  });
