// src/components/Sidebar.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronsLeft,
  FolderPlus,
  FilePlus,
  Search,
  HelpCircle,
} from "lucide-react";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AuthButton from "./AuthButton";
import type { Note, Folder, SyncStatus } from "@/lib/storage/types";

interface SidebarProps {
  notes: Note[];
  folders: Folder[];
  activeNoteId: string | null;
  setActiveNoteId: (id: string) => void;
  createNote: (folderId?: string | null) => void;
  createFolder: () => void;
  syncStatus: SyncStatus;
  isLoading?: boolean;
  onOpenSearch?: () => void;
  onOpenHelp?: () => void;
}

export default function Sidebar({
  notes,
  folders,
  activeNoteId,
  setActiveNoteId,
  createNote,
  createFolder,
  syncStatus,
  isLoading = false,
  onOpenSearch,
  onOpenHelp,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Group notes by folder
  const { notesInFolders, unfiledNotes } = useMemo(() => {
    const notesInFolders = new Map<string, Note[]>();
    const unfiledNotes: Note[] = [];

    notes.forEach((note) => {
      if (note.folderId) {
        const folderNotes = notesInFolders.get(note.folderId) || [];
        folderNotes.push(note);
        notesInFolders.set(note.folderId, folderNotes);
      } else {
        unfiledNotes.push(note);
      }
    });

    // Sort notes: pinned first, then by updatedAt
    const sortNotes = (items: Note[]) =>
      items.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });

    notesInFolders.forEach((folderNotes, folderId) => {
      notesInFolders.set(folderId, sortNotes(folderNotes));
    });

    return {
      notesInFolders,
      unfiledNotes: sortNotes(unfiledNotes),
    };
  }, [notes]);

  return (
    <TooltipProvider delayDuration={0}>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className={`
          h-full flex flex-col bg-zinc-900 border-r border-zinc-800 
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-full md:w-80" : "w-full md:w-[68px]"}
        `}
      >
        {/* Header */}
        <div
          className={`
            p-4 flex items-center border-b border-zinc-800 flex-shrink-0 
            ${isOpen ? "justify-between" : "justify-center"}
          `}
        >
          {isOpen && (
            <h1 className="text-xl font-bold text-zinc-200">WebNotes</h1>
          )}
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <ChevronsLeft
                className={`h-5 w-5 transition-transform duration-300 ${
                  isOpen ? "" : "rotate-180"
                }`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Action buttons */}
        <div
          className={`
            p-2 border-b border-zinc-800 flex items-center
            ${
              isOpen
                ? "flex-row justify-around"
                : "flex-col justify-start gap-2"
            }
          `}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => createNote()}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-10 w-10"
              >
                <FilePlus size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isOpen ? "top" : "right"}>
              <p>New Note</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={createFolder}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-10 w-10"
              >
                <FolderPlus size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isOpen ? "top" : "right"}>
              <p>New Folder</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSearch}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-10 w-10"
              >
                <Search size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isOpen ? "top" : "right"}>
              <p>Search (⌘K)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenHelp}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-10 w-10"
              >
                <HelpCircle size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isOpen ? "top" : "right"}>
              <p>Help (⌘/)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Note list */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-zinc-800 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {/* Folders */}
                {folders.map((folder) => (
                  <div key={folder.id} className="mb-2">
                    <div className="text-sm font-medium text-zinc-400 px-2 py-1">
                      📁 {folder.name}
                    </div>
                    {notesInFolders.get(folder.id)?.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => setActiveNoteId(note.id)}
                        className={`
                          w-full text-left px-3 py-2 rounded-md text-sm truncate
                          ${
                            activeNoteId === note.id
                              ? "bg-zinc-700 text-white"
                              : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          }
                        `}
                      >
                        {note.isPinned && "📌 "}
                        {note.title || "Untitled"}
                      </button>
                    ))}
                  </div>
                ))}

                {/* Unfiled notes */}
                {unfiledNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-md text-sm truncate
                      ${
                        activeNoteId === note.id
                          ? "bg-zinc-700 text-white"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      }
                    `}
                  >
                    {note.isPinned && "📌 "}
                    {note.title || "Untitled"}
                  </button>
                ))}

                {notes.length === 0 && (
                  <p className="text-sm text-zinc-500 text-center py-4">
                    No notes yet. Create your first note!
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Auth button at bottom */}
        <div className="mt-auto p-2 border-t border-zinc-800">
          <AuthButton isOpen={isOpen} />
        </div>
      </Collapsible>
    </TooltipProvider>
  );
}
