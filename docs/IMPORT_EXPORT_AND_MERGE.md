# Import, Export & Merge — GM-Toolkit

## Purpose
This document defines how GM-Toolkit backs up and restores campaign data safely:
- what exports contain
- how imports work (dry run first)
- how merging and conflicts are handled
- how fixture imports behave safely
- how schema migrations are confirmed and applied

It exists to prevent data loss and to keep imports predictable as the data model evolves.

---

## Export

### Scope (MVP)
- Export applies to the **selected campaign only**.
- Export includes **all data** for that campaign (not a subset).

### Export file contents
An export file must include:
- `schemaVersion`
- `exportedAt`
- `campaignId`
- `payload` containing the campaign and all collections
- (optional) fixture metadata fields if the export is a fixture (see Fixtures section)

Example structure:
```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-02-03T12:00:00.000Z",
  "campaignId": "cmp_123",
  "payload": {
    "campaign": { "..."},
    "party": { "..."},
    "npcs": { "..."},
    "creatures": { "..."},
    "encounters": { "..."},
    "locations": { "..."},
    "items": { "..."},
    "sessions": { "..."},
    "sessionReviews": { "..."}
  }
}
```

---

## Import (high-level flow)

### Step 1: Parse + validate
On selecting an import file:
- validate it is a supported GM-Toolkit export
- validate required fields exist
- report errors clearly (no silent failures)

### Step 2: Dry run (required)
Before applying changes, the app must produce a **dry run summary** including:
- campaign name + ID
- schema version (imported vs current)
- counts:
  - new entities to add
  - entities to update
  - entities unchanged
  - conflicts detected
- a conflict list suitable for review

### Step 3: Decide import mode (non-fixture)
For non-fixture imports, the app must prompt the user:
- **Merge into existing** (if `campaignId` exists), OR
- **Import as new campaign copy**

Notes:
- Campaign targeting is **inferred** from `campaignId` (no manual target selection in MVP).
- “Import as new copy” must generate a new campaign ID and new entity IDs to avoid collisions.

### Step 4: Resolve conflicts (required when conflicts exist)
If conflicts exist, the app shows an aggregate **Review Conflicts** view (see below).

### Step 5: Apply import
Apply changes according to the user’s chosen mode and conflict resolutions.

### Step 6: Post-import prompt
After a successful import (especially after migration), prompt:
- “Export an updated backup now?” (recommended)

---

## Merge rules (by ID)

### Primary identity
Entities are merged by **ID**.

Cases:
1) Incoming ID does not exist → **Add**
2) Incoming ID exists → **Compare and merge**
3) Name collisions (case-insensitive) may trigger conflict review (see below)

### Auto-merge cases (no prompt)
If same ID exists and differences are only in:
- timestamps
- non-critical derived fields
- formatting changes that do not alter meaning
…then auto-merge without prompting.

> If a “meaningful” field differs (content), treat as a conflict unless rules below apply.

---

## Conflict detection

A conflict exists when:
- Same **ID** but incompatible content changes, OR
- Same **name** (case-insensitive) exists with incompatible content that cannot be safely auto-merged

### Name-based collisions (advanced)
By default, do not auto-merge by name. Instead:
- prompt user to confirm, OR
- allow “aggressive import” mode that can attempt name-based merging

---

## Conflict resolution UI (Review Conflicts)

### Conflict actions (supported)
For each conflict, the UI must support:
- **Most recent wins** (based on `updatedAt`)
- **Choose incoming**
- **Choose existing**
- **Duplicate with new ID** (recommended default)

> “Most recent wins” should be explicit and show timestamps so the user understands the choice.

### Default action
- Default selection: **Duplicate with new ID**
- Duplicates should use the suffix: **“(Imported)”** by default (and “(Imported 2)” etc. if needed)

### Bulk actions
Provide a bulk option:
- “Resolve all conflicts as…” (user can then adjust individual ones)

### Apply confirmation
Before applying resolutions, show a final confirmation summary:
- counts of chosen actions
- any entities that will be duplicated

---

## Import as new campaign copy
When importing as a new copy:
- Generate a new campaign ID
- Generate new IDs for all entities
- Preserve relationships by remapping old IDs → new IDs internally

This avoids merging altogether and guarantees no collisions with existing campaigns.

---

## Schema migrations

### When migrations occur
If `import.schemaVersion < app.schemaVersion`:
- show a **plain-English** confirmation prompt:
  - “This backup is from an older version of GM-Toolkit. We need to update it before importing.”

### Migration summary
The migration prompt should include a short summary, when possible:
- “We will add/rename/update fields to match the current version.”
- “Your data will be preserved.”

### After migration
After import completes, prompt the user:
- “Export an updated backup now?” (recommended)

---

## Fixtures (test data) — special rules

### Fixture detection
An import is treated as a fixture when:
- `isFixture === true`

### Fixture behavior (required)
Fixture imports must:
1. Show a warning:
   - “You are importing TEST DATA. This will replace the existing fixture campaign for `<fixtureId>`.”
   - “Your real campaigns will not be affected.”
2. On confirmation:
   - Replace the existing fixture campaign with the same `fixtureId` (or create it if missing)
3. Never overwrite or delete non-fixture campaigns
4. Auto-open the fixture campaign after import and set it as last-opened

---

## Error handling requirements
- All import/export failures must be visible to the user (toast/banner/dialog)
- Include a clear message and actionable next steps
- Log technical details to console (especially in debug mode)

---

## Out of scope (MVP)
- Export all campaigns in one file
- Manual selection of merge target campaign
- Automatic cloud sync / accounts

---

## Implementation notes (non-binding)
- Use the entity shapes and storage layout defined in `docs/DATA_MODEL.md`.
- Keep merge logic deterministic and reversible where possible.
- Always prefer safety over “clever merges” that risk data corruption.
