// src/components/editor/TiptapEditor.tsx
"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

interface TiptapEditorProps {
  content: string;
  onChange?: (content: string) => void;
  onMarkdownChange?: (markdown: string) => void;
  editable?: boolean;
  className?: string;
  placeholder?: string;
}

// Type for Tiptap storage with markdown extension
interface MarkdownStorage {
  markdown: {
    getMarkdown: () => string;
  };
}

export interface TiptapEditorRef {
  editor: Editor | null;
  getMarkdown: () => string;
}

const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(
  function TiptapEditor(
    {
      content,
      onChange,
      onMarkdownChange,
      editable = true,
      className = "",
      placeholder = "Type / for commands, or just start writing...",
    },
    ref
  ) {
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
          placeholder: placeholder,
          emptyEditorClass: "is-editor-empty",
        }),
        Typography,
        Underline,
        Link.configure({
          openOnClick: true,
          autolink: true,
          linkOnPaste: true,
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
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

    // Expose editor and getMarkdown to parent
    useImperativeHandle(
      ref,
      () => ({
        editor,
        getMarkdown: () => {
          if (editor) {
            const storage = editor.storage as unknown as MarkdownStorage;
            return storage.markdown.getMarkdown();
          }
          return "";
        },
      }),
      [editor]
    );

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

    if (!editor) {
      return null;
    }

    return <EditorContent editor={editor} className={className} />;
  }
);

export default TiptapEditor;
