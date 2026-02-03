# Fixtures — GM-Toolkit

## What this folder is
This folder contains **fixture exports**: fake campaign JSON files used for:
- quick manual testing
- regression checks (especially import/export, backlinks, and PDF packs)
- performance sanity checks at “Adventure Path scale”

Fixtures are intentionally **fake** and should not include copyrighted Pathfinder text.

---

## Safety rule (read this)
Fixtures are marked as **TEST DATA** and are imported differently to real campaigns.

### Fixture import behavior
When you import a fixture (`isFixture: true`), the app must:
1. show a warning (“this will replace existing fixture data”)
2. on confirmation, **replace the existing fixture campaign** with the same `fixtureId`
3. **never overwrite or delete real campaigns**
4. auto-open the fixture after import (and set it as last-opened)

If the app does not behave this way, do not use fixtures until it is fixed.

---

## Files

### Core fixtures
- `minimal-campaign.json`  
  Small but feature-complete: covers the whole MVP flow in a tiny dataset.

- `ap-scale-campaign.json`  
  Large dataset for performance, search, backlinks, and PDF pack testing.

### Migration fixtures
Stored under:
- `migrations/v<schemaVersion>/...`

Examples:
- `migrations/v1/minimal-campaign.json`
- `migrations/v1/ap-scale-campaign.json`
- `migrations/v2/minimal-campaign.json`
- `migrations/v2/ap-scale-campaign.json`

Migration fixtures are kept for **all schema versions since MVP** to prove upgrades still work.

---

## Fixture metadata (what to look for)
Every fixture export must include at the root:
- `isFixture: true`
- `fixtureId` (stable identifier, e.g. `minimal-campaign`)
- `fixtureLabel` (human-readable name)
- `fixtureVersion` (optional, fixture-only version)
- `schemaVersion` (data schema version)
- `exportedAt`
- `campaignId` (deterministic ID)
- `payload` (campaign + collections)

---

## What the fixtures contain

### Minimal fixture (required content)
- 1 campaign
- 2 party members
- 2 NPCs (attributes + key skills)
- 2 creatures (semi-structured stat blocks)
- 2 encounters (each includes creature + NPC participants)
- 1 parent location + 1 child location
- 1 item with:
  - unidentified and identified variants
  - shared passphrase visible on both
- 1 session prep linking both encounters (ordered)
- 1 session review for that session

### AP-scale fixture (target counts)
- NPCs: 30
- Locations: 30
- Creatures: 80
- Encounters: 100
- Sessions: 20
- Dense linking throughout to stress backlinks and navigation

---

## How to use fixtures (manual workflow)
1. Open GM-Toolkit
2. Use Import and select a fixture JSON
3. Confirm the warning prompt
4. Verify the app shows “TEST DATA” labelling
5. Run the regression checklist in `docs/TESTING_AND_REGRESSION.md`

---

## Updating fixtures
If you update fixtures:
- Keep IDs deterministic and stable where possible
- If schema changes, add new migration fixtures under a new `migrations/vX/` folder
- Update `docs/FIXTURE_SPEC.md` if the fixture rules change
