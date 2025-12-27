// src/components/editor/SlashCommands.tsx
"use client";

import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance as TippyInstance } from "tippy.js";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Minus,
  Type,
  CheckSquare,
  Sigma,
  PiSquare,
  Radical,
} from "lucide-react";

interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (props: { editor: any; range: any }) => void;
  keywords?: string[];
  category?: string;
}

interface SlashCommandsProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

export const SlashCommands = forwardRef<unknown, SlashCommandsProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = props.items[index];
      if (item) {
        props.command(item);
      }
    };

    const upHandler = () => {
      setSelectedIndex(
        (selectedIndex + props.items.length - 1) % props.items.length
      );
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          upHandler();
          return true;
        }

        if (event.key === "ArrowDown") {
          downHandler();
          return true;
        }

        if (event.key === "Enter") {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    // Group items by category
    const groupedItems = props.items.reduce((acc, item, index) => {
      const category = item.category || "Basic";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ ...item, originalIndex: index });
      return acc;
    }, {} as Record<string, (CommandItem & { originalIndex: number })[]>);

    const categories = Object.keys(groupedItems);

    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden p-2 min-w-[280px] max-h-[400px] overflow-y-auto">
        {props.items.length > 0 ? (
          categories.map((category) => (
            <div key={category}>
              {categories.length > 1 && (
                <div className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider px-3 py-1.5 mt-1 first:mt-0">
                  {category}
                </div>
              )}
              {groupedItems[category].map((item) => (
                <button
                  key={item.originalIndex}
                  onClick={() => selectItem(item.originalIndex)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                    item.originalIndex === selectedIndex
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
                  }`}
                >
                  <div className="flex-shrink-0 text-zinc-500">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-zinc-600 truncate">
                      {item.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ))
        ) : (
          <div className="text-sm text-zinc-500 px-3 py-2">No results</div>
        )}
      </div>
    );
  }
);

SlashCommands.displayName = "SlashCommands";

export const slashCommandItems = (): CommandItem[] => [
  // TEXT & HEADINGS
  {
    title: "Text",
    description: "Just start writing with plain text",
    icon: <Type className="h-4 w-4" />,
    category: "Basic",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading",
    icon: <Heading1 className="h-4 w-4" />,
    keywords: ["h1", "heading1", "title"],
    category: "Basic",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: <Heading2 className="h-4 w-4" />,
    keywords: ["h2", "heading2", "subtitle"],
    category: "Basic",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: <Heading3 className="h-4 w-4" />,
    keywords: ["h3", "heading3", "subheading"],
    category: "Basic",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },

  // LISTS
  {
    title: "Bullet List",
    description: "Create a simple bullet list",
    icon: <List className="h-4 w-4" />,
    keywords: ["ul", "list", "bullet", "unordered"],
    category: "Lists",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    icon: <ListOrdered className="h-4 w-4" />,
    keywords: ["ol", "ordered", "numbered", "list"],
    category: "Lists",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Task List",
    description: "Create a checklist",
    icon: <CheckSquare className="h-4 w-4" />,
    keywords: ["todo", "task", "checklist", "checkbox"],
    category: "Lists",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },

  // BLOCKS
  {
    title: "Quote",
    description: "Create a blockquote",
    icon: <Quote className="h-4 w-4" />,
    keywords: ["blockquote", "citation", "quote"],
    category: "Blocks",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Code Block",
    description: "Create a code block",
    icon: <Code className="h-4 w-4" />,
    keywords: ["code", "codeblock", "snippet", "programming"],
    category: "Blocks",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Divider",
    description: "Insert a horizontal rule",
    icon: <Minus className="h-4 w-4" />,
    keywords: ["hr", "horizontal", "line", "separator", "divider"],
    category: "Blocks",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },

  // MATH - Inline
  {
    title: "Inline Math",
    description: "Insert inline equation",
    icon: <PiSquare className="h-4 w-4" />,
    keywords: ["math", "latex", "equation", "inline", "formula"],
    category: "Math",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.setMathInline({ latex: "" });
    },
  },
  {
    title: "Math Block",
    description: "Insert display equation",
    icon: <Sigma className="h-4 w-4" />,
    keywords: ["math", "latex", "equation", "block", "display", "formula"],
    category: "Math",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.setMathBlock({ latex: "" });
    },
  },

  // MATH - Common Templates
  {
    title: "Fraction",
    description: "Insert a fraction (a/b)",
    icon: <Radical className="h-4 w-4" />,
    keywords: ["fraction", "divide", "ratio", "math"],
    category: "Math",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.setMathInline({ latex: "\\frac{a}{b}" });
    },
  },
  {
    title: "Square Root",
    description: "Insert a square root",
    icon: <Radical className="h-4 w-4" />,
    keywords: ["sqrt", "root", "radical", "math"],
    category: "Math",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.setMathInline({ latex: "\\sqrt{x}" });
    },
  },
  {
    title: "Power",
    description: "Insert a power/exponent",
    icon: <PiSquare className="h-4 w-4" />,
    keywords: ["power", "exponent", "superscript", "squared", "math"],
    category: "Math",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.setMathInline({ latex: "x^{n}" });
    },
  },
  {
    title: "Subscript",
    description: "Insert a subscript",
    icon: <PiSquare className="h-4 w-4" />,
    keywords: ["subscript", "sub", "index", "math"],
    category: "Math",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.setMathInline({ latex: "x_{i}" });
    },
  },
  {
    title: "Integral",
    description: "Insert an integral",
    icon: <Sigma className="h-4 w-4" />,
    keywords: ["integral", "calculus", "math", "int"],
    category: "Math",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.setMathBlock({ latex: "\\int_{a}^{b} f(x) \\, dx" });
    },
  },
  {
    title: "Summation",
    description: "Insert a summation (Σ)",
    icon: <Sigma className="h-4 w-4" />,
    keywords: ["sum", "sigma", "series", "math"],
    category: "Math",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.setMathBlock({ latex: "\\sum_{i=1}^{n} a_i" });
    },
  },
  {
    title: "Limit",
    description: "Insert a limit",
    icon: <Sigma className="h-4 w-4" />,
    keywords: ["limit", "lim", "calculus", "math"],
    category: "Math",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.setMathBlock({ latex: "\\lim_{x \\to a} f(x)" });
    },
  },
  {
    title: "Matrix",
    description: "Insert a 2×2 matrix",
    icon: <PiSquare className="h-4 w-4" />,
    keywords: ["matrix", "array", "math", "linear algebra"],
    category: "Math",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.setMathBlock({
        latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
      });
    },
  },
  {
    title: "Quadratic Formula",
    description: "Insert the quadratic formula",
    icon: <Radical className="h-4 w-4" />,
    keywords: ["quadratic", "formula", "equation", "math"],
    category: "Math",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.setMathBlock({
        latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
      });
    },
  },
];

export const slashCommandSuggestion = {
  items: ({ query }: { query: string }) => {
    const items = slashCommandItems();

    if (!query) return items;

    const searchTerm = query.toLowerCase();

    return items.filter((item) => {
      return (
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.keywords?.some((keyword) =>
          keyword.toLowerCase().includes(searchTerm)
        )
      );
    });
  },

  render: () => {
    let component: ReactRenderer;
    let popup: TippyInstance[];

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(SlashCommands, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate(props: any) {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === "Escape") {
          popup[0].hide();
          return true;
        }

        return (component.ref as any)?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};
