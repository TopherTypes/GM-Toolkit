# Errors & Notifications — GM-Toolkit

## Purpose
This document defines how GM-Toolkit communicates with the user when things succeed, fail, or require attention. It standardizes:
- tone and message structure
- when to use toasts vs banners vs modals
- what gets logged (and when)
- debug reporting expectations
- localStorage capacity warnings

Goals:
- No silent failures
- Clear, actionable messaging
- Consistent UX across modules

---

## Tone and writing style
- Tone: **friendly and practical**
- Avoid humour; keep language calm and direct
- Messages should be short and scannable

### Message structure (recommended)
Where appropriate, messages should include:
1. What happened (plain English)
2. Why it matters (one sentence)
3. **What you can do now** (actionable suggestion)

Example:
- “Import failed. The file is not a GM-Toolkit export. What you can do now: Export again from GM-Toolkit or choose a different file.”

---

## Notification types and when to use them

### Toasts (success / non-blocking info)
Use toasts for:
- Save completed (“Saved”)
- Export completed
- Import completed (non-conflict)
- Minor informational updates (e.g., “Cut lines enabled”)

Rules:
- Toasts auto-dismiss after a reasonable amount of time (e.g., 5–8 seconds).
- Provide a manual close control.

### Banners (errors and warnings)
Use banners for:
- Errors that do not require immediate user decision
- Warnings that should remain visible until addressed
- Storage capacity warnings

Rules:
- Error banners should persist until dismissed or resolved.
- Warning banners should persist until dismissed or the condition clears.
- Banners should not stack excessively; combine messages if needed.

### Modals (blocking confirmations and critical flows)
Use modals for any situation where the user must make a decision before proceeding.

---

## Modal-required cases (blocking)
These situations must use modals:
- Unsaved changes when leaving a screen/route
- Import fixture replace warning
- Import conflicts: entering the “review conflicts” flow
- Schema migration confirmation
- Archive (soft delete) confirmation

Modal rules:
- Trap focus while open
- Provide explicit primary/secondary actions (e.g., “Proceed” / “Cancel”)
- Use clear consequences language

---

## Standard messages (examples)
These are examples of message intent; exact phrasing can vary, but the structure should remain consistent.

### Import validation failure (banner)
- “Import failed. This file doesn’t look like a GM-Toolkit backup.”
- “What you can do now: Export again from GM-Toolkit or choose a different file.”

### Migration required (modal)
- “This backup is from an older version. It needs to be updated before importing.”
- “What you can do now: Review the summary and confirm migration.”

### Conflicts detected (modal → conflicts view)
- “Conflicts found. Some items exist in both places with different content.”
- “What you can do now: Review conflicts and choose how to resolve each one.”

### Export success (toast)
- “Export complete.”
- “What you can do now: Store the file somewhere safe (encrypted drive or vault).”

### Archive confirmation (modal)
- “Archive this NPC?”
- “What you can do now: Archive it (can be restored later) or cancel.”

---

## Logging and debug mode

### Non-debug mode logging
- Log **errors only** to console.
- Do not spam logs for normal operations.

### Debug mode logging
In debug mode (enabled via `?debug=1` or localStorage flag):
- Log additional diagnostics for:
  - storage reads/writes
  - import/export steps
  - conflict detection decisions
  - migration steps
  - PDF generation steps

### “Copy debug report” (recommended)
Provide a UI action (button) to copy a debug report containing:
- app version
- schema version
- browser + user agent
- timestamp
- current route
- last action (if tracked)
- error stack trace (if present)
- storage usage summary (approximate)

This should help filing GitHub issues without requiring screenshots.

---

## Storage capacity warnings (proactive)
Because localStorage quota varies by browser/device, usage must be treated as approximate.

### Warning thresholds
- Warn at approximately **70%** used:
  - banner: “Storage is getting full.”
  - suggestion: “Export a backup and consider cleaning archived data.”
- Warn at approximately **90%** used:
  - banner: “Storage is almost full. Saving may fail soon.”
  - suggestion: “Export now, then delete/archive unused items.”

### Save failure due to storage (banner + modal if needed)
If a save fails due to quota:
- Show a clear banner:
  - “Save failed. Your browser storage is full.”
- Provide an immediate action suggestion:
  - “Export a backup now.”
- Consider an additional modal if the user is in a critical flow (e.g., session prep wizard) to prevent loss.

---

## Implementation notes (non-binding)
- Prefer a single notification service (`/src/services/notifications`) to centralize behavior.
- Avoid duplicated message logic across modules.
- Keep all user-facing messages in one place where feasible (helps consistency and future localization).
