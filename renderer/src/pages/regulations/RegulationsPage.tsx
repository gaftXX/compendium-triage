import React, { useEffect } from 'react';
import { ContextProvider } from '../../../../aiOrchestra/gen2/contextProvider';

export const RegulationsPage: React.FC = () => {
  const contextProvider = ContextProvider.getInstance();

  useEffect(() => {
    contextProvider.setCurrentPage('regulations-list');
    
    return () => {
      contextProvider.updateContext({
        currentPage: 'unknown'
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      UCC for later
    </div>
  );
};
