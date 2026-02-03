# Storage Layout — GM-Toolkit

## Purpose
This document defines how GM-Toolkit stores data in the browser using **localStorage**:
- key names and what each key contains
- campaign storage strategy (multi-campaign, local-first)
- schema/version fields
- storage usage warnings (70% / 90%)
- integrity checks (checksum)
- fixture (TEST DATA) handling in storage

This keeps persistence predictable and makes migrations/imports safer.

---

## Storage strategy (best practice choice)
Use a **hybrid** approach:
- A small **global index** key for discovery and settings
- One **blob per campaign** for the actual campaign data

Why:
- Keeps campaign saves isolated and easier to export/import
- Allows many campaigns without rewriting a single giant state blob
- Enables safe “fixture replace” without touching unrelated campaigns

---

## localStorage key prefix
All keys use the prefix:
- `gmtoolkit:`

(If you ever rename the project, keep the prefix stable to avoid breaking old saves.)

---

## Keys and contents

### 1) `gmtoolkit:index`
**Purpose:** campaign registry + last opened campaign pointer.

Recommended structure:
```json
{
  "schemaVersion": 1,
  "lastOpenedCampaignId": "cmp_123",
  "campaigns": [
    {
      "campaignId": "cmp_123",
      "name": "Rise of the Runelords",
      "adventurePath": "Rise of the Runelords",
      "updatedAt": "2026-02-03T12:00:00.000Z",
      "isFixture": false
    },
    {
      "campaignId": "cmp_fixture_minimal_v1",
      "name": "Minimal Campaign Fixture",
      "updatedAt": "2026-02-03T12:00:00.000Z",
      "isFixture": true,
      "fixtureId": "minimal-campaign",
      "fixtureLabel": "Minimal Campaign Fixture",
      "fixtureVersion": 1
    }
  ]
}
```

**Required fields:**
- `schemaVersion`
- `lastOpenedCampaignId` (nullable if none exists)
- `campaigns[]` entries must include:
  - `campaignId`
  - `name`
  - `updatedAt`
  - `isFixture` (boolean)
  - if fixture: `fixtureId` (and ideally label/version)

### 2) `gmtoolkit:campaign:<campaignId>`
**Purpose:** stores all data for a specific campaign as one JSON blob.

Recommended structure:
```json
{
  "schemaVersion": 1,
  "campaignId": "cmp_123",
  "checksum": {
    "algo": "sha-256",
    "value": "…"
  },
  "savedAt": "2026-02-03T12:00:00.000Z",
  "payload": {
    "campaign": { "...": "..." },
    "party": { "...": "..." },
    "npcs": { "...": "..." },
    "creatures": { "...": "..." },
    "encounters": { "...": "..." },
    "locations": { "...": "..." },
    "items": { "...": "..." },
    "sessions": { "...": "..." },
    "sessionReviews": { "...": "..." }
  }
}
```

**Required fields:**
- `schemaVersion`
- `campaignId`
- `savedAt`
- `checksum`
- `payload`

### 3) `gmtoolkit:settings`
**Purpose:** user settings that are not campaign-specific.

Recommended structure:
```json
{
  "theme": "system" ,
  "darkModeOverride": null,
  "showArchivedByDefault": false
}
```

**Theme requirement**
- Default behavior: **system theme**.
- Allow an override, and persist it here.

### 4) `gmtoolkit:debug`
**Purpose:** persistent debug toggle.

Recommended structure:
```json
{
  "enabled": true
}
```

Debug can also be enabled via `?debug=1` (see Debug section).

---

## Save behavior

### Autosave and explicit save
- Forms may autosave, but all saves ultimately write:
  - the campaign blob (`gmtoolkit:campaign:<id>`)
  - and update the index (`gmtoolkit:index`) `updatedAt`

### Write order (recommended)
1. Validate data
2. Serialize campaign payload
3. Compute checksum
4. Write `gmtoolkit:campaign:<id>`
5. Update `gmtoolkit:index` entry for `updatedAt` (and name changes if applicable)

If step 4 fails due to quota, do not partially update index timestamps.

---

## Storage usage estimation and warnings

### Estimation method (required)
Estimate usage by measuring the byte length of the serialized JSON being stored:
- Use `TextEncoder().encode(jsonString).length` for bytes.

Track:
- size per campaign blob
- approximate total across gmtoolkit keys

### Warning thresholds (required)
Warn at approximately:
- **70%** used:
  - “Storage is getting full. Export a backup soon.”
- **90%** used:
  - “Storage is almost full. Export now and consider cleaning archived items.”

Behavior at 90%:
- Warn strongly (banner)
- Recommend export + cleaning archived items
- Still allow saving until it fails

See `docs/ERRORS_AND_NOTIFICATIONS.md` for UX patterns.

---

## Data integrity (checksum)

### Requirement
Each campaign blob includes a checksum so corruption can be detected (best effort).

### Algorithm (recommended)
- Primary: `sha-256` using Web Crypto `crypto.subtle.digest`
- Fallback: simple non-cryptographic hash (e.g., CRC32) if SubtleCrypto is unavailable

Checksum should be computed over:
- the serialized `payload` string (not including `checksum` and `savedAt` fields)

On load:
- recompute and compare
- if mismatch:
  - show a banner warning
  - recommend exporting immediately
  - do not silently discard data

---

## Debug mode

### Enable rules
Debug is enabled if:
- URL includes `?debug=1`, OR
- `gmtoolkit:debug.enabled === true`

### Debug outputs
In debug mode:
- log extra diagnostics (import/export, storage writes, PDF generation steps)
- show diagnostics in UI where appropriate (schema version, approx storage usage)

---

## Fixture (TEST DATA) storage rules

### Index visibility
Fixture campaigns must have `isFixture` and `fixtureId` present in `gmtoolkit:index` so:
- campaign switcher can label them without loading full blobs
- all screens can show a “TEST DATA” badge consistently

### Replace behavior
When importing fixtures:
- replace only the fixture campaign matching `fixtureId`
- never overwrite non-fixture campaigns
- update `lastOpenedCampaignId` to the fixture campaign after import

See `docs/FIXTURE_SPEC.md` and `fixtures/README.md`.

---

## Notes for future storage (out of scope for now)
- Google Drive sync will introduce:
  - authentication state
  - sync metadata (lastSyncAt, remote revision)
  - conflict handling beyond local import/merge

Do not bake Drive assumptions into the local schema in MVP; keep local-first stable.
