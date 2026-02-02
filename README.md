# GM-Toolkit

A practical, local-first **Pathfinder 1e** campaign planner: a modular suite of interconnected tools for prepping in-person sessions, producing printable notes, and reviewing outcomes — supporting **multiple campaigns** in one web app.

---

## What this is
**GM-Toolkit** is a lightweight HTML web app (no build tooling required) hosted via GitHub Pages. It’s designed to help you prep Pathfinder 1e campaigns ahead of time, keep your prep organised, and generate clean printable session materials.

The app is built as a **single campaign planner** made up of **interconnected modules**. Each module stays focused, but links cleanly to the others (e.g., encounters reference creatures; sessions reference NPCs/locations; reviews update campaign state).

## Who it’s for
- **Primary:** me (in-person Pathfinder 1e GM)
- **Future:** anyone who wants a practical, prep-focused Pathfinder 1e toolkit

## Core workflows
1. **Select a campaign** (auto-load last opened)
2. **Prep the next session** (party, NPCs, locations, encounters)
3. **Generate printable session notes**
4. **Run the session** (from printed notes or quick reference views)
5. **Review the session** (capture outcomes and changes)

## MVP scope
The MVP is prep-first: build the core planning loop end-to-end before adding anything “VTT-like.”

**In MVP**
- **Multi-campaign support** (campaign dashboard + campaign switcher)
- **Party management** (characters, key stats/notes, roles, tags)
- **Creature builder** (custom creature stat blocks + templates)
- **Encounter builder** (compose encounters from creatures; notes; difficulty metadata)
- **Location notes** (searchable locations with tags + quick links)
- **NPC notes & stats** (searchable NPCs with tags + quick links)
- **Session prep** (assemble a session from linked entities → **printable session notes**)
- **Session review** (log what happened; track state changes)
- **JSON backup/restore** (export/import) with **versioning + backwards compatibility**

**Not in MVP (yet)**
- Initiative trackers, dice rollers, combat automation, VTT-style tools
- Accounts, cloud sync, multi-user collaboration
- Rules content hosting (SRD text)

> See: `docs/MVP_SCOPE.md`

## Modules
Navigation is **Campaign Dashboard → Tools**, with a minimal top/side menu for quick switching between modules.

Planned MVP modules:
- **Campaign Dashboard** — overview, next-session checklist, campaign switcher
- **Party** — party roster, key notes, tags
- **Creatures** — creature builder + stat blocks
- **Encounters** — encounter builder (compose encounters from creatures)
- **Locations** — location notes + linking
- **NPCs** — NPC notes + stats + linking
- **Session Prep** — build a session and output a print-friendly pack
- **Session Review** — capture outcomes and update campaign state

> See: `docs/INFORMATION_ARCHITECTURE.md`

## Tech stack
- **App type:** HTML web app (runs in the browser)
- **Code:** HTML + CSS + JavaScript (split into files as needed)
- **Storage:** `localStorage` only
- **Hosting:** GitHub Pages

> No build step or tooling is required to use the hosted app.

## Data & backups
- All data is stored locally in the browser via **`localStorage`**.
- The app supports **multiple campaigns**, stored under separate campaign IDs.
- **Backup/restore:** JSON export/import is part of the MVP.
- **Backwards compatibility:** exports are versioned and the app includes migration steps so older exports remain importable as the schema evolves.

> See: `docs/DATA_MODEL.md`

## Project principles (non-negotiables)
- **Prep-focused:** this is a planning toolkit, not a VTT
- **Modular but interconnected:** modules stay bounded, but link naturally
- **Incremental delivery:** ship small, testable improvements
- **Local-first:** storage stays in-browser
- **Practical UX:** fast to use during prep, clean outputs for the table
- **No surprise dependencies:** add libraries only when the payoff is clear

## Repo structure
```
/index.html       App entry point
/src              JavaScript modules
/styles           CSS
/assets           Icons/images/fonts
/docs             Product + architecture docs
/prompts          Codex working instructions
/examples         Example data (JSON, markdown)
```

## Working with Codex
House rules and prompts live here:
- `prompts/CODEX_INSTRUCTIONS.md`

Suggested process:
1. Keep tasks small
2. Require a short plan before edits
3. Require a checklist after edits
4. Update docs when behaviour changes

## Roadmap (post-MVP)
- Improved print layouts (PDF-friendly formatting)
- Encounter builder upgrades (templates, reusable groups)
- Better linking/graph views between entities
- Optional quality-of-life helpers (still prep-focused)

## License
MIT
