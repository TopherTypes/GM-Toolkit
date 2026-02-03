# Tech & Style Guide — GM-Toolkit

## Purpose
This document defines the “house rules” for building GM-Toolkit so the codebase stays modular, readable, and consistent as it grows. It covers architecture, file structure, naming conventions, UI patterns, accessibility, printing/PDF output, and dependency rules.

---

## Non-negotiable constraints
- **Vanilla JS** (no framework)
- **No third-party dependencies** in the core app (self-sufficient)
- **SPA** hosted on GitHub Pages
- **Hash routing** (`#/campaign/...`)
- **localStorage only**
- **Prep-first** with printable/PDF outputs

---

## Tech decisions

### Vanilla JS approach
- Use ES Modules (`<script type="module">`) and split JS into files.
- Prefer small, single-purpose modules.
- Prefer plain objects + functions over complex class hierarchies unless a class clearly improves clarity.

### Dependency policy
- Default: **no third-party libraries**.
- Exception: **PDF generation** may use a library *if available*.
  - If the library is not available, the app must fall back to browser print (“Save as PDF”).

> If a PDF library is introduced later, prefer vendoring it into `/vendor/` to avoid CDN fragility.

---

## Routing & URLs

### Hash routing (required)
Use hash-based routes so GitHub Pages works without special rewrite rules.

Example route patterns:
- `#/campaign/:campaignId/dashboard`
- `#/campaign/:campaignId/npcs`
- `#/campaign/:campaignId/npcs/:npcId`
- `#/campaign/:campaignId/creatures`
- `#/campaign/:campaignId/creatures/:creatureId`
- `#/campaign/:campaignId/encounters`
- `#/campaign/:campaignId/encounters/:encounterId`
- `#/campaign/:campaignId/locations`
- `#/campaign/:campaignId/locations/:locationId`
- `#/campaign/:campaignId/items`
- `#/campaign/:campaignId/items/:itemId`
- `#/campaign/:campaignId/session-prep/:sessionId`
- `#/campaign/:campaignId/session-review/:sessionId`

### Router expectations
- Router must support:
  - route params
  - default route to dashboard
  - unknown route → redirect to dashboard
- Navigation changes should not lose unsaved work (warn user if needed).

---

## File/folder conventions

### Recommended structure
You can adjust, but keep the separation of concerns:

```
/index.html
/src
  /app            bootstrap, router, app shell, navigation
  /modules        feature modules (one folder per module)
  /components     shared UI components (buttons, dialogs, cards, form controls)
  /services       storage, export/import, search, XP calc, migrations, pdf/print
  /state          app state helpers (selected campaign, cached indexes)
/styles
  base.css
  layout.css
  print-a4.css
  print-cards-index.css
  print-cards-tcg.css
/assets
/vendor           (optional, future) vendored libs e.g. pdf library
```

### Module boundaries (required)
Each module lives in `/src/modules/<module-name>/` and owns:
- list view (index)
- detail view
- edit flow
- backlinks rendering
- its own small internal utilities (kept local)

Shared code goes in:
- `/src/components` (UI)
- `/src/services` (data/storage/business logic)

---

## Naming conventions
- Files/folders: **kebab-case** (e.g., `session-prep`, `npc-detail.js`)
- JS variables/functions: **camelCase**
- Constructors/classes (if used): **PascalCase**
- Constants: `UPPER_SNAKE_CASE`

---

## UI patterns & style

### Visual direction
- Clean, modern UI with **slight RPG utility** flavour:
  - restrained accent colours
  - clear iconography
  - card-based layout and strong typography
  - avoid “spreadsheet density”

### Layout pattern (recommended default)
- Page layout → sections → cards → forms
- Keep pages scannable:
  - clear headings
  - consistent spacing
  - minimal cognitive load

### Forms & inputs
- Labels are required for all inputs.
- Prefer progressive disclosure:
  - show essentials by default
  - tuck advanced fields behind “More” sections

### Modal create UX (cross-module)
When creating an entity from another module:
- open a modal with minimum viable fields
- save immediately
- return to the originating flow without navigating away

---

## Accessibility baseline (MVP minimum)
- **Visible focus states** for keyboard navigation
- **Sensible heading structure** (H1 → H2 → H3)
- **All inputs have labels** (including search fields)
- **Readable print outputs** (contrast, spacing, no clipped text)

---

## Printing and PDF outputs

### Output rule (required)
- Preferred: generate a **downloadable PDF** (if a PDF library is available)
- Fallback: open a print-friendly view and use browser print (“Save as PDF”)

### Print layouts (separate templates)
MVP supports separate print styles/layouts for:
- **Session Pack (A4 full pages)**
- **NPC cards (index card size)**
- **Creature cards (index card size)**
- **Item cards (TCG size)**

### Multiple cards per page (required)
For NPC/Creature/Item cards:
- Support multiple cards per A4 page with cut lines.
- Keep card sizing consistent and predictable.
- Provide safe margins for most printers.

> Implementation note: card sheets can be generated as print pages with a grid layout and CSS `@media print`.

---

## Error handling & feedback (no silent failures)
- No silent failures.
- Any action that fails must show:
  - a user-visible error message (toast/banner/dialog)
  - and a developer log entry (console)

### Internal debug mode (recommended)
- Provide a lightweight internal debug toggle (e.g., URL flag `?debug=1` or local setting)
- Debug mode can enable:
  - extra console logs
  - storage size indicators
  - schema version display
  - migration traces

---

## Code quality rules (Codex must follow)
- **No huge files:** keep files small (target: ≤300–500 lines)
- Prefer many small modules over one large “god file”
- Comments/docstrings:
  - use them for non-obvious logic (migrations, merge/conflict rules, XP calc)
  - avoid excessive commentary on trivial code
- Keep functions short and single-purpose
- Don’t introduce new patterns without updating this doc
- No smart quotes or typographic punctuation in JS source; use plain ASCII quotes.

---

## CSS rules
- Keep base UI styles separate from print styles.
- Print CSS must:
  - avoid dark backgrounds
  - enforce legible font sizes
  - prevent content clipping across page breaks where possible

---

## Data model alignment
- Use the entity shapes and storage layout defined in `docs/DATA_MODEL.md`.
- Any schema change must:
  - increment schema version
  - include a migration path
  - preserve existing data where possible
  - prompt user before migrating imports

---

## “Definition of done” for any feature
A feature is done when:
- UI works and is navigable
- Data saves/loads correctly
- Print/PDF output is usable (if applicable)
- Errors are handled visibly
- Relevant docs are updated (IA / data model / MVP scope if impacted)
