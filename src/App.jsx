import { useCallback, useState } from 'react';
import { BuilderProvider } from './context/BuilderContext';
import { QuestionnaireProvider } from './context/QuestionnaireContext';
import TopBar from './components/layout/TopBar';
import Sidebar from './components/layout/Sidebar';
import Canvas from './components/layout/Canvas';
import RightPanel from './components/layout/RightPanel';
import PanelResizeHandle from './components/layout/PanelResizeHandle';
import './App.css';

const MIN_SIDEBAR_WIDTH = 160;
const MAX_SIDEBAR_WIDTH = 400;
const MIN_RIGHT_PANEL_WIDTH = 180;
const MAX_RIGHT_PANEL_WIDTH = 480;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function App() {
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [rightPanelWidth, setRightPanelWidth] = useState(220);

  const resizeSidebar = useCallback((delta) => {
    setSidebarWidth((width) => clamp(width + delta, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH));
  }, []);

  const resizeRightPanel = useCallback((delta) => {
    setRightPanelWidth((width) => clamp(width - delta, MIN_RIGHT_PANEL_WIDTH, MAX_RIGHT_PANEL_WIDTH));
  }, []);

  return (
    <QuestionnaireProvider>
      <BuilderProvider>
        <div className="app">
          <TopBar />
          <div className="app-body">
            <Sidebar width={sidebarWidth} />
            <PanelResizeHandle side="left" onResize={resizeSidebar} />
            <Canvas />
            <PanelResizeHandle side="right" onResize={resizeRightPanel} />
            <RightPanel width={rightPanelWidth} />
          </div>
        </div>
      </BuilderProvider>
    </QuestionnaireProvider>
  );
}
