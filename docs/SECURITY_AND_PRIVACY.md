# Security & Privacy — GM-Toolkit

## Purpose
This document explains GM-Toolkit’s privacy stance, what data is stored, where it lives, and the practical risks of a local-first app. It is written to be clear and pragmatic rather than overly formal.

---

## Summary (plain English)
- GM-Toolkit stores your campaign data **in your browser** using **localStorage**.
- There are **no accounts**, **no telemetry**, and **no tracking**.
- If you clear your browser storage or lose your browser profile/device, your data is **gone unless you exported backups**.
- The app may introduce optional outbound integrations in the future (e.g., Google Drive), but they are **not part of the current design**.

---

## What data the app stores
GM-Toolkit stores campaign planning data you create, such as:
- campaigns and campaign notes
- party records
- NPCs, locations, creatures, encounters
- session prep and session reviews
- item cards and print-pack content
- export metadata (schema version, timestamps)

This data is stored locally on your device in your browser’s storage.

---

## Where the data lives
### localStorage (current)
- Data is stored using browser `localStorage`.
- Data is tied to the specific browser profile on the device where it was created.

### No server-side storage
- GM-Toolkit does not run a backend server.
- Nothing is uploaded anywhere by default.

---

## What the app does *not* do
- No analytics / telemetry
- No tracking pixels
- No ads
- No account creation
- No login
- No automatic cloud sync (current)

---

## Outbound network calls
### Current state
- The app is designed to work without requiring network calls for core functionality.
- All core data is user-entered and stored locally.

### Future possibility
- Outbound calls may be introduced later (e.g., integrations or reference-data helpers).
- Any outbound feature should be treated as an explicit capability with clear user controls.

---

## Shared/public computer warning
If you use GM-Toolkit on a shared or public computer:
- other users of that device/browser profile may be able to access your campaigns
- browser storage may be cleared automatically
- you may lose data without warning

Recommendation: avoid using GM-Toolkit on shared/public devices, or export backups immediately after use.

---

## Backups & recovery (important)
Because data is local:
- Export backups **regularly**
- Store backups somewhere safe (e.g., encrypted drive or secure cloud vault)
- Understand that clearing browser data will delete campaigns

### No recovery without exports
If you lose the device, browser profile, or localStorage data:
- GM-Toolkit cannot recover it
- your only recovery path is importing an exported JSON backup

---

## Practical security tips (short)
- Keep your browser and OS updated
- Use device login + disk encryption where possible
- Be cautious with untrusted browser extensions
- Avoid running the app on devices you do not control

---

## PDF generation note
GM-Toolkit may include a PDF generation library as an approved exception to the “no third-party dependencies” preference:
- the library should be vendored into the repo where possible
- PDF generation must not transmit campaign data anywhere
- if PDF generation is unavailable, the app falls back to browser print (“Save as PDF”)

---

## Future roadmap note (storage/sync)
GM-Toolkit currently does not include cloud sync or authentication. These may be introduced in a future update (e.g., Google Drive storage) as an explicit feature decision, but are out of scope for the current local-first MVP.

---

## Contact / reporting
If you notice a privacy or security issue:
- open an issue in the repository with clear reproduction steps
- include the browser/version and what you observed
