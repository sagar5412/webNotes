// src/components/NoteEditor.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import TiptapEditor, {
  TiptapEditorRef,
} from "@/components/editor/TiptapEditor";
import Toolbar from "@/components/editor/Toolbar";
import type { Note } from "@/lib/storage/types";
import { Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NoteEditorProps {
  activeNote: Note | undefined;
  onNoteUpdate: (note: Note) => void;
  onSavingStatusChange?: (isSaving: boolean) => void;
  onDeleteNote?: (id: string) => void;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function NoteEditor({
  activeNote,
  onNoteUpdate,
  onSavingStatusChange,
  onDeleteNote,
}: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<TiptapEditorRef>(null);
  const lastSavedRef = useRef<{ title: string; content: string }>({
    title: "",
    content: "",
  });

  // Debounced values for auto-save
  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);

  // Load note content when active note changes
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title || "");
      setContent(activeNote.content || "");
      lastSavedRef.current = {
        title: activeNote.title || "",
        content: activeNote.content || "",
      };
    } else {
      setTitle("");
      setContent("");
      lastSavedRef.current = { title: "", content: "" };
    }
  }, [activeNote?.id]);

  // Auto-save when debounced values change
  useEffect(() => {
    if (!activeNote) return;

    const hasChanges =
      debouncedTitle !== lastSavedRef.current.title ||
      debouncedContent !== lastSavedRef.current.content;

    if (hasChanges) {
      setIsSaving(true);
      onSavingStatusChange?.(true);

      const updatedNote: Note = {
        ...activeNote,
        title: debouncedTitle,
        content: debouncedContent,
        updatedAt: new Date(),
      };

      onNoteUpdate(updatedNote);
      lastSavedRef.current = {
        title: debouncedTitle,
        content: debouncedContent,
      };

      // Simulate save delay
      setTimeout(() => {
        setIsSaving(false);
        onSavingStatusChange?.(false);
      }, 500);
    }
  }, [
    debouncedTitle,
    debouncedContent,
    activeNote,
    onNoteUpdate,
    onSavingStatusChange,
  ]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = useCallback((html: string) => {
    setContent(html);
  }, []);

  const handleDelete = () => {
    if (activeNote && onDeleteNote) {
      onDeleteNote(activeNote.id);
    }
  };

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <div className="text-center text-zinc-500">
          <p className="text-lg">Select a note or create a new one</p>
          <p className="text-sm mt-2">
            Press <kbd className="px-2 py-1 bg-zinc-800 rounded">⌘ E</kbd> to
            create a new note
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="flex-1 bg-transparent text-xl font-semibold text-white placeholder-zinc-500 focus:outline-none"
        />
        <div className="flex items-center gap-2">
          {isSaving && <span className="text-xs text-zinc-500">Saving...</span>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white"
              >
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-red-500" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar editor={editorRef.current?.editor ?? null} />

      {/* Editor */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          <TiptapEditor
            ref={editorRef}
            content={content}
            onChange={handleContentChange}
            className="min-h-[calc(100vh-200px)]"
          />
        </div>
      </div>
    </div>
  );
}
