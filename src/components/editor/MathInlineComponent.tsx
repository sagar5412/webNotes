// src/components/editor/MathInlineComponent.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { renderLatex, isValidLatex } from "@/lib/math";
import { Check, X, Pencil } from "lucide-react";

export default function MathInlineComponent({
  node,
  updateAttributes,
  selected,
  deleteNode,
}: NodeViewProps) {
  const { latex } = node.attrs;
  const [isEditing, setIsEditing] = useState(!latex);
  const [editValue, setEditValue] = useState(latex);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Update edit value when latex changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditValue(latex);
    }
  }, [latex, isEditing]);

  const handleSave = useCallback(() => {
    const trimmedValue = editValue.trim();
    if (trimmedValue) {
      updateAttributes({ latex: trimmedValue });
      setIsEditing(false);
    } else {
      // Delete node if empty
      deleteNode();
    }
  }, [editValue, updateAttributes, deleteNode]);

  const handleCancel = useCallback(() => {
    if (latex) {
      setEditValue(latex);
      setIsEditing(false);
    } else {
      // Delete node if it was never set
      deleteNode();
    }
  }, [latex, deleteNode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const isValid = isValidLatex(editValue);
  const renderedMath = renderLatex(latex || editValue, { displayMode: false });

  if (isEditing) {
    return (
      <NodeViewWrapper
        as="span"
        className="math-inline-editor"
        data-latex={latex}
      >
        <span className="math-editor-container">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Small delay to allow button clicks to register
              setTimeout(() => {
                if (document.activeElement !== inputRef.current) {
                  handleSave();
                }
              }, 150);
            }}
            placeholder="x^2 + y^2 = z^2"
            className="math-input"
            spellCheck={false}
            autoComplete="off"
          />
          {editValue && (
            <span className="math-preview">
              <span
                className={`math-preview-content ${
                  !isValid ? "math-preview-error" : ""
                }`}
                dangerouslySetInnerHTML={{
                  __html: isValid
                    ? renderLatex(editValue, { displayMode: false })
                    : "Invalid",
                }}
              />
            </span>
          )}
          <span className="math-actions">
            <button
              type="button"
              onClick={handleSave}
              className="math-action-btn math-action-save"
              title="Save (Enter)"
              disabled={!editValue.trim() || !isValid}
            >
              <Check size={12} />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="math-action-btn math-action-cancel"
              title="Cancel (Escape)"
            >
              <X size={12} />
            </button>
          </span>
        </span>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      as="span"
      className={`math-inline-wrapper ${
        selected ? "ProseMirror-selectednode" : ""
      }`}
      data-latex={latex}
      onDoubleClick={handleDoubleClick}
    >
      <span
        className="math-inline-content"
        dangerouslySetInnerHTML={{ __html: renderedMath }}
      />
      {selected && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="math-edit-btn"
          title="Edit (double-click)"
        >
          <Pencil size={10} />
        </button>
      )}
    </NodeViewWrapper>
  );
}
