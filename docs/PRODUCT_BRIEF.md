# Product Brief — GM-Toolkit

## Purpose
GM-Toolkit is a practical Pathfinder 1e prep web app that helps a GM move from **idea → ready-to-run session** using structured tools, templates, and light automation. It is designed for **prep at a desktop at home** and produces **printable materials** for in-person play.

## Target user
- Primary user: a single GM (initially you)
- Context: preparing Pathfinder 1e campaigns for in-person sessions
- Primary usage: **prep-first**; the app is a **backup reference** at the table, but printing is the main output

## The problem it solves
- Prep is currently **scattered across notes and tools**, leading to **time-consuming and unfocused** prep.
- The GM needs a **one-stop-shop** that makes prep faster, clearer, and reliably “ready-to-run.”

## What success looks like
After using GM-Toolkit for 3 sessions:
- Prep is **faster** and more **focused**
- Session materials are **complete** and ready to print
- The GM can reliably produce a **session pack** (notes + referenced NPCs/locations/encounters)
- Session outcomes are captured quickly and feed back into the campaign state

## Core workflow (north star)
1. Select campaign (auto-load last opened)
2. Build session using structured modules (party, NPCs, locations, creatures, encounters)
3. Generate a **print-ready session pack**
4. Run the session using printed materials
5. Complete a **session review** that updates campaign state and sets up the next prep cycle

## MVP emphasis
Two modules must be “best-in-class” in the MVP:
1. **Session Prep** — the place where everything comes together into a runnable session pack
2. **Session Review** — the place where outcomes are captured and campaign state is updated

Everything else in MVP exists to support these two modules.

## MVP feature set (high level)
- Multiple campaigns within the same app
- Campaign dashboard + campaign switcher
- Party management
- NPC notes & stats
- Location notes
- Creature builder (primarily structured input + formatting, with some automation)
- Encounter builder (primarily composition + formatting, with some automation)
- Session prep → printable session notes/pack
- Session review (outcomes + state changes)
- **JSON backup/restore** per campaign with versioning + migration support (backwards compatibility)

## Non-goals (explicitly out of scope for MVP)
- VTT-style features: initiative trackers, dice rollers, combat automation
- Accounts, cloud sync, multi-user collaboration
- Shipping built-in copyrighted rules text or pre-built PF content

## Content sourcing policy
- No pre-built content required inside the app.
- All data should be:
  - user-entered, OR
  - entered by the user from external sources such as Archive of Nethys (user-managed reference data).
- Avoid embedding copyrighted SRD text/spell/item blocks as bundled content.

## Data scale assumptions
Design for “published Adventure Path” scale:
- Dozens of locations
- Dozens of NPCs
- ~100 creatures
- ~100–150 encounters
- Many sessions over the lifetime of a campaign

This implies fast search, sensible filtering, and the ability to navigate linked entities.

## Linking expectations
Cross-linking should be supported throughout:
- Encounters reference creatures
- Sessions reference encounters, NPCs, and locations
- Reviews link back to sessions and update campaign state

Linking should be **optional** (not required for basic usage), but **easy and available** everywhere.

## Printing requirements
- Printing is the primary “table output.”
- Default print should be **black & white** and highly readable.
- Player-facing handouts (e.g., item cards) may optionally use **colour**.
- Print layouts should be clean, minimal, and not “spreadsheet-like.”

## Platform & technical constraints (non-negotiables)
- HTML web app hosted on GitHub Pages
- No build step required to use the hosted app
- Split HTML/CSS/JS files are fine
- Storage is **localStorage only** (for now)
- Browsers: Chrome/Edge first; keep compatibility in mind for Safari/Firefox where practical

## Backup & migration requirements
- One JSON file per campaign is acceptable.
- Import should aim to **merge** data; when conflicts occur, the user should be asked how to resolve them.
- Exports should include a `schemaVersion`.
- Automatic migrations are allowed and encouraged to keep older exports importable as the schema evolves.

## Accessibility & usability
- “Keyboard navigable” and “print readable” should be an explicit design option/baseline.
- UI should be clean, modern, and usable without feeling overwhelming.

## Open questions (for future docs to resolve)
- What counts as a “conflict” on merge (ID clash vs field-level differences)?
- Which entities get tags/search in MVP first (and which are deferred)?
- What is the minimal campaign state model updated by Session Review?
