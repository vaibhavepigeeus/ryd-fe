import TextFormatPanel from '../sidebar/TextFormatPanel';
import ImagePanel from '../sidebar/ImagePanel';
import QuestionnairePanel from '../sidebar/QuestionnairePanel';
import './RightPanel.css';

export default function RightPanel() {
  return (
    <aside className="right-panel">
      <div className="right-panel-scroll">
        <TextFormatPanel />
        <ImagePanel />
        <QuestionnairePanel />
      </div>
    </aside>
  );
}
