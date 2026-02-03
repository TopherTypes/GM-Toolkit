import { createElement } from "../../ui/dom.js";

// Creature list page stub.
export const renderCreatureListPage = () =>
  createElement("div", {
    className: "card",
    children: [
      createElement("h1", { text: "Creatures" }),
      createElement("p", { text: "Creature library scaffolding is ready for future updates." }),
    ],
  });
