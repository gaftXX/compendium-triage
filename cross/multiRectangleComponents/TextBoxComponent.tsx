import React, { useState } from 'react';
import { PositionCalculator } from '../positionCalculator/PositionCalculator';

export interface TextBoxComponentProps {
  startRow: number;
  startCol: number;
  text?: string;
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
  width?: number; // Number of columns
  height?: number; // Number of rows
  onCommand?: (command: string) => void;
}

export const TextBoxComponent: React.FC<TextBoxComponentProps> = ({
  startRow,
  startCol,
  text,
  className,
  style,
  backgroundColor = 'transparent',
  borderColor = '#333333',
  borderWidth = 1,
  textColor = '#ffffff',
  fontSize = 11,
  fontWeight = 'normal',
  textAlign = 'center',
  padding = 4,
  width = 3,  // Default 3 columns
  height = 4, // Default 4 rows
  onCommand
}) => {
  const [inputValue, setInputValue] = useState('');
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
    throw new Error(`TextBoxComponent: ${width}x${height} box at [${startRow},${startCol}] extends beyond grid boundaries`);
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
    alignItems: 'center',
    justifyContent: textAlign === 'center' ? 'center' : textAlign === 'left' ? 'flex-start' : 'flex-end',
    boxSizing: 'border-box',
    padding: 0,
    overflow: 'hidden',
    ...style
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle Enter key press - send to orchestrator
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const command = inputValue.trim();
      if (command) {
        console.log(`Command entered: ${command}`);
        if (onCommand) {
          onCommand(command);
        }
        setInputValue(''); // Clear input after processing
      }
    }
  };

  const inputStyle: React.CSSProperties = {
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
    caretColor: 'transparent' // Hide the cursor
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
      data-text-length={inputValue.length}
    >
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={text}
        style={inputStyle}
        autoFocus
      />
    </div>
  );
};

export default TextBoxComponent;
