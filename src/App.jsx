import { BuilderProvider } from './context/BuilderContext';
import { QuestionnaireProvider } from './context/QuestionnaireContext';
import TopBar from './components/layout/TopBar';
import Sidebar from './components/layout/Sidebar';
import Canvas from './components/layout/Canvas';
import RightPanel from './components/layout/RightPanel';
import './App.css';

export default function App() {
  return (
    <QuestionnaireProvider>
      <BuilderProvider>
        <div className="app">
          <TopBar />
          <div className="app-body">
            <Sidebar />
            <Canvas />
            <RightPanel />
          </div>
        </div>
      </BuilderProvider>
    </QuestionnaireProvider>
  );
}
