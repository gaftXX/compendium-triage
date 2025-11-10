import React, { useState, useEffect, useMemo } from 'react';
import { PageEngine } from './engine/PageEngine';
import { TextBoxComponent } from './multiRectangleComponents/TextBoxComponent';
import { DisplayBoxComponent } from './multiRectangleComponents/DisplayBoxComponent';
import { OrchestraGen2, ActionPlan } from '../aiOrchestra';
import { navigationService } from '../renderer/src/services/navigation/navigationService';
import { PositionCalculator } from './positionCalculator/PositionCalculator';
import { IndependentNoteService } from '../noteSystem/independentNoteService.ts';
import { ensureAiOrchestraPulseAnimation } from './animations/aiOrchestraPulse';

interface CrossProps {
  className?: string;
}

export const Cross: React.FC<CrossProps> = ({ className }) => {
  // State management using PageEngine
  const [isShiftSActive, setIsShiftSActive] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [locationPrompt, setLocationPrompt] = useState<{
    active: boolean;
    officeData: any;
  } | null>(null);
  
  // Gen 2 Orchestra - Action Plans
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [showActionApproval, setShowActionApproval] = useState(false);
  
  // Scraper session tracking
  const [scraper, setScraper] = useState<{
    sessionId: string | null;
    startTime: number | null;
    location: string;
    radius: number;
    results: string;
  } | null>(null);
  const [claudeApiStatus, setClaudeApiStatus] = useState<'working' | 'error'>('error');
  const [isThinking, setIsThinking] = useState(false);
  
  // Memoized instances to prevent recreation on every render
  const pageEngine = useMemo(() => PageEngine.getInstance(), []);
  const orchestraGen2 = useMemo(() => OrchestraGen2.getInstance(), []);
  const positionCalculator = useMemo(() => new PositionCalculator(), []);
  const noteService = useMemo(() => IndependentNoteService.getInstance(), []);

  useEffect(() => {
    ensureAiOrchestraPulseAnimation();
  }, []);

  // Check Claude API status
  const checkClaudeApiStatus = async () => {
    try {
      const { ClaudeAIService } = await import('../renderer/src/services/claudeAIService');
      const claudeAI = ClaudeAIService.getInstance();
      claudeAI.setApiKey(claudeApiKey);
      
      // Make a simple test call
      await claudeAI.chat('test');
      setClaudeApiStatus('working');
    } catch (error) {
      setClaudeApiStatus('error');
    }
  };

  // Get API keys from environment
  const claudeApiKey = (import.meta as any).env.VITE_ANTHROPIC_API_KEY;
  const googlePlacesApiKey = (import.meta as any).env.VITE_GOOGLE_PLACES_API_KEY;

  // Hotkeys are owned by PageEngine
  // Grid: 31 columns, dynamic rows to fill window height with 4px cells
  // Rectangle dimensions: 40px width (x), 4px height (y)
  const rectWidth = 40;
  const rectHeight = 4;
  const columns = 31;
  const rows = Math.floor(window.innerHeight / rectHeight);
  const gridHeight = rows * rectHeight;
  const verticalOffset = window.innerHeight - gridHeight; // push grid to bottom
  
  // Generate rectangles with ENFORCED grid boundaries - MEMOIZED to prevent infinite loop
  // Grid is EXACTLY [31:175] - 31 columns, 175 rows
  // Each rectangle is EXACTLY 40px wide (x) and 4px tall (y)
  // Coordinate system: [0,0] at bottom-left, X-axis right, Y-axis up
  const rectangles = useMemo(() => {
    const rects = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // ENFORCED positioning - exact grid alignment
        // x: col * 40 (exact 40px spacing) - X-axis on bottom
        // y: (rows - 1 - row) * 4 (exact 4px spacing) - Y-axis on left
        const x = col * rectWidth;  // EXACT: col * 40 (X-axis: left to right)
        const y = verticalOffset + (rows - 1 - row) * rectHeight;  // Y-axis: bottom to top
        
        // Matrix coordinates: [row+1, col+1] (1-indexed)
        // ENFORCED boundaries: [1,1] to [rows,31]
        const matrixRow = row + 1;  // 1 to 175
        const matrixCol = col + 1;  // 1 to 31
        
        // Validate matrix coordinates
        if (matrixRow < 1 || matrixRow > rows) throw new Error(`Invalid row: ${matrixRow}`);
        if (matrixCol < 1 || matrixCol > 31) throw new Error(`Invalid column: ${matrixCol}`);
        
        rects.push({
          id: `rect-${row}-${col}`,
          x,  // EXACT x position
          y,  // EXACT y position
          width: rectWidth,   // EXACT: 40px
          height: rectHeight, // EXACT: 4px
          row,
          col,
          matrixRow,
          matrixCol,
          matrixCoords: `[${matrixRow},${matrixCol}]`
        });
      }
    }
    return rects;
  }, [rows, columns, rectWidth, rectHeight, verticalOffset]);

  const centerPulseCell = useMemo(() => {
    const matrixRow = Math.max(1, Math.round(rows / 2));
    const matrixCol = Math.max(1, Math.round(columns / 2));

    const x = (matrixCol - 1) * rectWidth;
    const y = verticalOffset + (rows - matrixRow) * rectHeight;

    return {
      x,
      y,
      width: rectWidth,
      height: rectHeight
    };
  }, [rows, columns, rectWidth, rectHeight, verticalOffset]);

  // Format entity response message
  const formatEntityResponse = (result: any): string => {
    // Check for projects first
    const createdProjects = result.entitiesCreated?.projects || [];
    if (createdProjects.length > 0) {
      const project = createdProjects[0];
      const projectName = project.projectName || 'Unknown';
      const location = project.location;
      const locationStr = location 
        ? `${location.city || 'Unknown City'}, ${location.country || 'Unknown Country'}`
        : 'Unknown Location';
      return `new project added - ${projectName}, ${locationStr}`;
    }
    
    // Then check for offices
    const createdOffices = result.entitiesCreated?.offices || [];
    const mergedOffices = result.entitiesCreated?.mergedOffices || [];
    
    if (mergedOffices.length > 0) {
      const office = mergedOffices[0];
      const officeName = office.name || 'Unknown';
      const officeId = office.id || 'Unknown';
      return `office merged - ${officeName} ${officeId}`;
    } else if (createdOffices.length > 0) {
      const office = createdOffices[0];
      const officeName = office.name || 'Unknown';
      const officeId = office.id || 'Unknown';
      return `office added - ${officeName} ${officeId}`;
    } else {
      return `NOTE CREATED SUCCESSFULLY!`;
    }
  };

  // Handle note creation
  const handleNoteCreation = async (noteContent: string) => {
    setIsThinking(true);
    try {
      if (!noteContent || noteContent.trim() === '') {
        setAiResponse('ERROR: Please provide note content.\n\nExample: New office in Tokyo with 50 employees');
        return;
      }

      // Check if note starts with "/" - if so, create meditation directly without AI analysis
      const trimmedContent = noteContent.trim();
      if (trimmedContent.startsWith('/')) {
        const meditationText = trimmedContent.substring(1).trim();
        if (!meditationText) {
          setAiResponse('ERROR: Please provide text after "/" to create a meditation.');
          return;
        }

        // Import necessary services
        const { firestoreOperations } = await import('../renderer/src/services/firebase/firestoreOperations');
        const { Timestamp } = await import('firebase/firestore');

        // Create meditation directly (ID will be auto-generated as {number}-{DDMMYYYY})
        const now = Timestamp.now();
        const meditationData = {
          text: meditationText,
          createdAt: now,
          updatedAt: now
        };

        const result = await firestoreOperations.create('meditations', meditationData);

        if (result.success) {
          setAiResponse(`Meditation created successfully: "${meditationText}"`);
        } else {
          setAiResponse(`ERROR: Failed to create meditation: ${result.error}`);
        }
        return;
      }

      const { ClaudeAIService } = await import('../renderer/src/services/claudeAIService');
      const claudeAI = ClaudeAIService.getInstance();
      claudeAI.setApiKey(claudeApiKey); // Set API key for note service

      // First, analyze the text to check for missing location data
      const aiResult = await claudeAI.analyzeText(noteContent);
      
      // Check if it's an office and if location is missing
      if (aiResult.categorization.category === 'office' && aiResult.extraction.extractedData) {
        const officeData = aiResult.extraction.extractedData as any;
        const city = officeData.location?.headquarters?.city;
        const country = officeData.location?.headquarters?.country;
        const hasLocation = city && country && 
                           city.toLowerCase() !== 'unknown' && 
                           country.toLowerCase() !== 'unknown';
        
        if (!hasLocation) {
          // Store the office data and prompt for location
          setLocationPrompt({
            active: true,
            officeData: officeData
          });
          setAiResponse(`Office identified: ${officeData.name || 'Unknown'}\n\nPlease provide the office location:`);
          return;
        }
      }

      // If we have location or it's not an office, proceed with normal processing
      const result = await noteService.processNoteWithoutWebSearch(noteContent);
      
      if (result.success) {
        setAiResponse(formatEntityResponse(result));
      } else {
        setAiResponse(`ERROR: ${result.summary || 'Failed to process note'}`);
      }
    } catch (error) {
      console.error('Note creation error:', error);
      setAiResponse(`ERROR: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsThinking(false);
    }
  };

  // Handle location input
  const handleLocationInput = async (locationInput: string) => {
    setIsThinking(true);
    try {
      if (!locationInput || locationInput.trim() === '') {
        setAiResponse('ERROR: Please provide office location.');
        return;
      }

      if (locationInput.toLowerCase() === 'cancel') {
        setLocationPrompt(null);
        setAiResponse('Note creation cancelled.');
        return;
      }

      // Use Claude AI to intelligently parse the location input
      const { ClaudeAIService } = await import('../renderer/src/services/claudeAIService');
      const claudeAI = ClaudeAIService.getInstance();
      claudeAI.setApiKey(claudeApiKey);

      // Ask Claude to extract city and country from the input
      const locationPromptText = `Extract the city and country from this location input: "${locationInput}"

Return a JSON object with this exact format:
{
  "city": "extracted city name",
  "country": "extracted country name"
}

If only a city is provided (like "Barcelona"), infer the country (Barcelona -> Spain).
Be intelligent and use common knowledge about world cities.

Example inputs and expected outputs:
- "Barcelona" -> {"city": "Barcelona", "country": "Spain"}
- "Madrid, Spain" -> {"city": "Madrid", "country": "Spain"}
- "New York" -> {"city": "New York", "country": "United States"}
- "Tokyo" -> {"city": "Tokyo", "country": "Japan"}`;

      const locationResponse = await claudeAI.analyzeText(locationPromptText);
      
      if (!locationResponse.extraction.extractedData) {
        setAiResponse('ERROR: Could not parse location. Please try again with format: city, country');
        return;
      }

      const locationData = locationResponse.extraction.extractedData as any;
      const city = locationData.city || locationInput.trim();
      const country = locationData.country || 'Unknown';

      // Update the pending office data with location
      const updatedOfficeData = {
        ...locationPrompt?.officeData,
        location: {
          headquarters: {
            city: city,
            country: country
          },
          otherOffices: []
        }
      };

      // Create a new note content with location information
      const noteWithLocation = `${locationPrompt?.officeData?.name || 'Office'} located in ${city}, ${country}. ${JSON.stringify(updatedOfficeData)}`;
      
      const result = await noteService.processNoteWithoutWebSearch(noteWithLocation);
      
      // Reset states
      setLocationPrompt(null);
      
      if (result.success) {
        setAiResponse(formatEntityResponse(result));
      } else {
        setAiResponse(`ERROR: ${result.summary || 'Failed to process office with location'}`);
      }
    } catch (error) {
      console.error('Location input error:', error);
      setAiResponse(`ERROR: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsThinking(false);
    }
  };


  // Handle action approval/rejection (Gen 2)
  const handleApproveAction = async (actionId: string) => {
    const updatedActions = await orchestraGen2.approveAction(actionId, actionPlans);
    setActionPlans(updatedActions);
  };

  const handleRejectAction = async (actionId: string) => {
    const updatedActions = await orchestraGen2.rejectAction(actionId, actionPlans);
    setActionPlans(updatedActions);
  };

  const handleApproveAll = async () => {
    setAiResponse('EXECUTING ACTIONS...');
    const approvedActions = await orchestraGen2.approveAllActions(actionPlans);
    const executedActions = await orchestraGen2.executeActions(approvedActions);
    setActionPlans(executedActions);
    
    // Build result message
    const successfulActions = executedActions.filter(a => a.status === 'completed');
    const failedActions = executedActions.filter(a => a.status === 'failed');
    
    let message = '';
    if (successfulActions.length > 0) {
      message += `Completed ${successfulActions.length} action(s):\n`;
      message += successfulActions.map(a => `✓ ${a.result?.message}`).join('\n');
    }
    if (failedActions.length > 0) {
      message += `\n\nFailed ${failedActions.length} action(s):\n`;
      message += failedActions.map(a => `✗ ${a.toolName}: ${a.result?.error}`).join('\n');
    }
    
    setAiResponse(message);
    setShowActionApproval(false);
  };

  const handleExecuteApproved = async () => {
    setAiResponse('EXECUTING ACTIONS...');
    const executedActions = await orchestraGen2.executeActions(actionPlans);
    setActionPlans(executedActions);
    
    // Build result message
    const successfulActions = executedActions.filter(a => a.status === 'completed');
    const failedActions = executedActions.filter(a => a.status === 'failed');
    
    let message = '';
    if (successfulActions.length > 0) {
      message += `Completed ${successfulActions.length} action(s):\n`;
      message += successfulActions.map(a => `✓ ${a.result?.message}`).join('\n');
    }
    if (failedActions.length > 0) {
      message += `\n\nFailed ${failedActions.length} action(s):\n`;
      message += failedActions.map(a => `✗ ${a.toolName}: ${a.result?.error}`).join('\n');
    }
    
    setAiResponse(message);
    setShowActionApproval(false);
  };

  const handleCancelActions = () => {
    setActionPlans([]);
    setShowActionApproval(false);
    setAiResponse('Actions cancelled');
  };

  // Handle command from TextBoxComponent
  const handleCommand = async (command: string) => {
    const trimmedCommand = command.trim();
    const lowerCommand = trimmedCommand.toLowerCase();

    try {
      // Early return by mode: Check isNoteMode first
      if (isNoteMode) {
        setAiResponse('');
        await handleNoteCreation(trimmedCommand);
        setIsNoteMode(false);
        return;
      }

      // Early return by mode: Check isLocationPrompt second
      if (locationPrompt?.active) {
        setAiResponse('');
        await handleLocationInput(trimmedCommand);
        return;
      }

      // Then handle commands: Check for mode toggle commands
      if (lowerCommand === 'add note') {
        setIsNoteMode(true);
        setIsThinking(false);
        setAiResponse('Enter your note content and press Enter to analyze and save.');
        return;
      }

      // Check for reset command to clear AI response
      if (lowerCommand === 'reset' || lowerCommand === 'clear') {
        setIsThinking(false);
        setAiResponse('');
        return;
      }

      // Gen 2 Orchestra - AI with full app control
      setAiResponse('');
      setIsThinking(true);

      // Set API key for Gen 2 Orchestra
      orchestraGen2.setApiKey(claudeApiKey);

      // Process input with Gen 2 Orchestra
      const response = await orchestraGen2.processInput(trimmedCommand);

      if (response.type === 'error') {
        setAiResponse(`ERROR: ${response.error || response.message}`);
        return;
      }

      if (response.type === 'actions' && response.actions) {
        // Show actions for approval
        setActionPlans(response.actions);
        setShowActionApproval(true);
        setAiResponse(response.message);
        return;
      }

      if (response.type === 'text') {
        setAiResponse(response.textResponse || response.message);
        return;
      }

      setAiResponse(response.message);
    } catch (error) {
      setAiResponse(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsThinking(false);
    }
  };

  // Initialize PageEngine and register states
  useEffect(() => {
    // Initialize PageEngine
    pageEngine.initialize();
    
    // Register Shift+S state
    pageEngine.registerState({
      id: 'shift-s-mode',
      name: 'Shift+S Mode',
      keyCombination: 'Shift+S',
      description: 'Toggle Shift+S mode for special functionality',
      onActivate: () => {
        setIsShiftSActive(true);
      },
      onDeactivate: () => {
        setIsShiftSActive(false);
      }
    });

    // Cleanup on unmount
    return () => {
      pageEngine.destroy();
    };
  }, []);

  // Check Claude API status on mount and periodically
  useEffect(() => {
    // Initial check
    checkClaudeApiStatus();
    
    // Check every 2 minutes (120000ms)
    const interval = setInterval(checkClaudeApiStatus, 120000);
    
    return () => clearInterval(interval);
  }, [claudeApiKey]);


  // Persistent scraper polling effect - ONLY show current session
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    const pollScrapers = async () => {
      try {
        const { OfficeScraperService } = await import('../scraper/officeScraperService.ts');
        const officeScraperService = OfficeScraperService.getInstance();
        
        // ONLY handle current session if it exists - don't show past sessions
        if (scraper?.sessionId) {
          const session = officeScraperService.getSessionStatus(scraper.sessionId);
          if (session) {
            if (session.status === 'completed' && session.results) {
              const duration = scraper.startTime ? Math.floor((Date.now() - scraper.startTime) / 1000) : 0;
              const minutes = Math.floor(duration / 60);
              const seconds = duration % 60;
              const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
              
              const resultText = `SCRAPER COMPLETED\n\n` +
                `OFFICES FOUND: ${session.results.totalFound}\n` +
                `DURATION: ${timeStr}\n` +
                `LOCATION: ${scraper.location}\n` +
                `RADIUS: ${scraper.radius / 1000}km`;
              
              if (session.stats) {
                const resultTextWithStats = resultText + 
                  `\n\nSAVED: ${session.stats.successfullySaved}\n` +
                  `MERGED: ${session.stats.duplicatesMerged}\n` +
                  `FAILED: ${session.stats.failedToSave}`;
                setScraper({
                  ...scraper,
                  results: resultTextWithStats
                });
              } else {
                setScraper({
                  ...scraper,
                  results: resultText
                });
              }
              
              // Clear current session state
              setScraper(null);
            } else if (session.status === 'failed') {
              setScraper({
                ...scraper,
                results: `SCRAPER FAILED\n\nERROR: ${session.results?.error || 'Unknown error'}`
              });
              
              // Clear current session state
              setScraper(null);
            } else if (session.status === 'in_progress' || session.status === 'pending') {
              // Show progress for active session
              const elapsed = scraper.startTime ? Math.floor((Date.now() - scraper.startTime) / 1000) : 0;
              const minutes = Math.floor(elapsed / 60);
              const seconds = elapsed % 60;
              const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
              
              const progressText = `SCRAPER RUNNING\n\n` +
                `LOCATION: ${scraper.location}\n` +
                `RADIUS: ${scraper.radius / 1000}km\n` +
                `STATUS: ${session.status}\n` +
                `ELAPSED: ${timeStr}`;
              
              setScraper({
                ...scraper,
                results: progressText
              });
            }
          } else {
            // Session not found - might have been cleared
            setScraper(null);
          }
        }
      } catch (error) {
        console.error('Error polling scraper status:', error);
      }
    };
    
    // Poll every 2 seconds
    interval = setInterval(pollScrapers, 2000);
    
    // Initial poll
    pollScrapers();
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [scraper?.sessionId, scraper?.startTime, scraper?.location, scraper?.radius]);

  return (
    <div 
      className={className}
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
      }}
    >
      {/* Grid Background */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        {rectangles.map((rect) => {
          // Use consistent grid color for all grid lines
          const strokeColor = '#333333'; // Standard grid color

          return (
            <rect
              key={rect.id}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.5"
              opacity={1}
            />
          );
        })}

        {isShiftSActive && isThinking && !showActionApproval && (
          <rect
            key="ai-orchestra-pulse"
            x={centerPulseCell.x}
            y={centerPulseCell.y}
            width={centerPulseCell.width}
            height={centerPulseCell.height}
            fill="#C8EDFC"
            className="ai-orchestra-pulse-cell"
          />
        )}
        
        {/* Blue rectangle at [10, 2] when Shift+S is active */}
        {isShiftSActive && (() => {
          const position = positionCalculator.getPosition(10, 2);
          return (
            <rect
              key="shift-s-indicator"
              x={position.screenX}
              y={position.screenY}
              width={position.width}
              height={position.height}
              fill="#C8EDFC"
              opacity={1}
            />
          );
        })()}

        {/* Claude API Status indicator at x=2, y=160 - only show when API is not working */}
        {claudeApiStatus === 'error' && (() => {
          const position = positionCalculator.getPosition(160, 2);
          
          return (
            <rect
              key="claude-api-status"
              x={position.screenX}
              y={position.screenY}
              width={position.width}
              height={position.height}
              fill="#FF6B6B"
              opacity={1}
            />
          );
        })()}
      </svg>

      {/* TextBoxComponent appears in left side bottom corner when Shift+S is active */}
      {isShiftSActive && (
        <TextBoxComponent
          startRow={9}       // Moved up 5 more rows (4 + 5 = 9)
          startCol={2}       // Moved left 2 columns (4 - 2 = 2)
          text=""
          backgroundColor="transparent"
          textColor="#C8EDFC"
          textAlign="left"
          width={6}          // 6 columns wide
          borderWidth={0}
          onCommand={handleCommand}
          style={{ zIndex: 10 }}
        />
      )}

      {/* DisplayWindow: Prompt results and scraper results */}
      {isShiftSActive && !showActionApproval && (
        <DisplayBoxComponent
          startRow={25}         // Moved up further (row 1 is bottom, so row 25 is much higher up)
          startCol={22}         // Right side (31 - 10 + 1 = 22)
          text={aiResponse || scraper?.results || ''}
          backgroundColor="transparent"
          textColor="#C8EDFC"
          textAlign="left"
          width={10}            // 10 columns wide
          height={24}           // 24 rows tall (doubled from 12)
          borderWidth={0}
          style={{ zIndex: 10 }}
        />
      )}

      {/* Action Approval UI - Simple text like Gen 1 */}
      {isShiftSActive && showActionApproval && actionPlans.length > 0 && (() => {
        const position = positionCalculator.getPosition(35, 22); // Moved higher up (from 25 to 35)
        
        // Build simple text display
        let displayText = 'Actions to Perform:\n\n';
        
        actionPlans.forEach((action, index) => {
          displayText += `${index + 1}. ${action.toolName}`;
          if (action.requiresApproval) displayText += ' [REQUIRES APPROVAL]';
          if (action.destructive) displayText += ' [DESTRUCTIVE]';
          displayText += '\n';
          displayText += `   ${action.toolDescription}\n`;
          displayText += `   Status: ${action.status.toUpperCase()}\n`;
          
          if (action.requiresApproval && action.status === 'pending') {
            displayText += `   `;
          }
          displayText += '\n';
        });
        
        displayText += '\n';
        
        return (
          <div
            style={{
              position: 'absolute',
              left: position.screenX,
              top: position.screenY,
              width: 400,
              maxHeight: 700,
              backgroundColor: 'transparent',
              padding: '0px',
              zIndex: 20,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
              fontSize: '11px',
              color: '#C8EDFC',
              whiteSpace: 'pre-wrap',
              overflowY: 'auto',
              lineHeight: '1.4'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              {displayText}
            </div>
            
            {/* Clickable text actions */}
            <div style={{ marginTop: '8px' }}>
              <span
                onClick={handleApproveAll}
                style={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  marginRight: '16px'
                }}
              >
                Approve All & Execute
              </span>
              <span
                onClick={handleExecuteApproved}
                style={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  marginRight: '16px'
                }}
              >
                Execute Approved
              </span>
              <span
                onClick={handleCancelActions}
                style={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  color: '#FF6B6B'
                }}
              >
                Cancel
              </span>
            </div>
            
            {/* Individual action approvals */}
            {actionPlans.some(a => a.requiresApproval && a.status === 'pending') && (
              <div style={{ marginTop: '16px' }}>
                {actionPlans.map((action, index) => (
                  action.requiresApproval && action.status === 'pending' && (
                    <div key={action.id} style={{ marginBottom: '4px' }}>
                      <span style={{ marginRight: '8px' }}>Action {index + 1}:</span>
                      <span
                        onClick={() => handleApproveAction(action.id)}
                        style={{
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          marginRight: '12px',
                          color: '#4CAF50'
                        }}
                      >
                        Approve
                      </span>
                      <span
                        onClick={() => handleRejectAction(action.id)}
                        style={{
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          color: '#FF6B6B'
                        }}
                      >
                        Reject
                      </span>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        );
      })()}

      
    </div>
  );
};

export default Cross;
