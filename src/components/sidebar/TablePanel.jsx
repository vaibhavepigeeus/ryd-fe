import { useBuilder } from '../../context/BuilderContext';
import {
  COMPONENT_TYPES,
  MAX_TABLE_COLS,
  MAX_TABLE_ROWS,
  MIN_TABLE_COLS,
  MIN_TABLE_ROWS,
  clampTableDimension,
  resizeTableCells,
} from '../../constants/builder';
import './TablePanel.css';

export default function TablePanel() {
  const { state, dispatch } = useBuilder();
  const selected = state.elements.find((el) => el.id === state.selectedId);
  const isTable = selected?.type === COMPONENT_TYPES.TABLE;

  if (!isTable) {
    return (
      <div className="table-panel table-panel--empty">
        <h3 className="panel-section-label">TABLE</h3>
        <p className="table-panel-hint">Select a Table block to change rows and columns</p>
      </div>
    );
  }

  const { cells = [] } = selected.props;
  const rows = cells.length;
  const cols = cells[0]?.length ?? 0;

  const updateDimensions = (nextRows, nextCols) => {
    const clampedRows = clampTableDimension(nextRows, MIN_TABLE_ROWS, MAX_TABLE_ROWS);
    const clampedCols = clampTableDimension(nextCols, MIN_TABLE_COLS, MAX_TABLE_COLS);
    const nextCells = resizeTableCells(cells, clampedRows, clampedCols);

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: selected.id,
        props: { cells: nextCells },
      },
    });
  };

  const handleRowsChange = (e) => {
    updateDimensions(e.target.value, cols);
  };

  const handleColsChange = (e) => {
    updateDimensions(rows, e.target.value);
  };

  return (
    <div className="table-panel">
      <h3 className="panel-section-label">TABLE</h3>
      <p className="table-panel-size">{rows} × {cols}</p>

      <div className="table-panel-fields">
        <label className="table-panel-field">
          <span>Rows</span>
          <input
            type="number"
            min={MIN_TABLE_ROWS}
            max={MAX_TABLE_ROWS}
            value={rows}
            onChange={handleRowsChange}
          />
        </label>
        <label className="table-panel-field">
          <span>Columns</span>
          <input
            type="number"
            min={MIN_TABLE_COLS}
            max={MAX_TABLE_COLS}
            value={cols}
            onChange={handleColsChange}
          />
        </label>
      </div>

      <p className="table-panel-hint">
        Click the table to select it. Double-click a cell to edit text. Existing
        cell content is kept when resizing.
      </p>
    </div>
  );
}
