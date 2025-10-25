import React from 'react';
import { PositionCalculator } from '../positionCalculator/PositionCalculator';

export interface DisplayBoxComponentProps {
  startRow: number;
  startCol: number;
  text: string;
  className?: string;
  style?: React.CSSProperties;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  textColor?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  padding?: number;
  width?: number;  // Number of columns
  height?: number; // Number of rows
}

export const DisplayBoxComponent: React.FC<DisplayBoxComponentProps> = ({
  startRow,
  startCol,
  text,
  className,
  style,
  backgroundColor = 'white',
  borderColor = '#333333',
  borderWidth = 1,
  textColor = '#000000',
  fontSize = 11,
  fontWeight = 'normal',
  textAlign = 'left',
  padding = 4,
  width = 10,  // Default 10 columns wide
  height = 12  // Default 12 rows tall (3x4 = 12)
}) => {
  const positionCalculator = new PositionCalculator();
  
  // Dynamic dimensions based on width and height parameters
  const endRow = startRow + height - 1; // height rows total
  const endCol = startCol + width - 1;  // width columns total
  
  // Get the top-left position for positioning
  const topLeft = positionCalculator.getPosition(startRow, startCol);
  
  // Calculate dimensions for the box
  const dimensions = positionCalculator.getComponentDimensions(startRow, startCol, endRow, endCol);
  
  // Validate the position fits within grid
  if (!positionCalculator.isValidPosition(endRow, endCol)) {
    throw new Error(`DisplayBoxComponent: ${width}x${height} box at [${startRow},${startCol}] extends beyond grid boundaries`);
  }

  const componentStyle: React.CSSProperties = {
    position: 'absolute',
    left: topLeft.screenX,
    top: topLeft.screenY,
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor,
    border: `${borderWidth}px solid ${borderColor}`,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    boxSizing: 'border-box',
    padding,
    overflow: 'auto',
    ...style
  };

  const textStyle: React.CSSProperties = {
    color: textColor,
    fontSize: `${fontSize}px`,
    fontWeight,
    textTransform: 'uppercase', // ALL CAPS as per global text rule
    lineHeight: 1.2,
    margin: 0,
    padding: 0,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    width: '100%',
    height: '100%',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    textAlign: textAlign,
    whiteSpace: 'pre-wrap', // Allow text wrapping
    wordWrap: 'break-word' // Break long words if needed
  };

  return (
    <div
      className={className}
      style={componentStyle}
      data-start-row={startRow}
      data-start-col={startCol}
      data-end-row={endRow}
      data-end-col={endCol}
      data-dimensions={`${width}x${height}`}
      data-text-length={text.length}
    >
      <div style={textStyle}>
        {text}
      </div>
    </div>
  );
};
