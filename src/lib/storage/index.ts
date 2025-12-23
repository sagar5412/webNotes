// src/lib/storage/index.ts
import { HybridStorageAdapter } from "./hybrid-storage";

// Create a singleton instance
export const storage = new HybridStorageAdapter();

// Export types for convenience
export type {
  Note,
  Folder,
  UserSettings,
  SyncStatus,
  StorageAdapter,
} from "./types";
export { LocalStorageAdapter } from "./local-storage";
export { CloudStorageAdapter } from "./cloud-storage";
export { HybridStorageAdapter } from "./hybrid-storage";
