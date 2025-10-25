import React, { useState, useEffect } from 'react';
import { PageEngine } from './engine/PageEngine';
import { TextBoxComponent } from './multiRectangleComponents/TextBoxComponent';
import { DisplayBoxComponent } from './multiRectangleComponents/DisplayBoxComponent';
import { Orchestra } from '../orchestra/aiOrchestra';
import { navigationService } from '../renderer/src/services/navigation/navigationService';
import { PositionCalculator } from './positionCalculator/PositionCalculator';

interface CrossProps {
  className?: string;
}

export const Cross: React.FC<CrossProps> = ({ className }) => {
  // State management using PageEngine
  const [isShiftSActive, setIsShiftSActive] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [pendingWebSearch, setPendingWebSearch] = useState<string | null>(null);
  const pageEngine = PageEngine.getInstance();
  const orchestra = Orchestra.getInstance();
  const positionCalculator = new PositionCalculator();

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
  
  // Generate rectangles with ENFORCED grid boundaries
  // Grid is EXACTLY [31:175] - 31 columns, 175 rows
  // Each rectangle is EXACTLY 40px wide (x) and 4px tall (y)
  // Coordinate system: [0,0] at bottom-left, X-axis right, Y-axis up
  const rectangles = [];
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
      
      rectangles.push({
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

  // Handle command from TextBoxComponent
  const handleCommand = async (command: string) => {
    console.log('🤖 Processing command:', command);
    
    // Immediately replace any existing text with THINKING...
    setAiResponse('THINKING...');
    
    try {
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
