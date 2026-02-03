# Print Spec — GM-Toolkit

## Purpose
This document defines what “printable” means in GM-Toolkit: what gets included in print packs, how it is laid out, and the formatting rules for A4 session packs, index cards (NPC/Creature), and TCG item cards. It exists to keep output consistent, readable, and table-ready.

---

## Print output overview (MVP targets)
- **Primary output:** a single **combined PDF** containing:
  - A4 Session Pack pages
  - Encounter pages
  - NPC/Creature card sheets (index cards, multi-per-page)
  - Item card sheets (TCG size, multi-per-page)
- **Fallback:** if PDF generation is unavailable, provide print-friendly HTML views and use browser print (“Save as PDF”).

---

## Paper, printing, and general rules
- Default paper size: **A4**
- No double-sided printing assumptions in MVP
- **Page numbers:** required on A4 pages
- Sections should appear **only if they have content** (no empty pages/sections)

Margins:
- Use **safe but minimal** margins to avoid clipping while maximizing usable space.

---

## A4 Session Pack

### Pack composition
The A4 Session Pack can include the following sections **only when they have content**:
- Session summary (front page)
- Session overview / agenda
- Encounters (in session order)
- GM notes
- Notables (optional NPCs/Locations)

### Front-page summary (recommended)
Include a one-page “run sheet” summary at the front when data exists. It should be scannable and include:
- Session title + date
- One-paragraph overview
- Encounter list (in order) with map refs
- Quick notes (optional)

### Page numbering
- All A4 pages must include page numbers in the footer.

---

## Encounter pages (A4)

### Formatting rule
- **One encounter per page** (the encounter may flow onto additional pages if needed).

### Required fields (must appear)
Each encounter page must include:
- **Title**
- **Map reference**
- **Participants** (creatures and NPCs with quantities)
- **Tactics**
- **Treasure**
- **XP**:
  - Total XP
  - XP per PC (based on party size, where available)

### Participant formatting
- Participants should be clearly listed with quantity and a short identifier.
- Where possible, include quick-reference fields (e.g., AC/HP) without becoming dense.

---

## Index cards — NPCs and Creatures

### Card size selection
Index card size is standardized (MVP choice):
- **4x6 inches** (default)

### Sheet layout
- Cards are printed **multiple per A4 page** in a grid.
- **Cut lines are optional** (toggle on/off).

### NPC card type (MVP)
NPC cards should be **minimal combat quick view**:
- Name
- Role
- Class/level
- Key combat-relevant stats (e.g., AC, HP if tracked, key skill highlights)
- A compact notes area (short)

> Note: Detailed NPC fields still exist in the app, but the card prioritizes table usability.

### Creature cards (MVP)
Creature cards should include:
- Semi-structured quick fields:
  - AC, HP, speed, attacks, specials (where available)
- A **truncated** version of the full stat block text (overflow should be clipped or continued in a controlled way)

### Tags on cards
- **Do not print tags** on NPC/Creature cards in MVP.

---

## TCG item cards

### Card types (required)
There are two item card variants:
1. **Unidentified (player-facing)**:
   - Vague descriptive information only
   - No mechanical details
2. **Identified (full details)**:
   - Full item details (mechanics and specifics)

### Shared passphrase rule (required)
Both variants must display a shared **passphrase** clearly and consistently.
- Purpose: lets the GM match the correct detailed card when a player identifies the item.
- The passphrase should be visually prominent but not disruptive (e.g., a badge area).

### Colour usage
- **Full colour backgrounds are allowed** for player-facing item cards.

### Sheet layout
- TCG cards are printed multiple per A4 page in a grid.
- **Cut lines optional** (toggle on/off).

---

## Typography & visual style

### Fonts
- Using **Google Fonts** is allowed to support a “slight RPG utility” feel.
- Default approach:
  - 1 primary UI font for on-screen use
  - 1 print font (or reuse the same) optimized for readability

### Style goals
- Clean, modern, and readable
- Slight “RPG utility” flavour without being busy
- Avoid dense spreadsheet-like layouts

---

## PDF generation behavior

### Primary
- Generate one **combined PDF** for a selected session pack that contains:
  - A4 summary + agenda
  - encounter pages
  - NPC/Creature index card sheets for referenced entities (as included by pack rules)
  - item card sheets (where referenced/selected)

### Fallback
If PDF generation is unavailable:
- Provide print-friendly HTML views and open the browser print dialog.
- The user can “Save as PDF” from their browser/printer settings.

---

## Cut lines toggle
Where card sheets are generated (index and TCG):
- Provide an option: **Cut lines ON/OFF**
- Default can be ON (implementation choice), but must be user-controllable.

---

## File naming convention
When generating the combined PDF, use a predictable name, e.g.:
- `GM-Toolkit_<CampaignName>_Session-01_<YYYY-MM-DD>_Pack.pdf`

Rules:
- Replace spaces with hyphens or underscores
- Remove unsafe filename characters

---

## Open items to resolve in implementation
- Decide how to handle overflow text on cards (clip vs continue onto another card/page).
- Decide whether “referenced entities” in a pack include:
  - only those linked directly to session/encounters, or
  - also “notables” selected by the GM (recommended).
