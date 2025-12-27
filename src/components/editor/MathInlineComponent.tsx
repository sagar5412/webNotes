// src/components/editor/MathInlineComponent.tsx
// Placeholder - will be fully implemented in commit #67
"use client";

import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { renderLatex } from "@/lib/math";

export default function MathInlineComponent({ node }: NodeViewProps) {
  const { latex } = node.attrs;
  const renderedMath = renderLatex(latex, { displayMode: false });

  return (
    <NodeViewWrapper
      as="span"
      className="math-inline-wrapper"
      data-latex={latex}
    >
      <span
        className="math-inline-content"
        dangerouslySetInnerHTML={{ __html: renderedMath }}
      />
    </NodeViewWrapper>
  );
}
