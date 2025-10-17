import React from 'react';
import { useElectron } from './hooks/useElectron';

function App() {
  const { isElectron, appVersion, platform } = useElectron();

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
