# Codex Instructions — GM-Toolkit

## Purpose
These instructions define how Codex should work in this repository. The goal is to keep GM-Toolkit modular, prep-focused, and stable as features are added incrementally.

Codex should treat this file as the operating contract for:
- how to plan work
- how to implement changes
- how to communicate results
- how to protect scope and data integrity

---

## Project summary (do not reinterpret)
- GM-Toolkit is a **Pathfinder 1e** prep toolkit.
- It is a **vanilla JS** SPA hosted on **GitHub Pages**.
- Data storage is **localStorage only**.
- It supports **multiple campaigns**.
- It is **prep-first**: the primary output is **printable / PDF** session packs and cards.
- Explicitly **not** a VTT (no initiative trackers, dice rollers, combat automation).

Reference docs (must remain consistent):
- `docs/PRODUCT_BRIEF.md`
- `docs/MVP_SCOPE.md`
- `docs/INFORMATION_ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/TECH_AND_STYLE_GUIDE.md`

---

## Working style (required)

### Always start with a plan
Before writing code, provide a short plan:
- what you will change
- which files you will touch
- what will be delivered at the end
- any assumptions
- any questions that must be answered first

### Ask questions first
If requirements are ambiguous, ask questions **before** implementing.

### Confirm before adding new modules/screens
Do not add new modules or top-level screens without explicit confirmation from the user.

### Scope per task
Maximum scope per task is **one thin vertical slice**:
- includes just enough data + UI + route + storage + print/PDF changes to be usable
- keep changes reviewable

---

## Repo structure rules (must follow)
- Modules live in: `/src/modules/<module-name>/`
- Shared UI: `/src/components/`
- Shared services/business logic: `/src/services/`
- App shell/router/nav: `/src/app/`
- Styles: `/styles/` (base UI separate from print styles)

Use **kebab-case** for files/folders.

### File size discipline
There is no hard limit, but avoid large files.
- Split logic when a file becomes hard to scan (~300–500 lines is a reasonable signal).
- Prefer small helpers over one “god file”.

---

## UI/UX rules (must follow)
- Default layout pattern: **page → sections → cards → forms**
- “Create new” from another module must use the **modal quick-create** workflow:
  - capture minimum viable fields
  - save
  - return to the originating flow without navigating away
- Entity detail pages must include a standard **References** panel (backlinks)
- Keep UI clean and modern with a slight “RPG utility” feel; avoid spreadsheet density

---

## Error handling (must follow)
No silent failures.
- Any failure must show a user-visible message (toast/banner/dialog)
- Log details to console
- In debug mode, include additional diagnostics

### Debug mode
Support both:
- URL flag: `?debug=1`
- localStorage setting (e.g., `gmtoolkit:debug=true`)

---

## PDF and printing (must follow)
PDF is the primary output.

### Priority order
1. **Generate a downloadable PDF** (preferred)
2. If PDF generation is unavailable, fall back to print-friendly HTML + browser “Save as PDF”

### Dependency exception for PDF
PDF generation is the approved exception to the “no third-party libraries” rule.
If a PDF library is used:
- Prefer a small, stable library
- Prefer vendoring into `/vendor/` for long-term stability
- Do not add other third-party deps without approval

### Print template build strategy (recommended)
Implement printing/PDF incrementally:
1. Session Pack (A4)
2. NPC/Creature index cards (multi-per-page with cut lines)
3. Item TCG cards (multi-per-page with cut lines)

Rationale: Session Pack delivers the core MVP value first, then cards expand the usefulness.

---

## Data integrity (must follow)
- Follow `docs/DATA_MODEL.md` exactly for entity shapes and storage keys.
- Always maintain backwards compatibility:
  - exports include `schemaVersion`
  - imports run a dry run first
  - migrations require user confirmation
- Backlinks are computed on the fly (do not persist backlink lists).

---

## Documentation discipline (required)
When making changes, update docs in the same change if relevant:
- routes/navigation → `docs/INFORMATION_ARCHITECTURE.md`
- entity fields/storage/export/import/migrations → `docs/DATA_MODEL.md`
- scope changes → `docs/MVP_SCOPE.md` (only with explicit approval)

### Changelog + semantic versioning (required)
Maintain a changelog:
- Create/Update `CHANGELOG.md` using semantic versioning (MAJOR.MINOR.PATCH)
- Each task should add a short entry under an “Unreleased” section (or bump version if instructed)

---

## Communication format (required)
After completing a task, respond with:

1) **What changed**
- short bullet list of implemented items

2) **How to test manually**
- step-by-step manual test instructions

3) **Known limitations / next steps**
- anything incomplete, deferred, or important to do next

Also include:
- list of files touched (short)

---

## Guardrails (do not violate)
- Do not add VTT features (initiative/dice/combat automation)
- Do not bundle copyrighted rules text or pre-filled PF content
- Do not introduce new modules/screens without confirmation
- Do not change the data model without updating migrations and export/import compatibility notes
