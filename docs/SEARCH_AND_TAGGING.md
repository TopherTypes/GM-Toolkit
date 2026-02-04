# Search & Tagging — GM-Toolkit

## Purpose
This document defines how search and tags work across GM-Toolkit:
- global search scope and result format
- per-module search behavior
- tagging rules (creation, normalization, suggestions)
- filtering/sorting expectations
- performance approach at Adventure Path scale

The goal is consistent, predictable search that remains usable as campaign size grows.

---

## Global search

### Scope (MVP)
Global search includes:
- Campaigns (optional, via switcher)
- Party members
- NPCs
- Creatures
- Encounters
- Sessions (prep)
- Session reviews
- Locations
- Items

### Matching rules
Global search matches:
- **name/title**
- **tags**

(Global search does *not* search full notes text in MVP, to keep performance predictable.)

### Result format
Each result row should show:
- **Name/title**
- **Entity type**
- **Small metadata** (type-specific)

Suggested metadata by type:
- NPC: role, location (if set)
- Creature: CR
- Encounter: map reference
- Session: date
- Location: parent location (if set)
- Item: passphrase (optional), item type (if implemented)

### Interaction
- Result click opens the full page in MVP (preview is a later enhancement).
- Global search is available from the top bar and optional shortcut (`Ctrl+K` / `Cmd+K`).
- Provide an “Include archived” toggle so users can find archived content when needed.

---

## Per-module search

### Scope (MVP)
Per-module search matches:
- **name/title**
- **tags**
- **written text** (notes / free-text fields)

Examples:
- NPC search matches NPC name, tags, and notes
- Creature search matches creature name, tags, and stat block text fields
- Session search matches title, agenda/overview, GM notes

### Trigger behavior
- Per-module search uses **press Enter to search**.
- Rationale: reduces churn on large datasets and avoids “typing lag”.

### Result behavior
- Search results update the current list view.
- Provide an easy “Clear search” control to return to full list and reset tag filters.

---

## Tagging rules

### Where tags exist (MVP)
Tags are supported (at minimum) on:
- NPCs
- Creatures

(Other entities may add tags later; the system should be designed to expand.)

### Tag entry
- Tags are **free-text**.
- The UI should **suggest existing tags** within the campaign (autocomplete dropdown).

### Normalization
- Tags are stored as **lowercase** (force lower).
- Tag comparisons are case-insensitive by design.

### Multi-word tags
- Multi-word tags are allowed (e.g., `town guard`).
- Tags should be stored as typed (but lowercased), including spaces.

---

## Filtering and sorting (list screens)

### MVP list controls
List screens should provide:
- Search
- Tag filter (multi-select where helpful)
- Sorting

### Default sort order
- Default list sort is **alphabetical by name/title**.

Sorting options (recommended):
- Name (A→Z)
- Most recently edited (updatedAt) (optional)
- For creatures: CR (optional)

---

## Performance expectations

### Target experience
- “Acceptable” performance target: **< 2 seconds** for large campaigns
- “Ideal” performance target: **quick** (snappy interactions)

### Indexing strategy (recommended)
To keep search responsive:
- Build a lightweight **in-memory index per campaign on load**.

Index contents (suggested):
- Entity ID
- Entity type
- Name/title (lowercased)
- Tags (lowercased)
- Minimal metadata fields for result display
- (For per-module full-text search) a cached concatenated searchable string per entity

Notes:
- The index should be rebuilt when entities change (incrementally where possible).
- Avoid storing the index in localStorage; compute it from stored data.

---

## Out of scope (MVP)
- Fuzzy matching / typo tolerance
- Full-text global search across all notes
- Advanced query syntax (AND/OR operators)
- Saved searches

---

## Implementation notes (non-binding)
- Debounce is not required for “press Enter” search, but global search may use debounced input.
- Use normalized strings for comparisons (trim, lower-case).
- Keep tag suggestion lists per-campaign and update them as tags change.
