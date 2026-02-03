import { moduleListRoutes } from "./routes.js";

// Hash router to parse URLs and dispatch to route handlers.
export const createRouter = ({ onRoute }) => {
  let currentRoute = null;

  const parseHash = () => {
    const hash = window.location.hash || "#/";
    const path = hash.replace(/^#/, "");
    const segments = path.split("/").filter(Boolean);

    if (!segments.length) {
      return { type: "root", path: "" };
    }

    if (segments[0] !== "c") {
      return { type: "not-found", path: segments.join("/") };
    }

    const campaignId = segments[1];
    if (!campaignId) {
      return { type: "missing-campaign", path: "" };
    }

    if (segments.length === 2) {
      return { type: "dashboard", campaignId, path: "" };
    }

    const moduleName = segments[2];
    if (!moduleListRoutes.includes(moduleName)) {
      return { type: "not-found", campaignId, path: moduleName };
    }

    if (segments.length === 3) {
      return { type: "module-list", campaignId, module: moduleName, path: moduleName };
    }

    if (moduleName === "npcs" && segments.length === 4) {
      return { type: "npc-detail", campaignId, npcId: segments[3], path: "npcs" };
    }

    if (moduleName === "creatures" && segments.length === 4) {
      return { type: "creature-detail", campaignId, creatureId: segments[3], path: "creatures" };
    }

    if (moduleName === "encounters" && segments.length === 4) {
      return { type: "encounter-detail", campaignId, encounterId: segments[3], path: "encounters" };
    }

    if (moduleName === "sessions" && segments.length === 4) {
      return { type: "session-detail", campaignId, sessionId: segments[3], path: "sessions" };
    }

    return { type: "not-found", campaignId, path: moduleName };
  };

  const handleRoute = () => {
    currentRoute = parseHash();
    onRoute?.(currentRoute);
  };

  const init = () => {
    window.addEventListener("hashchange", handleRoute);
    handleRoute();
  };

  const navigate = (hash) => {
    window.location.hash = hash.replace(/^#/, "");
  };

  return { init, navigate, getCurrentRoute: () => currentRoute };
};
