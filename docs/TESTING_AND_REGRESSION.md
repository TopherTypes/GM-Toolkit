# Testing & Regression — GM-Toolkit

## Purpose
This document is a practical manual checklist for testing GM-Toolkit after changes. It focuses on the highest-risk areas:
- localStorage persistence
- import/export + conflicts + migrations
- backlinks
- PDF/print output (core value)
- performance at Adventure Path scale

It is designed to be fast enough to run regularly and thorough enough to catch common regressions.

---

## Test fixtures (recommended)
To speed up testing, the repo should include fixture exports (fake data) such as:
- `fixtures/minimal-campaign.json`
- `fixtures/ap-scale-campaign.json`
- (optional) versioned fixtures for migration testing, e.g.:
  - `fixtures/migrations/v1/minimal-campaign.json`
  - `fixtures/migrations/v2/minimal-campaign.json`

### Fixture safety rule (important)
Fixtures should be clearly marked so importing them **never duplicates** and instead **replaces only fixture data**, without touching real campaigns.

Suggested approach:
- Add a marker in fixture exports:
  - `isFixture: true`
  - `fixtureId: "minimal-campaign"` (or similar)
- On import:
  - If `isFixture === true`, the app may delete/replace the existing fixture campaign (same `fixtureId`) only.
  - It must never delete or overwrite non-fixture campaigns.

> This behaviour should be explicit and visible to the user at import time:
> “Importing fixture data will replace the existing fixture campaign. Your real campaigns will not be affected.”

---

## Baseline environment
- Browsers for MVP regression: **Chrome and Edge**
- Storage: localStorage only
- Routing: hash routing
- Debug mode: supported via `?debug=1` and localStorage flag

---

## Smoke test (golden path)
This is the minimum test to run after most changes.

1) Open app → confirm it loads without errors  
2) Create/select a campaign  
3) Create at least:
   - 1 NPC
   - 1 creature
   - 1 encounter (link creature + NPC participants)
   - 1 session (link the encounter)
4) Generate the **combined PDF pack**
5) Complete a **Session Review** linked to that session  
6) Reload the page  
7) Confirm all created data persists and is visible

Pass criteria:
- No crashes
- Data persists across reload
- Pack generation completes successfully

---

## localStorage persistence
1) Create an entity, save it, reload page
2) Confirm `updatedAt` changes when editing
3) Confirm last-opened campaign loads correctly

Pass criteria:
- No data loss across refresh
- Recently edited list updates as expected

---

## Backlinks & linking regression
Using a known set of entities:
1) Link a creature + NPC into an encounter
2) Link encounter into a session
3) Open:
   - Creature detail page → confirm it shows References to the encounter/session chain
   - NPC detail page → confirm references
   - Encounter detail page → confirm referenced in the session
4) Click a reference → confirm preview-first behaviour works and can open the full page

Pass criteria:
- References panel appears consistently
- Backlinks are correct and not duplicated
- Preview-first navigation behaves

---

## Search & tagging regression
Minimum checks (MVP priority: NPCs + Creatures):
1) Create NPCs/Creatures with different names/tags
2) Per-module search finds entities by name
3) Tag filtering (if implemented) works without hiding unrelated entities incorrectly
4) Global search returns expected results for NPCs/Creatures

Pass criteria:
- Search returns correct results quickly
- Global search does not break routing/navigation

---

## PDF / print regression (core)
Baseline expectation level: **C**
- PDF downloads
- Page breaks are correct
- Cards align with cut lines (if enabled)
- Typography is consistent
- No clipped or missing content

### Session pack checks
1) Generate combined PDF for a session with at least 2 encounters
2) Verify:
   - Front summary page exists (if configured and content exists)
   - Encounter ordering is correct
   - One encounter per page (overflow allowed onto extra pages)
   - Required encounter fields present: title, map ref, participants, tactics, treasure, XP
   - Page numbers appear on A4 pages

### Card sheet checks
1) Ensure NPC and creature cards appear in the pack if referenced
2) Verify:
   - Multiple cards per A4 page
   - Cut lines appear if enabled (no dedicated test required, but visually confirm)
   - Card content fits without clipping (or controlled truncation)

### Item card checks
1) Ensure item cards include:
   - Unidentified variant (vague descriptive info)
   - Identified variant (full details)
   - Shared passphrase visible on both

Pass criteria:
- Pack is complete and readable
- No missing required fields
- No obvious clipping or layout corruption

---

## Export/import regression (non-fixture)
1) Export a campaign
2) Clear site storage (or use a fresh browser profile)
3) Import the export
4) Verify:
   - All entities return
   - Links remain intact
   - Sessions still reference encounters
   - Backlinks compute correctly after import

Pass criteria:
- Import restores the campaign fully
- No lost references

---

## Fixture import regression (safe replace)
1) Import `fixtures/minimal-campaign.json`
2) Confirm it either:
   - creates the fixture campaign, or
   - replaces the existing fixture campaign of the same `fixtureId`
3) Confirm your real campaigns are untouched
4) Import `fixtures/ap-scale-campaign.json` and confirm same behaviour

Pass criteria:
- Fixture imports never duplicate
- Fixture imports never overwrite real campaigns

---

## Conflict resolution regression
Using two exports (or simulate by editing fixture versions):
1) Import data where:
   - same ID differs, OR
   - same name differs and cannot be merged
2) Confirm the app presents an aggregate “review conflicts” view
3) Confirm user choices apply correctly:
   - incoming wins
   - existing wins
   - duplicate with new ID (default suggestion)

Pass criteria:
- Conflicts are detected reliably
- Resolution choices are applied correctly and visibly

---

## Migration regression
1) Import an older schema fixture export (e.g., `fixtures/migrations/v1/...`)
2) Confirm the app prompts:
   - “Import is vX. Current is vY. Migrate now?”
3) Confirm migration succeeds and data remains intact
4) Confirm migrated data exports at the new schema version

Pass criteria:
- Migration prompt appears
- Import completes without corruption
- Export reflects updated schema version

---

## Performance sanity check (AP scale)
Target tolerance: **< 10 seconds** (on the test machine).

Steps:
1) Import `fixtures/ap-scale-campaign.json`
2) Perform:
   - global search for a common NPC term
   - open an NPC detail page
   - open an encounter detail page
   - generate combined PDF for a session with multiple encounters

Pass criteria:
- No UI freeze that feels “broken”
- PDF generation completes within tolerance
- Navigation remains responsive

---

## Debug mode regression
1) Enable debug mode:
   - add `?debug=1` OR set localStorage debug flag
2) Confirm:
   - additional diagnostic logging appears
   - storage size indicators (if implemented) are visible
   - schema version visibility (if implemented) is present
3) Disable debug mode and confirm UI returns to normal

Pass criteria:
- Debug toggles work
- Debug info does not leak into normal mode

---

## Before release checklist
Run these before tagging a version:
- Smoke test passes
- Export/import passes
- Migration test passes (if schema changed)
- PDF/print regression passes
- Changelog updated (`CHANGELOG.md`)
- Relevant docs updated (IA / Data Model / MVP scope if impacted)
