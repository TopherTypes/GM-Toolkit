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
    // TODO: Remap relationship references (e.g., encounters participants) when modules expand.
    const remapCollection = (collection, prefix, campaignId) => {
      const remapped = {};
      Object.values(collection || {}).forEach((entity) => {
        const newId = createId(prefix);
        remapped[newId] = { ...entity, id: newId, campaignId };
      });
      return remapped;
    };

    const newCampaignId = createId("cmp");
    const campaign = {
      ...payload.campaign,
      id: newCampaignId,
      name: `${payload.campaign?.name || "Campaign"} (Imported)`
    };

    return {
      payload: {
        ...payload,
        campaign,
        party: remapCollection(payload.party, "pty", newCampaignId),
        npcs: remapCollection(payload.npcs, "npc", newCampaignId),
        creatures: remapCollection(payload.creatures, "crt", newCampaignId),
        encounters: remapCollection(payload.encounters, "enc", newCampaignId),
        locations: remapCollection(payload.locations, "loc", newCampaignId),
        items: remapCollection(payload.items, "itm", newCampaignId),
        sessions: remapCollection(payload.sessions, "ses", newCampaignId),
        sessionReviews: remapCollection(payload.sessionReviews, "rev", newCampaignId),
      },
      newCampaignId,
    };
  };

  return { detectConflicts, applyResolutions, remapIdsForCopy };
};
