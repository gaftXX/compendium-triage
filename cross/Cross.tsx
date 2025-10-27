import React, { useState, useEffect, useMemo } from 'react';
import { PageEngine } from './engine/PageEngine';
import { TextBoxComponent } from './multiRectangleComponents/TextBoxComponent';
import { DisplayBoxComponent } from './multiRectangleComponents/DisplayBoxComponent';
import { Orchestra } from '../orchestra/aiOrchestra';
import { navigationService } from '../renderer/src/services/navigation/navigationService';
import { PositionCalculator } from './positionCalculator/PositionCalculator';
import { IndependentNoteService } from '../noteSystem/independentNoteService';

interface CrossProps {
  className?: string;
}

export const Cross: React.FC<CrossProps> = ({ className }) => {
  // State management using PageEngine
  const [isShiftSActive, setIsShiftSActive] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [pendingWebSearch, setPendingWebSearch] = useState<string | null>(null);
  const [isNoteMode, setIsNoteMode] = useState(false); // New state for note mode
  const [isLocationPrompt, setIsLocationPrompt] = useState(false); // State for location prompt
  const [pendingOfficeData, setPendingOfficeData] = useState<any>(null); // Store office data while waiting for location
  
  // Memoized instances to prevent recreation on every render
  const pageEngine = useMemo(() => PageEngine.getInstance(), []);
  const orchestra = useMemo(() => Orchestra.getInstance(), []);
  const positionCalculator = useMemo(() => new PositionCalculator(), []);
  const noteService = useMemo(() => IndependentNoteService.getInstance(), []);

  // Get API key from environment
  const claudeApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  console.log('🔍 Cross component - Claude API key available:', !!claudeApiKey);

  // Hotkeys are owned by PageEngine
  // Grid: 31 columns, dynamic rows to fill window height with 4px cells
  // Rectangle dimensions: 40px width (x), 4px height (y)
  // Global text rule: All text is 10px, ALL CAPS, and normal weight
  const rectWidth = 40;
  const rectHeight = 4;
  const globalTextSize = 10;
  const globalTextWeight = 'normal';
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

  // Handle note creation
  const handleNoteCreation = async (noteContent: string) => {
    try {
      if (!noteContent || noteContent.trim() === '') {
        setAiResponse('ERROR: Please provide note content.\n\nExample: New office in Tokyo with 50 employees');
        return;
      }

      const { ClaudeAIService } = await import('../noteSystem/claudeAIService');
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
          setPendingOfficeData(officeData);
          setIsLocationPrompt(true);
          setAiResponse(`Office identified: ${officeData.name || 'Unknown'}\n\nPlease provide the office location:`);
          return;
        }
      }

      // If we have location or it's not an office, proceed with normal processing
      const result = await noteService.processNoteWithoutWebSearch(noteContent);
      
      if (result.success) {
        // Check for projects first
        const createdProjects = result.entitiesCreated.projects || [];
        if (createdProjects.length > 0) {
          const project = createdProjects[0];
          const projectName = project.projectName || 'Unknown';
          const location = project.location;
          const locationStr = location 
            ? `${location.city || 'Unknown City'}, ${location.country || 'Unknown Country'}`
            : 'Unknown Location';
          setAiResponse(`new project added - ${projectName}, ${locationStr}`);
          return;
        }
        
        // Then check for offices
        const createdOffices = result.entitiesCreated.offices || [];
        const mergedOffices = result.entitiesCreated.mergedOffices || [];
        const allOffices = [...createdOffices, ...mergedOffices];
        
        if (allOffices.length > 0) {
          const office = allOffices[0];
          const officeName = office.name || 'Unknown';
          const officeId = office.id || 'Unknown';
          setAiResponse(`office added - ${officeName} ${officeId}`);
        } else {
          setAiResponse(`✅ NOTE CREATED SUCCESSFULLY!`);
        }
      } else {
        setAiResponse(`❌ ERROR: ${result.summary || 'Failed to process note'}`);
      }
    } catch (error) {
      console.error('Note creation error:', error);
      setAiResponse(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
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
        setIsLocationPrompt(false);
        setPendingOfficeData(null);
        setAiResponse('❌ Note creation cancelled.');
        return;
      }

      // Use Claude AI to intelligently parse the location input
      const { ClaudeAIService } = await import('../noteSystem/claudeAIService');
      const claudeAI = ClaudeAIService.getInstance();
      claudeAI.setApiKey(claudeApiKey);

      setAiResponse('THINKING...');

      // Ask Claude to extract city and country from the input
      const locationPrompt = `Extract the city and country from this location input: "${locationInput}"

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

      const locationResponse = await claudeAI.analyzeText(locationPrompt);
      
      if (!locationResponse.extraction.extractedData) {
        setAiResponse('ERROR: Could not parse location. Please try again with format: city, country');
        return;
      }

      const locationData = locationResponse.extraction.extractedData as any;
      const city = locationData.city || locationInput.trim();
      const country = locationData.country || 'Unknown';

      // Update the pending office data with location
      const updatedOfficeData = {
        ...pendingOfficeData,
        location: {
          headquarters: {
            city: city,
            country: country
          },
          otherOffices: []
        }
      };

      // Create a new note content with location information
      const noteWithLocation = `${pendingOfficeData.name || 'Office'} located in ${city}, ${country}. ${JSON.stringify(updatedOfficeData)}`;
      
      const result = await noteService.processNoteWithoutWebSearch(noteWithLocation);
      
      // Reset states
      setIsLocationPrompt(false);
      setPendingOfficeData(null);
      
      if (result.success) {
        // Check for projects first
        const createdProjects = result.entitiesCreated.projects || [];
        if (createdProjects.length > 0) {
          const project = createdProjects[0];
          const projectName = project.projectName || 'Unknown';
          const location = project.location;
          const locationStr = location 
            ? `${location.city || 'Unknown City'}, ${location.country || 'Unknown Country'}`
            : 'Unknown Location';
          setAiResponse(`new project added - ${projectName}, ${locationStr}`);
          return;
        }
        
        // Then check for offices
        const createdOffices = result.entitiesCreated.offices || [];
        const mergedOffices = result.entitiesCreated.mergedOffices || [];
        const allOffices = [...createdOffices, ...mergedOffices];
        
        if (allOffices.length > 0) {
          const office = allOffices[0];
          const officeName = office.name || 'Unknown';
          const officeId = office.id || 'Unknown';
          setAiResponse(`office added - ${officeName} ${officeId}`);
        } else {
          setAiResponse(`✅ NOTE CREATED SUCCESSFULLY!`);
        }
      } else {
        setAiResponse(`❌ ERROR: ${result.summary || 'Failed to process office with location'}`);
      }
    } catch (error) {
      console.error('Location input error:', error);
      setAiResponse(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  };

  // Handle command from TextBoxComponent
  const handleCommand = async (command: string) => {
    console.log('🤖 Processing command:', command);
    
    // Immediately replace any existing text with THINKING...
    setAiResponse('THINKING...');
    
    try {
      // Check for note mode commands
      if (command.toLowerCase() === 'add note') {
        setIsNoteMode(true);
        setAiResponse('Enter your note content and press Enter to analyze and save.');
        return;
      }

      if (isNoteMode) {
        if (command.toLowerCase() === 'cancel' || command.toLowerCase() === 'exit') {
          setIsNoteMode(false);
          setAiResponse('❌ Note mode cancelled. You can now type regular commands.');
          return;
        }
        await handleNoteCreation(command);
        setIsNoteMode(false);
        return;
      }

      // Handle location prompt
      if (isLocationPrompt) {
        await handleLocationInput(command);
        return;
      }

      // Set the API key before processing
      orchestra.setApiKey(claudeApiKey);
      
      const response = await orchestra.processInput(command);
      console.log('🔍 Orchestra Response received:', response);
      
      if (response.success) {
        console.log('🔍 Setting response:', response.message);
        
        // Check if this is a navigation action
        if (response.action && response.action.type === 'navigate') {
          console.log('🎯 Navigation action detected:', response.action);
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
            default:
              console.log('Unknown navigation target:', target);
              setAiResponse(`Unknown navigation target: ${target}`);
          }
        }
        // Check if this is a web search request
        else if (response.needsWebSearch && response.searchQuery) {
          setPendingWebSearch(response.searchQuery);
          setAiResponse(`I need to search the web for current information about: ${response.searchQuery}\n\nType "yes" to search the web, or "no" to skip.`);
        } else {
          // Regular response
          setAiResponse(response.message);
          setPendingWebSearch(null); // Clear any pending search
        }
      } else {
        console.log('🔍 Orchestra Error:', response.error);
        // Replace THINKING... with error message
        setAiResponse(`ERROR: ${response.error || 'Unknown error'}`);
        setPendingWebSearch(null); // Clear any pending search
      }
    } catch (error) {
      // Replace THINKING... with error message
      setAiResponse(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPendingWebSearch(null); // Clear any pending search
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
        console.log('onActivate called - setting state to true');
        setIsShiftSActive(true);
        console.log('Shift+S Mode ACTIVATED');
      },
      onDeactivate: () => {
        console.log('onDeactivate called - setting state to false');
        setIsShiftSActive(false);
        console.log('Shift+S Mode DEACTIVATED');
      }
    });

    // Cleanup on unmount
    return () => {
      pageEngine.destroy();
    };
  }, []);

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

      {/* DisplayBoxComponent appears in bottom right corner when Shift+S is active */}
      {isShiftSActive && (
        <DisplayBoxComponent
          startRow={25}         // Moved up further (row 1 is bottom, so row 25 is much higher up)
          startCol={22}         // Right side (31 - 10 + 1 = 22)
          text={aiResponse}
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
