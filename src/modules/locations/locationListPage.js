import { createElement } from "../../ui/dom.js";

// Location list page stub.
export const renderLocationListPage = () =>
  createElement("div", {
    className: "card",
    children: [
      createElement("h1", { text: "Locations" }),
      createElement("p", { text: "Location notes will be wired up in a future update." }),
    ],
  });
