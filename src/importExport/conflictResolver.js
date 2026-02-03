import { createId } from "../utils/ids.js";

// Conflict resolution helpers for import/merge.
export const resolveConflicts = ({ conflicts, strategy, duplicateSuffix = "(Imported)" }) =>
  conflicts.map((conflict) => {
    const resolution = strategy || conflict.resolution || "duplicate";
    if (resolution === "most-recent") {
      return { ...conflict, resolution: "most-recent" };
    }
    if (resolution === "incoming") {
      return { ...conflict, resolution: "incoming" };
    }
    if (resolution === "existing") {
      return { ...conflict, resolution: "existing" };
    }
    return {
      ...conflict,
      resolution: "duplicate",
      duplicateId: conflict.duplicateId || createId(conflict.type),
      duplicateSuffix: conflict.duplicateSuffix || duplicateSuffix,
    };
  });
