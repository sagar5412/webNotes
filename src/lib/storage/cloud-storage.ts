// src/lib/storage/cloud-storage.ts
import type { Note, Folder, UserSettings, StorageAdapter } from "./types";

export class CloudStorageAdapter implements StorageAdapter {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return response;
  }

  // Notes
  async getNotes(folderId?: string | null): Promise<Note[]> {
    const url = folderId ? `/api/notes?folderId=${folderId}` : "/api/notes";
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async getNote(id: string): Promise<Note | null> {
    try {
      const response = await this.fetchWithAuth(`/api/notes/${id}`);
      return response.json();
    } catch {
      return null;
    }
  }

  async createNote(note: Partial<Note>): Promise<Note> {
    const response = await this.fetchWithAuth("/api/notes", {
      method: "POST",
      body: JSON.stringify({
        title: note.title,
        content: note.content,
        folderId: note.folderId,
      }),
    });
    return response.json();
  }

  async updateNote(id: string, data: Partial<Note>): Promise<Note> {
    const response = await this.fetchWithAuth(`/api/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: data.title,
        content: data.content,
      }),
    });
    return response.json();
  }

  async deleteNote(id: string): Promise<void> {
    await this.fetchWithAuth(`/api/notes/${id}`, {
      method: "DELETE",
    });
  }

  async moveNote(id: string, folderId: string | null): Promise<Note> {
    const response = await this.fetchWithAuth(`/api/notes/${id}/move`, {
      method: "PATCH",
      body: JSON.stringify({ folderId }),
    });
    return response.json();
  }

  async pinNote(id: string): Promise<Note> {
    const response = await this.fetchWithAuth(`/api/notes/${id}/pin`, {
      method: "PATCH",
    });
    return response.json();
  }

  // Folders
  async getFolders(): Promise<Folder[]> {
    const response = await this.fetchWithAuth("/api/folders");
    const data = await response.json();
    return data.folders || [];
  }

  async getFolder(id: string): Promise<Folder | null> {
    try {
      const response = await this.fetchWithAuth(`/api/folders/${id}`);
      const data = await response.json();
      return data.folder || null;
    } catch {
      return null;
    }
  }

  async createFolder(name: string): Promise<Folder> {
    const response = await this.fetchWithAuth("/api/folders", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    return data.folder;
  }

  async updateFolder(id: string, name: string): Promise<Folder> {
    const response = await this.fetchWithAuth(`/api/folders/${id}/rename`, {
      method: "PATCH",
      body: JSON.stringify({ newName: name }),
    });
    return response.json();
  }

  async deleteFolder(id: string): Promise<void> {
    await this.fetchWithAuth(`/api/folders/${id}`, {
      method: "DELETE",
    });
  }

  // Settings (stored locally, not in cloud)
  async getSettings(): Promise<UserSettings> {
    return {
      theme: "dark",
      fontSize: "medium",
      showLineNumbers: false,
      syncStatus: "synced",
    };
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    console.log("Cloud settings update not implemented:", settings);
  }
}
