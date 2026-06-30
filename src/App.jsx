import { useCallback, useState } from 'react';
import { BuilderProvider, useBuilder } from './context/BuilderContext';
import { QuestionnaireProvider } from './context/QuestionnaireContext';
import TopBar from './components/layout/TopBar';
import Sidebar from './components/layout/Sidebar';
import PageStartScreen from './components/layout/PageStartScreen';
import ResponsesScreen from './components/responses/ResponsesScreen';
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

function AppBody() {
  const { state } = useBuilder();
  const [sidebarWidth, setSidebarWidth] = useState(190);
  const [rightPanelWidth, setRightPanelWidth] = useState(360);

  const resizeSidebar = useCallback((delta) => {
    setSidebarWidth((width) => clamp(width + delta, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH));
  }, []);

  const resizeRightPanel = useCallback((delta) => {
    setRightPanelWidth((width) => clamp(width - delta, MIN_RIGHT_PANEL_WIDTH, MAX_RIGHT_PANEL_WIDTH));
  }, []);

  const showStartScreen = state.activeTab === 'Pages';
  const showResponsesScreen = state.activeTab === 'Responses';
  const showBuilderChrome = !showStartScreen && !showResponsesScreen;

  return (
    <div className="app">
      <TopBar />
      <div className="app-body">
        {showBuilderChrome && <Sidebar width={sidebarWidth} />}
        {showBuilderChrome && <PanelResizeHandle side="left" onResize={resizeSidebar} />}
        {showStartScreen ? (
          <PageStartScreen />
        ) : showResponsesScreen ? (
          <ResponsesScreen />
        ) : (
          <Canvas />
        )}
        {showBuilderChrome && (
          <>
            <PanelResizeHandle side="right" onResize={resizeRightPanel} />
            <RightPanel width={rightPanelWidth} />
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QuestionnaireProvider>
      <BuilderProvider>
        <AppBody />
      </BuilderProvider>
    </QuestionnaireProvider>
  );
}
