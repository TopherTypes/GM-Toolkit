import { createElement } from "../dom.js";

// Badge helpers for status indicators.
export const createBadge = ({ text, variant }) =>
  createElement("span", {
    className: `badge ${variant || ""}`.trim(),
    text,
  });

export const createTestDataBadge = () => createBadge({ text: "TEST DATA", variant: "warning" });
