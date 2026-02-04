import { getXpForCr } from "../../utils/xp.js";

// Prefer active party roster size when available, falling back to the campaign setting.
const resolvePartySize = (campaign) => {
  const members = Object.values(campaign?.party || {}).filter((member) => !member.isArchived);
  if (members.length) {
    return members.length;
  }
  return Math.max(1, Number(campaign?.campaign?.partySizeForXpSplit || 4));
};

// Calculate total and per-member XP for an encounter.
export const calculateEncounterXp = ({ encounter, campaign }) => {
  const participants = encounter?.participants || [];
  const creatures = campaign?.creatures || {};
  const warnings = [];

  let totalXp = 0;
  participants.forEach((participant) => {
    if (participant.type === "creature") {
      const creature = creatures[participant.refId];
      if (!creature) {
        warnings.push("Missing creature reference.");
        return;
      }
      const xpAward = getXpForCr(creature.cr);
      if (xpAward === null) {
        warnings.push(`CR not recognized for ${creature.name}.`);
        return;
      }
      totalXp += xpAward * (participant.quantity || 1);
    }
  });

  const partySize = resolvePartySize(campaign);
  const xpPerMember = Math.floor(totalXp / partySize);

  return { totalXp, xpPerMember, warnings, partySize };
};

// Compute XP contribution for a participant row.
export const getParticipantXp = ({ participant, campaign }) => {
  if (participant.type !== "creature") {
    return 0;
  }
  const creature = campaign?.creatures?.[participant.refId];
  if (!creature) {
    return 0;
  }
  const xpAward = getXpForCr(creature.cr);
  if (xpAward === null) {
    return 0;
  }
  return xpAward * (participant.quantity || 1);
};

// Build a summarized string for encounter participants.
export const buildEncounterParticipantSummary = ({ encounter, campaign }) => {
  const participants = encounter?.participants || [];
  if (!participants.length) {
    return "No participants.";
  }
  const segments = participants.map((participant) => {
    const quantity = participant.quantity || 1;
    if (participant.type === "creature") {
      const creature = campaign?.creatures?.[participant.refId];
      const name = creature?.name || "Unknown creature";
      const role = participant.role ? ` (${participant.role})` : "";
      return `${quantity}× ${name}${role}`;
    }
    const npc = campaign?.npcs?.[participant.refId];
    const name = npc?.name || "Unknown NPC";
    const role = participant.role ? ` (${participant.role})` : "";
    return `${quantity}× ${name}${role}`;
  });
  return segments.join(", ");
};
