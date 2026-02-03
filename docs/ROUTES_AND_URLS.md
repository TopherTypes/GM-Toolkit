# Routes & URLs — GM-Toolkit

## Purpose
This document defines the URL structure and routing rules for GM-Toolkit (a hash-routed single-page app). It standardizes:
- canonical route patterns
- list and detail routes per module
- deep-link behavior (“shareable URLs”)
- what happens when campaigns/entities are missing
- how routing interacts with modals and previews

---

## Routing approach
- Use **hash routing** (e.g., `#/c/<campaignId>/npcs/<npcId>`)
- The campaign context is **always included** in deep links.

Why:
- Multiple campaigns exist
- Local-only storage means the URL must be explicit about which campaign it expects

---

## Canonical route patterns

### Root route
- `#/` redirects to the **last opened campaign dashboard**:
  - `#/c/<lastOpenedCampaignId>`

If no campaign exists yet:
- show a campaign picker / create-first-campaign screen (implementation choice)

### Campaign dashboard
- Dashboard is the campaign root:
  - `#/c/<campaignId>`

### Module list routes
Each module has a list route:
- `#/c/<campaignId>/party`
- `#/c/<campaignId>/npcs`
- `#/c/<campaignId>/creatures`
- `#/c/<campaignId>/encounters`
- `#/c/<campaignId>/locations`
- `#/c/<campaignId>/items`
- `#/c/<campaignId>/sessions` (prep)
- `#/c/<campaignId>/reviews` (session reviews)

> Note: Session Prep may be list + wizard, or wizard per session. The route still exists.

### Detail routes
Each module has a detail route:
- `#/c/<campaignId>/npcs/<npcId>`
- `#/c/<campaignId>/creatures/<creatureId>`
- `#/c/<campaignId>/encounters/<encounterId>`
- `#/c/<campaignId>/locations/<locationId>`
- `#/c/<campaignId>/items/<itemId>`
- `#/c/<campaignId>/sessions/<sessionId>`
- `#/c/<campaignId>/reviews/<reviewId>`
- Party member detail is optional; if present:
  - `#/c/<campaignId>/party/<memberId>`

### Create routes
- No dedicated `/new` routes in MVP.
- Creation happens:
  - via modal quick-create (when invoked from another module)
  - or via in-page create flow within a module

---

## Modals, previews, and URL behavior

### Modal quick-create
- Modal quick-create must **not** change the URL.
- The user remains on the current route, completes the modal, and continues the workflow.

### Preview-first panels (drawer/modal preview)
- Previews must **not** change the URL.
- “Open full page” navigates to the canonical detail route.

---

## Shareable URLs (best-practice defaults)
Even with local-only storage, URLs should be stable and “shareable” in the sense that:
- they deep-link to a specific view
- they are bookmarkable
- they are consistent across sessions

Recommended deep-link support (MVP):
- campaign dashboard (`#/c/<campaignId>`)
- module lists
- entity detail pages (NPC/Creature/Encounter/Location/Item/Session/Review)

Out of scope (MVP):
- preserving transient UI state like filters/search terms in the URL
- routing modal states
- routing print-preview states

Rationale:
- keeps URLs clean
- avoids brittle state encoding
- reduces complexity early

---

## Missing campaign behavior
If a route references a campaignId that does not exist in localStorage:
- show a **Campaign not found** screen
- provide an **Import backup** call-to-action (primary)
- optionally provide a campaign picker (secondary)

---

## Missing entity behavior
If a route references an entityId that does not exist in the campaign:
- redirect to the relevant module list route
- show a persistent banner:
  - “Not found: that item no longer exists (it may have been archived or deleted).”
  - “What you can do now: Search the list or show archived items.”

---

## GitHub Pages base path (brief note)
When hosted on GitHub Pages under a project site, the base path may include the repo name (e.g., `/GM-Toolkit/`). Hash routing generally avoids server-side route handling, but static asset paths should be:
- relative, or
- based on the detected base URL

This avoids broken CSS/JS loads on GitHub Pages.

---

## Implementation notes (non-binding)
- Keep all route parsing in one place (router module/service).
- Use route helpers to build URLs consistently.
- Ensure all navigation is keyboard-accessible.
