// src/components/editor/MathInlineExtension.ts
import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import MathInlineComponent from "./MathInlineComponent";

export interface MathInlineOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathInline: {
      /**
       * Insert an inline math expression
       */
      setMathInline: (attributes: { latex: string }) => ReturnType;
    };
  }
}

// Match $...$ but not $$...$$
// Uses a simpler pattern that works with nodeInputRule
const INLINE_MATH_INPUT_REGEX = /(?:^|\s)\$([^$]+)\$$/;

export const MathInlineExtension = Node.create<MathInlineOptions>({
  name: "mathInline",

  group: "inline",

  inline: true,

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
        tag: 'span[data-type="math-inline"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "math-inline",
        class: "math-inline",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathInlineComponent);
  },

  addCommands() {
    return {
      setMathInline:
        (attributes) =>
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
        find: INLINE_MATH_INPUT_REGEX,
        type: this.type,
        getAttributes: (match) => {
          return { latex: match[1] };
        },
      }),
    ];
  },
});

export default MathInlineExtension;
