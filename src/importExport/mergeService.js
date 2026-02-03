import { createId } from "../utils/ids.js";

// Merge service for combining imported payloads with existing data.
export const createMergeService = () => {
  const detectConflicts = (existing, incoming) => {
    const conflicts = [];
    Object.entries(incoming).forEach(([id, entity]) => {
      const existingEntity = existing[id];
      if (existingEntity) {
        const changed = JSON.stringify(existingEntity) !== JSON.stringify(entity);
        if (changed) {
          conflicts.push({ type: entity.id?.split("_")[0] || "entity", id, incoming: entity, existing: existingEntity });
        }
      }
    });
    return conflicts;
  };

  const applyResolutions = ({ existing, incoming, resolutions }) => {
    const result = { ...existing };
    const resolutionMap = new Map(resolutions.map((conflict) => [conflict.id, conflict]));

    incoming.forEach((entity) => {
      const conflict = resolutionMap.get(entity.id);
      if (!conflict) {
        result[entity.id] = entity;
        return;
      }

      if (conflict.resolution === "existing") {
        result[entity.id] = conflict.existing || existing[entity.id];
      } else if (conflict.resolution === "incoming") {
        result[entity.id] = conflict.incoming;
      } else if (conflict.resolution === "most-recent") {
        const incomingDate = new Date(conflict.incoming.updatedAt || 0).getTime();
        const existingDate = new Date(conflict.existing.updatedAt || 0).getTime();
        result[entity.id] = incomingDate >= existingDate ? conflict.incoming : conflict.existing;
      } else if (conflict.resolution === "duplicate") {
        result[entity.id] = conflict.existing || existing[entity.id];
        const newId = conflict.duplicateId || createId(conflict.type);
        result[newId] = {
          ...conflict.incoming,
          id: newId,
          name: `${conflict.incoming.name || "Imported"} ${conflict.duplicateSuffix || "(Imported)"}`.trim(),
        };
      }
    });

    return result;
  };

  const remapIdsForCopy = (payload) => {
    const remapCollection = (collection, prefix, campaignId, remapMap) => {
      const remapped = {};
      Object.values(collection || {}).forEach((entity) => {
        const newId = createId(prefix);
        remapMap.set(entity.id, newId);
        remapped[newId] = { ...entity, id: newId, campaignId };
      });
      return remapped;
    };

    const newCampaignId = createId("cmp");
    const campaign = {
      ...payload.campaign,
      id: newCampaignId,
      name: `${payload.campaign?.name || "Campaign"} (Imported)`,
    };

    const npcMap = new Map();
    const creatureMap = new Map();
    const encounterMap = new Map();
    const sessionMap = new Map();

    const npcs = remapCollection(payload.npcs, "npc", newCampaignId, npcMap);
    const creatures = remapCollection(payload.creatures, "crt", newCampaignId, creatureMap);
    const encounters = remapCollection(payload.encounters, "enc", newCampaignId, encounterMap);
    const sessions = remapCollection(payload.sessions, "ses", newCampaignId, sessionMap);

    Object.values(encounters).forEach((encounter) => {
      encounter.participants = (encounter.participants || []).map((participant) => {
        if (participant.type === "creature" && creatureMap.has(participant.refId)) {
          return { ...participant, refId: creatureMap.get(participant.refId) };
        }
        if (participant.type === "npc" && npcMap.has(participant.refId)) {
          return { ...participant, refId: npcMap.get(participant.refId) };
        }
        return participant;
      });
    });

    Object.values(sessions).forEach((session) => {
      session.encounterIds = (session.encounterIds || []).map((id) => encounterMap.get(id) || id);
    });

    return {
      payload: {
        ...payload,
        campaign,
        party: remapCollection(payload.party, "pty", newCampaignId, new Map()),
        npcs,
        creatures,
        encounters,
        locations: remapCollection(payload.locations, "loc", newCampaignId, new Map()),
        items: remapCollection(payload.items, "itm", newCampaignId, new Map()),
        sessions,
        sessionReviews: remapCollection(payload.sessionReviews, "rev", newCampaignId, new Map()),
      },
      newCampaignId,
    };
  };

  return { detectConflicts, applyResolutions, remapIdsForCopy };
};
