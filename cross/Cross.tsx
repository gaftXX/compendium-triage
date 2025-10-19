import React, { useEffect, useState } from 'react';
import { AnimationTrigger } from './animations/onLoad';
import { ColorEngine } from './colorEngine';

interface CrossProps {
  className?: string;
}

export const Cross: React.FC<CrossProps> = ({ className }) => {
  const [animationFrames, setAnimationFrames] = useState<any[]>([]);
  const [colorEngine] = useState(() => new ColorEngine());

  // Start onload animation when component mounts (app start/reload)
  useEffect(() => {
    // Trigger animation when app starts or reloads
    AnimationTrigger.startOnLoadAnimation();

    // Listen to animation frames
    const handleAnimationFrames = (frames: any[]) => {
      setAnimationFrames(frames);
    };

    AnimationTrigger.addAnimationListener(handleAnimationFrames);

    // Cleanup
    return () => {
      AnimationTrigger.removeAnimationListener(handleAnimationFrames);
    };
  }, []);
  // ENFORCED GRID BOUNDARIES
  // Grid is strictly limited to [25:88] - 25 columns, 88 rows
  // Rectangle dimensions: 48px width (x), 8px height (y)
  // NO rectangles can exist outside these exact boundaries
  
  const rectWidth = 48;  // EXACT x dimension
  const rectHeight = 8;  // EXACT y dimension
  const columns = 25;     // ENFORCED: Maximum 25 columns
  const rows = 88;        // ENFORCED: Maximum 88 rows
  
  // Validate grid boundaries
  if (columns > 25) throw new Error('Grid cannot exceed 25 columns');
  if (rows > 88) throw new Error('Grid cannot exceed 88 rows');
  
  // Generate rectangles with ENFORCED grid boundaries
  // Grid is EXACTLY [25:88] - 25 columns, 88 rows
  // Each rectangle is EXACTLY 48px wide (x) and 8px tall (y)
  const rectangles = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      // ENFORCED positioning - exact grid alignment
      // x: col * 48 (exact 48px spacing)
      // y: (rows - 1 - row) * 8 (exact 8px spacing)
      const x = col * rectWidth;  // EXACT: col * 48
      const y = (rows - 1 - row) * rectHeight;  // EXACT: (88-1-row) * 8
      
      // Matrix coordinates: [row+1, col+1] (1-indexed)
      // ENFORCED boundaries: [1,1] to [88,25]
      const matrixRow = row + 1;  // 1 to 88
      const matrixCol = col + 1;  // 1 to 25
      
      // Validate matrix coordinates
      if (matrixRow < 1 || matrixRow > 88) throw new Error(`Invalid row: ${matrixRow}`);
      if (matrixCol < 1 || matrixCol > 25) throw new Error(`Invalid column: ${matrixCol}`);
      
      rectangles.push({
        id: `rect-${row}-${col}`,
        x,  // EXACT x position
        y,  // EXACT y position
        width: rectWidth,   // EXACT: 48px
        height: rectHeight, // EXACT: 8px
        row,
        col,
        matrixRow,
        matrixCol,
        matrixCoords: `[${matrixRow},${matrixCol}]`
      });
    }
  }

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
              opacity={0} // Grid lines invisible (0% opacity)
            />
          );
        })}
      </svg>

      {/* Animated Rectangles - Over Grid */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 2
        }}
      >
        {rectangles.map((rect) => {
          // Check if this rectangle has animation data
          const animationFrame = animationFrames.find(frame => 
            frame.matrixRow === rect.matrixRow && frame.matrixCol === rect.matrixCol
          );

          // Only render animated rectangles
          if (!animationFrame) return null;

          return (
            <rect
              key={rect.id}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              fill={animationFrame.color}
              stroke={animationFrame.color}
              strokeWidth="0.5"
              opacity={animationFrame.opacity}
            />
          );
        })}
      </svg>
      
      {/* Invisible Input Field */}
      <input
        type="text"
        style={{
          position: 'absolute',
          left: '-9999px',
          opacity: 0,
          pointerEvents: 'none',
          width: '1px',
          height: '1px'
        }}
        tabIndex={-1}
      />
    </div>
  );
};

export default Cross;
