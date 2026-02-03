# UI Components — GM-Toolkit

## Purpose
This document defines GM-Toolkit’s reusable UI components and interaction patterns so the app stays consistent across modules. It is a small “design system” for vanilla JS: common components, their roles, and key behavior rules.

---

## Visual baseline
- Border radius: **medium** (8–12px)
- Density: **comfortable** (readable spacing, not cramped)
- Icon usage: **moderate** (navigation + key actions)
- Overall feel: clean, modern “RPG utility” (not busy, not spreadsheet-dense)

### Colour rules
- Default for GM-facing screens/outputs: **black and white**
- Colour is primarily for **player-facing handouts** (e.g., item cards)
- Exception: colour may be used sparingly if it materially improves clarity/readability

### Test data warning
- Fixture campaigns must be clearly labeled as **TEST DATA** on all relevant screens.
- Use a dedicated warning badge/colour treatment to avoid confusion.

---

## Core layout components

### App Shell
**Purpose:** Provides the consistent frame of the SPA.
- Top bar: campaign switcher, global search, export/import, saving status
- Side menu: module navigation (all modules top-level)
- Main content: route-driven views

### Page
**Purpose:** A full screen view for a module route.
Structure:
- Page header (title + primary actions)
- Sections (grouped content)
- Cards (content containers)

### Section
**Purpose:** Groups related elements with a heading.
Rules:
- Use H2/H3 properly for accessibility.
- Avoid too many sections per page; keep it scannable.

### Card
**Purpose:** Primary container for content blocks (forms, lists, summaries).
Rules:
- Use consistent padding and spacing.
- Cards can have:
  - header (title + actions)
  - body
  - footer (secondary actions)

---

## Navigation components

### Side Navigation (Modules)
**Purpose:** Quick tool-to-tool switching.
Rules:
- All modules appear top-level in nav.
- Current module is highlighted.
- Must be keyboard navigable.

### Breadcrumbs (optional)
**Purpose:** Helps orient within list → detail flows.
Recommended on detail pages (e.g., “Creatures > Goblin Commando”).

---

## List and detail components

### List View (Hybrid)
**Purpose:** Fast scanning + quick access.
Default: **table-ish list rows** (scan-friendly)
Optional (future): card/tile view toggle.

List row should include:
- Title/name
- small metadata fields relevant to the module (e.g., CR, role, location)
- quick actions (open, preview, archive)

Must support:
- per-module search
- sort (optional MVP)
- “Archived” filter view (soft delete)

### Detail View
**Purpose:** Focused single-entity page for reading and editing.
Standard regions:
- Summary card (key fields)
- Main details (editable sections)
- **References panel** (required; see below)
- Archive action (soft delete) with confirmation

---

## Forms & controls

### Form field
Rules:
- Every input must have a label (visible or aria-label).
- Required fields are clearly indicated.
- Hybrid validation:
  - gentle inline hints
  - strict on save/next step
- Errors appear both:
  - field-level
  - top-of-form summary

### Buttons
Standard button types:
- Primary (most important action on page)
- Secondary (supporting actions)
- Destructive (archive/delete)

Rules:
- Destructive actions require confirmation.
- Buttons should show disabled states clearly.
- Keyboard activation must work (Enter/Space).

### Search bar
Two types:
- Per-module search (in list views)
- Global search (top bar)

Recommended shortcuts (when implemented):
- `/` focus current page search
- `Ctrl+K` / `Cmd+K` open global search

---

## Feedback components

### Toasts
**Use for:** transient success/info
Examples:
- “Saved”
- “Export complete”
- “Imported fixture (replaced existing fixture)”

### Banners
**Use for:** important errors or blocking warnings
Examples:
- Import failed validation
- Migration required confirmation
- Unsaved changes warning (can also be modal)

### Saving indicator (both)
- Provide a small persistent status indicator:
  - “Saving…” → “Saved”
- Show:
  - top bar status
  - per-form status where it adds clarity (e.g., session prep wizard)

---

## Modal and drawer components

### Modal (required)
**Use for:**
- quick-create flows (create new NPC/creature from encounter/session)
- confirmations (archive, leave with unsaved changes)
- conflict resolution review (if implemented as modal)

Rules:
- Trap focus while open.
- Esc closes (unless confirmation requires explicit choice).
- Return focus to the opener when closed.

### Drawer / side panel (optional)
**Use for:**
- preview-first entity views (links/backlinks)
- lightweight detail previews without leaving context

Selection rule:
- Use whichever fits the layout and amount of detail.
- If preview contains multiple sections or heavy content, prefer a full page or modal.

---

## References panel (required)
**Purpose:** Show backlinks and forward links for an entity.

### Content
- Show **titles + small metadata**.
Examples:
- Session: title + date
- Encounter: title + map reference
- Creature: name + CR
- NPC: name + role

### Grouping
- References must be **grouped by type** (Sessions / Encounters / NPCs / Creatures / Locations / Items).
- Show counts per group if helpful.

### Interaction
- Clicking a reference opens a preview first (modal or drawer).
- Preview includes “Open full page” action.

---

## Soft delete (Archive) component
**Purpose:** Destructive actions are reversible.
Rules:
- Archive requires confirmation.
- Archived items hidden by default.
- Provide an “Archived” filter/view with restore action.

---

## Test data badge (fixtures)
Fixture campaigns must show:
- A visible **TEST DATA** badge
- Consistent placement (e.g., in campaign header + campaign switcher rows)

This badge must be visible across:
- campaign dashboard
- module list and detail views
- export/import screens (if present)

---

## Print UI notes (interaction only)
- “Generate pack” should preview before final output where feasible.
- Cut lines toggle should be a clear control near print/export actions.
- Print settings and templates are defined in `docs/PRINT_SPEC.md`.
