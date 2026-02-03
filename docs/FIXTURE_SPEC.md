# Fixture Spec — GM-Toolkit

## Purpose
Fixtures are fake campaign exports used for manual regression testing and demos. This spec defines:
- where fixtures live in the repo
- required fixture metadata fields
- safe import behavior (fixtures replace fixtures, never touch real campaigns)
- what the minimal and AP-scale fixtures must contain
- how migration fixtures are organized and retained

This exists to make testing fast and safe.

---

## Location and structure

### Folder location
Fixtures live at repo root:
- `/fixtures/`

### File naming conventions
Core fixtures:
- `fixtures/minimal-campaign.json`
- `fixtures/ap-scale-campaign.json`

Migration fixtures (versioned by schema):
- `fixtures/migrations/v1/minimal-campaign.json`
- `fixtures/migrations/v1/ap-scale-campaign.json`
- `fixtures/migrations/v2/minimal-campaign.json`
- `fixtures/migrations/v2/ap-scale-campaign.json`
- …continue for each schema version since MVP

### Fixture documentation
Include:
- `fixtures/README.md` explaining how to use fixtures and the safety rules.

---

## Fixture metadata (required)

### Export-level fields
Fixture exports must include these fields at the root of the export JSON:
- `isFixture: true`
- `fixtureId: "<stable-id>"` (e.g., `"minimal-campaign"`, `"ap-scale-campaign"`)
- `fixtureLabel: "<human label>"` (e.g., `"Minimal Campaign Fixture"`)
- `fixtureVersion: <number>` (optional but recommended; distinct from schemaVersion)
- `schemaVersion: <number>`
- `exportedAt: "<ISO timestamp>"`
- `campaignId: "<deterministic campaign id>"`

Example:
```json
{
  "isFixture": true,
  "fixtureId": "minimal-campaign",
  "fixtureLabel": "Minimal Campaign Fixture",
  "fixtureVersion": 1,
  "schemaVersion": 1,
  "exportedAt": "2026-02-03T12:00:00.000Z",
  "campaignId": "cmp_fixture_minimal_v1",
  "payload": { "...campaign data..." }
}
```

### Deterministic IDs (required)
Fixture files must use deterministic, stable IDs so regression checks are repeatable.

Guidelines:
- Prefix IDs by entity type:
  - `cmp_fixture_minimal_v1`
  - `npc_fixture_001`
  - `cr_fixture_001`
  - `enc_fixture_001`
  - `ses_fixture_001`
  - etc.
- Keep IDs stable across fixture updates unless the schema requires changes.

---

## Safe import behavior (required)

### Replace-with-warning rule
When importing a fixture (`isFixture === true`):
1. The app must show a warning:
   - “You are importing TEST DATA. This will replace the existing fixture campaign for `<fixtureId>`.”
   - “Your real campaigns will not be affected.”
2. After confirmation, the app replaces the existing fixture campaign with the same `fixtureId`:
   - If it exists: delete/replace only that fixture campaign
   - If it does not exist: create it

### Never overwrite real data
Fixture import logic must:
- never delete or overwrite any campaign where `isFixture !== true`
- never merge fixture entities into real campaigns

### Auto-open fixture after import
After successful fixture import:
- set `lastOpenedCampaignId` to the imported fixture campaign
- open it automatically (to speed up testing)

### UI labeling (required)
Fixture campaigns must be clearly labeled on **all relevant screens**, e.g.:
- Campaign switcher list
- Campaign dashboard header
- Any list/detail screens within that campaign

Recommended treatments:
- A visible “TEST DATA” badge
- Distinct styling (subtle) to avoid confusion

---

## Minimal fixture content (required)
`fixtures/minimal-campaign.json` must contain at minimum:

- 1 campaign
- 2 party members
- 2 NPCs (with attributes + key skills)
- 2 creatures (with semi-structured stat blocks)
- 2 encounters:
  - each includes both creature + NPC participants
- 1 parent location + 1 child location
- 1 item with:
  - unidentified and identified card variants
  - shared passphrase visible in both
- 1 session prep linking both encounters (ordered)
- 1 session review referencing that session

This fixture should be small but feature-complete, suitable for smoke testing.

---

## AP-scale fixture content (required)
`fixtures/ap-scale-campaign.json` is used for scale, search, backlink, and PDF performance checks.

Target counts:
- NPCs: **30**
- Locations: **30**
- Creatures: **80**
- Encounters: **100**
- Sessions: **20**
- Session reviews: at least enough to validate review flows (e.g., 5–10)

### Dense linking requirement
The AP-scale fixture must use dense cross-linking to stress backlinks and navigation:
- encounters reference multiple creatures and NPCs
- sessions reference multiple encounters
- notable NPCs/locations used throughout
- NPCs link to locations where relevant

---

## Migration fixtures policy

### Retention
Keep migration fixtures for **all schema versions since MVP**.

### Purpose
Migration fixtures exist to prove:
- imports from older schema versions trigger migration confirmation
- migrations preserve data and links
- exporting after import produces the latest schema version

---

## Fixture README requirements (fixtures/README.md)
The fixtures readme must explain:
- what fixtures are and why they exist
- how to import them safely
- what the “replace fixture only” rule means
- how fixture labeling appears in the UI
- where migration fixtures are stored and how to use them

---

## Notes
- Fixtures contain fake content only.
- Fixtures should reflect Pathfinder-like structure without embedding copyrighted text.
