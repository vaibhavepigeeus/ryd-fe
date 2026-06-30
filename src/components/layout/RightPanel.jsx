import ImagePanel from '../sidebar/ImagePanel';
import QuestionnairePanel from '../sidebar/QuestionnairePanel';
import TablePanel from '../sidebar/TablePanel';
import './RightPanel.css';

export default function RightPanel({ width = 360 }) {
  return (
    <aside className="right-panel" style={{ width }}>
      <div className="right-panel-scroll">
        <TablePanel />
        <ImagePanel />
        <QuestionnairePanel />
      </div>
    </aside>
  );
}
