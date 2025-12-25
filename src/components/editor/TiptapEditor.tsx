// src/components/editor/TiptapEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback } from "react";

interface TiptapEditorProps {
  content: string;
  onChange?: (content: string) => void;
  onMarkdownChange?: (markdown: string) => void;
  editable?: boolean;
  className?: string;
}

// Type for Tiptap storage with markdown extension
interface MarkdownStorage {
  markdown: {
    getMarkdown: () => string;
  };
}

export default function TiptapEditor({
  content,
  onChange,
  onMarkdownChange,
  editable = true,
  className = "",
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        tightListClass: "tight",
        bulletListMarker: "-",
        linkify: true,
        breaks: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Placeholder.configure({
        placeholder: "Type / for commands, or just start writing...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: content,
    editable: editable,
    editorProps: {
      attributes: {
        class: `prose prose-invert prose-zinc max-w-none focus:outline-none min-h-[200px] ${className}`,
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
      if (onMarkdownChange) {
        const storage = editor.storage as unknown as MarkdownStorage;
        onMarkdownChange(storage.markdown.getMarkdown());
      }
    },
  });

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  // Get markdown content helper
  const getMarkdown = useCallback(() => {
    if (editor) {
      const storage = editor.storage as unknown as MarkdownStorage;
      return storage.markdown.getMarkdown();
    }
    return "";
  }, [editor]);

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} className={className} />;
}
