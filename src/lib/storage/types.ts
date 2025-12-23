// src/lib/storage/types.ts

export interface Note {
  id: string;
  title: string | null;
  content: string | null;
  userId?: string;
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean;
  pinnedAt?: Date | null;
}

export interface Folder {
  id: string;
  name: string;
  userId?: string;
  createdAt: Date;
}

export type SyncStatus = "synced" | "syncing" | "unsynced";

export interface UserSettings {
  theme: "dark" | "light" | "system";
  fontSize: "small" | "medium" | "large";
  showLineNumbers: boolean;
  syncStatus: SyncStatus;
}

export type StorageOperation = "create" | "update" | "delete";

// Storage adapter interface - implemented by local and cloud storage
export interface StorageAdapter {
  // Notes
  getNotes(folderId?: string | null): Promise<Note[]>;
  getNote(id: string): Promise<Note | null>;
  createNote(note: Partial<Note>): Promise<Note>;
  updateNote(id: string, data: Partial<Note>): Promise<Note>;
  deleteNote(id: string): Promise<void>;
  moveNote(id: string, folderId: string | null): Promise<Note>;
  pinNote(id: string): Promise<Note>;

  // Folders
  getFolders(): Promise<Folder[]>;
  getFolder(id: string): Promise<Folder | null>;
  createFolder(name: string): Promise<Folder>;
  updateFolder(id: string, name: string): Promise<Folder>;
  deleteFolder(id: string): Promise<void>;
}
