# Changelog

All notable changes to this project will be documented in this file.

The format is based on **Keep a Changelog**, and this project adheres to **Semantic Versioning**.

## [Unreleased]

### Added
- Initial project documentation (README, product brief, MVP scope, information architecture, data model, tech/style guide, Codex instructions).
- App shell scaffold with routing, campaign management, NPC module CRUD, and import/export flows.
- Storage, debug, search, and PDF smoke test services with minimal UI components.
- Base styles, theme variables, and component styling for the MVP interface.
- Settings modal with theme, archived defaults, debug toggle, and debug report copy.
- Campaign deletion flow with confirmation from the dashboard.
- Full Creatures and Encounters modules with CRUD, quick-create pickers, XP calculations, and backlinks.
- Session prep module with ordered encounter references and inline summaries.
- Campaign setting for party size XP split with schema migration support.
- Items module with list/detail CRUD, passphrase generation, and archive/restore controls.
- Party module MVP with list/detail CRUD, archive controls, and roster-based XP split support.
- Session review module MVP with list/detail CRUD, structured change tracking, and references to sessions, encounters, NPCs, and locations.

### Changed
- Modal layout now supports sticky header/footer with scrollable body for small viewports.
- NPC list rows include hover and focus affordances with archived markers.
- Search index now includes creatures, encounters, and sessions for tag suggestions.

### Fixed
- Fix GitHub Pages asset paths (relative paths for project site).
- Fix campaignStore SyntaxError (remove invalid token / encoding issue).
- Prevent NPC key skills from overflowing modals and ensure removals persist.
- Clarify completion labels, keep WIP controls prominent, and add safe preview modals to prevent losing unsaved encounter/session changes.

### Removed

### Security

## [0.1.0] - 2026-02-03
### Added
- Project documentation baseline:
  - README.md
  - PRODUCT_BRIEF.md
  - MVP_SCOPE.md
  - INFORMATION_ARCHITECTURE.md
  - DATA_MODEL.md
  - TECH_AND_STYLE_GUIDE.md
  - CODEX_INSTRUCTIONS.md

### Changed

### Fixed

### Removed

### Security


[Unreleased]: https://github.com/<YOUR_GITHUB_USERNAME>/GM-Toolkit/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/<YOUR_GITHUB_USERNAME>/GM-Toolkit/releases/tag/v0.1.0
