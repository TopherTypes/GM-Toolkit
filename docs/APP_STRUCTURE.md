# App Structure — GM-Toolkit

## Purpose
This document defines the recommended repository and code structure for GM-Toolkit (vanilla JS, hash-routed SPA, localStorage-only) so development stays modular and easy to extend without a build step.

It is intentionally lightweight: enough structure to avoid chaos, not so much that it slows shipping.

---

## Guiding principles
- **No build tooling required:** plain HTML/CSS/JS files that run via GitHub Pages.
- **Modular by feature:** code grouped by module (NPCs, Creatures, Sessions, etc.), not by “mega files.”
- **Single source of truth:** shared services handle storage, routing, import/export, notifications, printing.
- **Progressive enhancement:** start simple, refactor safely as modules grow.

---

## Recommended repo layout

```
GM-Toolkit/
  index.html
  /src/
    main.js
    version.js
    router/
      router.js
      routes.js
    state/
      campaignStore.js
      selectors.js
    storage/
      storageKeys.js
      storageService.js
      checksum.js
      migrationService.js
    importExport/
      exportService.js
      importService.js
      mergeService.js
      conflictResolver.js
    search/
      indexBuilder.js
      searchService.js
      tagService.js
    print/
      pdfService.js
      printTemplates.js
      printRenderer.js
    ui/
      dom.js
      components/
        TopBar.js
        SideNav.js
        Toasts.js
        Banners.js
        Modal.js
        Drawer.js
        ListView.js
        DetailLayout.js
        ReferencesPanel.js
        FormControls.js
        Tabs.js
        Badges.js
    modules/
      dashboard/
        dashboardPage.js
        dashboardView.js
      party/
        partyListPage.js
        partyDetailPage.js
        partyForm.js
      npcs/
        npcListPage.js
        npcDetailPage.js
        npcForm.js
      creatures/
        creatureListPage.js
        creatureDetailPage.js
        creatureForm.js
      encounters/
        encounterListPage.js
        encounterDetailPage.js
        encounterForm.js
      locations/
        locationListPage.js
        locationDetailPage.js
        locationForm.js
      items/
        itemListPage.js
        itemDetailPage.js
        itemForm.js
        passphraseService.js
      sessions/
        sessionListPage.js
        sessionWizardPage.js
        sessionWizardSteps.js
      reviews/
        reviewListPage.js
        reviewDetailPage.js
        reviewForm.js
    utils/
      ids.js
      dates.js
      strings.js
      errors.js
  /styles/
    base.css
    theme.css
    components.css
    print.css
  /assets/
    icons/
    fonts/ (optional; Google Fonts preferred)
  /fixtures/
    README.md
    minimal-campaign.json
    ap-scale-campaign.json
    /migrations/
      v1/
      v2/
  /docs/
    (all your markdown specs)
```

Notes:
- `/src/modules/` is “feature code.”
- `/src/ui/components/` is reusable UI building blocks.
- `/styles/` is separated from `/src/` because CSS is static and shared.

---

## File responsibilities (what goes where)

### `index.html`
- Static shell: root container, script tags, stylesheet links.
- Includes `src/main.js` and `styles/*.css`.
- Optional: a small “loading” skeleton.

### `src/main.js`
- App entry point:
  - loads settings (theme/debug)
  - loads campaign index + last-opened campaign
  - initializes router
  - mounts app shell (top bar + side nav + content area)
  - wires global services (notifications, search index build, etc.)

### `src/router/`
- `routes.js`: canonical route definitions (matching `docs/ROUTES_AND_URLS.md`)
- `router.js`: parses hash, dispatches to a page renderer, handles redirects/not-found

### `src/state/`
- `campaignStore.js`: in-memory representation of current campaign + mutations
- `selectors.js`: computed read-only helpers (counts, recently edited, xp totals)

### `src/storage/`
- `storageKeys.js`: constants (prefixes and key naming)
- `storageService.js`: read/write campaign blobs + index (`docs/STORAGE_LAYOUT.md`)
- `checksum.js`: compute/verify checksum
- `migrationService.js`: schema migrations + confirmation prompt integration

### `src/importExport/`
- `exportService.js`: export selected campaign only
- `importService.js`: dry run + apply import
- `mergeService.js`: merge-by-ID logic
- `conflictResolver.js`: supports “most recent wins”, duplicate-with-new-ID, etc.

### `src/search/`
- `indexBuilder.js`: builds in-memory search index for current campaign
- `searchService.js`: global + module search
- `tagService.js`: tag normalization + suggestions

### `src/print/`
- `pdfService.js`: primary PDF generation (library allowed), fallback to browser print
- `printTemplates.js`: defines layouts (A4 pages, index cards, TCG cards)
- `printRenderer.js`: converts entities into printable content structures

### `src/ui/`
- `dom.js`: tiny helper utilities (createEl, mount, qs, etc.)
- `/components`: reusable UI pieces (modal, drawer, list view, references panel, etc.)

### `src/modules/`
Each module contains only what it needs:
- list page renderer (list + search + filters + sort)
- detail page renderer (summary + form + references panel)
- form definition + validation

Rule of thumb:
- If it’s used by multiple modules, it belongs in `/src/ui/` or `/src/services/` (storage/import/search/print).

---

## Module conventions

### Page exports
Each module page should export a standard shape:
- `renderListPage(ctx)`
- `renderDetailPage(ctx, id)`
Where `ctx` contains:
- `campaignId`
- `store` (read/write)
- `navigate()`
- `notify()` (toast/banner/modal helpers)
- `openPreview()` (drawer/modal preview helper)

### Detail layout consistency
Use shared UI components:
- `DetailLayout`
- `ReferencesPanel` (required)
- `Modal`/`Drawer` preview-first behavior
- soft delete confirmation flows

### Modal quick-create
Quick-create from another module should:
- open a modal form with minimal required fields
- create entity
- return to the originating workflow without route change

---

## Styling structure

### `styles/base.css`
- resets, typography, spacing tokens, layout primitives

### `styles/theme.css`
- light/dark theme variables
- focus styles and contrast rules

### `styles/components.css`
- shared component styling (cards, buttons, inputs, badges)

### `styles/print.css`
- A4 layouts, card sheets, page numbers, cut lines, print-only overrides

---

## “Start building now” recommendation
If you’re running out of steam on docs, you’re in a good place to start Codex work with what you already have.

A strong first build milestone:
1. App shell + routing
2. Campaign index + create/select campaign
3. Storage save/load (with checksum)
4. Notifications system
5. Stub module pages (empty lists + “create new”)
6. One full vertical slice:
   - Encounter → Creature/NPC selection (modal quick-create)
   - Session Prep wizard
   - Generate a simple PDF pack (even if crude initially)

---

## Non-goals (keep you honest)
- No VTT features (initiative, dice, live table tooling)
- No map maker/generator
- No server/auth/cloud in MVP
