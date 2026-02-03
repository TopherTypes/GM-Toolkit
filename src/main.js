import { APP_VERSION, SCHEMA_VERSION } from "./version.js";
import { createRouter } from "./router/router.js";
import { routes } from "./router/routes.js";
import { createStorageService } from "./storage/storageService.js";
import { createCampaignStore } from "./state/campaignStore.js";
import { createTopBar } from "./ui/components/TopBar.js";
import { createSideNav } from "./ui/components/SideNav.js";
import { createToasts } from "./ui/components/Toasts.js";
import { createBanners } from "./ui/components/Banners.js";
import { createModal } from "./ui/components/Modal.js";
import { createSearchService } from "./search/searchService.js";
import { buildIndex } from "./search/indexBuilder.js";
import { createExportService } from "./importExport/exportService.js";
import { createImportService } from "./importExport/importService.js";
import { createMergeService } from "./importExport/mergeService.js";
import { createMigrationService } from "./storage/migrationService.js";
import { createPdfService } from "./print/pdfService.js";
import { renderDashboardPage } from "./modules/dashboard/dashboardPage.js";
import { renderNpcListPage } from "./modules/npcs/npcListPage.js";
import { renderNpcDetailPage } from "./modules/npcs/npcDetailPage.js";
import { renderPartyListPage } from "./modules/party/partyListPage.js";
import { renderCreatureListPage } from "./modules/creatures/creatureListPage.js";
import { renderEncounterListPage } from "./modules/encounters/encounterListPage.js";
import { renderLocationListPage } from "./modules/locations/locationListPage.js";
import { renderItemListPage } from "./modules/items/itemListPage.js";
import { renderSessionListPage } from "./modules/sessions/sessionListPage.js";
import { renderReviewListPage } from "./modules/reviews/reviewListPage.js";
import { createElement, clearElement } from "./ui/dom.js";

// Entry point for GM-Toolkit.
const appRoot = document.getElementById("app");
const toasts = createToasts();
const banners = createBanners();
const modal = createModal();

const debugFromQuery = new URLSearchParams(window.location.search).get("debug") === "1";
const storageService = createStorageService({ banners, debug: { enabled: debugFromQuery } });
const debugState = storageService.loadDebug();
const debugEnabled = debugFromQuery || debugState.enabled;

const campaignStore = createCampaignStore({ storageService, toasts, banners });
const searchService = createSearchService();
const exportService = createExportService({ toasts });
const mergeService = createMergeService();
const migrationService = createMigrationService({ modal });
const pdfService = createPdfService({ banners, debug: { enabled: debugEnabled } });
const importService = createImportService({
  storageService,
  campaignStore,
  mergeService,
  migrationService,
  modal,
  toasts,
  banners,
  onPostImportExport: () => {
    const campaignId = campaignStore.getCurrentCampaignId();
    const payload = campaignStore.getCurrentCampaign();
    if (campaignId && payload) {
      exportService.exportCampaign({ campaignId, payload });
    }
  },
});

const app = { banners, toasts, modal, campaignStore, searchService, pdfService };

const setTheme = (settings) => {
  const theme = settings.theme || "system";
  if (theme === "dark" || theme === "light") {
    document.documentElement.setAttribute("data-theme", theme);
    return;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
};

const settings = storageService.loadSettings();
setTheme(settings);

const topBar = createTopBar({
  onCampaignChange: (campaignId) => {
    if (campaignId) {
      window.location.hash = routes.dashboard(campaignId);
    }
  },
  onCreateCampaign: () => openCreateCampaignModal(),
  onSearch: (query) => openGlobalSearch(query),
  onExport: () => {
    const campaignId = campaignStore.getCurrentCampaignId();
    const payload = campaignStore.getCurrentCampaign();
    if (!campaignId) {
      banners.show("No campaign loaded to export.", "warning");
      return;
    }
    exportService.exportCampaign({ campaignId, payload });
  },
  onImport: () => importService.openImportDialog(),
});

const sideNav = createSideNav({
  getActiveRoute: () => router.getCurrentRoute(),
});

const content = createElement("main", { className: "content" });
const debugFooter = createElement("footer", { className: "footer-debug" });

const router = createRouter({
  onRoute: async (route) => {
    await handleRoute(route);
  },
});

const openCreateCampaignModal = () => {
  const nameInput = createElement("input", { className: "input", attrs: { required: true } });
  const adventureInput = createElement("input", { className: "input" });
  const notesInput = createElement("textarea", { className: "textarea", attrs: { rows: 4 } });
  const tagsInput = createElement("input", { className: "input" });

  const form = createElement("form", {
    className: "form-grid",
    children: [
      createElement("label", { text: "Name", children: [nameInput] }),
      createElement("label", { text: "Adventure Path", children: [adventureInput] }),
      createElement("label", { text: "Notes", children: [notesInput] }),
      createElement("label", { text: "Tags (comma separated)", children: [tagsInput] }),
      createElement("button", { className: "button", text: "Create", attrs: { type: "submit" } }),
    ],
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!nameInput.value.trim()) {
      banners.show("Campaign name is required.", "error");
      return;
    }
    const id = await campaignStore.createCampaign({
      name: nameInput.value.trim(),
      adventurePath: adventureInput.value.trim(),
      notes: notesInput.value.trim(),
      tags: tagsInput.value.split(","),
    });
    modal.close();
    window.location.hash = routes.dashboard(id);
  });

  modal.open({ title: "Create campaign", content: form, actions: [] });
};

const openGlobalSearch = (query) => {
  const results = searchService.searchNpcs(query || "");
  const list = createElement("div", { className: "form-grid" });
  if (!results.length) {
    list.append(createElement("p", { text: "No results yet." }));
  } else {
    results.forEach((npc) => {
      const button = createElement("button", {
        className: "button secondary",
        text: npc.name,
        attrs: { type: "button" },
      });
      button.addEventListener("click", () => {
        const campaignId = campaignStore.getCurrentCampaignId();
        if (campaignId) {
          window.location.hash = routes.npcDetail(campaignId, npc.id);
          modal.close();
        }
      });
      list.append(button);
    });
  }
  modal.open({ title: "Global search", content: list, actions: [] });
};

const handleRoute = async (route) => {
  clearElement(content);
  banners.clear();

  if (route.type === "root") {
    const index = storageService.loadIndex();
    if (index.lastOpenedCampaignId) {
      router.navigate(routes.dashboard(index.lastOpenedCampaignId));
      return;
    }
    content.append(renderNoCampaignScreen());
    return;
  }

  if (route.type === "not-found") {
    content.append(createElement("div", { className: "card", text: "Route not found." }));
    return;
  }

  if (!route.campaignId) {
    content.append(renderNoCampaignScreen());
    return;
  }

  const index = storageService.loadIndex();
  const entry = index.campaigns.find((campaign) => campaign.campaignId === route.campaignId);
  if (!entry) {
    content.append(renderCampaignNotFound());
    return;
  }

  if (campaignStore.getCurrentCampaignId() !== route.campaignId) {
    await campaignStore.loadCampaign(route.campaignId);
  }

  const campaign = campaignStore.getCurrentCampaign();
  if (!campaign) {
    content.append(renderCampaignNotFound());
    return;
  }

  searchService.setIndex(buildIndex(campaign));
  sideNav.renderLinks(route.campaignId);
  sideNav.updateActive();

  if (route.type === "dashboard") {
    content.append(renderDashboardPage({ app, campaign }));
    return;
  }

  if (route.type === "module-list") {
    const modulePage = renderModuleList({ route, campaign });
    if (modulePage) {
      content.append(modulePage);
    }
    return;
  }

  if (route.type === "npc-detail") {
    if (!campaign.npcs?.[route.npcId]) {
      banners.show("Not found: that NPC no longer exists.", "warning");
      router.navigate(routes.moduleList(route.campaignId, "npcs"));
      return;
    }
    content.append(renderNpcDetailPage({ app, campaignId: route.campaignId, npcId: route.npcId, campaign }));
    return;
  }
};

const renderModuleList = ({ route, campaign }) => {
  switch (route.module) {
    case "party":
      return renderPartyListPage();
    case "npcs":
      return renderNpcListPage({ app, campaignId: route.campaignId, campaign });
    case "creatures":
      return renderCreatureListPage();
    case "encounters":
      return renderEncounterListPage();
    case "locations":
      return renderLocationListPage();
    case "items":
      return renderItemListPage();
    case "sessions":
      return renderSessionListPage();
    case "reviews":
      return renderReviewListPage();
    default:
      return createElement("div", { className: "card", text: "Module not found." });
  }
};

const renderNoCampaignScreen = () => {
  const container = createElement("div", { className: "card" });
  const createButton = createElement("button", { className: "button", text: "Create campaign" });
  createButton.addEventListener("click", () => openCreateCampaignModal());
  container.append(
    createElement("h1", { text: "Welcome to GM-Toolkit" }),
    createElement("p", { text: "Create your first campaign to get started." }),
    createButton
  );
  return container;
};

const renderCampaignNotFound = () => {
  const container = createElement("div", { className: "card" });
  const importButton = createElement("button", { className: "button", text: "Import backup" });
  importButton.addEventListener("click", () => importService.openImportDialog());
  container.append(
    createElement("h1", { text: "Campaign not found" }),
    createElement("p", { text: "This campaign ID does not exist on this device." }),
    importButton
  );
  return container;
};

const renderDebugFooter = () => {
  if (!debugEnabled) {
    debugFooter.style.display = "none";
    return;
  }

  debugFooter.style.display = "flex";
  const usage = storageService.estimateUsage();
  debugFooter.innerHTML = "";

  const info = createElement("div", {
    children: [
      createElement("span", { text: `Version: ${APP_VERSION}` }),
      createElement("span", { text: `Schema: v${SCHEMA_VERSION}` }),
      createElement("span", { text: `Storage: ${usage.percent}%` }),
      createElement("span", { text: `Campaign: ${campaignStore.getCurrentCampaignId() || "None"}` }),
    ],
  });

  const copyButton = createElement("button", {
    className: "button secondary",
    text: "Copy debug report",
  });
  copyButton.addEventListener("click", async () => {
    const report = {
      version: APP_VERSION,
      schemaVersion: SCHEMA_VERSION,
      storagePercent: usage.percent,
      campaignId: campaignStore.getCurrentCampaignId(),
      timestamp: new Date().toISOString(),
    };
    const text = JSON.stringify(report, null, 2);
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    toasts.show("Debug report copied.");
  });

  debugFooter.append(info, copyButton);
};

const mountAppShell = () => {
  appRoot.innerHTML = "";
  appRoot.append(topBar.element);

  const body = createElement("div", { className: "app-body" });
  body.append(sideNav.element, content);
  appRoot.append(body, toasts.element, debugFooter);
  appRoot.prepend(banners.element);
};

campaignStore.subscribe(() => {
  const index = storageService.loadIndex();
  topBar.updateCampaigns(index.campaigns, campaignStore.getCurrentCampaignId());
  topBar.updateSavingIndicator(campaignStore.isSaving() ? "Saving…" : "Saved");
  searchService.setIndex(buildIndex(campaignStore.getCurrentCampaign()));
  renderDebugFooter();
});

mountAppShell();
const initialIndex = storageService.loadIndex();
topBar.updateCampaigns(initialIndex.campaigns, initialIndex.lastOpenedCampaignId);
router.init();
renderDebugFooter();
