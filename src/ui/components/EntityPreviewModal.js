import { createElement } from "../dom.js";
import { createBadge } from "./Badges.js";

// Truncate long text safely for compact preview displays.
const createSnippet = (text, maxLength = 140) => {
  if (!text) return "No notes yet.";
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trim()}…`;
};

// Build badge elements for status and archived states.
const buildBadges = ({ status, isArchived }) => {
  const badges = [];
  if (status === "wip") {
    badges.push(createBadge({ text: "WIP", variant: "warning" }));
  } else if (status) {
    badges.push(createBadge({ text: "Complete" }));
  }
  if (isArchived) {
    badges.push(createBadge({ text: "ARCHIVED", variant: "muted" }));
  }
  return badges;
};

// Helper to build stacked preview rows without additional styling dependencies.
const buildStack = (children) => createElement("div", { className: "stack", children });

// Render a read-only preview modal for creatures, NPCs, or encounters.
export const openEntityPreviewModal = ({
  app,
  type,
  entity,
  encounterSummary,
  encounterXpTotal,
  onOpenFull,
}) => {
  const header = entity?.name || entity?.title || "Unknown";
  const subtitle = type === "creature" ? "Creature" : type === "npc" ? "NPC" : "Encounter";
  const badges = buildBadges({ status: entity?.status, isArchived: entity?.isArchived });
  const badgeRow = badges.length ? createElement("div", { className: "form-row inline", children: badges }) : null;

  const contentRows = [
    createElement("p", { className: "text-muted", text: subtitle }),
    badgeRow,
  ].filter(Boolean);

  if (type === "creature") {
    const metaRows = [
      entity?.type ? createElement("p", { text: `Type: ${entity.type}` }) : null,
      entity?.cr ? createElement("p", { text: `CR: ${entity.cr}` }) : null,
      Number.isFinite(entity?.xpAward) ? createElement("p", { text: `XP: ${entity.xpAward}` }) : null,
      entity?.extracted?.ac ? createElement("p", { text: `AC: ${entity.extracted.ac}` }) : null,
      entity?.extracted?.hp ? createElement("p", { text: `HP: ${entity.extracted.hp}` }) : null,
      entity?.extracted?.initiative
        ? createElement("p", { text: `Initiative: ${entity.extracted.initiative}` })
        : null,
    ].filter(Boolean);
    contentRows.push(buildStack(metaRows));

    if (entity?.source?.url) {
      const sourceButton = createElement("button", {
        className: "button secondary small",
        text: "Open source",
        attrs: { type: "button" },
      });
      sourceButton.addEventListener("click", () => {
        window.open(entity.source.url, "_blank", "noopener");
      });
      contentRows.push(sourceButton);
    }
  }

  if (type === "npc") {
    const roleLine = entity?.role ? `Role: ${entity.role}` : null;
    const classLine = entity?.class ? `Class: ${entity.class} ${entity?.level ?? ""}`.trim() : null;
    const keySkills = (entity?.keySkills || []).slice(0, 3);
    const skillsLine = keySkills.length
      ? `Key skills: ${keySkills
          .map((skill) => `${skill.name}${Number.isFinite(skill.bonus) ? ` (${skill.bonus})` : ""}`)
          .join(", ")}`
      : "Key skills: None listed.";
    contentRows.push(
      buildStack(
        [roleLine, classLine, skillsLine].filter(Boolean).map((line) =>
          createElement("p", { text: line })
        )
      )
    );
    contentRows.push(createElement("p", { text: `Notes: ${createSnippet(entity?.notes)}` }));
  }

  if (type === "encounter") {
    const metaRows = [
      entity?.mapRef ? createElement("p", { text: `Map: ${entity.mapRef}` }) : null,
      encounterSummary ? createElement("p", { text: encounterSummary }) : null,
      encounterXpTotal !== undefined && encounterXpTotal !== null
        ? createElement("p", { text: `Total XP: ${encounterXpTotal}` })
        : null,
    ].filter(Boolean);
    contentRows.push(buildStack(metaRows));
    if (entity?.notes) {
      contentRows.push(createElement("p", { text: `Notes: ${createSnippet(entity.notes)}` }));
    }
  }

  const content = buildStack(contentRows);
  const actions = [
    ...(onOpenFull
      ? [
          {
            label: "Open full details",
            variant: "primary",
            onClick: () => onOpenFull(),
          },
        ]
      : []),
    {
      label: "Close",
      variant: "secondary",
      onClick: () => app.modal.close(),
    },
  ];

  app.modal.open({
    title: header,
    content,
    actions,
  });
};

// Shared confirmation modal for unsafe navigation away from unsaved changes.
export const confirmLoseUnsavedChanges = ({ app, onConfirm }) => {
  const content = createElement("p", {
    text: "You have unsaved changes. Continue and lose changes?",
  });
  app.modal.open({
    title: "Unsaved changes",
    content,
    closeOnEscape: false,
    closeOnBackdrop: false,
    actions: [
      {
        label: "Cancel",
        variant: "secondary",
        onClick: () => app.modal.close(),
      },
      {
        label: "Continue",
        variant: "danger",
        onClick: () => {
          app.modal.close();
          onConfirm?.();
        },
      },
    ],
  });
};
