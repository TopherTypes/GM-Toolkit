import { createElement } from "../../ui/dom.js";

// Session review list page stub.
export const renderReviewListPage = () =>
  createElement("div", {
    className: "card",
    children: [
      createElement("h1", { text: "Reviews" }),
      createElement("p", { text: "Session reviews will be supported in a future update." }),
    ],
  });
