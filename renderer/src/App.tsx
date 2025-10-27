import { useState, useEffect } from 'react';
import { Cross } from '../../cross/Cross';
import { RegulationsPage } from './pages/regulations';
import { OfficesPage } from './pages/offices';
import { ProjectsPage } from './pages/projects';
import { initializeFirebase } from './services/firebase';
import { navigationService, ViewType } from './services/navigation/navigationService';
import { OrchestratorProvider } from './context/OrchestratorContext';

interface AppState {
  currentView: ViewType;
  showCross: boolean;
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'cross',
    showCross: true
  });

  // Initialize Firebase when app starts
  useEffect(() => {
    const initFirebase = async () => {
      try {
        await initializeFirebase();
        console.log('Firebase initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        console.log('App will continue with mock data');
      }
    };
    initFirebase();
  }, []);

  // Register navigation service callbacks
  useEffect(() => {
    navigationService.registerCallbacks({
      onNavigate: (view: ViewType) => {
        setAppState(prev => ({
          ...prev,
          currentView: view,
          showCross: view === 'cross'
        }));
      }
    });
  }, [appState.currentView]);

  // Handle window management when views change
  useEffect(() => {
    const handleViewChange = async () => {
      if (appState.currentView === 'cross') {
        // Show Cross UI - keep normal window size
        setAppState(prev => ({ ...prev, showCross: true }));
      } else {
        // Hide Cross UI - keep normal window size
        setAppState(prev => ({ ...prev, showCross: false }));
      }
    };

    handleViewChange();
  }, [appState.currentView]);



  // Render the appropriate view
  const renderView = () => {
    switch (appState.currentView) {
      case 'offices-list':
        return <OfficesPage />;
      case 'projects-list':
        return <ProjectsPage />;
      case 'regulations-list':
        return <RegulationsPage />;
      case 'cross':
      default:
        return <Cross />;
    }
  };

  return (
    <OrchestratorProvider>
      <div style={{ height: '100vh', backgroundColor: '#000000', color: '#ffffff' }}>
        {renderView()}
      </div>
    </OrchestratorProvider>
  );
}

export default App;
