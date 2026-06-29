import TextFormatPanel from '../sidebar/TextFormatPanel';
import QuestionnairePanel from '../sidebar/QuestionnairePanel';
import './RightPanel.css';

export default function RightPanel() {
  return (
    <aside className="right-panel">
      <div className="right-panel-scroll">
        <TextFormatPanel />
        <QuestionnairePanel />
      </div>
    </aside>
  );
}
