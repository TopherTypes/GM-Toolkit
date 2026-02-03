# Accessibility & Usability — GM-Toolkit

## Purpose
This document sets the baseline usability and accessibility rules for GM-Toolkit so every module feels consistent, keyboard-friendly, and readable. It acts as a shared standard for Codex and for future changes.

Guideline target: **WCAG 2.1 AA** (best-effort alignment for a local-first tool).

---

## Core usability principles
- **Prep speed over cleverness:** fewer clicks, clear structure, predictable flows.
- **Consistency across modules:** list → detail → edit behaves the same everywhere.
- **Low cognitive load:** avoid dense grids and spreadsheet-like layouts.
- **Safety by default:** warn before destructive actions and before losing unsaved work.

---

## Theme and modes
- **Light mode and Dark mode** are supported.
- Dark mode must retain:
  - readable contrast
  - clear focus indicators
  - print styles remain light/print-friendly (print is separate CSS)

---

## Keyboard accessibility (required)
All screens must be usable with keyboard only:
- Navigate lists
- Open detail views
- Create/edit entities
- Save, cancel, and close dialogs
- Use search
- Trigger export/import actions

### Focus visibility
- Always show a clear visible focus style.
- Do not remove focus outlines without replacing them with something equally visible.

### Logical tab order
- Tab order must follow visual reading order.
- Avoid focus traps in page layouts (only modals should trap focus).

---

## Keyboard shortcuts (recommended)
Shortcuts should be optional and not block normal typing.

Suggested defaults:
- `/` → focus current page search (if present)
- `Ctrl+K` / `Cmd+K` → open global search
- `Esc` → close modal/preview
- `Ctrl+S` / `Cmd+S` → save (where explicit save exists)

> Shortcuts should be documented in UI (e.g., tooltips) when implemented.

---

## Forms and validation

### Required-field validation (hybrid)
- **Gentle inline validation**:
  - highlight missing/invalid fields as the user interacts
  - do not spam errors before the user touches the field
- **Strict validation on save/next**:
  - block proceeding until required fields are valid

### Error presentation (two-layer)
When validation fails:
1. Field-level messages next to inputs
2. A top-of-form summary:
   - “Fix these 3 things:” with anchors/jumps to fields (where feasible)

### Labels (required)
All inputs must have:
- visible labels, or
- programmatic labels (`aria-label`) where a visible label is not appropriate

---

## Modals and previews

### Modal behavior (required)
- Modals must trap focus while open.
- `Esc` closes the modal (unless the modal is in a critical state, e.g. unsaved data confirmation).
- Provide explicit buttons: **Save** / **Cancel** (or Close).
- On close, return focus to the element that opened the modal.

> “Cancel” is the explicit user action to dismiss. Focus should remain trapped until the modal is closed.

### Preview-first behavior (links/backlinks)
Previews may be implemented as:
- modal preview, or
- side panel / drawer preview,
…whichever best fits the screen layout.

Preview should include:
- entity title and key summary fields
- a clear “Open full page” action
- a clear “Close” action

---

## Lists, scale, and navigation

### Large lists (MVP)
For MVP, use:
- **search + scroll** (no pagination required)

### Global + per-module search
- Each module should have its own search.
- Global search should be accessible from the top bar and via shortcut.

### Recently edited
- Use `updatedAt` to populate “recently edited” lists.
- Keep recently edited lists scannable and capped (e.g., 10–20 items).

---

## Destructive actions (delete)
- Deletes are **soft delete** (archived), not hard delete.
- Deleting must require confirmation:
  - “Archive this NPC?” with clear consequences
- Archived items should:
  - be hidden by default
  - be recoverable via an “Archived” filter/view

---

## Saving, feedback, and safety

### Saving model (hybrid)
- Prefer autosave with a subtle indicator:
  - “Saving…” → “Saved”
- Also provide an explicit **Save** option on major edits or multi-step flows.

### Unsaved changes warning (required)
- If the user attempts to navigate away with unsaved changes:
  - show a confirmation warning
  - provide “Stay” and “Leave” actions
- This includes route changes within the SPA.

### Notifications
- Use toasts/banners for:
  - save success (if helpful)
  - export/import completion
  - errors (never silent failures)

---

## Print/readability considerations
- Print views must prioritize readability:
  - sensible font sizes
  - clear headings
  - no clipping
- Dark mode must never leak into print styles (print CSS overrides).

---

## Done criteria for a new screen/module
A new screen is “done” when:
- fully keyboard operable
- labels and headings are correct
- validation is hybrid (gentle + strict)
- errors show field-level + summary
- delete is soft + confirmed
- saving feedback is visible
- unsaved navigation warnings work
- dark mode styling remains readable
