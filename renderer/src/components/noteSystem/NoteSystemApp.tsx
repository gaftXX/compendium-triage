// Independent Note System App - Self-contained data ingestion interface
// This component operates completely independently from the main app and orchestrator

import React, { useState, useCallback, useEffect } from 'react';
import { ProcessingResult } from '../../services/noteProcessing/noteProcessing';
import { IndependentNoteService } from '../../services/noteProcessing/independentNoteService';

interface NoteSystemAppProps {
  className?: string;
}

export const NoteSystemApp: React.FC<NoteSystemAppProps> = ({ className }) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [processingHistory, setProcessingHistory] = useState<ProcessingResult[]>([]);
  const [systemStatus, setSystemStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');

  // Initialize the independent note system
  useEffect(() => {
    const initializeNoteSystem = async () => {
      try {
        console.log('🚀 Initializing Independent Note System...');
        
        // Initialize independent note service
        const independentService = IndependentNoteService.getInstance();
        await independentService.initialize();
        
        console.log('✅ Independent Note System initialized successfully');
        setSystemStatus('ready');
      } catch (error) {
        console.error('❌ Failed to initialize Independent Note System:', error);
        setSystemStatus('error');
      }
    };

    initializeNoteSystem();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Clear previous results when user types
    if (result) {
      setResult(null);
    }
  }, [result]);

  const handleKeyPress = useCallback(async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey && inputValue.trim()) {
      e.preventDefault();
      await processNote();
    }
  }, [inputValue]);

  const processNote = useCallback(async () => {
    if (!inputValue.trim() || systemStatus !== 'ready') return;

    setIsProcessing(true);
    setResult(null);
    
    try {
      console.log('📝 Processing note with Independent Note System...');
      
      const independentService = IndependentNoteService.getInstance();
      const processingResult = await independentService.processNote(inputValue);
      
      setResult(processingResult);
      setProcessingHistory(prev => [processingResult, ...prev.slice(0, 9)]); // Keep last 10 results
      
      // Clear input after successful processing
      if (processingResult.success && processingResult.totalCreated > 0) {
        setInputValue('');
      }
      
      console.log('✅ Note processing completed:', processingResult.summary);
    } catch (error) {
      console.error('❌ Error processing note:', error);
      const errorResult: ProcessingResult = {
        success: false,
        entitiesCreated: { offices: [], projects: [], regulations: [] },
        summary: 'Failed to process text: ' + (error as Error).message,
        totalCreated: 0
      };
      setResult(errorResult);
      setProcessingHistory(prev => [errorResult, ...prev.slice(0, 9)]);
    } finally {
      setIsProcessing(false);
    }
  }, [inputValue, systemStatus]);

  const clearHistory = useCallback(() => {
    setProcessingHistory([]);
    setResult(null);
  }, []);

  if (systemStatus === 'initializing') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#495057',
          marginBottom: '16px'
        }}>
          🚀 Initializing Note System...
        </div>
        <div style={{
          fontSize: '14px',
          color: '#6c757d',
          textAlign: 'center'
        }}>
          Setting up independent data ingestion system
        </div>
      </div>
    );
  }

  if (systemStatus === 'error') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#dc3545',
          marginBottom: '16px'
        }}>
          ❌ System Error
        </div>
        <div style={{
          fontSize: '14px',
          color: '#6c757d',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          Failed to initialize the Note System
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }} className={className}>
      
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #dee2e6',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#495057'
          }}>
            📝 Independent Note System
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: '#6c757d'
          }}>
            Self-contained data ingestion • Direct Firestore access • Claude AI processing
          </p>
        </div>
        <div style={{
          fontSize: '12px',
          color: '#28a745',
          fontWeight: 'bold'
        }}>
          ✅ SYSTEM READY
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        
        {/* Input Panel */}
        <div style={{
          width: '50%',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #dee2e6',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* Input Section */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #dee2e6'
          }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#495057',
              marginBottom: '8px'
            }}>
              Enter unstructured text:
            </label>
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Enter text about offices, projects, or regulations..."
              disabled={isProcessing}
              style={{
                width: '100%',
                height: '120px',
                padding: '12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                backgroundColor: isProcessing ? '#f8f9fa' : '#ffffff'
              }}
            />
            <div style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#6c757d'
            }}>
              Press Ctrl+Enter to process
            </div>
          </div>

          {/* Action Section */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #dee2e6'
          }}>
            <button
              onClick={processNote}
              disabled={!inputValue.trim() || isProcessing}
              style={{
                backgroundColor: isProcessing ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              {isProcessing ? '🔄 Processing...' : '🚀 Process Note'}
            </button>
          </div>

          {/* System Info */}
          <div style={{
            padding: '16px 24px',
            flex: 1,
            fontSize: '12px',
            color: '#6c757d'
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#495057'
            }}>
              System Capabilities:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '16px' }}>
              <li>AI-powered categorization (office/project/regulation)</li>
              <li>Automatic entity extraction and validation</li>
              <li>Smart duplicate detection and merging</li>
              <li>Bidirectional relationship creation</li>
              <li>Direct Firestore database access</li>
              <li>Independent from main application</li>
            </ul>
          </div>
        </div>

        {/* Results Panel */}
        <div style={{
          width: '50%',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          
          {/* Current Result */}
          {result && (
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #dee2e6'
            }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#495057'
              }}>
                Processing Result:
              </h3>
              <div style={{
                padding: '12px',
                backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: '4px',
                fontSize: '14px',
                color: result.success ? '#155724' : '#721c24'
              }}>
                <strong>{result.success ? '✅ Success' : '❌ Failed'}</strong>
                <br />
                {result.summary}
                {result.totalCreated > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <strong>Entities created: {result.totalCreated}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing History */}
          <div style={{
            flex: 1,
            padding: '24px',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#495057'
              }}>
                Processing History:
              </h3>
              {processingHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            
            {processingHistory.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#6c757d',
                fontSize: '14px',
                fontStyle: 'italic'
              }}>
                No processing history yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {processingHistory.map((historyResult, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: historyResult.success ? '#d4edda' : '#f8d7da',
                      border: `1px solid ${historyResult.success ? '#c3e6cb' : '#f5c6cb'}`,
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: historyResult.success ? '#155724' : '#721c24'
                    }}
                  >
                    <strong>{historyResult.success ? '✅' : '❌'}</strong> {historyResult.summary}
                    {historyResult.totalCreated > 0 && (
                      <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                        ({historyResult.totalCreated} entities)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteSystemApp;
