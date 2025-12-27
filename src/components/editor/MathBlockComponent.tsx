// src/components/editor/MathBlockComponent.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { renderLatex, isValidLatex } from "@/lib/math";
import { Check, X, Pencil } from "lucide-react";

export default function MathBlockComponent({
  node,
  updateAttributes,
  selected,
  deleteNode,
}: NodeViewProps) {
  const { latex } = node.attrs;
  const [isEditing, setIsEditing] = useState(!latex);
  const [editValue, setEditValue] = useState(latex);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [isEditing]);

  // Update edit value when latex changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditValue(latex);
    }
  }, [latex, isEditing]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editValue, isEditing]);

  const handleSave = useCallback(() => {
    const trimmedValue = editValue.trim();
    if (trimmedValue) {
      updateAttributes({ latex: trimmedValue });
      setIsEditing(false);
    } else {
      deleteNode();
    }
  }, [editValue, updateAttributes, deleteNode]);

  const handleCancel = useCallback(() => {
    if (latex) {
      setEditValue(latex);
      setIsEditing(false);
    } else {
      deleteNode();
    }
  }, [latex, deleteNode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Cmd/Ctrl+Enter to save
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
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
  const lineCount = editValue.split("\n").length;

  if (isEditing) {
    return (
      <NodeViewWrapper className="math-block-editor" data-latex={latex}>
        <div className="math-block-editor-container">
          {/* Header */}
          <div className="math-block-editor-header">
            <span className="math-block-editor-label">LaTeX Equation</span>
            <div className="math-block-editor-actions">
              <button
                type="button"
                onClick={handleSave}
                className="math-block-action-btn math-block-action-save"
                title="Save (Ctrl/Cmd+Enter)"
                disabled={!editValue.trim() || !isValid}
              >
                <Check size={14} />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="math-block-action-btn math-block-action-cancel"
                title="Cancel (Escape)"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
            </div>
          </div>

          {/* Editor area */}
          <div className="math-block-editor-body">
            {/* Line numbers */}
            <div className="math-block-line-numbers">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="math-block-line-number">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
              className="math-block-textarea"
              spellCheck={false}
              autoComplete="off"
              rows={3}
            />
          </div>

          {/* Live preview */}
          <div className="math-block-preview">
            <span className="math-block-preview-label">Preview</span>
            {editValue ? (
              <div
                className={`math-block-preview-content ${
                  !isValid ? "math-block-preview-error" : ""
                }`}
                dangerouslySetInnerHTML={{
                  __html: isValid
                    ? renderLatex(editValue, { displayMode: true })
                    : '<span class="math-error">Invalid LaTeX syntax</span>',
                }}
              />
            ) : (
              <div className="math-block-preview-empty">
                Enter LaTeX to see preview
              </div>
            )}
          </div>

          {/* Help text */}
          <div className="math-block-editor-footer">
            <span>
              Press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to save, <kbd>Esc</kbd> to
              cancel
            </span>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  const renderedMath = renderLatex(latex || "\\text{Empty equation}", {
    displayMode: true,
  });

  return (
    <NodeViewWrapper
      className={`math-block-wrapper ${
        selected ? "ProseMirror-selectednode" : ""
      }`}
      data-latex={latex}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className="math-block-content"
        dangerouslySetInnerHTML={{ __html: renderedMath }}
      />
      {selected && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="math-block-edit-btn"
          title="Edit equation (double-click)"
        >
          <Pencil size={14} />
          <span>Edit</span>
        </button>
      )}
    </NodeViewWrapper>
  );
}
