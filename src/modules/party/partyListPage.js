import { createElement } from "../../ui/dom.js";

// Party list page stub.
export const renderPartyListPage = () =>
  createElement("div", {
    className: "card",
    children: [
      createElement("h1", { text: "Party" }),
      createElement("p", { text: "Party management will arrive in a future update." }),
    ],
  });
