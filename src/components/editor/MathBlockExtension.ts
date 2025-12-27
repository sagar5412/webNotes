// src/components/editor/MathBlockExtension.ts
import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import MathBlockComponent from "./MathBlockComponent";

export interface MathBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathBlock: {
      /**
       * Insert a block math expression
       */
      setMathBlock: (attributes?: { latex?: string }) => ReturnType;
    };
  }
}

// Match $$...$$ at the start of a line
const BLOCK_MATH_INPUT_REGEX = /^\$\$([^$]+)\$\$$/;

export const MathBlockExtension = Node.create<MathBlockOptions>({
  name: "mathBlock",

  group: "block",

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      latex: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-latex") || "",
        renderHTML: (attributes) => ({
          "data-latex": attributes.latex,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="math-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "math-block",
        class: "math-block",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockComponent);
  },

  addCommands() {
    return {
      setMathBlock:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: BLOCK_MATH_INPUT_REGEX,
        type: this.type,
        getAttributes: (match) => {
          return { latex: match[1] };
        },
      }),
    ];
  },

  // Keyboard shortcut: Mod+Shift+M to insert math block
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-m": () => {
        return this.editor.commands.setMathBlock();
      },
    };
  },
});

export default MathBlockExtension;
