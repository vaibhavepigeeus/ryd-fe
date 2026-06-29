import { useCallback } from 'react';
import './PanelResizeHandle.css';

export default function PanelResizeHandle({ side, onResize }) {
  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();

      const onMouseMove = (moveEvent) => {
        onResize(moveEvent.movementX);
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };

      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [onResize]
  );

  return (
    <div
      className={`panel-resize-handle panel-resize-handle--${side}`}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation="vertical"
      title="Drag to resize panel"
    />
  );
}
