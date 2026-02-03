# Information Architecture — GM-Toolkit

## Purpose
This document describes how GM-Toolkit is structured: the top-level modules, navigation, and how information flows between modules (links, backlinks, search, export, and printing). It exists to keep the app modular, scalable, and consistent as new tools are added.

---

## App model (high level)
- **App type:** Single Page App (SPA) — no build tooling required
- **Home:** Campaign Dashboard is always the default “home” view
- **Scope:** One app supports **multiple campaigns**
- **Primary use:** Desktop prep; printing/exporting materials for in-person play

---

## Global layout

### Top bar (global)
Always visible:
- **Campaign switcher**
- **Global search**
- **Export** (JSON export/import)

Reserved for future (not MVP unless needed):
- global settings
- help/about

### Side menu (global)
Always visible and **minimal**, with quick navigation to **all top-level modules** (MVP and beyond).

---

## Top-level modules (navigation)
All modules are top-level and accessible from the side menu:

1. **Campaign Dashboard**
2. **Party**
3. **NPCs**
4. **Creatures**
5. **Encounters**
6. **Locations**
7. **Items**
8. **Session Prep**
9. **Session Review**

> Note: Even if some modules are minimal in MVP, they still exist as modules to support later expansion.

---

## Campaign Dashboard — layout & content

### Layout intent
- Campaign switcher at the top (via the global top bar)
- Main dashboard content is arranged for quick “where am I / what’s next” orientation

### Sections and priority (MVP)
1. **Last session summary** (primary context)
2. **Next session** (primary action)
3. Right-hand column:
   - **Prep checklist**
   - **Party overview**
4. Underneath everything:
   - **Tools quick links** (fast access to modules/tools)
5. **Recently edited** (useful shortcut list)
   - Recently edited sessions, NPCs, creatures, encounters, locations, items (as available)

### Print / pack access rules
- “Print pack” / “Pack export” is available **only** from:
  - Campaign Dashboard, and
  - Session Prep (for a specific session)

---

## Module boundaries (what lives where)

### Principle
Each module owns:
- its list/index view
- entity detail pages
- editing flows (full edit)
- backlinks display (references)

Other modules may:
- link to items from this module
- create “quick” items via modal (“create new”) without navigating away

### Create flows
- **From within a module:** full create/edit within that module (detail page)
- **From another module:** “create new” opens a **modal** capturing basic fields, saves, and returns the user to the current workflow (e.g., creating a creature while building an encounter)

---

## Entity pages & editing UX

### Entity detail pages (MVP default)
MVP uses detail pages for core entities (NPCs, creatures, encounters, locations, items, sessions, party members) to support later expansion.

Each detail page includes:
- **Core fields**
- **Notes**
- **Tags** (where applicable)
- **References / backlinks** section

### Modal creates (cross-module)
When triggered from another module:
- show a lightweight create modal
- capture “minimum viable fields” (enough to continue)
- save
- return to the originating flow with the new entity available for linking

---

## Linking and backlinks

### Linking (MVP)
- A **quick picker** (search + select) to link existing entities
- A **Create new…** option when the desired entity doesn’t exist
- Linked entities display as chips/links, with quick “open preview”

### Backlinks (MVP)
Backlinks are required and should be visible on entity detail pages.

Backlinks appear in a dedicated **References** section either:
- at the side (where layout allows), or
- at the bottom of the detail page

### Preview-first navigation
When clicking a backlink or linked entity:
- show a **preview panel/modal** first (summary + key fields)
- from preview, user can “Open full page” or “Close”

---

## Session Prep IA (step-by-step builder)

### Structure
Session Prep is a **wizard-like flow** (step-by-step), not a single giant form.

Recommended MVP steps:
1. **Basics:** date, title, overview
2. **Agenda:** scenes / beats / checklist
3. **Encounters:** add/link encounters (required); reorder; notes
4. **Notables:** link notable NPCs and locations (optional)
5. **GM Notes:** private notes and reminders
6. **Review & Pack:** validate required links and generate pack

### Required/optional rules
- Required:
  - Session ↔ Encounter (session includes encounters)
  - Encounter → Creature
  - Encounter → NPC
- Optional:
  - Session → NPC
  - Session → Location
  - NPC → Location

---

## Print/pack outputs

### Output approach
Rather than opening the browser print dialog directly, the app generates a **downloadable PDF** for the user to print with their preferred device settings.

### Pack composition (MVP)
A session pack must include:
- Session overview / agenda
- All linked encounters
- For each encounter:
  - participant creatures (and their stat blocks/cards as appropriate)
  - participant NPCs (and their stats/cards as appropriate)

Optional inclusion:
- Notable NPCs and locations can be included, but are not required

No party summary required in MVP packs.

### Formats
- **A4 full pages:** session notes, encounters, locations, general notes
- **Index cards:** NPC and creature stats
- **TCG-sized cards:** magic items

---

## Search and tagging

### Per-module search (MVP)
Each module includes basic search.

### Tagging priorities (MVP)
Start with tagging and robust search for:
1. **NPCs**
2. **Creatures**

### Global search (MVP)
Global search exists in the top bar and can search across:
- NPCs, creatures (first)
- other entities as they become available

---

## URLs & routing (SPA)
Enable deep-linkable URLs to support navigation and “shareable” links.

Suggested patterns:
- `/campaign/:campaignId/dashboard`
- `/campaign/:campaignId/party`
- `/campaign/:campaignId/npcs`
- `/campaign/:campaignId/npcs/:npcId`
- `/campaign/:campaignId/creatures`
- `/campaign/:campaignId/creatures/:creatureId`
- `/campaign/:campaignId/encounters`
- `/campaign/:campaignId/encounters/:encounterId`
- `/campaign/:campaignId/locations`
- `/campaign/:campaignId/locations/:locationId`
- `/campaign/:campaignId/items`
- `/campaign/:campaignId/items/:itemId`
- `/campaign/:campaignId/session-prep`
- `/campaign/:campaignId/session-prep/:sessionId`
- `/campaign/:campaignId/session-review`
- `/campaign/:campaignId/session-review/:sessionId`

---

## Notes for implementation alignment (non-binding)
- Keep modules isolated in code structure, even if they share UI components.
- Avoid feature creep into VTT territory (initiative/dice/combat automation).
- Keep UI clean and modern; avoid “spreadsheet” density.
