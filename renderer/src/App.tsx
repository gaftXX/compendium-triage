import { useState, useEffect } from 'react';
import { Cross } from '../../cross/Cross';
import { RegulationsPage } from './pages/regulations';
import { OfficesPage } from './pages/offices';
import { ProjectsPage } from './pages/projects';
import { BarcelonaMapPage } from './pages/map';
import { RecordsPage } from './pages/records';
import { BTViewPage } from './pages/bt-view';
import { initializeFirebase } from './services/firebase';
import { navigationService, ViewType } from './services/navigation/navigationService';
import { OrchestratorProvider } from './context/OrchestratorContext';
import { backgroundService } from './services/background';
import { useElectron } from './hooks/useElectron';

interface AppState {
  currentView: ViewType;
  showCross: boolean;
  params?: any;
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'cross',
    showCross: true
  });
  const { resizeToDefault, resizeToMaxWidth } = useElectron();

  // Initialize Firebase and real-time listeners when app starts
  useEffect(() => {
    const initFirebase = async () => {
      try {
        await initializeFirebase();
        console.log('Firebase initialized successfully');
        
        // Initialize real-time listeners for background updates
        await backgroundService.initializeRealtimeListeners();
        console.log('Real-time listeners initialized');
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
      onNavigate: async (view: ViewType, params?: any) => {
        setAppState(prev => ({
          ...prev,
          currentView: view,
          showCross: view === 'cross',
          params: params
        }));
        
        // ENFORCE WINDOW SIZE RULE
        const windowSize = backgroundService.getWindowSizeForView(view);
        if (windowSize === 'default') {
          await resizeToDefault();
          console.log('🪟 RULE ENFORCED: Set to default width for', view);
        } else {
          await resizeToMaxWidth();
          console.log('🪟 RULE ENFORCED: Set to full width for', view);
        }
      }
    });
  }, [appState.currentView, resizeToDefault, resizeToMaxWidth]);



  // Render the appropriate view
  const renderView = () => {
    switch (appState.currentView) {
      case 'offices-list':
        return <OfficesPage />;
      case 'projects-list':
        return <ProjectsPage />;
      case 'regulations-list':
        return <RegulationsPage />;
      case 'map':
        return <BarcelonaMapPage />;
      case 'records-list':
        return <RecordsPage params={appState.params} />;
      case 'bt-view':
        return <BTViewPage params={appState.params} />;
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
