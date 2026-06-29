import { useCallback, useEffect, useRef, useState } from 'react';
import { useBuilderOptional } from '../../hooks/useBuilderOptional';
import {
  buildTextStyle,
  contentToHtml,
  DEFAULT_TEXT_FORMATTING,
  DEFAULT_TITLE_FORMATTING,
  getActiveFormats,
  getCurrentFontSize,
  getNextFontSize,
  snapFontSize,
} from '../../constants/textFormatting';
import InlineTextToolbar from './InlineTextToolbar';
import InlineTextContextMenu from './InlineTextContextMenu';
import './elements.css';

export default function RichTextBlock({
  element,
  tag: Tag = 'p',
  className,
  readOnly = false,
  textField = 'content',
  htmlField = 'contentHtml',
  formattingField = 'formatting',
  onSave,
  onChange,
  disabled = false,
  syncKey,
  onMouseDown,
}) {
  const builder = useBuilderOptional();
  const editorRef = useRef(null);
  const [toolbarPosition, setToolbarPosition] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  const [activeFormats, setActiveFormats] = useState({});
  const [isFocused, setIsFocused] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const savedRangeRef = useRef(null);

  const defaultFormatting =
    Tag === 'h1' ? DEFAULT_TITLE_FORMATTING : DEFAULT_TEXT_FORMATTING;
  const blockFormatting = element.props[formattingField] || defaultFormatting;
  const blockStyle = buildTextStyle({ ...blockFormatting, bold: false, italic: false, underline: false, color: undefined, fontSize: undefined });
  const textContent = element.props[textField] ?? '';
  const htmlContent = element.props[htmlField];

  const syncEditorHtml = useCallback(() => {
    if (!editorRef.current) return;
    const html = htmlContent || contentToHtml(textContent, blockFormatting);
    if (editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [textContent, htmlContent, blockFormatting]);

  useEffect(() => {
    syncEditorHtml();
  }, [element.id, htmlContent, syncKey, syncEditorHtml]);

  const notifyChange = useCallback(() => {
    if (!editorRef.current || !onChange) return;
    onChange({
      text: editorRef.current.textContent || '',
      html: editorRef.current.innerHTML,
    });
  }, [onChange]);

  const updateToolbar = useCallback(() => {
    if (!editorRef.current || readOnly || !builder || disabled) return;

    const rect = editorRef.current.getBoundingClientRect();
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0 && editorRef.current.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const selectionRect = range.getBoundingClientRect();
      const top = Math.max(12, (selectionRect.top || rect.top) - 12);
      const left = selectionRect.left + selectionRect.width / 2 || rect.left + rect.width / 2;
      setToolbarPosition({ top, left });
      setActiveFormats(getActiveFormats(editorRef.current));
      setHasSelection(!selection.isCollapsed);
      return;
    }

    setToolbarPosition({ top: rect.top - 12, left: rect.left + rect.width / 2 });
    setActiveFormats(getActiveFormats(editorRef.current));
    setHasSelection(false);
  }, [builder, disabled, readOnly]);

  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editorRef.current) return;
    if (!editorRef.current.contains(selection.anchorNode)) return;
    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  }, []);

  const restoreSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!savedRangeRef.current || !selection) return;
    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  }, []);

  const saveContent = useCallback(() => {
    if (!editorRef.current) return;
    const contentHtml = editorRef.current.innerHTML;
    const content = editorRef.current.textContent || '';

    if (onSave) {
      onSave({ text: content, html: contentHtml });
      return;
    }

    if (!builder) return;
    builder.dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: element.id,
        props: { [textField]: content, [htmlField]: contentHtml },
      },
    });
  }, [builder, element.id, htmlField, onSave, textField]);

  const applyFontSize = useCallback((size) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    const px = `${Number(size)}px`;

    if (range.collapsed) {
      const container = range.startContainer;
      if (container.nodeType === Node.TEXT_NODE && container.textContent?.length) {
        range.setStart(container, 0);
        range.setEnd(container, container.textContent.length);
      } else {
        range.selectNodeContents(editorRef.current);
      }
    }

    const span = document.createElement('span');
    span.style.fontSize = px;

    try {
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);

      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(newRange);
      savedRangeRef.current = newRange.cloneRange();
    } catch {
      document.execCommand('insertHTML', false, `<span style="font-size:${px}">${range.toString()}</span>`);
    }
  }, []);

  const applyFontName = useCallback((fontName) => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      document.execCommand('fontName', false, fontName);
      return;
    }

    try {
      const span = document.createElement('span');
      span.style.fontFamily = `'${fontName}', sans-serif`;
      range.surroundContents(span);
    } catch {
      document.execCommand('fontName', false, fontName);
    }
  }, []);

  const runCommand = useCallback(
    (command, value) => {
      if (!editorRef.current) return;
      restoreSelection();
      editorRef.current.focus();

      if (command === 'fontSize') {
        applyFontSize(value);
      } else if (command === 'growFont') {
        const current = getCurrentFontSize(editorRef.current);
        const next = getNextFontSize(current, 1);
        if (next !== snapFontSize(current)) applyFontSize(next);
      } else if (command === 'shrinkFont') {
        const current = getCurrentFontSize(editorRef.current);
        const next = getNextFontSize(current, -1);
        if (next !== snapFontSize(current)) applyFontSize(next);
      } else if (command === 'fontName') {
        applyFontName(value);
      } else if (command === 'createLink') {
        if (value) {
          document.execCommand('createLink', false, value);
        }
      } else if (command === 'unlink') {
        document.execCommand('unlink', false);
      } else if (command === 'hiliteColor') {
        if (value === 'transparent') {
          document.execCommand('removeFormat', false);
        } else {
          document.execCommand('hiliteColor', false, value);
        }
      } else {
        document.execCommand(command, false, value);
      }

      updateToolbar();
    },
    [applyFontName, applyFontSize, restoreSelection, updateToolbar]
  );

  const handleContextAction = useCallback(
    async (action) => {
      if (!editorRef.current) return;
      editorRef.current.focus();

      if (action === 'paste') {
        try {
          const text = await navigator.clipboard.readText();
          document.execCommand('insertText', false, text);
        } catch {
          document.execCommand('paste');
        }
      } else if (action === 'selectAll') {
        document.execCommand('selectAll', false);
      } else {
        document.execCommand(action, false);
      }

      setContextMenuPosition(null);
      updateToolbar();
    },
    [updateToolbar]
  );

  const handleFocus = () => {
    if (disabled) return;
    setIsFocused(true);
    saveSelection();
    updateToolbar();
  };

  const handleBlur = (e) => {
    if (disabled) return;
    if (
      e.relatedTarget?.closest?.('.inline-text-toolbar') ||
      e.relatedTarget?.closest?.('.inline-text-context-menu')
    ) {
      return;
    }
    setIsFocused(false);
    setToolbarPosition(null);
    setContextMenuPosition(null);
    saveContent();
  };

  const handleInput = () => {
    notifyChange();
    updateToolbar();
  };

  const handleKeyUp = () => {
    updateToolbar();
  };

  const handleMouseUp = () => {
    saveSelection();
    updateToolbar();
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenuPosition({ top: e.clientY, left: e.clientX });
    setIsFocused(true);
    updateToolbar();
  };

  useEffect(() => {
    if (!contextMenuPosition) return undefined;

    const closeMenu = (e) => {
      if (e.target.closest?.('.inline-text-context-menu')) return;
      setContextMenuPosition(null);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, [contextMenuPosition]);

  if (readOnly || !builder) {
    const html = htmlContent || contentToHtml(textContent, blockFormatting);
    return (
      <Tag
        className={`${className} rich-text-block`}
        style={blockStyle}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  const handleEditorMouseDown = (e) => {
    onMouseDown?.(e);
  };

  const handleEditorClick = (e) => {
    if (e.target.closest('a')) {
      e.preventDefault();
    }
  };

  return (
    <>
      <Tag
        ref={editorRef}
        className={`${className} rich-text-block rich-text-block--editable`}
        style={blockStyle}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        onKeyUp={handleKeyUp}
        onMouseUp={handleMouseUp}
        onMouseDown={handleEditorMouseDown}
        onClick={handleEditorClick}
        onContextMenu={handleContextMenu}
      />
      {isFocused && !disabled && toolbarPosition && (
        <InlineTextToolbar
          position={toolbarPosition}
          onCommand={runCommand}
          onSaveSelection={saveSelection}
          activeFormats={activeFormats}
        />
      )}
      {contextMenuPosition && (
        <InlineTextContextMenu
          position={contextMenuPosition}
          onAction={handleContextAction}
          canCut={hasSelection}
          canCopy={hasSelection}
        />
      )}
    </>
  );
}
