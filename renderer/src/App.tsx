import React, { useState, useEffect } from 'react';
import { useElectron } from './hooks/useElectron';
import { testFirebaseConnection, type ConnectionTestResult } from './services/firebase';

function App() {
  const { isElectron, appVersion, platform } = useElectron();
  const [firebaseStatus, setFirebaseStatus] = useState<ConnectionTestResult | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    // Test Firebase connection on app load
    const testConnection = async () => {
      setIsTestingConnection(true);
      try {
        const result = await testFirebaseConnection();
        setFirebaseStatus(result);
      } catch (error) {
        setFirebaseStatus({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
      } finally {
        setIsTestingConnection(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0A0E27',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        marginBottom: '1rem',
        fontWeight: '300',
        letterSpacing: '0.1em'
      }}>
        Compendium Triage
      </h1>
      
      <p style={{ 
        fontSize: '1.2rem', 
        opacity: 0.8,
        textAlign: 'center',
        maxWidth: '600px',
        lineHeight: '1.6'
      }}>
        AI Orchestrator Architecture App
      </p>
      
      <div style={{
        marginTop: '2rem',
        padding: '1rem 2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          Phase 1: API Setup Complete ✅
        </p>
        
        {/* Firebase Connection Status */}
        <div style={{ marginTop: '0.5rem' }}>
          {isTestingConnection ? (
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>
              Testing Firebase connection...
            </p>
          ) : firebaseStatus ? (
            <p style={{ 
              margin: 0, 
              fontSize: '0.8rem', 
              color: firebaseStatus.success ? '#4ade80' : '#f87171'
            }}>
              Firebase: {firebaseStatus.success ? 'Connected' : 'Failed'} 
              {firebaseStatus.latency && ` (${firebaseStatus.latency}ms)`}
              {firebaseStatus.error && ` - ${firebaseStatus.error}`}
            </p>
          ) : null}
        </div>
        
        {isElectron && (
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', opacity: 0.7 }}>
            Electron v{appVersion} • {platform}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
