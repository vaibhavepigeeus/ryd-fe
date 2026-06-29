import { useBuilderOptional } from '../../hooks/useBuilderOptional';
import { stopFormInteraction } from './FormFieldInput';
import './elements.css';

export default function TableElement({ element, isSelected }) {
  const builder = useBuilderOptional();
  const { cells = [] } = element.props;

  const handleCellBlur = (rowIndex, colIndex, e) => {
    if (!builder) return;
    const nextCells = cells.map((row) => [...row]);
    nextCells[rowIndex][colIndex] = e.currentTarget.textContent ?? '';
    builder.dispatch({
      type: 'UPDATE_ELEMENT',
      payload: { id: element.id, props: { cells: nextCells } },
    });
  };

  return (
    <div className={`el-table-wrap${isSelected ? ' el-table-wrap--selected' : ''}`}>
      <table className="el-table">
        <tbody>
          {cells.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="el-table-cell">
                  {builder ? (
                    <span
                      className="el-table-cell-text"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleCellBlur(rowIndex, colIndex, e)}
                      onMouseDown={stopFormInteraction}
                      onClick={stopFormInteraction}
                    >
                      {cell}
                    </span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
