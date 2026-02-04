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
import { renderCreatureDetailPage } from "./modules/creatures/creatureDetailPage.js";
import { renderEncounterListPage } from "./modules/encounters/encounterListPage.js";
import { renderEncounterDetailPage } from "./modules/encounters/encounterDetailPage.js";
import { renderLocationListPage } from "./modules/locations/locationListPage.js";
import { renderLocationDetailPage } from "./modules/locations/locationDetailPage.js";
import { renderItemListPage } from "./modules/items/itemListPage.js";
import { renderSessionListPage } from "./modules/sessions/sessionListPage.js";
import { renderSessionDetailPage } from "./modules/sessions/sessionDetailPage.js";
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
let debugEnabled = debugFromQuery || debugState.enabled;
storageService.setDebug({ enabled: debugEnabled });

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

let settings = storageService.loadSettings();
const app = {
  banners,
  toasts,
  modal,
  campaignStore,
  searchService,
  pdfService,
  settings: {
    get: () => settings,
    update: (updates) => {
      settings = { ...settings, ...updates };
      storageService.saveSettings(settings);
      setTheme(settings);
      return settings;
    },
  },
};

const setTheme = (settings) => {
  const theme = settings.theme || "system";
  if (theme === "dark" || theme === "light") {
    document.documentElement.setAttribute("data-theme", theme);
    return;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
};

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
  onSettings: () => openSettingsModal(),
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

const openSettingsModal = () => {
  const themeSelect = createElement("select", { className: "select", attrs: { "aria-label": "Theme" } });
  [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ].forEach((option) => {
    themeSelect.append(createElement("option", { text: option.label, attrs: { value: option.value } }));
  });
  themeSelect.value = app.settings.get().theme || "system";
  themeSelect.addEventListener("change", () => {
    app.settings.update({ theme: themeSelect.value });
  });

  const archivedToggle = createElement("input", {
    attrs: { type: "checkbox", "aria-label": "Show archived by default" },
  });
  archivedToggle.checked = Boolean(app.settings.get().showArchivedByDefault);
  archivedToggle.addEventListener("change", () => {
    app.settings.update({ showArchivedByDefault: archivedToggle.checked });
  });

  const debugToggle = createElement("input", {
    attrs: { type: "checkbox", "aria-label": "Enable debug mode" },
  });
  debugToggle.checked = debugEnabled;
  debugToggle.addEventListener("change", () => {
    setDebugEnabled(debugToggle.checked);
  });

  const copyDebugButton = createElement("button", {
    className: "button secondary",
    text: "Copy debug report",
    attrs: { type: "button" },
  });
  copyDebugButton.addEventListener("click", () => {
    copyDebugReport();
  });

  const content = createElement("div", {
    className: "form-grid",
    children: [
      createElement("label", { text: "Theme", children: [themeSelect] }),
      createElement("label", { text: "Show archived by default", children: [archivedToggle] }),
      createElement("label", { text: "Debug mode", children: [debugToggle] }),
      createElement("div", { className: "form-row inline", children: [copyDebugButton] }),
    ],
  });

  modal.open({
    title: "Settings",
    content,
    actions: [{ label: "Close", variant: "secondary", onClick: () => modal.close() }],
  });
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
    content.append(renderDashboardPage({ app, campaign, campaignId: route.campaignId }));
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

  if (route.type === "creature-detail") {
    if (!campaign.creatures?.[route.creatureId]) {
      banners.show("Not found: that creature no longer exists.", "warning");
      router.navigate(routes.moduleList(route.campaignId, "creatures"));
      return;
    }
    content.append(
      renderCreatureDetailPage({
        app,
        campaignId: route.campaignId,
        creatureId: route.creatureId,
        campaign,
      })
    );
    return;
  }

  if (route.type === "encounter-detail") {
    if (!campaign.encounters?.[route.encounterId]) {
      banners.show("Not found: that encounter no longer exists.", "warning");
      router.navigate(routes.moduleList(route.campaignId, "encounters"));
      return;
    }
    content.append(
      renderEncounterDetailPage({
        app,
        campaignId: route.campaignId,
        encounterId: route.encounterId,
        campaign,
      })
    );
    return;
  }

  if (route.type === "location-detail") {
    if (!campaign.locations?.[route.locationId]) {
      banners.show("Not found: that location no longer exists.", "warning");
      router.navigate(routes.moduleList(route.campaignId, "locations"));
      return;
    }
    content.append(
      renderLocationDetailPage({
        app,
        campaignId: route.campaignId,
        locationId: route.locationId,
        campaign,
      })
    );
    return;
  }

  if (route.type === "session-detail") {
    if (!campaign.sessions?.[route.sessionId]) {
      banners.show("Not found: that session no longer exists.", "warning");
      router.navigate(routes.moduleList(route.campaignId, "sessions"));
      return;
    }
    content.append(
      renderSessionDetailPage({
        app,
        campaignId: route.campaignId,
        sessionId: route.sessionId,
        campaign,
      })
    );
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
      return renderCreatureListPage({ app, campaignId: route.campaignId, campaign });
    case "encounters":
      return renderEncounterListPage({ app, campaignId: route.campaignId, campaign });
    case "locations":
      return renderLocationListPage({ app, campaignId: route.campaignId, campaign });
    case "items":
      return renderItemListPage();
    case "sessions":
      return renderSessionListPage({ app, campaignId: route.campaignId, campaign });
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

const buildDebugReport = () => {
  const usage = storageService.estimateUsage();
  return {
    version: APP_VERSION,
    schemaVersion: SCHEMA_VERSION,
    storagePercent: usage.percent,
    campaignId: campaignStore.getCurrentCampaignId(),
    route: window.location.hash || "#/",
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };
};

const copyDebugReport = async () => {
  const text = JSON.stringify(buildDebugReport(), null, 2);
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
};

const setDebugEnabled = (enabled) => {
  debugEnabled = debugFromQuery ? true : enabled;
  storageService.saveDebug({ enabled: debugEnabled });
  storageService.setDebug({ enabled: debugEnabled });
  pdfService.setDebug({ enabled: debugEnabled });
  renderDebugFooter();
};

const renderDebugFooter = () => {
  if (!debugEnabled) {
    debugFooter.style.display = "none";
    return;
  }

  debugFooter.style.display = "flex";
  debugFooter.innerHTML = "";
  const report = buildDebugReport();

  const info = createElement("div", {
    children: [
      createElement("span", { text: `Version: ${APP_VERSION}` }),
      createElement("span", { text: `Schema: v${SCHEMA_VERSION}` }),
      createElement("span", { text: `Storage: ${report.storagePercent}%` }),
      createElement("span", { text: `Campaign: ${campaignStore.getCurrentCampaignId() || "None"}` }),
    ],
  });

  const copyButton = createElement("button", {
    className: "button secondary",
    text: "Copy debug report",
  });
  copyButton.addEventListener("click", () => {
    copyDebugReport();
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
