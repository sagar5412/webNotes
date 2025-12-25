// app/page.tsx
"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { NoteListSkeleton } from "@/components/NoteListSkeleton";
import LoadingScreen from "@/components/LoadingScreen";
import NoteEditor from "@/components/NoteEditor";
import { toast, Toaster } from "sonner";
import { useStorage } from "@/hooks/useStorage";
import type { Note, Folder } from "@/lib/storage/types";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type FolderWithNotes = Omit<Folder, "notes"> & {
  notes: Note[];
};

export default function Home() {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [showExtendedMessage, setShowExtendedMessage] = useState(false);

  const {
    notes,
    folders,
    settings,
    isLoading,
    createNote: storageCreateNote,
    updateNote: storageUpdateNote,
    updateNoteLocally,
    togglePin: storageTogglePin,
    deleteNote: storageDeleteNote,
    deleteFolder: storageDeleteFolder,
    createFolder: storageCreateFolder,
    refresh,
  } = useStorage();

  // Minimum loading time for smooth UX
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  // Show extended message if loading takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) setShowExtendedMessage(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const showLoading = !minTimeElapsed || isLoading;

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 768 && showMobileSidebar) {
        if (
          sidebarRef.current &&
          !sidebarRef.current.contains(event.target as Node)
        ) {
          setShowMobileSidebar(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMobileSidebar]);

  // Map folders with their notes
  const foldersWithNotes = useMemo<FolderWithNotes[]>(() => {
    return folders.map((folder) => ({
      ...folder,
      notes: notes
        .filter((note) => note.folderId === folder.id)
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        }),
    }));
  }, [folders, notes]);

  // Create note handler
  const createNote = useCallback(
    async (folderId?: string | null) => {
      try {
        const newNote = await storageCreateNote({
          title: "",
          content: "",
          folderId,
        });
        setActiveNoteId(newNote.id);
        setShowMobileSidebar(false);
        toast.success("Note created");
        return newNote.id;
      } catch {
        toast.error("Failed to create note");
        return null;
      }
    },
    [storageCreateNote]
  );

  // Delete note handler
  const deleteNote = useCallback(
    async (id: string) => {
      if (activeNoteId === id) setActiveNoteId(null);
      await storageDeleteNote(id);
      toast.success("Note deleted");
    },
    [storageDeleteNote, activeNoteId]
  );

  // Update note handler
  const handleNoteUpdate = useCallback(
    async (updatedNote: Note) => {
      try {
        await storageUpdateNote(updatedNote.id, {
          title: updatedNote.title,
          content: updatedNote.content,
        });
      } catch {
        toast.error("Failed to save note");
      }
    },
    [storageUpdateNote]
  );

  // Create folder handler
  const createFolder = useCallback(async () => {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
      try {
        await storageCreateFolder(folderName);
        toast.success("Folder created");
      } catch {
        toast.error("Failed to create folder");
      }
    }
  }, [storageCreateFolder]);

  // Toggle pin handler
  const togglePin = useCallback(
    async (noteId: string) => {
      try {
        await storageTogglePin(noteId);
      } catch (error) {
        console.error("Failed to toggle pin:", error);
        throw error;
      }
    },
    [storageTogglePin]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true";

      if (isEditing) return;

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd+E: New note
      if (modKey && e.key === "e" && !e.shiftKey) {
        e.preventDefault();
        createNote();
        return;
      }

      // Cmd+Shift+F: New folder
      if (modKey && e.shiftKey && e.key === "F") {
        e.preventDefault();
        createFolder();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [createNote, createFolder]);

  // Mobile note selection
  const handleSetActiveNoteForMobile = useCallback((noteId: string | null) => {
    setActiveNoteId(noteId);
    if (window.innerWidth < 768) {
      setShowMobileSidebar(false);
    }
  }, []);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  if (showLoading) {
    return <LoadingScreen isExtended={showExtendedMessage} />;
  }

  return (
    <main className="flex w-screen h-screen overflow-hidden">
      <Toaster position="bottom-right" theme="dark" />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        {isLoading ? (
          <div className="w-80 h-full bg-zinc-900 border-r border-zinc-800">
            <NoteListSkeleton />
          </div>
        ) : (
          <Sidebar
            notes={notes}
            folders={folders}
            activeNoteId={activeNoteId}
            setActiveNoteId={setActiveNoteId}
            createNote={createNote}
            createFolder={createFolder}
            syncStatus={settings.syncStatus}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="fixed md:hidden inset-y-0 left-0 z-50 w-80"
          >
            <Sidebar
              notes={notes}
              folders={folders}
              activeNoteId={activeNoteId}
              setActiveNoteId={handleSetActiveNoteForMobile}
              createNote={createNote}
              createFolder={createFolder}
              syncStatus={settings.syncStatus}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 h-full flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden border-b border-zinc-800 bg-zinc-900 flex items-center px-3 py-2.5 gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-9 w-9"
          >
            {showMobileSidebar ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          {activeNote && (
            <h2 className="text-sm font-medium text-zinc-200 truncate">
              {activeNote.title || "Untitled Note"}
            </h2>
          )}
        </div>

        {/* Note editor */}
        <div className="flex-1 overflow-hidden">
          <NoteEditor
            activeNote={activeNote}
            onNoteUpdate={handleNoteUpdate}
            onDeleteNote={deleteNote}
          />
        </div>
      </div>
    </main>
  );
}
