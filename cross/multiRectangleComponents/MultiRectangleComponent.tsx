import React from 'react';
import { PositionCalculator, GridPosition } from '../positionCalculator/PositionCalculator';

export interface MultiRectangleProps {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export const MultiRectangleComponent: React.FC<MultiRectangleProps> = ({
  startRow,
  startCol,
  endRow,
  endCol,
  children,
  className,
  style,
  backgroundColor = 'transparent',
  borderColor = '#333333',
  borderWidth = 1
}) => {
  const positionCalculator = new PositionCalculator();
  
  // GRID BOUNDARY ENFORCEMENT: Validate all coordinates are within grid bounds
  const totalRows = Math.floor(window.innerHeight / 4); // 175 rows
  const totalCols = 31; // 31 columns
  
  // Check if any coordinate goes beyond grid boundaries
  if (startRow < 1 || startRow > totalRows) {
    throw new Error(`MultiRectangleComponent: Invalid startRow ${startRow}. Grid is limited to [1,${totalRows}]. Component cannot go beyond grid boundaries.`);
  }
  if (startCol < 1 || startCol > totalCols) {
    throw new Error(`MultiRectangleComponent: Invalid startCol ${startCol}. Grid is limited to [1,${totalCols}]. Component cannot go beyond grid boundaries.`);
  }
  if (endRow < 1 || endRow > totalRows) {
    throw new Error(`MultiRectangleComponent: Invalid endRow ${endRow}. Grid is limited to [1,${totalRows}]. Component cannot go beyond grid boundaries.`);
  }
  if (endCol < 1 || endCol > totalCols) {
    throw new Error(`MultiRectangleComponent: Invalid endCol ${endCol}. Grid is limited to [1,${totalCols}]. Component cannot go beyond grid boundaries.`);
  }
  
  // Check if start is after end (invalid bounds)
  if (startRow > endRow || startCol > endCol) {
    throw new Error(`MultiRectangleComponent: Invalid bounds. startRow (${startRow}) must be <= endRow (${endRow}), and startCol (${startCol}) must be <= endCol (${endCol}).`);
  }
  
  // Get the top-left position for positioning
  const topLeft = positionCalculator.getPosition(startRow, startCol);
  
  // Calculate dimensions
  const dimensions = positionCalculator.getComponentDimensions(startRow, startCol, endRow, endCol);
  
  // Get all positions within this component area
  const areaPositions = positionCalculator.getAreaPositions(startRow, startCol, endRow, endCol);

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
    justifyContent: 'center',
    boxSizing: 'border-box',
    ...style
  };

  return (
    <div
      className={className}
      style={componentStyle}
      data-start-row={startRow}
      data-start-col={startCol}
      data-end-row={endRow}
      data-end-col={endCol}
      data-positions={areaPositions.length}
    >
      {children}
    </div>
  );
};

export default MultiRectangleComponent;
