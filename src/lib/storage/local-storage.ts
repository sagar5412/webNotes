// src/lib/storage/local-storage.ts
import { v4 as uuidv4 } from "uuid";
import type { Note, Folder, UserSettings } from "./types";

export class LocalStorageAdapter {
  private getNotesKey() {
    return "webnotes_notes_v1";
  }

  private getFoldersKey() {
    return "webnotes_folders_v1";
  }

  private getSettingsKey() {
    return "webnotes_settings_v1";
  }

  private load<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") {
      return defaultValue;
    }
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private save<T>(key: string, data: T): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  // Notes
  async getNotes(folderId?: string | null): Promise<Note[]> {
    const notes = this.load<Note[]>(this.getNotesKey(), []);
    if (folderId !== undefined) {
      return notes.filter((n) => n.folderId === folderId);
    }
    return notes;
  }

  async getNote(id: string): Promise<Note | null> {
    const notes = await this.getNotes();
    return notes.find((n) => n.id === id) || null;
  }

  async createNote(note: Partial<Note>): Promise<Note> {
    const newNote: Note = {
      id: note.id || uuidv4(),
      title: note.title || "Untitled",
      content: note.content || "",
      folderId: note.folderId || null,
      createdAt: note.createdAt || new Date(),
      updatedAt: note.updatedAt || new Date(),
      isPinned: note.isPinned || false,
      pinnedAt: note.pinnedAt || null,
    };

    const notes = await this.getNotes();
    const updatedNotes = [newNote, ...notes];
    this.save(this.getNotesKey(), updatedNotes);

    return newNote;
  }

  async updateNote(id: string, data: Partial<Note>): Promise<Note> {
    const notes = await this.getNotes();
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, ...data, updatedAt: new Date() } : note
    );
    this.save(this.getNotesKey(), updatedNotes);

    return updatedNotes.find((n) => n.id === id)!;
  }

  async deleteNote(id: string): Promise<void> {
    const notes = await this.getNotes();
    const updatedNotes = notes.filter((note) => note.id !== id);
    this.save(this.getNotesKey(), updatedNotes);
  }

  async moveNote(id: string, folderId: string | null): Promise<Note> {
    return this.updateNote(id, { folderId });
  }

  async pinNote(id: string): Promise<Note> {
    const notes = await this.getNotes();
    const note = notes.find((n) => n.id === id);

    if (!note) {
      throw new Error("Note not found");
    }

    const newPinnedStatus = !note.isPinned;
    const updatedNotes = notes.map((n) =>
      n.id === id
        ? {
            ...n,
            isPinned: newPinnedStatus,
            pinnedAt: newPinnedStatus ? new Date() : null,
            updatedAt: new Date(),
          }
        : n
    );

    this.save(this.getNotesKey(), updatedNotes);

    return updatedNotes.find((n) => n.id === id)!;
  }

  // Folders
  async getFolders(): Promise<Folder[]> {
    return this.load(this.getFoldersKey(), []);
  }

  async getFolder(id: string): Promise<Folder | null> {
    const folders = await this.getFolders();
    return folders.find((f) => f.id === id) || null;
  }

  async createFolder(name: string): Promise<Folder> {
    const newFolder: Folder = {
      id: uuidv4(),
      name: name || "New Folder",
      createdAt: new Date(),
    };

    const folders = await this.getFolders();
    const updatedFolders = [newFolder, ...folders];
    this.save(this.getFoldersKey(), updatedFolders);

    return newFolder;
  }

  async updateFolder(id: string, name: string): Promise<Folder> {
    const folders = await this.getFolders();
    const updatedFolders = folders.map((folder) =>
      folder.id === id ? { ...folder, name } : folder
    );
    this.save(this.getFoldersKey(), updatedFolders);

    return updatedFolders.find((f) => f.id === id)!;
  }

  async deleteFolder(id: string): Promise<void> {
    const folders = await this.getFolders();
    const updatedFolders = folders.filter((folder) => folder.id !== id);
    this.save(this.getFoldersKey(), updatedFolders);

    // Move notes out of deleted folder
    const notes = await this.getNotes();
    const updatedNotes = notes.map((note) =>
      note.folderId === id ? { ...note, folderId: null } : note
    );
    this.save(this.getNotesKey(), updatedNotes);
  }

  // Settings
  async getSettings(): Promise<UserSettings> {
    return this.load(this.getSettingsKey(), {
      theme: "dark",
      fontSize: "medium",
      showLineNumbers: false,
      syncStatus: "unsynced",
    });
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    this.save(this.getSettingsKey(), updated);
  }
}
