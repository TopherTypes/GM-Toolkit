# Feature Status Matrix

> **Maintenance rule:** Update this file in every PR that changes features, module behavior, or roadmap scope.

## State legend
- **finished**: Implemented and usable in the current web app.
- **in development**: Partially implemented, still missing documented behaviors.
- **MVP**: Required for the MVP scope but not yet implemented.
- **todo**: Planned or potential feature that fits scope but is not yet started.

---

## Core platform
- **Local-first storage (localStorage persistence)** — finished
- **Multi-campaign support (create, switch, delete)** — finished
- **Campaign dashboard entry point** — in development (basic summary only)
- **Theme selection (light/dark/system)** — finished
- **Global banners/toasts/modals** — finished
- **Debug mode + debug report copy** — finished
- **Schema versioning + migrations** — finished
- **Export/import with dry run + conflict resolution** — finished
- **JSON backups with backwards compatibility** — finished
- **Storage size warning** — MVP
- **Backlinks (computed on the fly)** — MVP

## Global conventions (docs-driven)
- **CRUD + archive across all modules** — in development (NPCs/Creatures/Encounters/Locations/Items/Sessions implemented; Party/Reviews pending)
- **References panel on all detail pages** — in development (present, but limited linking coverage)
- **Global search across all entities** — in development (currently NPC-only)
- **Per-module search (Enter to search name/tags/notes)** — in development (implemented for NPCs/Creatures/Encounters/Items/Locations/Sessions)
- **Tagging across modules** — in development (NPCs/Creatures/Encounters/Items/Locations/Sessions)

## Module coverage

### Campaign Dashboard
- **Campaign header (name/adventure path/notes)** — finished
- **Quick stats (NPCs, Locations, Encounters)** — finished
- **Party size for XP split** — finished
- **Prep checklist / next-session summary** — MVP
- **Recently edited + tool quick links** — MVP
- **Session pack print entry point** — MVP

### Party
- **Party roster + player/character fields** — MVP
- **XP split support from party data** — MVP

### NPCs
- **NPC CRUD + archive/restore** — finished
- **Core fields (name, role, class, level, attributes, key skills, notes, tags)** — finished
- **Completion status (WIP vs completed)** — finished
- **Search/sort/tag filter** — finished
- **Preview modal + reference panel integration** — in development
- **Optional links to locations** — MVP
- **NPC print cards** — MVP

### Creatures
- **Creature CRUD + archive/restore** — finished
- **Core fields (name, type, CR, XP lookup, stat block, source link, tags)** — finished
- **Completion status (WIP vs completed)** — finished
- **Search/sort/tag filter** — finished
- **Variant linking** — finished
- **Creature print cards (structured fields + truncation rules)** — MVP

### Encounters
- **Encounter CRUD + archive/restore** — finished
- **Core fields (title, map reference, tactics, treasure, notes, tags)** — finished
- **Participant list (creatures/NPCs + quantities + roles)** — finished
- **XP totals + per-member split** — finished
- **Encounter print page (A4 layout)** — MVP
- **Required link validation (participants, required fields)** — in development

### Locations
- **Location CRUD + archive/restore** — MVP
- **Hierarchy (parent/child), description, tags** — MVP
- **Session/location linking** — MVP

### Items
- **Item CRUD + archive/restore** — finished
- **Item fields (name, description, identified details, passphrase, notes, tags)** — finished
- **Passphrase generation** — finished
- **TCG card print variants** — MVP

### Sessions (Session Prep)
- **Session CRUD** — finished
- **Encounter linking + ordering** — finished
- **Overview/agenda/GM notes/tags** — finished
- **Session prep wizard flow** — MVP
- **Notables (NPC/Location) linking** — MVP
- **Validation before print** — MVP
- **Session pack generation** — MVP

### Reviews (Session Review)
- **Review CRUD + archive/restore** — MVP
- **Review fields (summary, key moments, outcomes, rewards, info changes, hooks, GM notes)** — MVP
- **Session/NPC/Location linking** — MVP

## Printing & PDF
- **PDF library fallback + smoke test** — finished
- **Combined PDF pack (A4 + cards)** — MVP
- **Print spec compliance (cards, overflow rules)** — MVP
- **Include/not include notables in pack** — MVP
- **PDF regression checklist** — MVP

## Potential features in scope (post-MVP)
- **Plotline/quest tracking module** — todo
- **Session prep wizard improvements (validation, ordering, quick-create flows)** — todo
- **Better creature stat blocks + templates** — todo
- **Encounter templates/reusable groups** — todo
- **Search/tagging expansion beyond NPCs/Creatures** — todo
- **Print/PDF polish (layout consistency, overflow handling)** — todo
- **Performance improvements for large campaigns** — todo
- **Accessibility pass (keyboard-first + focus clarity)** — todo
- **Drive sync (optional, local-first compatible)** — todo
