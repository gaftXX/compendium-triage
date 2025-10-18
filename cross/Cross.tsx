import React, { useState, useCallback } from 'react';
import { ProcessingResult } from '../renderer/src/services/noteProcessing/noteProcessing';

interface CrossProps {
  className?: string;
}

export const Cross: React.FC<CrossProps> = ({ className }) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);


  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Clear previous results when user types
    if (result) {
      setResult(null);
    }
  }, [result]);

  const handleKeyPress = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      await processNote();
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

      {/* Input Section - Fixed at top */}
      <div style={{ 
        marginBottom: '20px',
        position: 'sticky',
        top: '0',
        backgroundColor: '#000000',
        zIndex: 10,
        padding: '10px 0'
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter text... (AI will automatically identify and create offices, projects, regulations)"
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


      {/* Processing Indicator */}
      {isProcessing && (
        <div style={{ 
          color: '#B3E5FC', 
          fontSize: '14px', 
          marginBottom: '20px',
          position: 'sticky',
          top: '60px',
          backgroundColor: '#000000',
          zIndex: 10,
          padding: '10px 0'
        }}>
          AI is analyzing text and creating entities...
        </div>
      )}

      {/* V2 Results */}
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
