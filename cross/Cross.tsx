import React, { useState, useEffect, useMemo } from 'react';
import { PageEngine } from './engine/PageEngine';
import { TextBoxComponent } from './multiRectangleComponents/TextBoxComponent';
import { DisplayBoxComponent } from './multiRectangleComponents/DisplayBoxComponent';
import { Orchestra } from '../renderer/src/services/aiOrchestra';
import { navigationService } from '../renderer/src/services/navigation/navigationService';
import { PositionCalculator } from './positionCalculator/PositionCalculator';
import { IndependentNoteService } from '../noteSystem/independentNoteService.ts';

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
  
  // Scraper session tracking
  const [scraper, setScraper] = useState<{
    sessionId: string | null;
    startTime: number | null;
    location: string;
    radius: number;
    results: string;
  } | null>(null);
  const [claudeApiStatus, setClaudeApiStatus] = useState<'working' | 'error'>('error');
  
  // Memoized instances to prevent recreation on every render
  const pageEngine = useMemo(() => PageEngine.getInstance(), []);
  const orchestra = useMemo(() => Orchestra.getInstance(), []);
  const positionCalculator = useMemo(() => new PositionCalculator(), []);
  const noteService = useMemo(() => IndependentNoteService.getInstance(), []);

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
    try {
      if (!noteContent || noteContent.trim() === '') {
        setAiResponse('ERROR: Please provide note content.\n\nExample: New office in Tokyo with 50 employees');
        return;
      }

      // Check if note starts with "/" - if so, create record directly without AI analysis
      const trimmedContent = noteContent.trim();
      if (trimmedContent.startsWith('/')) {
        const recordText = trimmedContent.substring(1).trim();
        if (!recordText) {
          setAiResponse('ERROR: Please provide text after "/" to create a record.');
          return;
        }

        // Import necessary services
        const { firestoreOperations } = await import('../renderer/src/services/firebase/firestoreOperations');
        const { Timestamp } = await import('firebase/firestore');

        // Create record directly (ID will be auto-generated as {number}-{DDMMYYYY})
        const now = Timestamp.now();
        const recordData = {
          text: recordText,
          createdAt: now,
          updatedAt: now
        };

        const result = await firestoreOperations.create('records', recordData);

        if (result.success) {
          setAiResponse(`Record created successfully: "${recordText}"`);
        } else {
          setAiResponse(`ERROR: Failed to create record: ${result.error}`);
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
    }
  };

  // Handle location input
  const handleLocationInput = async (locationInput: string) => {
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

      setAiResponse('THINKING...');

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
    }
  };

  // Handle command from TextBoxComponent
  const handleCommand = async (command: string) => {
    try {
      // Early return by mode: Check isNoteMode first
      if (isNoteMode) {
        setAiResponse('THINKING...');
        await handleNoteCreation(command);
        setIsNoteMode(false);
        return;
      }

      // Early return by mode: Check isLocationPrompt second
      if (locationPrompt?.active) {
        setAiResponse('THINKING...');
        await handleLocationInput(command);
        return;
      }

      // Then handle commands: Check for mode toggle commands
      if (command.toLowerCase() === 'add note') {
        setIsNoteMode(true);
        setAiResponse('Enter your note content and press Enter to analyze and save.');
        return;
      }

      // Check for reset command to clear AI response
      if (command.toLowerCase() === 'reset' || command.toLowerCase() === 'clear') {
        setAiResponse('');
        return;
      }

      // Handle regular commands with orchestra
      setAiResponse('THINKING...');
      
      // Set the API keys before processing
      orchestra.setApiKey(claudeApiKey);
      
      // Initialize Google Places API key for office scraping
      if (googlePlacesApiKey) {
        const { OfficeScraperService } = await import('../scraper/officeScraperService.ts');
        const officeScraperService = OfficeScraperService.getInstance();
        officeScraperService.setGooglePlacesApiKey(googlePlacesApiKey);
      }
      
      const response = await orchestra.processInput(command);
      
      if (response.success) {
        // Check if this is a navigation action
        if (response.action && response.action.type === 'navigate') {
          setAiResponse(response.message);
          
          // Handle navigation action using navigation service
          const target = response.action.target;
          switch (target) {
            case 'offices-list':
              navigationService.navigateToOffices();
              break;
            case 'projects-list':
              navigationService.navigateToProjects();
              break;
            case 'regulatory-list':
              navigationService.navigateToRegulatory();
              break;
            case 'map':
              navigationService.navigateToMap();
              break;
            case 'records-list':
              navigationService.navigateToRecords();
              break;
            default:
              setAiResponse(`Unknown navigation target: ${target}`);
          }
        }
        // Check if this is a web search request
        else if (response.needsWebSearch && response.searchQuery) {
          setAiResponse(`I need to search the web for current information about: ${response.searchQuery}\n\nType "yes" to search the web, or "no" to skip.`);
        }
        // Check if this is an office scraping request
        else if (response.needsOfficeScrape && response.scrapePrompt) {
          setAiResponse(response.message);
        }
        // Check if this is a scraper start command with session ID
        else if (response.sessionId && command.toLowerCase().trim() === 'start scraper') {
          setAiResponse('');
          
          // Get location and radius from the last scrape prompt
          const lastPrompt = orchestra.getLastScrapePrompt();
          const location = lastPrompt?.location || 'Unknown';
          const radius = lastPrompt?.radius || 5000;
          
          // Start the scraper session tracking (persistent)
          setScraper({
            sessionId: response.sessionId,
            startTime: Date.now(),
            location: location,
            radius: radius,
            results: `SCRAPER STARTED\n\nLOCATION: ${location}\nRADIUS: ${radius / 1000}km\n\nELAPSED: 0s`
          });
        } else {
          // Regular response
          setAiResponse(response.message);
        }
      } else {
        setAiResponse(`ERROR: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      setAiResponse(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      {isShiftSActive && (
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

      
    </div>
  );
};

export default Cross;
