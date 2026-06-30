import { useEffect, useRef, useState } from 'react';
import { useBuilderOptional } from '../../hooks/useBuilderOptional';
import './elements.css';

export default function TableElement({ element, isSelected }) {
  const builder = useBuilderOptional();
  const { cells = [] } = element.props;
  const [editingCell, setEditingCell] = useState(null);
  const cellRefs = useRef({});

  useEffect(() => {
    if (!isSelected) {
      setEditingCell(null);
    }
  }, [isSelected]);

  useEffect(() => {
    if (!editingCell) return;
    const key = `${editingCell.row}-${editingCell.col}`;
    const el = cellRefs.current[key];
    if (el) {
      el.focus();
    }
  }, [editingCell]);

  const handleCellDoubleClick = (rowIndex, colIndex, e) => {
    if (!builder) return;
    e.stopPropagation();
    builder.dispatch({ type: 'SELECT_ELEMENT', payload: element.id });
    setEditingCell({ row: rowIndex, col: colIndex });
  };

  const handleCellBlur = (rowIndex, colIndex, e) => {
    if (!builder) return;
    const nextCells = cells.map((row) => [...row]);
    nextCells[rowIndex][colIndex] = e.currentTarget.textContent ?? '';
    builder.dispatch({
      type: 'UPDATE_ELEMENT',
      payload: { id: element.id, props: { cells: nextCells } },
    });
    setEditingCell(null);
  };

  return (
    <div className={`el-table-wrap${isSelected ? ' el-table-wrap--selected' : ''}`}>
      <table className="el-table">
        <tbody>
          {cells.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                const isEditing =
                  editingCell?.row === rowIndex && editingCell?.col === colIndex;
                const cellKey = `${rowIndex}-${colIndex}`;

                return (
                  <td key={colIndex} className="el-table-cell">
                    {builder ? (
                      <span
                        ref={(node) => {
                          if (node) {
                            cellRefs.current[cellKey] = node;
                          } else {
                            delete cellRefs.current[cellKey];
                          }
                        }}
                        className={`el-table-cell-text${isEditing ? ' el-table-cell-text--editing' : ''}`}
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        title={isSelected ? 'Double-click to edit' : undefined}
                        onDoubleClick={(e) => handleCellDoubleClick(rowIndex, colIndex, e)}
                        onBlur={(e) => {
                          if (isEditing) {
                            handleCellBlur(rowIndex, colIndex, e);
                          }
                        }}
                      >
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
