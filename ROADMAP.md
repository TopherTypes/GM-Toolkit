# Product Roadmap

This roadmap translates the feature status matrix into a phased plan from the current baseline to the minimum viable product milestone and onward to version 1.0.0. Each release is organized as a thin vertical slice so that every update delivers usable workflow improvements.

## Status legend
- [ ] to do
- [/] in progress
- [x] completed
- [-] cancelled

## Current baseline (version 0.7.0)
Focus: A stable core platform with essential campaign, character, creature, encounter, and session prep foundations already available.

- [x] Local-first browser storage persistence.
- [x] Multi-campaign support with create, switch, and delete.
- [/] Campaign dashboard entry point with basic summary.
- [x] Theme selection for light, dark, and system preference.
- [x] Global banners, toast notifications, and modal dialogs.
- [x] Debug mode with debug report copy.
- [x] Schema versioning with migrations.
- [x] Export and import with dry run and conflict resolution.
- [x] Backup export with backwards compatibility.
- [/] Create, read, update, delete, and archive support across modules for nonplayer characters, creatures, encounters, and sessions.
- [/] References panel on detail pages with limited linking coverage.
- [/] Global search across all entities (nonplayer characters only).
- [/] Per-module search for name, tags, and notes in nonplayer characters, creatures, encounters, and sessions.
- [/] Tagging support in nonplayer characters, creatures, encounters, and sessions.
- [x] Campaign header, quick stats, and party size for experience point split on the campaign dashboard.
- [x] Nonplayer character, creature, encounter, and session preparation modules with core fields, status, and list management.
- [x] Experience point totals and per-member split in encounters.
- [x] Portable document format library fallback and smoke test.

## Version 0.8.0 — Campaign readiness slice
Focus: Deliver the minimum viable product workflows for party management, locations, items, and dashboard readiness so campaigns can be set up end to end.

- [ ] Campaign dashboard prep checklist and next-session summary.
- [ ] Campaign dashboard recently edited list and tool quick links.
- [ ] Campaign dashboard session pack print entry point.
- [x] Party roster with player and character fields.
- [x] Experience point split support sourced from party data.
- [ ] Location create, read, update, delete, and archive with parent and child hierarchy.
- [ ] Location description and tags.
- [ ] Session and location linking.
- [x] Item create, read, update, delete, and archive.
- [x] Item fields: name, description, identified details, passphrase, notes, and tags.
- [x] Passphrase generation for items.
- [ ] Trading card game style print variants for items.

## Version 0.8.1 — Session preparation and print slice
Focus: Make session preparation and print materials complete so a session can be prepared and printed without workarounds.

- [ ] Session preparation wizard flow.
- [ ] Notable linking to nonplayer characters and locations for sessions.
- [ ] Validation before print for sessions.
- [ ] Session pack generation.
- [ ] Encounter print page with A4 paper size layout.
- [ ] Required link validation for encounters (participants and required fields).
- [ ] Creature print cards with structured fields and truncation rules.
- [ ] Nonplayer character print cards.
- [ ] Combined portable document format pack with A4 pages and cards.
- [ ] Print specification compliance for cards and overflow rules.
- [ ] Option to include or exclude notables in the portable document format pack.
- [ ] Portable document format regression checklist.

## Version 0.9.0 — Minimum viable product complete
Focus: Close remaining minimum viable product gaps and complete global conventions.

- [ ] Storage size warning.
- [ ] Backlinks computed on the fly.
- [/] Create, read, update, delete, and archive support for party, locations, items, and reviews (party, items, and reviews complete).
- [ ] References panel coverage expanded across all modules.
- [ ] Global search across all entities beyond nonplayer characters.
- [ ] Per-module search for remaining modules.
- [ ] Tagging across all remaining modules.
- [x] Review module with fields for summary, key moments, outcomes, rewards, information changes, hooks, and game master notes.
- [/] Review linking to sessions, nonplayer characters, and locations.
- [x] Minimum viable product milestone achieved.

## Version 0.10.0 — Post-minimum viable product enhancements
Focus: Expand campaign management depth and improve print workflows.

- [ ] Plotline and quest tracking module.
- [ ] Session preparation wizard improvements: validation, ordering, and quick-create flows.
- [ ] Encounter templates and reusable encounter groups.
- [ ] Better creature stat blocks with structured templates.
- [ ] Search and tagging expansion beyond nonplayer characters and creatures.
- [ ] Print and portable document format polish for layout consistency and overflow handling.

## Version 0.11.0 — Scale, performance, and accessibility
Focus: Improve usability for large campaigns and make the application more inclusive.

- [ ] Performance improvements for large campaigns.
- [ ] Accessibility pass with keyboard-first flows and clearer focus states.
- [ ] Optional drive synchronization compatible with local-first storage.

## Version 1.0.0 — Production-ready release
Focus: Stabilization, documentation, and quality gates for a polished release.

- [ ] Final quality and regression review across all modules.
- [ ] Updated documentation for workflows and printing.
- [ ] Stability verification for import, export, and backups at scale.
