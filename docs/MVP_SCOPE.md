# MVP Scope — GM-Toolkit

## Purpose
This document defines what **MVP** means for GM-Toolkit: what is in scope, what is explicitly out of scope, and what “done” looks like in testable terms. It exists to prevent scope creep and to give Codex a clear target.

## MVP success test
MVP is successful when:
- I can **prep Session 1** for a campaign,
- **print a session pack** (including linked elements),
- and **enter reflections** after the first table session.

## MVP constraints (non-negotiable)
- Pathfinder **1e** focus
- HTML web app hosted via GitHub Pages (no build tooling required)
- Storage: **localStorage only**
- Multiple campaigns supported
- Prep-first: printable materials are the primary output

---

## In scope for MVP

### 1) Screens / primary areas (minimum set)
MVP must include at least these primary screens:
1. **Campaign Dashboard**
2. **NPCs**
3. **Creatures**
4. **Session Prep**
5. **Session Review**

> Note: Encounters, Locations, Party, and Items may be implemented as sub-pages, modal flows, or secondary tabs, but the MVP must support their data and linkages as described below.

### 2) Data entities and minimum fields

#### Campaign
- name
- adventure path
- notes
- tags

#### Party member
- player name
- character name
- class
- level
- AC (normal / touch / flat-footed)
- HP
- notes

#### NPC
- name
- role
- class
- level
- attributes
- key skills
- notes
- tags

#### Location
- name
- parent location
- description
- tags

#### Creature
- name
- type
- CR
- **auto XP award** (derived from CR; display at least)
- stat block (free text / structured text)
- source link (URL)
- tags

#### Encounter
- title
- list of participants with quantities:
  - creatures (required)
  - NPCs (required)
- tactics
- map reference
- treasure notes

#### Session (Prep)
- date
- title
- agenda / overview
- expected encounters (linked)
- notable NPCs (optional linked)
- notable locations (optional linked)
- GM notes

#### Session (Review)
- summary
- key moments
- outcomes
- rewards given out
- information changes (NPC, location, plotline)
- next hooks
- GM notes

---

## Linking requirements (interconnected modules)
Linking should be easy throughout the app. “Backlinks” are part of MVP.

### Required links
- **Session ↔ Encounter** (session includes encounters; encounter shows sessions used in)
- **Encounter → Creature** (encounter includes creatures)
- **Encounter → NPC** (encounter includes NPCs)

### Optional links
- Session → NPC
- Session → Location
- NPC → Location

### Link UX (MVP)
- Select from existing items and display them as links/chips/tags
- Backlinks are visible on detail pages (e.g., NPC shows which sessions/encounters reference it)

---

## Printing / outputs (MVP)
Printing is the core value of MVP.

### “Print All” session pack (required)
From Session Prep, MVP must support a single action to generate a combined print pack that includes:
- Session overview / agenda
- All **linked encounters**
- For each encounter: all linked creatures + linked NPCs (as referenced participants)
- Any linked notable NPCs/locations (if present)

### Formats (MVP targets)
- **A4 full pages** for session notes, encounters, locations, and general reference
- **Index cards** for NPC and creature stats (print layout)
- **TCG-sized cards** for magic items (print layout)

> Note: MVP does not need perfect print CSS for every printer, but must produce usable, readable outputs.

---

## JSON backup/restore + backwards compatibility (MVP)
Backup is part of MVP.

### Export (required)
- Export **one file per campaign** (selected campaign only)
- Export includes `schemaVersion`

### Import / merge (required)
- Import merges by **ID**
- If conflicts are detected, prompt the user to resolve them

#### Conflict definition (MVP)
A conflict exists when:
- Same **ID** but incompatible content, OR
- Same **name** but incompatible content that cannot be merged automatically

### Migration (required)
- If importing an older schema, show a confirmation:
  - “This export is vX. The current app is vY. Migrate now?”
- Automatic migrations are allowed after confirmation

---

## Out of scope for MVP (explicit non-goals)
- VTT-style features: initiative trackers, dice rollers, combat automation
- Mobile-first design
- Fancy UI themes / heavy visual styling
- Authentication, accounts, cloud sync, multi-user collaboration
- Bundled rules content or pre-built copyrighted PF content

---

## MVP acceptance criteria (high level)

### Campaign Dashboard
- Can create/select a campaign
- Last-opened campaign auto-loads
- Has:
  - next session link
  - prep checklist
  - last session summary
  - tools navigation
  - campaign switcher
  - party overview

### NPCs
- Create/edit/view NPCs with required fields
- Tagging and basic search supported (at least name + tags)
- Shows backlinks (sessions/encounters where referenced)

### Creatures
- Create/edit/view creatures with required fields
- XP award displayed (derived from CR)
- Tagging and basic search supported (at least name + tags)
- Shows backlinks (encounters/sessions where referenced)

### Session Prep
- Create/edit session with required fields
- Can link encounters (required) and optionally link NPCs/locations
- “Print All” generates a combined session pack including linked elements

### Session Review
- Create/edit review linked to a session
- Captures required fields
- Can record information changes and next hooks

### Encounters (supporting capability)
- Create/edit encounters with required fields
- Must support required links to creatures and NPCs
- Included in Print All pack

### Party / Locations / Items (supporting capability)
- Party members can be created/edited and shown in dashboard overview
- Locations can be created/edited and optionally linked
- Item cards layout exists (TCG size); item data model may be minimal in MVP unless otherwise required

---

## Definition of Done (MVP)
MVP is “done” when:
- The MVP success test is achievable end-to-end
- Data persists reliably in localStorage across reloads
- JSON export/import works for a campaign, including conflict prompts
- Imports from older versions trigger a migration confirmation and succeed
- Print pack outputs are readable and complete (session + linked elements)
- No out-of-scope features were added
