import { createElement } from "../../ui/dom.js";

// Item list page stub.
export const renderItemListPage = () =>
  createElement("div", {
    className: "card",
    children: [
      createElement("h1", { text: "Items" }),
      createElement("p", { text: "Item tracking is queued for a later milestone." }),
    ],
  });
