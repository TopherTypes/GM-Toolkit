import { createElement } from "../../ui/dom.js";

// Session list page stub.
export const renderSessionListPage = () =>
  createElement("div", {
    className: "card",
    children: [
      createElement("h1", { text: "Sessions" }),
      createElement("p", { text: "Session prep tooling will land in a later update." }),
    ],
  });
