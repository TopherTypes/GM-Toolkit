# Release Process — GM-Toolkit

## Purpose
This document defines a lightweight, repeatable process for releasing GM-Toolkit using:
- semantic versioning (SemVer)
- `CHANGELOG.md` in “Keep a Changelog” format
- Git tags and GitHub Releases

Goals:
- predictable version bumps
- clear release notes
- reduced risk of regressions (especially PDF/print + import/export)

---

## Versioning rules (SemVer)
GM-Toolkit uses semantic versioning:

- **0.x (pre-1.0)**:
  - **Minor** (`0.MINOR.PATCH`) for new features and meaningful changes
  - **Patch** (`0.MINOR.PATCH`) for bug fixes and small improvements
  - Breaking changes can still happen in 0.x, but must be clearly documented

- **1.0+ (future)**
  - **Major** for breaking changes
  - **Minor** for features
  - **Patch** for fixes

### Starting point
- Initial baseline: `0.1.0`
- MVP target: `0.2.0` (as defined in roadmap/scope)

---

## Where the version lives (required)
Version must be updated in **both** places:

1) A single source file (recommended):
- `src/version.js` (or `src/app/version.js`)
- exports the current version string (e.g., `export const APP_VERSION = "0.2.0";`)

2) `index.html`
- include a version comment or meta tag (useful for static hosting visibility)

### UI surfacing (recommended)
- Show version in:
  - app footer (small)
  - debug report (“Copy debug report” includes version)
  - “About” modal (optional)

---

## Release checklist (required)
A release should follow this short checklist.

### 1) Prepare
- Ensure main branch is clean and builds/loads in Chrome + Edge
- Confirm scope of changes for this release

### 2) Update documentation
- Update any impacted docs (examples):
  - `docs/MVP_SCOPE.md`
  - `docs/DATA_MODEL.md`
  - `docs/IMPORT_EXPORT_AND_MERGE.md`
  - `docs/PRINT_SPEC.md`
  - `docs/ROUTES_AND_URLS.md`
  - `docs/STORAGE_LAYOUT.md`

### 3) Update changelog
- Update `CHANGELOG.md` following Keep a Changelog.
- Add the release date.
- Ensure the “Unreleased” section reflects what is going out vs what stays.

### 4) Bump version
- Update `src/version.js`
- Update `index.html`
- Verify version is displayed (footer/debug report)

### 5) Run manual regression tests
Run the checklist in:
- `docs/TESTING_AND_REGRESSION.md`

Minimum must-pass for every release:
- Smoke test
- Export/import test
- Migration test (if schema changed)
- PDF/print regression
- AP-scale performance sanity check (if relevant code changed)

### 6) Commit release changes
Commit includes:
- version bump
- changelog update
- doc updates (if any)

Suggested commit message:
- `chore(release): v0.2.0`

---

## Tagging and GitHub Release (recommended)
Releases should be:
- a Git tag
- a GitHub Release

### Tag format
Use:
- `v0.2.0`

### Create a Git tag
Create an annotated tag (recommended):
- tag: `v0.2.0`
- message: `Release v0.2.0`

### Create a GitHub Release
GitHub Release notes should be based on the changelog:
- Highlights (top 3–5 items)
- Added / Changed / Fixed (short bullets)
- Known limitations / next steps

---

## Hotfix process (patch releases)
If a critical bug is discovered after release:
1) Create a hotfix branch from the tag or release commit
2) Apply minimal fix
3) Run focused regression:
   - affected area + smoke test + export/import + print if relevant
4) Bump patch version:
   - `0.2.0` → `0.2.1`
5) Update changelog (Fixed section)
6) Tag and publish GitHub Release

---

## Notes and guardrails
- Never release without updating the changelog.
- If schema changes, always include a migration fixture update (as applicable) and run migration regression.
- Keep releases small and frequent; avoid “mega releases” that make regressions harder to isolate.
