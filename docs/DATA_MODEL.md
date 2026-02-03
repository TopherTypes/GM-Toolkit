# Data Model — GM-Toolkit

## Purpose
This document defines the data model for GM-Toolkit: entity shapes, IDs, relationships, localStorage layout, and JSON export/import (including versioning, migrations, and conflict handling). It exists to keep the app stable as features expand and to prevent data loss over time.

---

## Core principles
- **Local-first:** all data is stored in the browser using `localStorage` only.
- **Multiple campaigns:** one app can store multiple campaigns at once.
- **Globally unique IDs:** entities use globally unique IDs (UUID-style) to simplify linking and merging.
- **Backwards compatibility:** exports include a schema version and can be migrated forward after user confirmation.
- **Backlinks computed:** backlinks are computed on-the-fly from references (not stored).

---

## IDs and naming rules

### ID format
- Use random globally unique IDs (UUID-style strings).
- IDs never change once created.
- IDs must be unique across *all* campaigns and entity types.

### Name matching rules (for imports/conflicts)
- Name comparisons are **case-insensitive**.
- “Same name conflict” only triggers when content cannot be auto-merged (see Import section).

---

## Timestamps (for “recently edited” and audit)
All entities should include:
- `createdAt` (ISO 8601 string)
- `updatedAt` (ISO 8601 string)

Example:
- `2026-02-03T12:34:56.789Z`

---

## localStorage layout

### Key strategy
Use multiple keys (safer for migrations and avoids one monolithic blob).

Recommended key prefix:
- `gmtoolkit:`

### Campaign index (required)
Store an index of campaigns for fast loading and switching:

- Key: `gmtoolkit:index`
- Value shape:
```json
{
  "schemaVersion": 1,
  "lastOpenedCampaignId": "cmp_...",
  "campaigns": [
    {
      "id": "cmp_...",
      "name": "Rise of the Runelords",
      "adventurePath": "Rise of the Runelords",
      "tags": ["ap", "sandpoint"],
      "createdAt": "2026-02-03T12:00:00.000Z",
      "updatedAt": "2026-02-03T12:00:00.000Z"
    }
  ]
}
```

### Per-campaign storage (required)
Store each campaign under its own key:

- Key: `gmtoolkit:campaign:<campaignId>`
- Value shape:
```json
{
  "schemaVersion": 1,
  "campaign": { "...campaign fields..." },
  "party": { "...party collection..." },
  "npcs": { "...npc collection..." },
  "creatures": { "...creature collection..." },
  "encounters": { "...encounter collection..." },
  "locations": { "...location collection..." },
  "items": { "...item collection..." },
  "sessions": { "...session collection..." },
  "sessionReviews": { "...review collection..." }
}
```

> Collections should be stored as maps keyed by ID (recommended) to simplify merge-by-ID:
> `{ "<id>": {entity}, "<id2>": {entity} }`

---

## Entity definitions (MVP)

### Campaign
Required fields:
- `id`
- `name`
- `adventurePath`
- `notes`
- `tags[]`
- `partySizeForXpSplit` (number; default 4)
- `createdAt`, `updatedAt`

Example:
```json
{
  "id": "cmp_123",
  "name": "GM-Toolkit Test Campaign",
  "adventurePath": "Six-book Adventure Path",
  "notes": "High-level notes.",
  "tags": ["ap", "test"],
  "createdAt": "2026-02-03T12:00:00.000Z",
  "updatedAt": "2026-02-03T12:00:00.000Z"
}
```

### Party member
Fields:
- `id`
- `campaignId`
- `playerName`
- `characterName`
- `class`
- `level` (number)
- `ac` object:
  - `normal`
  - `touch`
  - `flatFooted`
- `hp` (number)
- `notes`
- `tags[]` (optional, reserved)
- `createdAt`, `updatedAt`

Example:
```json
{
  "id": "pty_1",
  "campaignId": "cmp_123",
  "playerName": "Chris",
  "characterName": "Ari",
  "class": "Rogue",
  "level": 3,
  "ac": { "normal": 17, "touch": 14, "flatFooted": 13 },
  "hp": 24,
  "notes": "Darkvision via item.",
  "createdAt": "2026-02-03T12:00:00.000Z",
  "updatedAt": "2026-02-03T12:00:00.000Z"
}
```

### NPC
Fields:
- `id`
- `campaignId`
- `name`
- `role`
- `class`
- `level` (number)
- `attributes` fixed object: `{str,dex,con,int,wis,cha}` (numbers)
- `keySkills[]`: list of `{name, bonus}` objects
- `notes`
- `tags[]`
- `locationId` (optional; NPC → Location)
- `status` ("wip" | "complete")
- `createdAt`, `updatedAt`

Example:
```json
{
  "id": "npc_1",
  "campaignId": "cmp_123",
  "name": "Sheriff Hemlock",
  "role": "Authority",
  "class": "Ranger",
  "level": 5,
  "attributes": { "str": 14, "dex": 12, "con": 13, "int": 10, "wis": 15, "cha": 11 },
  "keySkills": [
    { "name": "Perception", "bonus": 9 },
    { "name": "Survival", "bonus": 8 }
  ],
  "notes": "Calm but firm.",
  "tags": ["sandpoint"],
  "locationId": "loc_1",
  "createdAt": "2026-02-03T12:00:00.000Z",
  "updatedAt": "2026-02-03T12:00:00.000Z"
}
```

### Location
Fields:
- `id`
- `campaignId`
- `name`
- `parentLocationId` (optional)
- `description`
- `tags[]`
- `createdAt`, `updatedAt`

### Creature
Fields:
- `id`
- `campaignId`
- `name`
- `type`
- `cr` (number; allow fractions as string like "1/2" if needed)
- `xpAward` (number; derived from CR lookup)
- `source` object:
  - `label`
  - `url`
- `extracted` object:
  - `ac`
  - `hp`
  - `initiative`
- `statBlock` (full pasted text)
- `notes`
- `variantOfCreatureId` (optional)
- `tags[]`
- `status` ("wip" | "complete")
- `createdAt`, `updatedAt`

> Note: `statBlock` will likely expand post-MVP.

### Encounter
Fields:
- `id`
- `campaignId`
- `title`
- `participants[]` extensible list of:
  - `{ type: "creature"|"npc", refId: "<entityId>", quantity: number, role: string }`
- `tactics`
- `mapRef`
- `treasureNotes`
- Derived (computed):
  - `totalXp`
  - `xpPerPc` (based on party size)
- `createdAt`, `updatedAt`

### Session (Prep)
Fields:
- `id`
- `campaignId`
- `date` (ISO string or YYYY-MM-DD)
- `title`
- `overview`
- `agenda` (string or list; implementation choice)
- `encounterIds[]` (ordered; required non-empty for MVP)
- `notableNpcIds[]` (optional)
- `notableLocationIds[]` (optional)
- `gmNotes`
- `createdAt`, `updatedAt`

### Session Review
Fields:
- `id`
- `campaignId`
- `sessionId` (links to Session)
- `summary`
- `keyMoments`
- `outcomes`
- `rewards`
- `nextHooks`
- `gmNotes`
- `informationChanges` (mix of structured + free text):
  - `freeText` (optional)
  - `changes[]` (optional list of structured change records)
- `createdAt`, `updatedAt`

Structured change record shape (MVP):
```json
{
  "entityType": "npc|location|plotline|other",
  "entityId": "optional",
  "changeType": "updated|revealed|moved|removed|note",
  "note": "What changed and why it matters."
}
```

---

## Relationships and backlinks

### Stored relationships
- Session → Encounters: `session.encounterIds[]` (ordered)
- Encounter → Participants: `encounter.participants[]` (creature + npc, required)
- Optional:
  - Session → notable NPCs / Locations
  - NPC → Location via `npc.locationId`
  - Location → parent via `location.parentLocationId`

### Backlinks (computed)
Backlinks are computed by scanning collections:
- NPC referenced by:
  - encounters where participant includes `{type:"npc", id:npcId}`
  - sessions where `notableNpcIds` contains npcId
- Creature referenced by:
  - encounters where participant includes `{type:"creature", id:creatureId}`
  - sessions via linked encounters
- Encounter referenced by:
  - sessions where `encounterIds` contains encounterId
- Location referenced by:
  - sessions where `notableLocationIds` contains locationId
  - NPCs where `locationId` is locationId

---

## XP automation (PF1e MVP)

### CR → XP lookup
MVP uses a CR→XP lookup table (standard PF1e). Store it in code as a map.

### Encounter XP calculations
For an encounter:
- `totalXp` = sum of XP awards for each participant:
  - creature XP from CR table × quantity
  - NPC XP: if NPCs have CR/XP (optional), treat similarly; otherwise allow manual override or treat as 0 (implementation decision)
- `xpPerPc` = `totalXp / partySize` (rounded as defined in UI)

> Note: If party size is 0 or unknown, `xpPerPc` should be hidden/disabled until party exists.

---

## JSON export/import

### Export file (one campaign per file)
Export includes:
- `schemaVersion`
- `exportedAt`
- `campaignId`
- `payload` (campaign + all collections)

Example:
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

### Import process (dry run first)
Import runs as:
1. **Dry run** summary:
   - how many entities will be added
   - how many will be updated
   - list of conflicts
2. User reviews conflicts in an aggregate “resolve conflicts” view
3. Apply import after decisions

### Merge rules
- Merge is by **ID**.
- If incoming entity ID does not exist → add.
- If incoming entity ID exists → attempt auto-merge:
  - If fields do not conflict, merge and update `updatedAt`.
  - If conflict exists, require user decision.

### Conflict definition
A conflict exists when:
- Same **ID** but incompatible content, OR
- Same **name** (case-insensitive) but incompatible content that cannot be merged.

### Default conflict option
Default suggested resolution:
- “Create duplicate with new ID” and an altered name (e.g., `"Goblin (Imported)"`)
…but user must explicitly choose a resolution.

### Migrations and schema versioning
- Exports include `schemaVersion`.
- If an import’s `schemaVersion` is older than the app’s current schema:
  - show confirmation: “Import is vX. Current is vY. Migrate now?”
  - on confirmation, run migrations and continue import
- Migrations should be additive where possible and preserve unknown fields when safe.

---

## Data safety and size warnings
- `localStorage` has limited space (often only a few MB).
- The app should warn when storage usage approaches a safe limit.
- Include a warning in UI and recommend exporting backups regularly for large campaigns.

---

## Open implementation notes (non-binding)
- Store collections as ID-keyed maps to keep merges fast.
- Keep `schemaVersion` for both:
  - the campaign storage blob, and
  - the export file.
- Prefer computed backlinks/derived stats over stored redundancy.
