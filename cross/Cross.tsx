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
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
      }}
    >
      {/* Input Section */}
      <div style={{ marginBottom: '20px' }}>
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
            color: '#000000'
          }}
        />
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div style={{ 
          fontSize: '14px', 
          marginBottom: '20px',
          color: '#B3E5FC'
        }}>
          Processing...
        </div>
      )}

      {/* Chat Messages Display */}
      {chatMessages.length > 0 && (
        <div style={{
          maxWidth: '800px',
          width: '100%',
          marginBottom: '20px'
        }}>
          {chatMessages.map((message, index) => (
            <div key={index} style={{
              marginBottom: '10px',
              fontSize: '14px',
              lineHeight: '1.4'
            }}>
              <div style={{ color: '#B3E5FC', marginBottom: '2px' }}>
                {message.role === 'user' ? 'You:' : 'AI:'}
              </div>
              <div style={{ color: '#ffffff' }}>
                {message.content}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#888888',
                marginTop: '4px'
              }}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Orchestrator Results */}
      {orchestratorResult && (
        <div style={{
          maxWidth: '800px',
          width: '100%',
          marginBottom: '20px',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          <div style={{ color: '#B3E5FC', marginBottom: '10px' }}>
            Response:
          </div>
          <div style={{ color: '#ffffff' }}>
            {orchestratorResult.success ? (
              orchestratorResult.message || 'Command executed successfully'
            ) : (
              orchestratorResult.error || 'Command failed'
            )}
          </div>
          {orchestratorResult.data && (
            <div style={{ 
              marginTop: '10px',
              fontSize: '12px',
              color: '#888888',
              whiteSpace: 'pre-wrap'
            }}>
              {JSON.stringify(orchestratorResult.data, null, 2)}
            </div>
          )}
        </div>
      )}

      {/* Note Processing Results */}
      {result && (
        <div style={{
          maxWidth: '800px',
          width: '100%',
          marginBottom: '20px',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          <div style={{ color: '#B3E5FC', marginBottom: '10px' }}>
            Note Processing:
          </div>
          <div style={{ color: '#ffffff' }}>
            {result.summary}
          </div>
          {result.totalCreated > 0 && (
            <div style={{ 
              marginTop: '10px',
              fontSize: '12px',
              color: '#888888'
            }}>
              Created: {result.totalCreated} entities
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Cross;
