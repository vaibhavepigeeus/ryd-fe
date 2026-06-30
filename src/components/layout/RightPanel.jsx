import ImagePanel from '../sidebar/ImagePanel';
import QuestionnairePanel from '../sidebar/QuestionnairePanel';
import QuestionOptionsPanel from '../sidebar/QuestionOptionsPanel';
import QuestionTypePanel from '../sidebar/QuestionTypePanel';
import TablePanel from '../sidebar/TablePanel';
import './RightPanel.css';

export default function RightPanel({ width = 360 }) {
  return (
    <aside className="right-panel" style={{ width }}>
      <div className="right-panel-scroll">
        <QuestionTypePanel />
        <QuestionOptionsPanel />
        <TablePanel />
        <ImagePanel />
        <QuestionnairePanel />
      </div>
    </aside>
  );
}
