// src/lib/storage/hybrid-storage.ts
import { LocalStorageAdapter } from "./local-storage";
import { CloudStorageAdapter } from "./cloud-storage";
import type { Note, Folder, UserSettings, StorageAdapter } from "./types";

export class HybridStorageAdapter implements StorageAdapter {
  private local: LocalStorageAdapter;
  private cloud: CloudStorageAdapter;
  private isOnline: boolean = typeof window !== "undefined" && navigator.onLine;
  private isAuthenticated: boolean = false;
  private hasMigrated: boolean = false;

  constructor() {
    this.local = new LocalStorageAdapter();
    this.cloud = new CloudStorageAdapter();

    if (typeof window !== "undefined") {
      this.hasMigrated = localStorage.getItem("webnotes_migrated") === "true";

      window.addEventListener("online", () => {
        this.isOnline = true;
        this.sync();
      });
      window.addEventListener("offline", () => {
        this.isOnline = false;
      });

      this.checkAuth();
    }
  }

  private async checkAuth(): Promise<void> {
    try {
      const response = await fetch("/api/auth/session");
      const session = await response.json();
      const wasAuthenticated = this.isAuthenticated;
      this.isAuthenticated = !!session?.user;

      if (this.isAuthenticated && !wasAuthenticated && !this.hasMigrated) {
        console.log("User just logged in, migrating local data...");
        await this.migrateLocalToCloud();
      }
    } catch {
      this.isAuthenticated = false;
    }
  }

  private async migrateLocalToCloud(): Promise<void> {
    try {
      const localNotes = await this.local.getNotes();
      const localFolders = await this.local.getFolders();

      console.log(
        `Found ${localNotes.length} local notes and ${localFolders.length} local folders to migrate`
      );

      if (localNotes.length === 0 && localFolders.length === 0) {
        this.hasMigrated = true;
        localStorage.setItem("webnotes_migrated", "true");
        return;
      }

      const folderIdMap = new Map<string, string>();

      // Migrate folders first
      for (const folder of localFolders) {
        try {
          console.log(`Migrating folder: ${folder.name}`);
          const cloudFolder = await this.cloud.createFolder(folder.name);
          folderIdMap.set(folder.id, cloudFolder.id);
        } catch (error) {
          console.error("Failed to migrate folder:", folder.name, error);
        }
      }

      // Migrate notes with updated folder IDs
      for (const note of localNotes) {
        try {
          console.log(`Migrating note: ${note.title}`);
          const newFolderId = note.folderId
            ? folderIdMap.get(note.folderId) || null
            : null;

          await this.cloud.createNote({
            title: note.title,
            content: note.content,
            folderId: newFolderId,
          });
        } catch (error) {
          console.error("Failed to migrate note:", note.title, error);
        }
      }

      this.hasMigrated = true;
      localStorage.setItem("webnotes_migrated", "true");

      // Clear local data after successful migration
      localStorage.removeItem("webnotes_notes_v1");
      localStorage.removeItem("webnotes_folders_v1");

      console.log("Migration complete!");
      window.location.reload();
    } catch (error) {
      console.error("Migration failed:", error);
      this.hasMigrated = false;
    }
  }

  private async sync(): Promise<void> {
    if (!this.isOnline || !this.isAuthenticated) return;

    if (!this.hasMigrated) {
      await this.migrateLocalToCloud();
    }
  }

  private shouldUseCloud(): boolean {
    return this.isAuthenticated && this.isOnline;
  }

  // Notes
  async getNotes(folderId?: string | null): Promise<Note[]> {
    if (this.shouldUseCloud()) {
      try {
        return await this.cloud.getNotes(folderId);
      } catch (error) {
        console.error(
          "Failed to fetch from cloud, falling back to local:",
          error
        );
        return this.local.getNotes(folderId);
      }
    }
    return this.local.getNotes(folderId);
  }

  async getNote(id: string): Promise<Note | null> {
    if (this.shouldUseCloud()) {
      try {
        return await this.cloud.getNote(id);
      } catch {
        return this.local.getNote(id);
      }
    }
    return this.local.getNote(id);
  }

  async createNote(note: Partial<Note>): Promise<Note> {
    if (this.shouldUseCloud()) {
      try {
        return await this.cloud.createNote(note);
      } catch (error) {
        console.error("Failed to create in cloud, saving locally:", error);
        return this.local.createNote(note);
      }
    }
    return this.local.createNote(note);
  }

  async updateNote(id: string, data: Partial<Note>): Promise<Note> {
    if (this.shouldUseCloud()) {
      try {
        return await this.cloud.updateNote(id, data);
      } catch (error) {
        console.error("Failed to update in cloud, updating locally:", error);
        return this.local.updateNote(id, data);
      }
    }
    return this.local.updateNote(id, data);
  }

  async deleteNote(id: string): Promise<void> {
    if (this.shouldUseCloud()) {
      try {
        await this.cloud.deleteNote(id);
        return;
      } catch (error) {
        console.error("Failed to delete from cloud, deleting locally:", error);
      }
    }
    await this.local.deleteNote(id);
  }

  async moveNote(id: string, folderId: string | null): Promise<Note> {
    if (this.shouldUseCloud()) {
      try {
        return await this.cloud.moveNote(id, folderId);
      } catch (error) {
        console.error("Failed to move in cloud, moving locally:", error);
        return this.local.moveNote(id, folderId);
      }
    }
    return this.local.moveNote(id, folderId);
  }

  async pinNote(id: string): Promise<Note> {
    if (this.shouldUseCloud()) {
      try {
        return await this.cloud.pinNote(id);
      } catch (error) {
        console.error("Failed to pin in cloud, pinning locally:", error);
        return this.local.pinNote(id);
      }
    }
    return this.local.pinNote(id);
  }

  // Folders
  async getFolders(): Promise<Folder[]> {
    if (this.shouldUseCloud()) {
      try {
        return await this.cloud.getFolders();
      } catch (error) {
        console.error("Failed to fetch folders from cloud:", error);
        return this.local.getFolders();
      }
    }
    return this.local.getFolders();
  }

  async getFolder(id: string): Promise<Folder | null> {
    if (this.shouldUseCloud()) {
      try {
        return await this.cloud.getFolder(id);
      } catch {
        return this.local.getFolder(id);
      }
    }
    return this.local.getFolder(id);
  }

  async createFolder(name: string): Promise<Folder> {
    if (this.shouldUseCloud()) {
      try {
        return await this.cloud.createFolder(name);
      } catch (error) {
        console.error("Failed to create folder in cloud:", error);
        return this.local.createFolder(name);
      }
    }
    return this.local.createFolder(name);
  }

  async updateFolder(id: string, name: string): Promise<Folder> {
    if (this.shouldUseCloud()) {
      try {
        return await this.cloud.updateFolder(id, name);
      } catch (error) {
        console.error("Failed to update folder in cloud:", error);
        return this.local.updateFolder(id, name);
      }
    }
    return this.local.updateFolder(id, name);
  }

  async deleteFolder(id: string): Promise<void> {
    if (this.shouldUseCloud()) {
      try {
        await this.cloud.deleteFolder(id);
        return;
      } catch (error) {
        console.error("Failed to delete folder from cloud:", error);
      }
    }
    await this.local.deleteFolder(id);
  }

  // Settings (always local)
  async getSettings(): Promise<UserSettings> {
    return this.local.getSettings();
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    await this.local.updateSettings(settings);
  }

  // Utility methods
  async refreshAuth(): Promise<void> {
    await this.checkAuth();
  }

  resetMigration(): void {
    localStorage.removeItem("webnotes_migrated");
    this.hasMigrated = false;
  }
}
