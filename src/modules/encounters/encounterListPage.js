import { createElement } from "../../ui/dom.js";

// Encounter list page stub.
export const renderEncounterListPage = () =>
  createElement("div", {
    className: "card",
    children: [
      createElement("h1", { text: "Encounters" }),
      createElement("p", { text: "Encounter building will be available in a future release." }),
    ],
  });
