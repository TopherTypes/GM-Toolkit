import { createElement } from "../dom.js";

// Side navigation listing all modules.
export const createSideNav = ({ getActiveRoute }) => {
  const navLinks = [
    { label: "Dashboard", path: "" },
    { label: "Party", path: "party" },
    { label: "NPCs", path: "npcs" },
    { label: "Creatures", path: "creatures" },
    { label: "Encounters", path: "encounters" },
    { label: "Locations", path: "locations" },
    { label: "Items", path: "items" },
    { label: "Sessions", path: "sessions" },
    { label: "Reviews", path: "reviews" },
  ];

  const list = createElement("ul");

  const element = createElement("nav", {
    className: "side-nav",
    attrs: { "aria-label": "Main navigation" },
    children: [list],
  });

  const renderLinks = (campaignId) => {
    list.innerHTML = "";
    navLinks.forEach((link) => {
      const href = campaignId ? `#/c/${campaignId}/${link.path}`.replace(/\/$/, "") : "#/";
      const anchor = createElement("a", {
        text: link.label,
        attrs: { href, "data-path": link.path },
      });
      const li = createElement("li", { children: [anchor] });
      list.append(li);
    });
  };

  const updateActive = () => {
    const route = getActiveRoute?.();
    const activePath = route?.path || "";
    list.querySelectorAll("a").forEach((anchor) => {
      const anchorPath = anchor.getAttribute("data-path") || "";
      const isActive = anchorPath === activePath;
      anchor.classList.toggle("active", Boolean(isActive));
    });
  };

  return {
    element,
    renderLinks,
    updateActive,
  };
};
