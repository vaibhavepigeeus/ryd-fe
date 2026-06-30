import PublishedElementRenderer from '../published/PublishedElementRenderer';
import { getElementAnswers } from '../../utils/responseData';
import '../layout/Canvas.css';
import './ResponseDetailView.css';

export default function ResponsePageContent({ submission }) {
  const page = submission.page;
  const layout = page?.layout_data || {};
  const elements = layout.elements || [];
  const responseData = submission.response_data || {};

  return (
    <div className="canvas-page response-pdf-page">
      <header className="canvas-header canvas-header--branded">
        <div className="canvas-header-brand">JYOTI GULATI</div>
        <nav className="canvas-header-nav">
          <span>HOME</span>
          <span>ENTREPRENEURSHIP</span>
          <span>LEADERSHIP</span>
          <span>PERSONAL EXCELLENCE</span>
          <span>ARTICLES</span>
          <span>LOG IN</span>
        </nav>
      </header>

      <div className="canvas-content response-detail-content">
        {elements.length === 0 ? (
          <p className="response-detail-empty">This form has no content.</p>
        ) : (
          elements.map((element) => (
            <div key={element.id} className="response-detail-element">
              <PublishedElementRenderer
                element={element}
                answers={getElementAnswers(element, responseData)}
                readOnly
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
