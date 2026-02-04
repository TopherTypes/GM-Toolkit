# Roadmap — GM-Toolkit

## Purpose
This roadmap describes the intended path from MVP to v1.0.0, with clear priorities and quality gates. It is designed to support incremental delivery (thin vertical slices) while keeping the project prep-focused and avoiding scope creep.

---

## Guiding principles
- Build **prep-first** tools that reduce scatter and time-waste.
- Keep everything **modular but interconnected**.
- Prioritize **Session Prep** and **Session Review** as the core loop.
- Protect data: **backwards compatibility**, migrations, and reliable export/import.
- Maintain the “hard no” boundaries (see bottom).

---

## Versioning approach
- Current baseline: **v0.1.0** (documentation foundation)
- Target for MVP: **v0.2.0**
- v0.x: active development, features may evolve
- v1.0.0: “stable for real campaign use” (see definition below)

---

## Definition of v1.0.0 (release criteria)
v1.0.0 is reached when:
1. I can prep an entire **book of a published Adventure Path** without friction.
2. I can use the app to prep and run an **actively running campaign** as my primary prep tool.

Supporting expectations (implied):
- Print/PDF outputs are reliable and readable.
- Export/import and migrations have been proven across versions.

---

## Now / Next / Later

### NOW (MVP → v0.2.0)
Goal: deliver the complete end-to-end prep loop for Session 1.

Core outcomes:
- Prep Session 1 → generate combined PDF pack → complete Session Review
- LocalStorage persistence
- JSON export/import with dry run, conflicts, and schema migration confirmation
- Party roster management with archive controls and XP split integration
- Session Review module MVP workflow (list/detail + structured change capture)

Modules at MVP depth:
- Campaign Dashboard
- Party
- NPCs
- Creatures
- Encounters
- Locations
- Items (minimal, enough to support TCG cards)
- Session Prep (wizard)
- Session Review

Quality gates (MVP):
- Storage size warning visible
- Backlinks working (computed on the fly)
- Basic performance acceptable at AP scale (dozens of NPCs/locations; 100+ encounters)
- Manual regression checklist exists for PDF pack generation

---

### NEXT (Post-MVP 0.3 → ~0.6)
Goal: expand coverage so the toolkit supports “all aspects of prep” even if some areas are still rudimentary.

Key feature themes:
- **Better creature stat blocks**
  - richer semi-structured fields
  - improved formatting for cards and A4 sheets
  - easier editing and templates
- **Session Prep wizard improvements**
  - better validation (missing links, missing notes)
  - better reordering and run-sheet usability
  - smoother “create/link” flows mid-wizard
- **Plotline / quest tracking module**
  - basic plotline entities
  - link plotlines to sessions, NPCs, locations
  - status and next steps
- **Quality & scale**
  - performance improvements for large campaigns
  - migration fixtures and test import bundles
  - accessibility pass (keyboard-first + clear focus)

Recommended milestone framing:
- v0.3.x: expand creature and encounter tooling, tighten print pack
- v0.4.x: introduce plotline/quest tracking (thin slice first)
- v0.5.x: stabilize quality gates + scale improvements
- v0.6.x: prepare groundwork for Drive sync milestone

Quality gates (0.3–0.6):
- Import/export works across multiple schema versions with confirmed migrations
- PDF output regression checklist updated and followed
- “Recently edited” is reliable (updatedAt everywhere)
- No large-file drift (keep modules readable)

---

### LATER (0.7 → 1.0)
Goal: make the app reliable enough to prep an entire AP book and use it continuously during an active campaign.

Major milestone: **Google Drive sync**
- Target: a deliberate milestone (not “nice-to-have”)
- Preferred behavior: **auto sync** (with clear user controls)
- Notes:
  - this likely requires authentication/consent flows
  - should remain optional and not break local-first usage

Other likely v1.0 enablers:
- Plotline/quest tracking maturation (views, filtering, session linkage)
- Search/tagging expansion beyond NPCs/Creatures
- Stronger encounter templating and reusability
- Print/PDF polish (layout consistency, overflow handling, card grids)

Quality gates (toward 1.0):
- Proven stability at AP scale (100–150 encounters)
- Migration reliability: old exports import cleanly
- Clear upgrade notes in CHANGELOG.md
- Usability polish focused on “prep speed” and “print readiness”

---

## Thin vertical slice suggestions (Codex-safe)
When choosing “what to build next,” prefer slices like:
- One module’s list + detail + create flow + storage + backlinks + basic search
- One print output improvement (e.g., encounter page layout) end-to-end
- One import/export improvement (dry run summary → conflict resolution UI)

Avoid multi-module rewrites unless explicitly requested.

---

## Quality work items (recurring)
Include these explicitly as work, not afterthoughts:
- Migration fixtures (example exports per schema version)
- Storage size diagnostics + warnings
- Performance checks for large campaigns
- Accessibility checks (keyboard navigation, focus, headings)
- Print/PDF regression checklist (manual)

---

## Hard boundaries (won’t do)
These are explicit “no” items for the roadmap:
- **No VTT features** (initiative trackers, dice rollers, combat automation)
- **No map making or map generation** tools

If a feature starts to drift into these areas, stop and ask for confirmation before proceeding.
