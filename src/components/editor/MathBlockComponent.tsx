// src/components/editor/MathBlockComponent.tsx
// Placeholder - will be fully implemented in commit #69
"use client";

import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { renderLatex } from "@/lib/math";

export default function MathBlockComponent({ node, selected }: NodeViewProps) {
  const { latex } = node.attrs;
  const renderedMath = renderLatex(latex || "\\text{Empty equation}", {
    displayMode: true,
  });

  return (
    <NodeViewWrapper
      className={`math-block-wrapper ${
        selected ? "ProseMirror-selectednode" : ""
      }`}
      data-latex={latex}
    >
      <div
        className="math-block-content"
        dangerouslySetInnerHTML={{ __html: renderedMath }}
      />
    </NodeViewWrapper>
  );
}
