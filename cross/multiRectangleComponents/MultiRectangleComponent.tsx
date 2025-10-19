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
