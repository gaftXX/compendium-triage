import React, { useState, useCallback } from 'react';
import { ProcessingResult } from '../renderer/src/services/noteProcessing/noteProcessing';
import { useOrchestrator } from '../renderer/src/context/OrchestratorContext';
import { SimpleOrchestratorResponse } from '../orchestrator/simpleOrchestrator';

interface CrossProps {
  className?: string;
}

type InputMode = 'note-processing' | 'orchestrator';

export const Cross: React.FC<CrossProps> = ({ className }) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [orchestratorResult, setOrchestratorResult] = useState<SimpleOrchestratorResponse | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('note-processing');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);
  const { processCommand } = useOrchestrator();


  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Clear previous results when user types
    if (result) {
      setResult(null);
    }
    if (orchestratorResult) {
      setOrchestratorResult(null);
    }
  }, [result, orchestratorResult]);

  const handleKeyPress = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      await processOrchestratorCommand();
    }
  }, [inputValue]);

  const processNote = useCallback(async () => {
    if (!inputValue.trim()) return;

    setIsProcessing(true);
    try {
      const { NoteProcessing } = await import('../renderer/src/services/noteProcessing/noteProcessing');
      const service = NoteProcessing.getInstance();
      
      const processingResult = await service.processAndCreateEntities(inputValue);
      setResult(processingResult);
      
      // Clear input after successful processing
      if (processingResult.success && processingResult.totalCreated > 0) {
        setInputValue('');
      }
    } catch (error) {
      console.error('Error processing:', error);
      setResult({
        success: false,
        entitiesCreated: { offices: [], projects: [], regulations: [] },
        summary: 'Failed to process text: ' + (error as Error).message,
        totalCreated: 0
      });
    } finally {
      setIsProcessing(false);
    }
  }, [inputValue]);

  const processOrchestratorCommand = useCallback(async () => {
    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user' as const, content: inputValue, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);

    setIsProcessing(true);
    try {
      const orchestratorResponse = await processCommand(inputValue);
      setOrchestratorResult(orchestratorResponse);
      
      // Add assistant response to chat
      const assistantMessage = { 
        role: 'assistant' as const, 
        content: orchestratorResponse.message || (orchestratorResponse.success ? 'Command executed successfully' : 'Command failed'),
        timestamp: new Date() 
      };
      setChatMessages(prev => [...prev, assistantMessage]);
      
      // Clear input after successful processing
      if (orchestratorResponse.success) {
        setInputValue('');
      }
    } catch (error) {
      console.error('Error processing orchestrator command:', error);
      setOrchestratorResult({
        success: false,
        error: 'Failed to process command: ' + (error as Error).message
      });
      
      // Add error message to chat
      const errorMessage = { 
        role: 'assistant' as const, 
        content: 'Sorry, I encountered an error processing your command.',
        timestamp: new Date() 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [inputValue, processCommand]);

  // Removed mode switching - everything handled by orchestrator



  return (
    <div 
      className={className}
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '20px',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}
    >

      {/* Mode Switch - Fixed at top */}
      <div style={{ 
        marginBottom: '10px',
        position: 'sticky',
        top: '0',
        backgroundColor: '#000000',
        zIndex: 10,
        padding: '10px 0'
      }}>
      </div>

      {/* Input Section - Fixed at top */}
      <div style={{ 
        marginBottom: '20px',
        position: 'sticky',
        top: '60px',
        backgroundColor: '#000000',
        zIndex: 10,
        padding: '10px 0'
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter"
          disabled={isProcessing}
          style={{
            width: '400px',
            height: '30px',
            padding: '0px 12px',
            fontSize: '14px',
            border: 'none',
            borderRadius: '0px',
            outline: 'none',
            backgroundColor: isProcessing ? '#E0E0E0' : '#B3E5FC',
            color: '#000000',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
          }}
        />
      </div>

      {/* Chat Messages Display */}
      {chatMessages.length > 0 && (
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '15px',
          maxWidth: '800px',
          width: '100%',
          color: '#ffffff',
          marginBottom: '20px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#B3E5FC', fontSize: '16px' }}>
            Chat History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {chatMessages.map((message, index) => (
              <div key={index} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  backgroundColor: message.role === 'user' ? '#007bff' : '#28a745',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  maxWidth: '70%',
                  wordWrap: 'break-word',
                  fontSize: '14px'
                }}>
                  {message.content}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#888',
                  marginTop: '4px',
                  marginLeft: message.role === 'user' ? '0' : '8px',
                  marginRight: message.role === 'user' ? '8px' : '0'
                }}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div style={{ 
          color: '#B3E5FC', 
          fontSize: '14px', 
          marginBottom: '20px',
          position: 'sticky',
          top: '120px',
          backgroundColor: '#000000',
          zIndex: 10,
          padding: '10px 0'
        }}>
          AI Assistant is processing your command...
        </div>
      )}

             {/* Orchestrator Results */}
             {orchestratorResult && (
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '4px',
          padding: '20px',
          maxWidth: '800px',
          width: '100%',
          color: '#ffffff',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#B3E5FC', fontSize: '16px' }}>
            Orchestrator Response
          </h3>
          
          {orchestratorResult.success ? (
            <div>
              <div style={{ 
                backgroundColor: '#2d5a2d', 
                padding: '10px', 
                borderRadius: '4px', 
                marginBottom: '10px',
                color: '#90EE90'
              }}>
                ✅ {orchestratorResult.message || 'Command executed successfully'}
              </div>
              
              {orchestratorResult.actionExecuted && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>Action:</strong> {orchestratorResult.actionExecuted}
                </div>
              )}
              
              {orchestratorResult.data && (
                <div style={{ 
                  backgroundColor: '#1a1a1a', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  border: '1px solid #333',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {JSON.stringify(orchestratorResult.data, null, 2)}
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              backgroundColor: '#5a2d2d', 
              padding: '10px', 
              borderRadius: '4px',
              color: '#FFB6C1'
            }}>
              ❌ {orchestratorResult.error || 'Command failed'}
            </div>
          )}
        </div>
      )}

      {/* Note Processing Results */}
      {result && (
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '4px',
          padding: '20px',
          maxWidth: '800px',
          width: '100%',
          color: '#ffffff',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#B3E5FC', fontSize: '16px' }}>
            Note Processing Results
          </h3>
          
          {/* Processing Results */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              backgroundColor: '#1a1a1a', 
              padding: '15px', 
              borderRadius: '8px', 
              border: '1px solid #333',
              fontFamily: 'monospace',
              fontSize: '12px',
              whiteSpace: 'pre-wrap',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {JSON.stringify(result, null, 2)}
            </div>
          </div>

          {/* Web Search Results */}
          {result.webSearchResults && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#B3E5FC', fontSize: '14px' }}>
                Web Search Enriched Data
              </h4>
              <div style={{ 
                backgroundColor: '#1a1a1a', 
                padding: '15px', 
                borderRadius: '8px', 
                border: '1px solid #333',
                fontFamily: 'monospace',
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {JSON.stringify(result.webSearchResults, null, 2)}
              </div>
            </div>
          )}

          {!result.success && (
            <div style={{ color: '#dc3545' }}>
              <strong>Error:</strong> {result.summary}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Cross;
