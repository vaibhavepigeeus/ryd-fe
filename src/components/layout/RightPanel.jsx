import TextFormatPanel from '../sidebar/TextFormatPanel';
import ImagePanel from '../sidebar/ImagePanel';
import QuestionnairePanel from '../sidebar/QuestionnairePanel';
import './RightPanel.css';

export default function RightPanel({ width = 220 }) {
  return (
    <aside className="right-panel" style={{ width }}>
      <div className="right-panel-scroll">
        <TextFormatPanel />
        <ImagePanel />
        <QuestionnairePanel />
      </div>
    </aside>
  );
}
